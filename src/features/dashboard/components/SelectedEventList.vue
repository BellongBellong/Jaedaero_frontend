<script setup>
import { computed } from 'vue'

import plusIcon from '@/assets/icons/Category/plusIcon.svg'

const props = defineProps({
  events: {
    type: Array,
    default: () => [],
  },
  selectedDate: {
    type: String,
    required: true,
  },
})

defineEmits(['add'])

const selectedEvents = computed(() =>
  props.events.filter((event) => {
    const startDate = event.startDate || event.date
    const endDate = event.endDate || startDate
    return startDate <= props.selectedDate && props.selectedDate <= endDate
  }),
)

const selectedDateTitle = computed(() => {
  const [, month, day] = props.selectedDate.split('-').map(Number)
  return `${month}월 ${day}일 일정`
})

function formatShortDate(value) {
  const [, month, day] = value.slice(0, 10).split('-').map(Number)
  return `${month}월 ${day}일`
}

function formatSchedule(event) {
  const startDate = event.startDate || event.date
  const endDate = event.endDate || startDate
  if (startDate === endDate) return formatShortDate(startDate)
  return `${formatShortDate(startDate)} ~ ${formatShortDate(endDate)}`
}

function ddayLabel(dday) {
  return Number(dday) === 0 ? 'D-day' : `D-${dday}`
}

function urgencyClass(dday) {
  const days = Number(dday)
  if (days <= 1) return 'selected-event-list__item--urgent'
  if (days <= 7) return 'selected-event-list__item--soon'
  if (days <= 29) return 'selected-event-list__item--planned'
  return 'selected-event-list__item--later'
}
</script>

<template>
  <section class="selected-event-list">
    <h2>{{ selectedDateTitle }}</h2>

    <ul v-if="selectedEvents.length">
      <li
        v-for="event in selectedEvents"
        :key="event.id"
        class="selected-event-list__item"
        :class="urgencyClass(event.dday)"
      >
        <span
          class="selected-event-list__marker"
          aria-hidden="true"
        />
        <div>
          <strong>{{ event.title }}</strong>
          <time :datetime="event.startDate">{{ formatSchedule(event) }}</time>
        </div>
        <span class="selected-event-list__dday">
          {{ ddayLabel(event.dday) }}
        </span>
      </li>
    </ul>

    <div
      v-else
      class="selected-event-list__empty"
    >
      <strong>일정이 없습니다.</strong>
      <button
        type="button"
        @click="$emit('add')"
      >
        <img
          :src="plusIcon"
          alt=""
          aria-hidden="true"
        >
        일정 추가
      </button>
    </div>
  </section>
</template>

<style scoped>
.selected-event-list {
  width: 100%;
  padding: var(--space-20);
  border-radius: 28px;
  background: var(--white);
}

.selected-event-list h2 {
  margin: 0;
  color: var(--gray-600);
  font-size: 14px;
  font-weight: var(--weight-bold);
  line-height: 1.5;
}

.selected-event-list ul {
  display: grid;
  gap: 10px;
  padding: 18px 0 0;
  margin: 0;
  list-style: none;
}

.selected-event-list__item {
  --event-color: var(--gray-600);
  --event-label-background: var(--gray-200);

  display: grid;
  min-width: 0;
  min-height: 64px;
  grid-template-columns: 22px minmax(0, 1fr) auto;
  align-items: center;
  gap: 10px;
  padding: 7px 20px;
  border: 1px solid rgb(255 255 255 / 72%);
  border-radius: 20px;
  background: linear-gradient(117.93deg, rgb(236 236 236 / 28%) 0%, rgb(255 255 255 / 14%) 100%);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
}

.selected-event-list__marker {
  width: 10px;
  height: 10px;
  justify-self: center;
  border-radius: 50%;
  background: var(--event-color);
}

.selected-event-list__item > div {
  display: grid;
  min-width: 0;
  gap: 2px;
}

.selected-event-list__item strong {
  overflow: hidden;
  color: var(--ui-sub-title);
  font-size: 14px;
  font-weight: var(--weight-bold);
  line-height: 1.5;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.selected-event-list__item time {
  overflow: hidden;
  color: var(--sub-black, #888);
  font-size: 12px;
  line-height: 1.3;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.selected-event-list__dday {
  padding: 2px 10px;
  border-radius: var(--radius-full);
  background: var(--event-label-background);
  color: var(--event-color);
  font-size: 12px;
  font-weight: var(--weight-bold);
  line-height: 1.5;
}

.selected-event-list__item--urgent {
  --event-color: var(--orange-600);
  --event-label-background: var(--orange-50);
}

.selected-event-list__item--soon {
  --event-color: var(--green-700);
  --event-label-background: var(--green-100);
}

.selected-event-list__item--planned {
  --event-color: var(--olive-500);
  --event-label-background: var(--olive-100);
}

.selected-event-list__item--later {
  --event-color: var(--gray-600);
  --event-label-background: var(--gray-200);
}

.selected-event-list__empty {
  display: flex;
  min-height: 135px;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 10px;
}

.selected-event-list__empty > strong {
  color: var(--gray-400);
  font-size: 14px;
  line-height: 1.5;
}

.selected-event-list__empty button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 10px 20px;
  border: 0;
  border-radius: 15px;
  background: var(--ui-light-gray);
  color: var(--gray-500);
  cursor: pointer;
  font-family: var(--font-body);
  font-size: 12px;
  font-weight: var(--weight-bold);
}

.selected-event-list__empty img {
  width: 24px;
  height: 24px;
}

@media (max-width: 350px) {
  .selected-event-list__item {
    grid-template-columns: 16px minmax(0, 1fr) auto;
    padding-inline: 12px;
  }
}
</style>
