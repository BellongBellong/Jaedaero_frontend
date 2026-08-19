import { computed, toValue, watch } from 'vue'

import { useDashboardStore } from '@/features/dashboard/stores/dashboard.store'

export function useDashboard(options) {
  const store = useDashboardStore()
  const mockOptions = computed(() => toValue(options) ?? {})

  watch(mockOptions, (nextOptions) => store.load(nextOptions), { immediate: true })

  return {
    dashboard: store.dashboard,
    error: store.error,
    loading: store.loading,
    source: store.source,
    reload: () => store.load(mockOptions.value),
  }
}
