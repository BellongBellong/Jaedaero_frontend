import { computed, ref } from 'vue'

import { getAiAnalyses, getStrategyApplications } from '@/features/ai-analysis/api/aiAnalysis.api'
import {
  ANALYSIS_RECORD_TYPES,
  mapAnalysisHistoryRecords,
  sortAnalysisRecords,
} from '@/features/ai-analysis/mappers/analysisHistory.mapper'
import { analysisHistoryRecords } from '@/features/ai-analysis/mocks/analysisHistory.mock'
import { getSimulations } from '@/features/simulations/api/simulations.api'

export const ANALYSIS_HISTORY_TABS = [
  { value: 'ALL', label: '전체', summaryLabel: '전체 분석 기록' },
  { value: ANALYSIS_RECORD_TYPES.WHAT_IF, label: 'What-if', summaryLabel: 'What-if 분석 기록' },
  { value: ANALYSIS_RECORD_TYPES.AI_ANALYSIS, label: 'AI 분석', summaryLabel: 'AI 분석 기록' },
]

function valueOf(result) {
  return result.status === 'fulfilled' ? result.value : null
}

export function useAnalysisHistory() {
  const records = ref([])
  const loading = ref(false)
  const error = ref(null)
  const source = ref('api')
  const activeTab = ref('ALL')

  async function load() {
    loading.value = true
    error.value = null

    const [analyses, simulations, applications] = await Promise.allSettled([
      getAiAnalyses(),
      getSimulations(),
      getStrategyApplications(),
    ])

    // 두 목록이 모두 실패했을 때만 목데이터로 떨어진다. 한쪽만 살아있으면 그쪽만 보여준다.
    if (analyses.status === 'rejected' && simulations.status === 'rejected') {
      error.value = analyses.reason
      records.value = sortAnalysisRecords(analysisHistoryRecords)
      source.value = 'mock-fallback'
    } else {
      records.value = sortAnalysisRecords(
        mapAnalysisHistoryRecords({
          analyses: valueOf(analyses),
          simulations: valueOf(simulations),
          applications: valueOf(applications),
        }),
      )
      error.value = analyses.reason ?? simulations.reason ?? null
      source.value = error.value ? 'api-partial' : 'api'
    }

    loading.value = false
  }

  const filteredRecords = computed(() =>
    activeTab.value === 'ALL'
      ? records.value
      : records.value.filter((record) => record.type === activeTab.value),
  )

  const summary = computed(() => ({
    label:
      ANALYSIS_HISTORY_TABS.find((tab) => tab.value === activeTab.value)?.summaryLabel ??
      '전체 분석 기록',
    count: filteredRecords.value.length,
    latestDate: filteredRecords.value[0]?.date || '-',
    latestProjectedAsset:
      filteredRecords.value.find((record) => record.projectedAsset)?.projectedAsset || '-',
  }))

  load()

  return {
    records,
    filteredRecords,
    summary,
    activeTab,
    tabs: ANALYSIS_HISTORY_TABS,
    loading,
    error,
    source,
    reload: load,
  }
}
