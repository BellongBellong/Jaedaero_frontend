import { computed } from 'vue'

import { useLeaveModeStore } from '@/features/leave-mode/stores/leave-mode.store'

export function useVacationBudget(vacation) {
  const store = useLeaveModeStore()
  const budget = computed(() => store.budgetFor(vacation.value))

  function setBudget(amount) {
    store.setBudget(vacation.value, amount)
  }

  return { budget, setBudget }
}
