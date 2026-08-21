<script setup>
import { onBeforeUnmount, watch } from 'vue'
import { RouterView } from 'vue-router'

import BaseToast from '@/common/components/feedback/BaseToast.vue'
import { useToast } from '@/common/composables/useToast'

const { message, variant, visible } = useToast()
import router from '@/app/router'
import { useAuthStore } from '@/features/auth/stores/auth.store'
import { normalizeNotificationDeepLink } from '@/features/notifications/utils/notificationDeepLink'
import { useNotificationStore } from '@/features/notifications/stores/notification.store'

const authStore = useAuthStore()
const notificationStore = useNotificationStore()

watch(
  () => authStore.isAuthenticated,
  (authenticated) => {
    if (authenticated) {
      void notificationStore.initialize().catch(() => {})
    } else {
      notificationStore.reset()
    }
  },
  { immediate: true },
)

function handleServiceWorkerMessage(event) {
  if (event.data?.type !== 'JAEDAERO_NOTIFICATION_CLICK') return
  void router.push(normalizeNotificationDeepLink(event.data.deepLink))
}

navigator.serviceWorker?.addEventListener('message', handleServiceWorkerMessage)
onBeforeUnmount(() =>
  navigator.serviceWorker?.removeEventListener('message', handleServiceWorkerMessage),
)
</script>

<template>
  <RouterView />

  <BaseToast
    :message="message"
    :variant="variant"
    :visible="visible"
  />
</template>
