<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

import DailyReportBanner from '@/features/dashboard/components/DailyReportBanner.vue'
import DashboardAssetSwitcher from '@/features/dashboard/components/DashboardAssetSwitcher.vue'
import EventAddModal from '@/features/dashboard/components/EventAddModal.vue'
import FinancialDdayCard from '@/features/dashboard/components/FinancialDdayCard.vue'
import TodayMissionCard from '@/features/dashboard/components/TodayMissionCard.vue'
import UpcomingEventsCard from '@/features/dashboard/components/UpcomingEventsCard.vue'
import { useUpcomingEvents } from '@/features/dashboard/composables/useUpcomingEvents'
import { dashboardMock } from '@/features/dashboard/mocks/dashboard.mock'

const router = useRouter()
const showEventModal = ref(false)
const { events: upcomingEvents, addEvent } = useUpcomingEvents()

function saveEvent(event) {
  addEvent(event)
  showEventModal.value = false
}
</script>

<template>
  <main class="dashboard screen content-screen app-page">
    <DailyReportBanner v-bind="dashboardMock.dailyReport" />

    <FinancialDdayCard v-bind="dashboardMock.financialDday" />

    <div class="dashboard__quick-cards">
      <UpcomingEventsCard
        :events="upcomingEvents"
        :remaining-count="Math.max(0, upcomingEvents.length - 2)"
        @add="showEventModal = true"
        @show-more="router.push({ name: 'upcoming-events' })"
      />
      <TodayMissionCard
        :missions="dashboardMock.missions"
        :remaining-count="Math.max(0, dashboardMock.missions.length - 2)"
        @show-more="router.push({ name: 'challenge' })"
      />
    </div>

    <DashboardAssetSwitcher
      :monthly="dashboardMock.assetSummary.monthly"
      :forecast="dashboardMock.assetSummary.forecast"
      @view-report="router.push({ name: 'monthly-asset-report' })"
    />

    <EventAddModal
      v-if="showEventModal"
      @close="showEventModal = false"
      @save="saveEvent"
    />
  </main>
</template>

<style scoped>
.dashboard {
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: var(--dashboard-gap);
  background:
    radial-gradient(circle at 94% 78%, rgb(98 255 156 / 35%), transparent 36%),
    radial-gradient(circle at 0% 88%, rgb(255 229 114 / 50%), transparent 42%), var(--ui-background);
}

.dashboard__quick-cards {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--dashboard-gap);
}

@media (max-width: 350px) {
  .dashboard__quick-cards {
    grid-template-columns: 1fr;
  }
}
</style>
