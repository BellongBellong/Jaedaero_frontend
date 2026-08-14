<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import calendarIcon from '@/assets/icons/CalenderIcon.svg'
import monthlyInvestmentIcon from '@/assets/rebalancing-monthly-account-icon.png'
import aiRecommendationBot from '@/assets/simulations/ai-recommendation-bot.png'
import { getAccounts } from '@/features/accounts/api/accounts.api'
import { getMyPageProfile } from '@/features/my-page/api/myPage.api'
import {
  createInvestmentGuidance,
  getRecurringInvestmentPlan,
  saveRecurringInvestmentPlan,
} from '@/features/rebalancing/api/rebalancing.api'
import { getSimulation, getSimulations } from '@/features/simulations/api/simulations.api'

const route = useRoute()
const router = useRouter()

const frequency = ref('MONTHLY')
const contributionDay = ref(10)
const contributionDayTouched = ref(false)
const dayPickerOpen = ref(false)
const nickname = ref('')
const contributionAmount = ref(0)
const maximumMonthlyAmount = ref(0)
const accounts = ref([])
const brokerageAccountId = ref(null)
const investmentProductCode = ref('069500')
const investmentProductName = ref('KODEX 200')
const isLoading = ref(true)
const isSaving = ref(false)
const confirmOpen = ref(false)
const saveError = ref('')

const isEdit = computed(() => route.name === 'investment-plan-edit')
const monthlyEquivalentAmount = computed(() =>
  frequency.value === 'WEEKLY'
    ? Math.round((Number(contributionAmount.value) * 52) / 12)
    : Number(contributionAmount.value),
)
const validationMessage = computed(() => {
  if (!contributionAmount.value || !maximumMonthlyAmount.value) return ''
  if (monthlyEquivalentAmount.value <= Number(maximumMonthlyAmount.value)) return ''
  return frequency.value === 'WEEKLY'
    ? '주간 적립금의 월 환산액이 월 최대 투자 한도보다 높아요.'
    : '회차별 투자금이 월 최대 투자 한도보다 높아요.'
})
const canSubmit = computed(
  () =>
    !isLoading.value &&
    !validationMessage.value &&
    Number(contributionAmount.value) > 0 &&
    Number(maximumMonthlyAmount.value) > 0 &&
    brokerageAccountId.value,
)
const selectedAccount = computed(() =>
  accounts.value.find((account) => String(account.id) === String(brokerageAccountId.value)),
)
const accountLabel = computed(() => {
  const account = selectedAccount.value
  if (!account) return '연결한 증권 계좌'
  return account.accountName || account.institutionName || '증권 계좌'
})
const scheduleLabel = computed(() => {
  if (frequency.value === 'WEEKLY')
    return `매주 ${weekdayOptions[contributionDay.value - 1]?.label || '월요일'}`
  return `매월 ${contributionDay.value}일`
})

const weekdayOptions = [
  { value: 1, label: '월요일', short: '월' },
  { value: 2, label: '화요일', short: '화' },
  { value: 3, label: '수요일', short: '수' },
  { value: 4, label: '목요일', short: '목' },
  { value: 5, label: '금요일', short: '금' },
  { value: 6, label: '토요일', short: '토' },
  { value: 7, label: '일요일', short: '일' },
]

const productOptions = [
  { code: '069500', name: 'KODEX 200' },
  { code: '360750', name: 'TIGER 미국S&P500' },
]

function unwrapSimulations(response) {
  if (Array.isArray(response)) return response
  const list =
    response?.simulations ??
    response?.content ??
    response?.items ??
    response?.results ??
    response?.data
  return Array.isArray(list) ? list : list ? unwrapSimulations(list) : []
}

function latestSimulation(simulations) {
  return [...simulations].sort((left, right) => {
    const leftKey = new Date(left?.createdAt || 0).getTime() || Number(left?.id || 0)
    const rightKey = new Date(right?.createdAt || 0).getTime() || Number(right?.id || 0)
    return rightKey - leftKey
  })[0]
}

function investmentAmountFrom(simulation) {
  if (simulation?.data && simulation.data !== simulation) {
    return investmentAmountFrom(simulation.data)
  }

  return Number(
    simulation?.monthlyInvestmentAmount ??
      simulation?.investmentAmount ??
      simulation?.monthlyInvestment ??
      0,
  )
}

function storedWhatIfAmount() {
  try {
    const stored = JSON.parse(sessionStorage.getItem('jaedaero-latest-simulation') || 'null')
    return investmentAmountFrom(stored)
  } catch {
    return 0
  }
}

function isSecuritiesAccount(account) {
  return ['ST', 'SECURITIES', 'INVESTMENT'].includes(
    String(account.businessType || account.accountType || '').toUpperCase(),
  )
}

function formatWon(value) {
  return `${Number(value || 0).toLocaleString('ko-KR')}원`
}

function updateAmount(target, event) {
  const number = Number(String(event.target.value).replace(/[^0-9]/g, ''))
  if (target === 'contribution') contributionAmount.value = number
  else maximumMonthlyAmount.value = number
  event.target.value = number ? number.toLocaleString('ko-KR') : ''
}

function changeFrequency(value) {
  frequency.value = value
  contributionDay.value = value === 'WEEKLY' ? 1 : 10
  contributionDayTouched.value = false
  dayPickerOpen.value = false
}

function selectContributionDay(day) {
  contributionDay.value = day
  contributionDayTouched.value = true
  dayPickerOpen.value = false
}

function openConfirmation() {
  saveError.value = ''
  if (canSubmit.value) confirmOpen.value = true
}

// 가이드가 즉시 생성되더라도 로딩 화면을 최소 이 시간만큼은 보여준다.
const MINIMUM_LOADING_MS = 2500

function holdLoadingUntilMinimum(startedAt) {
  const remaining = MINIMUM_LOADING_MS - (Date.now() - startedAt)
  if (remaining <= 0) return Promise.resolve()
  return new Promise((resolve) => window.setTimeout(resolve, remaining))
}

async function submitPlan() {
  if (!canSubmit.value || isSaving.value) return
  isSaving.value = true
  confirmOpen.value = false
  saveError.value = ''
  const loadingStartedAt = Date.now()

  try {
    await saveRecurringInvestmentPlan({
      frequency: frequency.value,
      contributionDay: Number(contributionDay.value),
      contributionAmount: Number(contributionAmount.value),
      maximumMonthlyAmount: Number(maximumMonthlyAmount.value),
      brokerageAccountId: Number(brokerageAccountId.value),
      investmentProductCode: investmentProductCode.value,
      investmentProductName: investmentProductName.value,
    })
    const guidance = await createInvestmentGuidance()
    sessionStorage.setItem('latestInvestmentGuidance', JSON.stringify(guidance || {}))
    await holdLoadingUntilMinimum(loadingStartedAt)
    router.replace({ name: 'investment-guide' })
  } catch (error) {
    saveError.value =
      error?.response?.data?.message || '적립 계획을 저장하지 못했어요. 잠시 후 다시 시도해주세요.'
    isSaving.value = false
    confirmOpen.value = true
  }
}

async function loadForm() {
  const [simulationsResult, planResult, accountResult, profileResult] = await Promise.allSettled([
    getSimulations({ page: 0, size: 1 }),
    isEdit.value ? getRecurringInvestmentPlan() : Promise.resolve(null),
    getAccounts(),
    getMyPageProfile(),
  ])

  if (profileResult.status === 'fulfilled') nickname.value = profileResult.value?.nickname || ''

  const simulations =
    simulationsResult.status === 'fulfilled' ? unwrapSimulations(simulationsResult.value) : []
  const latest = latestSimulation(simulations)
  let whatIfAmount = investmentAmountFrom(latest) || storedWhatIfAmount()

  const latestSimulationId = latest?.simulationId ?? latest?.id
  if (!whatIfAmount && latestSimulationId) {
    try {
      whatIfAmount = investmentAmountFrom(await getSimulation(latestSimulationId))
    } catch {
      // 목록 응답에 금액이 있으면 상세 조회 실패와 무관하게 폼을 계속 연다.
    }
  }

  if (accountResult.status === 'fulfilled') {
    const securitiesAccounts = accountResult.value.filter(isSecuritiesAccount)
    accounts.value = securitiesAccounts.length ? securitiesAccounts : accountResult.value
    brokerageAccountId.value = accounts.value[0]?.id || null
  }

  if (planResult.status === 'fulfilled' && planResult.value) {
    const plan = planResult.value
    frequency.value = plan.frequency || 'MONTHLY'
    contributionDay.value = Number(plan.contributionDay || (frequency.value === 'WEEKLY' ? 1 : 10))
    contributionDayTouched.value = Boolean(plan.contributionDay)
    contributionAmount.value = Number(plan.contributionAmount || whatIfAmount)
    maximumMonthlyAmount.value = Number(plan.maximumMonthlyAmount || whatIfAmount)
    brokerageAccountId.value = plan.brokerageAccountId || brokerageAccountId.value
    investmentProductCode.value = plan.investmentProductCode || '069500'
    investmentProductName.value = plan.investmentProductName || 'KODEX 200'
  } else {
    contributionAmount.value = whatIfAmount
    maximumMonthlyAmount.value = whatIfAmount
  }
  isLoading.value = false
}

onMounted(loadForm)

watch(investmentProductCode, (code) => {
  investmentProductName.value =
    productOptions.find((product) => product.code === code)?.name || investmentProductName.value
})
</script>

<template>
  <section class="plan-setup screen app-page">
    <form
      class="plan-form"
      @submit.prevent="openConfirmation"
    >
      <section class="form-card plan-settings-card">
        <header class="card-heading">
          <h2>투자 주기</h2>
          <p>투자를 실천할 주기를 설정해주세요</p>
        </header>
        <div
          class="period-tabs"
          role="radiogroup"
          aria-label="투자 주기"
        >
          <button
            v-for="option in [
              { value: 'MONTHLY', label: '월간' },
              { value: 'WEEKLY', label: '주간' },
            ]"
            :key="option.value"
            type="button"
            :class="{ active: frequency === option.value }"
            @click="changeFrequency(option.value)"
          >
            {{ option.label }}
          </button>
        </div>

        <p class="period-helper">
          {{
            frequency === 'WEEKLY' ? '매주 지정한 요일에 투자해요' : '매월 지정한 날짜에 투자해요'
          }}
        </p>

        <div
          v-if="frequency === 'WEEKLY'"
          class="field-block schedule-field"
        >
          <span>매주 적립요일</span>
          <div class="weekday-picker">
            <span class="weekday-prefix">매주</span>
            <div class="weekday-options">
              <button
                v-for="day in weekdayOptions"
                :key="day.value"
                type="button"
                class="weekday-chip"
                :class="{ active: contributionDay === day.value }"
                :aria-pressed="contributionDay === day.value"
                :aria-label="day.label"
                @click="contributionDay = day.value"
              >
                {{ day.short }}
              </button>
            </div>
          </div>
        </div>

        <div
          v-else
          class="field-block schedule-field"
        >
          <span>매월 투자일</span>
          <div class="day-picker">
            <button
              type="button"
              class="select-shell schedule-select"
              :class="{ 'schedule-select--touched': contributionDayTouched }"
              aria-haspopup="dialog"
              :aria-expanded="dayPickerOpen"
              @click="dayPickerOpen = !dayPickerOpen"
            >
              <span class="schedule-select__value">매월 {{ contributionDay }}일</span>
              <img
                class="calendar-icon"
                :src="calendarIcon"
                alt=""
              >
            </button>

            <div
              v-if="dayPickerOpen"
              class="day-picker__backdrop"
              @click="dayPickerOpen = false"
            />
            <div
              v-if="dayPickerOpen"
              class="day-grid"
              role="dialog"
              aria-label="매월 투자일 선택"
            >
              <button
                v-for="day in 28"
                :key="day"
                type="button"
                class="day-cell"
                :class="{ active: contributionDay === day }"
                :aria-pressed="contributionDay === day"
                @click="selectContributionDay(day)"
              >
                {{ day }}
              </button>
            </div>
          </div>
        </div>

        <label class="field-block amount-field">
          <span>회차별 적립금</span>
          <span class="amount-input">
            <input
              inputmode="numeric"
              :value="contributionAmount ? contributionAmount.toLocaleString('ko-KR') : ''"
              :placeholder="
                contributionAmount ? contributionAmount.toLocaleString('ko-KR') : '300,000'
              "
              @input="updateAmount('contribution', $event)"
            >
            <em>원</em>
          </span>
        </label>

        <label class="field-block amount-field">
          <span>월 최대 투자 한도</span>
          <span class="amount-input">
            <input
              inputmode="numeric"
              :value="maximumMonthlyAmount ? maximumMonthlyAmount.toLocaleString('ko-KR') : ''"
              :placeholder="
                maximumMonthlyAmount ? maximumMonthlyAmount.toLocaleString('ko-KR') : '300,000'
              "
              @input="updateAmount('maximum', $event)"
            >
            <em>원</em>
          </span>
        </label>

        <p class="limit-helper">
          AI가 증액을 추천할 때도 이 한도를 초과하지 않아요.
        </p>
        <p
          v-if="frequency === 'WEEKLY'"
          class="monthly-conversion"
        >
          월 환산 투자금 {{ formatWon(monthlyEquivalentAmount) }}
        </p>
        <p
          v-if="validationMessage"
          class="form-warning"
          role="alert"
        >
          {{ validationMessage }}
        </p>
      </section>

      <section class="form-card investment-info-card">
        <header class="card-heading">
          <h2>연결 증권 계좌</h2>
          <p>연결된 증권 계좌를 선택해주세요</p>
        </header>

        <label class="choice-row account-choice">
          <span class="choice-icon choice-icon--account">
            <img
              :src="monthlyInvestmentIcon"
              alt=""
            >
          </span>
          <span class="choice-copy">
            <strong>{{ accountLabel }}</strong>
            <small>{{
              selectedAccount?.accountNumberMasked ||
                selectedAccount?.accountNumber ||
                '연결된 계좌'
            }}</small>
          </span>
          <select
            v-model="brokerageAccountId"
            aria-label="연결한 증권 계좌"
          >
            <option
              v-if="!accounts.length"
              :value="null"
              disabled
            >
              연결된 계좌가 없어요
            </option>
            <option
              v-for="account in accounts"
              :key="account.id"
              :value="account.id"
            >
              {{ account.accountName || account.institutionName }}
            </option>
          </select>
          <span
            class="choice-chevron"
            aria-hidden="true"
          >›</span>
        </label>

        <h3 class="product-title">
          투자 상품
        </h3>
        <label class="choice-row product-choice">
          <span class="choice-icon choice-icon--product">📈</span>
          <span class="choice-copy">
            <strong>{{ investmentProductName }}</strong>
          </span>
          <select
            v-model="investmentProductCode"
            aria-label="투자 상품"
          >
            <option
              v-for="product in productOptions"
              :key="product.code"
              :value="product.code"
            >
              {{ product.name }}
            </option>
          </select>
          <span
            class="choice-chevron"
            aria-hidden="true"
          >›</span>
        </label>
        <p class="investment-policy">
          실제 주문 방식과 동의 절차는 증권사 정책을 따릅니다.
        </p>
      </section>

      <p
        v-if="saveError"
        class="save-error"
        role="alert"
      >
        {{ saveError }}
      </p>
      <button
        class="submit-button"
        type="submit"
        :disabled="!canSubmit"
      >
        {{ isEdit ? '이대로 적립계획 수정하기' : '이대로 적립계획 설정하기' }}
      </button>
    </form>

    <div
      v-if="confirmOpen || isSaving"
      class="modal-backdrop"
      :class="{ 'modal-backdrop--sheet': isEdit && !isSaving }"
    >
      <section
        v-if="isSaving"
        class="creating-screen"
        aria-live="polite"
      >
        <header class="creating-screen__heading">
          <p v-if="nickname">
            {{ nickname }}님을 위한
          </p>
          <h2>적립식 투자 가이드를<br>만들고있어요</h2>
        </header>

        <span class="creating-screen__visual">
          <img
            :src="aiRecommendationBot"
            alt=""
            aria-hidden="true"
          >
        </span>

        <p class="creating-screen__note">
          가이드 생성까지<br>1분정도 소요돼요
        </p>
      </section>

      <section
        v-else
        class="confirm-sheet"
        :class="{ 'confirm-sheet--edit': isEdit }"
      >
        <button
          class="sheet-close"
          type="button"
          aria-label="닫기"
          @click="confirmOpen = false"
        >
          ×
        </button>
        <h2>설정한 월 적립 계획</h2>
        <p>이대로 적립 계획을 설정할까요?</p>
        <dl>
          <div>
            <dt>📅 투자 기간</dt>
            <dd>{{ scheduleLabel }}</dd>
          </div>
          <div>
            <dt>💰 회차별 투자금</dt>
            <dd>{{ formatWon(contributionAmount) }}</dd>
          </div>
          <div>
            <dt>💰 월 투자 한도</dt>
            <dd>{{ formatWon(maximumMonthlyAmount) }}</dd>
          </div>
          <div>
            <dt>🪪 연결한 증권 계좌</dt>
            <dd>{{ accountLabel }}</dd>
          </div>
          <div>
            <dt>📈 투자 상품</dt>
            <dd>{{ investmentProductName }}</dd>
          </div>
        </dl>
        <button
          class="confirm-button"
          type="button"
          @click="submitPlan"
        >
          이대로 적립계획 설정하기
        </button>
        <button
          class="reset-button"
          type="button"
          @click="confirmOpen = false"
        >
          다시 설정할래요
        </button>
      </section>
    </div>
  </section>
</template>

<style scoped>
.plan-setup {
  padding: 14px 20px calc(var(--page-bottom-navigation-space) + 28px);
  background: #f6f6f6;
}

.plan-form {
  display: grid;
  gap: 18px;
}

.form-card {
  padding: 22px 20px 24px;
  border-radius: 28px;
  background: #fff;
  box-shadow: 0 10px 28px rgb(51 51 51 / 3%);
}

.card-heading h2,
.product-title {
  margin: 0;
  color: #333;
  font-size: 14px;
  font-weight: 700;
  line-height: 1.4;
}

.plan-settings-card .card-heading h2 {
  color: #757575;
}

.investment-info-card .card-heading h2 {
  color: #757575;
}

.investment-info-card .product-title {
  color: #757575;
}

.card-heading p {
  margin: 3px 0 0;
  color: #888;
  font-size: 11px;
  font-weight: 700;
  line-height: 1.4;
}

.period-tabs {
  display: grid;
  grid-template-columns: 1fr 1fr;
  height: 44px;
  gap: 3px;
  margin-top: 13px;
  padding: 3px;
  border-radius: 15px;
  background: #ededed;
}

.period-tabs button {
  border: 0;
  border-radius: 12px;
  background: transparent;
  color: #9e9e9e;
  font-size: 13px;
  font-weight: 700;
}

.period-tabs button.active {
  background: #fff;
  color: #333;
  box-shadow: 0 2px 7px rgb(0 0 0 / 9%);
}

.period-helper {
  margin: 5px 10px 0;
  color: #22c76e;
  font-size: 12px;
  line-height: 1.5;
}

.field-block {
  display: grid;
  gap: 8px;
  margin-top: 14px;
}

.field-block > span:first-child {
  color: #656565;
  font-size: 12px;
  font-weight: 700;
}

.weekday-picker {
  display: flex;
  height: 54px;
  align-items: center;
  gap: 12px;
  border-radius: 18px;
  padding: 0 18px;
  background: #f4f4f4;
}

.weekday-prefix {
  flex: 0 0 auto;
  color: #333;
  font-size: 13px;
  font-weight: 700;
  word-break: keep-all;
}

.weekday-options {
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: flex-end;
  gap: 0;
}

.weekday-chip {
  display: grid;
  width: 26px;
  height: 26px;
  place-items: center;
  border: 0;
  border-radius: 50%;
  padding: 0;
  background: transparent;
  color: #b0b0b0;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
}

.weekday-chip.active {
  background: #d9f7e3;
  color: #22c76e;
}

.select-shell,
.amount-input {
  position: relative;
  display: flex;
  height: 54px;
  align-items: center;
  border-radius: 18px;
  background: #f4f4f4;
}

.day-picker {
  position: relative;
}

.schedule-select {
  width: 100%;
  border: 0;
  border-radius: 20px;
  padding: 0 48px 0 18px;
  cursor: pointer;
  font-family: inherit;
  text-align: left;
}

.schedule-select__value {
  color: #b0b0b0;
  font-size: 13px;
  font-weight: 700;
  word-break: keep-all;
}

.schedule-select--touched .schedule-select__value {
  color: #7c8e77;
  font-size: 16px;
}

.day-picker__backdrop {
  position: fixed;
  z-index: 10;
  inset: 0;
}

.day-grid {
  position: absolute;
  z-index: 11;
  top: calc(100% + 8px);
  right: 0;
  left: 0;
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 6px;
  border-radius: 18px;
  padding: 14px;
  background: #fff;
  box-shadow: 0 12px 28px rgb(0 0 0 / 12%);
}

.day-cell {
  display: grid;
  height: 30px;
  place-items: center;
  border: 0;
  border-radius: 50%;
  background: transparent;
  color: #757575;
  cursor: pointer;
  font-family: inherit;
  font-size: 12px;
  font-weight: 700;
}

.day-cell.active {
  background: #d9f7e3;
  color: #22c76e;
}

.schedule-select .calendar-icon {
  position: absolute;
  top: 50%;
  right: 17px;
  width: 18px;
  height: 20px;
  transform: translateY(-50%);
  pointer-events: none;
}

.amount-input {
  padding: 0 18px;
}

.amount-input input {
  width: 100%;
  min-width: 0;
  border: 0;
  outline: 0;
  background: transparent;
  color: #7c8e77;
  font-size: 16px;
  font-weight: 700;
}

.amount-input input::placeholder {
  color: #bdbdbd;
  font-size: 14px;
  opacity: 1;
}

.amount-input em {
  flex: 0 0 auto;
  color: #656565;
  font-size: 12px;
  font-weight: 700;
  font-style: normal;
}

.limit-helper,
.investment-policy {
  margin: 10px 10px 0;
  color: #8c8c8c;
  font-size: 12px;
  line-height: 1.45;
}

.monthly-conversion {
  margin: 8px 10px 0;
  color: #757575;
  font-size: 10px;
  text-align: right;
}

.investment-info-card {
  padding-bottom: 22px;
}

.choice-row {
  position: relative;
  display: grid;
  min-height: 80px;
  align-items: center;
  grid-template-columns: 48px minmax(0, 1fr) 14px;
  gap: 10px;
  margin-top: 13px;
  padding: 0 16px;
  overflow: hidden;
  border-radius: 18px;
}

.account-choice {
  background: linear-gradient(110deg, #f8fffb 0%, #dcffea 55%, #ccf7dc 100%);
}

.product-title {
  margin-top: 14px;
}

.product-choice {
  min-height: 54px;
  margin-top: 10px;
  background: #f4f4f4;
  grid-template-columns: 24px minmax(0, 1fr) 14px;
}

.product-choice .choice-copy strong {
  font-weight: 500;
}

.choice-icon {
  display: grid;
  width: 42px;
  height: 42px;
  place-items: center;
  border-radius: 50%;
  background: linear-gradient(160deg, #21dd79, #62ff9c);
  color: #fff;
  font-size: 20px;
  font-weight: 800;
  box-shadow: 0 5px 13px rgb(34 211 117 / 24%);
}

.choice-icon img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.choice-icon--account {
  background: none;
  box-shadow: none;
}

.choice-icon--product {
  width: 22px;
  height: 22px;
  border-radius: 5px;
  background: linear-gradient(145deg, #f6fbff 10%, #cbe8fa 100%);
  color: #f16c75;
  font-size: 15px;
  box-shadow: none;
}

.choice-copy {
  display: grid;
  min-width: 0;
  gap: 3px;
}

.choice-copy strong {
  overflow: hidden;
  color: #555;
  font-size: 13px;
  font-weight: 700;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.choice-copy small {
  color: #8c8c8c;
  font-size: 10px;
}

.choice-chevron {
  color: #bdbdbd;
  font-size: 25px;
  font-weight: 300;
  line-height: 1;
}

.choice-row select {
  position: absolute;
  z-index: 1;
  inset: 0;
  width: 100%;
  height: 100%;
  cursor: pointer;
  opacity: 0;
}

.form-warning,
.save-error {
  margin: 10px 0 0;
  color: #e45f48;
  font-size: 11px;
  font-weight: 600;
  text-align: center;
}

.save-error {
  margin: -4px 0;
}

.submit-button,
.confirm-button {
  width: 100%;
  height: 50px;
  border: 0;
  border-radius: 28px;
  background: #62ff9c;
  color: #333;
  font-size: 15px;
  font-weight: 700;
}
.submit-button:disabled {
  background: #ececec;
  color: #bdbdbd;
}
.modal-backdrop {
  position: fixed;
  z-index: 100;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow-y: auto;
  margin: 0 auto;
  padding: 20px 0;
  background: rgb(0 0 0 / 42%);
}

/* 모달을 모바일 프레임 폭에 맞춰 시트의 좌우 여백을 20px로 고정한다. */
@media (min-width: 600px) {
  .modal-backdrop {
    max-width: var(--design-mobile-width);
  }
}

.modal-backdrop--sheet {
  align-items: flex-end;
  padding: 0;
}
.confirm-sheet {
  position: relative;
  width: calc(100% - 40px);
  margin: auto 0;
  padding: 34px 20px 24px;
  border-radius: 50px;
  background: #fff;
  text-align: center;
}
.confirm-sheet--edit {
  width: 100%;
  max-width: 393px;
  border-radius: 50px 50px 0 0;
}
.sheet-close {
  position: absolute;
  top: 18px;
  right: 22px;
  border: 0;
  background: transparent;
  color: #333;
  font-size: 28px;
  font-weight: 300;
}
.confirm-sheet h2 {
  margin: 8px 0 4px;
  color: #333;
  font-size: 20px;
  text-align: left;
  word-break: keep-all;
}
.confirm-sheet > p {
  margin: 0 0 18px;
  color: #757575;
  font-size: 13px;
  text-align: left;
  word-break: keep-all;
}
.confirm-sheet dl {
  margin: 0 0 20px;
  text-align: left;
}
.confirm-sheet dl div {
  display: grid;
  grid-template-columns: 1fr 1fr;
  min-height: 44px;
  align-items: center;
  border-bottom: 1px solid #ececec;
}
.confirm-sheet dt {
  color: #333;
  font-size: 12px;
  font-weight: 700;
}
.confirm-sheet dd {
  margin: 0;
  overflow: hidden;
  color: #757575;
  font-size: 13px;
  font-weight: 600;
  text-align: right;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.reset-button {
  margin-top: 13px;
  border: 0;
  background: transparent;
  color: #bdbdbd;
  font-size: 14px;
}
.creating-screen {
  position: relative;
  display: flex;
  width: calc(100% - 40px);
  flex-direction: column;
  align-items: center;
  margin: auto 0;
  padding: 46px 24px 40px;
  border-radius: 50px;
  background: #fff;
  text-align: center;
}
.creating-screen__heading p {
  margin: 0 0 6px;
  color: #8c8c8c;
  font-size: 14px;
  font-weight: 600;
  word-break: keep-all;
}
.creating-screen__heading h2 {
  margin: 0;
  color: #333;
  font-size: 21px;
  font-weight: 700;
  line-height: 1.4;
  word-break: keep-all;
}
.creating-screen__visual {
  position: relative;
  display: grid;
  width: 190px;
  height: 190px;
  margin: 18px 0 6px;
  place-items: center;
}
.creating-screen__visual::before {
  content: '';
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: radial-gradient(
    circle at 42% 42%,
    rgb(98 255 156 / 90%) 0%,
    rgb(168 255 138 / 62%) 40%,
    rgb(232 255 168 / 30%) 60%,
    rgb(255 255 255 / 0%) 72%
  );
  filter: blur(4px);
  animation: creating-pulse 2.6s ease-in-out infinite;
}
.creating-screen__visual img {
  position: relative;
  width: 108px;
  height: auto;
}
.creating-screen__note {
  margin: 0;
  color: #b0b0b0;
  font-size: 14px;
  line-height: 1.6;
  word-break: keep-all;
}
@keyframes creating-pulse {
  0%,
  100% {
    opacity: 0.85;
    transform: scale(0.96);
  }
  50% {
    opacity: 1;
    transform: scale(1.04);
  }
}
</style>
