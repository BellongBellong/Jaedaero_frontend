import { ref } from 'vue'
import { defineStore } from 'pinia'

import { getProductRecommendations } from '@/features/reports/api/reports.api'

export const useReportsStore = defineStore('reports', () => {
  const productRecommendations = ref([])
  const loading = ref(false)
  const error = ref(null)

  async function loadProductRecommendations({ force = false } = {}) {
    if (productRecommendations.value.length && !force) return productRecommendations.value
    loading.value = true
    error.value = null
    try {
      const response = await getProductRecommendations()
      productRecommendations.value = Array.isArray(response)
        ? response
        : response?.recommendations || response?.content || response?.items || []
      return productRecommendations.value
    } catch (requestError) {
      error.value = requestError
      throw requestError
    } finally {
      loading.value = false
    }
  }

  function reset() {
    productRecommendations.value = []
    loading.value = false
    error.value = null
  }

  return { productRecommendations, loading, error, loadProductRecommendations, reset }
})
