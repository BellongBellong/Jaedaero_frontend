<script setup>
import { ref } from 'vue'

import DischargeAssetChart from '@/features/dashboard/components/DischargeAssetChart.vue'
import MonthlyAssetOverview from '@/features/dashboard/components/MonthlyAssetOverview.vue'

defineProps({
  monthly: {
    type: Object,
    default: null,
  },
  forecast: {
    type: Object,
    default: null,
  },
})

defineEmits(['view-report'])

const activeTab = ref('monthly')
</script>

<template>
  <section class="asset-switcher">
    <div
      class="asset-switcher__tabs"
      role="tablist"
      aria-label="자산 정보"
    >
      <button
        id="monthly-assets-tab"
        type="button"
        role="tab"
        :aria-selected="activeTab === 'monthly'"
        :class="{ 'asset-switcher__tab--active': activeTab === 'monthly' }"
        @click="activeTab = 'monthly'"
      >
        이번 달 자산 현황
      </button>
      <button
        id="forecast-assets-tab"
        type="button"
        role="tab"
        :aria-selected="activeTab === 'forecast'"
        :class="{ 'asset-switcher__tab--active': activeTab === 'forecast' }"
        @click="activeTab = 'forecast'"
      >
        전역 예상 자산
      </button>
    </div>

    <div
      v-if="activeTab === 'monthly'"
      role="tabpanel"
      aria-labelledby="monthly-assets-tab"
    >
      <MonthlyAssetOverview
        :data="monthly"
        @view-report="$emit('view-report')"
      />
    </div>
    <div
      v-else
      role="tabpanel"
      aria-labelledby="forecast-assets-tab"
    >
      <DischargeAssetChart :data="forecast" />
    </div>
  </section>
</template>

<style scoped>
.asset-switcher {
  min-height: 282px;
  padding: 20px;
  border-radius: 28px;
  background: var(--white);
}

.asset-switcher__tabs {
  display: flex;
  gap: 18px;
  margin-bottom: 14px;
}

.asset-switcher__tabs button {
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--gray-400);
  cursor: pointer;
  font-size: 14px;
  font-weight: var(--weight-bold);
  line-height: 1.5;
}

.asset-switcher__tabs .asset-switcher__tab--active {
  color: var(--gray-600);
}

.asset-switcher__tabs button:focus-visible {
  border-radius: 4px;
  outline: 2px solid var(--green-700);
  outline-offset: 3px;
}
</style>
