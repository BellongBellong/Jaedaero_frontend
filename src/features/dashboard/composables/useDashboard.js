import { computed, ref, toValue, watch } from 'vue'

import { getAccounts } from '@/features/accounts/api/accounts.api'
import { getDashboard } from '@/features/dashboard/api/dashboard.api'
import { mapDashboardResponse } from '@/features/dashboard/mappers/dashboardResponse.mapper'
import { getDashboardMock } from '@/features/dashboard/mocks/dashboard.mock'
import { getTodayMarketReport } from '@/features/market-report/api/marketReport.api'
import { getTodayMissions } from '@/features/missions/api/missions.api'
import { isSecuritiesAccount } from '@/features/accounts/composables/institutionMapping'

function normalizeMissions(response) {
  const value = response?.data ?? response
  const missions = Array.isArray(value)
    ? value
    : Array.isArray(value?.missions)
      ? value.missions
      : Array.isArray(value?.content)
        ? value.content
        : []

  return missions.map((mission) => {
    const category = String(
      mission.missionGroup ?? mission.missionCategory ?? 'TODAY',
    ).toUpperCase()
    const missionGroup = ['RECOMMENDED', 'PERSONALIZED', 'TODAY'].includes(category)
      ? 'TODAY'
      : ['EVENT', 'CONDITIONAL', 'ONE_TIME'].includes(category)
        ? 'EVENT'
        : 'DAILY'

    const originalTitle = mission.title ?? mission.missionTitle ?? mission.name ?? '미션'
    const title = /데일리\s*(금융|시장)\s*리포트/.test(originalTitle)
      ? '오늘의 AI 시장리포트'
      : originalTitle

    return {
      ...mission,
      id: mission.id ?? mission.missionId,
      title,
      description: mission.description ?? mission.missionDescription ?? '',
      missionGroup,
      missionType: mission.missionType || 'COMMON',
      completed:
        mission.completed ??
        mission.isCompleted ??
        ['COMPLETED', 'DONE'].includes(String(mission.status || '').toUpperCase()),
    }
  })
}

function emptyDashboardModel() {
  return {
    response: {},
    dailyReport: {
      title: '오늘의 AI 시장 리포트',
      date: '',
    },
    financialDday: {
      financialDday: null,
      actualDday: null,
      financialDischargeDate: null,
      actualDischargeDate: null,
      differenceDays: null,
      achievementRate: 0,
      currentAsset: 0,
      expectedAsset: 0,
      targetAmount: 0,
    },
    missions: [],
    events: [],
    assetSummary: {
      monthly: {
        income: {
          amount: 0,
          salaryAmount: 0,
          salaryLabel: '이번 달 수입',
          otherIncomeAmount: 0,
          hasAdditionalIncome: false,
          changeRate: 0,
        },
        investment: {
          hasSecuritiesAccount: false,
          amount: 0,
          changeAmount: 0,
          changeRate: 0,
          holdings: [],
          monthlyPaymentTarget: 0,
          goalAchievementRate: 0,
        },
        spending: { amount: 0, targetAmount: 0, goalAchievementRate: 0 },
      },
      total: { totalAsset: 0, accounts: [] },
      forecast: { totalAmount: 0, labels: [], expected: [], target: [] },
    },
  }
}

export function useDashboard(options) {
  const dashboard = ref(emptyDashboardModel())
  const loading = ref(true)
  const error = ref(null)
  const source = ref('mock')

  const mockOptions = computed(() => toValue(options) ?? {})
  const usesMockScenario = computed(() =>
    Boolean(mockOptions.value.persona || mockOptions.value.scenario),
  )

  async function load() {
    error.value = null

    if (usesMockScenario.value) {
      dashboard.value = getDashboardMock(mockOptions.value)
      source.value = 'mock'
      loading.value = false
      return
    }

    loading.value = true

    try {
      const [dashboardResult, accountsResult, reportResult, missionsResult] =
        await Promise.allSettled([
          getDashboard(),
          getAccounts(),
          getTodayMarketReport(),
          getTodayMissions(),
        ])

      if (dashboardResult.status === 'rejected') throw dashboardResult.reason

      const model = mapDashboardResponse(dashboardResult.value, emptyDashboardModel())
      const accounts = accountsResult.status === 'fulfilled' ? accountsResult.value : []
      const report =
        reportResult.status === 'fulfilled'
          ? (reportResult.value?.data ?? reportResult.value)
          : null

      model.events = []
      model.missions =
        missionsResult.status === 'fulfilled' ? normalizeMissions(missionsResult.value) : []
      model.dailyReport = {
        title: report?.title || '오늘의 AI 시장 리포트',
        date: report?.reportDate || '',
      }
      model.assetSummary.total.accounts = accounts.map((account) => ({
        ...account,
        name: account.accountName,
        amount: account.balance,
      }))
      model.assetSummary.monthly.investment.hasSecuritiesAccount =
        accounts.some(isSecuritiesAccount)

      dashboard.value = model
      source.value = 'api'
    } catch (requestError) {
      error.value = requestError
      source.value = 'error'
    } finally {
      loading.value = false
    }
  }

  watch(mockOptions, load, { immediate: true })

  return {
    dashboard,
    error,
    loading,
    source,
    reload: load,
  }
}
