import { storeToRefs } from 'pinia'
import { useMarketReportStore } from '@/features/market-report/stores/market-report.store'

export function useTodayMarketReport() {
  const store = useMarketReportStore()
  const { report, reportLoading, reportError } = storeToRefs(store)

  return {
    report,
    isLoading: reportLoading,
    error: reportError,
    load: store.loadReport,
  }
}
