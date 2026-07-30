import apiClient from '@/common/api/client'
import { ENDPOINTS } from '@/common/api/endpoints'

export async function getCashflow(months = 8) {
  const { data } = await apiClient.get(ENDPOINTS.cashflow, { params: { months } })
  return data
}
