import apiClient from '@/common/api/client'
import { ENDPOINTS } from '@/common/api/endpoints'

/*
  가이드 생성은 서버에서 분석을 돌리느라 1분 가까이 걸린다.
  공통 클라이언트의 10초 타임아웃을 쓰면 항상 중간에 끊겨 실패한다.
  AI 분석 생성(createAiAnalysis)과 같은 기준으로 넉넉히 잡는다.
*/
const GUIDANCE_TIMEOUT_MS = 90_000

export async function getRebalancingRecommendation() {
  const { data } = await apiClient.get(ENDPOINTS.investmentGuidances.latest)
  return data?.data ?? data
}

export async function getRecurringInvestmentPlan() {
  const { data } = await apiClient.get(ENDPOINTS.recurringInvestmentPlans.me)
  return data?.data ?? data
}

export async function saveRecurringInvestmentPlan(payload) {
  const { data } = await apiClient.put(ENDPOINTS.recurringInvestmentPlans.me, payload)
  return data?.data ?? data
}

export async function createInvestmentGuidance() {
  const { data } = await apiClient.post(ENDPOINTS.investmentGuidances.create, undefined, {
    timeout: GUIDANCE_TIMEOUT_MS,
  })
  return data?.data ?? data
}

export async function getInvestmentGuidanceDetail(guidanceId) {
  const { data } = await apiClient.get(ENDPOINTS.investmentGuidances.detail(guidanceId))
  return data?.data ?? data
}

export async function applyRebalancing(guidanceId, payload = {}) {
  const { data } = await apiClient.post(ENDPOINTS.investmentGuidances.apply(guidanceId), payload)
  return data?.data ?? data
}
