import apiClient from '@/common/api/client'
import { ENDPOINTS } from '@/common/api/endpoints'

export async function registerDeviceToken(payload) {
  const { data } = await apiClient.post(ENDPOINTS.deviceTokens.register, payload)
  return data
}

export async function deactivateDeviceToken(deviceTokenId) {
  await apiClient.delete(ENDPOINTS.deviceTokens.deactivate(deviceTokenId))
}

export async function getNotifications(params = {}) {
  const { data } = await apiClient.get(ENDPOINTS.notifications.list, { params })
  return data
}

export async function readNotification(notificationId) {
  await apiClient.put(ENDPOINTS.notifications.read(notificationId))
}

export async function getUnreadNotificationCount() {
  const { data } = await apiClient.get(ENDPOINTS.notifications.unreadCount)
  return data
}

export async function readAllNotifications() {
  await apiClient.put(ENDPOINTS.notifications.readAll)
}
