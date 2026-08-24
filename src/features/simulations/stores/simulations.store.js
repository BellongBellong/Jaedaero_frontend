import { ref } from 'vue'
import { defineStore } from 'pinia'

import {
  getSimulation,
  getSimulationDefaults,
  getSimulations,
  runSimulation,
} from '@/features/simulations/api/simulations.api'

export const useSimulationsStore = defineStore('simulations', () => {
  const defaults = ref(null)
  const simulations = ref([])
  const currentResult = ref(null)
  const loading = ref(false)
  const error = ref(null)

  async function loadDefaults({ force = false } = {}) {
    if (defaults.value && !force) return defaults.value
    loading.value = true
    error.value = null
    try {
      defaults.value = await getSimulationDefaults()
      return defaults.value
    } catch (requestError) {
      error.value = requestError
      throw requestError
    } finally {
      loading.value = false
    }
  }

  async function loadList(params = {}) {
    const result = await getSimulations(params)
    simulations.value = Array.isArray(result)
      ? result
      : result?.content ||
        result?.simulations ||
        result?.items ||
        result?.results ||
        result?.data ||
        []
    return result
  }

  async function run(payload) {
    const result = await runSimulation(payload)
    const normalizedResult =
      result && typeof result === 'object'
        ? {
            ...result,
            simulationId: result.simulationId ?? result.id,
            expectedAsset: result.expectedAsset ?? result.projectedAssetAtDischarge,
            ...(payload.isSaved ? { isSaved: true } : {}),
          }
        : result
    currentResult.value = normalizedResult
    if (payload.isSaved && normalizedResult) {
      const resultId = normalizedResult.simulationId ?? normalizedResult.id
      simulations.value = [
        normalizedResult,
        ...simulations.value.filter(
          (simulation) => String(simulation?.simulationId ?? simulation?.id) !== String(resultId),
        ),
      ]
    }
    return normalizedResult
  }

  function detail(simulationId) {
    return getSimulation(simulationId)
  }

  function reset() {
    defaults.value = null
    simulations.value = []
    currentResult.value = null
    loading.value = false
    error.value = null
  }

  return {
    defaults,
    simulations,
    currentResult,
    loading,
    error,
    loadDefaults,
    loadList,
    run,
    detail,
    reset,
  }
})
