<script setup>
import { computed, ref } from 'vue'

import backArrowIcon from '@/assets/icons/backArrowIconGreen.svg'
import nextArrowIcon from '@/assets/icons/nextArrowIcon.svg'

const props = defineProps({
  events: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['select'])

const today = new Date()
const currentYear = today.getFullYear()
const todayValue = toDateString(today)
const visibleDate = ref(new Date(currentYear, today.getMonth(), 1))
const selectedDate = ref('')

const isCurrentMonth = computed(
  () =>
    visibleDate.value.getFullYear() === currentYear &&
    visibleDate.value.getMonth() === today.getMonth(),
)

const caption = computed(() => {
  const year = visibleDate.value.getFullYear()
  const month = visibleDate.value.getMonth() + 1

  return year === currentYear ? `${month}월` : `${year}년 ${month}월`
})

const eventDates = computed(() => {
  const dates = new Set()

  props.events.forEach((event) => {
    const start = parseDate(event.startDate || event.date)
    const end = parseDate(event.endDate || event.startDate || event.date)
    if (!start || !end) return

    const cursor = new Date(start)
    while (cursor <= end) {
      dates.add(toDateString(cursor))
      cursor.setDate(cursor.getDate() + 1)
    }
  })

  return dates
})

const calendarDays = computed(() => {
  const year = visibleDate.value.getFullYear()
  const month = visibleDate.value.getMonth()
  const firstWeekday = new Date(year, month, 1).getDay()
  const lastDay = new Date(year, month + 1, 0).getDate()

  return [
    ...Array.from({ length: firstWeekday }, (_, index) => ({
      key: `blank-${year}-${month}-${index}`,
      empty: true,
    })),
    ...Array.from({ length: lastDay }, (_, index) => {
      const day = index + 1
      const value = toDateString(new Date(year, month, day))

      return {
        key: value,
        day,
        value,
        weekday: new Date(year, month, day).getDay(),
        hasEvent: eventDates.value.has(value),
      }
    }),
  ]
})

function parseDate(value) {
  if (!value) return null
  const [year, month, day] = value.slice(0, 10).split('-').map(Number)
  if (!year || !month || !day) return null
  return new Date(year, month - 1, day)
}

function toDateString(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function changeMonth(offset) {
  visibleDate.value = new Date(
    visibleDate.value.getFullYear(),
    visibleDate.value.getMonth() + offset,
    1,
  )
  selectedDate.value = ''
}

function goToToday() {
  visibleDate.value = new Date(currentYear, today.getMonth(), 1)
  selectedDate.value = ''
}

function selectDate(value) {
  selectedDate.value = value
  emit('select', value)
}
</script>

<template>
  <section
    class="mini-event-calendar"
    aria-label="이벤트 캘린더"
  >
    <header>
      <h2>{{ caption }}</h2>
      <div class="mini-event-calendar__navigation">
        <button
          v-if="!isCurrentMonth"
          class="mini-event-calendar__today-button"
          type="button"
          @click="goToToday"
        >
          오늘
        </button>
        <button
          type="button"
          aria-label="이전 달"
          @click="changeMonth(-1)"
        >
          <img
            :src="backArrowIcon"
            alt=""
            aria-hidden="true"
          >
        </button>
        <button
          type="button"
          aria-label="다음 달"
          @click="changeMonth(1)"
        >
          <img
            :src="nextArrowIcon"
            alt=""
            aria-hidden="true"
          >
        </button>
      </div>
    </header>

    <div
      class="mini-event-calendar__weekdays"
      aria-hidden="true"
    >
      <span
        v-for="(weekday, index) in ['일', '월', '화', '수', '목', '금', '토']"
        :key="weekday"
        :class="{
          'mini-event-calendar__sunday': index === 0,
          'mini-event-calendar__saturday': index === 6,
        }"
      >
        {{ weekday }}
      </span>
    </div>

    <div class="mini-event-calendar__days">
      <template
        v-for="day in calendarDays"
        :key="day.key"
      >
        <span v-if="day.empty" />
        <button
          v-else
          type="button"
          :aria-label="`${caption} ${day.day}일`"
          :aria-pressed="selectedDate === day.value"
          :class="{
            'mini-event-calendar__day--today': day.value === todayValue,
            'mini-event-calendar__day--selected': selectedDate === day.value,
            'mini-event-calendar__sunday': day.weekday === 0,
            'mini-event-calendar__saturday': day.weekday === 6,
          }"
          @click="selectDate(day.value)"
        >
          <span>{{ day.day }}</span>
          <i
            v-if="day.hasEvent"
            aria-label="등록된 이벤트 있음"
          />
        </button>
      </template>
    </div>
  </section>
</template>

<style scoped>
.mini-event-calendar {
  width: 100%;
  padding: var(--space-20) 18px;
  border-radius: 26px;
  background: var(--white);
  box-shadow:
    0 1px 3px rgb(0 0 0 / 3%),
    0 2px 14px rgb(0 0 0 / 5%);
}

.mini-event-calendar header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.mini-event-calendar h2 {
  margin: 0;
  color: var(--ui-sub-title);
  font-size: 14px;
  font-weight: var(--weight-bold);
  line-height: 1.5;
}

.mini-event-calendar__navigation {
  display: flex;
  align-items: center;
  gap: 5px;
}

.mini-event-calendar__navigation button {
  display: grid;
  width: 24px;
  height: 24px;
  padding: 0;
  border: 0;
  background: transparent;
  cursor: pointer;
  place-items: center;
}

.mini-event-calendar__navigation .mini-event-calendar__today-button {
  width: auto;
  min-width: 38px;
  padding: 0 9px;
  border-radius: var(--radius-full);
  background: var(--green-100);
  color: var(--green-700);
  font-family: var(--font-body);
  font-size: 11px;
  font-weight: var(--weight-bold);
}

.mini-event-calendar__navigation img {
  display: block;
  width: 7px;
  height: 11px;
  object-fit: contain;
}

.mini-event-calendar__weekdays,
.mini-event-calendar__days {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
}

.mini-event-calendar__weekdays {
  padding-top: 14px;
}

.mini-event-calendar__weekdays span {
  color: var(--olive-300);
  font-size: 11px;
  font-weight: var(--weight-bold);
  line-height: 24px;
  text-align: center;
}

.mini-event-calendar__days {
  padding-top: 6px;
  row-gap: 2px;
}

.mini-event-calendar__days > button {
  position: relative;
  display: flex;
  min-width: 0;
  height: 39px;
  align-items: center;
  justify-content: flex-start;
  flex-direction: column;
  gap: 4px;
  padding: 4px 0 2px;
  border: 0;
  border-radius: 13px;
  background: transparent;
  color: var(--gray-600);
  cursor: pointer;
  font-family: var(--font-body);
  font-size: 12px;
  font-weight: var(--weight-bold);
}

.mini-event-calendar__days > button:hover,
.mini-event-calendar__days > button:focus-visible,
.mini-event-calendar__day--selected {
  outline: none;
  background: var(--green-100) !important;
}

.mini-event-calendar__days > button > span {
  display: grid;
  width: 24px;
  height: 24px;
  flex: 0 0 auto;
  place-items: center;
  border-radius: 50%;
}

.mini-event-calendar__day--today > span {
  background: var(--green-700);
  color: var(--white);
}

.mini-event-calendar__days i {
  width: 5px;
  height: 5px;
  flex: 0 0 auto;
  border-radius: 50%;
  background: var(--green-700);
}

.mini-event-calendar__sunday {
  color: var(--brand-orange) !important;
}

.mini-event-calendar__saturday {
  color: var(--category-transport200, #6c98c8) !important;
}

.mini-event-calendar__day--today {
  color: var(--white) !important;
}
</style>
