import { useMarketReportStore } from '@/features/market-report/stores/market-report.store'

/** 오늘의 AI 서술과 독립적으로, 4개 구조화 시장 지표만 조회한다. */
export function useTodayMarketIndicators() {
  const store = useMarketReportStore()

  return {
    report: store.indicators,
    isLoading: store.indicatorsLoading,
    error: store.indicatorsError,
    load: store.loadIndicators,
  }
}
