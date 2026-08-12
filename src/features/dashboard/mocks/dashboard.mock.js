import { dashboardPersonaMocks } from '@/features/dashboard/mocks/dashboard.personas'

export const dashboardResponses = [
  {
    asOf: '2026-08-06T20:00:00+09:00',
    nickname: 'aaa',
    rank: 'PRIVATE',
    dischargeDday: 60,
    financialDischargeDday: 54,
    totalAsset: 8000000,
    monthlyAssetChange: 15000,
    targetAmount: 17000000,
    goalAchievementRate: 80.2,
    remainingTargetAmount: 3366000,
    actualDischargeDate: '2026-09-26',
    financialDischargeDate: '2026-09-20',
    financialDischargeDifferenceDays: 6,
    projectedAssetAtDischarge: 13540000,
    assetSnapshot: {
      income: 1905000,
      previousIncome: 1800000,
      investment: 420000,
      investmentChange: 15000,
      spending: 154000,
      spendingTarget: 100000,
    },
    dailyBriefing: {
      id: 1,
      greeting: '저녁은 맛있게 드셨나요?',
      title: '오늘의 금융 AI 리포트',
      date: '2026-07-29',
    },
    todayMission: {
      id: 1,
      title: '오늘의 리포트 확인',
      completed: true,
    },
    upcomingEvents: [
      {
        id: 1,
        title: '연가',
        date: '2026-08-14',
        dday: 1,
      },
      {
        id: 2,
        title: '말출',
        date: '2026-08-14',
        dday: 20,
      },
    ],
    assetForecast: [
      { month: '2026-02', expectedAsset: 8000000, targetAsset: 8200000 },
      { month: '2026-03', expectedAsset: 9300000, targetAsset: 9800000 },
      { month: '2026-04', expectedAsset: 10800000, targetAsset: 11500000 },
      { month: '2026-05', expectedAsset: 12100000, targetAsset: 13200000 },
      { month: '2026-06', expectedAsset: 13900000, targetAsset: 15100000 },
      { month: '2026-07', expectedAsset: 15400000, targetAsset: 17000000 },
    ],
  },
]

export const soldierProfileResponse = {
  userId: 1,
  rank: 'PRIVATE',
  rankName: '이병',
  monthlySalary: 750000,
}

export const transactionResponses = [
  {
    id: 23,
    userId: 1,
    accountId: 2,
    merchantName: '군 급여',
    amount: 750000,
    transactionType: 'INCOME',
    category: 'SALARY',
    transactionDate: '2026-08-05T09:00:00+09:00',
  },
  {
    id: 25,
    userId: 1,
    accountId: 2,
    merchantName: '중고거래 판매',
    amount: 105000,
    transactionType: 'INCOME',
    category: 'OTHER_INCOME',
    transactionDate: '2026-08-06T10:00:00+09:00',
  },
  {
    id: 26,
    userId: 1,
    accountId: 2,
    merchantName: '부대 PX',
    amount: 84000,
    transactionType: 'EXPENSE',
    category: 'PX',
    transactionDate: '2026-08-02T18:20:00+09:00',
  },
  {
    id: 27,
    userId: 1,
    accountId: 2,
    merchantName: '외출 식비',
    amount: 40000,
    transactionType: 'EXPENSE',
    category: 'FOOD',
    transactionDate: '2026-08-04T12:10:00+09:00',
  },
  {
    id: 28,
    userId: 1,
    accountId: 2,
    merchantName: '교통비',
    amount: 30000,
    transactionType: 'EXPENSE',
    category: 'TRANSPORT',
    transactionDate: '2026-08-05T16:30:00+09:00',
  },
]

export const connectedAccountResponses = [
  {
    id: 1,
    userId: 1,
    bankName: 'KB국민은행',
    accountName: '장병내일준비적금',
    accountNumber: '67100204074821',
    accountType: 'MILITARY_SAVINGS',
    balance: 4850000,
    monthlyPayment: 400000,
  },
  {
    id: 2,
    userId: 1,
    bankName: '신한은행',
    accountName: '나라사랑월급통장',
    accountNumber: '110349201954',
    accountType: 'CHECKING',
    balance: 1420000,
    monthlyPayment: 0,
  },
  {
    id: 3,
    userId: 1,
    bankName: '한국투자증권',
    accountName: '종합계좌',
    accountNumber: '160012347734',
    accountType: 'INVESTMENT',
    balance: 420000,
    monthlyPayment: 100000,
  },
]

export const investmentChangeResponses = [
  {
    id: 1,
    userId: 1,
    accountId: 3,
    changeAmount: 15000,
    changedAt: '2026-08-06T16:00:00+09:00',
  },
]

export const investmentHoldingResponses = [
  {
    id: 1,
    accountId: 3,
    productCode: 'TIGER-SP500',
    name: 'TIGER 미국S&P500',
    quantity: 0.5,
    quantityLabel: '0.5주',
    valuationAmount: 180000,
    returnRate: 9.1,
  },
  {
    id: 2,
    accountId: 3,
    productCode: 'MMA-SAVINGS',
    name: '군인공제회 저축',
    quantityLabel: '납입액',
    valuationAmount: 1200000,
    returnRate: 5.2,
  },
  {
    id: 3,
    accountId: 3,
    productCode: 'KODEX-200',
    name: 'KODEX 200',
    quantity: 2,
    quantityLabel: '2주',
    valuationAmount: 56000,
    returnRate: 6.1,
  },
]

export const eventResponses = [
  {
    id: 1,
    userId: 1,
    eventType: 'PAYDAY',
    title: '월급날',
    startDate: '2026-08-10',
    endDate: '2026-08-10',
    expectedExpense: 0,
    notificationEnabled: true,
  },
  {
    id: 2,
    userId: 1,
    eventType: 'VACATION',
    title: '8월 정기휴가',
    startDate: '2026-08-07',
    endDate: '2026-08-10',
    expectedExpense: 300000,
    notificationEnabled: true,
    autoVacationMode: true,
  },
  {
    id: 3,
    userId: 1,
    eventType: 'PROMOTION',
    title: '병장 진급',
    startDate: '2026-09-01',
    endDate: '2026-09-01',
    expectedExpense: 50000,
    notificationEnabled: true,
  },
]

export const missionResponses = [
  {
    id: 1,
    missionGroup: 'DAILY',
    title: '오늘의 AI 시장리포트',
    description: '오늘의 AI 시장리포트를 확인해보세요',
    missionType: 'COMMON',
    rewardExperience: 5,
    status: 'AVAILABLE',
    progress: 0,
    target: 1,
  },
  {
    id: 2,
    missionGroup: 'DAILY',
    title: '오늘의 AI 시장리포트',
    description: '오늘의 AI 시장현황 리포트를 확인해보세요',
    missionType: 'COMMON',
    rewardExperience: 5,
    status: 'AVAILABLE',
    progress: 0,
    target: 1,
  },
  {
    id: 3,
    missionGroup: 'TODAY',
    title: '예금상품 살펴보기',
    description: '나에게 맞는 예금 상품을 확인해보세요',
    missionType: 'SAFE',
    rewardExperience: 10,
    status: 'IN_PROGRESS',
    progress: 0,
    target: 1,
  },
  {
    id: 4,
    missionGroup: 'TODAY',
    title: '리밸런싱 제안 확인하기',
    description: '오늘의 AI 시장현황 리포트를 확인해보세요',
    missionType: 'AGGRESSIVE',
    rewardExperience: 10,
    status: 'AVAILABLE',
    progress: 0,
    target: 1,
  },
]

const response = dashboardResponses[0]
const toTenThousandWon = (amount) => Number(amount || 0) / 10000
const currentMonth = response.asOf.slice(0, 7)
const monthlyIncomeTransactions = transactionResponses.filter(
  (transaction) =>
    transaction.userId === soldierProfileResponse.userId &&
    transaction.transactionType === 'INCOME' &&
    transaction.transactionDate.startsWith(currentMonth),
)
const monthlyIncomeAmount = monthlyIncomeTransactions.reduce(
  (total, transaction) => total + Number(transaction.amount || 0),
  0,
)
const salaryIncomeAmount = monthlyIncomeTransactions
  .filter((transaction) => transaction.category === 'SALARY')
  .reduce((total, transaction) => total + Number(transaction.amount || 0), 0)
const otherIncomeAmount = Math.max(0, monthlyIncomeAmount - salaryIncomeAmount)
const hasAdditionalIncome = monthlyIncomeAmount > soldierProfileResponse.monthlySalary
const incomeChangeRate = hasAdditionalIncome
  ? Math.round(
      ((monthlyIncomeAmount - soldierProfileResponse.monthlySalary) /
        soldierProfileResponse.monthlySalary) *
        1000,
    ) / 10
  : 0
const monthlyExpenseTransactions = transactionResponses.filter(
  (transaction) =>
    transaction.userId === soldierProfileResponse.userId &&
    transaction.transactionType === 'EXPENSE' &&
    transaction.transactionDate.startsWith(currentMonth),
)
const monthlySpendingAmount = monthlyExpenseTransactions.reduce(
  (total, transaction) => total + Number(transaction.amount || 0),
  0,
)
const securitiesAccounts = connectedAccountResponses.filter(
  (account) =>
    account.userId === soldierProfileResponse.userId && account.accountType === 'INVESTMENT',
)
const securitiesAccountIds = new Set(securitiesAccounts.map(({ id }) => id))
const monthlyInvestmentChanges = investmentChangeResponses.filter(
  (change) =>
    change.userId === soldierProfileResponse.userId &&
    securitiesAccountIds.has(change.accountId) &&
    change.changedAt.startsWith(currentMonth),
)
const investmentAmount = securitiesAccounts.reduce(
  (total, account) => total + Number(account.balance || 0),
  0,
)
const investmentChangeAmount = monthlyInvestmentChanges.reduce(
  (total, change) => total + Number(change.changeAmount || 0),
  0,
)
const investmentOpeningAmount = investmentAmount - investmentChangeAmount
const investmentChangeRate = investmentOpeningAmount
  ? Math.round((investmentChangeAmount / Math.abs(investmentOpeningAmount)) * 1000) / 10
  : 0

const baseDashboardMock = {
  response,
  dailyReport: {
    greeting: response.dailyBriefing?.greeting,
    title: response.dailyBriefing?.title,
  },
  financialDday: {
    financialDday: response.financialDischargeDday,
    actualDday: response.dischargeDday,
    financialDischargeDate: response.financialDischargeDate,
    actualDischargeDate: response.actualDischargeDate,
    achievementRate: response.goalAchievementRate,
    currentAsset: toTenThousandWon(response.totalAsset),
    targetAmount: toTenThousandWon(response.targetAmount),
  },
  missions: missionResponses.map((mission) => ({
    ...mission,
    completed: mission.status === 'COMPLETED',
  })),
  events: eventResponses,
  assetSummary: {
    monthly: {
      income: {
        amount: monthlyIncomeAmount,
        salaryAmount: soldierProfileResponse.monthlySalary,
        salaryLabel: `${soldierProfileResponse.rankName} 월급`,
        otherIncomeAmount,
        hasAdditionalIncome,
        changeRate: incomeChangeRate,
      },
      investment: {
        hasSecuritiesAccount: securitiesAccounts.length > 0,
        amount: investmentAmount,
        changeAmount: investmentChangeAmount,
        changeRate: investmentChangeRate,
        holdings: investmentHoldingResponses.filter((holding) =>
          securitiesAccountIds.has(holding.accountId),
        ),
        monthlyPaymentTarget: securitiesAccounts.reduce(
          (total, account) => total + Number(account.monthlyPayment || 0),
          0,
        ),
      },
      spending: {
        amount: monthlySpendingAmount,
        targetAmount: response.assetSnapshot.spendingTarget,
      },
    },
    total: {
      totalAsset: connectedAccountResponses.reduce(
        (total, account) => total + Number(account.balance || 0),
        0,
      ),
      accounts: connectedAccountResponses.map((account) => ({
        ...account,
        name: account.accountName,
        amount: account.balance,
      })),
    },
    forecast: {
      totalAmount: response.projectedAssetAtDischarge,
      labels: (response.assetForecast ?? []).map(({ month }, index, items) =>
        index === items.length - 1 ? '현재' : `${Number(month.slice(5))}월`,
      ),
      expected: (response.assetForecast ?? []).map(({ expectedAsset }) =>
        toTenThousandWon(expectedAsset),
      ),
      target: (response.assetForecast ?? []).map(({ targetAsset }) =>
        toTenThousandWon(targetAsset),
      ),
    },
  },
}

function withInvestment(investment) {
  return {
    ...baseDashboardMock,
    assetSummary: {
      ...baseDashboardMock.assetSummary,
      monthly: {
        ...baseDashboardMock.assetSummary.monthly,
        investment,
      },
    },
  }
}

function withSpending(spending) {
  return {
    ...baseDashboardMock,
    assetSummary: {
      ...baseDashboardMock.assetSummary,
      monthly: {
        ...baseDashboardMock.assetSummary.monthly,
        spending,
      },
    },
  }
}

export const DASHBOARD_SCENARIOS = {
  DEFAULT: 'default',
  INVESTMENT_PROFIT: 'investment-profit',
  INVESTMENT_LOSS: 'investment-loss',
  INVESTMENT_STEADY: 'investment-steady',
  NO_INVESTMENT_ACCOUNT: 'no-investment-account',
  SPENDING_OVER: 'spending-over',
  SPENDING_SAFE: 'spending-safe',
  SPENDING_NO_TARGET: 'spending-no-target',
}

export const dashboardMockScenarios = {
  [DASHBOARD_SCENARIOS.DEFAULT]: baseDashboardMock,
  [DASHBOARD_SCENARIOS.INVESTMENT_PROFIT]: baseDashboardMock,
  [DASHBOARD_SCENARIOS.INVESTMENT_LOSS]: withInvestment({
    hasSecuritiesAccount: true,
    amount: 420000,
    changeAmount: -5000,
    changeRate: -1.2,
    monthlyPaymentTarget: 100000,
  }),
  [DASHBOARD_SCENARIOS.INVESTMENT_STEADY]: withInvestment({
    hasSecuritiesAccount: true,
    amount: 420000,
    changeAmount: 0,
    changeRate: 0,
    monthlyPaymentTarget: 100000,
  }),
  [DASHBOARD_SCENARIOS.NO_INVESTMENT_ACCOUNT]: withInvestment({
    hasSecuritiesAccount: false,
    amount: 0,
    changeAmount: 0,
    changeRate: 0,
    monthlyPaymentTarget: 0,
  }),
  [DASHBOARD_SCENARIOS.SPENDING_OVER]: withSpending({
    amount: 154000,
    targetAmount: 100000,
  }),
  [DASHBOARD_SCENARIOS.SPENDING_SAFE]: withSpending({
    amount: 84000,
    targetAmount: 100000,
  }),
  [DASHBOARD_SCENARIOS.SPENDING_NO_TARGET]: withSpending({
    amount: 84000,
    targetAmount: 0,
  }),
}

function mergeDashboardMock(base, override = {}) {
  return {
    ...base,
    ...override,
    response: {
      ...base.response,
      ...override.response,
    },
    dailyReport: {
      ...base.dailyReport,
      ...override.dailyReport,
    },
    financialDday: {
      ...base.financialDday,
      ...override.financialDday,
    },
    missions: override.missions ?? base.missions,
    events: override.events ?? base.events,
    assetSummary: {
      ...base.assetSummary,
      ...override.assetSummary,
      monthly: {
        ...base.assetSummary.monthly,
        ...override.assetSummary?.monthly,
      },
      forecast: {
        ...base.assetSummary.forecast,
        ...override.assetSummary?.forecast,
      },
    },
  }
}

export function getDashboardMock(options = {}) {
  const normalizedOptions = typeof options === 'string' ? { scenario: options } : options
  const personaMock = dashboardPersonaMocks[normalizedOptions.persona] ?? {}
  let result = mergeDashboardMock(baseDashboardMock, personaMock)

  const scenario = normalizedOptions.scenario
  if (scenario && scenario !== DASHBOARD_SCENARIOS.DEFAULT) {
    const scenarioMock = dashboardMockScenarios[scenario]
    if (scenarioMock) {
      const scenarioMonthly = scenarioMock.assetSummary.monthly
      const isSpendingScenario = scenario.startsWith('spending-')
      result = mergeDashboardMock(result, {
        assetSummary: {
          monthly: {
            ...(isSpendingScenario
              ? { spending: scenarioMonthly.spending }
              : { investment: scenarioMonthly.investment }),
          },
        },
      })
    }
  }

  return result
}

export const dashboardMock = mergeDashboardMock(baseDashboardMock)
