<script setup>
import { onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import arrowIcon from '@/assets/icons/arrow.svg'
import AccountTitleHeader from '@/features/dashboard/components/AccountTitleHeader.vue'
import AssetAccountCard from '@/features/dashboard/components/AssetAccountCard.vue'
import MonthlyAssetOverview from '@/features/dashboard/components/MonthlyAssetOverview.vue'
import { useDashboard } from '@/features/dashboard/composables/useDashboard'
import { useMissionCompletion } from '@/features/missions/composables/useMissionCompletion'

const route = useRoute()
const router = useRouter()
const { completeMissionAfterLoad } = useMissionCompletion(route, router)
const { dashboard, loading, error, reload } = useDashboard()

function formatWon(value) {
  return `${Number(value || 0).toLocaleString('ko-KR')}원`
}

onMounted(() => {
  completeMissionAfterLoad()
})
</script>

<template>
  <main class="asset-overview screen app-page">
    <section
      v-if="loading"
      class="asset-overview__state"
    >
      자산 정보를 불러오고 있어요.
    </section>
    <section
      v-else-if="error"
      class="asset-overview__state asset-overview__state--error"
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
          @click="router.push({ name: 'transactions', query: route.query })"
        >
          전체 내역 보기
          <img
            :src="arrowIcon"
            alt=""
            aria-hidden="true"
          >
        </button>
      </section>
    </template>
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

.asset-overview__state {
  padding: var(--space-24);
  border-radius: 28px;
  background: var(--white);
  color: var(--gray-600);
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
