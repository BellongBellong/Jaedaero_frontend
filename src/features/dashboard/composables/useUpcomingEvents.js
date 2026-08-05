import { computed, ref } from 'vue'

const events = ref([
  {
    id: 1,
    title: '연가',
    date: '2026-08-14',
    startDate: '2026-08-14',
    endDate: '2026-08-14',
    durationDays: 1,
    dday: 1,
  },
  {
    id: 2,
    title: '말출',
    date: '2026-08-14',
    startDate: '2026-08-14',
    endDate: '2026-08-16',
    durationDays: 3,
    dday: 20,
  },
  {
    id: 3,
    title: '급여일',
    date: '2026-08-20',
    startDate: '2026-08-20',
    endDate: '2026-08-20',
    durationDays: 1,
    dday: 26,
  },
  {
    id: 4,
    title: '적금 납입일',
    date: '2026-08-25',
    startDate: '2026-08-25',
    endDate: '2026-08-25',
    durationDays: 1,
    dday: 31,
  },
])

function calculateDday(date) {
  const today = new Date()
  const target = new Date(`${date}T00:00:00`)
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate())

  return Math.max(0, Math.ceil((target - todayStart) / 86_400_000))
}

export function useUpcomingEvents() {
  const sortedEvents = computed(() =>
    [...events.value].sort((first, second) => first.date.localeCompare(second.date)),
  )

  function addEvent(event) {
    events.value.push({
      id: Date.now(),
      title: event.title,
      date: event.startDate || event.date,
      startDate: event.startDate || event.date,
      endDate: event.endDate || event.startDate || event.date,
      durationDays: event.durationDays || 1,
      dday: calculateDday(event.startDate || event.date),
    })
  }

  return {
    events: sortedEvents,
    addEvent,
  }
}
