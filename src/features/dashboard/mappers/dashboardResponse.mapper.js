const WON_PER_TEN_THOUSAND = 10_000
const DAY_IN_MS = 86_400_000

function toNumber(value, fallback = 0) {
  const number = Number(value)
  return Number.isFinite(number) ? number : fallback
}

function toDateOnly(value) {
  if (!value) return null

  if (Array.isArray(value)) {
    const [year, month, day] = value.map(Number)
    return year && month && day ? Date.UTC(year, month - 1, day) : null
  }

  const match = String(value)
    .trim()
    .match(/^(\d{4})[-./](\d{1,2})[-./](\d{1,2})/)
  if (!match) return null

  const [, year, month, day] = match.map(Number)
  if (!year || !month || !day) return null

  return Date.UTC(year, month - 1, day)
}

function daysFromToday(value, now = new Date()) {
  const target = toDateOnly(value)
  if (!target) return 0

  const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())
  return Math.max(0, Math.ceil((target - today) / DAY_IN_MS))
}

function toTenThousandWon(value) {
  return toNumber(value) / WON_PER_TEN_THOUSAND
}

function unwrapDashboardResponse(response) {
  return response?.data ?? response ?? {}
}

/**
 * Swagger의 DashboardResponse를 기존 대시보드 화면 모델에 합성한다.
 * 이벤트·미션·계좌 목록처럼 DashboardResponse에 없는 값은 fallbackModel을 유지한다.
 */
export function mapDashboardResponse(response, fallbackModel, now = new Date()) {
  const source = unwrapDashboardResponse(response)
  const currentAsset = toNumber(source.currentAsset)
  const achievementRate = toNumber(source.achievementRate)
  const monthlyInvestmentGoal = toNumber(source.monthlyInvestmentGoal)
  const monthlySpendingGoal = toNumber(source.monthlySpendingGoal)
  const expectedAsset = toNumber(source.expectedAsset)
  const targetAmount = toNumber(source.targetAmount)
  const currentExpectedAsset = toNumber(source.currentExpectedAsset, currentAsset)
  const derivedTargetAmount =
    achievementRate > 0 ? Math.round(expectedAsset / (achievementRate / 100)) : 0
  const dashboardTargetAmount = targetAmount > 0 ? targetAmount : derivedTargetAmount

  return {
    ...fallbackModel,
    response: {
      ...fallbackModel.response,
      ...source,
    },
    financialDday: {
      ...fallbackModel.financialDday,
      financialDday: source.financialDischargeDate
        ? daysFromToday(source.financialDischargeDate, now)
        : null,
      actualDday: source.actualDischargeDate
        ? daysFromToday(source.actualDischargeDate, now)
        : null,
      financialDischargeDate: source.financialDischargeDate ?? null,
      actualDischargeDate: source.actualDischargeDate ?? null,
      differenceDays: toNumber(source.deltaDaysVsActual),
      achievementRate,
      currentAsset: toTenThousandWon(currentAsset),
      expectedAsset: toTenThousandWon(currentExpectedAsset),
      targetAmount: toTenThousandWon(dashboardTargetAmount),
    },
    assetSummary: {
      ...fallbackModel.assetSummary,
      monthly: {
        ...fallbackModel.assetSummary.monthly,
        income: {
          ...fallbackModel.assetSummary.monthly.income,
          amount: toNumber(source.thisMonthIncome),
        },
        investment: {
          ...fallbackModel.assetSummary.monthly.investment,
          amount: toNumber(source.thisMonthInvestment),
          monthlyPaymentTarget: monthlyInvestmentGoal,
          goalAchievementRate: toNumber(source.investmentGoalAchievementRate),
        },
        spending: {
          ...fallbackModel.assetSummary.monthly.spending,
          amount: toNumber(source.thisMonthSpending),
          targetAmount: monthlySpendingGoal,
          goalAchievementRate: toNumber(source.spendingGoalAchievementRate),
        },
      },
      total: {
        ...fallbackModel.assetSummary.total,
        totalAsset: currentAsset,
      },
      forecast: {
        ...fallbackModel.assetSummary.forecast,
        totalAmount: expectedAsset,
      },
    },
    apiMeta: {
      goalAppliedAt: source.goalAppliedAt ?? null,
      goalSource: source.goalSource ?? null,
    },
  }
}
