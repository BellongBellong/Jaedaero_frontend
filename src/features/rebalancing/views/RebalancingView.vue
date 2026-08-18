<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import allocationGuideVisual from '../../../assets/features/ai-coach/allocation-guide-visual.png'
import allocationIcon from '../../../assets/features/ai-coach/what-if.svg'
import monthlyInvestmentIcon from '../../../assets/features/ai-coach/monthly-investment-icon.png'
import planGuideVisual from '../../../assets/features/ai-coach/plan-guide-visual.png'
import DetailLinkButton from '../../../common/components/navigation/DetailLinkButton.vue'
import {
  getRebalancingRecommendation,
  getRecurringInvestmentPlan,
} from '@/features/rebalancing/api/rebalancing.api'
import { useMissionCompletion } from '@/features/missions/composables/useMissionCompletion'
import { getSimulations } from '@/features/simulations/api/simulations.api'

const route = useRoute()
const router = useRouter()
const { completeMissionAfterLoad } = useMissionCompletion(route, router, 'VIEW_REBALANCING')

const isLoading = ref(true)
const loadError = ref('')
const hasAllocationGoal = ref(false)
const hasRecurringPlan = ref(false)
const recurringPlan = ref(null)
const guidance = ref(null)
const activeStep = ref(null)
const isRefreshing = ref(false)

// 가이드 응답은 recommendation/currentPlan/goalProgress 로 감싸 오거나 평탄하게 올 수 있어 모두 받아준다.
const recommendation = computed(() => guidance.value?.recommendation || guidance.value || {})
const plan = computed(() => guidance.value?.currentPlan || recurringPlan.value || {})
const goalProgress = computed(() => guidance.value?.goalProgress || {})

const hasActiveGuide = computed(() => hasRecurringPlan.value)

const monthlyContribution = computed(() => {
  const amount = Number(plan.value?.contributionAmount || 0)
  if (!amount) return 0
  // 주간 적립은 월 환산해 보여준다.
  return plan.value?.frequency === 'WEEKLY' ? Math.round((amount * 52) / 12) : amount
})

const expectedAsset = computed(
  () => recommendation.value?.recommendedExpectedAsset ?? goalProgress.value?.expectedAsset ?? 0,
)

const goalAmount = computed(
  () => goalProgress.value?.goalAmount ?? goalProgress.value?.targetAmount ?? 0,
)

const achievementRateLabel = computed(() => {
  const rate =
    goalProgress.value?.achievementRate ??
    goalProgress.value?.goalAchievementRate ??
    goalProgress.value?.expectedAchievementRate
  if (rate === null || rate === undefined || rate === '') return '-'
  return `${Number(rate).toFixed(1)}%`
})

const remainingInstallmentsLabel = computed(() => {
  const remaining =
    goalProgress.value?.remainingInstallments ??
    recommendation.value?.remainingInstallments ??
    plan.value?.remainingInstallments
  if (remaining === null || remaining === undefined || remaining === '') return '-'
  return `${Number(remaining).toLocaleString('ko-KR')}회`
})

const nextContributionLabel = computed(() => {
  const explicit =
    recommendation.value?.nextContributionAt ||
    recommendation.value?.nextPaymentAt ||
    plan.value?.nextContributionAt
  if (explicit) {
    const [, month, day] = String(explicit).slice(0, 10).split('-')
    if (month && day) return `${Number(month)}월 ${Number(day)}일`
  }

  const day = Number(plan.value?.contributionDay)
  if (!day) return ''
  if (plan.value?.frequency === 'WEEKLY') {
    return `매주 ${['월', '화', '수', '목', '금', '토', '일'][day - 1] || '월'}요일`
  }

  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  let target = new Date(now.getFullYear(), now.getMonth(), day)
  if (target < todayStart) target = new Date(now.getFullYear(), now.getMonth() + 1, day)
  return `${target.getMonth() + 1}월 ${target.getDate()}일`
})

function formatManwon(value) {
  const number = Number(value || 0)
  if (!number) return '-'
  return `${Math.round(number / 10000).toLocaleString('ko-KR')}만원`
}

function unwrapSimulations(response) {
  if (Array.isArray(response)) return response

  const simulations = response?.simulations ?? response?.content ?? response?.data
  if (Array.isArray(simulations)) return simulations
  if (simulations && simulations !== response) return unwrapSimulations(simulations)

  return []
}

function isMissingResource(reason) {
  return reason?.response?.status === 404
}

async function loadGuideStatus() {
  isLoading.value = true
  loadError.value = ''

  const [simulationsResult, planResult, guidanceResult] = await Promise.allSettled([
    getSimulations({ page: 0, size: 1 }),
    getRecurringInvestmentPlan(),
    getRebalancingRecommendation(),
  ])

  // 가이드는 아직 생성 전일 수 있으므로 실패해도 화면을 막지 않는다.
  guidance.value = guidanceResult.status === 'fulfilled' ? guidanceResult.value : null

  if (simulationsResult.status === 'fulfilled') {
    hasAllocationGoal.value = unwrapSimulations(simulationsResult.value).length > 0
  } else if (!isMissingResource(simulationsResult.reason)) {
    loadError.value = '가이드 설정 정보를 불러오지 못했어요.'
  }

  if (planResult.status === 'fulfilled') {
    recurringPlan.value = planResult.value
    hasRecurringPlan.value = Boolean(planResult.value?.planId ?? planResult.value)
  } else if (!isMissingResource(planResult.reason)) {
    loadError.value = '가이드 설정 정보를 불러오지 못했어요.'
  }

  isLoading.value = false
}

function toggleStep(step) {
  activeStep.value = activeStep.value === step ? null : step
}

function openWhatIfSimulation() {
  router.push({ name: 'what-if-simulation' })
}

function openPlanForm() {
  router.push({ name: hasRecurringPlan.value ? 'investment-plan-edit' : 'investment-plan-create' })
}

function openGuideDetail() {
  const guidanceId = recommendation.value?.guidanceId || recommendation.value?.id || 'latest'
  router.push({ name: 'investment-guide-detail', params: { guidanceId } })
}

async function refreshAccountData() {
  if (isRefreshing.value) return
  isRefreshing.value = true
  try {
    await loadGuideStatus()
  } finally {
    isRefreshing.value = false
  }
}

onMounted(async () => {
  await loadGuideStatus()
  completeMissionAfterLoad()
})
</script>

<template>
  <section
    class="investment-guide screen app-page"
    :class="{ 'investment-guide--active': !isLoading && hasActiveGuide }"
  >
    <header
      v-if="isLoading || !hasActiveGuide"
      class="guide-intro"
    >
      <h2>
        적립식 투자 가이드를<br>
        시작해볼까요?
      </h2>
      <p>맞춤 가이드를 만드려면 두 가지 설정이 필요해요</p>
    </header>

    <div
      v-if="isLoading"
      class="guide-loading"
      aria-live="polite"
    >
      <span />
      <span />
    </div>

    <template v-else-if="hasActiveGuide">
      <header class="monthly-guide-heading">
        <h2>이번달 투자 가이드</h2>
        <p v-if="nextContributionLabel">
          다음 납입일은 {{ nextContributionLabel }} 이에요
        </p>
      </header>

      <article class="monthly-guide">
        <span class="monthly-guide__badge">적립식 투자 시작하기</span>
        <p class="monthly-guide__lead">
          매월 {{ formatManwon(monthlyContribution) }}으로 실제 투자를 시작해보세요.
        </p>

        <div class="monthly-guide__metrics">
          <div>
            <small>목표 달성 예상률</small>
            <strong>{{ achievementRateLabel }}</strong>
          </div>
          <div>
            <small>예상 전역 자산</small>
            <strong class="is-accent">{{ formatManwon(expectedAsset) }}</strong>
            <em>목표 {{ formatManwon(goalAmount) }}</em>
          </div>
        </div>

        <div class="plan-summary">
          <div class="plan-summary__head">
            <h3>현재 적립 계획</h3>
            <button
              type="button"
              @click="openPlanForm"
            >
              적립계획수정
            </button>
          </div>
          <dl>
            <div>
              <dt>📅 다음 납입일</dt>
              <dd>{{ nextContributionLabel || '-' }}</dd>
            </div>
            <div>
              <dt>💰 월 투자금</dt>
              <dd>{{ formatManwon(monthlyContribution) }}</dd>
            </div>
            <div>
              <dt>📈 남은 납입</dt>
              <dd>{{ remainingInstallmentsLabel }}</dd>
            </div>
            <div>
              <dt>🏦 투자 상품</dt>
              <dd>{{ plan?.investmentProductName || '-' }}</dd>
            </div>
          </dl>
        </div>

        <DetailLinkButton
          class="monthly-guide__detail"
          @click="openGuideDetail"
        >
          가이드 상세보기
        </DetailLinkButton>
      </article>

      <button
        class="refresh-button"
        type="button"
        :disabled="isRefreshing"
        @click="refreshAccountData"
      >
        <svg
          class="refresh-button__icon"
          aria-hidden="true"
          viewBox="0 0 24 24"
        >
          <path d="M21 12a9 9 0 1 1-2.64-6.36" />
          <path d="M21 3v6h-6" />
        </svg>
        {{ isRefreshing ? '새로고침 중...' : '계좌 데이터 새로고침' }}
      </button>
    </template>

    <template v-else>
      <div class="guide-steps">
        <article
          class="guide-card"
          :class="{
            'guide-card--expanded': activeStep === 'allocation',
            'guide-card--complete': hasAllocationGoal,
          }"
        >
          <button
            class="guide-card__header"
            type="button"
            :aria-expanded="activeStep === 'allocation'"
            aria-controls="allocation-guide-content"
            @click="toggleStep('allocation')"
          >
            <span class="guide-card__icon guide-card__icon--allocation">
              <img
                :src="allocationIcon"
                alt=""
                aria-hidden="true"
              >
            </span>
            <span class="guide-card__copy">
              <small>내 자산을 어떻게 배분할 지 목표를 설정해요</small>
              <strong>세부자산분배 목표 설정</strong>
            </span>
            <svg
              class="guide-card__check"
              aria-hidden="true"
              viewBox="0 0 14 10"
            >
              <path d="M1.5 5 5.5 8.5 12.5 1.5" />
            </svg>
          </button>

          <div
            v-if="activeStep === 'allocation'"
            id="allocation-guide-content"
            class="empty-guide"
          >
            <img
              class="allocation-visual"
              :src="allocationGuideVisual"
              alt=""
              aria-hidden="true"
            >
            <strong>
              아직 세부자산분배 목표를<br>
              설정하지 않았어요
            </strong>
            <p>
              What-if 시뮬레이션으로<br>
              나에게 맞는 자산 분배 목표를 먼저 설정해보세요
            </p>
            <button
              class="guide-cta"
              type="button"
              @click="openWhatIfSimulation"
            >
              목표 설정하러가기
            </button>
          </div>
        </article>

        <article
          class="guide-card"
          :class="{
            'guide-card--expanded': activeStep === 'plan',
            'guide-card--complete': hasRecurringPlan,
          }"
        >
          <button
            class="guide-card__header"
            type="button"
            :aria-expanded="activeStep === 'plan'"
            aria-controls="plan-guide-content"
            @click="toggleStep('plan')"
          >
            <span class="guide-card__icon guide-card__icon--plan">
              <img
                :src="monthlyInvestmentIcon"
                alt=""
                aria-hidden="true"
              >
            </span>
            <span class="guide-card__copy">
              <small>월 투자 계획을 설정해요</small>
              <strong>월 적립 계획 설정</strong>
            </span>
            <svg
              class="guide-card__check"
              aria-hidden="true"
              viewBox="0 0 14 10"
            >
              <path d="M1.5 5 5.5 8.5 12.5 1.5" />
            </svg>
          </button>

          <div
            v-if="activeStep === 'plan'"
            id="plan-guide-content"
            class="empty-guide"
          >
            <img
              v-if="!hasRecurringPlan"
              class="plan-visual"
              :src="planGuideVisual"
              alt=""
              aria-hidden="true"
            >
            <strong
              v-if="hasRecurringPlan"
              class="plan-complete-title"
            >
              설정한 적립 계획이 있어요
            </strong>
            <strong v-else>아직 적립 계획이 없어요</strong>
            <p
              v-if="hasRecurringPlan"
              class="plan-complete-copy"
            >
              {{ recurringPlan?.frequency === 'WEEKLY' ? '주간 적립' : '월간 적립' }} · 회차별
              {{ Number(recurringPlan?.contributionAmount || 0).toLocaleString('ko-KR') }}원
            </p>
            <p v-else>
              주기와 금액, 투자 대상을 설정하면<br>
              다음 투자 가이드를 받을 수 있어요.
            </p>
            <button
              class="guide-cta"
              type="button"
              @click="openPlanForm"
            >
              {{ hasRecurringPlan ? '적립 계획 수정하기' : '적립 계획 만들기' }}
            </button>
          </div>
        </article>
      </div>
    </template>
  </section>
</template>

<style scoped>
.investment-guide {
  --guide-side: 20px;

  padding: 15px var(--guide-side) calc(var(--page-bottom-navigation-space) + 26px);
  background: var(--ui-background);
}

.guide-intro {
  margin-bottom: 40px;
}

.investment-guide--active {
  background: var(--ui-background);
}

.monthly-guide-heading {
  margin-bottom: 18px;
}

.monthly-guide-heading h2 {
  margin: 0;
  color: var(--gray-900);
  font-size: 25px;
  font-weight: 700;
  letter-spacing: -0.55px;
  word-break: keep-all;
}

.monthly-guide-heading p {
  margin: 6px 0 0;
  color: #888;
  font-size: 14px;
  word-break: keep-all;
}

.monthly-guide {
  padding: 16px;
  border-radius: 28px;
  background: linear-gradient(
    160deg,
    rgb(130 255 175 / 50%) 0%,
    rgb(255 241 186 / 50%) 66%,
    rgb(255 231 222 / 50%) 100%
  );
}

.monthly-guide__badge {
  display: inline-block;
  padding: 5px 12px;
  border-radius: var(--radius-full, 999px);
  background: #e4fff0;
  color: #22c55e;
  font-size: 12px;
  font-weight: 700;
  word-break: keep-all;
}

.monthly-guide__lead {
  margin: 10px 2px 14px;
  padding-left: 10px;
  color: #888;
  font-size: 14px;
  font-weight: 700;
  word-break: keep-all;
}

.monthly-guide__metrics {
  display: grid;
  grid-template-columns: 1fr 1fr;
  padding: 16px 4px;
  border-radius: 20px;
  background: #fff;
  text-align: center;
}

.monthly-guide__metrics > div + div {
  border-left: 1px solid #ececec;
}

.monthly-guide__metrics small {
  display: block;
  color: #8c8c8c;
  font-size: 12px;
  word-break: keep-all;
}

.monthly-guide__metrics strong {
  display: block;
  margin-top: 8px;
  color: #757575;
  font-size: 22px;
  font-weight: 700;
  letter-spacing: -0.5px;
}

.monthly-guide__metrics strong.is-accent {
  color: #16c966;
  font-size: 17px;
}

.monthly-guide__metrics em {
  display: block;
  margin-top: 4px;
  color: #a0a0a0;
  font-size: 11px;
  font-style: normal;
  word-break: keep-all;
}

.plan-summary {
  margin-top: 12px;
  padding: 18px;
  border-radius: 20px;
  background: #fff;
}

.plan-summary__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.plan-summary__head h3 {
  margin: 0;
  color: #757575;
  font-size: 14px;
  font-weight: 700;
  word-break: keep-all;
}

.plan-summary__head button {
  border: 0;
  padding-right: 0;
  background: transparent;
  color: #9e9e9e;
  cursor: pointer;
  font-size: 12px;
  word-break: keep-all;
}

.plan-summary dl {
  margin: 6px 0 0;
}

.plan-summary dl div {
  display: flex;
  min-height: 42px;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #f0f0f0;
  gap: 12px;
}

.plan-summary dl div:last-child {
  border-bottom: 0;
}

.plan-summary dt {
  color: #757575;
  font-size: 13px;
  font-weight: 600;
  word-break: keep-all;
}

.plan-summary dd {
  margin: 0;
  overflow: hidden;
  color: #757575;
  font-size: 13px;
  font-weight: 700;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.monthly-guide__detail {
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: flex-end;
  gap: 6px;
  border: 0;
  margin-top: 14px;
  background: transparent;
  color: #7a7a7a;
  cursor: pointer;
  font-size: 13px;
  font-weight: 700;
  word-break: keep-all;
}

.monthly-guide__detail img {
  width: 14px;
  height: 14px;
  flex: 0 0 auto;
}

.refresh-button {
  display: flex;
  width: 100%;
  height: 46px;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: 0;
  border-radius: var(--radius-full, 999px);
  margin-top: 14px;
  background: #e4fff0;
  color: #20ba5c;
  cursor: pointer;
  font-size: 15px;
  font-weight: 700;
  word-break: keep-all;
}

.refresh-button__icon {
  width: 14px;
  height: 14px;
  flex: 0 0 auto;
  fill: none;
  stroke: currentcolor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 2.2;
}

.refresh-button:disabled {
  color: #9bbca6;
  cursor: default;
}

.guide-intro h2 {
  margin: 0;
  color: var(--gray-900);
  font-size: 22px;
  font-weight: 700;
  line-height: 1.38;
  letter-spacing: -0.55px;
}

.guide-intro p {
  margin: 8px 0 0;
  color: #757575;
  font-size: 14px;
  font-weight: 500;
  line-height: 1.45;
  letter-spacing: -0.24px;
}

.guide-steps {
  display: grid;
  gap: 14px;
}

.guide-card {
  overflow: hidden;
  border: 1px solid rgb(255 255 255 / 85%);
  border-radius: 26px;
  background: rgb(255 255 255 / 92%);
  box-shadow: 0 8px 24px rgb(51 51 51 / 4%);
}

.guide-card__header {
  position: relative;
  display: flex;
  width: 100%;
  min-height: 92px;
  align-items: center;
  gap: 14px;
  padding: 18px 48px 18px 20px;
  border: 0;
  background: transparent;
  color: inherit;
  text-align: left;
}

button.guide-card__header {
  cursor: pointer;
}

.guide-card--expanded .guide-card__header {
  min-height: 78px;
  padding-bottom: 0;
}

.guide-card__icon {
  display: grid;
  flex: 0 0 48px;
  width: 48px;
  height: 48px;
  place-items: center;
  background: transparent;
}

.guide-card__icon img {
  display: block;
  width: 30px;
  height: 30px;
  object-fit: contain;
}

.guide-card__icon--plan img {
  width: 42px;
  height: 42px;
}

.guide-card__copy {
  display: grid;
  flex: 1;
  gap: 4px;
  min-width: 0;
}

.guide-card__copy small {
  color: var(--gray-500);
  font-size: 11px;
  font-weight: 500;
  line-height: 1.35;
  letter-spacing: -0.15px;
}

.guide-card__copy strong {
  color: #757575;
  font-size: 17px;
  font-weight: 700;
  line-height: 1.35;
  letter-spacing: -0.35px;
}

.guide-card--complete .guide-card__copy strong {
  color: #000;
}

.guide-card--complete .guide-card__check {
  stroke: var(--green-600);
}

.guide-card__check {
  position: absolute;
  top: 25px;
  right: 23px;
  width: 14px;
  height: 10px;
  overflow: visible;
  fill: none;
  stroke: var(--gray-400);
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 2.6px;
}

.empty-guide {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 22px 20px;
  text-align: center;
}

.empty-guide > strong {
  width: 190px;
  margin-top: 8px;
  color: #bdbdbd;
  font-size: 18px;
  font-weight: 700;
  line-height: 1.4;
  letter-spacing: -0.3px;
}

.empty-guide > p {
  width: 280px;
  margin: 8px 0 16px;
  color: #757575;
  font-size: 13px;
  font-weight: 500;
  line-height: 1.55;
  letter-spacing: -0.18px;
}

.allocation-visual {
  display: block;
  width: 191px;
  height: 96px;
  object-fit: contain;
}

.plan-visual {
  display: block;
  width: 160px;
  height: 90px;
  object-fit: contain;
}

#plan-guide-content {
  padding-bottom: 24px;
}

#plan-guide-content > strong {
  margin-top: 14px;
}

#plan-guide-content > p {
  margin: 10px 0 20px;
}

#plan-guide-content > .plan-complete-title {
  margin-top: 24px;
  color: #333;
}

#plan-guide-content > .plan-complete-copy {
  color: #757575;
}

.guide-cta {
  width: 100%;
  min-height: 50px;
  border: 0;
  border-radius: 28px;
  background: #62ff9c;
  color: #000;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: -0.25px;
  cursor: pointer;
}

.guide-cta:active {
  transform: scale(0.99);
}

.guide-loading {
  display: grid;
  gap: 14px;
}

.guide-loading span {
  display: block;
  height: 92px;
  border-radius: 26px;
  background: linear-gradient(90deg, var(--gray-200), var(--gray-50), var(--gray-200));
  background-size: 220% 100%;
  animation: guide-shimmer 1.2s linear infinite;
}

@keyframes guide-shimmer {
  to {
    background-position: -220% 0;
  }
}
</style>
