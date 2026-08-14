<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import backArrowIcon from '@/assets/icons/backArrowIcon.svg'
import dropdownIcon from '@/assets/icons/dropdownIcon.svg'
import { getDashboardMock, transactionResponses } from '@/features/dashboard/mocks/dashboard.mock'
import { useMissionCompletion } from '@/features/missions/composables/useMissionCompletion'
import AccountTransactionItem from '@/features/transactions/components/AccountTransactionItem.vue'
import TransactionFilterSheet from '@/features/transactions/components/TransactionFilterSheet.vue'
import { getTransactions } from '@/features/transactions/api/transactions.api'

const route = useRoute()
const router = useRouter()
const { completeMissionAfterLoad } = useMissionCompletion(route, router, 'VIEW_TRANSACTION_HISTORY')
const tabs = [
  { value: 'ALL', label: '전체' },
  { value: 'ACCOUNT', label: '계좌' },
  { value: 'INVESTMENT', label: '투자' },
]
const filterOptions = [
  { value: 'ALL', label: '전체' },
  { value: 'INCOME', label: '입금' },
  { value: 'EXPENSE', label: '출금' },
]
const initialType = String(route.query.type || 'ALL').toUpperCase()
const activeTab = ref(String(route.query.tab || 'ALL').toUpperCase())
const transactionFilter = ref(
  filterOptions.some(({ value }) => value === initialType) ? initialType : 'ALL',
)
const filterOpen = ref(false)
const usesMockScenario = computed(() => Boolean(route.query.persona || route.query.scenario))
const loadedTransactions = ref(usesMockScenario.value ? transactionResponses : [])
const loading = ref(!usesMockScenario.value)
const loadError = ref(null)
const dashboard = computed(() => {
  const persona = Array.isArray(route.query.persona) ? route.query.persona[0] : route.query.persona
  const scenario = Array.isArray(route.query.scenario)
    ? route.query.scenario[0]
    : route.query.scenario
  return getDashboardMock({ persona, scenario })
})
const investmentAccountIds = computed(
  () =>
    new Set(
      (dashboard.value.assetSummary.total.accounts ?? [])
        .filter((account) =>
          ['INVESTMENT', 'SECURITIES', 'SECURITY'].includes(
            String(account.accountType || account.type).toUpperCase(),
          ),
        )
        .map((account) => String(account.id ?? account.accountId)),
    ),
)
const activeFilterLabel = computed(
  () => filterOptions.find(({ value }) => value === transactionFilter.value)?.label ?? '전체',
)
const isVacationPeriod = computed(() => route.query.period === 'vacation')
const vacationPeriodLabel = computed(() => {
  if (!isVacationPeriod.value) return ''
  const title = String(route.query.vacationTitle || '휴가')
  const startDate = String(route.query.startDate || '').replaceAll('-', '.')
  const endDate = String(route.query.endDate || route.query.startDate || '').replaceAll('-', '.')
  return `${title} · ${startDate} ~ ${endDate}`
})
const transactions = computed(() => {
  const now = new Date()
  return loadedTransactions.value
    .filter((transaction) => {
      const investment = investmentAccountIds.value.has(String(transaction.accountId))
      if (activeTab.value === 'INVESTMENT') return investment
      if (activeTab.value === 'ACCOUNT') return !investment
      return true
    })
    .filter(
      (transaction) =>
        transactionFilter.value === 'ALL' ||
        String(transaction.transactionType).toUpperCase() === transactionFilter.value,
    )
    .filter((transaction) => {
      if (isVacationPeriod.value) {
        const date = String(transaction.transactionDate || '').slice(0, 10)
        return (
          String(route.query.startDate || '') <= date && date <= String(route.query.endDate || '')
        )
      }
      if (route.query.period !== 'month') return true
      const date = new Date(transaction.transactionDate)
      return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth()
    })
    .sort((a, b) => new Date(b.transactionDate) - new Date(a.transactionDate))
})

function openTransaction(transaction) {
  router.push({
    name: 'transaction-detail',
    params: { transactionId: transaction.id },
    query: route.query,
  })
}

function monthRange() {
  const now = new Date()
  const startDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`
  const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0)
  return {
    startDate,
    endDate: `${endDate.getFullYear()}-${String(endDate.getMonth() + 1).padStart(2, '0')}-${String(endDate.getDate()).padStart(2, '0')}`,
  }
}

onMounted(async () => {
  if (!usesMockScenario.value) {
    try {
      const requestRange = isVacationPeriod.value
        ? { startDate: route.query.startDate, endDate: route.query.endDate }
        : route.query.period === 'month'
          ? monthRange()
          : {}
      loadedTransactions.value = await getTransactions(requestRange)
    } catch (error) {
      loadError.value = error
      loadedTransactions.value = []
    } finally {
      loading.value = false
    }
  }
  completeMissionAfterLoad()
})
</script>

<template>
  <main class="transaction-history screen app-page">
    <header class="transaction-history__header">
      <button
        type="button"
        aria-label="이전 페이지"
        @click="router.back()"
      >
        <img
          :src="backArrowIcon"
          alt=""
          aria-hidden="true"
        >
      </button>
      <div>
        <h1>{{ isVacationPeriod ? '휴가 거래 내역' : '거래 내역' }}</h1>
        <p
          v-if="isVacationPeriod"
          class="transaction-history__period"
        >
          {{ vacationPeriodLabel }}
        </p>
      </div>
    </header>

    <div
      class="transaction-history__tabs"
      role="tablist"
      aria-label="거래 자산 유형"
    >
      <button
        v-for="tab in tabs"
        :key="tab.value"
        type="button"
        role="tab"
        :aria-selected="activeTab === tab.value"
        :class="{ 'transaction-history__tab--active': activeTab === tab.value }"
        @click="activeTab = tab.value"
      >
        {{ tab.label }}
      </button>
    </div>

    <section class="transaction-history__card">
      <button
        class="transaction-history__filter"
        type="button"
        :aria-expanded="filterOpen"
        aria-haspopup="dialog"
        @click="filterOpen = true"
      >
        {{ activeFilterLabel }}
        <img
          :src="dropdownIcon"
          alt=""
          aria-hidden="true"
        >
      </button>

      <p
        v-if="loading"
        aria-live="polite"
      >
        거래 내역을 불러오고 있어요.
      </p>
      <p
        v-else-if="loadError"
        role="alert"
      >
        거래 내역을 불러오지 못했어요.
      </p>
      <ul v-else-if="transactions.length">
        <AccountTransactionItem
          v-for="transaction in transactions"
          :key="transaction.id"
          :transaction="transaction"
          @select="openTransaction"
        />
      </ul>
      <p v-else>
        표시할 거래 내역이 없어요.
      </p>
    </section>

    <TransactionFilterSheet
      v-if="filterOpen"
      v-model="transactionFilter"
      :options="filterOptions"
      @close="filterOpen = false"
    />
  </main>
</template>

<style scoped>
.transaction-history {
  min-height: 100%;
  background: var(--ui-background);
}

.transaction-history__header {
  display: flex;
  align-items: center;
  gap: 10px;
}

.transaction-history__header button {
  display: grid;
  width: 32px;
  height: 40px;
  padding: 0;
  border: 0;
  background: transparent;
  cursor: pointer;
  place-items: center;
}

.transaction-history__header img {
  width: 10px;
  height: 17px;
}

.transaction-history__header h1 {
  margin: 0;
  color: var(--gray-900);
  font-family: var(--body-heading-h5-bold-font-family, 'Pretendard-Bold', sans-serif);
  font-size: var(--body-heading-h5-bold-font-size, 20px);
  font-weight: var(--body-heading-h5-bold-font-weight, 700);
  line-height: var(--body-heading-h5-bold-line-height, 150%);
}

.transaction-history__period {
  margin: 1px 0 0;
  color: var(--gray-500);
  font-size: 12px;
  line-height: 1.4;
}

.transaction-history__tabs {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  margin: 4px 0 12px;
}

.transaction-history__tabs button {
  height: 52px;
  padding: 0;
  border: 0;
  border-bottom: 2px solid transparent;
  background: transparent;
  color: var(--gray-400);
  cursor: pointer;
  font: inherit;
  font-size: 14px;
  font-weight: 700;
}

.transaction-history__tabs .transaction-history__tab--active {
  border-bottom-color: var(--green-700);
  color: var(--green-700);
}

.transaction-history__card {
  min-height: 480px;
  padding: 16px 12px 24px;
  border-radius: 28px;
  background: var(--white);
}

.transaction-history__filter {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 36px;
  padding: 0 10px;
  border: 0;
  background: transparent;
  color: var(--gray-600);
  cursor: pointer;
  font: inherit;
  font-size: 14px;
  font-weight: 700;
}

.transaction-history__filter img {
  width: 8px;
  height: 7px;
  object-fit: contain;
}

.transaction-history__card ul {
  display: grid;
  gap: 2px;
  padding: 0;
  margin: 4px 0 0;
  list-style: none;
}

.transaction-history__card > p {
  display: grid;
  min-height: 240px;
  margin: 0;
  color: var(--gray-400);
  font-size: 14px;
  place-items: center;
}
</style>
