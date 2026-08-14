import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

import { useAuthStore } from '@/features/auth/stores/auth.store'

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

  function complete() {
    persist()
    isComplete.value = true
    localStorage.setItem('jaedaero-onboarding-complete', 'true')
    useAuthStore().markOnboardingCompleted()
  }

  return { form, isComplete, targetAmountInTenThousands, persist, complete }
})
