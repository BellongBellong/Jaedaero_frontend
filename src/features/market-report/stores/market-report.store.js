import { ref } from 'vue'
import { defineStore } from 'pinia'

import {
  getTodayMarketIndicators,
  getTodayMarketReport,
} from '@/features/market-report/api/marketReport.api'

export const useMarketReportStore = defineStore('market-report', () => {
  const report = ref(null)
  const indicators = ref(null)
  const reportLoading = ref(false)
  const indicatorsLoading = ref(false)
  const reportError = ref(null)
  const indicatorsError = ref(null)
  let reportRequest = null
  let indicatorsRequest = null

  async function loadReport({ force = false } = {}) {
    if (report.value && !force) return report.value
    if (reportRequest) return reportRequest

    reportLoading.value = true
    reportError.value = null
    reportRequest = getTodayMarketReport()

    try {
      report.value = await reportRequest
      return report.value
    } catch (requestError) {
      reportError.value = requestError
      return null
    } finally {
      reportRequest = null
      reportLoading.value = false
    }
  }

  async function loadIndicators({ force = false } = {}) {
    if (indicators.value && !force) return indicators.value
    if (indicatorsRequest) return indicatorsRequest

    indicatorsLoading.value = true
    indicatorsError.value = null
    indicatorsRequest = getTodayMarketIndicators()

    try {
      indicators.value = await indicatorsRequest
      return indicators.value
    } catch (requestError) {
      indicatorsError.value = requestError
      return null
    } finally {
      indicatorsRequest = null
      indicatorsLoading.value = false
    }
  }

  function reset() {
    report.value = null
    indicators.value = null
    reportLoading.value = false
    indicatorsLoading.value = false
    reportError.value = null
    indicatorsError.value = null
    reportRequest = null
    indicatorsRequest = null
  }

  return {
    report,
    indicators,
    reportLoading,
    indicatorsLoading,
    reportError,
    indicatorsError,
    loadReport,
    loadIndicators,
    reset,
  }
})
