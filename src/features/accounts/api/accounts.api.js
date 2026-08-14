import apiClient from '@/common/api/client'
import { ENDPOINTS } from '@/common/api/endpoints'
import {
  accountConnectionStatus,
  accountInstitutionKey,
  accountInstitutionName,
  accountOrganizationCode,
} from '@/features/accounts/composables/institutionMapping'

const DISCONNECTED_ACCOUNTS_KEY = 'disconnectedAccounts'

function disconnectedAccountsStorageKey() {
  const userId = Number(localStorage.getItem('userId')) || 1
  return `${DISCONNECTED_ACCOUNTS_KEY}:${userId}`
}

function readDisconnectedAccounts() {
  try {
    const stored = JSON.parse(localStorage.getItem(disconnectedAccountsStorageKey()) || '[]')
    return Array.isArray(stored) ? stored : []
  } catch {
    return []
  }
}

function writeDisconnectedAccounts(accounts) {
  localStorage.setItem(disconnectedAccountsStorageKey(), JSON.stringify(accounts))
}

function hasSameAccount(left, right) {
  const leftId = left.accountId || left.id
  const rightId = right.accountId || right.id
  return leftId && rightId && String(leftId) === String(rightId)
}

function hasSameInstitution(left, right) {
  const leftKey = accountInstitutionKey(left)
  const rightKey = accountInstitutionKey(right)
  return leftKey && rightKey && leftKey === rightKey
}

export async function connectAccount(payload, config = {}) {
  const { data } = await apiClient.post(ENDPOINTS.accounts.connect, payload, config)
  clearDisconnectedAccountsByInstitution(payload)
  return data
}

export async function reconnectAccount(account, config = {}) {
  const userId = Number(localStorage.getItem('userId')) || 1
  const accountId = account.accountId || account.id
  const { data } = await apiClient.patch(ENDPOINTS.accounts.activate(accountId), null, {
    ...config,
    params: {
      ...config.params,
      userId,
    },
  })

  clearDisconnectedAccount(account)
  return data
}

export async function getAccounts(config = {}) {
  const userId = Number(localStorage.getItem('userId')) || 1
  const { data } = await apiClient.get(ENDPOINTS.accounts.list, {
    ...config,
    params: {
      userId,
      ...config.params,
    },
  })
  const payload = data?.data || data
  const accounts = Array.isArray(payload) ? payload : payload?.accounts || payload?.content || []

  const mappedAccounts = accounts.map((account) => ({
    ...account,
    accountId: account.accountId || account.id,
    id: account.accountId || account.id,
    accountName:
      account.accountName ||
      account.productName ||
      account.accountProductName ||
      account.product ||
      account.accountAlias ||
      account.name ||
      account.accountNumber,
    organizationCode: accountOrganizationCode(account),
    institutionName: accountInstitutionName(account),
    bankName: account.institutionName || accountInstitutionName(account),
    accountNumberMasked: account.accountMasked || account.accountNumberMasked,
    balance: Number(account.currentBalance ?? account.balance ?? 0),
    amount: Number(account.currentBalance ?? account.balance ?? 0),
  }))

  const activeInstitutions = new Set(
    mappedAccounts
      .filter((account) => accountConnectionStatus(account) === 'active')
      .map((account) => accountInstitutionKey(account)),
  )
  const rememberedDisconnectedAccounts = readDisconnectedAccounts().filter(
    (account) =>
      !mappedAccounts.some((mappedAccount) => hasSameAccount(mappedAccount, account)) &&
      !activeInstitutions.has(accountInstitutionKey(account)),
  )

  return [...mappedAccounts, ...rememberedDisconnectedAccounts]
}

export async function disconnectAccount(accountId, config = {}) {
  const userId = Number(localStorage.getItem('userId')) || 1
  await apiClient.delete(ENDPOINTS.accounts.detail(accountId), {
    ...config,
    params: {
      userId,
      ...config.params,
    },
  })
}

export function rememberDisconnectedAccount(account) {
  const rememberedAccounts = readDisconnectedAccounts().filter(
    (item) => !hasSameAccount(item, account),
  )

  rememberedAccounts.push({ ...account, accountStatus: 'DISCONNECTED' })
  writeDisconnectedAccounts(rememberedAccounts)
}

function clearDisconnectedAccount(account) {
  const remainingAccounts = readDisconnectedAccounts().filter(
    (item) => !hasSameAccount(item, account),
  )

  writeDisconnectedAccounts(remainingAccounts)
}

function clearDisconnectedAccountsByInstitution(account) {
  const remainingAccounts = readDisconnectedAccounts().filter(
    (item) => !hasSameInstitution(item, account),
  )

  writeDisconnectedAccounts(remainingAccounts)
}
