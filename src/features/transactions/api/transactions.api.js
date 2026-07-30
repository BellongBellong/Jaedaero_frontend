import apiClient from '@/common/api/client'
import { ENDPOINTS } from '@/common/api/endpoints'

export async function getTransactions(params = {}) {
  const { data } = await apiClient.get(ENDPOINTS.transactions.list, { params })
  return data
}

export async function updateTransactionCategory(transactionId, category) {
  const { data } = await apiClient.put(ENDPOINTS.transactions.category(transactionId), {
    category,
  })
  return data
}
