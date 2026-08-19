import apiClient from '@/common/api/client'
import { ENDPOINTS } from '@/common/api/endpoints'

function unwrapApiData(data) {
  return data?.data ?? data
}

export async function getSecuritiesPortfolio() {
  const { data } = await apiClient.get(ENDPOINTS.investments.securitiesPortfolio)
  const payload = unwrapApiData(data)
  return Array.isArray(payload) ? payload : (payload?.portfolios ?? payload?.items ?? [])
}
