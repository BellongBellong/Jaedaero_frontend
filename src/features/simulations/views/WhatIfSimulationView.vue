<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import consumptionIcon from '@/assets/icons/account/consumptionBlock.png'
import investIcon from '@/assets/icons/account/investBlock.png'
import savingsIcon from '@/assets/icons/account/savingsBlock.png'
import aiRecommendationBot from '@/assets/simulations/ai-recommendation-bot.png'
import returnRateIconBackground from '@/assets/simulations/return-rate-icon-bg.svg'
import { getApiErrorMessage } from '@/common/api/errorMessage'
import DetailLinkButton from '../../../common/components/navigation/DetailLinkButton.vue'
import { useDashboardStore } from '@/features/dashboard/stores/dashboard.store'
import { useMyPageStore } from '@/features/my-page/stores/my-page.store'
import { useSimulationsStore } from '@/features/simulations/stores/simulations.store'
import { useMissionCompletion } from '@/features/missions/composables/useMissionCompletion'

const PREVIEW_DELAY_MS = 250
const ALLOCATION_STEP = 10_000
const SIMULATION_STORAGE_KEY = 'jaedaero-latest-simulation'

const route = useRoute()
const router = useRouter()
const dashboardStore = useDashboardStore()
const myPageStore = useMyPageStore()
const simulationsStore = useSimulationsStore()
const { completeMissionAfterLoad } = useMissionCompletion(route, router, 'RUN_WHAT_IF_SIMULATION')
const dashboard = ref(null)
const profile = ref(null)
const simulationDefaults = ref(null)
const spendingAmount = ref(0)
const savingAmount = ref(0)
const investmentAmount = ref(0)
const annualReturnRate = ref(5)
const baselineScenario = ref(null)
const isSaving = ref(false)
const isPreviewing = ref(false)
const serverResult = ref(null)
const errorMessage = ref('')
const previewErrorMessage = ref('')
const allocationErrorMessage = ref('')
const savedMessage = ref('')
let previewTimer = null
let previewRequestId = 0

const monthlySalary = computed(() =>
  Math.max(0, Number(simulationDefaults.value?.referenceMonthlyIncome || 0)),
)
const maximumSavingAmount = computed(() =>
  floorToAllocationStep(Number(simulationDefaults.value?.maxMonthlySavingAmount || 0)),
)
const maximumSpendingAmount = computed(() =>
  floorToAllocationStep(monthlySalary.value - savingAmount.value - investmentAmount.value),
)
const availableSavingAmount = computed(() =>
  floorToAllocationStep(
    Math.min(
      maximumSavingAmount.value,
      Math.max(0, monthlySalary.value - spendingAmount.value - investmentAmount.value),
    ),
  ),
)
const maximumInvestmentAmount = computed(() =>
  floorToAllocationStep(monthlySalary.value - spendingAmount.value - savingAmount.value),
)
const totalAllocatedAmount = computed(
  () => spendingAmount.value + savingAmount.value + investmentAmount.value,
)
const unallocatedAmount = computed(() =>
  Math.max(0, monthlySalary.value - totalAllocatedAmount.value),
)
const actualDischargeDday = computed(() => {
  if (dashboard.value?.actualDischargeDate) {
    return daysFromToday(dashboard.value.actualDischargeDate)
  }

  return Number(dashboard.value?.dischargeDday || 0)
})
const actualDischargeDate = computed(
  () => dashboard.value?.actualDischargeDate || profile.value?.dischargeDate || '',
)
const financialDischargeDate = computed(() => serverResult.value?.financialDischargeDate || '')
const financialDischargeDday = computed(() => {
  if (!financialDischargeDate.value) return null
  return daysFromToday(financialDischargeDate.value)
})
const advancedDays = computed(() => {
  if (!Number.isFinite(financialDischargeDday.value)) return null
  return Math.max(0, actualDischargeDday.value - financialDischargeDday.value)
})
const financialDischargeMessage = computed(() => {
  if (isPreviewing.value) return '변경한 조건으로 재정적 전역일을 계산하고 있어요.'
  if (!financialDischargeDate.value) return '재정적 전역일을 계산할 정보가 부족해요.'
  if (advancedDays.value > 0) return `실제 전역보다 ${advancedDays.value}일 빠른 것으로 예상돼요!`
  return '전역일에 맞춰 목표 자산을 달성할 것으로 예상돼요!'
})

const allocationRows = computed(() => [
  {
    id: 'spending',
    label: '소비',
    icon: consumptionIcon,
    amount: spendingAmount.value,
    maxAmount: maximumSpendingAmount.value,
    percent: percentageOfIncome(spendingAmount.value),
    color: '#e37255',
  },
  {
    id: 'saving',
    label: '군적금',
    icon: savingsIcon,
    amount: savingAmount.value,
    maxAmount: availableSavingAmount.value,
    percent: percentageOfIncome(savingAmount.value),
    color: '#3be178',
  },
  {
    id: 'investment',
    label: '투자',
    icon: investIcon,
    amount: investmentAmount.value,
    maxAmount: maximumInvestmentAmount.value,
    percent: percentageOfIncome(investmentAmount.value),
    color: '#7c8e77',
  },
])

const result = computed(() => ({
  baseAsset: Number(serverResult.value?.calculationDetail?.baseAsset ?? 0),
  cashflowIncrease: Number(serverResult.value?.calculationDetail?.cashflowIncreaseAmount ?? 0),
  savingPrincipal: Number(serverResult.value?.calculationDetail?.soldierSavingPrincipal ?? 0),
  savingInterest: Number(serverResult.value?.expectedEffect?.soldierSavingInterest ?? 0),
  governmentMatching: Number(serverResult.value?.expectedEffect?.governmentMatchingSupport ?? 0),
  investmentPrincipal: Number(serverResult.value?.calculationDetail?.investmentPrincipal ?? 0),
  unallocatedPrincipal: Number(serverResult.value?.calculationDetail?.unallocatedPrincipal ?? 0),
  investmentReturn: Number(serverResult.value?.expectedEffect?.expectedInvestmentReturn ?? 0),
  projectedBenefit: Number(serverResult.value?.expectedEffect?.projectedBenefitAmount ?? 0),
  savingAnnualRate: Number(
    serverResult.value?.expectedEffect?.soldierSavingAnnualInterestRate ?? 5,
  ),
  investmentAnnualRate: Number(
    serverResult.value?.expectedEffect?.investmentAnnualReturnRate ?? annualReturnRate.value,
  ),
  expectedAsset: Number(serverResult.value?.expectedAsset ?? 0),
}))
const hasSimulationResult = computed(() =>
  Boolean(serverResult.value && Number.isFinite(Number(serverResult.value?.expectedAsset))),
)
const hasSavedSimulation = computed(() =>
  Boolean(!isPreviewing.value && serverResult.value?.isSaved && serverResult.value?.simulationId),
)
const hasScenarioChanges = computed(() => {
  const baseline = baselineScenario.value
  if (!baseline) return false

  return (
    spendingAmount.value !== baseline.monthlySpendingAmount ||
    savingAmount.value !== baseline.monthlySavingAmount ||
    investmentAmount.value !== baseline.monthlyInvestmentAmount ||
    annualReturnRate.value !== baseline.expectedReturnRate
  )
})

const canSave = computed(() =>
  Boolean(
    hasScenarioChanges.value &&
    monthlySalary.value &&
    hasSimulationResult.value &&
    !isPreviewing.value &&
    !isSaving.value &&
    totalAllocatedAmount.value <= monthlySalary.value &&
    !previewErrorMessage.value,
  ),
)

function updateAllocation(type, rawValue) {
  const row = allocationRows.value.find((item) => item.id === type)
  const value = floorToAllocationStep(Math.max(0, Math.min(row?.maxAmount ?? 0, Number(rawValue))))

  if (type === 'spending') {
    spendingAmount.value = value
  } else if (type === 'saving') {
    savingAmount.value = value
  } else {
    investmentAmount.value = value
  }

  allocationErrorMessage.value = ''
  savedMessage.value = ''
  errorMessage.value = ''
  schedulePreview()
}

function changeReturnRate(change) {
  annualReturnRate.value = Math.max(0, Math.min(15, annualReturnRate.value + change))
  savedMessage.value = ''
  errorMessage.value = ''
  schedulePreview()
}

function rangeProgress(row) {
  return `${row.maxAmount ? (row.amount / row.maxAmount) * 100 : 0}%`
}

function formatMoney(value) {
  return `${Math.round(Number(value || 0)).toLocaleString('ko-KR')}원`
}

function formatDday(value) {
  return Number.isFinite(value) ? `D-${value}` : '-'
}

function formatDate(value) {
  const parts = dateParts(value)
  if (!parts) return '-'

  return parts.map((part, index) => (index === 0 ? part : String(part).padStart(2, '0'))).join('.')
}

function daysFromToday(value) {
  const parts = dateParts(value)
  if (!parts) return 0

  const [year, month, day] = parts
  const target = Date.UTC(year, month - 1, day)
  const today = new Date()
  const todayUtc = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate())
  return Math.max(0, Math.ceil((target - todayUtc) / 86_400_000))
}

function dateParts(value) {
  if (!value) return null

  if (Array.isArray(value)) {
    const [year, month, day] = value.map(Number)
    return year && month && day ? [year, month, day] : null
  }

  const match = String(value)
    .trim()
    .match(/^(\d{4})[-./](\d{1,2})[-./](\d{1,2})/)
  if (!match) return null

  return match.slice(1).map(Number)
}

function percentageOfIncome(amount) {
  if (!monthlySalary.value) return 0
  return Math.max(0, (Number(amount || 0) / monthlySalary.value) * 100)
}

function floorToAllocationStep(value) {
  return Math.floor(Math.max(0, Number(value || 0)) / ALLOCATION_STEP) * ALLOCATION_STEP
}

function formatPercent(value) {
  return `${Number(value || 0).toLocaleString('ko-KR', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })}%`
}

function formatRate(value) {
  return Number(value || 0).toLocaleString('ko-KR', { maximumFractionDigits: 2 })
}

function applySimulationDefaults(defaults) {
  simulationDefaults.value = defaults
  spendingAmount.value = floorToAllocationStep(defaults?.monthlySpendingAmount)
  savingAmount.value = floorToAllocationStep(defaults?.monthlySavingAmount)
  investmentAmount.value = floorToAllocationStep(defaults?.monthlyInvestmentAmount)

  if (defaults?.expectedReturnRate !== undefined && defaults?.expectedReturnRate !== null) {
    annualReturnRate.value = Math.max(0, Math.min(15, Number(defaults.expectedReturnRate)))
  }
}

function latestSavedSimulation(response) {
  if (Array.isArray(response)) return response[0] ?? null

  const simulations =
    response?.simulations ??
    response?.content ??
    response?.items ??
    response?.results ??
    response?.data

  if (simulations && simulations !== response) return latestSavedSimulation(simulations)
  return null
}

function applySavedSimulation(simulation) {
  if (!simulation) return

  spendingAmount.value = floorToAllocationStep(
    simulation.monthlySpendingAmount ?? spendingAmount.value,
  )
  savingAmount.value = floorToAllocationStep(simulation.monthlySavingAmount ?? savingAmount.value)
  investmentAmount.value = floorToAllocationStep(
    simulation.monthlyInvestmentAmount ?? investmentAmount.value,
  )

  if (simulation.expectedReturnRate !== undefined && simulation.expectedReturnRate !== null) {
    annualReturnRate.value = Math.max(0, Math.min(15, Number(simulation.expectedReturnRate)))
  }
}

function currentScenario() {
  return {
    monthlySpendingAmount: spendingAmount.value,
    monthlySavingAmount: savingAmount.value,
    monthlyInvestmentAmount: investmentAmount.value,
    expectedReturnRate: annualReturnRate.value,
  }
}

function setBaselineScenario() {
  baselineScenario.value = currentScenario()
}

function simulationPayload(isSaved) {
  return {
    monthlySpendingAmount: spendingAmount.value,
    monthlySavingAmount: savingAmount.value,
    monthlyInvestmentAmount: investmentAmount.value,
    expectedReturnRate: annualReturnRate.value,
    isSaved,
  }
}

async function loadPreview(requestId = ++previewRequestId) {
  if (totalAllocatedAmount.value > monthlySalary.value) {
    allocationErrorMessage.value = '소비, 저축, 투자 금액의 합계는 월급을 초과할 수 없어요.'
    isPreviewing.value = false
    return
  }

  previewErrorMessage.value = ''

  try {
    const response = await simulationsStore.run(simulationPayload(false))
    if (requestId !== previewRequestId) return
    serverResult.value = response
  } catch (error) {
    if (requestId !== previewRequestId) return
    previewErrorMessage.value = getApiErrorMessage(
      error,
      '시뮬레이션 계산 결과를 불러오지 못했어요.',
    )
  } finally {
    if (requestId === previewRequestId) isPreviewing.value = false
  }
}

function schedulePreview({ immediate = false } = {}) {
  if (previewTimer) clearTimeout(previewTimer)

  const requestId = ++previewRequestId
  previewErrorMessage.value = ''
  isPreviewing.value = true

  if (immediate) {
    loadPreview(requestId)
    return
  }

  previewTimer = setTimeout(() => {
    previewTimer = null
    loadPreview(requestId)
  }, PREVIEW_DELAY_MS)
}

function scenarioSnapshot(simulationId = null) {
  return {
    simulationId,
    annualReturnRate: annualReturnRate.value,
    monthlySpendingAmount: spendingAmount.value,
    monthlySavingAmount: savingAmount.value,
    monthlyInvestmentAmount: investmentAmount.value,
    spendingPercent: percentageOfIncome(spendingAmount.value),
    savingPercent: percentageOfIncome(savingAmount.value),
    investmentPercent: percentageOfIncome(investmentAmount.value),
    currentAsset: result.value.baseAsset,
    expectedAsset: result.value.expectedAsset,
    generatedAt: new Date().toISOString(),
  }
}

async function saveSimulation() {
  if (!canSave.value || isSaving.value) return

  allocationErrorMessage.value = ''
  if (totalAllocatedAmount.value > monthlySalary.value) {
    allocationErrorMessage.value = '소비, 저축, 투자 금액의 합계는 월급을 초과할 수 없어요.'
    savedMessage.value = ''
    return
  }

  isSaving.value = true
  errorMessage.value = ''

  try {
    const response = await simulationsStore.run(simulationPayload(true))
    serverResult.value = response
    setBaselineScenario()
    await completeMissionAfterLoad()
    sessionStorage.setItem(
      SIMULATION_STORAGE_KEY,
      JSON.stringify(scenarioSnapshot(response?.simulationId ?? null)),
    )
    savedMessage.value = '시뮬레이션을 적용했어요.'
  } catch (error) {
    errorMessage.value = getApiErrorMessage(
      error,
      '시뮬레이션을 저장하지 못했어요. 잠시 후 다시 시도해주세요.',
    )
  } finally {
    isSaving.value = false
  }
}

function openRecommendations() {
  sessionStorage.setItem(
    SIMULATION_STORAGE_KEY,
    JSON.stringify(scenarioSnapshot(serverResult.value?.simulationId)),
  )
  router.push({
    name: 'ai-product-recommendation',
    query: { simulationId: serverResult.value?.simulationId },
  })
}

onMounted(async () => {
  const [dashboardResult, profileResult, defaultsResult, simulationsResult] =
    await Promise.allSettled([
      dashboardStore.load(),
      myPageStore.load(),
      simulationsStore.loadDefaults(),
      simulationsStore.loadList({ page: 0, size: 1 }),
    ])

  dashboard.value = dashboardResult.status === 'fulfilled' ? dashboardResult.value?.response : null
  profile.value = profileResult.status === 'fulfilled' ? profileResult.value : myPageStore.profile

  if (defaultsResult.status === 'fulfilled') {
    applySimulationDefaults(defaultsResult.value)
    if (simulationsResult.status === 'fulfilled') {
      applySavedSimulation(latestSavedSimulation(simulationsResult.value))
    }
    // 대시보드가 최신 What-if를 기준으로 내려주는 소비·투자 목표를 우선 적용한다.
    if (dashboard.value?.goalSource) {
      spendingAmount.value = floorToAllocationStep(dashboard.value.monthlySpendingGoal)
      investmentAmount.value = floorToAllocationStep(dashboard.value.monthlyInvestmentGoal)
    }
    setBaselineScenario()
    schedulePreview({ immediate: true })
  } else {
    errorMessage.value = '시뮬레이션에 필요한 정보를 불러오지 못했어요.'
  }
})

onBeforeUnmount(() => {
  if (previewTimer) clearTimeout(previewTimer)
  previewRequestId += 1
})
</script>

<template>
  <section class="simulation-screen">
    <div class="simulation-stack">
      <section class="discharge-card">
        <div class="discharge-card__forecast">
          <span>재정적 전역일</span>
          <strong>{{ formatDday(financialDischargeDday) }}</strong>
          <small>{{ financialDischargeMessage }}</small>
        </div>
        <div class="discharge-card__actual">
          <span>실제 전역일</span>
          <strong>{{ formatDday(actualDischargeDday) }}</strong>
          <small>{{ formatDate(actualDischargeDate) }}</small>
        </div>
        <div class="discharge-card__asset">
          <span>전역 예상 자산</span>
          <strong>{{ hasSimulationResult ? formatMoney(result.expectedAsset) : '-' }}</strong>
        </div>
      </section>

      <section class="allocation-card">
        <header>
          <h2>자금 배분</h2>
          <p>앞으로의 월급 배분에 따라 달라지는 전역 자산을 확인해요</p>
        </header>

        <div class="allocation-list">
          <div
            v-for="row in allocationRows"
            :key="row.id"
            class="allocation-row"
            :class="{ 'allocation-row--active': hasScenarioChanges }"
          >
            <img
              :src="row.icon"
              alt=""
              aria-hidden="true"
            >
            <label :for="`allocation-${row.id}`">{{ row.label }}</label>
            <input
              :id="`allocation-${row.id}`"
              type="range"
              min="0"
              :max="row.maxAmount"
              :step="ALLOCATION_STEP"
              :value="row.amount"
              :aria-label="`${row.label} 월 금액`"
              :style="{
                '--range-progress': rangeProgress(row),
                '--range-color': hasScenarioChanges ? row.color : 'var(--gray-300)',
              }"
              @input="updateAllocation(row.id, $event.target.value)"
            >
            <output :for="`allocation-${row.id}`">{{ formatMoney(row.amount) }}</output>
            <span
              v-if="row.id === 'investment'"
              class="allocation-note"
            >
              군적금 외 모든 저축, 투자 자산 비율 설정
            </span>
            <small> 기준 월급의 {{ formatPercent(row.percent) }} </small>
          </div>
        </div>

        <div class="allocation-summary">
          <span>미배분 금액</span>
          <strong>{{ formatMoney(unallocatedAmount) }}</strong>
          <small>{{ formatPercent(percentageOfIncome(unallocatedAmount)) }}</small>
        </div>
      </section>

      <section class="return-card">
        <h2>목표 수익률</h2>
        <div class="return-control">
          <span
            class="return-control__icon"
            aria-hidden="true"
          >
            <img
              :src="returnRateIconBackground"
              alt=""
            >
            <b>🤑</b>
          </span>
          <span>수익률</span>
          <button
            type="button"
            aria-label="목표 수익률 1퍼센트 낮추기"
            @click="changeReturnRate(-1)"
          >
            −
          </button>
          <output>{{ annualReturnRate }} <b>%</b></output>
          <button
            type="button"
            aria-label="목표 수익률 1퍼센트 높이기"
            @click="changeReturnRate(1)"
          >
            +
          </button>
        </div>
        <p class="return-card__hint">
          연 수익률을 월 단위로 환산해 기존 투자 원금과 매월 납입금의 예상 수익을 계산해요.
        </p>
      </section>

      <section class="result-card">
        <h2>시뮬레이션 계산 결과</h2>
        <div class="result-panel">
          <h3>최종 금액 구성</h3>
          <dl class="result-breakdown">
            <div>
              <dt>현재 기준 자산</dt>
              <dd>{{ hasSimulationResult ? formatMoney(result.baseAsset) : '- 원' }}</dd>
            </div>
            <div>
              <dt>급여에서 소비를 뺀 순증가</dt>
              <dd>{{ hasSimulationResult ? formatMoney(result.cashflowIncrease) : '- 원' }}</dd>
            </div>
            <div>
              <dt>예상 혜택 합계</dt>
              <dd>{{ hasSimulationResult ? formatMoney(result.projectedBenefit) : '- 원' }}</dd>
            </div>
          </dl>

          <h3>예상 혜택 상세</h3>
          <dl class="result-breakdown">
            <div>
              <dt>군적금 단리 이자 (연 {{ formatRate(result.savingAnnualRate) }}%)</dt>
              <dd>{{ hasSimulationResult ? formatMoney(result.savingInterest) : '- 원' }}</dd>
            </div>
            <div>
              <dt>예상 정부 매칭지원금</dt>
              <dd>{{ hasSimulationResult ? formatMoney(result.governmentMatching) : '- 원' }}</dd>
            </div>
            <div>
              <dt>예상 투자 수익 (연 {{ formatRate(result.investmentAnnualRate) }}%)</dt>
              <dd>{{ hasSimulationResult ? formatMoney(result.investmentReturn) : '- 원' }}</dd>
            </div>
          </dl>

          <h3>수익 계산 기준 원금</h3>
          <dl class="result-breakdown">
            <div>
              <dt>군적금 원금</dt>
              <dd>{{ hasSimulationResult ? formatMoney(result.savingPrincipal) : '- 원' }}</dd>
            </div>
            <div>
              <dt>투자 원금</dt>
              <dd>{{ hasSimulationResult ? formatMoney(result.investmentPrincipal) : '- 원' }}</dd>
            </div>
            <div>
              <dt>미배분 누적 원금</dt>
              <dd>{{ hasSimulationResult ? formatMoney(result.unallocatedPrincipal) : '- 원' }}</dd>
            </div>
          </dl>
          <div class="result-total">
            <strong>전역 예상 자산</strong>
            <b>{{ hasSimulationResult ? formatMoney(result.expectedAsset) : '-원' }}</b>
          </div>
        </div>

        <p
          v-if="isPreviewing"
          class="result-message"
          role="status"
        >
          변경한 조건으로 다시 계산하고 있어요.
        </p>

        <button
          class="apply-button"
          type="button"
          :disabled="!canSave"
          @click="saveSimulation"
        >
          {{
            isSaving
              ? '시뮬레이션 적용 중...'
              : hasScenarioChanges
                ? '시뮬레이션 대로 적용하기'
                : '시뮬레이션 조건을 설정해주세요'
          }}
        </button>
        <p
          v-if="allocationErrorMessage"
          class="result-message"
          role="alert"
        >
          {{ allocationErrorMessage }}
        </p>
        <p
          v-if="savedMessage"
          class="result-message result-message--success"
          role="status"
        >
          {{ savedMessage }}
        </p>
        <p
          v-if="previewErrorMessage || errorMessage"
          class="result-message"
          role="alert"
        >
          {{ previewErrorMessage || errorMessage }}
        </p>
      </section>

      <DetailLinkButton
        v-if="hasSavedSimulation"
        class="recommendation-button"
        @click="openRecommendations"
      >
        <span class="recommendation-button__icon">
          <img
            :src="aiRecommendationBot"
            alt=""
            aria-hidden="true"
          >
        </span>
        <span>
          <small>연 {{ annualReturnRate }}% 수익 맞춤 상품을 추천해드릴게요!</small>
          <strong>AI 추천 상품 보기</strong>
        </span>
      </DetailLinkButton>
    </div>
  </section>
</template>

<style scoped>
.simulation-screen {
  min-height: 100%;
  padding: 12px var(--layout-page-padding) calc(var(--page-bottom-navigation-space) + 20px);
  background:
    radial-gradient(ellipse 540px 610px at 100% 100%, rgb(255 229 114 / 88%), transparent 70%),
    radial-gradient(ellipse 440px 620px at -12% 100%, rgb(98 255 156 / 70%), transparent 72%),
    radial-gradient(ellipse 180px 190px at 78% 15%, rgb(255 211 197 / 68%), transparent 72%),
    #f6f6f6;
  color: var(--gray-900);
}

.simulation-stack {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.discharge-card,
.allocation-card,
.return-card,
.result-card {
  border: 1px solid rgb(255 255 255 / 90%);
  border-radius: 28px;
  background: rgb(255 255 255 / 62%);
}

.discharge-card {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 10px 20px;
  padding: 16px;
}

.discharge-card span,
.allocation-card h2,
.return-card h2,
.result-card h2 {
  color: var(--gray-600);
  font-size: 14px;
  font-weight: 700;
  line-height: 1.5;
}

.discharge-card__forecast {
  display: flex;
  min-width: 0;
  flex-direction: column;
}

.discharge-card__forecast strong {
  width: fit-content;
  background: linear-gradient(0deg, var(--gray-900), var(--orange-600) 136%);
  background-clip: text;
  color: transparent;
  font-family: var(--font-display);
  font-size: 40px;
  font-weight: 400;
  line-height: 1.25;
}

.discharge-card__forecast small {
  width: fit-content;
  padding: 2px 8px;
  border-radius: 20px;
  background: var(--green-100);
  color: var(--green-700);
  font-size: 10px;
  line-height: 1.5;
  white-space: nowrap;
}

.discharge-card__actual {
  display: flex;
  width: 76px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 8px 6px;
  border-radius: 20px;
  background: var(--olive-200);
}

.discharge-card__actual span {
  color: #fff;
  font-family: var(--font-display);
  font-size: 11px;
}

.discharge-card__actual strong {
  color: var(--olive-500);
  font-family: var(--font-display);
  font-size: 20px;
  line-height: 1.3;
  white-space: nowrap;
}

.discharge-card__actual small {
  color: var(--gray-600);
  font-size: 10px;
}

.discharge-card__asset {
  display: flex;
  grid-column: 1 / -1;
  flex-direction: column;
}

.discharge-card__asset strong {
  font-size: 28px;
  line-height: 1.25;
  letter-spacing: -1px;
}

.allocation-card {
  padding: 17px 16px 14px;
  background: rgb(255 255 255 / 90%);
}

.allocation-card header p {
  margin-top: 2px;
  color: var(--gray-400);
  font-size: 12px;
  line-height: 1.5;
}

.allocation-list {
  display: flex;
  flex-direction: column;
  gap: 9px;
  margin-top: 10px;
}

.allocation-row {
  display: grid;
  grid-template-columns: 30px 42px minmax(60px, 1fr) 86px;
  align-items: center;
  gap: 8px;
}

.allocation-row > img {
  width: 30px;
  height: 30px;
}

.allocation-row label {
  color: var(--gray-600);
  font-size: 13px;
  font-weight: 700;
}

.allocation-row input {
  width: 100%;
  height: 16px;
  margin: 0;
  appearance: none;
  background: transparent;
  cursor: pointer;
}

.allocation-row input::-webkit-slider-runnable-track {
  height: 5px;
  border-radius: 999px;
  background: linear-gradient(
    to right,
    var(--range-color) 0 var(--range-progress),
    var(--gray-200) var(--range-progress) 100%
  );
}

.allocation-row input::-webkit-slider-thumb {
  width: 11px;
  height: 11px;
  margin-top: -3px;
  appearance: none;
  border: 0;
  border-radius: 50%;
  background: var(--range-color);
  box-shadow: 0 1px 3px rgb(0 0 0 / 25%);
}

.allocation-row input::-moz-range-track {
  height: 5px;
  border-radius: 999px;
  background: var(--gray-200);
}

.allocation-row input::-moz-range-progress {
  height: 5px;
  border-radius: 999px;
  background: var(--range-color);
}

.allocation-row input::-moz-range-thumb {
  width: 11px;
  height: 11px;
  border: 0;
  border-radius: 50%;
  background: var(--range-color);
}

.allocation-row input:focus-visible {
  outline: 2px solid var(--green-300);
  outline-offset: 3px;
}

.allocation-row output {
  padding: 9px 6px;
  border-radius: 15px;
  background: var(--gray-50);
  color: var(--gray-400);
  font-size: 11px;
  font-weight: 700;
  text-align: center;
}

.allocation-row--active:nth-child(1) output {
  color: var(--orange-600);
}

.allocation-row--active:nth-child(2) output {
  color: var(--green-600);
}

.allocation-row--active:nth-child(3) output {
  color: var(--olive-400);
}

.allocation-row > small {
  display: flex;
  grid-column: 3 / -1;
  justify-content: flex-end;
  gap: 6px;
  margin-top: -8px;
  color: #888;
  font-size: 10px;
  white-space: nowrap;
}

.allocation-note {
  grid-column: 1 / 4;
  margin-top: 2px;
  color: #888;
  font-size: 11px;
  line-height: 1.4;
  white-space: nowrap;
}

.allocation-row:last-child > small {
  grid-column: 4;
}

.allocation-summary {
  display: grid;
  grid-template-columns: 1fr auto auto;
  align-items: center;
  gap: 8px;
  padding-top: 10px;
  margin-top: 10px;
  border-top: 1px solid var(--gray-200);
  color: var(--gray-600);
}

.allocation-summary span {
  font-size: 12px;
  font-weight: 700;
}

.allocation-summary strong {
  color: var(--gray-900);
  font-size: 13px;
}

.allocation-summary small {
  min-width: 44px;
  color: var(--green-700);
  font-size: 11px;
  font-weight: 700;
  text-align: right;
}

.return-card {
  padding: 14px 16px 16px;
  background: rgb(255 255 255 / 90%);
}

.return-card__hint {
  margin: 8px 2px 0;
  color: var(--gray-500);
  font-size: 9px;
  line-height: 1.45;
}

.return-control {
  display: grid;
  grid-template-columns: 38px 1fr 36px 72px 36px;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
}

.return-control__icon {
  position: relative;
  display: grid;
  width: 38px;
  height: 38px;
  place-items: center;
  overflow: hidden;
  border-radius: 50%;
}

.return-control__icon img {
  position: absolute;
  inset: 0;
  width: 38px;
  height: 38px;
}

.return-control__icon b {
  position: relative;
  font-size: 22px;
  font-weight: 400;
  line-height: 1;
}

.return-control > span {
  color: var(--gray-600);
  font-size: 13px;
  font-weight: 700;
}

.return-control button {
  width: 36px;
  height: 36px;
  border: 0;
  border-radius: 18px;
  background: linear-gradient(180deg, var(--green-500) 80%, var(--green-50));
  color: var(--green-900);
  font-size: 21px;
  font-weight: 700;
  cursor: pointer;
}

.return-control button:focus-visible,
.apply-button:focus-visible,
.recommendation-button:focus-visible {
  outline: 3px solid var(--green-300);
  outline-offset: 2px;
}

.return-control output {
  padding: 8px 14px;
  border-radius: 10px;
  background: var(--gray-50);
  color: var(--gray-500);
  font-size: 14px;
  font-weight: 700;
  text-align: center;
}

.return-control output b {
  color: var(--green-600);
}

.result-card {
  padding: 15px 14px 16px;
  background: rgb(255 255 255 / 18%);
}

.result-panel {
  padding: 10px 16px;
  margin-top: 6px;
  border-radius: 15px;
  background: #fff;
}

.result-panel h3 {
  margin: 12px 0 6px;
  color: var(--gray-500);
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.02em;
}

.result-panel h3:first-child {
  margin-top: 0;
}

.result-panel dl {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.result-panel dl > div,
.result-total {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.result-panel dt,
.result-panel dd {
  margin: 0;
  font-size: 11px;
  line-height: 1.5;
}

.result-panel dt {
  color: var(--gray-900);
  font-weight: 700;
}

.result-panel dd {
  color: var(--gray-600);
  font-weight: 600;
}

.result-total {
  padding-top: 10px;
  margin-top: 10px;
  border-top: 1px solid var(--gray-200);
}

.result-total strong {
  font-size: 14px;
}

.result-total b {
  flex: none;
  color: var(--green-700);
  font-size: 16px;
}

.apply-button {
  width: 100%;
  height: 50px;
  margin-top: 10px;
  border: 0;
  border-radius: 28px;
  background: var(--green-500);
  color: var(--gray-900);
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
}

.apply-button:disabled {
  opacity: 1;
  background: var(--gray-200);
  color: var(--gray-400);
  -webkit-text-fill-color: var(--gray-400);
  cursor: not-allowed;
}

.result-message {
  margin: 8px 4px 0;
  color: var(--orange-700);
  font-size: 11px;
  text-align: center;
}

.result-message--success {
  color: var(--green-800);
}

/* DetailLinkButton 의 기본 스타일보다 우선하도록 클래스를 겹쳐 올린다. */
.recommendation-button.detail-link-button {
  display: flex;
  width: calc(100% - 16px);
  min-height: 52px;
  align-items: center;
  justify-content: flex-start;
  gap: 8px;
  padding: 5px 14px 5px 5px;
  margin: 0 auto;
  border: 2px solid transparent;
  border-radius: var(--radius-full, 999px);
  background:
    linear-gradient(#fff, #fff) padding-box,
    linear-gradient(105deg, var(--orange-600), var(--yellow-400), var(--green-500), var(--blue-800))
      border-box;
  color: var(--gray-900);
  text-align: left;
  cursor: pointer;
}

/*
  DetailLinkButton 이 슬롯을 감싸는 span 은 이 컴포넌트의 스코프 속성을 갖지 않는다.
  :deep() 로 넘겨야 래퍼에 레이아웃이 적용된다.
*/
.recommendation-button > :deep(span) {
  display: flex;
  min-width: 0;
  flex: 1;
  align-items: center;
  gap: 8px;
}

.recommendation-button__icon {
  display: grid;
  width: 34px;
  height: 34px;
  flex: none;
  place-items: center;
  overflow: hidden;
  border-radius: 50%;
  background: linear-gradient(135deg, #fff5d9, #e2fff0);
}

.recommendation-button__icon img {
  width: 26px;
  height: 26px;
  object-fit: cover;
  transform: scaleX(-1);
}

.recommendation-button > span:first-child > span:last-child {
  display: flex;
  min-width: 0;
  flex-direction: column;
}

/* 화살표도 DetailLinkButton 이 렌더링하므로 :deep() 이 필요하다. */
.recommendation-button > :deep(img) {
  width: 7px;
  height: 11px;
  flex: 0 0 auto;
}

.recommendation-button small {
  color: var(--gray-600);
  font-size: 11px;
  line-height: 1.35;
}

.recommendation-button strong {
  font-size: 15px;
  font-weight: 700;
  line-height: 1.4;
}

@media (max-width: 360px) {
  .allocation-row {
    grid-template-columns: 28px 40px minmax(50px, 1fr) 80px;
    gap: 6px;
  }

  .return-control {
    grid-template-columns: 34px 1fr 34px 62px 34px;
    gap: 5px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .allocation-row input,
  .return-control button,
  .recommendation-button {
    scroll-behavior: auto;
  }
}
</style>
