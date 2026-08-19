import { computed, ref, watch } from 'vue'

import { ANALYSIS_RECORD_TYPES } from '@/features/ai-analysis/mappers/analysisHistory.mapper'
import { useAnalysisStore } from '@/features/ai-analysis/stores/analysis.store'

export const ANALYSIS_HISTORY_TABS = [
  { value: 'ALL', apiValue: 'ALL', label: '전체', summaryLabel: '전체 분석 기록' },
  {
    value: ANALYSIS_RECORD_TYPES.WHAT_IF,
    apiValue: 'WHAT_IF',
    label: 'What-if',
    summaryLabel: 'What-if 분석 기록',
  },
  {
    value: ANALYSIS_RECORD_TYPES.AI_ANALYSIS,
    apiValue: 'AI',
    label: 'AI 소비 분석',
    summaryLabel: 'AI 소비 분석 기록',
  },
]

export function useAnalysisHistory() {
  const store = useAnalysisStore()
  const activeTab = ref('ALL')

  const filteredRecords = computed(() => store.records)

  const summary = computed(() => ({
    label:
      ANALYSIS_HISTORY_TABS.find((tab) => tab.value === activeTab.value)?.summaryLabel ??
      '전체 분석 기록',
    count: store.summary.totalCount,
    latestDate: store.summary.latestDate || '-',
    latestProjectedAsset: store.summary.latestProjectedAsset || '-',
  }))

  const load = () => {
    const tab = ANALYSIS_HISTORY_TABS.find((item) => item.value === activeTab.value)
    return store.load(tab?.apiValue ?? 'ALL')
  }

  watch(activeTab, load, { immediate: true })

  return {
    records: store.records,
    filteredRecords,
    summary,
    activeTab,
    tabs: ANALYSIS_HISTORY_TABS,
    loading: store.loading,
    error: store.error,
    reload: load,
  }
}
