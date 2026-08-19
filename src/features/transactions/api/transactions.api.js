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

function normalizeTransactionDate(value) {
  if (Array.isArray(value)) {
    const [year, month, day, hour = 0, minute = 0, second = 0] = value.map(Number)
    if (!year || !month || !day) return ''

    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T${String(
      hour,
    ).padStart(2, '0')}:${String(minute).padStart(2, '0')}:${String(second).padStart(2, '0')}`
  }

  if (value && typeof value === 'object') {
    const year = Number(value.year)
    const month = Number(value.monthValue ?? value.month)
    const day = Number(value.dayOfMonth ?? value.day)
    if (!year || !month || !day) return ''

    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T${String(
      Number(value.hour || 0),
    ).padStart(2, '0')}:${String(Number(value.minute || 0)).padStart(2, '0')}:${String(
      Number(value.second || 0),
    ).padStart(2, '0')}`
  }

  return value || ''
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
    transactionDate: normalizeTransactionDate(
      transaction.transactionAt ?? transaction.transactionDate,
    ),
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

export async function getSecuritiesTransactions(accountId, params = {}) {
  const userId = Number(localStorage.getItem('userId')) || 1
  const supportedParams = {
    startDate: params.startDate,
    endDate: params.endDate,
    refresh: params.refresh,
  }
  const { data } = await apiClient.get(ENDPOINTS.transactions.securities(accountId), {
    params: Object.fromEntries(
      Object.entries(supportedParams).filter(([, value]) => value !== undefined && value !== ''),
    ),
    headers: { 'X-User-Id': userId },
  })
  const payload = data?.data ?? data
  const items = Array.isArray(payload) ? payload : (payload?.content ?? payload?.transactions ?? [])

  return items.map((transaction) => {
    const normalized = normalizeTransaction({
      ...transaction,
      accountId: transaction.accountId ?? accountId,
    })
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
