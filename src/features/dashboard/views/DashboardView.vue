<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import DailyReportBanner from '@/features/dashboard/components/DailyReportBanner.vue'
import DashboardAssetSwitcher from '@/features/dashboard/components/DashboardAssetSwitcher.vue'
import EventAddModal from '@/features/dashboard/components/EventAddModal.vue'
import FinancialDdayCard from '@/features/dashboard/components/FinancialDdayCard.vue'
import MissionListSheet from '@/features/dashboard/components/MissionListSheet.vue'
import TodayMissionCard from '@/features/dashboard/components/TodayMissionCard.vue'
import UpcomingEventsCard from '@/features/dashboard/components/UpcomingEventsCard.vue'
import { useUpcomingEvents } from '@/features/dashboard/composables/useUpcomingEvents'
import { getDashboardMock } from '@/features/dashboard/mocks/dashboard.mock'

const route = useRoute()
const router = useRouter()
const showEventModal = ref(false)
const showMissionSheet = ref(false)
const dashboardMock = computed(() => {
  const persona = Array.isArray(route.query.persona) ? route.query.persona[0] : route.query.persona
  const scenario = Array.isArray(route.query.scenario)
    ? route.query.scenario[0]
    : route.query.scenario
  return getDashboardMock({ persona, scenario })
})
const personaEvents = computed(() => dashboardMock.value.events)
const { events: upcomingEvents, addEvent } = useUpcomingEvents(personaEvents)
const todayMissions = computed(() =>
  dashboardMock.value.missions.filter((mission) => mission.missionGroup === 'TODAY'),
)

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
        :missions="todayMissions"
        @show-all="showMissionSheet = true"
      />
    </div>

    <DashboardAssetSwitcher
      :monthly="dashboardMock.assetSummary.monthly"
      :total-assets="dashboardMock.assetSummary.total"
      @view-report="
        router.push({ name: 'transactions', query: { ...route.query, period: 'month' } })
      "
      @view-spending="
        router.push({
          name: 'transactions',
          query: { ...route.query, period: 'month', type: 'EXPENSE' },
        })
      "
      @view-assets="router.push({ name: 'asset-overview', query: route.query })"
    />

    <EventAddModal
      v-if="showEventModal"
      @close="showEventModal = false"
      @save="saveEvent"
    />

    <MissionListSheet
      v-if="showMissionSheet"
      :missions="dashboardMock.missions"
      @close="showMissionSheet = false"
      @view-progress="router.push({ name: 'challenge' })"
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
