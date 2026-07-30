import apiClient from '@/common/api/client'
import { ENDPOINTS } from '@/common/api/endpoints'

export async function getChallengeGroup() {
  const { data } = await apiClient.get(ENDPOINTS.challenges.group)
  return data
}

export async function getInvestmentBadges(params = {}) {
  const { data } = await apiClient.get(ENDPOINTS.users.investmentBadges, { params })
  return data
}
