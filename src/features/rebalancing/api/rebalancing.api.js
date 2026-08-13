import apiClient from '@/common/api/client'
import { ENDPOINTS } from '@/common/api/endpoints'

export async function getRebalancingRecommendation() {
  const { data } = await apiClient.get(ENDPOINTS.investmentGuidances.latest)
  return data
}

export async function getRecurringInvestmentPlan() {
  const { data } = await apiClient.get(ENDPOINTS.recurringInvestmentPlans.me)
  return data
}

export async function applyRebalancing(guidanceId, payload = {}) {
  const { data } = await apiClient.post(ENDPOINTS.investmentGuidances.apply(guidanceId), payload)
  return data
}
