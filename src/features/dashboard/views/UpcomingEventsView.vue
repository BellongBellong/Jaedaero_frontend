<script setup>
import plusIcon from '@/assets/icons/Category/plusIcon.svg'
import EventAddModal from '@/features/dashboard/components/EventAddModal.vue'
import EventTimeline from '@/features/dashboard/components/EventTimeline.vue'
import MiniEventCalendar from '@/features/dashboard/components/MiniEventCalendar.vue'
import SelectedEventList from '@/features/dashboard/components/SelectedEventList.vue'
import { useUpcomingEvents } from '@/features/dashboard/composables/useUpcomingEvents'
import { ref } from 'vue'

const showAddModal = ref(false)
const selectedDate = ref(toDateString(new Date()))
const { events, addEvent } = useUpcomingEvents()

function toDateString(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function saveEvent(event) {
  addEvent(event)
  selectedDate.value = event.startDate
  showAddModal.value = false
}
</script>

<template>
  <section class="events-page screen app-page">
    <MiniEventCalendar
      :events="events"
      :selected-date="selectedDate"
      @select="selectedDate = $event"
    />

    <SelectedEventList
      :events="events"
      :selected-date="selectedDate"
      @add="showAddModal = true"
    />

    <EventTimeline :events="events" />

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
</style>
