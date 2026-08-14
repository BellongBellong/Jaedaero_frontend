import apiClient from '@/common/api/client'
import { ENDPOINTS } from '@/common/api/endpoints'

const transactionCache = new Map()

const TRANSACTION_TYPE_MAP = {
  DEPOSIT: 'INCOME',
  WITHDRAW: 'EXPENSE',
  WITHDRAWAL: 'EXPENSE',
  INCOME: 'INCOME',
  EXPENSE: 'EXPENSE',
}

function normalizeTransaction(transaction) {
  const id = transaction.transactionId ?? transaction.id
  const transactionType =
    TRANSACTION_TYPE_MAP[String(transaction.transactionType || '').toUpperCase()] ??
    String(transaction.transactionType || '').toUpperCase()

  return {
    ...transaction,
    id,
    transactionId: id,
    transactionType,
    transactionDate: transaction.transactionAt ?? transaction.transactionDate,
    merchantName:
      transaction.merchantName ?? transaction.description ?? transaction.title ?? '거래 내역',
  }
}

export async function getTransactions(params = {}) {
  const userId = Number(localStorage.getItem('userId')) || 1
  const supportedParams = {
    accountId: params.accountId,
    category: params.category,
    startDate: params.startDate,
    endDate: params.endDate,
  }
  const { data } = await apiClient.get(ENDPOINTS.transactions.list, {
    params: Object.fromEntries(
      Object.entries(supportedParams).filter(([, value]) => value !== undefined && value !== ''),
    ),
    headers: { 'X-User-Id': userId },
  })
  const payload = data?.data ?? data
  const items = Array.isArray(payload) ? payload : (payload?.content ?? payload?.transactions ?? [])

  return items.map((transaction) => {
    const normalized = normalizeTransaction(transaction)
    transactionCache.set(String(normalized.id), normalized)
    return normalized
  })
}

export function getCachedTransaction(transactionId) {
  return transactionCache.get(String(transactionId)) ?? null
}

export async function updateTransactionCategory(transactionId, category) {
  const userId = Number(localStorage.getItem('userId')) || 1
  const { data } = await apiClient.put(
    ENDPOINTS.transactions.category(transactionId),
    {
      category,
    },
    {
      headers: { 'X-User-Id': userId },
    },
  )
  return data
}
