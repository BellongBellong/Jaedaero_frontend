import apiClient from '@/common/api/client'
import { ENDPOINTS } from '@/common/api/endpoints'

export async function checkNickname(nickname) {
  const { data } = await apiClient.get(ENDPOINTS.users.nicknameAvailability, {
    params: { nickname },
  })
  return data
}

export async function saveAgreements(agreements) {
  const { data } = await apiClient.post(ENDPOINTS.agreements, {
    serviceUseAgreed: agreements.includes('service'),
    personalInformationCollectionAgreed: agreements.includes('privacy'),
    financialInformationInquiryAgreed: agreements.includes('finance'),
    aiServiceUseAgreed: agreements.includes('ai'),
    marketingInformationReceiptAgreed: agreements.includes('marketing'),
  })
  return data
}

export async function saveNickname(nickname) {
  await apiClient.put(ENDPOINTS.users.nickname, { nickname })
}

export async function saveProfileAppearance(payload) {
  await apiClient.put(ENDPOINTS.users.profileAppearance, payload)
}

export async function saveMilitaryInfo(payload) {
  const { data } = await apiClient.post(ENDPOINTS.onboarding.militaryInfo, payload)
  return data
}

export async function previewInvestmentPreference(payload) {
  const { data } = await apiClient.post(ENDPOINTS.onboarding.investmentPreference, payload)
  return data
}

export async function saveGoal(payload) {
  const { data } = await apiClient.post(ENDPOINTS.goals, payload)
  return data
}

export async function completeOnboarding() {
  const { data } = await apiClient.post(ENDPOINTS.onboarding.complete)
  return data
}
