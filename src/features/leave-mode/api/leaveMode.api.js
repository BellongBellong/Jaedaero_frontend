import apiClient from '@/common/api/client'
import { ENDPOINTS } from '@/common/api/endpoints'

export async function startLeaveMode(payload) {
  const { data } = await apiClient.post(ENDPOINTS.leaveMode.start, payload)
  return data
}

export async function getLeaveModes() {
  const { data } = await apiClient.get(ENDPOINTS.leaveMode.list)
  return Array.isArray(data) ? data : []
}

export async function getCurrentLeaveMode() {
  const response = await apiClient.get(ENDPOINTS.leaveMode.current)
  if (response.status === 204) return null

  const data = response.data
  return data?.data ?? data?.result ?? data
}

export async function updateLeaveModeBudget(leaveModeId, budgetAmount) {
  const { data } = await apiClient.put(ENDPOINTS.leaveMode.budget(leaveModeId), { budgetAmount })
  return data
}

export async function deleteLeaveMode(leaveModeId) {
  await apiClient.delete(ENDPOINTS.leaveMode.remove(leaveModeId))
}
