<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import CommonTabs from '../../../common/components/navigation/CommonTabs.vue'
import DropdownMenu from '../../../common/components/forms/DropdownMenu.vue'
import { getAccounts } from '@/features/accounts/api/accounts.api'
import { getDashboardMock, transactionResponses } from '@/features/dashboard/mocks/dashboard.mock'
import { useMissionCompletion } from '@/features/missions/composables/useMissionCompletion'
import AccountTransactionItem from '@/features/transactions/components/AccountTransactionItem.vue'
import {
  getSecuritiesTransactions,
  getTransactions,
} from '@/features/transactions/api/transactions.api'

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
const usesMockScenario = computed(() => Boolean(route.query.persona || route.query.scenario))
const loadedTransactions = ref(usesMockScenario.value ? transactionResponses : [])
const connectedAccounts = ref([])
const loading = ref(!usesMockScenario.value)
const loadError = ref(null)
const syncSentinel = ref(null)
const syncing = ref(false)
const syncStatus = ref('idle')
const syncAttempted = ref(false)
const hasUserScrolled = ref(false)
let syncObserver
const dashboard = computed(() => {
  const persona = Array.isArray(route.query.persona) ? route.query.persona[0] : route.query.persona
  const scenario = Array.isArray(route.query.scenario)
    ? route.query.scenario[0]
    : route.query.scenario
  return getDashboardMock({ persona, scenario })
})
function isInvestmentAccount(account) {
  const accountType = String(account.accountType || account.type || '').toUpperCase()
  const businessType = String(account.businessType || '').toUpperCase()
  return (
    businessType === 'ST' ||
    ['INVESTMENT', 'SECURITIES', 'SECURITY'].includes(accountType) ||
    /증권|투자/.test(
      String(account.institutionName || account.bankName || account.accountName || ''),
    )
  )
}

const investmentAccounts = computed(() => {
  const accounts = usesMockScenario.value
    ? (dashboard.value.assetSummary.total.accounts ?? [])
    : connectedAccounts.value
  return accounts.filter(isInvestmentAccount)
})
const investmentAccountIds = computed(
  () => new Set(investmentAccounts.value.map((account) => String(account.id ?? account.accountId))),
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

function requestRange() {
  if (isVacationPeriod.value) {
    return { startDate: route.query.startDate, endDate: route.query.endDate }
  }
  return route.query.period === 'month' ? monthRange() : {}
}

function mergeTransactions(...transactionGroups) {
  const transactionMap = new Map()
  transactionGroups.flat().forEach((transaction) => {
    const key = String(
      transaction.id ??
        transaction.transactionId ??
        `${transaction.accountId}-${transaction.transactionDate}-${transaction.amount}`,
    )
    transactionMap.set(key, transaction)
  })
  return [...transactionMap.values()]
}

async function loadLiveTransactions({ refresh = false } = {}) {
  const range = requestRange()
  const [accounts, regularTransactions] = await Promise.all([
    getAccounts({ params: { refresh } }),
    getTransactions(range),
  ])
  connectedAccounts.value = accounts

  const securitiesResults = await Promise.allSettled(
    accounts
      .filter(isInvestmentAccount)
      .map((account) =>
        getSecuritiesTransactions(account.accountId ?? account.id, { ...range, refresh }),
      ),
  )
  const securitiesTransactions = securitiesResults
    .filter(({ status }) => status === 'fulfilled')
    .flatMap(({ value }) => value)

  loadedTransactions.value = mergeTransactions(regularTransactions, securitiesTransactions)
}

async function syncCodefAssets() {
  if (usesMockScenario.value || syncing.value || syncAttempted.value) return

  syncAttempted.value = true
  syncing.value = true
  syncStatus.value = 'loading'
  try {
    await loadLiveTransactions({ refresh: true })
    syncStatus.value = 'success'
  } catch (error) {
    console.error('CODEF 자산 동기화 실패:', error)
    syncStatus.value = 'error'
  } finally {
    syncing.value = false
  }
}

function trackUserScroll(event) {
  const target = event.target
  const scrollTop = target === document ? window.scrollY : Number(target?.scrollTop || 0)
  if (scrollTop > 24) hasUserScrolled.value = true
}

function observeSyncSentinel() {
  if (!syncSentinel.value || usesMockScenario.value) return
  syncObserver = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting && hasUserScrolled.value) syncCodefAssets()
    },
    { rootMargin: '0px 0px 80px' },
  )
  syncObserver.observe(syncSentinel.value)
}

onMounted(async () => {
  if (!usesMockScenario.value) {
    try {
      await loadLiveTransactions()
    } catch (error) {
      loadError.value = error
      loadedTransactions.value = []
    } finally {
      loading.value = false
    }
  }
  completeMissionAfterLoad()
  window.addEventListener('scroll', trackUserScroll, true)
  await nextTick()
  observeSyncSentinel()
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', trackUserScroll, true)
  syncObserver?.disconnect()
})
</script>

<template>
  <main class="transaction-history screen app-page">
    <p
      v-if="isVacationPeriod"
      class="transaction-history__period"
    >
      {{ vacationPeriodLabel }}
    </p>

    <CommonTabs
      v-model="activeTab"
      :items="tabs"
      aria-label="거래 자산 유형"
    />

    <section class="transaction-history__card">
      <DropdownMenu
        v-model="transactionFilter"
        :options="filterOptions"
        aria-label="거래내역 필터"
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

    <div
      ref="syncSentinel"
      class="transaction-history__sync"
      aria-live="polite"
    >
      <template v-if="syncStatus === 'loading'">
        <span
          class="transaction-history__sync-spinner"
          aria-hidden="true"
        />
        CODEF 자산 정보를 동기화하고 있어요.
      </template>
      <template v-else-if="syncStatus === 'success'">
        최신 자산 정보로 동기화했어요.
      </template>
      <template v-else-if="syncStatus === 'error'">
        자산 정보를 동기화하지 못했어요.
      </template>
    </div>
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

.transaction-history__card {
  min-height: 480px;
  padding: 16px 12px 24px;
  border-radius: 28px;
  background: var(--white);
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

.transaction-history__sync {
  display: flex;
  min-height: 52px;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: var(--gray-500);
  font-size: 12px;
}

.transaction-history__sync-spinner {
  width: 18px;
  height: 18px;
  border: 2px solid var(--green-100);
  border-top-color: var(--green-700);
  border-radius: 50%;
  animation: transaction-sync-spin 0.8s linear infinite;
}

@keyframes transaction-sync-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
