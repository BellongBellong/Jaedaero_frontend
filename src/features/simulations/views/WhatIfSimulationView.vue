<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import consumptionIcon from '@/assets/icons/account/consumptionBlock.png'
import investIcon from '@/assets/icons/account/investBlock.png'
import savingsIcon from '@/assets/icons/account/savingsBlock.png'
import aiRecommendationBot from '@/assets/simulations/ai-recommendation-bot.png'
import returnRateIconBackground from '@/assets/simulations/return-rate-icon-bg.svg'
import { getCashflow } from '@/features/cashflow/api/cashflow.api'
import { getDashboard } from '@/features/dashboard/api/dashboard.api'
import { getMyPageProfile } from '@/features/my-page/api/myPage.api'
import { runSimulation } from '@/features/simulations/api/simulations.api'
import { useMissionCompletion } from '@/features/missions/composables/useMissionCompletion'

const MILITARY_SAVINGS_AMOUNT = 550_000
const MILITARY_SAVINGS_RATE = 5
const SIMULATION_STORAGE_KEY = 'jaedaero-latest-simulation'

const route = useRoute()
const router = useRouter()
const { completeMissionAfterLoad } = useMissionCompletion(route, router)
const dashboard = ref(null)
const profile = ref(null)
const cashflow = ref(null)
const spendingPercent = ref(30)
const savingPercent = ref(30)
const investmentPercent = ref(30)
const annualReturnRate = ref(5)
const hasAdjusted = ref(false)
const isApplying = ref(false)
const serverResult = ref(null)
const errorMessage = ref('')
const allocationErrorMessage = ref('')
const appliedMessage = ref('')

const monthlySalary = computed(() =>
  Math.max(
    0,
    Number(
      profile.value?.monthlySalary ??
        profile.value?.soldierProfile?.monthlySalary ??
        dashboard.value?.assetSnapshot?.income ??
        0,
    ),
  ),
)
const savingAmount = computed(
  () => Math.round((MILITARY_SAVINGS_AMOUNT * savingPercent.value) / 100 / 1000) * 1000,
)
const totalAllocatedAmount = computed(
  () =>
    amountFromPercent(spendingPercent.value) +
    savingAmount.value +
    amountFromPercent(investmentPercent.value),
)
const actualDischargeDday = computed(() => Number(dashboard.value?.dischargeDday || 0))
const remainingMonths = computed(() => Math.max(1, Math.ceil(actualDischargeDday.value / 30)))
const monthlyIncomeSchedule = computed(() => {
  const apiMonths = Array.isArray(cashflow.value?.months) ? cashflow.value.months : []

  return Array.from({ length: remainingMonths.value }, (_, index) => {
    const apiIncome = Number(apiMonths[index]?.expectedSalary || 0)
    return apiIncome > 0 ? apiIncome : monthlySalary.value
  })
})
const currentAsset = computed(() =>
  Number(dashboard.value?.totalAsset ?? dashboard.value?.currentAsset ?? 0),
)
const targetAmount = computed(() => Number(dashboard.value?.targetAmount || 0))
const actualDischargeDate = computed(
  () => dashboard.value?.actualDischargeDate || profile.value?.dischargeDate || '',
)
const financialDischargeDday = computed(() => {
  const serverDate = serverResult.value?.financialDischargeDate

  if (serverDate) return daysFromToday(serverDate)

  return Number(
    dashboard.value?.financialDischargeDday ??
      Math.max(
        0,
        actualDischargeDday.value - Number(dashboard.value?.financialDischargeDifferenceDays || 0),
      ),
  )
})
const advancedDays = computed(() =>
  Math.max(0, actualDischargeDday.value - financialDischargeDday.value),
)

const allocationRows = computed(() => [
  {
    id: 'spending',
    label: '소비',
    icon: consumptionIcon,
    percent: spendingPercent.value,
    amount: amountFromPercent(spendingPercent.value),
    max: 100,
    color: '#e37255',
  },
  {
    id: 'saving',
    label: '저축',
    icon: savingsIcon,
    percent: savingPercent.value,
    amount: savingAmount.value,
    max: 100,
    color: '#3be178',
  },
  {
    id: 'investment',
    label: '투자',
    icon: investIcon,
    percent: investmentPercent.value,
    amount: amountFromPercent(investmentPercent.value),
    max: 100,
    color: '#7c8e77',
  },
])

const clientCalculation = computed(() => {
  const months = monthlyIncomeSchedule.value.length
  const monthlyInvestmentRate = annualReturnRate.value / 100 / 12
  let savingPrincipal = 0
  let savingInterest = 0
  let investmentPrincipal = 0
  let futureInvestmentValue = 0

  monthlyIncomeSchedule.value.forEach((income, index) => {
    const monthlySaving = Math.min(savingAmount.value, income)
    const monthlyInvestment = Math.round((income * investmentPercent.value) / 100 / 1000) * 1000
    savingPrincipal += monthlySaving
    savingInterest += monthlySaving * (months - index) * (MILITARY_SAVINGS_RATE / 100 / 12)
    investmentPrincipal += monthlyInvestment
    futureInvestmentValue =
      (futureInvestmentValue + monthlyInvestment) * (1 + monthlyInvestmentRate)
  })

  savingInterest = Math.round(savingInterest)
  const investmentReturn = Math.max(0, Math.round(futureInvestmentValue - investmentPrincipal))

  return {
    savingPrincipal,
    savingInterest,
    investmentPrincipal,
    investmentReturn,
    projectedAssetAtDischarge:
      currentAsset.value +
      savingPrincipal +
      savingInterest +
      investmentPrincipal +
      investmentReturn,
  }
})

const result = computed(() => ({
  ...clientCalculation.value,
  projectedAssetAtDischarge: Number(
    serverResult.value?.projectedAssetAtDischarge ??
      clientCalculation.value.projectedAssetAtDischarge,
  ),
}))

const canApply = computed(() =>
  Boolean(hasAdjusted.value && monthlySalary.value && !errorMessage.value),
)

function amountFromPercent(percent) {
  return Math.round((monthlySalary.value * percent) / 100 / 1000) * 1000
}

function updateAllocation(type, rawValue) {
  const value = Math.max(0, Math.min(100, Number(rawValue)))

  if (type === 'spending') {
    spendingPercent.value = value
  } else if (type === 'saving') {
    savingPercent.value = value
  } else {
    investmentPercent.value = value
  }

  hasAdjusted.value = true
  allocationErrorMessage.value = ''
  appliedMessage.value = ''
  serverResult.value = null
}

function changeReturnRate(change) {
  annualReturnRate.value = Math.max(0, Math.min(15, annualReturnRate.value + change))
  hasAdjusted.value = true
  appliedMessage.value = ''
  serverResult.value = null
}

function rangeProgress(row) {
  return `${row.max ? (row.percent / row.max) * 100 : 0}%`
}

function formatMoney(value) {
  return `${Math.round(Number(value || 0)).toLocaleString('ko-KR')}원`
}

function formatDate(value) {
  if (!value) return '-'
  return String(value).slice(0, 10).replaceAll('-', '.')
}

function daysFromToday(value) {
  const target = new Date(`${String(value).slice(0, 10)}T00:00:00`)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return Math.max(0, Math.ceil((target - today) / 86_400_000))
}

function scenarioSnapshot(simulationId = null) {
  return {
    simulationId,
    annualReturnRate: annualReturnRate.value,
    spendingPercent: spendingPercent.value,
    savingPercent: savingPercent.value,
    investmentPercent: investmentPercent.value,
    currentAsset: currentAsset.value,
    generatedAt: new Date().toISOString(),
  }
}

async function applySimulation() {
  if (!canApply.value || isApplying.value) return

  allocationErrorMessage.value = ''
  if (totalAllocatedAmount.value > monthlySalary.value) {
    allocationErrorMessage.value = '소비, 저축, 투자 금액의 합계는 월급을 초과할 수 없어요.'
    appliedMessage.value = ''
    return
  }

  isApplying.value = true
  errorMessage.value = ''

  try {
    const response = await runSimulation({
      name: '자금 배분 시뮬레이션',
      monthlySpendingAmount: amountFromPercent(spendingPercent.value),
      monthlySavingAmount: savingAmount.value,
      monthlyInvestmentAmount: amountFromPercent(investmentPercent.value),
      annualReturnRate: annualReturnRate.value,
      vacationBudget: 0,
      targetAmount: targetAmount.value,
    })
    serverResult.value = response
    await completeMissionAfterLoad()
    sessionStorage.setItem(
      SIMULATION_STORAGE_KEY,
      JSON.stringify(scenarioSnapshot(response?.id ?? null)),
    )
    appliedMessage.value = '시뮬레이션을 적용했어요.'
  } catch {
    errorMessage.value = '시뮬레이션을 적용하지 못했어요. 잠시 후 다시 시도해주세요.'
  } finally {
    isApplying.value = false
  }
}

function openRecommendations() {
  sessionStorage.setItem(
    SIMULATION_STORAGE_KEY,
    JSON.stringify(scenarioSnapshot(serverResult.value?.id)),
  )
  router.push({ name: 'ai-product-recommendation' })
}

onMounted(async () => {
  try {
    const [dashboardResponse, profileResponse] = await Promise.all([
      getDashboard(),
      getMyPageProfile(),
    ])
    dashboard.value = dashboardResponse
    profile.value = profileResponse
    try {
      cashflow.value = await getCashflow(remainingMonths.value)
    } catch {
      cashflow.value = null
    }
  } catch {
    errorMessage.value = '시뮬레이션에 필요한 정보를 불러오지 못했어요.'
  }
})
</script>

<template>
  <section class="simulation-screen">
    <div class="simulation-stack">
      <section class="discharge-card">
        <div class="discharge-card__forecast">
          <span>재정적 전역일</span>
          <strong>D-{{ financialDischargeDday }}</strong>
          <small>실제 전역보다 {{ advancedDays }}일 빠른 것으로 예상돼요!</small>
        </div>
        <div class="discharge-card__actual">
          <span>실제 전역일</span>
          <strong>D-{{ actualDischargeDday }}</strong>
          <small>{{ formatDate(actualDischargeDate) }}</small>
        </div>
        <div class="discharge-card__asset">
          <span>전역 예상 자산</span>
          <strong>{{
            formatMoney(
              canApply ? result.projectedAssetAtDischarge : dashboard?.projectedAssetAtDischarge,
            )
          }}</strong>
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
            :class="{ 'allocation-row--active': hasAdjusted }"
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
              :max="row.max"
              :value="row.percent"
              :aria-label="`${row.label} 비율`"
              :style="{
                '--range-progress': rangeProgress(row),
                '--range-color': hasAdjusted ? row.color : '#bdbdbd',
              }"
              @input="updateAllocation(row.id, $event.target.value)"
            >
            <output :for="`allocation-${row.id}`">{{ row.percent }}%</output>
            <span
              v-if="row.id === 'investment'"
              class="allocation-note"
            >
              군적금 외 모든 저축, 투자 자산 비율 설정
            </span>
            <small>
              {{ hasAdjusted ? formatMoney(row.amount) : '-' }}
            </small>
          </div>
        </div>
      </section>

      <section class="return-card">
        <h2>예상 수익률</h2>
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
            aria-label="예상 수익률 1퍼센트 낮추기"
            @click="changeReturnRate(-1)"
          >
            −
          </button>
          <output>{{ annualReturnRate }} <b>%</b></output>
          <button
            type="button"
            aria-label="예상 수익률 1퍼센트 높이기"
            @click="changeReturnRate(1)"
          >
            +
          </button>
        </div>
      </section>

      <section class="result-card">
        <h2>AI 계산 결과</h2>
        <div class="result-panel">
          <dl>
            <div>
              <dt>저축 원금</dt>
              <dd>{{ canApply ? formatMoney(result.savingPrincipal) : '- 원' }}</dd>
            </div>
            <div>
              <dt>군적금 이자 (연 5%)</dt>
              <dd>{{ canApply ? formatMoney(result.savingInterest) : '- 원' }}</dd>
            </div>
            <div>
              <dt>투자 원금</dt>
              <dd>{{ canApply ? formatMoney(result.investmentPrincipal) : '- 원' }}</dd>
            </div>
            <div>
              <dt>예상 투자 수익 (연 {{ annualReturnRate }}%)</dt>
              <dd>{{ canApply ? formatMoney(result.investmentReturn) : '- 원' }}</dd>
            </div>
          </dl>
          <div class="result-total">
            <strong>전역 예상 자산</strong>
            <b>{{ canApply ? formatMoney(result.projectedAssetAtDischarge) : '-원' }}</b>
          </div>
        </div>

        <button
          class="apply-button"
          type="button"
          :disabled="!canApply || isApplying"
          @click="applySimulation"
        >
          {{ isApplying ? '계산을 적용하는 중...' : '시뮬레이션 대로 적용하기' }}
        </button>
        <p
          v-if="allocationErrorMessage"
          class="result-message"
          role="alert"
        >
          {{ allocationErrorMessage }}
        </p>
        <p
          v-if="appliedMessage"
          class="result-message result-message--success"
          role="status"
        >
          {{ appliedMessage }}
        </p>
        <p
          v-if="errorMessage"
          class="result-message"
          role="alert"
        >
          {{ errorMessage }}
        </p>
      </section>

      <button
        v-if="canApply"
        class="recommendation-button"
        type="button"
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
          <strong>AI 추천 상품 보기 <b aria-hidden="true">›</b></strong>
        </span>
      </button>
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
  font-size: 24px;
  line-height: 1.3;
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
  grid-template-columns: 30px 36px minmax(80px, 1fr) 58px;
  align-items: center;
  gap: 10px;
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
  padding: 9px 10px;
  border-radius: 15px;
  background: var(--gray-50);
  color: var(--gray-400);
  font-size: 13px;
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
  font-size: 11px;
}

.allocation-note {
  grid-column: 1 / 4;
  margin-top: -8px;
  color: #888;
  font-size: 11px;
  line-height: 1.4;
  white-space: nowrap;
}

.allocation-row:last-child > small {
  grid-column: 4;
}

.return-card {
  padding: 14px 16px 16px;
  background: rgb(255 255 255 / 90%);
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
  background: var(--gray-200);
  color: var(--gray-400);
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

.recommendation-button {
  display: flex;
  width: calc(100% - 16px);
  min-height: 58px;
  align-items: center;
  gap: 10px;
  padding: 5px 14px 5px 6px;
  margin: 0 auto;
  border: 3px solid transparent;
  border-radius: 28px;
  background:
    linear-gradient(#fff, #fff) padding-box,
    linear-gradient(105deg, var(--orange-600), var(--yellow-400), var(--green-500), var(--blue-800))
      border-box;
  color: var(--gray-900);
  text-align: left;
  cursor: pointer;
}

.recommendation-button__icon {
  display: grid;
  width: 40px;
  height: 40px;
  flex: none;
  place-items: center;
  overflow: hidden;
  border-radius: 50%;
  background: linear-gradient(135deg, #fff5d9, #e2fff0);
}

.recommendation-button__icon img {
  width: 30px;
  height: 30px;
  object-fit: cover;
  transform: scaleX(-1);
}

.recommendation-button > span:last-child {
  display: flex;
  min-width: 0;
  flex-direction: column;
}

.recommendation-button small {
  color: var(--gray-600);
  font-size: 10px;
  line-height: 1.4;
}

.recommendation-button strong {
  font-size: 15px;
  line-height: 1.5;
}

.recommendation-button strong b {
  margin-left: 6px;
  font-size: 21px;
  font-weight: 400;
}

@media (max-width: 360px) {
  .allocation-row {
    grid-template-columns: 30px 32px minmax(64px, 1fr) 52px;
    gap: 7px;
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
