<script setup>
import MonthlyAssetOverview from '@/features/dashboard/components/MonthlyAssetOverview.vue'
import { dashboardMock } from '@/features/dashboard/mocks/dashboard.mock'
</script>

<template>
  <main class="monthly-asset-report screen app-page">
    <section class="monthly-asset-report__card">
      <h1>이번 달 자산 현황</h1>
      <MonthlyAssetOverview
        :data="dashboardMock.assetSummary.monthly"
        :show-report-link="false"
      />
    </section>
  </main>
</template>

<style scoped>
.monthly-asset-report__card {
  padding: 22px 20px;
  border-radius: 28px;
  background: var(--white);
}

.monthly-asset-report h1 {
  margin: 0 0 18px;
  color: var(--gray-900);
  font-size: 18px;
}
</style>
