import apiClient from '@/common/api/client'
import { ENDPOINTS } from '@/common/api/endpoints'

export async function getMyPageProfile() {
  const { data } = await apiClient.get(ENDPOINTS.users.me)
  return data
}

export async function withdrawUser() {
  await apiClient.delete(ENDPOINTS.users.me)
}
