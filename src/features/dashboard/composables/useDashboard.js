import { computed, toValue, watch } from 'vue'
import { storeToRefs } from 'pinia'

import { useDashboardStore } from '@/features/dashboard/stores/dashboard.store'

export function useDashboard(options) {
  const store = useDashboardStore()
  const { dashboard, error, loading, source } = storeToRefs(store)
  const mockOptions = computed(() => toValue(options) ?? {})

  watch(mockOptions, (nextOptions) => store.load(nextOptions), { immediate: true })

  return {
    dashboard,
    error,
    loading,
    source,
    reload: () => store.load(mockOptions.value),
  }
}
