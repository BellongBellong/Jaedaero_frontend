<script setup>
import { onMounted, ref } from 'vue'

import AssetAccountSummary from '@/features/dashboard/components/AssetAccountSummary.vue'
import AssetTransactionList from '@/features/dashboard/components/AssetTransactionList.vue'
import { getMockAssetReport } from '@/features/dashboard/mocks/asset-report.mock'

const activeTab = ref('assets')
const report = ref(null)
const loading = ref(true)

onMounted(async () => {
  report.value = await getMockAssetReport()
  loading.value = false
})
</script>

<template>
  <main class="monthly-asset-report screen app-page">
    <section class="monthly-asset-report__card">
      <div
        class="monthly-asset-report__tabs"
        role="tablist"
        aria-label="자산 상세 정보"
      >
        <button
          id="asset-status-tab"
          type="button"
          role="tab"
          :aria-selected="activeTab === 'assets'"
          :class="{ 'monthly-asset-report__tab--active': activeTab === 'assets' }"
          @click="activeTab = 'assets'"
        >
          자산현황
        </button>
        <button
          id="asset-transactions-tab"
          type="button"
          role="tab"
          :aria-selected="activeTab === 'transactions'"
          :class="{ 'monthly-asset-report__tab--active': activeTab === 'transactions' }"
          @click="activeTab = 'transactions'"
        >
          거래내역
        </button>
      </div>

      <p
        v-if="loading"
        class="monthly-asset-report__notice"
      >
        정보를 불러오는 중...
      </p>
      <div
        v-else-if="activeTab === 'assets'"
        role="tabpanel"
        aria-labelledby="asset-status-tab"
      >
        <AssetAccountSummary :data="report?.summary" />
      </div>
      <div
        v-else
        role="tabpanel"
        aria-labelledby="asset-transactions-tab"
      >
        <AssetTransactionList :transactions="report?.transactions ?? []" />
      </div>
    </section>
  </main>
</template>

<style scoped>
.monthly-asset-report__card {
  min-height: 500px;
  padding: 22px 20px;
  border-radius: 28px;
  background: var(--white);
}

.monthly-asset-report__tabs {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  padding: 4px;
  margin-bottom: 22px;
  border-radius: 14px;
  background: var(--ui-background);
}

.monthly-asset-report__tabs button {
  padding: 9px;
  border: 0;
  border-radius: 11px;
  background: transparent;
  color: var(--gray-400);
  cursor: pointer;
  font-size: 14px;
  font-weight: var(--weight-bold);
}

.monthly-asset-report__tabs .monthly-asset-report__tab--active {
  background: var(--white);
  box-shadow: 0 3px 10px rgb(51 51 51 / 7%);
  color: var(--green-700);
}

.monthly-asset-report__notice {
  display: grid;
  min-height: 220px;
  place-items: center;
  margin: 0;
  color: var(--gray-500);
  font-size: 13px;
}
</style>
