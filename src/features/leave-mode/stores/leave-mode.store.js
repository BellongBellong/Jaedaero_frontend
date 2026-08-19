import { ref } from 'vue'
import { defineStore } from 'pinia'

const SCHEDULES_STORAGE_KEY = 'jaedaero-leave-mode-schedules'
const LEGACY_MODE_STORAGE_KEY = 'jaedaero-selected-mode'
const MODE_STORAGE_KEY = 'jaedaero-mode-preference'
const BUDGETS_STORAGE_KEY = 'jaedaero-vacation-budgets'

function readSelectedMode() {
  if (typeof window === 'undefined') return null

  window.localStorage.removeItem(LEGACY_MODE_STORAGE_KEY)
  const savedMode = window.localStorage.getItem(MODE_STORAGE_KEY)
  return ['military', 'vacation'].includes(savedMode) ? savedMode : null
}

function readJson(key, fallback) {
  if (typeof window === 'undefined') return fallback

  try {
    const saved = JSON.parse(window.localStorage.getItem(key) || '')
    return saved && typeof saved === 'object' ? saved : fallback
  } catch {
    return fallback
  }
}

function localDateString(date = new Date()) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function isActiveSchedule(schedule, date) {
  const endDate = schedule.endDate || schedule.startDate
  return Boolean(schedule.startDate && schedule.startDate <= date && date <= endDate)
}

function budgetKey(vacation) {
  if (!vacation) return ''
  return String(vacation.id ?? `${vacation.startDate}-${vacation.endDate || vacation.startDate}`)
}

export const useLeaveModeStore = defineStore('leave-mode', () => {
  const mode = ref(readSelectedMode() || 'military')
  const storedSchedules = readJson(SCHEDULES_STORAGE_KEY, [])
  const storedBudgets = readJson(BUDGETS_STORAGE_KEY, {})
  const schedules = ref(Array.isArray(storedSchedules) ? storedSchedules : [])
  const budgets = ref(storedBudgets && !Array.isArray(storedBudgets) ? storedBudgets : {})

  function refreshMode(date = new Date()) {
    const savedMode = readSelectedMode()
    if (savedMode) {
      mode.value = savedMode
      return
    }

    const today = localDateString(date)
    mode.value = schedules.value.some((schedule) => isActiveSchedule(schedule, today))
      ? 'vacation'
      : 'military'
  }

  function setMode(nextMode) {
    mode.value = nextMode === 'vacation' ? 'vacation' : 'military'
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(MODE_STORAGE_KEY, mode.value)
    }
  }

  function setEventSchedules(events = []) {
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

    if (typeof window !== 'undefined') {
      window.localStorage.setItem(SCHEDULES_STORAGE_KEY, JSON.stringify(schedules.value))
    }
    refreshMode()
  }

  function budgetFor(vacation) {
    const key = budgetKey(vacation)
    const value = key ? budgets.value[key] : null
    return Number.isFinite(Number(value)) ? Number(value) : null
  }

  function setBudget(vacation, amount) {
    const key = budgetKey(vacation)
    if (!key) return

    const nextBudgets = { ...budgets.value }
    if (amount === null || amount === undefined || amount === '') {
      delete nextBudgets[key]
    } else {
      nextBudgets[key] = Math.max(0, Number(amount))
    }
    budgets.value = nextBudgets
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(BUDGETS_STORAGE_KEY, JSON.stringify(budgets.value))
    }
  }

  return {
    mode,
    schedules,
    budgets,
    setMode,
    refreshMode,
    setEventSchedules,
    budgetFor,
    setBudget,
  }
})
