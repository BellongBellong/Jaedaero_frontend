<script setup>
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import CommonTabs from '@/common/components/common/CommonTabs.vue'
import AssetAccountSummary from '@/features/dashboard/components/AssetAccountSummary.vue'
import AssetTransactionList from '@/features/dashboard/components/AssetTransactionList.vue'
import { getMockAssetReport } from '@/features/dashboard/mocks/asset-report.mock'
import { useMissionCompletion } from '@/features/missions/composables/useMissionCompletion'

const route = useRoute()
const router = useRouter()
const { completeMissionAfterLoad } = useMissionCompletion(route, router)
const activeTab = ref('assets')
const tabs = [
  { value: 'assets', label: '자산현황' },
  { value: 'transactions', label: '거래내역' },
]
const report = ref(null)
const loading = ref(true)

onMounted(async () => {
  report.value = await getMockAssetReport()
  loading.value = false
  await completeMissionAfterLoad()
})
</script>

<template>
  <main class="monthly-asset-report screen app-page">
    <section class="monthly-asset-report__card">
      <CommonTabs
        v-model="activeTab"
        :items="tabs"
        aria-label="자산 상세 정보"
      />

      <p
        v-if="loading"
        class="monthly-asset-report__notice"
      >
        정보를 불러오는 중...
      </p>
      <div
        v-else-if="activeTab === 'assets'"
        role="tabpanel"
        aria-label="자산현황"
      >
        <AssetAccountSummary :data="report?.summary" />
      </div>
      <div
        v-else
        role="tabpanel"
        aria-label="거래내역"
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

.monthly-asset-report__notice {
  display: grid;
  min-height: 220px;
  place-items: center;
  margin: 0;
  color: var(--gray-500);
  font-size: 13px;
}
</style>
