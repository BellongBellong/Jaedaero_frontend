<script setup>
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import allocationGuideVisual from '@/assets/ai-coach/allocation-guide-visual.png'
import allocationIcon from '@/assets/ai-coach/what-if.svg'
import monthlyInvestmentIcon from '@/assets/ai-coach/monthly-investment-icon.png'
import planGuideVisual from '@/assets/ai-coach/plan-guide-visual.png'
import { getRecurringInvestmentPlan } from '@/features/rebalancing/api/rebalancing.api'
import { useMissionCompletion } from '@/features/missions/composables/useMissionCompletion'
import { getSimulations } from '@/features/simulations/api/simulations.api'

const route = useRoute()
const router = useRouter()
const { completeMissionAfterLoad } = useMissionCompletion(route, router)

const isLoading = ref(true)
const loadError = ref('')
const hasAllocationGoal = ref(false)
const hasRecurringPlan = ref(false)
const recurringPlan = ref(null)
const activeStep = ref(null)

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

  const [simulationsResult, planResult] = await Promise.allSettled([
    getSimulations({ page: 0, size: 1 }),
    getRecurringInvestmentPlan(),
  ])

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

onMounted(async () => {
  await loadGuideStatus()
  completeMissionAfterLoad()
})
</script>

<template>
  <section class="investment-guide screen app-page">
    <header class="guide-intro">
      <h2>
        적립식 투자 가이드를<br />
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
              />
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
            />
            <strong>
              아직 세부자산분배 목표를<br />
              설정하지 않았어요
            </strong>
            <p>
              What-if 시뮬레이션으로<br />
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
              />
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
            />
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
              주기와 금액, 투자 대상을 설정하면<br />
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
