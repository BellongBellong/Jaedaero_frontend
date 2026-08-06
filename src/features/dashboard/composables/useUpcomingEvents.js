import { computed, ref } from 'vue'

import { dashboardMock } from '@/features/dashboard/mocks/dashboard.mock'

const events = ref(structuredClone(dashboardMock.events))

function calculateDday(date) {
  const today = new Date()
  const target = new Date(`${date}T00:00:00`)
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate())

  return Math.max(0, Math.ceil((target - todayStart) / 86_400_000))
}

function calculateDurationDays(startDate, endDate) {
  const start = new Date(`${startDate}T00:00:00`)
  const end = new Date(`${endDate || startDate}T00:00:00`)

  return Math.max(1, Math.round((end - start) / 86_400_000) + 1)
}

export function useUpcomingEvents() {
  const sortedEvents = computed(() =>
    [...events.value]
      .sort((first, second) => first.startDate.localeCompare(second.startDate))
      .map((event) => ({
        ...event,
        durationDays: calculateDurationDays(event.startDate, event.endDate),
        dday: calculateDday(event.startDate),
      })),
  )

  function addEvent(event) {
    events.value.push({
      id: Date.now(),
      userId: 1,
      eventType: event.eventType || 'CUSTOM',
      title: event.title,
      startDate: event.startDate || event.date,
      endDate: event.endDate || event.startDate || event.date,
      expectedExpense: Number(event.expectedExpense || 0),
      notificationEnabled: event.notificationEnabled ?? true,
      ...(event.autoVacationMode === undefined ? {} : { autoVacationMode: event.autoVacationMode }),
    })
  }

  return {
    events: sortedEvents,
    addEvent,
  }
}
