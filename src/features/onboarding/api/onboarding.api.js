import apiClient from '@/common/api/client'
import { ENDPOINTS } from '@/common/api/endpoints'

export async function checkNickname(nickname) {
  const { data } = await apiClient.get(ENDPOINTS.users.nicknameAvailability, {
    params: { nickname },
  })
  return data
}

export async function saveMilitaryInfo(payload) {
  const { data } = await apiClient.post(ENDPOINTS.onboarding.militaryInfo, payload)
  return data
}

export async function previewInvestmentPreference(payload) {
  const { data } = await apiClient.post(ENDPOINTS.onboarding.investmentPreference, payload)
  return data
}

export async function saveGoal(payload) {
  const { data } = await apiClient.post(ENDPOINTS.goals, payload)
  return data
}
