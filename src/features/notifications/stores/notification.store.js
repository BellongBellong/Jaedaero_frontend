import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

import {
  getNotifications,
  getUnreadNotificationCount,
  readAllNotifications,
  readNotification,
} from '@/features/notifications/api/notifications.api'
import {
  disablePushNotifications,
  enablePushNotifications,
  getPushPermission,
  subscribeToForegroundMessages,
  unsubscribeFromForegroundMessages,
} from '@/features/notifications/services/firebaseMessaging.service'

const FOREGROUND_NOTIFICATION_DURATION = 5_000
const MAX_REMEMBERED_FOREGROUND_NOTIFICATIONS = 100

export const useNotificationStore = defineStore('notification', () => {
  const items = ref([])
  const page = ref(0)
  const hasNext = ref(false)
  const totalElements = ref(0)
  const unreadCount = ref(0)
  const permission = ref(getPushPermission())
  const loading = ref(false)
  const loadingMore = ref(false)
  const permissionLoading = ref(false)
  const error = ref(null)
  const foregroundNotification = ref(null)
  const foregroundNotificationQueue = []
  const rememberedForegroundNotificationKeys = new Set()
  let foregroundDismissTimer
  let initialized = false

  function normalizeNotification(notification) {
    return {
      ...notification,
      notificationId: notification.notificationId ?? notification.id,
      notificationType: notification.notificationType ?? notification.type,
      read: notification.read ?? notification.isRead ?? false,
      body: notification.body ?? notification.message ?? '',
    }
  }

  const pushEnabled = computed(() => permission.value === 'granted')
  const pushSupported = computed(() => permission.value !== 'unsupported')

  async function refreshUnreadCount() {
    const response = await getUnreadNotificationCount()
    unreadCount.value = Number(response?.unreadCount) || 0
  }

  async function load({ reset = true } = {}) {
    if (reset) {
      loading.value = true
      page.value = 0
    } else {
      if (!hasNext.value || loadingMore.value) return
      loadingMore.value = true
    }
    error.value = null

    try {
      const targetPage = reset ? 0 : page.value + 1
      const response = await getNotifications({ page: targetPage, size: 20 })
      const responseItems = Array.isArray(response)
        ? response
        : response?.items || response?.content || []
      const nextItems = Array.isArray(responseItems) ? responseItems.map(normalizeNotification) : []
      items.value = reset ? nextItems : [...items.value, ...nextItems]
      page.value = Number(response?.page) || targetPage
      hasNext.value = Boolean(response?.hasNext)
      totalElements.value = Number(response?.totalElements) || items.value.length
    } catch (loadError) {
      error.value = loadError
      throw loadError
    } finally {
      loading.value = false
      loadingMore.value = false
    }
  }

  function rememberForegroundNotification(key) {
    rememberedForegroundNotificationKeys.add(key)

    if (rememberedForegroundNotificationKeys.size > MAX_REMEMBERED_FOREGROUND_NOTIFICATIONS) {
      const oldestKey = rememberedForegroundNotificationKeys.values().next().value
      rememberedForegroundNotificationKeys.delete(oldestKey)
    }
  }

  function normalizeForegroundNotification(payload) {
    const data = payload?.data || {}
    const notification = payload?.notification || {}
    const notificationId = data.notificationId || null
    const key =
      notificationId || payload?.messageId || `${Date.now()}:${notification.title || data.title}`

    return {
      key,
      notificationId,
      type: data.type || 'GENERAL',
      title: notification.title || data.title || '새 알림이 도착했어요',
      body: notification.body || data.body || '',
      deepLink: data.deepLink || '/notifications',
    }
  }

  function scheduleForegroundDismiss() {
    window.clearTimeout(foregroundDismissTimer)
    foregroundDismissTimer = window.setTimeout(
      () => dismissForegroundNotification(),
      FOREGROUND_NOTIFICATION_DURATION,
    )
  }

  function showNextForegroundNotification() {
    const nextNotification = foregroundNotificationQueue.shift() || null
    foregroundNotification.value = nextNotification

    if (nextNotification) scheduleForegroundDismiss()
  }

  function showForegroundNotification(payload) {
    if (document.visibilityState !== 'visible') return

    const normalized = normalizeForegroundNotification(payload)
    if (rememberedForegroundNotificationKeys.has(normalized.key)) return

    rememberForegroundNotification(normalized.key)

    if (foregroundNotification.value) {
      foregroundNotificationQueue.push(normalized)
      return
    }

    foregroundNotification.value = normalized
    scheduleForegroundDismiss()
  }

  function dismissForegroundNotification(notificationKey) {
    if (
      notificationKey &&
      foregroundNotification.value &&
      foregroundNotification.value.key !== notificationKey
    ) {
      return
    }

    window.clearTimeout(foregroundDismissTimer)
    foregroundDismissTimer = undefined
    foregroundNotification.value = null
    showNextForegroundNotification()
  }

  async function handleForegroundMessage(payload) {
    showForegroundNotification(payload)
    await Promise.allSettled([refreshUnreadCount(), load()])
  }

  function handleServiceWorkerMessage(event) {
    if (event.data?.type === 'JAEDAERO_NOTIFICATION_RECEIVED') {
      void handleForegroundMessage()
    }
  }

  function handleVisibilityChange() {
    if (document.visibilityState === 'visible') void refreshUnreadCount()
  }

  async function initialize() {
    permission.value = getPushPermission()

    if (!initialized) {
      await subscribeToForegroundMessages(handleForegroundMessage)
      navigator.serviceWorker?.addEventListener('message', handleServiceWorkerMessage)
      document.addEventListener('visibilitychange', handleVisibilityChange)
      initialized = true
    }

    if (permission.value === 'granted') {
      try {
        const result = await enablePushNotifications()
        permission.value = result.status
      } catch (pushError) {
        error.value = pushError
      }
    }

    await refreshUnreadCount()
  }

  async function enablePush() {
    permissionLoading.value = true
    error.value = null
    try {
      const result = await enablePushNotifications({ requestPermission: true })
      permission.value = result.status
      return result
    } catch (enableError) {
      error.value = enableError
      throw enableError
    } finally {
      permissionLoading.value = false
    }
  }

  async function disablePush() {
    permissionLoading.value = true
    error.value = null
    try {
      await disablePushNotifications()
      permission.value = getPushPermission() === 'granted' ? 'disabled' : getPushPermission()
    } catch (disableError) {
      error.value = disableError
      throw disableError
    } finally {
      permissionLoading.value = false
    }
  }

  async function markRead(notificationId) {
    const target = items.value.find((item) => item.notificationId === notificationId)
    if (!target || target.read) return

    target.read = true
    unreadCount.value = Math.max(0, unreadCount.value - 1)
    try {
      await readNotification(notificationId)
    } catch (readError) {
      target.read = false
      unreadCount.value += 1
      throw readError
    }
  }

  async function markForegroundNotificationRead(notificationId) {
    if (!notificationId) return

    const target = items.value.find((item) => item.notificationId === notificationId)
    if (target) {
      await markRead(notificationId)
      return
    }

    await readNotification(notificationId)
    await refreshUnreadCount()
  }

  async function markAllRead() {
    if (!unreadCount.value) return
    const previousItems = items.value.map((item) => ({ ...item }))
    const previousUnreadCount = unreadCount.value
    items.value = items.value.map((item) => ({ ...item, read: true }))
    unreadCount.value = 0

    try {
      await readAllNotifications()
    } catch (readError) {
      items.value = previousItems
      unreadCount.value = previousUnreadCount
      throw readError
    }
  }

  function reset() {
    window.clearTimeout(foregroundDismissTimer)
    unsubscribeFromForegroundMessages()
    navigator.serviceWorker?.removeEventListener('message', handleServiceWorkerMessage)
    document.removeEventListener('visibilitychange', handleVisibilityChange)
    initialized = false
    items.value = []
    page.value = 0
    hasNext.value = false
    totalElements.value = 0
    unreadCount.value = 0
    permission.value = getPushPermission()
    error.value = null
    foregroundNotification.value = null
    foregroundNotificationQueue.splice(0)
    rememberedForegroundNotificationKeys.clear()
    foregroundDismissTimer = undefined
  }

  return {
    items,
    page,
    hasNext,
    totalElements,
    unreadCount,
    permission,
    loading,
    loadingMore,
    permissionLoading,
    error,
    foregroundNotification,
    pushEnabled,
    pushSupported,
    initialize,
    load,
    refreshUnreadCount,
    enablePush,
    disablePush,
    dismissForegroundNotification,
    markRead,
    markForegroundNotificationRead,
    markAllRead,
    reset,
  }
})
