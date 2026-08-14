import apiClient from '@/common/api/client'
import { ENDPOINTS } from '@/common/api/endpoints'

export async function getRebalancingRecommendation() {
  const { data } = await apiClient.get(ENDPOINTS.investmentGuidances.latest)
  return data?.data ?? data
}

export async function getRecurringInvestmentPlan() {
  const { data } = await apiClient.get(ENDPOINTS.recurringInvestmentPlans.me)
  return data?.data ?? data
}

export async function saveRecurringInvestmentPlan(payload) {
  const { data } = await apiClient.put(ENDPOINTS.recurringInvestmentPlans.me, payload)
  return data?.data ?? data
}

export async function createInvestmentGuidance() {
  const { data } = await apiClient.post(ENDPOINTS.investmentGuidances.create)
  return data?.data ?? data
}

export async function getInvestmentGuidanceDetail(guidanceId) {
  const { data } = await apiClient.get(ENDPOINTS.investmentGuidances.detail(guidanceId))
  return data?.data ?? data
}

export async function applyRebalancing(guidanceId, payload = {}) {
  const { data } = await apiClient.post(ENDPOINTS.investmentGuidances.apply(guidanceId), payload)
  return data?.data ?? data
}
