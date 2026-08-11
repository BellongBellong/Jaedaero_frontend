<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import DailyReportBanner from '@/features/dashboard/components/DailyReportBanner.vue'
import DashboardAssetSwitcher from '@/features/dashboard/components/DashboardAssetSwitcher.vue'
import EventAddModal from '@/features/dashboard/components/EventAddModal.vue'
import FinancialDdayCard from '@/features/dashboard/components/FinancialDdayCard.vue'
import MissionListSheet from '@/features/dashboard/components/MissionListSheet.vue'
import TodayMissionCard from '@/features/dashboard/components/TodayMissionCard.vue'
import UpcomingEventsCard from '@/features/dashboard/components/UpcomingEventsCard.vue'
import { useDashboard } from '@/features/dashboard/composables/useDashboard'
import { useUpcomingEvents } from '@/features/dashboard/composables/useUpcomingEvents'
import { getTodayMissions } from '@/features/missions/api/missions.api'
import { findMissionRoute } from '@/features/missions/constants/missionActionRoutes'
import { isMissionCompleted } from '@/features/missions/utils/missionStatus'

const route = useRoute()
const router = useRouter()
const showEventModal = ref(false)
const showMissionSheet = ref(false)
const liveMissions = ref([])
const dashboardOptions = computed(() => {
  const persona = Array.isArray(route.query.persona) ? route.query.persona[0] : route.query.persona
  const scenario = Array.isArray(route.query.scenario)
    ? route.query.scenario[0]
    : route.query.scenario
  return { persona, scenario }
})
const { dashboard: dashboardData } = useDashboard(dashboardOptions)
const personaEvents = computed(() => dashboardData.value.events)
const { events: upcomingEvents, addEvent } = useUpcomingEvents(personaEvents)
const allMissions = computed(() =>
  liveMissions.value.length ? liveMissions.value : dashboardData.value.missions,
)
const todayMissions = computed(() =>
  allMissions.value.filter((mission) => mission.missionGroup === 'TODAY'),
)

function normalizeMission(mission) {
  const category = String(mission.missionCategory || mission.missionGroup || '').toUpperCase()
  const missionGroup = ['RECOMMENDED', 'PERSONALIZED', 'TODAY'].includes(category)
    ? 'TODAY'
    : ['EVENT', 'CONDITIONAL', 'ONE_TIME'].includes(category)
      ? 'EVENT'
      : 'DAILY'

  return {
    ...mission,
    id: mission.id ?? mission.missionId,
    missionId: mission.missionId ?? mission.id,
    missionGroup,
    missionType: mission.missionType || 'COMMON',
    completed: isMissionCompleted(mission),
  }
}

onMounted(async () => {
  try {
    const response = await getTodayMissions()
    const missions = response?.data ?? response
    liveMissions.value = (Array.isArray(missions) ? missions : missions?.missions || []).map(
      normalizeMission,
    )
  } catch {
    liveMissions.value = []
  }
})

function saveEvent(event) {
  addEvent(event)
  showEventModal.value = false
}

function openMission(mission) {
  const routeName = findMissionRoute(mission.actionType)
  if (!routeName) return

  router.push({
    name: routeName,
    query: { missionId: mission.missionId ?? mission.id },
  })
}
</script>

<template>
  <main class="dashboard screen content-screen app-page">
    <DailyReportBanner v-bind="dashboardData.dailyReport" />

    <FinancialDdayCard v-bind="dashboardData.financialDday" />

    <div class="dashboard__quick-cards">
      <UpcomingEventsCard
        :events="upcomingEvents"
        :remaining-count="Math.max(0, upcomingEvents.length - 2)"
        @add="showEventModal = true"
        @show-more="router.push({ name: 'upcoming-events' })"
      />
      <TodayMissionCard
        :missions="todayMissions"
        @mission-click="openMission"
        @show-all="showMissionSheet = true"
      />
    </div>

    <DashboardAssetSwitcher
      :monthly="dashboardData.assetSummary.monthly"
      :total-assets="dashboardData.assetSummary.total"
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
      :missions="allMissions"
      @close="showMissionSheet = false"
      @mission-click="openMission"
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
