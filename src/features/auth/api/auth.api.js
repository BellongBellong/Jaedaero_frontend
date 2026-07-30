import apiClient from '@/common/api/client'
import { ENDPOINTS } from '@/common/api/endpoints'

export async function login(payload) {
  const { data } = await apiClient.post(ENDPOINTS.auth.login, payload)
  return data
}

export async function refreshToken(payload) {
  const { data } = await apiClient.post(ENDPOINTS.auth.refresh, payload)
  return data
}

export async function logout() {
  await apiClient.post(ENDPOINTS.auth.logout)
}
