<script setup>
import plusIcon from '@/assets/icons/plusIcon.svg'
import EventAddModal from '@/features/dashboard/components/EventAddModal.vue'
import EventTimeline from '@/features/dashboard/components/EventTimeline.vue'
import MiniEventCalendar from '@/features/dashboard/components/MiniEventCalendar.vue'
import SelectedEventList from '@/features/dashboard/components/SelectedEventList.vue'
import { useUpcomingEvents } from '@/features/dashboard/composables/useUpcomingEvents'
import { useMissionStore } from '@/features/missions/stores/mission.store'
import { onMounted, ref } from 'vue'

const selectedDate = ref(toDateString(new Date()))
const showAddModal = ref(false)
const missionStore = useMissionStore()
const { events, addEvent, loadEvents, removeEvent } = useUpcomingEvents()

onMounted(async () => {
  try {
    await loadEvents()
  } catch {
    window.alert('이벤트 목록을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.')
  }
})

function toDateString(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

async function saveEvent(event) {
  try {
    await addEvent(event)
    showAddModal.value = false
  } catch {
    window.alert('휴가 일정을 저장하지 못했어요. 잠시 후 다시 시도해 주세요.')
  }
}

async function deleteEvent(event) {
  if (!window.confirm(`'${event.title}' 일정을 삭제할까요?`)) return

  try {
    await removeEvent(event.id)
    await missionStore.loadTodayMissions({ force: true })
  } catch {
    window.alert('이벤트를 삭제하지 못했어요. 잠시 후 다시 시도해 주세요.')
  }
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

    <EventTimeline
      :events="events"
      @delete="deleteEvent"
    />

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
