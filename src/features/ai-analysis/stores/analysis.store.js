import { ref } from 'vue'
import { defineStore } from 'pinia'

import {
  applyAiStrategy,
  createAiAnalysis,
  getAiAnalysis,
  getAnalysisHistories,
} from '@/features/ai-analysis/api/aiAnalysis.api'
import { mapAnalysisHistoryPage } from '@/features/ai-analysis/mappers/analysisHistory.mapper'

export const useAnalysisStore = defineStore('analysis', () => {
  const records = ref([])
  const summary = ref({ totalCount: 0, latestDate: '', latestProjectedAsset: '' })
  const loading = ref(false)
  const error = ref(null)
  const currentAnalysis = ref(null)
  let requestSequence = 0

  async function load(type = 'ALL') {
    const sequence = ++requestSequence
    loading.value = true
    error.value = null

    try {
      const response = await getAnalysisHistories({ type, page: 0, size: 100 })
      if (sequence !== requestSequence) return
      const mapped = mapAnalysisHistoryPage(response)
      records.value = mapped.records
      summary.value = mapped
    } catch (loadError) {
      if (sequence !== requestSequence) return
      records.value = []
      summary.value = { totalCount: 0, latestDate: '', latestProjectedAsset: '' }
      error.value = loadError
    } finally {
      if (sequence === requestSequence) loading.value = false
    }
  }

  async function create(payload) {
    currentAnalysis.value = await createAiAnalysis(payload)
    return currentAnalysis.value
  }

  async function loadDetail(analysisId) {
    currentAnalysis.value = await getAiAnalysis(analysisId)
    return currentAnalysis.value
  }

  async function applyStrategy(analysisId) {
    return applyAiStrategy(analysisId)
  }

  function reset() {
    records.value = []
    summary.value = { totalCount: 0, latestDate: '', latestProjectedAsset: '' }
    loading.value = false
    error.value = null
    requestSequence += 1
  }

  return {
    records,
    summary,
    loading,
    error,
    currentAnalysis,
    load,
    create,
    loadDetail,
    applyStrategy,
    reset,
  }
})
