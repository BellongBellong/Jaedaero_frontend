import apiClient from '@/common/api/client'
import { ENDPOINTS } from '@/common/api/endpoints'

export async function getChallengeGroup(params = {}) {
  const { data } = await apiClient.get(ENDPOINTS.challenges.group, { params })

  return data
}

export async function getTodayMissions() {
  const { data } = await apiClient.get(ENDPOINTS.missions.today)

  return data
}

export async function completeMission(missionId) {
  const { data } = await apiClient.post(ENDPOINTS.missions.complete(missionId))

  return data
}

export async function getInvestmentBadges() {
  const { data } = await apiClient.get(ENDPOINTS.users.investmentBadges)

  return data
}
