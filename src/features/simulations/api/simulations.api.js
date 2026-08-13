import apiClient from '@/common/api/client'
import { ENDPOINTS } from '@/common/api/endpoints'

function unwrapApiData(data) {
  return data?.data ?? data
}

export async function getSimulationDefaults() {
  const { data } = await apiClient.get(ENDPOINTS.simulations.defaults)
  return unwrapApiData(data)
}

export async function runSimulation(payload) {
  const { data } = await apiClient.post(ENDPOINTS.simulations.list, payload)
  return unwrapApiData(data)
}

export async function getSimulations(params = {}) {
  const { data } = await apiClient.get(ENDPOINTS.simulations.list, { params })
  return unwrapApiData(data)
}

export async function getSimulation(simulationId) {
  const { data } = await apiClient.get(ENDPOINTS.simulations.detail(simulationId))
  return unwrapApiData(data)
}
