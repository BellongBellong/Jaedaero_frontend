<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import airForceCharacter from '../../../assets/character/airForce.png'
import armyCharacter from '../../../assets/character/army.png'
import marineCharacter from '../../../assets/character/marineCorps.png'
import navyCharacter from '../../../assets/character/navy.png'
import DailyReportBanner from '@/features/dashboard/components/DailyReportBanner.vue'
import DashboardAssetSwitcher from '@/features/dashboard/components/DashboardAssetSwitcher.vue'
import DashboardSkeleton from '@/features/dashboard/components/DashboardSkeleton.vue'
import EventAddModal from '@/features/dashboard/components/EventAddModal.vue'
import FinancialDdayCard from '@/features/dashboard/components/FinancialDdayCard.vue'
import MissionListSheet from '@/features/dashboard/components/MissionListSheet.vue'
import TodayMissionCard from '@/features/dashboard/components/TodayMissionCard.vue'
import TodayMilitaryBenefits from '@/features/dashboard/components/TodayMilitaryBenefits.vue'
import UpcomingEventsCard from '@/features/dashboard/components/UpcomingEventsCard.vue'
import VacationBudgetCard from '@/features/dashboard/components/VacationBudgetCard.vue'
import VacationBudgetSheet from '@/features/dashboard/components/VacationBudgetSheet.vue'
import { useDashboard } from '@/features/dashboard/composables/useDashboard'
import { useUpcomingEvents } from '@/features/dashboard/composables/useUpcomingEvents'
import { benefitExamples } from '@/features/benefits/mocks/benefits.mock'
import { normalizeBenefits, selectDailyBenefits } from '@/features/benefits/utils/benefitMapper'
import { findMissionRoute } from '@/features/missions/constants/missionActionRoutes'
import { useMissionStore } from '@/features/missions/stores/mission.store'
import { isMissionCompleted } from '@/features/missions/utils/missionStatus'
import { useMyPageStore } from '@/features/my-page/stores/my-page.store'
import { transactionResponses } from '@/features/dashboard/mocks/dashboard.mock'
import { useVacationBudget } from '@/features/leave-mode/composables/useVacationBudget'
import { useLeaveModeSchedule } from '@/features/leave-mode/composables/useLeaveModeSchedule'
import { useTransactionsStore } from '@/features/transactions/stores/transactions.store'

const route = useRoute()
const router = useRouter()
const missionStore = useMissionStore()
const myPageStore = useMyPageStore()
const transactionsStore = useTransactionsStore()
const showEventModal = ref(false)
const showMissionSheet = ref(false)
const liveMissions = computed(() => missionStore.missions.map(normalizeMission))
const showBudgetSheet = ref(false)
const vacationSpentAmount = ref(0)
const vacationSpendingLoading = ref(false)
const militaryBenefits = ref([])
const benefitsLoading = ref(false)
const dashboardCharacterImage = ref(armyCharacter)
const characterImages = {
  ARMY: armyCharacter,
  NAVY: navyCharacter,
  AIRFORCE: airForceCharacter,
  MARINE: marineCharacter,
}
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
const allMissions = computed(() =>
  liveMissions.value.length ? liveMissions.value : dashboardData.value.missions,
)
const todayMissions = computed(() =>
  allMissions.value.filter((mission) => ['TODAY', 'RECOMMENDED'].includes(mission.missionGroup)),
)
const marketReportMission = computed(() =>
  allMissions.value.find(
    (mission) =>
      ['VIEW_AI_REPORT', 'VIEW_FINANCE_REPORT', 'VIEW_MARKET_REPORT'].includes(
        mission.actionType,
      ) || /AI.*시장.*리포트|시장.*리포트|데일리.*리포트/.test(mission.title || ''),
  ),
)
const reportVisible = computed(() => !marketReportMission.value?.completed)
const reportRoute = computed(() => ({
  name: 'ai-financial-report',
  query: marketReportMission.value?.id ? { missionId: marketReportMission.value.id } : {},
}))

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
    await missionStore.loadTodayMissions()
  } catch {
    missionStore.reset()
  }
})

onMounted(async () => {
  try {
    await myPageStore.load()
    const profile = myPageStore.profile
    const profileCode = String(profile?.profileImage || 'ARMY')
      .replace(/^profile-/i, '')
      .replace(/^character-/i, '')
      .replace(/\.[^.]+$/, '')
      .replace(/[-_\s]/g, '')
      .toUpperCase()

    dashboardCharacterImage.value = characterImages[profileCode] || armyCharacter
  } catch {
    dashboardCharacterImage.value = armyCharacter
  }
})

watch(
  isVacationMode,
  (vacationMode) => {
    if (!vacationMode || militaryBenefits.value.length) return

    benefitsLoading.value = true
    militaryBenefits.value = selectDailyBenefits(normalizeBenefits(benefitExamples), 4)
    benefitsLoading.value = false
  },
  { immediate: true },
)

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
    vacationSpentAmount.value = 0
    if (!vacation || vacation.id === 'manual-vacation') return

    vacationSpendingLoading.value = true
    try {
      const startDate = vacation.startDate || vacation.date
      const endDate = vacation.endDate || startDate
      const usesMockScenario = Boolean(route.query.persona || route.query.scenario)
      const transactions = usesMockScenario
        ? transactionResponses
        : await transactionsStore.load({ startDate, endDate }, { force: true })
      vacationSpentAmount.value = transactions
        .filter((transaction) => isVacationExpense(transaction, vacation))
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
      />

      <VacationBudgetCard
        v-if="isVacationMode"
        :spent-amount="vacationSpentAmount"
        :budget="vacationBudget"
        :loading="vacationSpendingLoading"
        @edit="showBudgetSheet = true"
        @view-transactions="openVacationTransactions"
      />

      <TodayMilitaryBenefits
        v-if="isVacationMode"
        :benefits="militaryBenefits"
        :loading="benefitsLoading"
        @select="(benefit) => router.push({ name: 'benefits', query: { benefitId: benefit.id } })"
        @view-all="router.push({ name: 'benefits' })"
      />

      <FinancialDdayCard
        v-bind="dashboardData.financialDday"
        :character-image="dashboardCharacterImage"
      />

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
        @view-income="
          router.push({
            name: 'transactions',
            query: { ...route.query, period: 'month', type: 'INCOME' },
          })
        "
        @view-investment="
          router.push({
            name: 'transactions',
            query: { ...route.query, period: 'month', tab: 'INVESTMENT' },
          })
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
