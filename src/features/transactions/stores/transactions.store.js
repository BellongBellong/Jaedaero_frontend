import { ref } from 'vue'
import { defineStore } from 'pinia'

import { useAccountsStore } from '@/features/accounts/stores/accounts.store'
import {
  getCachedTransaction,
  getSecuritiesTransactions,
  getTransactions,
  updateTransactionCategory,
} from '@/features/transactions/api/transactions.api'

function isInvestmentAccount(account) {
  const accountType = String(account.accountType || account.type || '').toUpperCase()
  const businessType = String(account.businessType || '').toUpperCase()
  return (
    businessType === 'ST' ||
    ['INVESTMENT', 'SECURITIES', 'SECURITY'].includes(accountType) ||
    /증권|투자/.test(
      String(account.institutionName || account.bankName || account.accountName || ''),
    )
  )
}

function formatDate(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
    date.getDate(),
  ).padStart(2, '0')}`
}

function monthRange() {
  const now = new Date()
  const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0)
  return {
    startDate: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`,
    endDate: formatDate(endDate),
  }
}

function previousMonthsRange(endDate, months) {
  const end = new Date(`${endDate}T00:00:00`)
  const start = new Date(end)
  start.setMonth(start.getMonth() - months)
  return { startDate: formatDate(start), endDate: formatDate(end) }
}

function requestRange(query = {}) {
  if (query.period === 'vacation') {
    return { startDate: query.startDate, endDate: query.endDate }
  }
  if (query.period === 'month') return monthRange()
  return previousMonthsRange(formatDate(new Date()), 3)
}

function mergeTransactions(...groups) {
  const transactionMap = new Map()
  groups.flat().forEach((transaction) => {
    const key = String(
      transaction.id ??
        transaction.transactionId ??
        `${transaction.accountId}-${transaction.transactionDate}-${transaction.amount}`,
    )
    transactionMap.set(key, transaction)
  })
  return [...transactionMap.values()]
}

export const useTransactionsStore = defineStore('transactions', () => {
  const transactions = ref([])
  const loading = ref(false)
  const syncing = ref(false)
  const error = ref(null)
  let request = null

  async function load(params = {}, { force = false, append = false } = {}) {
    if (transactions.value.length && !force && !Object.keys(params).length) {
      return transactions.value
    }
    if (request) return request

    loading.value = true
    error.value = null
    request = getTransactions(params)
    try {
      const result = await request
      if (append) {
        transactions.value = mergeTransactions(transactions.value, result)
      } else if (params.accountId) {
        transactions.value = mergeTransactions(
          transactions.value.filter(
            (transaction) => String(transaction.accountId) !== String(params.accountId),
          ),
          result,
        )
      } else {
        transactions.value = result
      }
      return result
    } catch (requestError) {
      error.value = requestError
      throw requestError
    } finally {
      request = null
      loading.value = false
    }
  }

  async function loadWithSecurities(accounts, params = {}, { append = false } = {}) {
    const regularTransactions = await load(params, { force: true, append })
    const accountIds = [
      ...new Set(
        accounts
          .map((account) => account.accountId ?? account.id)
          .filter((accountId) => accountId !== undefined && accountId !== null && accountId !== '')
          .map(String),
      ),
    ]
    const securitiesResults = await Promise.allSettled(
      accountIds.map((accountId) => getSecuritiesTransactions(accountId, params)),
    )
    const securitiesTransactions = securitiesResults
      .filter(({ status }) => status === 'fulfilled')
      .flatMap(({ value }) => value)
    transactions.value = append
      ? mergeTransactions(transactions.value, securitiesTransactions)
      : mergeTransactions(regularTransactions, securitiesTransactions)
    return transactions.value
  }

  async function sync(query = {}) {
    if (syncing.value) return transactions.value

    syncing.value = true
    try {
      const accountsStore = useAccountsStore()
      const range = requestRange(query)
      await accountsStore.load({ force: true, config: { params: { refresh: true } } })
      return await loadWithSecurities(accountsStore.accounts.filter(isInvestmentAccount), {
        ...range,
        refresh: true,
      })
    } finally {
      syncing.value = false
    }
  }

  async function updateCategory(transactionId, category) {
    const result = await updateTransactionCategory(transactionId, category)
    transactions.value = transactions.value.map((transaction) =>
      String(transaction.id) === String(transactionId) ? { ...transaction, category } : transaction,
    )
    return result
  }

  function cached(transactionId) {
    return getCachedTransaction(transactionId)
  }

  function reset() {
    transactions.value = []
    loading.value = false
    error.value = null
    request = null
  }

  return {
    transactions,
    loading,
    syncing,
    error,
    load,
    loadWithSecurities,
    sync,
    updateCategory,
    cached,
    reset,
  }
})
