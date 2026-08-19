import { computed } from 'vue'

import { useLeaveModeStore } from '@/features/leave-mode/stores/leave-mode.store'

export function useVacationBudget() {
  const store = useLeaveModeStore()
  const budget = computed(() => store.currentLeaveMode?.budgetAmount ?? null)

  function setBudget(amount) {
    return store.updateBudget(amount)
  }

  return { budget, setBudget }
}
