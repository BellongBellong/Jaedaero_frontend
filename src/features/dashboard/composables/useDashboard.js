import { computed, ref, toValue, watch } from 'vue'

import { getDashboard } from '@/features/dashboard/api/dashboard.api'
import { mapDashboardResponse } from '@/features/dashboard/mappers/dashboardResponse.mapper'
import { getDashboardMock } from '@/features/dashboard/mocks/dashboard.mock'

export function useDashboard(options) {
  const dashboard = ref(getDashboardMock())
  const loading = ref(false)
  const error = ref(null)
  const source = ref('mock')

  const mockOptions = computed(() => toValue(options) ?? {})
  const usesMockScenario = computed(() =>
    Boolean(mockOptions.value.persona || mockOptions.value.scenario),
  )

  async function load() {
    const fallback = getDashboardMock(mockOptions.value)
    dashboard.value = fallback
    error.value = null

    if (usesMockScenario.value) {
      source.value = 'mock'
      return
    }

    loading.value = true

    try {
      const response = await getDashboard()
      dashboard.value = mapDashboardResponse(response, fallback)
      source.value = 'api'
    } catch (requestError) {
      error.value = requestError
      source.value = 'mock-fallback'
    } finally {
      loading.value = false
    }
  }

  watch(mockOptions, load, { immediate: true })

  return {
    dashboard,
    error,
    loading,
    source,
    reload: load,
  }
}
