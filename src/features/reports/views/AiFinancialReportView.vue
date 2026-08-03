<script setup>
import { computed, onMounted, ref } from 'vue'

import { getCashflow } from '@/features/cashflow/api/cashflow.api'
import { getTransactions } from '@/features/transactions/api/transactions.api'

const cashflow = ref(null)
const transactions = ref([])
const loading = ref(true)
const errorMessage = ref('')

const reportDate = computed(() => {
  if (!cashflow.value?.baseDate) return '-'

  const [year, month, day] = cashflow.value.baseDate.split('-')
  return `${year}. ${month}. ${day} 기준`
})

const monthlyExpense = computed(() =>
  transactions.value
    .filter((transaction) => transaction.transactionType === 'EXPENSE')
    .reduce((total, transaction) => total + Number(transaction.amount || 0), 0),
)

const expectedLift = computed(() => {
  const shortfall = Number(cashflow.value?.shortfallAmount || 0)
  return Math.max(8, Math.round(shortfall / 70_000))
})

const marketRows = [
  { label: '코스피', value: '2,740.12', change: '+1.34%', tone: 'positive' },
  { label: '코스닥', value: '860.42', change: '+0.82%', tone: 'positive' },
  { label: '미국채 10년', value: '4.31%', change: '-0.05%', tone: 'negative' },
  { label: '원/달러', value: '1,318원', change: '-0.05%', tone: 'negative' },
]

const productRows = [
  { label: '장병내일준비적금', value: '5.0%', change: '+1.34%', tone: 'positive' },
  { label: '군인공제회 목돈급여', value: '5.2%', change: '+0.1%p', tone: 'positive' },
  { label: '미국채 10년', value: '4.31%', change: '변동없음', tone: 'neutral' },
]

const recommendedActions = computed(() => [
  {
    title: '군인공제회 추가 납입',
    badge: '추천',
    tone: 'positive',
    description: `현재 금리 5.2%를 활용하면 전역 자산이 약 ${expectedLift.value}만원 늘어날 수 있어요.`,
  },
  {
    title: '장병내일준비적금 유지',
    badge: '참고',
    tone: 'neutral',
    description: `목표까지 ${formatTenThousands(cashflow.value?.shortfallAmount)} 남았어요. 우대금리 조건을 유지해보세요.`,
  },
  {
    title: '고정비 플랜 최적화',
    badge: '참고',
    tone: 'neutral',
    description: `이번 달 지출 ${Number(monthlyExpense.value || 0).toLocaleString('ko-KR')}원을 기준으로 반복 지출부터 점검해보세요.`,
  },
])

function formatTenThousands(value) {
  const amount = Number(value || 0)
  return `${Math.round(amount / 10_000).toLocaleString('ko-KR')}만원`
}

onMounted(async () => {
  try {
    const [cashflowResponse, transactionResponse] = await Promise.all([
      getCashflow(),
      getTransactions(),
    ])

    cashflow.value = cashflowResponse
    transactions.value = Array.isArray(transactionResponse) ? transactionResponse : []
  } catch {
    errorMessage.value = '투자 리포트를 불러오지 못했어요. 잠시 후 다시 시도해주세요.'
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <section class="financial-report-screen">
    <p
      v-if="loading"
      class="report-state"
    >
      오늘의 투자 환경을 분석하고 있어요.
    </p>
    <p
      v-else-if="errorMessage"
      class="report-state report-state--error"
    >
      {{ errorMessage }}
    </p>

    <template v-else>
      <article class="report-panel market-panel">
        <header class="report-panel__header">
          <div>
            <div class="report-title-row">
              <h2>오늘의 AI 투자 리포트</h2>
              <span class="beta-badge">BETA</span>
            </div>
            <p>{{ reportDate }}</p>
          </div>
        </header>

        <dl class="data-list">
          <div
            v-for="row in marketRows"
            :key="row.label"
            class="data-list__row"
          >
            <dt>{{ row.label }}</dt>
            <dd>
              <span>{{ row.value }}</span>
              <em :class="`status-pill--${row.tone}`">{{ row.change }}</em>
            </dd>
          </div>
        </dl>
      </article>

      <article class="report-panel product-panel">
        <h2 class="product-panel__title">
          <span aria-hidden="true">🏅</span>
          군 금융 상품 동향
        </h2>

        <dl class="data-list">
          <div
            v-for="row in productRows"
            :key="row.label"
            class="data-list__row"
          >
            <dt>{{ row.label }}</dt>
            <dd>
              <span>{{ row.value }}</span>
              <em :class="`status-pill--${row.tone}`">{{ row.change }}</em>
            </dd>
          </div>
        </dl>
      </article>

      <section
        class="action-section"
        aria-labelledby="action-title"
      >
        <h2 id="action-title">
          AI 추천 액션
        </h2>

        <div class="action-list">
          <article
            v-for="action in recommendedActions"
            :key="action.title"
            class="action-card"
          >
            <span
              class="action-card__icon"
              aria-hidden="true"
            >🏅</span>
            <div>
              <div class="action-card__title-row">
                <h3>{{ action.title }}</h3>
                <span :class="`status-pill--${action.tone}`">{{ action.badge }}</span>
              </div>
              <p>{{ action.description }}</p>
            </div>
          </article>
        </div>
      </section>
    </template>
  </section>
</template>

<style scoped>
.financial-report-screen {
  display: flex;
  min-height: 100%;
  flex-direction: column;
  gap: 10px;
  padding: 10px 20px 40px;
  color: var(--gray-900);
}

.report-state {
  display: grid;
  min-height: 300px;
  place-items: center;
  color: var(--gray-600);
  font-size: 14px;
  text-align: center;
}

.report-state--error {
  color: var(--orange-600);
}

.report-panel {
  padding: 21px;
  border: 1px solid rgb(255 255 255 / 90%);
  border-radius: 24px;
  background: rgb(255 255 255 / 50%);
}

.report-panel__header h2,
.product-panel__title,
.action-section > h2,
.action-card h3 {
  font-family: var(--font-body);
}

.report-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.report-title-row h2 {
  color: var(--gray-600);
  font-size: 14px;
  font-weight: var(--weight-bold);
  line-height: 1.5;
}

.report-panel__header p {
  padding-top: 4px;
  color: #888;
  font-size: 14px;
  line-height: 1.5;
}

.beta-badge,
.status-pill--positive,
.status-pill--negative,
.status-pill--neutral {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 2px 10px;
  border-radius: var(--radius-full);
  font-size: 12px;
  font-style: normal;
  font-weight: var(--weight-bold);
  line-height: 1.5;
  white-space: nowrap;
}

.beta-badge {
  background: var(--olive-100);
  color: var(--olive-500);
}

.status-pill--positive {
  background: var(--green-100);
  color: #22c55e;
}

.status-pill--negative {
  background: var(--orange-50);
  color: var(--orange-600);
}

.status-pill--neutral {
  background: var(--gray-200);
  color: var(--gray-600);
}

.data-list {
  margin-top: 4px;
}

.data-list__row {
  display: flex;
  min-height: 42px;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--ui-light-gray);
  font-size: 12px;
  line-height: 1.5;
}

.data-list__row:last-child {
  border-bottom: 0;
}

.data-list dt {
  font-weight: var(--weight-bold);
}

.data-list dd {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--gray-600);
  font-size: 13px;
  font-weight: var(--weight-semibold);
}

.product-panel__title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: var(--weight-bold);
  line-height: 1.5;
}

.product-panel__title span {
  width: 20px;
  font-size: 18px;
}

.product-panel .data-list {
  margin-top: 12px;
}

.action-section {
  margin-top: 2px;
}

.action-section > h2 {
  font-size: 15px;
  font-weight: var(--weight-bold);
  line-height: 1.5;
}

.action-list {
  display: grid;
  gap: 10px;
  padding-top: 12px;
}

.action-card {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  padding: 17px;
  border: 1px solid rgb(255 255 255 / 80%);
  border-radius: 22px;
  background: var(--white);
  box-shadow: 0 2px 8px rgb(0 0 0 / 5%);
}

.action-card__icon {
  width: 20px;
  padding-top: 2px;
  font-size: 20px;
  line-height: 28px;
}

.action-card > div {
  min-width: 0;
  flex: 1;
}

.action-card__title-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.action-card h3 {
  color: var(--gray-600);
  font-size: 14px;
  font-weight: var(--weight-bold);
  line-height: 1.5;
}

.action-card p {
  padding-top: 4px;
  color: var(--gray-600);
  font-size: 12px;
  line-height: 1.5;
}
</style>
