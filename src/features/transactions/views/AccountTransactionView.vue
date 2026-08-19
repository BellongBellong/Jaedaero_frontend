<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import CommonTabs from '../../../common/components/navigation/CommonTabs.vue'
import DropdownMenu from '../../../common/components/forms/DropdownMenu.vue'
import AccountEditPanel from '@/features/accounts/components/AccountEditPanel.vue'
import { getDashboardMock, transactionResponses } from '@/features/dashboard/mocks/dashboard.mock'
import AccountTransactionItem from '@/features/transactions/components/AccountTransactionItem.vue'
import { useTransactionsStore } from '@/features/transactions/stores/transactions.store'

const route = useRoute()
const router = useRouter()
const transactionsStore = useTransactionsStore()
const copied = ref(false)
const activeTab = ref(route.query.tab === 'edit' ? 'EDIT' : 'TRANSACTIONS')
const savedAccountAlias = ref('')
const accountTabs = [
  { value: 'TRANSACTIONS', label: '거래 내역' },
  { value: 'EDIT', label: '계좌 수정' },
]
const usesMockScenario = computed(() => Boolean(route.query.persona || route.query.scenario))
const loadedTransactions = computed(() =>
  usesMockScenario.value ? transactionResponses : transactionsStore.transactions,
)
const loading = ref(!usesMockScenario.value)
const loadError = ref(null)
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
  loadedTransactions.value
    .filter((transaction) => String(transaction.accountId) === String(route.params.accountId))
    .filter(
      (transaction) =>
        transactionFilter.value === 'ALL' ||
        String(transaction.transactionType).toUpperCase() === transactionFilter.value,
    )
    .sort((a, b) => new Date(b.transactionDate) - new Date(a.transactionDate)),
)
const accountName = computed(
  () => savedAccountAlias.value || account.value?.accountName || account.value?.name || '계좌 상세',
)
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

function applySavedAccount(preferences) {
  savedAccountAlias.value = preferences.accountAlias
}

onMounted(async () => {
  await router.replace({
    query: { ...route.query, headerTitle: accountName.value },
  })

  if (usesMockScenario.value) return

  try {
    await transactionsStore.load({ accountId: route.params.accountId }, { force: true })
  } catch (error) {
    loadError.value = error
    transactionsStore.reset()
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <main class="account-detail screen app-page">
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

    <CommonTabs
      v-if="account"
      v-model="activeTab"
      :items="accountTabs"
      aria-label="계좌 상세 메뉴"
    />

    <section
      v-if="account && activeTab === 'TRANSACTIONS'"
      class="account-detail__transactions"
    >
      <h2>거래 내역</h2>
      <DropdownMenu
        v-model="transactionFilter"
        :options="filterOptions"
        aria-label="계좌 거래내역 필터"
      />
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
      <ul v-else-if="accountTransactions.length">
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

    <AccountEditPanel
      v-else-if="account && activeTab === 'EDIT'"
      :account="account"
      @saved="applySavedAccount"
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
