import apiClient from '@/common/api/client'
import { ENDPOINTS } from '@/common/api/endpoints'

export async function getDischargeReport() {
  const { data } = await apiClient.get(ENDPOINTS.reports.discharge)
  return data
}

export async function getProductRecommendations(params = {}) {
  const { data } = await apiClient.get(ENDPOINTS.products.recommendations, { params })
  return data
}

export async function getBenefits(params = {}) {
  const { data } = await apiClient.get(ENDPOINTS.benefits, { params })
  return data
}
