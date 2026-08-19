import { storeToRefs } from 'pinia'
import { useMarketReportStore } from '@/features/market-report/stores/market-report.store'

/** 오늘의 AI 서술과 독립적으로, 4개 구조화 시장 지표만 조회한다. */
export function useTodayMarketIndicators() {
  const store = useMarketReportStore()
  const { indicators, indicatorsLoading, indicatorsError } = storeToRefs(store)

  return {
    report: indicators,
    isLoading: indicatorsLoading,
    error: indicatorsError,
    load: store.loadIndicators,
  }
}
