<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import DailyReportBanner from '@/features/dashboard/components/DailyReportBanner.vue'
import DashboardAssetSwitcher from '@/features/dashboard/components/DashboardAssetSwitcher.vue'
import EventAddModal from '@/features/dashboard/components/EventAddModal.vue'
import FinancialDdayCard from '@/features/dashboard/components/FinancialDdayCard.vue'
import MissionListSheet from '@/features/dashboard/components/MissionListSheet.vue'
import TodayMissionCard from '@/features/dashboard/components/TodayMissionCard.vue'
import UpcomingEventsCard from '@/features/dashboard/components/UpcomingEventsCard.vue'
import VacationBudgetCard from '@/features/dashboard/components/VacationBudgetCard.vue'
import VacationBudgetSheet from '@/features/dashboard/components/VacationBudgetSheet.vue'
import { useDashboard } from '@/features/dashboard/composables/useDashboard'
import { useUpcomingEvents } from '@/features/dashboard/composables/useUpcomingEvents'
import { getTodayMissions } from '@/features/missions/api/missions.api'
import { findMissionRoute } from '@/features/missions/constants/missionActionRoutes'
import { isMissionCompleted } from '@/features/missions/utils/missionStatus'
import { transactionResponses } from '@/features/dashboard/mocks/dashboard.mock'
import { useVacationBudget } from '@/features/leave-mode/composables/useVacationBudget'
import { useLeaveModeSchedule } from '@/features/leave-mode/composables/useLeaveModeSchedule'
import { getTransactions } from '@/features/transactions/api/transactions.api'

const route = useRoute()
const router = useRouter()
const showEventModal = ref(false)
const showMissionSheet = ref(false)
const liveMissions = ref([])
const showBudgetSheet = ref(false)
const vacationSpentAmount = ref(0)
const vacationSpendingLoading = ref(false)
const { mode } = useLeaveModeSchedule()
const isVacationMode = computed(() => mode.value === 'vacation')
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
const activeVacation = computed(() => {
  const today = new Date()
  const todayString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
  const vacationEvents = upcomingEvents.value.filter(
    (event) => event.eventType === 'VACATION' || event.autoVacationMode,
  )

  return (
    vacationEvents.find((event) => {
      const startDate = event.startDate || event.date
      const endDate = event.endDate || startDate
      return startDate <= todayString && todayString <= endDate
    }) ??
    [...vacationEvents].sort((first, second) =>
      String(second.endDate || second.startDate).localeCompare(
        String(first.endDate || first.startDate),
      ),
    )[0] ??
    null
  )
})
const { budget: vacationBudget, setBudget: setVacationBudget } = useVacationBudget(activeVacation)
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

function isVacationExpense(transaction, vacation) {
  const transactionDate = String(transaction.transactionDate || '').slice(0, 10)
  const startDate = vacation.startDate || vacation.date
  const endDate = vacation.endDate || startDate
  return (
    String(transaction.transactionType).toUpperCase() === 'EXPENSE' &&
    startDate <= transactionDate &&
    transactionDate <= endDate
  )
}

watch(
  activeVacation,
  async (vacation) => {
    if (!vacation) {
      vacationSpentAmount.value = 0
      return
    }

    vacationSpendingLoading.value = true
    try {
      const usesMockScenario = Boolean(route.query.persona || route.query.scenario)
      const transactions = usesMockScenario
        ? transactionResponses
        : await getTransactions({
            startDate: vacation.startDate || vacation.date,
            endDate: vacation.endDate || vacation.startDate || vacation.date,
          })
      vacationSpentAmount.value = transactions
        .filter((transaction) => isVacationExpense(transaction, vacation))
        .reduce((total, transaction) => total + Math.abs(Number(transaction.amount || 0)), 0)
    } catch {
      vacationSpentAmount.value = transactionResponses
        .filter((transaction) => isVacationExpense(transaction, vacation))
        .reduce((total, transaction) => total + Math.abs(Number(transaction.amount || 0)), 0)
    } finally {
      vacationSpendingLoading.value = false
    }
  },
  { immediate: true },
)

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

function saveBudget(amount) {
  setVacationBudget(amount)
  showBudgetSheet.value = false
}

function deleteBudget() {
  setVacationBudget(null)
  showBudgetSheet.value = false
}

function openVacationTransactions() {
  if (!activeVacation.value) return
  const vacation = activeVacation.value
  router.push({
    name: 'transactions',
    query: {
      ...route.query,
      period: 'vacation',
      startDate: vacation.startDate || vacation.date,
      endDate: vacation.endDate || vacation.startDate || vacation.date,
      vacationTitle: vacation.title || '휴가',
    },
  })
}
</script>

<template>
  <main
    class="dashboard screen content-screen app-page"
    :class="{ 'dashboard--vacation': isVacationMode }"
  >
    <DailyReportBanner
      v-bind="dashboardData.dailyReport"
      :variant="isVacationMode ? 'vacation' : 'military'"
      :greeting="isVacationMode ? '휴가 5일차' : dashboardData.dailyReport.greeting"
      title="오늘의 AI 시장 리포트"
    />

    <VacationBudgetCard
      v-if="isVacationMode && activeVacation"
      :spent-amount="vacationSpentAmount"
      :budget="vacationBudget"
      :loading="vacationSpendingLoading"
      @edit="showBudgetSheet = true"
      @view-transactions="openVacationTransactions"
    />

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

    <VacationBudgetSheet
      v-if="showBudgetSheet"
      :model-value="vacationBudget"
      @close="showBudgetSheet = false"
      @save="saveBudget"
      @delete="deleteBudget"
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

.dashboard--vacation {
  background: transparent;
}

@media (max-width: 350px) {
  .dashboard__quick-cards {
    grid-template-columns: 1fr;
  }
}
</style>
