import apiClient from '@/common/api/client'
import { ENDPOINTS } from '@/common/api/endpoints'

export async function getDashboard() {
  const { data } = await apiClient.get(ENDPOINTS.dashboard)
  return data
}
