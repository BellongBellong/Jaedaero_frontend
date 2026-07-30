import apiClient from '@/common/api/client'
import { ENDPOINTS } from '@/common/api/endpoints'

export async function getTodayMissions() {
  const { data } = await apiClient.get(ENDPOINTS.missions.today)
  return data
}

export async function completeMission(missionId) {
  const { data } = await apiClient.post(ENDPOINTS.missions.complete(missionId))
  return data
}
