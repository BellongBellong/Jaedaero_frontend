import { computed, ref } from 'vue'

import {
  deleteLeaveMode,
  getLeaveModes,
  startLeaveMode,
} from '@/features/leave-mode/api/leaveMode.api'
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

function readStoredEvents() {
  try {
    const storedEvents = JSON.parse(localStorage.getItem(EVENT_STORAGE_KEY) || '[]')
    return Array.isArray(storedEvents) ? storedEvents : []
  } catch {
    return []
  }
}

function toEvent(leaveMode) {
  const autoVacationMode = Boolean(leaveMode.isLeaveModeEnabled ?? leaveMode.leaveModeEnabled)

  return {
    id: leaveMode.leaveModeId,
    leaveModeId: leaveMode.leaveModeId,
    eventType: autoVacationMode ? 'VACATION' : 'CUSTOM',
    title: leaveMode.eventName,
    startDate: leaveMode.startDate,
    endDate: leaveMode.endDate,
    autoVacationMode,
  }
}

function isSameEvent(event, leaveMode) {
  const startDate = event.startDate || event.date
  const endDate = event.endDate || startDate
  const leaveModeEnabled = Boolean(leaveMode.isLeaveModeEnabled ?? leaveMode.leaveModeEnabled)

  return (
    event.title === leaveMode.eventName &&
    startDate === leaveMode.startDate &&
    endDate === leaveMode.endDate &&
    Boolean(event.autoVacationMode) === leaveModeEnabled
  )
}

export function useUpcomingEvents() {
  const events = ref([])

  async function migrateStoredEvents(serverLeaveModes) {
    const storedEvents = readStoredEvents()
    if (!storedEvents.length) return false

    for (const event of storedEvents) {
      if (serverLeaveModes.some((leaveMode) => isSameEvent(event, leaveMode))) continue

      const startDate = event.startDate || event.date
      const endDate = event.endDate || startDate
      if (!event.title || !startDate) continue

      await startLeaveMode({
        eventName: event.title,
        startDate,
        endDate,
        isLeaveModeEnabled: Boolean(event.autoVacationMode),
        budgetAmount: null,
      })
    }

    localStorage.removeItem(EVENT_STORAGE_KEY)
    return true
  }

  async function loadEvents() {
    let leaveModes = await getLeaveModes()
    if (await migrateStoredEvents(leaveModes)) {
      leaveModes = await getLeaveModes()
    }

    events.value = leaveModes.map(toEvent)
    await setEventLeaveModeSchedules(events.value)
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

  async function addEvent(event) {
    await startLeaveMode({
      eventName: event.title,
      startDate: event.startDate || event.date,
      endDate: event.endDate || event.startDate || event.date,
      isLeaveModeEnabled: Boolean(event.autoVacationMode),
      budgetAmount: null,
    })
    await loadEvents()
  }

  async function removeEvent(eventId) {
    const event = events.value.find((item) => String(item.id) === String(eventId))
    if (!event) return

    await deleteLeaveMode(event.leaveModeId || event.id)
    await loadEvents()
  }

  return {
    events: sortedEvents,
    loadEvents,
    addEvent,
    removeEvent,
  }
}
