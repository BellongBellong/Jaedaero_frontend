import { ref } from 'vue'
import { defineStore } from 'pinia'

import {
  applyRebalancing,
  createInvestmentGuidance,
  getInvestmentGuidanceDetail,
  getRebalancingRecommendation,
  getRecurringInvestmentPlan,
  saveRecurringInvestmentPlan,
} from '@/features/rebalancing/api/rebalancing.api'

export const useRebalancingStore = defineStore('rebalancing', () => {
  const recommendation = ref(null)
  const recurringPlan = ref(null)
  const guidance = ref(null)
  const loading = ref(false)
  const error = ref(null)

  async function loadRecommendation() {
    recommendation.value = await getRebalancingRecommendation()
    return recommendation.value
  }

  async function loadRecurringPlan() {
    recurringPlan.value = await getRecurringInvestmentPlan()
    return recurringPlan.value
  }

  async function savePlan(payload) {
    recurringPlan.value = await saveRecurringInvestmentPlan(payload)
    return recurringPlan.value
  }

  async function createGuidance() {
    loading.value = true
    error.value = null
    try {
      guidance.value = await createInvestmentGuidance()
      return guidance.value
    } catch (requestError) {
      error.value = requestError
      throw requestError
    } finally {
      loading.value = false
    }
  }

  async function loadGuidanceDetail(guidanceId) {
    guidance.value = await getInvestmentGuidanceDetail(guidanceId)
    return guidance.value
  }

  async function applyGuidance(guidanceId, payload = {}) {
    return applyRebalancing(guidanceId, payload)
  }

  function reset() {
    recommendation.value = null
    recurringPlan.value = null
    guidance.value = null
    loading.value = false
    error.value = null
  }

  return {
    recommendation,
    recurringPlan,
    guidance,
    loading,
    error,
    loadRecommendation,
    loadRecurringPlan,
    savePlan,
    createGuidance,
    loadGuidanceDetail,
    applyGuidance,
    reset,
  }
})
