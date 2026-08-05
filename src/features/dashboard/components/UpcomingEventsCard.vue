<script setup>
import plusIcon from '@/assets/icons/plusIcon.png'

defineProps({
  events: {
    type: Array,
    default: () => [],
  },
  remainingCount: {
    type: Number,
    default: 0,
  },
})

defineEmits(['add', 'show-more'])

function formatDate(date) {
  if (!date) return ''

  const [, month, day] = date.slice(0, 10).split('-').map(Number)

  return month && day ? `${month}월 ${day}일` : date
}

function formatSchedule(event) {
  const start = formatDate(event.startDate || event.date)
  const endDate = event.endDate

  if (!endDate || endDate === (event.startDate || event.date)) return start
  return `${start} ~ ${formatDate(endDate)} (${event.durationDays}일)`
}
</script>

<template>
  <section class="upcoming-events-card">
    <header class="upcoming-events-card__header">
      <h2>예정된 이벤트</h2>
      <button
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
          <time :datetime="event.startDate || event.date">{{ formatSchedule(event) }}</time>
        </div>
        <span>D-{{ event.dday }}</span>
      </li>
    </ul>

    <p
      v-else
      class="upcoming-events-card__empty"
    >
      예정된 이벤트가 없어요.
    </p>

    <button
      v-if="remainingCount > 0"
      class="upcoming-events-card__more"
      type="button"
      @click="$emit('show-more')"
    >
      {{ remainingCount }}개 더 보기
    </button>
  </section>
</template>

<style scoped>
.upcoming-events-card {
  display: flex;
  width: 100%;
  height: 170px;
  flex-direction: column;
  gap: 10px;
  padding: 20px;
  border-radius: 28px;
  background: var(--white);
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
  width: 21px;
  height: 21px;
  padding: 0;
  border: 0;
  background: transparent;
  cursor: pointer;
}

.upcoming-events-card__header img {
  display: block;
  width: 21px;
  height: 21px;
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
  color: #666;
  font-size: 11px;
  line-height: 1.3;
}

.upcoming-events-card__event > span {
  flex: 0 0 auto;
  padding: 2px 10px;
  border-radius: 20px;
  background: var(--green-100);
  color: #22c55e;
  font-size: 12px;
  line-height: 1.5;
}

.upcoming-events-card__more {
  align-self: center;
  padding: 0;
  border: 0;
  background: transparent;
  color: #666;
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
