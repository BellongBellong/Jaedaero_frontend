import apiClient from '@/common/api/client'
import { ENDPOINTS } from '@/common/api/endpoints'

export async function getRebalancingRecommendation() {
  const { data } = await apiClient.get(ENDPOINTS.rebalancing.recommendations)
  return data
}

export async function applyRebalancing(rebalancingId) {
  const { data } = await apiClient.post(ENDPOINTS.rebalancing.apply(rebalancingId))
  return data
}
