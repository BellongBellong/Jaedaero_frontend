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

export async function getCodefBanks() {
  const { data } = await apiClient.get(ENDPOINTS.codef.banks)
  return data
}

export async function getCodefSecurities() {
  const { data } = await apiClient.get(ENDPOINTS.codef.securities)
  return data
}

export async function getAccounts(userId, config = {}) {
  const { data } = await apiClient.get(ENDPOINTS.accounts.list, {
    ...config,
    params: { userId },
  })
  const accounts = Array.isArray(data) ? data : data?.accounts || data?.content || []

  return accounts.map((account) => ({
    ...account,
    accountId: account.accountId || account.id,
    organizationCode: accountOrganizationCode(account),
    institutionName: accountInstitutionName(account),
  }))
}
