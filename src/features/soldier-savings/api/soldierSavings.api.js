import apiClient from '@/common/api/client'
import { ENDPOINTS } from '@/common/api/endpoints'

export async function getSoldierSavings() {
  const { data } = await apiClient.get(ENDPOINTS.soldierSavings)
  return data
}
