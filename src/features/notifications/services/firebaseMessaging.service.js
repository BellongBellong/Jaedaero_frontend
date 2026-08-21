import { getApp, getApps, initializeApp } from 'firebase/app'
import { deleteToken, getMessaging, getToken, isSupported, onMessage } from 'firebase/messaging'

import {
  deactivateDeviceToken,
  registerDeviceToken,
} from '@/features/notifications/api/notifications.api'
import {
  firebaseConfig,
  firebaseVapidKey,
  isFirebaseConfigured,
} from '@/features/notifications/firebase/firebase.config'

const DEVICE_TOKEN_ID_KEY = 'jaedaero-fcm-device-token-id'
const FCM_TOKEN_KEY = 'jaedaero-fcm-token'
const PUSH_DISABLED_KEY = 'jaedaero-push-disabled'

let messagingPromise
let foregroundUnsubscribe

function getStoredValue(key) {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

function setStoredValue(key, value) {
  try {
    localStorage.setItem(key, String(value))
  } catch {
    // 비공개 모드 등 저장소를 사용할 수 없어도 현재 세션의 Push는 유지한다.
  }
}

function removeStoredValue(key) {
  try {
    localStorage.removeItem(key)
  } catch {
    // 저장소 접근 실패는 토큰 폐기 자체를 막지 않는다.
  }
}

async function getMessagingInstance() {
  if (!messagingPromise) {
    messagingPromise = (async () => {
      if (!isFirebaseConfigured() || !(await isSupported())) return null
      const app = getApps().length ? getApp() : initializeApp(firebaseConfig)
      return getMessaging(app)
    })()
  }

  return messagingPromise
}

async function getMessagingServiceWorker() {
  if (!('serviceWorker' in navigator)) return null

  const scope = new URL(import.meta.env.BASE_URL, window.location.origin).pathname
  if (import.meta.env.DEV) {
    // vite-plugin-pwa가 개발용 injectManifest SW를 등록한 뒤 활성화될 때까지 기다린다.
    return navigator.serviceWorker.ready
  }

  // 기존 generateSW 등록이 남은 기기도 FCM 핸들러가 포함된 SW로 안전하게 갱신한다.
  return navigator.serviceWorker.register(`${import.meta.env.BASE_URL}firebase-messaging-sw.js`, {
    scope,
  })
}

function detectPlatform() {
  const userAgent = navigator.userAgent
  const isIPadOS = navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1

  if (/iPhone|iPad|iPod/i.test(userAgent) || isIPadOS) return 'IOS'
  if (/Android/i.test(userAgent)) return 'ANDROID'
  return 'WEB'
}

export function getPushPermission() {
  if (!('Notification' in window) || !('serviceWorker' in navigator)) return 'unsupported'
  if (Notification.permission === 'granted' && getStoredValue(PUSH_DISABLED_KEY) === 'true') {
    return 'disabled'
  }
  return Notification.permission
}

export async function enablePushNotifications({ requestPermission = false } = {}) {
  if (!requestPermission && getStoredValue(PUSH_DISABLED_KEY) === 'true') {
    return { status: 'disabled' }
  }

  const messaging = await getMessagingInstance()
  if (!messaging) return { status: 'unsupported' }

  let permission = Notification.permission
  if (permission === 'default' && requestPermission) {
    permission = await Notification.requestPermission()
  }

  if (permission !== 'granted') return { status: permission }

  const serviceWorkerRegistration = await getMessagingServiceWorker()
  if (!serviceWorkerRegistration) return { status: 'unsupported' }

  const token = await getToken(messaging, {
    vapidKey: firebaseVapidKey,
    serviceWorkerRegistration,
  })
  if (!token) return { status: 'unavailable' }

  // 서버 등록에 실패하더라도 Firebase가 발급한 실제 토큰은 로컬에서 점검할 수 있게 보관한다.
  setStoredValue(FCM_TOKEN_KEY, token)
  const registered = await registerDeviceToken({ token, platform: detectPlatform() })
  removeStoredValue(PUSH_DISABLED_KEY)
  setStoredValue(DEVICE_TOKEN_ID_KEY, registered.deviceTokenId)

  return { status: 'granted', token, deviceTokenId: registered.deviceTokenId }
}

export async function disablePushNotifications({ rememberDisabled = true } = {}) {
  const deviceTokenId = Number(getStoredValue(DEVICE_TOKEN_ID_KEY))
  const messaging = await getMessagingInstance()

  try {
    if (deviceTokenId > 0) await deactivateDeviceToken(deviceTokenId)
  } finally {
    if (messaging) await deleteToken(messaging).catch(() => false)
    removeStoredValue(DEVICE_TOKEN_ID_KEY)
    removeStoredValue(FCM_TOKEN_KEY)
    if (rememberDisabled) setStoredValue(PUSH_DISABLED_KEY, 'true')
  }
}

export async function deactivatePushNotificationsForLogout() {
  await disablePushNotifications({ rememberDisabled: false })
}

export async function subscribeToForegroundMessages(handler) {
  const messaging = await getMessagingInstance()
  if (!messaging) return () => {}

  foregroundUnsubscribe?.()
  foregroundUnsubscribe = onMessage(messaging, handler)
  return foregroundUnsubscribe
}

export function unsubscribeFromForegroundMessages() {
  foregroundUnsubscribe?.()
  foregroundUnsubscribe = undefined
}
