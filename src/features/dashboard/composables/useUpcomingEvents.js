import { computed, isRef, ref, toRaw, unref, watch } from 'vue'

import { setEventLeaveModeSchedules } from '@/features/leave-mode/composables/useLeaveModeSchedule'

const EVENT_STORAGE_KEY = 'jaedaero-upcoming-events'

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

  function readStoredEvents() {
    try {
      const storedEvents = JSON.parse(localStorage.getItem(EVENT_STORAGE_KEY) || '[]')
      return Array.isArray(storedEvents) ? storedEvents : []
    } catch {
      return []
    }
  }

  function mergeEvents(sourceEvents) {
    const mergedEvents = new Map()

    ;[...cloneEvents(sourceEvents), ...readStoredEvents()].forEach((event) => {
      const key =
        event.id ??
        [event.title, event.startDate || event.date, event.endDate || event.startDate || event.date]
          .filter(Boolean)
          .join(':')
      mergedEvents.set(String(key), event)
    })

    return [...mergedEvents.values()]
  }

  function persistEvents() {
    localStorage.setItem(EVENT_STORAGE_KEY, JSON.stringify(toRaw(events.value)))
  }

  if (isRef(initialEvents)) {
    watch(
      initialEvents,
      (value) => {
        events.value = mergeEvents(value)
        setEventLeaveModeSchedules(events.value)
      },
      { immediate: true },
    )
  } else {
    events.value = mergeEvents(initialEvents)
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
    persistEvents()
    setEventLeaveModeSchedules(events.value)
  }

  return {
    events: sortedEvents,
    addEvent,
  }
}
