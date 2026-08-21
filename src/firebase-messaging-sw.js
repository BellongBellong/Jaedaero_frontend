/// <reference lib="webworker" />

import { initializeApp } from 'firebase/app'
import { getMessaging, onBackgroundMessage } from 'firebase/messaging/sw'
import { CacheableResponsePlugin } from 'workbox-cacheable-response'
import { clientsClaim } from 'workbox-core'
import { ExpirationPlugin } from 'workbox-expiration'
import {
  cleanupOutdatedCaches,
  createHandlerBoundToURL,
  precacheAndRoute,
} from 'workbox-precaching'
import { NavigationRoute, registerRoute } from 'workbox-routing'
import { CacheFirst, NetworkOnly } from 'workbox-strategies'

import { firebaseConfig } from './features/notifications/firebase/firebase.config'
import { normalizeNotificationDeepLink } from './features/notifications/utils/notificationDeepLink'

const sw = /** @type {ServiceWorkerGlobalScope} */ (self)

sw.skipWaiting()
clientsClaim()
precacheAndRoute(self.__WB_MANIFEST)
cleanupOutdatedCaches()

registerRoute(
  new NavigationRoute(createHandlerBoundToURL('index.html'), {
    denylist: [/^\/api\//],
  }),
)

/* 금융 데이터는 service worker에 저장하지 않고 항상 네트워크로 전달한다. */
registerRoute(({ url }) => url.pathname.startsWith('/api/'), new NetworkOnly())

registerRoute(
  ({ request }) => request.destination === 'font',
  new CacheFirst({
    cacheName: 'jaedaero-fonts',
    plugins: [
      new ExpirationPlugin({ maxEntries: 8, maxAgeSeconds: 60 * 60 * 24 * 365 }),
      new CacheableResponsePlugin({ statuses: [0, 200] }),
    ],
  }),
)

registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst({
    cacheName: 'jaedaero-images',
    plugins: [
      new ExpirationPlugin({ maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 30 }),
      new CacheableResponsePlugin({ statuses: [0, 200] }),
    ],
  }),
)

sw.addEventListener('notificationclick', (event) => {
  event.stopImmediatePropagation()
  event.notification.close()
  const notificationData = event.notification.data || {}
  const messageData = notificationData.FCM_MSG?.data || notificationData
  const targetPath = normalizeNotificationDeepLink(messageData.deepLink)
  const targetUrl = new URL(targetPath, sw.location.origin).href

  event.waitUntil(
    sw.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(async (clients) => {
      const sameOriginClient = clients.find(
        (client) => new URL(client.url).origin === sw.location.origin,
      )

      if (sameOriginClient) {
        await sameOriginClient.focus()
        sameOriginClient.postMessage({ type: 'JAEDAERO_NOTIFICATION_CLICK', deepLink: targetPath })
        return
      }

      await sw.clients.openWindow(targetUrl)
    }),
  )
})

const messaging = getMessaging(initializeApp(firebaseConfig))

onBackgroundMessage(messaging, async (payload) => {
  const clients = await sw.clients.matchAll({ type: 'window', includeUncontrolled: true })
  clients.forEach((client) => client.postMessage({ type: 'JAEDAERO_NOTIFICATION_RECEIVED' }))

  /* 현재 서버는 notification payload를 보내므로 SDK가 자동 표시한다. data-only 전환에만 대비한다. */
  if (!payload.notification) {
    const title = payload.data?.title || '제대로 알림'
    await sw.registration.showNotification(title, {
      body: payload.data?.body || '',
      icon: '/icons/pwa-192x192.png',
      badge: '/icons/favicon-64.png',
      data: payload.data || {},
    })
  }
})
