import { ref } from 'vue'
import { defineStore } from 'pinia'

import { getInvestmentBadges } from '@/features/challenges/api/challenges.api'
import { useAccountsStore } from '@/features/accounts/stores/accounts.store'
import {
  checkNicknameAvailability,
  getGoal,
  getMyPageProfile,
  updateGoal,
  updateNickname,
  updateProfileAppearance,
  withdrawUser,
} from '@/features/my-page/api/myPage.api'

export const useMyPageStore = defineStore('my-page', () => {
  const accountsStore = useAccountsStore()
  const profile = ref(null)
  const connectedAccountCount = ref(0)
  const investmentBadges = ref([])
  const goalAmount = ref(0)
  const pageLoading = ref(true)
  const badgesLoading = ref(true)
  const error = ref(null)
  let pageRequest = null

  async function load() {
    if (pageRequest) return pageRequest

    const request = (async () => {
      pageLoading.value = true
      badgesLoading.value = true
      error.value = null

      try {
        const [profileResult, accountsResult, goalResult, badgesResult] = await Promise.allSettled([
          getMyPageProfile(),
          accountsStore.load(),
          getGoal(),
          getInvestmentBadges(),
        ])

        if (profileResult.status === 'fulfilled') profile.value = profileResult.value
        if (accountsResult.status === 'fulfilled') {
          connectedAccountCount.value = new Set(
            accountsResult.value.map(
              (account) => account.organizationCode || account.institutionName,
            ),
          ).size
        }
        if (goalResult.status === 'fulfilled') {
          goalAmount.value = goalResult.value?.targetAmount || 0
        }
        if (badgesResult.status === 'fulfilled') {
          investmentBadges.value = Array.isArray(badgesResult.value)
            ? badgesResult.value
            : badgesResult.value?.badges || []
        }

        const failedResult = [profileResult, accountsResult, goalResult, badgesResult].find(
          (result) => result.status === 'rejected',
        )
        if (failedResult) error.value = failedResult.reason
        return profile.value
      } finally {
        badgesLoading.value = false
        pageLoading.value = false
      }
    })()
    pageRequest = request

    try {
      return await request
    } finally {
      if (pageRequest === request) pageRequest = null
    }
  }

  async function checkNickname(nickname) {
    return checkNicknameAvailability(nickname)
  }

  async function saveNickname(nickname) {
    await updateNickname(nickname)
    profile.value = { ...profile.value, nickname }
  }

  async function saveAppearance(payload, appearance) {
    await updateProfileAppearance(payload)
    profile.value = { ...profile.value, ...appearance }
  }

  async function saveGoal(targetAmount) {
    const result = await updateGoal(targetAmount)
    goalAmount.value = result?.targetAmount ?? targetAmount
    return result
  }

  async function withdraw() {
    await withdrawUser()
  }

  function reset() {
    profile.value = null
    connectedAccountCount.value = 0
    investmentBadges.value = []
    goalAmount.value = 0
    pageLoading.value = true
    badgesLoading.value = true
    error.value = null
    pageRequest = null
  }

  return {
    profile,
    connectedAccountCount,
    investmentBadges,
    goalAmount,
    pageLoading,
    badgesLoading,
    error,
    load,
    checkNickname,
    saveNickname,
    saveAppearance,
    saveGoal,
    withdraw,
    reset,
  }
})
