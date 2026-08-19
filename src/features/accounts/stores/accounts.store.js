import { ref } from 'vue'
import { defineStore } from 'pinia'

import {
  connectAccount as connectAccountRequest,
  disconnectAccount as disconnectAccountRequest,
  getAccounts,
  reconnectAccount as reconnectAccountRequest,
  rememberDisconnectedAccount,
} from '@/features/accounts/api/accounts.api'

export const useAccountsStore = defineStore('accounts', () => {
  const accounts = ref([])
  const loading = ref(true)
  const error = ref(null)
  let accountsRequest = null

  async function load({ force = false, config = {} } = {}) {
    if (accounts.value.length && !force) return accounts.value
    if (accountsRequest) return accountsRequest

    loading.value = true
    error.value = null
    accountsRequest = getAccounts(config)

    try {
      accounts.value = await accountsRequest
      return accounts.value
    } catch (requestError) {
      error.value = requestError
      throw requestError
    } finally {
      accountsRequest = null
      loading.value = false
    }
  }

  async function connect(payload, config = {}) {
    const result = await connectAccountRequest(payload, config)
    await load({ force: true, config: { signal: config.signal } })
    return result
  }

  async function reconnect(account, config = {}) {
    const result = await reconnectAccountRequest(account, config)
    const accountId = account.accountId || account.id
    accounts.value = accounts.value.map((item) =>
      String(item.accountId || item.id) === String(accountId)
        ? { ...item, accountStatus: 'ACTIVE', isActive: true }
        : item,
    )
    return result
  }

  async function disconnect(account, config = {}) {
    const accountId = account.accountId || account.id
    await disconnectAccountRequest(accountId, config)
    rememberDisconnectedAccount(account)
    accounts.value = accounts.value.map((item) =>
      String(item.accountId || item.id) === String(accountId)
        ? { ...item, accountStatus: 'DISCONNECTED', isActive: false }
        : item,
    )
  }

  function reset() {
    accounts.value = []
    loading.value = false
    error.value = null
    accountsRequest = null
  }

  return {
    accounts,
    loading,
    error,
    load,
    connect,
    reconnect,
    disconnect,
    reset,
  }
})
