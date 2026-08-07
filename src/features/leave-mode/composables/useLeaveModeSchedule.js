import { ref } from 'vue'

const STORAGE_KEY = 'jaedaero-leave-mode-schedules'
const mode = ref('military')
const schedules = ref(readSchedules())

function readSchedules() {
  if (typeof window === 'undefined') return []

  try {
    const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '[]')
    return Array.isArray(saved) ? saved : []
  } catch {
    return []
  }
}

function saveSchedules() {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(schedules.value))
}

function localDateString(date = new Date()) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function isActiveSchedule(schedule, date) {
  const startDate = schedule.startDate
  const endDate = schedule.endDate || startDate
  return Boolean(startDate && startDate <= date && date <= endDate)
}

export function refreshLeaveMode(date = new Date()) {
  const today = localDateString(date)
  mode.value = schedules.value.some((schedule) => isActiveSchedule(schedule, today))
    ? 'vacation'
    : 'military'
}

export function setEventLeaveModeSchedules(events = []) {
  schedules.value = events
    .filter((event) => event.autoVacationMode)
    .map((event) => ({
      id: `event-${event.id}`,
      eventId: event.id,
      userId: event.userId,
      startDate: event.startDate || event.date,
      endDate: event.endDate || event.startDate || event.date,
      source: 'EVENT',
    }))
  saveSchedules()
  refreshLeaveMode()
}

export function useLeaveModeSchedule() {
  function setMode(nextMode) {
    mode.value = nextMode === 'vacation' ? 'vacation' : 'military'
  }

  return {
    mode,
    schedules,
    setMode,
    refreshMode: refreshLeaveMode,
  }
}
