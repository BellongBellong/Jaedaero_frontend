import { computed, isRef, ref, toRaw, unref, watch } from 'vue'

import { setEventLeaveModeSchedules } from '@/features/leave-mode/composables/useLeaveModeSchedule'

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

export function useUpcomingEvents(initialEvents = []) {
  const events = ref([])

  function cloneEvents(value) {
    return structuredClone(toRaw(unref(value) ?? []))
  }

  if (isRef(initialEvents)) {
    watch(
      initialEvents,
      (value) => {
        events.value = cloneEvents(value)
        setEventLeaveModeSchedules(events.value)
      },
      { immediate: true },
    )
  } else {
    events.value = cloneEvents(initialEvents)
    setEventLeaveModeSchedules(events.value)
  }

  const sortedEvents = computed(() =>
    [...events.value]
      .sort((first, second) => {
        const firstDate = first.startDate || first.date || ''
        const secondDate = second.startDate || second.date || ''
        const dateDifference = firstDate.localeCompare(secondDate)

        return dateDifference || Number(first.id || 0) - Number(second.id || 0)
      })
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
    setEventLeaveModeSchedules(events.value)
  }

  return {
    events: sortedEvents,
    addEvent,
  }
}
