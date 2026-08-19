import { useMarketReportStore } from '@/features/market-report/stores/market-report.store'

export function useTodayMarketReport() {
  const store = useMarketReportStore()

  return {
    report: store.report,
    isLoading: store.reportLoading,
    error: store.reportError,
    load: store.loadReport,
  }
}
