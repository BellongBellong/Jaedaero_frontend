import { defineStore } from 'pinia'
import { ref } from 'vue'

import { getCurrentLeaveMode, updateLeaveModeBudget } from '@/features/leave-mode/api/leaveMode.api'

export const useLeaveModeStore = defineStore('leave-mode', () => {
  const mode = ref('military')
  const currentLeaveMode = ref(null)

  async function refreshMode() {
    try {
      currentLeaveMode.value = await getCurrentLeaveMode()
      mode.value = currentLeaveMode.value ? 'vacation' : 'military'
      return currentLeaveMode.value
    } catch {
      currentLeaveMode.value = null
      mode.value = 'military'
      return null
    }
  }

  function setMode(nextMode) {
    mode.value = nextMode === 'vacation' ? 'vacation' : 'military'
  }

  function setEventSchedules() {
    return refreshMode()
  }

  async function updateBudget(amount) {
    if (!currentLeaveMode.value?.leaveModeId) return null

    currentLeaveMode.value = await updateLeaveModeBudget(currentLeaveMode.value.leaveModeId, amount)
    return currentLeaveMode.value
  }

  return {
    mode,
    currentLeaveMode,
    setMode,
    refreshMode,
    setEventSchedules,
    updateBudget,
  }
})
