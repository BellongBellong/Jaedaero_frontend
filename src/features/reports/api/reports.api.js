import apiClient from '@/common/api/client'
import { ENDPOINTS } from '@/common/api/endpoints'

export async function getDischargeReport() {
  const { data } = await apiClient.get(ENDPOINTS.reports.discharge)
  return data
}

export async function getProductRecommendations() {
  const { data } = await apiClient.get(ENDPOINTS.products.recommendations)
  return data
}

export async function getBenefits(params = {}) {
  const { data } = await apiClient.get(ENDPOINTS.benefits, { params })
  return data
}
