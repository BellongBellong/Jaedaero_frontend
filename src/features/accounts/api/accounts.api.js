import apiClient from '@/common/api/client'
import { ENDPOINTS } from '@/common/api/endpoints'

export async function connectAccount(payload) {
  const { data } = await apiClient.post(ENDPOINTS.accounts.connect, payload)
  return data
}

export async function getCodefBanks() {
  const { data } = await apiClient.get(ENDPOINTS.codef.banks)
  return data
}

export async function getCodefSecurities() {
  const { data } = await apiClient.get(ENDPOINTS.codef.securities)
  return data
}

export async function getAccounts(userId) {
  const { data } = await apiClient.get(ENDPOINTS.accounts.list, {
    params: { userId },
  })
  return data
}
