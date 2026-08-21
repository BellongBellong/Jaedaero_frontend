<script setup>
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

import { normalizeNotificationDeepLink } from '@/features/notifications/utils/notificationDeepLink'
import { useNotificationStore } from '@/features/notifications/stores/notification.store'

const router = useRouter()
const notificationStore = useNotificationStore()

const notificationMeta = {
  MISSION_COMPLETED: { icon: '✓', tone: 'green', label: '미션 달성' },
  MARKET_REPORT_ARRIVED: { icon: '↗', tone: 'yellow', label: '오늘의 시장 리포트' },
  RANKING_RISEN: { icon: '★', tone: 'orange', label: '랭킹 상승' },
  DAILY_MISSION_AVAILABLE: { icon: '!', tone: 'olive', label: '오늘의 미션' },
  MONTHLY_INVESTMENT_REPORT_ARRIVED: { icon: '₩', tone: 'green', label: '투자 가이드' },
}

const permissionMessage = computed(() => {
  if (notificationStore.permission === 'denied') {
    return '브라우저 설정에서 제대로의 알림 권한을 허용해주세요.'
  }
  if (notificationStore.permission === 'unsupported') {
    return '이 브라우저에서는 푸시 알림을 사용할 수 없어요.'
  }
  return '미션과 시장 리포트가 도착하면 바로 알려드릴게요.'
})

function metaFor(type) {
  return notificationMeta[type] || { icon: '•', tone: 'olive', label: '알림' }
}

function formatCreatedAt(value) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''

  const elapsed = Date.now() - date.getTime()
  const minutes = Math.floor(elapsed / 60_000)
  if (minutes < 1) return '방금 전'
  if (minutes < 60) return `${minutes}분 전`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}시간 전`

  return new Intl.DateTimeFormat('ko-KR', {
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

async function enablePush() {
  try {
    await notificationStore.enablePush()
  } catch {
    // 오류 상태는 store가 보관하며 CTA 아래에서 안내한다.
  }
}

async function openNotification(notification) {
  try {
    await notificationStore.markRead(notification.notificationId)
  } catch {
    return
  }

  if (notification.deepLink) {
    await router.push(normalizeNotificationDeepLink(notification.deepLink))
  }
}

onMounted(async () => {
  await Promise.allSettled([notificationStore.load(), notificationStore.refreshUnreadCount()])
})
</script>

<template>
  <section class="notifications-page screen app-page">
    <section
      v-if="!notificationStore.pushEnabled"
      class="push-permission-card"
    >
      <div
        class="push-permission-card__icon"
        aria-hidden="true"
      >
        ♢
      </div>
      <div>
        <strong>푸시 알림 받기</strong>
        <p>{{ permissionMessage }}</p>
      </div>
      <button
        v-if="notificationStore.pushSupported && notificationStore.permission !== 'denied'"
        type="button"
        :disabled="notificationStore.permissionLoading"
        @click="enablePush"
      >
        {{ notificationStore.permissionLoading ? '설정 중' : '켜기' }}
      </button>
    </section>

    <div class="notifications-toolbar">
      <p>
        <b>{{ notificationStore.unreadCount }}</b>개의 읽지 않은 알림
      </p>
      <button
        type="button"
        :disabled="!notificationStore.unreadCount"
        @click="notificationStore.markAllRead"
      >
        모두 읽음
      </button>
    </div>

    <div
      v-if="notificationStore.loading"
      class="notification-skeleton"
      aria-label="알림을 불러오는 중"
    >
      <span
        v-for="index in 4"
        :key="index"
      />
    </div>

    <div
      v-else-if="notificationStore.error"
      class="notification-state"
      role="status"
    >
      <strong>알림을 불러오지 못했어요.</strong>
      <button
        type="button"
        @click="notificationStore.load()"
      >
        다시 시도
      </button>
    </div>

    <div
      v-else-if="!notificationStore.items.length"
      class="notification-state"
    >
      <span aria-hidden="true">♢</span>
      <strong>아직 도착한 알림이 없어요.</strong>
      <p>새로운 미션과 리포트 소식을 여기에 모아드릴게요.</p>
    </div>

    <ul
      v-else
      class="notification-list"
    >
      <li
        v-for="notification in notificationStore.items"
        :key="notification.notificationId"
      >
        <button
          type="button"
          class="notification-item"
          :class="{ 'notification-item--unread': !notification.read }"
          @click="openNotification(notification)"
        >
          <span
            class="notification-item__icon"
            :class="`notification-item__icon--${metaFor(notification.notificationType).tone}`"
            aria-hidden="true"
          >{{ metaFor(notification.notificationType).icon }}</span>
          <span class="notification-item__content">
            <span class="notification-item__meta">
              <b>{{ metaFor(notification.notificationType).label }}</b>
              <time :datetime="notification.createdAt">{{
                formatCreatedAt(notification.createdAt)
              }}</time>
            </span>
            <strong>{{ notification.title }}</strong>
            <span v-if="notification.body">{{ notification.body }}</span>
          </span>
          <i
            v-if="!notification.read"
            aria-label="읽지 않음"
          />
        </button>
      </li>
    </ul>

    <button
      v-if="notificationStore.hasNext"
      class="load-more-button"
      type="button"
      :disabled="notificationStore.loadingMore"
      @click="notificationStore.load({ reset: false })"
    >
      {{ notificationStore.loadingMore ? '불러오는 중' : '이전 알림 더 보기' }}
    </button>
  </section>
</template>

<style scoped>
.notifications-page {
  display: flex;
  flex-direction: column;
  gap: 14px;
  background:
    radial-gradient(circle at 92% 0%, rgb(98 255 156 / 22%), transparent 34%), var(--ui-background);
}

.push-permission-card {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 12px;
  padding: 15px;
  border: 1px solid rgb(255 255 255 / 78%);
  border-radius: var(--radius-xl);
  background: linear-gradient(135deg, var(--green-100), var(--yellow-50));
  box-shadow: var(--shadow-sm);
}

.push-permission-card__icon {
  display: grid;
  width: 38px;
  height: 38px;
  border-radius: var(--radius-full);
  background: rgb(255 255 255 / 72%);
  color: var(--green-700);
  font-size: 22px;
  place-items: center;
}

.push-permission-card strong {
  color: var(--gray-900);
  font-size: var(--text-sm);
}
.push-permission-card p {
  margin: 3px 0 0;
  color: var(--gray-600);
  font-size: var(--text-xs);
  line-height: 1.45;
}
.push-permission-card button,
.load-more-button,
.notification-state button {
  padding: 8px 13px;
  border: 0;
  border-radius: var(--radius-full);
  background: var(--green-500);
  color: var(--gray-900);
  font-size: var(--text-xs);
  font-weight: var(--weight-bold);
}

.notifications-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 2px 4px;
}
.notifications-toolbar p {
  margin: 0;
  color: var(--gray-600);
  font-size: var(--text-xs);
}
.notifications-toolbar p b {
  color: var(--green-700);
}
.notifications-toolbar button {
  padding: 6px;
  border: 0;
  background: transparent;
  color: var(--green-700);
  font-size: var(--text-xs);
  font-weight: var(--weight-bold);
}
.notifications-toolbar button:disabled {
  color: var(--gray-400);
}

.notification-list {
  display: grid;
  gap: 8px;
  padding: 0;
  margin: 0;
  list-style: none;
}
.notification-item {
  position: relative;
  display: grid;
  width: 100%;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: start;
  gap: 12px;
  padding: 15px;
  border: 1px solid var(--gray-200);
  border-radius: var(--radius-xl);
  background: rgb(255 255 255 / 68%);
  color: inherit;
  text-align: left;
}
.notification-item--unread {
  border-color: var(--green-200);
  background: rgb(243 255 248 / 92%);
}
.notification-item__icon {
  display: grid;
  width: 38px;
  height: 38px;
  border-radius: 14px;
  font-weight: var(--weight-bold);
  place-items: center;
}
.notification-item__icon--green {
  background: var(--green-100);
  color: var(--green-700);
}
.notification-item__icon--yellow {
  background: var(--yellow-100);
  color: var(--yellow-800);
}
.notification-item__icon--orange {
  background: var(--orange-100);
  color: var(--orange-700);
}
.notification-item__icon--olive {
  background: var(--olive-100);
  color: var(--olive-600);
}
.notification-item__content {
  display: grid;
  min-width: 0;
  gap: 4px;
}
.notification-item__meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  color: var(--gray-500);
  font-size: 11px;
}
.notification-item__meta b {
  color: var(--green-700);
}
.notification-item__content > strong {
  color: var(--gray-900);
  font-size: var(--text-sm);
  line-height: 1.4;
}
.notification-item__content > span:last-child {
  color: var(--gray-600);
  font-size: var(--text-xs);
  line-height: 1.5;
  white-space: pre-line;
}
.notification-item > i {
  width: 7px;
  height: 7px;
  margin-top: 4px;
  border-radius: var(--radius-full);
  background: var(--green-600);
}

.notification-state {
  display: grid;
  min-height: 260px;
  place-items: center;
  align-content: center;
  gap: 9px;
  padding: 24px;
  color: var(--gray-500);
  text-align: center;
}
.notification-state > span {
  color: var(--green-500);
  font-size: 38px;
}
.notification-state strong {
  color: var(--gray-700);
}
.notification-state p {
  margin: 0;
  font-size: var(--text-xs);
}
.notification-skeleton {
  display: grid;
  gap: 8px;
}
.notification-skeleton span {
  height: 92px;
  border-radius: var(--radius-xl);
  background: linear-gradient(90deg, var(--gray-100), var(--gray-50), var(--gray-100));
  background-size: 200% 100%;
  animation: shimmer 1.4s infinite;
}
.load-more-button {
  align-self: center;
  margin-top: 2px;
}
button:disabled {
  cursor: default;
  opacity: 0.55;
}

@keyframes shimmer {
  to {
    background-position: -200% 0;
  }
}
@media (prefers-reduced-motion: reduce) {
  .notification-skeleton span {
    animation: none;
  }
}
</style>
