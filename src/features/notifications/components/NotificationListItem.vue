<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

import missionAlarmIcon from '@/assets/features/notification/missionAlarmIcon.png'
import rankingAlarmIcon from '@/assets/features/notification/rankingAlarmIcon.png'
import reportAlarmIcon from '@/assets/features/notification/reportAlarmIcon.png'

const props = defineProps({
  notification: { type: Object, required: true },
})

defineEmits(['open'])

const now = ref(Date.now())
let refreshTimer
const notificationType = computed(
  () => props.notification.notificationType ?? props.notification.type,
)

const notificationMeta = {
  MISSION_COMPLETED: {
    label: '미션 달성',
    icon: missionAlarmIcon,
    title: (notification) => {
      const missionName = notification.missionName || notification.missionTitle
      return missionName
        ? `오늘의 ${missionName} 미션을 달성했어요!`
        : notification.title || '오늘의 미션을 달성했어요!'
    },
    description: (notification) => {
      const count =
        notification.completedMissionCount ??
        notification.monthlyCompletedMissionCount ??
        notification.achievedMissionCount
      return count == null
        ? notification.body || notification.message || '이번 달 달성 미션 : ~개'
        : `이번 달 달성 미션 : ${count}개`
    },
  },
  MARKET_REPORT_ARRIVED: {
    label: '오늘의 시장 리포트',
    icon: reportAlarmIcon,
    hideDescription: true,
    title: () => '오늘의 시장 리포트가 도착했어요',
  },
  RANKING_RISEN: {
    label: '랭킹 상승',
    icon: rankingAlarmIcon,
    title: () => '이번 달 동기 랭킹 TOP3 안에 들었어요!',
    description: () => '동기 랭킹 현황 보러 가기',
  },
  DAILY_MISSION_AVAILABLE: {
    label: '오늘의 미션',
    icon: missionAlarmIcon,
    title: () => '오늘의 미션을 확인해보세요',
    description: () => '미션을 수행하고 뱃지 레벨을 올려보세요',
    actionLabel: '오늘의 미션 보러가기',
  },
  MONTHLY_INVESTMENT_REPORT_ARRIVED: {
    label: '적립식 투자 가이드 도착',
    icon: reportAlarmIcon,
    description: () => '이번 달의 새 리포트가 도착했어요',
    title: () => '이번 달의 새 리포트가 도착했어요',
    actionLabel: '투자 가이드 보러가기',
  },
}

const meta = computed(
  () =>
    notificationMeta[notificationType.value] || {
      label: '알림',
      icon: missionAlarmIcon,
      title: () => props.notification.title || '새 알림이 도착했어요',
    },
)

const isRead = computed(() => props.notification.read ?? props.notification.isRead ?? false)
const title = computed(() => meta.value.title(props.notification))
const description = computed(() =>
  meta.value.hideDescription
    ? ''
    : meta.value.description?.(props.notification) ||
      props.notification.body ||
      props.notification.message ||
      '',
)
const actionLabel = computed(() => {
  const label = props.notification.actionLabel || meta.value.actionLabel
  return label && !description.value?.includes(label) ? label : ''
})

function formatRelativeTime(value) {
  const createdAt = new Date(value).getTime()
  if (Number.isNaN(createdAt)) return ''

  const elapsed = Math.max(0, now.value - createdAt)
  const minute = 60 * 1000
  const hour = 60 * minute
  const day = 24 * hour

  if (elapsed < minute) return '지금'
  if (elapsed < hour) return `${Math.floor(elapsed / minute)}분 전`
  if (elapsed < day) return `${Math.floor(elapsed / hour)}시간 전`

  const days = Math.floor(elapsed / day)
  return days === 1 ? '하루 전' : `${days}일 전`
}

onMounted(() => {
  refreshTimer = window.setInterval(() => {
    now.value = Date.now()
  }, 60 * 1000)
})

onBeforeUnmount(() => window.clearInterval(refreshTimer))
</script>

<template>
  <li
    class="notification-list-item"
    :class="{ 'notification-list-item--unread': !isRead }"
  >
    <button
      class="notification-list-item__button"
      type="button"
      @click="$emit('open', notification)"
    >
      <span
        class="notification-list-item__icon-wrap"
        aria-hidden="true"
      >
        <img
          class="notification-list-item__icon"
          :src="meta.icon"
          alt=""
        >
      </span>
      <span class="notification-list-item__content">
        <span class="notification-list-item__meta">
          <span class="notification-list-item__category">{{ meta.label }}</span>
          <time :datetime="notification.createdAt">{{
            formatRelativeTime(notification.createdAt)
          }}</time>
        </span>
        <strong class="notification-list-item__title">{{ title }}</strong>
        <span
          v-if="description"
          class="notification-list-item__description"
        >{{ description }}</span>
        <span
          v-if="actionLabel"
          class="notification-list-item__action"
        >{{ actionLabel }}</span>
      </span>
    </button>
  </li>
</template>

<style scoped>
.notification-list-item {
  width: 100%;
  background: transparent;
}
.notification-list-item--unread {
  background: rgb(98 255 156 / 20%);
}
.notification-list-item__button {
  display: flex;
  width: 100%;
  gap: 3px;
  align-items: flex-start;
  padding: 20px;
  border: 0;
  border-radius: 0;
  background: transparent;
  color: inherit;
  text-align: left;
}
.notification-list-item__icon-wrap {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  padding: 6px 4px 0;
}
.notification-list-item__icon {
  display: block;
  width: 20px;
  height: 20px;
  object-fit: contain;
}
.notification-list-item__content {
  display: flex;
  min-width: 0;
  flex: 1;
  flex-direction: column;
  gap: 4px;
}
.notification-list-item__meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding-top: 4px;
}
.notification-list-item__category {
  min-width: 0;
  color: var(--ui-sub-title, #757575);
  font-size: 14px;
  font-weight: var(--weight-regular, 400);
  line-height: 1.5;
}
.notification-list-item__meta time {
  flex-shrink: 0;
  color: var(--ui-sub-title-light, #bdbdbd);
  font-size: 12px;
  font-weight: var(--weight-regular, 400);
  line-height: 1.3;
}
.notification-list-item__title {
  color: var(--ui-text, #333);
  font-size: 14px;
  font-weight: var(--weight-bold, 700);
  line-height: 1.5;
}
.notification-list-item__description,
.notification-list-item__action {
  color: var(--brand-deepgreen, #20ba5c);
  font-size: 12px;
  font-weight: var(--weight-regular, 400);
  line-height: 1.5;
}
</style>
