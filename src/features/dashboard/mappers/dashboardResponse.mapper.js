const WON_PER_TEN_THOUSAND = 10_000
const DAY_IN_MS = 86_400_000

function toNumber(value, fallback = 0) {
  const number = Number(value)
  return Number.isFinite(number) ? number : fallback
}

function toDateOnly(value) {
  if (!value) return null

  const [year, month, day] = String(value).slice(0, 10).split('-').map(Number)
  if (!year || !month || !day) return null

  return new Date(year, month - 1, day)
}

function daysFromToday(value, now = new Date()) {
  const target = toDateOnly(value)
  if (!target) return 0

  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  return Math.max(0, Math.ceil((target.getTime() - today.getTime()) / DAY_IN_MS))
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

  return {
    ...fallbackModel,
    response: {
      ...fallbackModel.response,
      ...source,
    },
    financialDday: {
      ...fallbackModel.financialDday,
      financialDday: daysFromToday(source.financialDischargeDate, now),
      actualDday: daysFromToday(source.actualDischargeDate, now),
      financialDischargeDate:
        source.financialDischargeDate ?? fallbackModel.financialDday.financialDischargeDate,
      actualDischargeDate:
        source.actualDischargeDate ?? fallbackModel.financialDday.actualDischargeDate,
      achievementRate,
      currentAsset: toTenThousandWon(currentAsset),
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
        totalAmount: toNumber(source.expectedAsset),
      },
    },
    apiMeta: {
      goalAppliedAt: source.goalAppliedAt ?? null,
      goalSource: source.goalSource ?? null,
    },
  }
}
