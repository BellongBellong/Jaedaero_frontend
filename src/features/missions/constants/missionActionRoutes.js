const missionActionRoutes = {
  VIEW_FINANCE_REPORT: 'ai-financial-report',
  VIEW_AI_REPORT: 'ai-financial-report',
  VIEW_TRANSACTION_HISTORY: 'transactions',
  VIEW_SPENDING_ANALYSIS: 'transactions',
  VIEW_ASSET_STATUS: 'asset-overview',
  VIEW_DEPOSIT_PRODUCT: 'ai-product-recommendation',
  VIEW_REBALANCING: 'rebalancing',
  RUN_WHAT_IF_SIMULATION: 'what-if-simulation',
}

export function findMissionRoute(actionType) {
  return missionActionRoutes[actionType] ?? null
}
