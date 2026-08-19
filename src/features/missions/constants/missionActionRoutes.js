const missionActionRoutes = {
  VIEW_FINANCE_REPORT: 'ai-financial-report',
  VIEW_AI_REPORT: 'ai-financial-report',
  VIEW_TRANSACTION_HISTORY: 'transactions',
  VIEW_SPENDING_ANALYSIS: 'transactions',
  VIEW_ASSET_STATUS: 'asset-overview',
  VIEW_DEPOSIT_PRODUCT: 'ai-product-recommendation',
  VIEW_REBALANCING: 'investment-guide',
  RUN_WHAT_IF_SIMULATION: 'what-if-simulation',
  VIEW_MARKET_REPORT: 'ai-financial-report',
  VIEW_LEAVE_BENEFIT: 'benefits',
  VIEW_DAILY_REPORT: 'ai-financial-report',
  VIEW_ASSET_OVERVIEW: 'asset-overview',
  VIEW_WHAT_IF: 'what-if-simulation',
}

export function findMissionRoute(actionType) {
  const normalizedActionType = String(actionType || '')
    .trim()
    .toUpperCase()

  return missionActionRoutes[normalizedActionType] ?? null
}
