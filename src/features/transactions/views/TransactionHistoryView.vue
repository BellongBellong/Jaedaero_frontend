<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import backArrowIcon from '@/assets/icons/backArrowIcon.svg'
import dropdownIcon from '@/assets/icons/dropdownIcon.svg'
import { getDashboardMock, transactionResponses } from '@/features/dashboard/mocks/dashboard.mock'
import AccountTransactionItem from '@/features/transactions/components/AccountTransactionItem.vue'
import TransactionFilterSheet from '@/features/transactions/components/TransactionFilterSheet.vue'

const route = useRoute()
const router = useRouter()
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
const transactions = computed(() => {
  const now = new Date()
  return transactionResponses
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
      <h1>거래 내역</h1>
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

      <ul v-if="transactions.length">
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
  width: 14px;
  height: 14px;
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
