import apiClient from '@/common/api/client'
import { ENDPOINTS } from '@/common/api/endpoints'

export async function getMyPageProfile() {
  const { data } = await apiClient.get(ENDPOINTS.users.me)
  return data
}

export async function checkNicknameAvailability(nickname) {
  const { data } = await apiClient.get(ENDPOINTS.users.nicknameAvailability, {
    params: { nickname },
  })
  return data
}

export async function updateNickname(nickname) {
  await apiClient.put(ENDPOINTS.users.nickname, { nickname })
}

export async function updateProfileAppearance(payload) {
  await apiClient.put(ENDPOINTS.users.profileAppearance, payload)
}

export async function getGoal() {
  const { data } = await apiClient.get(ENDPOINTS.goals)
  return data
}

export async function updateGoal(targetAmount) {
  const { data } = await apiClient.post(ENDPOINTS.goals, { targetAmount })
  return data
}

export async function withdrawUser() {
  await apiClient.delete(ENDPOINTS.users.me)
}
