import { defineStore } from 'pinia'
import { ref } from 'vue'

import { getCurrentLeaveMode, updateLeaveModeBudget } from '@/features/leave-mode/api/leaveMode.api'

const MODE_STORAGE_KEY = 'jaedaero-mode-preference'
const VALID_MODES = ['military', 'vacation']

function readStoredMode() {
  if (typeof window === 'undefined') return null

  const storedMode = window.localStorage.getItem(MODE_STORAGE_KEY)
  return VALID_MODES.includes(storedMode) ? storedMode : null
}

function storeMode(mode) {
  if (typeof window === 'undefined') return

  window.localStorage.setItem(MODE_STORAGE_KEY, mode)
}

export const useLeaveModeStore = defineStore('leave-mode', () => {
  const storedMode = readStoredMode()
  const mode = ref(storedMode || 'military')
  const currentLeaveMode = ref(null)
  const hasModePreference = ref(Boolean(storedMode))

  async function refreshMode() {
    try {
      currentLeaveMode.value = await getCurrentLeaveMode()

      // 직접 선택한 모드는 메뉴 이동 중 서버의 현재 일정 조회 결과로 덮어쓰지 않는다.
      if (!hasModePreference.value) {
        mode.value = currentLeaveMode.value ? 'vacation' : 'military'
      }

      return currentLeaveMode.value
    } catch {
      currentLeaveMode.value = null

      if (!hasModePreference.value) mode.value = 'military'

      return null
    }
  }

  function setMode(nextMode) {
    mode.value = nextMode === 'vacation' ? 'vacation' : 'military'
    hasModePreference.value = true
    storeMode(mode.value)
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
