import apiClient from '@/common/api/client'
import { ENDPOINTS } from '@/common/api/endpoints'

export async function getTodayMarketReport() {
  const { data } = await apiClient.get(ENDPOINTS.marketReport.today)
  return data
}
