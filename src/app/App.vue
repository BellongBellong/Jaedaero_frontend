<script setup>
import { onBeforeUnmount, watch } from 'vue'
import { RouterView } from 'vue-router'

import BaseToast from '@/common/components/feedback/BaseToast.vue'
import { useToast } from '@/common/composables/useToast'
import BaseSnackbar from '@/common/components/feedback/BaseSnackbar.vue'
import { useSnackbar } from '@/common/composables/useSnackbar'

const { message, placement: toastPlacement, variant, visible } = useToast()
const {
  actionLabel: snackbarActionLabel,
  iconSrc: snackbarIconSrc,
  message: snackbarMessage,
  placement: snackbarPlacement,
  title: snackbarTitle,
  visible: snackbarVisible,
  activate: activateSnackbar,
  dismiss: dismissSnackbar,
} = useSnackbar()
import router from '@/app/router'
import InAppNotificationBanner from '@/common/components/feedback/InAppNotificationBanner.vue'
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
  <InAppNotificationBanner />

  <BaseToast
    :message="message"
    :placement="toastPlacement"
    :variant="variant"
    :visible="visible"
  />
  <BaseSnackbar
    :action-label="snackbarActionLabel"
    :icon-src="snackbarIconSrc"
    :message="snackbarMessage"
    :placement="snackbarPlacement"
    :title="snackbarTitle"
    :visible="snackbarVisible"
    @activate="activateSnackbar"
    @dismiss="dismissSnackbar"
  />
</template>
