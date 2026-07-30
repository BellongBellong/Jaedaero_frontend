import apiClient from '@/common/api/client'
import { ENDPOINTS } from '@/common/api/endpoints'

export async function connectAccount(payload) {
  const { data } = await apiClient.post(ENDPOINTS.accounts.connect, payload)
  return data
}

export async function getAccounts() {
  const { data } = await apiClient.get(ENDPOINTS.accounts.list)
  return data
}
