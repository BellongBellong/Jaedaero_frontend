import { ref } from 'vue'
import { defineStore } from 'pinia'

import { getAccounts } from '@/features/accounts/api/accounts.api'
import { isSecuritiesAccount } from '@/features/accounts/composables/institutionMapping'
import { getDashboard } from '@/features/dashboard/api/dashboard.api'
import { getDashboardMock } from '@/features/dashboard/mocks/dashboard.mock'
import { mapDashboardResponse } from '@/features/dashboard/mappers/dashboardResponse.mapper'
import { getTodayMarketReport } from '@/features/market-report/api/marketReport.api'
import { getTodayMissions } from '@/features/missions/api/missions.api'
import { getMyPageProfile } from '@/features/my-page/api/myPage.api'
import { getTransactions } from '@/features/transactions/api/transactions.api'

const TRANSFER_CATEGORIES = new Set(['ASSET', 'ASSET_TRANSFER', 'TRANSFER'])
const RANK_NAME_MAP = {
  PRIVATE: '이병',
  PRIVATE_FIRST_CLASS: '일병',
  CORPORAL: '상병',
  SERGEANT: '병장',
}

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

function formatDate(value) {
  const year = value.getFullYear()
  const month = String(value.getMonth() + 1).padStart(2, '0')
  const day = String(value.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function currentMonthRange(now = new Date()) {
  const start = new Date(now.getFullYear(), now.getMonth(), 1)
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0)
  return { startDate: formatDate(start), endDate: formatDate(end) }
}

function accountId(account) {
  return account?.accountId ?? account?.id
}

function isNaraSarangAccount(account) {
  const name = [account?.accountName, account?.name, account?.productName, account?.accountNumber]
    .filter(Boolean)
    .join(' ')
  return /나라\s*사랑/.test(name)
}

function isIncomeTransaction(transaction) {
  return ['INCOME', 'DEPOSIT'].includes(String(transaction?.transactionType || '').toUpperCase())
}

function monthlyIncomeFromNaraSarangAccount(profile, accounts, transactions, monthlySalary = 0) {
  // Dashboard API calculates the current service-stage salary from the military pay policy.
  // The profile API only provides rank information, so it must not be used as a salary source.
  const salaryAmount = Number(monthlySalary || 0)
  const rank = profile?.rank ?? profile?.soldierProfile?.rank
  const rankName =
    profile?.rankName ??
    profile?.soldierProfile?.rankName ??
    RANK_NAME_MAP[rank] ??
    rank ??
    '이번 달'
  const naraSarangAccount = accounts.find(isNaraSarangAccount)

  if (!naraSarangAccount) {
    return {
      amount: salaryAmount,
      salaryAmount,
      salaryLabel: `${rankName} 월급`,
      otherIncomeAmount: 0,
      hasAdditionalIncome: false,
      changeRate: 0,
    }
  }

  const targetAccountId = String(accountId(naraSarangAccount))
  const otherIncomeAmount = transactions
    .filter((transaction) => String(transaction.accountId) === targetAccountId)
    .filter(isIncomeTransaction)
    .filter((transaction) => {
      const category = String(transaction.category || '').toUpperCase()
      return category !== 'SALARY' && !TRANSFER_CATEGORIES.has(category)
    })
    .reduce((total, transaction) => total + Number(transaction.amount || 0), 0)
  const changeRate =
    salaryAmount > 0 ? Math.round((otherIncomeAmount / salaryAmount) * 1000) / 10 : 0

  return {
    amount: salaryAmount + otherIncomeAmount,
    salaryAmount,
    salaryLabel: `${rankName} 월급`,
    otherIncomeAmount,
    hasAdditionalIncome: otherIncomeAmount > 0,
    changeRate,
  }
}

function emptyDashboardModel() {
  return {
    response: {},
    dailyReport: { title: '오늘의 AI 시장 리포트', date: '' },
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

export const useDashboardStore = defineStore('dashboard', () => {
  const dashboard = ref(emptyDashboardModel())
  const loading = ref(true)
  const error = ref(null)
  const source = ref('mock')
  let request = null

  async function load(options = {}) {
    const { persona, scenario } = options
    error.value = null

    if (persona || scenario) {
      dashboard.value = getDashboardMock(options)
      source.value = 'mock'
      loading.value = false
      return dashboard.value
    }
    if (request) return request

    loading.value = true
    request = Promise.allSettled([
      getDashboard(),
      getAccounts(),
      getTodayMarketReport(),
      getTodayMissions(),
      getMyPageProfile(),
      getTransactions(currentMonthRange()),
    ])

    try {
      const [
        dashboardResult,
        accountsResult,
        reportResult,
        missionsResult,
        profileResult,
        transactionsResult,
      ] = await request
      if (dashboardResult.status === 'rejected') throw dashboardResult.reason

      const model = mapDashboardResponse(dashboardResult.value, emptyDashboardModel())
      const accounts = accountsResult.status === 'fulfilled' ? accountsResult.value : []
      const profile = profileResult.status === 'fulfilled' ? profileResult.value : null
      const transactions = transactionsResult.status === 'fulfilled' ? transactionsResult.value : []
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
      model.assetSummary.monthly.income = monthlyIncomeFromNaraSarangAccount(
        profile,
        accounts,
        transactions,
        model.assetSummary.monthly.income.amount,
      )
      model.assetSummary.monthly.investment.hasSecuritiesAccount =
        accounts.some(isSecuritiesAccount)

      dashboard.value = model
      source.value = 'api'
      return model
    } catch (requestError) {
      error.value = requestError
      source.value = 'error'
      return null
    } finally {
      request = null
      loading.value = false
    }
  }

  function reset() {
    dashboard.value = emptyDashboardModel()
    loading.value = false
    error.value = null
    source.value = 'mock'
    request = null
  }

  return { dashboard, loading, error, source, load, reset }
})
