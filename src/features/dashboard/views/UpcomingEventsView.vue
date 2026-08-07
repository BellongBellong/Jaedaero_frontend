<script setup>
import plusIcon from '@/assets/icons/Category/plusIcon.svg'
import EventAddModal from '@/features/dashboard/components/EventAddModal.vue'
import MiniEventCalendar from '@/features/dashboard/components/MiniEventCalendar.vue'
import { useUpcomingEvents } from '@/features/dashboard/composables/useUpcomingEvents'
import { ref } from 'vue'

const showAddModal = ref(false)
const { events, addEvent } = useUpcomingEvents()

function formatDate(date) {
  const [, month, day] = date.slice(0, 10).split('-').map(Number)

  return `${month}월 ${day}일`
}

function formatSchedule(event) {
  const start = formatDate(event.startDate)
  const endDate = event.endDate

  if (!endDate || endDate === event.startDate) return start
  return `${start} 시작`
}

function saveEvent(event) {
  addEvent(event)
  showAddModal.value = false
}
</script>

<template>
  <section class="events-page screen app-page">
    <MiniEventCalendar :events="events" />

    <section class="events-page__timeline">
      <h2>일정 타임라인</h2>

      <ul v-if="events.length">
        <li
          v-for="event in events"
          :key="event.id"
        >
          <div>
            <strong>{{ event.title }}</strong>
            <time :datetime="event.startDate">{{ formatSchedule(event) }}</time>
          </div>
          <span>D-{{ event.dday }}</span>
        </li>
      </ul>

      <p
        v-else
        class="events-page__empty"
      >
        예정된 이벤트가 없어요.
      </p>
    </section>

    <button
      class="events-page__add"
      type="button"
      @click="showAddModal = true"
    >
      <img
        :src="plusIcon"
        alt=""
      >
      이벤트 추가
    </button>

    <EventAddModal
      v-if="showAddModal"
      @close="showAddModal = false"
      @save="saveEvent"
    />
  </section>
</template>

<style scoped>
.events-page {
  display: flex;
  flex-direction: column;
  gap: 10px;
  background: linear-gradient(180deg, var(--green-100) 0%, var(--ui-background) 42%);
}

.events-page__add {
  display: flex;
  width: fit-content;
  height: 46px;
  align-items: center;
  justify-content: center;
  align-self: flex-end;
  gap: 8px;
  padding: 0 20px;
  border: 0;
  border-radius: var(--radius-full);
  background: var(--green-500);
  color: var(--gray-900);
  cursor: pointer;
  font-weight: var(--weight-bold);
}

.events-page__add img {
  width: 18px;
  height: 18px;
}

.events-page__timeline {
  padding: var(--space-20);
  border-radius: 26px;
  background: var(--white);
}

.events-page__timeline h2 {
  margin: 0 0 14px;
  color: var(--ui-sub-title);
  font-size: 14px;
  font-weight: var(--weight-bold);
}

.events-page__timeline ul {
  display: grid;
  gap: 0;
  padding: 0;
  margin: 0;
  list-style: none;
}

.events-page__timeline li {
  position: relative;
  display: flex;
  min-height: 62px;
  align-items: center;
  justify-content: space-between;
  padding: 8px 0 8px 34px;
}

.events-page__timeline li::before {
  position: absolute;
  top: 50%;
  left: 6px;
  z-index: 1;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--green-700);
  content: '';
  transform: translateY(-50%);
}

.events-page__timeline li:not(:last-child)::after {
  position: absolute;
  top: 50%;
  bottom: -50%;
  left: 9px;
  width: 2px;
  background: var(--green-100);
  content: '';
}

.events-page__timeline li div {
  display: grid;
  gap: 3px;
}

.events-page__timeline li strong {
  color: var(--gray-900);
  font-size: 13px;
}

.events-page__timeline li time {
  color: var(--gray-500);
  font-size: 11px;
}

.events-page__timeline li > span {
  padding: 3px 11px;
  border-radius: 999px;
  background: var(--green-100);
  color: var(--green-700);
  font-size: 12px;
}

.events-page__empty {
  display: grid;
  min-height: 180px;
  place-items: center;
  margin: 0;
  border-radius: 20px;
  background: var(--white);
  color: var(--gray-500);
  font-size: 13px;
}
</style>
