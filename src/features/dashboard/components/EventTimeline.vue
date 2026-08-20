<script setup>
import { computed } from 'vue'

const props = defineProps({
  events: {
    type: Array,
    default: () => [],
  },
})

defineEmits(['delete'])

const sortedEvents = computed(() =>
  [...props.events].sort((first, second) => {
    const ddayDifference = Number(first.dday) - Number(second.dday)
    if (ddayDifference) return ddayDifference

    return String(first.startDate || first.date || '').localeCompare(
      String(second.startDate || second.date || ''),
    )
  }),
)

function parseDate(value) {
  const [year, month, day] = value.slice(0, 10).split('-').map(Number)
  return new Date(year, month - 1, day)
}

function formatDate(value) {
  const date = parseDate(value)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}. ${month}. ${day}`
}

function formatSchedule(event) {
  const startDate = event.startDate || event.date
  const endDate = event.endDate || startDate

  if (startDate === endDate) {
    const weekday = new Intl.DateTimeFormat('ko-KR', { weekday: 'long' }).format(
      parseDate(startDate),
    )
    return `${formatDate(startDate)} · ${weekday}`
  }

  const durationDays = Math.max(
    1,
    Math.round((parseDate(endDate) - parseDate(startDate)) / 86_400_000) + 1,
  )
  return `${formatDate(startDate)} ~ ${formatDate(endDate)} (${durationDays}일)`
}

function ddayLabel(dday) {
  const days = Number(dday)
  if (days === 0) return 'D-day'
  return days > 0 ? `D-${days}` : `D+${Math.abs(days)}`
}

function urgencyClass(dday) {
  const days = Number(dday)
  if (days < 0) return 'event-timeline__item--past'
  if (days <= 1) return 'event-timeline__item--urgent'
  if (days <= 7) return 'event-timeline__item--soon'
  if (days <= 29) return 'event-timeline__item--planned'
  return 'event-timeline__item--later'
}
</script>

<template>
  <section class="event-timeline">
    <h2>일정 타임라인</h2>

    <ol
      v-if="sortedEvents.length"
      class="event-timeline__list"
    >
      <li
        v-for="event in sortedEvents"
        :key="event.id"
        class="event-timeline__item"
        :class="urgencyClass(event.dday)"
      >
        <span
          class="event-timeline__marker"
          aria-hidden="true"
        />
        <div class="event-timeline__content">
          <strong>{{ event.title }}</strong>
          <time :datetime="event.startDate">
            {{ formatSchedule(event) }}
          </time>
        </div>
        <span class="event-timeline__dday app-label label--dynamic">
          {{ ddayLabel(event.dday) }}
        </span>
        <button
          class="event-timeline__delete"
          type="button"
          @click="$emit('delete', event)"
        >
          삭제
        </button>
      </li>
    </ol>

    <p
      v-else
      class="event-timeline__empty"
    >
      예정된 이벤트가 없어요.
    </p>
  </section>
</template>

<style scoped>
.event-timeline {
  width: 100%;
  padding: var(--space-20);
  border-radius: 26px;
  background: var(--white);
}

.event-timeline h2 {
  margin: 0 0 14px;
  color: var(--ui-sub-title);
  font-size: 14px;
  font-weight: var(--weight-bold);
  line-height: 1.5;
}

.event-timeline__list {
  position: relative;
  display: grid;
  gap: 0;
  padding: 0;
  margin: 0;
  list-style: none;
}

.event-timeline__list::before {
  position: absolute;
  top: 12px;
  bottom: 12px;
  left: 10px;
  width: 2px;
  background: linear-gradient(
    180deg,
    rgb(189 189 189 / 10%) 0%,
    rgb(189 189 189 / 58%) 20%,
    rgb(189 189 189 / 58%) 80%,
    rgb(189 189 189 / 10%) 100%
  );
  content: '';
}

.event-timeline__item {
  position: relative;
  display: grid;
  min-width: 0;
  min-height: 62px;
  grid-template-columns: 22px minmax(0, 1fr) auto auto;
  align-items: start;
  column-gap: 14px;
  padding: 5px 0 8px;
}

.event-timeline__marker {
  z-index: 1;
  width: 13px;
  height: 13px;
  justify-self: center;
  border: 2.42px solid var(--white);
  border-radius: 50%;
  margin-top: 0;
  background: var(--timeline-color);
}

.event-timeline__content {
  display: grid;
  min-width: 0;
  gap: 4px;
}

.event-timeline__content strong {
  overflow: hidden;
  color: var(--ui-sub-title);
  font-size: 14px;
  font-weight: var(--weight-bold);
  line-height: 1.5;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.event-timeline__content time {
  overflow: hidden;
  color: var(--sub-black, #888);
  font-size: 12px;
  font-weight: var(--weight-regular);
  line-height: 1.3;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.event-timeline__dday {
  --label-background: var(--timeline-label-background);
  --label-color: var(--timeline-color);
}

.event-timeline__delete {
  padding: 4px 0;
  border: 0;
  background: transparent;
  color: var(--gray-500);
  cursor: pointer;
  font: inherit;
  font-size: 12px;
}

.event-timeline__item--past {
  --timeline-color: var(--gray-500);
  --timeline-label-background: var(--gray-100);
}

.event-timeline__item--urgent {
  --timeline-color: var(--orange-600);
  --timeline-label-background: var(--orange-50);
}

.event-timeline__item--soon {
  --timeline-color: var(--green-700);
  --timeline-label-background: var(--green-100);
}

.event-timeline__item--planned {
  --timeline-color: var(--olive-500);
  --timeline-label-background: var(--olive-100);
}

.event-timeline__item--later {
  --timeline-color: var(--gray-600);
  --timeline-label-background: var(--gray-200);
}

.event-timeline__empty {
  display: grid;
  min-height: 120px;
  place-items: center;
  margin: 0;
  color: var(--gray-500);
  font-size: 13px;
}

@media (max-width: 350px) {
  .event-timeline__item {
    column-gap: 8px;
  }

  .event-timeline__content time {
    font-size: 10px;
  }
}
</style>
