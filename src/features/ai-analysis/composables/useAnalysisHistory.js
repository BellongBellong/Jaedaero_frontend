import { computed, ref, watch } from 'vue'

import { getAnalysisHistories } from '@/features/ai-analysis/api/aiAnalysis.api'
import {
  ANALYSIS_RECORD_TYPES,
  mapAnalysisHistoryPage,
} from '@/features/ai-analysis/mappers/analysisHistory.mapper'

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
    label: 'AI 분석',
    summaryLabel: 'AI 분석 기록',
  },
]

export function useAnalysisHistory() {
  const records = ref([])
  const loading = ref(false)
  const error = ref(null)
  const activeTab = ref('ALL')
  const pageSummary = ref({ totalCount: 0, latestDate: '', latestProjectedAsset: '' })
  let requestSequence = 0

  async function load() {
    const sequence = ++requestSequence
    const tab = ANALYSIS_HISTORY_TABS.find((item) => item.value === activeTab.value)

    loading.value = true
    error.value = null

    try {
      const response = await getAnalysisHistories({
        type: tab?.apiValue ?? 'ALL',
        page: 0,
        size: 100,
      })
      if (sequence !== requestSequence) return

      const mapped = mapAnalysisHistoryPage(response)
      records.value = mapped.records
      pageSummary.value = mapped
    } catch (loadError) {
      if (sequence !== requestSequence) return

      records.value = []
      pageSummary.value = { totalCount: 0, latestDate: '', latestProjectedAsset: '' }
      error.value = loadError
    } finally {
      if (sequence === requestSequence) loading.value = false
    }
  }

  const filteredRecords = computed(() => records.value)

  const summary = computed(() => ({
    label:
      ANALYSIS_HISTORY_TABS.find((tab) => tab.value === activeTab.value)?.summaryLabel ??
      '전체 분석 기록',
    count: pageSummary.value.totalCount,
    latestDate: pageSummary.value.latestDate || '-',
    latestProjectedAsset: pageSummary.value.latestProjectedAsset || '-',
  }))

  watch(activeTab, load, { immediate: true })

  return {
    records,
    filteredRecords,
    summary,
    activeTab,
    tabs: ANALYSIS_HISTORY_TABS,
    loading,
    error,
    reload: load,
  }
}
