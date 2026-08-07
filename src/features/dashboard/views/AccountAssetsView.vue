<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import arrowIcon from '@/assets/icons/arrow.svg'
import backArrowIcon from '@/assets/icons/backArrowIcon.svg'
import AssetAccountListItem from '@/features/dashboard/components/AssetAccountListItem.vue'
import InvestmentAssetChart from '@/features/dashboard/components/InvestmentAssetChart.vue'
import InvestmentHoldingsList from '@/features/dashboard/components/InvestmentHoldingsList.vue'
import { getDashboardMock } from '@/features/dashboard/mocks/dashboard.mock'

const route = useRoute()
const router = useRouter()
const activeTab = ref('account')
const dashboard = computed(() => {
  const persona = Array.isArray(route.query.persona) ? route.query.persona[0] : route.query.persona
  const scenario = Array.isArray(route.query.scenario)
    ? route.query.scenario[0]
    : route.query.scenario
  return getDashboardMock({ persona, scenario })
})
const accounts = computed(() => dashboard.value.assetSummary.total.accounts ?? [])

function accountType(account) {
  return String(account.accountType || account.type || '').toUpperCase()
}

const checkingAccounts = computed(() =>
  accounts.value.filter((account) =>
    ['CHECKING', 'SALARY', 'ACCOUNT', 'ASSET'].includes(accountType(account)),
  ),
)
const savingsAccounts = computed(() =>
  accounts.value.filter((account) =>
    ['MILITARY_SAVINGS', 'SAVINGS', 'INSTALLMENT_SAVINGS'].includes(accountType(account)),
  ),
)
const investmentAccounts = computed(() =>
  accounts.value.filter((account) =>
    ['INVESTMENT', 'SECURITIES', 'SECURITY'].includes(accountType(account)),
  ),
)
const investmentSummary = computed(() => dashboard.value.assetSummary.monthly.investment ?? {})

function sumAccounts(items) {
  return items.reduce((total, account) => total + Number(account.amount ?? account.balance ?? 0), 0)
}

function formatWon(value) {
  return `${Number(value || 0).toLocaleString('ko-KR')}원`
}

function openAccount(account) {
  router.push({
    name: 'account-transactions',
    params: { accountId: account.id ?? account.accountId },
    query: route.query,
  })
}
</script>

<template>
  <main class="account-assets screen app-page">
    <button
      class="account-assets__back"
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

    <button
      class="account-assets__total"
      type="button"
      @click="router.push({ name: 'asset-overview', query: route.query })"
    >
      <span>총 자산</span>
      <strong>{{ formatWon(dashboard.assetSummary.total.totalAsset) }}</strong>
      <img
        :src="arrowIcon"
        alt=""
        aria-hidden="true"
      >
    </button>

    <div
      class="account-assets__tabs"
      role="tablist"
      aria-label="자산 유형"
    >
      <button
        type="button"
        role="tab"
        :aria-selected="activeTab === 'account'"
        :class="{ 'account-assets__tab--active': activeTab === 'account' }"
        @click="activeTab = 'account'"
      >
        계좌
      </button>
      <button
        type="button"
        role="tab"
        :aria-selected="activeTab === 'investment'"
        :class="{ 'account-assets__tab--active': activeTab === 'investment' }"
        @click="activeTab = 'investment'"
      >
        투자
      </button>
    </div>

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
            clickable
            @select="openAccount"
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
            clickable
            @select="openAccount"
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
        <strong>{{ formatWon(sumAccounts(investmentAccounts)) }}</strong>
      </header>
      <ul v-if="investmentAccounts.length">
        <AssetAccountListItem
          v-for="account in investmentAccounts"
          :key="account.id || account.accountId"
          :account="account"
          clickable
          @select="openAccount"
        />
      </ul>
      <p v-else>
        연결된 투자 계좌가 없어요.
      </p>

      <template v-if="investmentAccounts.length">
        <h2 class="account-assets__chart-title">
          투자 현황
        </h2>
        <InvestmentAssetChart
          :amount="sumAccounts(investmentAccounts)"
          :change-amount="investmentSummary.changeAmount"
          :change-rate="investmentSummary.changeRate"
          :history="investmentSummary.history"
        />
        <h2 class="account-assets__chart-title">
          보유 상품
        </h2>
        <InvestmentHoldingsList :holdings="investmentSummary.holdings" />
      </template>
    </section>
  </main>
</template>

<style scoped>
.account-assets {
  display: flex;
  flex-direction: column;
  gap: 14px;
  background: var(--ui-background);
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
  width: fit-content;
  align-items: center;
  gap: 4px;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--gray-600);
  cursor: pointer;
  font-family: var(--font-body);
  font-size: 14px;
}

.account-assets__total strong {
  color: var(--green-700);
  font-size: 16px;
}

.account-assets__total img {
  width: 7px;
  height: 11px;
  margin-left: 2px;
}

.account-assets__tabs {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
}

.account-assets__tabs button {
  min-height: 42px;
  border: 0;
  border-bottom: 2px solid transparent;
  background: transparent;
  color: var(--gray-400);
  cursor: pointer;
  font-family: var(--font-body);
  font-size: 14px;
  font-weight: var(--weight-bold);
}

.account-assets__tabs .account-assets__tab--active {
  border-bottom-color: var(--green-700);
  color: var(--green-700);
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

.account-assets__chart-title {
  margin: 8px 0 0;
  color: var(--gray-600);
  font-size: 16px;
  line-height: 1.5;
}
</style>
