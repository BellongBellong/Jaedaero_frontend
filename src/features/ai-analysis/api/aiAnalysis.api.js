import apiClient from '@/common/api/client'
import { ENDPOINTS } from '@/common/api/endpoints'

const AI_ANALYSIS_TIMEOUT_MS = 90_000

export async function getAnalysisHistories(params = {}) {
  const { data } = await apiClient.get(ENDPOINTS.analysisHistories, { params })
  return data
}

export async function createAiAnalysis(payload) {
  const { data } = await apiClient.post(ENDPOINTS.aiAnalyses.create, payload, {
    timeout: AI_ANALYSIS_TIMEOUT_MS,
  })
  return data
}

export async function getAiAnalysis(analysisId) {
  const { data } = await apiClient.get(ENDPOINTS.aiAnalyses.detail(analysisId))
  return data
}

export async function applyAiStrategy(analysisId) {
  const { data } = await apiClient.post(ENDPOINTS.aiAnalyses.apply(analysisId))
  return data
}
