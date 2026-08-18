import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

import { useAuthStore } from '@/features/auth/stores/auth.store'
import {
  checkNickname as checkNicknameRequest,
  previewInvestmentPreference,
  saveMilitaryInfo as saveMilitaryInfoRequest,
  saveNickname as saveNicknameRequest,
  saveProfileAppearance as saveProfileAppearanceRequest,
} from '@/features/onboarding/api/onboarding.api'
import { generateCashflow } from '@/features/cashflow/api/cashflow.api'

const initialState = {
  agreements: [],
  accountsConnected: false,
  militarySavingsConnected: false,
  salaryAccountConnected: false,
  nickname: '',
  profileImage: 'profile-army.png',
  profileBackgroundColor: '#E5FFF4',
  militaryType: 'ARMY',
  rank: 'PRIVATE',
  enlistmentDate: '',
  challengeGroupTargetAmountAverage: 0,
  investmentPreference: 'SAFE',
  targetAmount: 23000000,
}

export const useOnboardingStore = defineStore('onboarding', () => {
  const saved = JSON.parse(sessionStorage.getItem('jaedaero-onboarding') || 'null')
  const savedForm =
    saved?.enlistmentDate === '2026-06-30' ? { ...saved, enlistmentDate: '' } : saved
  const form = ref({ ...initialState, ...savedForm })
  const isComplete = ref(localStorage.getItem('jaedaero-onboarding-complete') === 'true')
  const targetAmountInTenThousands = computed({
    get: () => Math.round(form.value.targetAmount / 10000),
    set: (value) => {
      form.value.targetAmount = Number(value || 0) * 10000
    },
  })

  function persist() {
    sessionStorage.setItem('jaedaero-onboarding', JSON.stringify(form.value))
  }

  function updateForm(patch) {
    Object.assign(form.value, patch)
    persist()
  }

  async function checkNickname(nickname) {
    return checkNicknameRequest(nickname)
  }

  async function saveNickname(nickname) {
    await saveNicknameRequest(nickname)
    updateForm({ nickname })
  }

  async function saveProfileAppearance(payload, appearance) {
    await saveProfileAppearanceRequest(payload)
    updateForm(appearance)
  }

  async function saveMilitaryInfo(payload, challengeGroupTargetAmountAverage) {
    const soldierProfile = await saveMilitaryInfoRequest(payload)
    updateForm({
      challengeGroupTargetAmountAverage: Number(
        soldierProfile?.challengeGroupTargetAmountAverage ?? challengeGroupTargetAmountAverage ?? 0,
      ),
    })
    return soldierProfile
  }

  async function previewPreference() {
    const response = await previewInvestmentPreference({
      investmentPreference: form.value.investmentPreference,
      targetAmount: form.value.targetAmount,
    })
    persist()
    return response
  }

  async function completeOnboarding() {
    await generateCashflow()
    complete()
  }

  function complete() {
    persist()
    isComplete.value = true
    localStorage.setItem('jaedaero-onboarding-complete', 'true')
    useAuthStore().markOnboardingCompleted()
  }

  return {
    form,
    isComplete,
    targetAmountInTenThousands,
    persist,
    updateForm,
    checkNickname,
    saveNickname,
    saveProfileAppearance,
    saveMilitaryInfo,
    previewPreference,
    complete,
    completeOnboarding,
  }
})
