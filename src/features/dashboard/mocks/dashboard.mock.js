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
    title: '데일리 금융리포트 보기',
    description: '오늘의 금융 리포트를 확인해보세요',
    missionType: 'COMMON',
    rewardExperience: 5,
    status: 'AVAILABLE',
    progress: 0,
    target: 1,
  },
  {
    id: 2,
    missionGroup: 'DAILY',
    title: '데일리 시장리포트 보기',
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
const investmentChangeRate = response.assetSnapshot.investment
  ? Math.round(
      (response.assetSnapshot.investmentChange / response.assetSnapshot.investment) * 1000,
    ) / 10
  : 0

export const dashboardMock = {
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
        amount: response.assetSnapshot.investment,
        changeAmount: response.assetSnapshot.investmentChange,
        changeRate: investmentChangeRate,
      },
      spending: {
        amount: response.assetSnapshot.spending,
        targetAmount: response.assetSnapshot.spendingTarget,
      },
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
