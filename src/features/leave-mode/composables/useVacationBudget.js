import { computed, ref } from 'vue'

const STORAGE_KEY = 'jaedaero-vacation-budgets'
const budgets = ref(readBudgets())

function readBudgets() {
  if (typeof window === 'undefined') return {}

  try {
    const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '{}')
    return saved && typeof saved === 'object' && !Array.isArray(saved) ? saved : {}
  } catch {
    return {}
  }
}

function saveBudgets() {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(budgets.value))
}

function budgetKey(vacation) {
  if (!vacation) return ''
  return String(vacation.id ?? `${vacation.startDate}-${vacation.endDate || vacation.startDate}`)
}

export function useVacationBudget(vacation) {
  const budget = computed(() => {
    const key = budgetKey(vacation.value)
    const value = key ? budgets.value[key] : null
    return Number.isFinite(Number(value)) ? Number(value) : null
  })

  function setBudget(amount) {
    const key = budgetKey(vacation.value)
    if (!key) return

    const nextBudgets = { ...budgets.value }
    if (amount === null || amount === undefined || amount === '') {
      delete nextBudgets[key]
    } else {
      nextBudgets[key] = Math.max(0, Number(amount))
    }
    budgets.value = nextBudgets
    saveBudgets()
  }

  return { budget, setBudget }
}
