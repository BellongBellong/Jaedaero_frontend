import { ref } from 'vue'
import { defineStore } from 'pinia'

import { getMyPageProfile } from '@/features/my-page/api/myPage.api'
import { getInvestmentBadges, getChallengeGroup } from '@/features/challenges/api/challenges.api'

function unwrap(value) {
  return value?.data ?? value ?? null
}

function getCurrentYearMonth() {
  const date = new Date()
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

export const useChallengeStore = defineStore('challenge', () => {
  const challenge = ref(null)
  const badges = ref([])
  const profile = ref(null)
  const rankingPeriod = ref('CUMULATIVE')
  const rankingYearMonth = ref(getCurrentYearMonth())
  const loading = ref(true)
  const error = ref(null)
  let pendingRequest = null

  function getRankingParams() {
    return {
      period: rankingPeriod.value,
      ...(rankingPeriod.value === 'MONTHLY' && rankingYearMonth.value
        ? { yearMonth: rankingYearMonth.value }
        : {}),
    }
  }

  async function load({ force = false } = {}) {
    if (pendingRequest && !force) return pendingRequest

    const request = (async () => {
      loading.value = true
      error.value = null

      try {
        const [challengeResult, badgeResult, profileResult] = await Promise.allSettled([
          getChallengeGroup(getRankingParams()),
          getInvestmentBadges(),
          getMyPageProfile(),
        ])

        if (challengeResult.status === 'rejected') {
          error.value = challengeResult.reason
          throw challengeResult.reason
        }

        challenge.value = unwrap(challengeResult.value)

        if (badgeResult.status === 'fulfilled') {
          const value = unwrap(badgeResult.value)
          badges.value = Array.isArray(value) ? value : value?.badges || []
        }

        if (profileResult.status === 'fulfilled') profile.value = profileResult.value

        return challenge.value
      } finally {
        loading.value = false
      }
    })()

    pendingRequest = request
    try {
      return await request
    } finally {
      if (pendingRequest === request) pendingRequest = null
    }
  }

  function setRankingPeriod(period) {
    rankingPeriod.value = period
  }

  function setRankingYearMonth(yearMonth) {
    rankingYearMonth.value = yearMonth
  }

  function reset() {
    challenge.value = null
    badges.value = []
    profile.value = null
    loading.value = false
    error.value = null
    pendingRequest = null
  }

  return {
    challenge,
    badges,
    profile,
    rankingPeriod,
    rankingYearMonth,
    loading,
    error,
    load,
    setRankingPeriod,
    setRankingYearMonth,
    reset,
  }
})
