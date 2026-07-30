import apiClient from '@/common/api/client'
import { ENDPOINTS } from '@/common/api/endpoints'

export async function createAiAnalysis(payload) {
  const { data } = await apiClient.post(ENDPOINTS.aiAnalyses.create, payload)
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
