import apiClient from '@/common/api/client'
import { ENDPOINTS } from '@/common/api/endpoints'

export async function getCashflow(months = 8) {
  const userId = Number(localStorage.getItem('userId')) || 1
  const { data } = await apiClient.get(ENDPOINTS.cashflow, {
    params: { months },
    headers: { 'X-User-Id': userId },
  })
  return data?.data ?? data
}

export async function generateCashflow() {
  const userId = Number(localStorage.getItem('userId')) || 1
  const { data } = await apiClient.post(ENDPOINTS.cashflow, null, {
    headers: { 'X-User-Id': userId },
  })
  return data?.data ?? data
}
