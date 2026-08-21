<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'

import alarmIcon from '@/assets/icons/alarmIcon.png'
import { useNotificationStore } from '@/features/notifications/stores/notification.store'
import { normalizeNotificationDeepLink } from '@/features/notifications/utils/notificationDeepLink'

const router = useRouter()
const notificationStore = useNotificationStore()

const notification = computed(() => notificationStore.foregroundNotification)

const notificationLabels = {
  MISSION_COMPLETED: '미션',
  DAILY_MISSION_AVAILABLE: '미션',
  MARKET_REPORT_ARRIVED: '시장 리포트',
  RANKING_RISEN: '랭킹',
  MONTHLY_INVESTMENT_REPORT_ARRIVED: '투자 가이드',
}

const categoryLabel = computed(() => notificationLabels[notification.value?.type] || '제대로 알림')

function dismiss() {
  notificationStore.dismissForegroundNotification(notification.value?.key)
}

async function openNotification() {
  const target = notification.value
  if (!target) return

  notificationStore.dismissForegroundNotification(target.key)
  if (target.notificationId) {
    void notificationStore.markForegroundNotificationRead(target.notificationId).catch(() => {})
  }
  await router.push(normalizeNotificationDeepLink(target.deepLink))
}
</script>

<template>
  <Teleport to="body">
    <Transition
      name="in-app-notification"
      mode="out-in"
    >
      <aside
        v-if="notification"
        :key="notification.key"
        class="in-app-notification"
        role="status"
        aria-live="polite"
      >
        <button
          type="button"
          class="in-app-notification__content"
          :aria-label="`${notification.title}. ${notification.body}`"
          @click="openNotification"
        >
          <span
            class="in-app-notification__icon"
            aria-hidden="true"
          >
            <img
              :src="alarmIcon"
              alt=""
            >
          </span>

          <span class="in-app-notification__copy">
            <span class="in-app-notification__eyebrow">
              <i aria-hidden="true" />
              {{ categoryLabel }}
            </span>
            <strong>{{ notification.title }}</strong>
            <span
              v-if="notification.body"
              class="in-app-notification__body"
            >{{ notification.body }}</span>
          </span>
        </button>

        <button
          type="button"
          class="in-app-notification__close"
          aria-label="인앱 알림 닫기"
          @click="dismiss"
        >
          &times;
        </button>
      </aside>
    </Transition>
  </Teleport>
</template>

<style scoped>
.in-app-notification {
  position: fixed;
  z-index: var(--z-toast);
  top: calc(var(--safe-area-top) + 10px);
  left: 50%;
  display: grid;
  box-sizing: border-box;
  width: min(calc(100vw - 24px), 369px);
  min-height: 78px;
  grid-template-columns: minmax(0, 1fr) 32px;
  padding: 8px 8px 8px 10px;
  overflow: hidden;
  border: 1px solid rgb(255 255 255 / 72%);
  border-radius: 24px;
  background:
    radial-gradient(circle at 7% 0%, rgb(255 255 255 / 82%), transparent 36%),
    radial-gradient(circle at 92% 116%, rgb(255 226 109 / 25%), transparent 42%),
    linear-gradient(135deg, rgb(235 255 244 / 88%), rgb(255 255 255 / 78%));
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / 92%),
    inset 0 -1px 0 rgb(32 186 92 / 9%),
    0 14px 36px rgb(38 80 54 / 16%),
    0 2px 8px rgb(38 80 54 / 8%);
  -webkit-backdrop-filter: blur(20px) saturate(135%);
  backdrop-filter: blur(20px) saturate(135%);
  transform: translateX(-50%);
  isolation: isolate;
}

.in-app-notification::after {
  position: absolute;
  z-index: -1;
  inset: 1px;
  border: 1px solid rgb(255 255 255 / 34%);
  border-radius: inherit;
  content: '';
  pointer-events: none;
}

.in-app-notification__content {
  display: grid;
  min-width: 0;
  grid-template-columns: 48px minmax(0, 1fr);
  gap: 10px;
  align-items: center;
  padding: 0;
  text-align: left;
}

.in-app-notification__icon {
  display: grid;
  width: 48px;
  height: 48px;
  border: 1px solid rgb(255 255 255 / 68%);
  border-radius: 17px;
  background:
    radial-gradient(circle at 30% 20%, rgb(255 255 255 / 78%), transparent 42%),
    linear-gradient(145deg, rgb(98 255 156 / 38%), rgb(255 226 109 / 26%));
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / 82%),
    0 5px 14px rgb(32 186 92 / 12%);
  place-items: center;
}

.in-app-notification__icon img {
  width: 24px;
  height: 24px;
  object-fit: contain;
  opacity: 0.84;
}

.in-app-notification__copy {
  display: grid;
  min-width: 0;
  gap: 2px;
}

.in-app-notification__eyebrow {
  display: flex;
  align-items: center;
  gap: 5px;
  color: var(--green-800);
  font-family: var(--font-body);
  font-size: 10px;
  font-weight: var(--weight-bold);
  letter-spacing: 0.02em;
  line-height: 1.3;
}

.in-app-notification__eyebrow i {
  width: 5px;
  height: 5px;
  flex: 0 0 auto;
  border-radius: var(--radius-full);
  background: var(--green-600);
  box-shadow: 0 0 0 3px rgb(59 225 120 / 14%);
}

.in-app-notification__copy strong {
  overflow: hidden;
  color: var(--gray-900);
  font-family: var(--font-body);
  font-size: 14px;
  font-weight: var(--weight-bold);
  line-height: 1.35;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.in-app-notification__body {
  display: -webkit-box;
  overflow: hidden;
  color: var(--gray-600);
  font-family: var(--font-body);
  font-size: 11px;
  line-height: 1.35;
  white-space: pre-line;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.in-app-notification__close {
  align-self: start;
  width: 32px;
  height: 32px;
  border-radius: var(--radius-full);
  color: var(--gray-500);
  font-family: var(--font-body);
  font-size: 23px;
  font-weight: var(--weight-regular);
  line-height: 1;
}

.in-app-notification__content:active,
.in-app-notification__close:active {
  opacity: 0.62;
}

.in-app-notification-enter-active,
.in-app-notification-leave-active {
  transition:
    opacity 360ms var(--ease-default),
    transform 420ms cubic-bezier(0.22, 1, 0.36, 1);
}

.in-app-notification-enter-from,
.in-app-notification-leave-to {
  opacity: 0;
  transform: translate3d(-50%, -24px, 0) scale(0.96);
}

@media (prefers-reduced-motion: reduce) {
  .in-app-notification-enter-active,
  .in-app-notification-leave-active {
    transition-duration: 1ms;
  }
}

@media (prefers-reduced-transparency: reduce) {
  .in-app-notification {
    background: #f5fff9;
    -webkit-backdrop-filter: none;
    backdrop-filter: none;
  }
}

@supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))) {
  .in-app-notification {
    background: #f5fff9;
  }
}
</style>
