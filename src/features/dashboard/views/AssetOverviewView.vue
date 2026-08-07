<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import arrowIcon from '@/assets/icons/arrow.svg'
import AccountTitleHeader from '@/features/dashboard/components/AccountTitleHeader.vue'
import AssetAccountCard from '@/features/dashboard/components/AssetAccountCard.vue'
import MonthlyAssetOverview from '@/features/dashboard/components/MonthlyAssetOverview.vue'
import { getDashboardMock } from '@/features/dashboard/mocks/dashboard.mock'

const route = useRoute()
const router = useRouter()
const dashboard = computed(() => {
  const persona = Array.isArray(route.query.persona) ? route.query.persona[0] : route.query.persona
  const scenario = Array.isArray(route.query.scenario)
    ? route.query.scenario[0]
    : route.query.scenario
  return getDashboardMock({ persona, scenario })
})

function formatWon(value) {
  return `${Number(value || 0).toLocaleString('ko-KR')}원`
}
</script>

<template>
  <main class="asset-overview screen app-page">
    <AssetAccountCard
      :data="dashboard.assetSummary.total"
      @view-all="router.push({ name: 'account-assets', query: route.query })"
    />

    <section class="asset-overview__monthly-card">
      <AccountTitleHeader
        label="이번 달 쓴 금액"
        :value="formatWon(dashboard.assetSummary.monthly.spending.amount)"
      />
      <MonthlyAssetOverview
        :data="dashboard.assetSummary.monthly"
        :show-report-link="false"
      />
      <button
        class="asset-overview__transactions"
        type="button"
        @click="router.push({ name: 'transactions' })"
      >
        전체 내역 보기
        <img
          :src="arrowIcon"
          alt=""
          aria-hidden="true"
        >
      </button>
    </section>
  </main>
</template>

<style scoped>
.asset-overview {
  display: flex;
  flex-direction: column;
  gap: 10px;
  background: var(--ui-background);
}

.asset-overview__monthly-card {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: var(--space-20);
  border-radius: 28px;
  background: var(--white);
}

.asset-overview__transactions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  align-self: flex-end;
  gap: 5px;
  padding: 2px 0;
  border: 0;
  background: transparent;
  color: var(--gray-400);
  cursor: pointer;
  font-family: var(--font-body);
  font-size: 12px;
}

.asset-overview__transactions img {
  width: 7px;
  height: 11px;
}
</style>
