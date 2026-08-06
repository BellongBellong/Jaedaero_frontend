<script setup>
import plusIcon from '@/assets/icons/plusIcon.png'
import EventAddModal from '@/features/dashboard/components/EventAddModal.vue'
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
  return `${start} ~ ${formatDate(endDate)} (${event.durationDays}일)`
}

function saveEvent(event) {
  addEvent(event)
  showAddModal.value = false
}
</script>

<template>
  <section class="events-page screen app-page">
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
  gap: 16px;
}

.events-page__add {
  display: flex;
  height: 46px;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: 0;
  border-radius: 16px;
  background: var(--green-100);
  color: var(--green-700);
  cursor: pointer;
  font-weight: var(--weight-bold);
}

.events-page__add img {
  width: 18px;
  height: 18px;
}

.events-page ul {
  display: grid;
  gap: 10px;
  padding: 0;
  margin: 0;
  list-style: none;
}

.events-page li {
  display: flex;
  min-height: 74px;
  align-items: center;
  justify-content: space-between;
  padding: 16px 18px;
  border-radius: 20px;
  background: var(--white);
}

.events-page li div {
  display: grid;
  gap: 3px;
}

.events-page li strong {
  color: var(--gray-900);
  font-size: 15px;
}

.events-page li time {
  color: var(--gray-600);
  font-size: 12px;
}

.events-page li > span {
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
