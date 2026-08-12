<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import DailyReportBanner from '@/features/dashboard/components/DailyReportBanner.vue'
import DashboardAssetSwitcher from '@/features/dashboard/components/DashboardAssetSwitcher.vue'
import DashboardSkeleton from '@/features/dashboard/components/DashboardSkeleton.vue'
import EventAddModal from '@/features/dashboard/components/EventAddModal.vue'
import FinancialDdayCard from '@/features/dashboard/components/FinancialDdayCard.vue'
import MissionListSheet from '@/features/dashboard/components/MissionListSheet.vue'
import TodayMissionCard from '@/features/dashboard/components/TodayMissionCard.vue'
import UpcomingEventsCard from '@/features/dashboard/components/UpcomingEventsCard.vue'
import VacationBudgetCard from '@/features/dashboard/components/VacationBudgetCard.vue'
import VacationBudgetSheet from '@/features/dashboard/components/VacationBudgetSheet.vue'
import { useDashboard } from '@/features/dashboard/composables/useDashboard'
import { useUpcomingEvents } from '@/features/dashboard/composables/useUpcomingEvents'
import { useVacationBudget } from '@/features/leave-mode/composables/useVacationBudget'
import { useLeaveModeSchedule } from '@/features/leave-mode/composables/useLeaveModeSchedule'
import { getTransactions } from '@/features/transactions/api/transactions.api'

const route = useRoute()
const router = useRouter()
const showEventModal = ref(false)
const showMissionSheet = ref(false)
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
const {
  dashboard: dashboardData,
  error: dashboardError,
  loading: dashboardLoading,
  reload: reloadDashboard,
} = useDashboard(dashboardOptions)
const personaEvents = computed(() => dashboardData.value.events)
const { events: upcomingEvents, addEvent } = useUpcomingEvents(personaEvents)
const activeVacation = computed(() => {
  const currentDate = new Date()
  const today = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`
  return (
    upcomingEvents.value.find((event) => {
      if (!(event.eventType === 'VACATION' || event.autoVacationMode)) return false
      const start = event.startDate || event.date
      const end = event.endDate || start
      return start <= today && today <= end
    }) ||
    (isVacationMode.value ? { id: 'manual-vacation', startDate: today, endDate: today } : null)
  )
})
const { budget: vacationBudget, setBudget: setVacationBudget } = useVacationBudget(activeVacation)
const todayMissions = computed(() =>
  dashboardData.value.missions.filter((mission) =>
    ['TODAY', 'RECOMMENDED'].includes(mission.missionGroup),
  ),
)
const marketReportMission = computed(() =>
  dashboardData.value.missions.find(
    (mission) =>
      ['VIEW_AI_REPORT', 'VIEW_FINANCE_REPORT'].includes(mission.actionType) ||
      /AI.*시장.*리포트|시장.*리포트|데일리.*리포트/.test(mission.title || ''),
  ),
)
const reportVisible = computed(() => !marketReportMission.value?.completed)
const reportRoute = computed(() => ({
  name: 'ai-financial-report',
  query: marketReportMission.value?.id ? { missionId: marketReportMission.value.id } : {},
}))

watch(
  activeVacation,
  async (vacation) => {
    vacationSpentAmount.value = 0
    if (!vacation || vacation.id === 'manual-vacation') return

    vacationSpendingLoading.value = true
    try {
      const startDate = vacation.startDate || vacation.date
      const endDate = vacation.endDate || startDate
      const transactions = await getTransactions({ startDate, endDate })
      vacationSpentAmount.value = transactions
        .filter((transaction) => String(transaction.transactionType).toUpperCase() === 'EXPENSE')
        .reduce((total, transaction) => total + Math.abs(Number(transaction.amount || 0)), 0)
    } catch {
      vacationSpentAmount.value = 0
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

function saveBudget(amount) {
  setVacationBudget(amount)
  showBudgetSheet.value = false
}
</script>

<template>
  <main
    class="dashboard screen content-screen app-page"
    :class="{ 'dashboard--vacation': isVacationMode }"
  >
    <DashboardSkeleton
      v-if="dashboardLoading"
      :variant="isVacationMode ? 'vacation' : 'military'"
    />

    <section
      v-else-if="dashboardError"
      class="dashboard-state dashboard-state--error"
      role="alert"
    >
      <strong>대시보드 정보를 불러오지 못했어요.</strong>
      <p>{{ dashboardError.response?.data?.message || '잠시 후 다시 시도해주세요.' }}</p>
      <button
        type="button"
        @click="reloadDashboard"
      >
        다시 시도
      </button>
    </section>

    <template v-else>
      <DailyReportBanner
        v-if="reportVisible"
        v-bind="dashboardData.dailyReport"
        :to="reportRoute"
        :variant="isVacationMode ? 'vacation' : 'military'"
        :greeting="
          isVacationMode ? '즐거운 휴가 보내고 계신가요?' : dashboardData.dailyReport.greeting
        "
      />

      <VacationBudgetCard
        v-if="isVacationMode"
        :spent-amount="vacationSpentAmount"
        :budget="vacationBudget"
        :loading="vacationSpendingLoading"
        @edit="showBudgetSheet = true"
        @view-transactions="
          router.push({ name: 'transactions', query: { ...route.query, period: 'vacation' } })
        "
      />

      <FinancialDdayCard v-bind="dashboardData.financialDday" />

      <div class="dashboard__quick-cards">
        <UpcomingEventsCard
          :events="upcomingEvents"
          :remaining-count="Math.max(0, upcomingEvents.length - 2)"
          :can-add="true"
          @add="showEventModal = true"
          @show-more="router.push({ name: 'upcoming-events' })"
        />
        <TodayMissionCard
          :missions="todayMissions"
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
    </template>

    <EventAddModal
      v-if="showEventModal"
      @close="showEventModal = false"
      @save="saveEvent"
    />

    <MissionListSheet
      v-if="showMissionSheet"
      :missions="dashboardData.missions"
      @close="showMissionSheet = false"
      @view-progress="router.push({ name: 'challenge' })"
    />

    <VacationBudgetSheet
      v-if="showBudgetSheet"
      :model-value="vacationBudget"
      @close="showBudgetSheet = false"
      @save="saveBudget"
      @delete="saveBudget(null)"
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

.dashboard-state {
  display: grid;
  min-height: 320px;
  padding: var(--space-24);
  border-radius: var(--dashboard-card-radius);
  background: rgb(255 255 255 / 72%);
  color: var(--gray-600);
  place-content: center;
  justify-items: center;
  text-align: center;
}

.dashboard-state--error {
  gap: var(--space-8);
}

.dashboard-state--error strong {
  color: var(--gray-900);
  font-size: var(--body-body-large-bold-font-size);
}

.dashboard-state--error button {
  margin-top: var(--space-12);
  padding: var(--space-10) var(--space-20);
  border: 0;
  border-radius: var(--radius-lg);
  background: var(--green-700);
  color: var(--white);
  font-weight: 700;
}

@media (max-width: 350px) {
  .dashboard__quick-cards {
    grid-template-columns: 1fr;
  }
}
</style>
