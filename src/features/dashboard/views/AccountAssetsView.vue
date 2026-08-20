<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

import CommonTabs from '../../../common/components/navigation/CommonTabs.vue'
import AssetAccountListItem from '@/features/dashboard/components/AssetAccountListItem.vue'
import InvestmentAssetChart from '@/features/dashboard/components/InvestmentAssetChart.vue'
import InvestmentHoldingsList from '@/features/dashboard/components/InvestmentHoldingsList.vue'
import { getSecuritiesPortfolio } from '@/features/accounts/api/securitiesPortfolio.api'
import { useDashboard } from '@/features/dashboard/composables/useDashboard'
import { isSecuritiesAccount } from '@/features/accounts/composables/institutionMapping'

const route = useRoute()
const activeTab = ref(route.query.tab === 'investment' ? 'investment' : 'account')
const securitiesPortfolio = ref([])
const portfolioLoading = ref(false)
const portfolioError = ref(false)
const tabs = [
  { value: 'account', label: '계좌' },
  { value: 'investment', label: '투자' },
]
const { dashboard, loading, error, reload } = useDashboard()
const accounts = computed(() => dashboard.value.assetSummary.total.accounts ?? [])

function accountType(account) {
  return String(account.accountType || account.type || '').toUpperCase()
}

const checkingAccounts = computed(() =>
  accounts.value.filter((account) =>
    ['DEMAND_DEPOSIT', 'CHECKING', 'SALARY', 'ACCOUNT', 'ASSET'].includes(accountType(account)),
  ),
)
const savingsAccounts = computed(() =>
  accounts.value.filter((account) =>
    ['MILITARY_SAVINGS', 'SAVINGS', 'INSTALLMENT_SAVINGS'].includes(accountType(account)),
  ),
)
const investmentAccounts = computed(() => accounts.value.filter(isSecuritiesAccount))
const investmentAccountsWithAssets = computed(() =>
  securitiesPortfolio.value.map((account) => ({
    ...account,
    id: account.accountId,
    accountName: account.productName || account.accountMasked || '증권 계좌',
    balance: portfolioAmount(account),
    amount: portfolioAmount(account),
  })),
)
const displayedInvestmentAccounts = computed(() =>
  securitiesPortfolio.value.length ? investmentAccountsWithAssets.value : investmentAccounts.value,
)
const investmentHoldings = computed(() =>
  securitiesPortfolio.value.flatMap((account) => {
    const holdings = account.holdings?.length ? account.holdings : account.stockHoldings || []
    return holdings.map((holding) => ({
      ...holding,
      id: `${account.accountId}-${holding.itemCode || holding.itemName}`,
      name: holding.itemName || '보유 상품',
      quantityLabel: holding.quantity ? `${holding.quantity}주` : '-',
      returnRate: Number(holding.earningsRate || 0),
    }))
  }),
)
const investmentAmount = computed(() => sumAccounts(displayedInvestmentAccounts.value))
const investmentChangeAmount = computed(() =>
  investmentHoldings.value.reduce(
    (total, holding) => total + Number(holding.valuationProfit || 0),
    0,
  ),
)
const investmentChangeRate = computed(() => {
  const principal = investmentAmount.value - investmentChangeAmount.value
  return principal ? (investmentChangeAmount.value / Math.abs(principal)) * 100 : 0
})

watch(
  activeTab,
  async (tab) => {
    if (tab !== 'investment' || portfolioLoading.value) return

    portfolioLoading.value = true
    portfolioError.value = false
    try {
      securitiesPortfolio.value = await getSecuritiesPortfolio()
    } catch {
      securitiesPortfolio.value = []
      portfolioError.value = true
    } finally {
      portfolioLoading.value = false
    }
  },
  { immediate: true },
)

function sumAccounts(items) {
  return items.reduce((total, account) => total + Number(account.amount ?? account.balance ?? 0), 0)
}

function portfolioAmount(account) {
  const holdings = account.holdings?.length ? account.holdings : account.stockHoldings || []
  const holdingsAmount = holdings.reduce(
    (total, holding) => total + Number(holding.valuationAmount || 0),
    0,
  )
  return Number(account.depositAmount || 0) + holdingsAmount
}

function formatWon(value) {
  return `${Number(value || 0).toLocaleString('ko-KR')}원`
}
</script>

<template>
  <main class="account-assets screen app-page">
    <section
      v-if="loading"
      class="account-assets__state"
    >
      자산 정보를 불러오고 있어요.
    </section>
    <section
      v-else-if="error"
      class="account-assets__state account-assets__state--error"
    >
      <p>자산 정보를 불러오지 못했어요.</p>
      <button
        type="button"
        @click="reload"
      >
        다시 시도
      </button>
    </section>

    <template v-else>
      <div class="account-assets__total">
        <span>총 자산</span>
        <strong>{{ formatWon(dashboard.assetSummary.total.totalAsset) }}</strong>
      </div>

      <CommonTabs
        v-model="activeTab"
        :items="tabs"
        aria-label="자산 유형"
      />

      <template v-if="activeTab === 'account'">
        <section class="account-assets__section">
          <header>
            <span>입출금</span>
            <strong>{{ formatWon(sumAccounts(checkingAccounts)) }}</strong>
          </header>
          <ul v-if="checkingAccounts.length">
            <AssetAccountListItem
              v-for="account in checkingAccounts"
              :key="account.id || account.accountId"
              :account="account"
            />
          </ul>
          <p v-else>
            연결된 입출금 계좌가 없어요.
          </p>
        </section>

        <section class="account-assets__section">
          <header>
            <span>저축</span>
            <strong>{{ formatWon(sumAccounts(savingsAccounts)) }}</strong>
          </header>
          <ul v-if="savingsAccounts.length">
            <AssetAccountListItem
              v-for="account in savingsAccounts"
              :key="account.id || account.accountId"
              :account="account"
            />
          </ul>
          <p v-else>
            연결된 적금 계좌가 없어요.
          </p>
        </section>
      </template>

      <section
        v-else
        class="account-assets__section"
      >
        <header>
          <span>투자 자산</span>
          <strong>{{ formatWon(investmentAmount) }}</strong>
        </header>
        <p v-if="portfolioLoading">
          투자 자산을 불러오고 있어요.
        </p>
        <ul v-else-if="displayedInvestmentAccounts.length">
          <AssetAccountListItem
            v-for="account in displayedInvestmentAccounts"
            :key="account.id || account.accountId"
            :account="account"
          />
        </ul>
        <p v-else-if="portfolioError">
          투자 자산을 불러오지 못했어요. 잠시 후 다시 시도해주세요.
        </p>
        <p v-else>
          연결된 투자 계좌가 없어요.
        </p>
        <RouterLink
          v-if="!portfolioLoading && !displayedInvestmentAccounts.length"
          class="account-assets__connect-investment"
          :to="{
            name: 'connect-codef-bank',
            params: { assetType: 'securities' },
            query: { source: 'investment-assets', mode: 'additional' },
          }"
        >
          증권계좌 연결하기
        </RouterLink>

        <template v-if="!portfolioLoading && displayedInvestmentAccounts.length">
          <h2 class="account-assets__chart-title">
            투자 현황
          </h2>
          <InvestmentAssetChart
            :amount="investmentAmount"
            :change-amount="investmentChangeAmount"
            :change-rate="investmentChangeRate"
          />
          <h2 class="account-assets__chart-title">
            보유 상품
          </h2>
          <InvestmentHoldingsList :holdings="investmentHoldings" />
        </template>
      </section>
    </template>
  </main>
</template>

<style scoped>
.account-assets {
  display: flex;
  flex-direction: column;
  gap: 14px;
  background: var(--ui-background);
}

.account-assets__state {
  padding: var(--space-24);
  border-radius: 28px;
  background: var(--white);
  color: var(--gray-600);
}

.account-assets__back {
  display: grid;
  width: 24px;
  height: 32px;
  padding: 0;
  border: 0;
  background: transparent;
  cursor: pointer;
  place-items: center;
}

.account-assets__back img {
  width: 10px;
  height: 17px;
}

.account-assets__total {
  display: flex;
  align-items: center;
  gap: 4px;
  color: var(--gray-600);
  font-size: 14px;
}

.account-assets__total strong {
  color: var(--green-700);
  font-size: 16px;
}

.account-assets__section {
  display: grid;
  gap: 14px;
}

.account-assets__section header {
  display: grid;
  gap: 2px;
}

.account-assets__section header span {
  color: var(--gray-600);
  font-size: 16px;
  line-height: 1.5;
}

.account-assets__section header strong {
  color: var(--gray-900);
  font-size: 24px;
  line-height: 1.5;
}

.account-assets__section ul {
  display: grid;
  gap: 8px;
  padding: 0;
  margin: 0;
  list-style: none;
}

.account-assets__section p {
  display: grid;
  min-height: 90px;
  place-items: center;
  margin: 0;
  border-radius: 20px;
  background: var(--white);
  color: var(--gray-400);
  font-size: 13px;
}

.account-assets__connect-investment {
  display: grid;
  min-height: 52px;
  padding: 0 20px;
  border-radius: 26px;
  background: var(--green-500);
  color: var(--gray-900);
  font-size: 14px;
  font-weight: var(--weight-bold);
  text-decoration: none;
  place-items: center;
}

.account-assets__chart-title {
  margin: 8px 0 0;
  color: var(--gray-600);
  font-size: 16px;
  line-height: 1.5;
}
</style>
