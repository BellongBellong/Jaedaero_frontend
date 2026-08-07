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
const copied = ref(false)
const filterOpen = ref(false)
const transactionFilter = ref('ALL')
const filterOptions = [
  { value: 'ALL', label: '전체' },
  { value: 'INCOME', label: '입금' },
  { value: 'EXPENSE', label: '출금' },
]
const dashboard = computed(() => {
  const persona = Array.isArray(route.query.persona) ? route.query.persona[0] : route.query.persona
  const scenario = Array.isArray(route.query.scenario)
    ? route.query.scenario[0]
    : route.query.scenario
  return getDashboardMock({ persona, scenario })
})
const account = computed(() =>
  (dashboard.value.assetSummary.total.accounts ?? []).find(
    (item) => String(item.id ?? item.accountId) === String(route.params.accountId),
  ),
)
const accountTransactions = computed(() =>
  transactionResponses
    .filter((transaction) => String(transaction.accountId) === String(route.params.accountId))
    .filter(
      (transaction) =>
        transactionFilter.value === 'ALL' ||
        String(transaction.transactionType).toUpperCase() === transactionFilter.value,
    )
    .sort((a, b) => new Date(b.transactionDate) - new Date(a.transactionDate)),
)
const activeFilterLabel = computed(
  () => filterOptions.find(({ value }) => value === transactionFilter.value)?.label ?? '전체',
)
const accountName = computed(() => account.value?.accountName || account.value?.name || '계좌 상세')
const accountNumber = computed(
  () => account.value?.accountNumber || account.value?.accountNumberMasked || '계좌번호 정보 없음',
)
const accountBalance = computed(() =>
  Number(account.value?.amount ?? account.value?.balance ?? 0).toLocaleString('ko-KR'),
)

async function copyAccountNumber() {
  if (!account.value) return
  try {
    await navigator.clipboard.writeText(accountNumber.value.replaceAll(' ', ''))
    copied.value = true
    window.setTimeout(() => {
      copied.value = false
    }, 1600)
  } catch {
    copied.value = false
  }
}

function openTransaction(transaction) {
  router.push({
    name: 'transaction-detail',
    params: { transactionId: transaction.id },
    query: route.query,
  })
}
</script>

<template>
  <main class="account-detail screen app-page">
    <header class="account-detail__header">
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
      <h1>{{ accountName }}</h1>
    </header>

    <section
      v-if="account"
      class="account-detail__summary"
    >
      <button
        type="button"
        :aria-label="`${accountNumber} 계좌번호 복사`"
        @click="copyAccountNumber"
      >
        {{ account.bankName }} {{ accountNumber }}
      </button>
      <span
        v-if="copied"
        role="status"
      >
        계좌번호가 복사됐어요.
      </span>
      <strong>{{ accountBalance }}원</strong>
    </section>

    <section
      v-if="account"
      class="account-detail__transactions"
    >
      <h2>거래 내역</h2>
      <button
        class="account-detail__filter"
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
      <ul v-if="accountTransactions.length">
        <AccountTransactionItem
          v-for="transaction in accountTransactions"
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

    <p
      v-if="!account"
      class="account-detail__not-found"
    >
      계좌 정보를 찾을 수 없어요.
    </p>
  </main>
</template>

<style scoped>
.account-detail {
  display: flex;
  flex-direction: column;
  gap: 20px;
  background: var(--ui-background);
}

.account-detail__header {
  display: grid;
  grid-template-columns: 32px 1fr 32px;
  align-items: center;
}

.account-detail__header button {
  display: grid;
  width: 32px;
  height: 40px;
  padding: 0;
  border: 0;
  background: transparent;
  cursor: pointer;
  place-items: center;
}

.account-detail__header img {
  width: 10px;
  height: 17px;
}

.account-detail__header h1 {
  overflow: hidden;
  margin: 0;
  color: var(--gray-900);
  font-family: var(--body-heading-h5-bold-font-family, 'Pretendard-Bold', sans-serif);
  font-size: var(--body-heading-h5-bold-font-size, 20px);
  font-weight: var(--body-heading-h5-bold-font-weight, 700);
  line-height: var(--body-heading-h5-bold-line-height, 150%);
  text-align: center;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.account-detail__summary {
  display: grid;
  gap: 4px;
}

.account-detail__summary button {
  width: fit-content;
  padding: 0;
  border: 0;
  border-bottom: 1px solid currentcolor;
  background: transparent;
  color: var(--gray-600);
  cursor: copy;
  font-family: var(--font-body);
  font-size: 14px;
}

.account-detail__summary span {
  color: var(--green-700);
  font-size: 11px;
}

.account-detail__summary strong {
  color: var(--gray-900);
  font-size: 24px;
  line-height: 1.5;
}

.account-detail__transactions {
  display: grid;
  gap: 12px;
}

.account-detail__transactions h2 {
  margin: 0;
  color: var(--gray-600);
  font-size: 16px;
  line-height: 1.5;
}

.account-detail__filter {
  display: inline-flex;
  width: fit-content;
  align-items: center;
  padding: 18px 20px 2px;
  border: 0;
  background: transparent;
  color: var(--gray-600);
  cursor: pointer;
  font-family: var(--font-body);
  font-size: 14px;
  font-weight: var(--weight-bold);
}

.account-detail__filter img {
  width: 14px;
  height: 14px;
  margin-left: 6px;
  object-fit: contain;
}

.account-detail__transactions ul {
  padding: 8px 12px 90px;
  margin: 0;
  border-radius: 28px;
  background: var(--white);
  list-style: none;
}

.account-detail__transactions > p,
.account-detail__not-found {
  display: grid;
  min-height: 160px;
  margin: 0;
  border-radius: 28px;
  background: var(--white);
  color: var(--gray-400);
  font-size: 13px;
  place-items: center;
}
</style>
