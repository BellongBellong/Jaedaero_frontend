import { ref } from 'vue'
import { defineStore } from 'pinia'

import {
  getCachedTransaction,
  getSecuritiesTransactions,
  getTransactions,
  updateTransactionCategory,
} from '@/features/transactions/api/transactions.api'

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
    const securitiesResults = await Promise.allSettled(
      accounts.map((account) => getSecuritiesTransactions(account.accountId ?? account.id, params)),
    )
    const securitiesTransactions = securitiesResults
      .filter(({ status }) => status === 'fulfilled')
      .flatMap(({ value }) => value)
    transactions.value = append
      ? mergeTransactions(transactions.value, securitiesTransactions)
      : mergeTransactions(regularTransactions, securitiesTransactions)
    return transactions.value
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
    error,
    load,
    loadWithSecurities,
    updateCategory,
    cached,
    reset,
  }
})
