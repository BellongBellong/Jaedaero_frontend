import apiClient from '@/common/api/client'
import { ENDPOINTS } from '@/common/api/endpoints'

export async function runSimulation(payload) {
  const { data } = await apiClient.post(ENDPOINTS.simulations.list, payload)
  return data
}

export async function getSimulations(params = {}) {
  const { data } = await apiClient.get(ENDPOINTS.simulations.list, { params })
  return data
}

export async function getSimulation(simulationId) {
  const { data } = await apiClient.get(ENDPOINTS.simulations.detail(simulationId))
  return data
}
