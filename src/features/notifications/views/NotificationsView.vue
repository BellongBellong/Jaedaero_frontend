<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

import accountEmptyMascot from '@/assets/features/onboarding/icons/account-empty-mascot.svg'
import NotificationListItem from '@/features/notifications/components/NotificationListItem.vue'
import { normalizeNotificationDeepLink } from '@/features/notifications/utils/notificationDeepLink'
import { useNotificationStore } from '@/features/notifications/stores/notification.store'

const router = useRouter()
const notificationStore = useNotificationStore()
const hasLoaded = ref(false)
const showEmptyState = computed(
  () =>
    hasLoaded.value &&
    !notificationStore.loading &&
    !notificationStore.error &&
    !notificationStore.items.length,
)
const permissionMessage = computed(() => {
  if (notificationStore.permission === 'denied') {
    return '브라우저 설정에서 제대로의 알림 권한을 허용해주세요.'
  }
  if (notificationStore.permission === 'unsupported') {
    return '이 브라우저에서는 푸시 알림을 사용할 수 없어요.'
  }
  return '미션과 시장 리포트가 도착하면 바로 알려드릴게요.'
})

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
  hasLoaded.value = true
})
</script>

<template>
  <section
    class="notifications-page screen app-page"
    :class="{ 'notifications-page--empty': showEmptyState }"
  >
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

    <section
      v-else-if="showEmptyState"
      class="notification-empty-state"
      role="status"
      aria-live="polite"
    >
      <div
        class="notification-empty-state__visual"
        aria-hidden="true"
      >
        <img
          :src="accountEmptyMascot"
          alt=""
        >
        <div class="notification-empty-state__dots">
          <span />
          <span />
          <span />
        </div>
      </div>
      <div class="notification-empty-state__copy">
        <strong>아직 온 알림이 없어요</strong>
        <p>통신 보안..</p>
      </div>
    </section>

    <section
      v-else
      class="notification-list-section"
    >
      <header class="notification-list-section__header">
        <h2>최근 7일</h2>
      </header>
      <ul class="notification-list">
        <NotificationListItem
          v-for="notification in notificationStore.items"
          :key="notification.notificationId"
          :notification="notification"
          @open="openNotification"
        />
      </ul>
    </section>

    <button
      v-if="notificationStore.hasNext && !showEmptyState"
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
  background: var(--ui-background);
}
.notifications-page--empty {
  background: var(--ui-background);
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
.push-permission-card button {
  padding: 8px 13px;
  border: 0;
  border-radius: var(--radius-full);
  background: var(--green-500);
  color: var(--gray-900);
  font-size: var(--text-xs);
  font-weight: var(--weight-bold);
}

.notification-list-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.notification-list-section__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 0 20px;
}
.notification-list-section__header h2 {
  margin: 0;
  color: var(--ui-sub-title, #757575);
  font-family: var(--body-body-small-bold-font-family, 'Pretendard-Bold', sans-serif);
  font-size: var(--body-body-small-bold-font-size, 14px);
  font-weight: var(--body-body-small-bold-font-weight, 700);
  line-height: var(--body-body-small-bold-line-height, 150%);
}

.notification-list {
  display: flex;
  flex-direction: column;
  padding: 0;
  margin: 0;
  list-style: none;
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
.notification-state button {
  padding: 8px 13px;
  border: 0;
  border-radius: var(--radius-full);
  background: var(--green-500);
  color: var(--gray-900);
  font-size: var(--text-xs);
  font-weight: var(--weight-bold);
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
.notification-empty-state {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 25px;
  align-items: center;
  align-self: stretch;
  padding: 100px 0;
}
.notification-empty-state__visual {
  position: relative;
  flex-shrink: 0;
  width: 191px;
  height: 108px;
  overflow: hidden;
}
.notification-empty-state__visual img {
  position: absolute;
  top: 28px;
  left: 44px;
  width: 54.56px;
  height: 65.14px;
}
.notification-empty-state__dots {
  position: absolute;
  top: 23.91px;
  left: 113px;
  display: flex;
  gap: 10px;
  align-items: center;
}
.notification-empty-state__dots span {
  flex-shrink: 0;
  width: 8.18px;
  height: 8.18px;
  border-radius: 50%;
  background: var(--ui-light-gray, #ececec);
}
.notification-empty-state__copy {
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: center;
  flex-shrink: 0;
}
.notification-empty-state__copy strong {
  color: var(--gray-400, #bdbdbd);
  font-family: var(--body-heading-h5-bold-font-family, 'Pretendard-Bold', sans-serif);
  font-size: var(--body-heading-h5-bold-font-size, 20px);
  font-weight: var(--body-heading-h5-bold-font-weight, 700);
  line-height: var(--body-heading-h5-bold-line-height, 150%);
}
.notification-empty-state__copy p {
  margin: 0;
  color: var(--ui-sub-title, #757575);
  font-family: var(--body-body-medium-regular-font-family, 'Pretendard-Regular', sans-serif);
  font-size: var(--body-body-medium-regular-font-size, 16px);
  font-weight: var(--body-body-medium-regular-font-weight, 400);
  letter-spacing: var(--body-body-medium-regular-letter-spacing, -0.04em);
  line-height: var(--body-body-medium-regular-line-height, 150%);
  text-align: center;
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
  padding: 8px 13px;
  align-self: center;
  margin-top: 2px;
  border: 0;
  border-radius: var(--radius-full);
  background: var(--green-500);
  color: var(--gray-900);
  font-size: var(--text-xs);
  font-weight: var(--weight-bold);
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
