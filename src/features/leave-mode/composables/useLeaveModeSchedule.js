import { storeToRefs } from 'pinia'

import { useLeaveModeStore } from '@/features/leave-mode/stores/leave-mode.store'

export function refreshLeaveMode(date = new Date()) {
  return useLeaveModeStore().refreshMode(date)
}

export function setEventLeaveModeSchedules(events = []) {
  return useLeaveModeStore().setEventSchedules(events)
}

export function useLeaveModeSchedule() {
  const store = useLeaveModeStore()
  const { mode, currentLeaveMode } = storeToRefs(store)

  return { mode, currentLeaveMode, setMode: store.setMode, refreshMode: store.refreshMode }
}
