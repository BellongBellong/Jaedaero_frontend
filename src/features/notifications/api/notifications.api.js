import apiClient from '@/common/api/client'
import { ENDPOINTS } from '@/common/api/endpoints'

export async function registerDeviceToken(payload) {
  const { data } = await apiClient.post(ENDPOINTS.deviceTokens, payload)
  return data
}

export async function getNotifications(params = {}) {
  const { data } = await apiClient.get(ENDPOINTS.notifications.list, { params })
  return data
}

export async function readNotification(notificationId) {
  await apiClient.put(ENDPOINTS.notifications.read(notificationId))
}
