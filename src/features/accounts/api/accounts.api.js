import apiClient from '@/common/api/client'
import { ENDPOINTS } from '@/common/api/endpoints'
import {
  accountInstitutionName,
  accountOrganizationCode,
} from '@/features/accounts/composables/institutionMapping'

export async function connectAccount(payload, config = {}) {
  const { data } = await apiClient.post(ENDPOINTS.accounts.connect, payload, config)
  return data
}

export async function getAccounts(config = {}) {
  const userId = Number(localStorage.getItem('userId'))
  const { data } = await apiClient.get(ENDPOINTS.accounts.list, {
    ...config,
    params: {
      ...(userId ? { userId } : {}),
      ...config.params,
    },
  })
  const payload = data?.data || data
  const accounts = Array.isArray(payload) ? payload : payload?.accounts || payload?.content || []

  return accounts.map((account) => ({
    ...account,
    accountId: account.accountId || account.id,
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
  }))
}
