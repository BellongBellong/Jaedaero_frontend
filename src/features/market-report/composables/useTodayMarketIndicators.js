import { ref } from 'vue'

import { getTodayMarketIndicators } from '@/features/market-report/api/marketReport.api'

let cachedIndicators = null
let pendingRequest = null

/** 오늘의 AI 서술과 독립적으로, 4개 구조화 시장 지표만 조회한다. */
export function useTodayMarketIndicators() {
  const report = ref(cachedIndicators)
  const isLoading = ref(false)
  const error = ref(null)

  async function load() {
    if (cachedIndicators) return cachedIndicators
    if (pendingRequest) {
      report.value = await pendingRequest
      return report.value
    }

    isLoading.value = true
    error.value = null
    pendingRequest = getTodayMarketIndicators()

    try {
      cachedIndicators = await pendingRequest
      report.value = cachedIndicators
      return cachedIndicators
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
