<script setup>
import { ref } from 'vue'

import AssetAccountSummary from '@/features/dashboard/components/AssetAccountSummary.vue'
import MonthlyAssetOverview from '@/features/dashboard/components/MonthlyAssetOverview.vue'

defineProps({
  monthly: {
    type: Object,
    default: null,
  },
  totalAssets: {
    type: Object,
    default: null,
  },
})

defineEmits(['view-report', 'view-assets'])

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
        id="total-assets-tab"
        type="button"
        role="tab"
        :aria-selected="activeTab === 'total'"
        :class="{ 'asset-switcher__tab--active': activeTab === 'total' }"
        @click="activeTab = 'total'"
      >
        나의 총 자산
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
      aria-labelledby="total-assets-tab"
    >
      <AssetAccountSummary
        :data="totalAssets"
        @view-all="$emit('view-assets')"
      />
    </div>
  </section>
</template>

<style scoped>
.asset-switcher {
  width: 100%;
  min-height: 282px;
  padding: var(--dashboard-card-padding);
  border-radius: var(--dashboard-card-radius);
  background: var(--dashboard-card-background);
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

@media (max-width: 350px) {
  .asset-switcher__tabs {
    gap: var(--space-12);
  }

  .asset-switcher__tabs button {
    font-size: 13px;
  }
}
</style>
