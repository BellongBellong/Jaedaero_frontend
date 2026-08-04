<script setup>
import { computed, onMounted, ref } from 'vue'

import { getDashboard } from '@/features/dashboard/api/dashboard.api'
import DailyReportBanner from '@/features/dashboard/components/DailyReportBanner.vue'
import FinancialDdayCard from '@/features/dashboard/components/FinancialDdayCard.vue'

const dashboard = ref(null)
const loading = ref(true)
const errorMessage = ref('')

const dailyReport = computed(() => ({
  greeting: dashboard.value?.dailyBriefing?.greeting ?? '저녁은 맛있게 드셨나요?',
  title: dashboard.value?.dailyBriefing?.title ?? '오늘의 금융 AI 리포트',
  date: dashboard.value?.dailyBriefing?.date ?? dashboard.value?.asOf ?? '2026-07-29',
}))

const financialCard = computed(() => ({
  financialDday: dashboard.value?.dischargeDday ?? 54,
  actualDday: 60,
  actualDischargeDate: dashboard.value?.actualDischargeDate ?? '2026-09-26',
  differenceDays: dashboard.value?.financialDischargeDifferenceDays ?? 4,
  achievementRate: dashboard.value?.goalAchievementRate ?? 80.2,
  currentAmount: dashboard.value?.projectedAssetAtDischarge ?? 1354,
  netAsset: dashboard.value?.totalAsset ? dashboard.value.totalAsset / 10_000 : 800,
  targetAmount: dashboard.value?.targetAmount ? dashboard.value.targetAmount / 10_000 : 1700,
}))

onMounted(async () => {
  try {
    dashboard.value = await getDashboard()
  } catch {
    errorMessage.value = '대시보드 정보를 불러오지 못했어요.'
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <main class="dashboard screen content-screen app-page">
    <p
      v-if="errorMessage"
      class="dashboard__notice"
    >
      샘플 데이터로 카드를 보여드리고 있어요.
    </p>

    <DailyReportBanner v-bind="dailyReport" />
    <FinancialDdayCard v-bind="financialCard" />
  </main>
</template>

<style scoped>
.dashboard {
  display: flex;
  flex-direction: column;
  gap: 12px;
  background:
    radial-gradient(circle at 94% 78%, rgb(98 255 156 / 35%), transparent 36%),
    radial-gradient(circle at 0% 88%, rgb(255 229 114 / 50%), transparent 42%), var(--ui-background);
}

.dashboard__notice {
  margin: 0;
  color: var(--gray-500);
  font-size: 12px;
  text-align: center;
}
</style>
