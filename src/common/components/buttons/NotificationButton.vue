<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'

import alarmIcon from '@/assets/icons/alarmIcon.png'
import alarmIconActiveBlue from '@/assets/icons/alarmIconActiveBlue.png'
import alarmIconActiveGreen from '@/assets/icons/alarmIconActiveGreen.png'
import { useNotificationStore } from '@/features/notifications/stores/notification.store'

const props = defineProps({
  mode: { type: String, default: 'military' },
})

const router = useRouter()
const notificationStore = useNotificationStore()
const hasUnreadNotifications = computed(() => Boolean(notificationStore.unreadCount))
const notificationIcon = computed(() => {
  if (!hasUnreadNotifications.value) return alarmIcon
  return props.mode === 'vacation' ? alarmIconActiveBlue : alarmIconActiveGreen
})
const badgeLabel = computed(() =>
  notificationStore.unreadCount > 99 ? '99+' : String(notificationStore.unreadCount),
)
</script>

<template>
  <button
    class="notification-button"
    :class="`notification-button--${mode}`"
    type="button"
    :aria-label="`알림${notificationStore.unreadCount ? ` ${badgeLabel}개 읽지 않음` : ''}`"
    @click="router.push({ name: 'notifications' })"
  >
    <img
      class="notification-button__icon"
      :class="{ 'notification-button__icon--active': hasUnreadNotifications }"
      :src="notificationIcon"
      alt=""
      aria-hidden="true"
    >
    <span
      v-if="notificationStore.unreadCount"
      class="notification-button__badge"
      aria-hidden="true"
    >{{ badgeLabel }}</span>
  </button>
</template>

<style scoped>
.notification-button {
  position: relative;
  display: grid;
  width: 40px;
  height: 40px;
  place-items: center;
  border: 1px solid rgb(255 255 255 / 52%);
  border-radius: var(--radius-full);
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / 76%),
    inset 0 -1px 0 rgb(255 255 255 / 20%),
    0 7px 18px rgb(35 54 42 / 9%);
  transition:
    background var(--duration-slow) var(--ease-default),
    box-shadow var(--duration-slow) var(--ease-default);
  backdrop-filter: blur(18px) saturate(135%);
  -webkit-backdrop-filter: blur(18px) saturate(135%);
}

.notification-button__badge {
  position: absolute;
  top: -4px;
  right: -5px;
  display: grid;
  min-width: 18px;
  height: 18px;
  padding: 0 4px;
  border: 2px solid var(--gray-50);
  border-radius: var(--radius-full);
  background: var(--orange-500);
  color: var(--white);
  font-size: 10px;
  font-weight: var(--weight-bold);
  line-height: 1;
  place-items: center;
}

.notification-button--military {
  background:
    radial-gradient(circle at 32% 20%, rgb(255 255 255 / 58%), transparent 38%),
    linear-gradient(180deg, rgb(196 255 219 / 52%), rgb(255 244 184 / 45%));
}

.notification-button--vacation {
  background:
    radial-gradient(circle at 32% 20%, rgb(255 255 255 / 62%), transparent 38%),
    linear-gradient(180deg, rgb(190 222 255 / 58%), rgb(230 242 255 / 44%));
}

@media (display-mode: standalone) {
  .notification-button {
    -webkit-backdrop-filter: none;
    backdrop-filter: none;
  }
}

.notification-button__icon {
  width: 38px;
  height: 38px;
  object-fit: contain;
  opacity: 0.86;
}
.notification-button__icon--active {
  width: 18px;
  height: auto;
}
</style>
