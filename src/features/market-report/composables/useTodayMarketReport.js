import { ref } from 'vue'

import { getTodayMarketReport } from '@/features/market-report/api/marketReport.api'

let cachedReport = null
let pendingRequest = null

export function useTodayMarketReport() {
  const report = ref(cachedReport)
  const isLoading = ref(false)
  const error = ref(null)

  async function load() {
    if (cachedReport) return cachedReport
    if (pendingRequest) {
      report.value = await pendingRequest
      return report.value
    }

    isLoading.value = true
    error.value = null
    pendingRequest = getTodayMarketReport()

    try {
      cachedReport = await pendingRequest
      report.value = cachedReport
      return cachedReport
    } catch (requestError) {
      error.value = requestError
      return null
    } finally {
      pendingRequest = null
      isLoading.value = false
    }
  }

  return { report, isLoading, error, load }
}

