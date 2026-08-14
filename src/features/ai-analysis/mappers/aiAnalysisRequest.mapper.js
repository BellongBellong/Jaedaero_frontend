const PLAN_FIELDS = [
  'monthlySpendingAmount',
  'monthlySavingAmount',
  'monthlyInvestmentAmount',
  'expectedReturnRate',
]

function latestSimulation(response) {
  if (Array.isArray(response)) return response[0] ?? null

  const simulations =
    response?.simulations ??
    response?.content ??
    response?.items ??
    response?.results ??
    response?.data

  if (simulations && simulations !== response) return latestSimulation(simulations)
  return null
}

function hasCompletePlan(source) {
  return PLAN_FIELDS.every((field) => {
    const value = Number(source?.[field])
    return Number.isFinite(value) && value >= 0
  })
}

/** 최신 저장 What-if를 우선하고, 없으면 서버 기본값으로 AI 소비 분석 요청을 만든다. */
export function mapAiAnalysisRequest({ defaults, simulations } = {}) {
  const savedPlan = latestSimulation(simulations)
  const source = hasCompletePlan(savedPlan) ? savedPlan : defaults

  if (!hasCompletePlan(source)) {
    throw new TypeError('AI 소비 분석에 필요한 What-if 조건이 모두 필요합니다.')
  }

  return Object.fromEntries(PLAN_FIELDS.map((field) => [field, Number(source[field])]))
}
