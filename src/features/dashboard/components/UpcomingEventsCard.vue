<script setup>
import plusIcon from '@/assets/icons/Category/plusIcon.svg'
import DetailLinkButton from '@/common/components/common/DetailLinkButton.vue'

defineProps({
  events: {
    type: Array,
    default: () => [],
  },
  remainingCount: {
    type: Number,
    default: 0,
  },
  canAdd: {
    type: Boolean,
    default: false,
  },
})

defineEmits(['add', 'show-more'])

function formatDate(date) {
  if (!date) return ''

  const [, month, day] = date.slice(0, 10).split('-').map(Number)

  return month && day ? `${month}월 ${day}일` : date
}

function formatSchedule(event) {
  const start = formatDate(event.startDate)
  const endDate = event.endDate

  if (!endDate || endDate === event.startDate) return start
  return `${start} 시작`
}

function formatDday(dday) {
  return Number(dday) === 0 ? 'D-day' : `D-${dday}`
}
</script>

<template>
  <section class="upcoming-events-card">
    <header class="upcoming-events-card__header">
      <h2>예정된 이벤트</h2>
      <button
        v-if="canAdd"
        type="button"
        aria-label="이벤트 추가"
        @click="$emit('add')"
      >
        <img
          :src="plusIcon"
          alt=""
          aria-hidden="true"
        >
      </button>
    </header>

    <ul
      v-if="events.length"
      class="upcoming-events-card__list"
    >
      <li
        v-for="event in events.slice(0, 2)"
        :key="event.id"
        class="upcoming-events-card__event"
      >
        <div>
          <strong>{{ event.title }}</strong>
          <time :datetime="event.startDate">{{ formatSchedule(event) }}</time>
        </div>
        <span
          class="app-label"
          :class="Number(event.dday) === 0 ? 'label--notification' : 'label--safe'"
        >
          {{ formatDday(event.dday) }}
        </span>
      </li>
    </ul>

    <p
      v-else
      class="upcoming-events-card__empty"
    >
      예정된 이벤트가 없어요.
    </p>

    <DetailLinkButton
      class="upcoming-events-card__more"
      @click="$emit('show-more')"
    >
      {{ remainingCount > 0 ? `${remainingCount}개 더 보기` : '이벤트 전체 보기' }}
    </DetailLinkButton>
  </section>
</template>

<style scoped>
.upcoming-events-card {
  display: flex;
  width: 100%;
  min-width: 0;
  min-height: 0;
  aspect-ratio: 1;
  flex-direction: column;
  gap: var(--space-12);
  padding: var(--space-20);
  border-radius: var(--dashboard-card-radius);
  background: var(--dashboard-card-background);
}

.upcoming-events-card__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}

.upcoming-events-card__header h2 {
  margin: 0;
  color: var(--gray-600);
  font-size: 14px;
  font-weight: var(--weight-bold);
  line-height: 1.5;
}

.upcoming-events-card__header button {
  display: grid;
  width: 24px;
  height: 24px;
  padding: 0;
  border: 0;
  background: transparent;
  cursor: pointer;
  place-items: center;
}

.upcoming-events-card__header img {
  display: block;
  width: 14px;
  height: 14px;
}

.upcoming-events-card__list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 0;
  margin: 0;
  list-style: none;
}

.upcoming-events-card__event {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.upcoming-events-card__event div {
  display: flex;
  min-width: 0;
  flex-direction: column;
}

.upcoming-events-card__event strong {
  overflow: hidden;
  color: var(--gray-900);
  font-size: 14px;
  line-height: 1.3;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.upcoming-events-card__event time {
  color: var(--dashboard-muted-text);
  font-size: 11px;
  line-height: 1.3;
}

.upcoming-events-card__event > span {
  flex: 0 0 auto;
}

.upcoming-events-card__more {
  align-self: center;
  margin-top: auto;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--dashboard-muted-text);
  cursor: pointer;
  font-size: 11px;
  line-height: 1.5;
}

.upcoming-events-card__empty {
  display: grid;
  flex: 1;
  place-items: center;
  margin: 0;
  color: var(--gray-500);
  font-size: 12px;
}
</style>
