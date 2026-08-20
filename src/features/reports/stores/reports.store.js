import { ref } from 'vue'
import { defineStore } from 'pinia'

import { getProductRecommendations } from '@/features/reports/api/reports.api'

export const useReportsStore = defineStore('reports', () => {
  const productRecommendations = ref([])
  const recommendationKey = ref('')
  const loading = ref(false)
  const error = ref(null)

  async function loadProductRecommendations({ force = false, simulationId = null } = {}) {
    const cached = productRecommendations.value
    const hasCache = Array.isArray(cached) ? cached.length > 0 : Boolean(cached)
    const cacheKey = simulationId ? `simulation:${simulationId}` : 'default'
    if (hasCache && recommendationKey.value === cacheKey && !force) return cached
    loading.value = true
    error.value = null
    try {
      const response = await getProductRecommendations(simulationId ? { simulationId } : {})
      /*
        KRX ETF 기준으로 바뀐 응답은 groups 안에 상품이 들어 있어
        기존 배열 추출로는 비어버린다. 원본을 그대로 넘겨 화면에서 매핑한다.
      */
      productRecommendations.value = Array.isArray(response)
        ? response
        : (response?.recommendations ?? response?.content ?? response?.items ?? response ?? [])
      recommendationKey.value = cacheKey
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
    recommendationKey.value = ''
    loading.value = false
    error.value = null
  }

  return { productRecommendations, loading, error, loadProductRecommendations, reset }
})
