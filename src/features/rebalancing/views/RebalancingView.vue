<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import allocationGuideVisual from '../../../assets/features/ai-coach/allocation-guide-visual.png'
import allocationIcon from '../../../assets/features/ai-coach/what-if.svg'
import monthlyInvestmentIcon from '../../../assets/features/ai-coach/monthly-investment-icon.png'
import planGuideVisual from '../../../assets/features/ai-coach/plan-guide-visual.png'
import DetailLinkButton from '../../../common/components/navigation/DetailLinkButton.vue'
import { getDashboard } from '@/features/dashboard/api/dashboard.api'
import { getGoal } from '@/features/my-page/api/myPage.api'
import { useRebalancingStore } from '@/features/rebalancing/stores/rebalancing.store'
import { useMissionCompletion } from '@/features/missions/composables/useMissionCompletion'
import { mapWhatIfDetail } from '@/features/ai-analysis/mappers/whatIfDetail.mapper'
import { useSimulationsStore } from '@/features/simulations/stores/simulations.store'

const route = useRoute()
const router = useRouter()
const rebalancingStore = useRebalancingStore()
const simulationsStore = useSimulationsStore()
const { completeMissionAfterLoad } = useMissionCompletion(route, router, 'VIEW_REBALANCING')

const isLoading = ref(true)
const loadError = ref('')
const hasAllocationGoal = ref(false)
const hasRecurringPlan = ref(false)
const recurringPlan = ref(null)
const guidance = ref(null)
const latestSimulation = ref(null)
const activeStep = ref(null)
const isRefreshing = ref(false)
const fallbackGoalAmount = ref(0)
const financialDischargeDate = ref(null)

// 가이드 응답은 recommendation/currentPlan/goalProgress 로 감싸 오거나 평탄하게 올 수 있어 모두 받아준다.
const recommendation = computed(() => guidance.value?.recommendation || guidance.value || {})
const plan = computed(() => guidance.value?.currentPlan || recurringPlan.value || {})
const goalProgress = computed(() => guidance.value?.goalProgress || {})

/*
  설정을 마친 자산분배 목표는 시뮬레이션 상세와 같은 막대·범례로 보여준다.
  비율 계산은 이미 있는 매퍼를 그대로 쓴다.
*/
const allocationSummary = computed(() =>
  latestSimulation.value ? mapWhatIfDetail(latestSimulation.value) : null,
)

// 자산분배 목표와 적립 계획이 모두 설정돼야 이번달 투자 가이드를 보여준다.
const hasActiveGuide = computed(() => hasAllocationGoal.value && hasRecurringPlan.value)

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
  () =>
    goalProgress.value?.goalAmount ?? goalProgress.value?.targetAmount ?? fallbackGoalAmount.value,
)

const achievementRateLabel = computed(() => {
  const rate =
    goalProgress.value?.achievementRate ??
    goalProgress.value?.goalAchievementRate ??
    goalProgress.value?.expectedAchievementRate
  if (rate !== null && rate !== undefined && rate !== '') return `${Number(rate).toFixed(1)}%`

  const expected = Number(expectedAsset.value)
  const goal = Number(goalAmount.value)
  if (!expected || !goal) return '-'
  return `${((expected / goal) * 100).toFixed(1)}%`
})

const remainingInstallmentsLabel = computed(() => {
  const remaining =
    goalProgress.value?.remainingInstallments ??
    recommendation.value?.remainingInstallments ??
    plan.value?.remainingInstallments
  if (remaining === null || remaining === undefined || remaining === '') {
    const calculated = calculateRemainingInstallments(plan.value, financialDischargeDate.value)
    return calculated === null ? '-' : `${calculated.toLocaleString('ko-KR')}회`
  }
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

function unwrapPayload(response) {
  return response?.data ?? response?.result ?? response ?? {}
}

function parseDateOnly(value) {
  const match = String(value || '').match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (!match) return null
  return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
}

function calculateRemainingInstallments(planValue, dischargeDate) {
  const discharge = parseDateOnly(dischargeDate)
  const contributionDay = Number(planValue?.contributionDay)
  if (!discharge || !contributionDay) return null

  const today = new Date()
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  if (discharge < todayStart) return 0

  if (planValue?.frequency === 'WEEKLY') {
    const offset = (contributionDay - todayStart.getDay() + 7) % 7
    const nextContribution = new Date(todayStart)
    nextContribution.setDate(todayStart.getDate() + offset)
    if (nextContribution > discharge) return 0
    return Math.floor((discharge - nextContribution) / (7 * 86_400_000)) + 1
  }

  let year = todayStart.getFullYear()
  let month = todayStart.getMonth()
  let count = 0
  while (true) {
    const lastDay = new Date(year, month + 1, 0).getDate()
    const contribution = new Date(year, month, Math.min(contributionDay, lastDay))
    if (contribution >= todayStart && contribution <= discharge) count += 1
    if (
      contribution > discharge ||
      (year === discharge.getFullYear() && month === discharge.getMonth())
    ) {
      break
    }
    month += 1
    if (month === 12) {
      month = 0
      year += 1
    }
  }
  return count
}

function isMissingResource(reason) {
  return reason?.response?.status === 404
}

async function loadGuideStatus() {
  isLoading.value = true
  loadError.value = ''

  const [simulationsResult, planResult, guidanceResult, goalResult, dashboardResult] =
    await Promise.allSettled([
      simulationsStore.loadList({ page: 0, size: 1 }),
      rebalancingStore.loadRecurringPlan(),
      rebalancingStore.loadRecommendation(),
      getGoal(),
      getDashboard(),
    ])

  // 가이드는 아직 생성 전일 수 있으므로 실패해도 화면을 막지 않는다.
  guidance.value = guidanceResult.status === 'fulfilled' ? guidanceResult.value : null

  if (simulationsResult.status === 'fulfilled') {
    const simulations = unwrapSimulations(simulationsResult.value)
    hasAllocationGoal.value = simulations.length > 0
    latestSimulation.value = simulations[0] ?? null
  } else if (!isMissingResource(simulationsResult.reason)) {
    loadError.value = '가이드 설정 정보를 불러오지 못했어요.'
  }

  if (planResult.status === 'fulfilled') {
    recurringPlan.value = planResult.value
    hasRecurringPlan.value = Boolean(planResult.value?.planId ?? planResult.value)
  } else if (!isMissingResource(planResult.reason)) {
    loadError.value = '가이드 설정 정보를 불러오지 못했어요.'
  }

  if (goalResult.status === 'fulfilled') {
    fallbackGoalAmount.value = Number(unwrapPayload(goalResult.value)?.targetAmount || 0)
  }
  if (dashboardResult.status === 'fulfilled') {
    financialDischargeDate.value =
      unwrapPayload(dashboardResult.value)?.financialDischargeDate ?? null
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
              v-if="!hasAllocationGoal"
              class="allocation-visual"
              :src="allocationGuideVisual"
              alt=""
              aria-hidden="true"
            >
            <div
              v-if="hasAllocationGoal && allocationSummary"
              class="allocation-summary"
            >
              <div class="allocation-summary__head">
                <strong>현재 설정한 자산분배목표</strong>
                <small>기준 월급 {{ allocationSummary.baseSalary }}</small>
              </div>

              <div
                class="allocation-bar"
                role="img"
                :aria-label="
                  allocationSummary.allocations
                    .map((allocation) => `${allocation.label} ${allocation.percent}%`)
                    .join(', ')
                "
              >
                <span
                  v-for="allocation in allocationSummary.allocations"
                  :key="allocation.key"
                  class="allocation-bar__segment"
                  :class="`allocation-bar__segment--${allocation.tone}`"
                  :style="{ width: `${allocation.percent}%` }"
                />
              </div>

              <ul class="allocation-legend">
                <li
                  v-for="allocation in allocationSummary.allocations"
                  :key="allocation.key"
                >
                  <span
                    class="allocation-legend__dot"
                    :class="`allocation-legend__dot--${allocation.tone}`"
                    aria-hidden="true"
                  />
                  <span class="allocation-legend__label">{{ allocation.label }}</span>
                  <span class="allocation-legend__percent">{{ allocation.percent }}%</span>
                </li>
              </ul>
            </div>

            <strong
              v-else-if="hasAllocationGoal"
              class="allocation-complete-title"
            >
              설정한 자산 분배 목표가 있어요
            </strong>
            <strong v-else>
              아직 세부자산분배 목표를<br>
              설정하지 않았어요
            </strong>
            <p
              v-if="hasAllocationGoal && !allocationSummary"
              class="allocation-complete-copy"
            >
              What-if 시뮬레이션에서 목표를 다시 조정할 수 있어요
            </p>
            <p v-else-if="!hasAllocationGoal">
              What-if 시뮬레이션으로<br>
              나에게 맞는 자산 분배 목표를 먼저 설정해보세요
            </p>
            <button
              class="guide-cta"
              type="button"
              @click="openWhatIfSimulation"
            >
              {{ hasAllocationGoal ? '다시 설정 하기' : '목표 설정하러가기' }}
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
  word-break: keep-all;
}

.empty-guide > p {
  width: 280px;
  margin: 8px 0 16px;
  color: #757575;
  font-size: 13px;
  font-weight: 500;
  line-height: 1.55;
  letter-spacing: -0.18px;
  word-break: keep-all;
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

/* 완료 문구는 <br> 없이 한 줄이라 미설정 상태의 고정폭을 그대로 쓰면 좁게 잘린다. */
/* 자산분배 요약. 막대와 범례 색은 시뮬레이션 상세 화면과 동일하게 맞춘다. */
.allocation-summary {
  width: 100%;
  margin-top: 18px;
  text-align: left;
}

.allocation-summary__head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 10px;
}

.allocation-summary__head strong {
  color: #757575;
  font-size: 13px;
  font-weight: 700;
  word-break: keep-all;
}

.allocation-summary__head small {
  color: #8c8c8c;
  font-size: 11px;
  white-space: nowrap;
}

.allocation-bar {
  display: flex;
  height: 16px;
  overflow: hidden;
  border-radius: 50px;
  background: var(--ui-light-gray, #ececec);
}

.allocation-bar__segment {
  height: 100%;
}

.allocation-bar__segment--olive {
  background: linear-gradient(90deg, var(--olive-500) 0%, #ccd5c8 100%);
}

.allocation-bar__segment--green {
  background: linear-gradient(90deg, #5eb880 0%, #91ebb3 100%);
}

.allocation-bar__segment--orange {
  background: linear-gradient(90deg, #ec947c 0%, #fed2c3 100%);
}

/* 미배분 구간은 트랙이 그대로 비치게 둔다. */
.allocation-bar__segment--gray {
  background: transparent;
}

.allocation-legend {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  padding: 0;
  margin: 12px 0 0;
  gap: 8px 12px;
  list-style: none;
}

.allocation-legend li {
  display: flex;
  align-items: center;
  gap: 7px;
  color: #888;
  font-size: 12px;
  line-height: 1.5;
}

.allocation-legend__dot {
  width: 9px;
  height: 9px;
  flex: 0 0 auto;
  border-radius: 50%;
}

.allocation-legend__dot--olive {
  background: linear-gradient(135deg, var(--olive-500) 0%, #ccd5c8 100%);
}

.allocation-legend__dot--green {
  background: linear-gradient(135deg, #5eb880 0%, #91ebb3 100%);
}

.allocation-legend__dot--orange {
  background: linear-gradient(135deg, #ec947c 0%, #fed2c3 100%);
}

.allocation-legend__dot--gray {
  background: var(--ui-light-gray, #ececec);
}

.allocation-legend__label {
  flex: 1;
}

.allocation-legend__percent {
  color: #888;
  font-weight: 500;
  font-variant-numeric: tabular-nums;
}

#allocation-guide-content > .allocation-complete-title,
#plan-guide-content > .plan-complete-title {
  width: auto;
}

#allocation-guide-content > .allocation-complete-title {
  margin-top: 24px;
  color: #333;
}

#allocation-guide-content > .allocation-complete-copy {
  color: #757575;
}

#plan-guide-content > .plan-complete-title {
  margin-top: 24px;
  color: #333;
}

#plan-guide-content > .plan-complete-copy {
  color: #757575;
}

/* 자산분배 요약 바로 아래에 붙어 있어 간격을 준다. */
.allocation-summary + .guide-cta {
  margin-top: 20px;
}

.guide-cta {
  width: 100%;
  height: 50px;
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
