<script setup>
import { computed, onBeforeUnmount, onMounted, ref, toRef } from 'vue'
import { useRouter } from 'vue-router'

import emptyBadgeState from '@/assets/badges/empty-badge-state.svg'
import CommonTabs from '../../../common/components/navigation/CommonTabs.vue'
import rankingCrownGold from '../../../assets/features/ranking/crown-gold.svg'
import rankingCrownSilver from '../../../assets/features/ranking/crown-silver.svg'
import rankingFirstPodium from '../../../assets/features/ranking/podium/ranking-first.png'
import rankingSecondPodium from '../../../assets/features/ranking/podium/ranking-second.png'
import rankingThirdPodium from '../../../assets/features/ranking/podium/ranking-third.png'
import { getCharacterAsset } from '@/common/constants/characterAssets'
import {
  BADGE_SELECTION_STORAGE_KEY,
  getBadgeImage,
  getBadgeProgress,
  getBadgeTarget,
  getBadgeTier,
  getEarnedBadges,
  getSelectedBadge,
} from '@/features/my-page/composables/investmentBadges'
import { findMissionRoute } from '@/features/missions/constants/missionActionRoutes'
import { useMissionStore } from '@/features/missions/stores/mission.store'
import { isMissionCompleted } from '@/features/missions/utils/missionStatus'
import { useChallengeStore } from '@/features/challenges/stores/challenge.store'

const activeTab = ref('missions')
const challengeTabs = [
  { label: '미션', value: 'missions' },
  { label: '랭킹', value: 'ranking' },
]
const router = useRouter()
const missionStore = useMissionStore()
const challengeStore = useChallengeStore()
const loading = toRef(challengeStore, 'loading')
const challenge = toRef(challengeStore, 'challenge')
const badges = toRef(challengeStore, 'badges')
const profile = toRef(challengeStore, 'profile')
const apiMissions = computed(() => missionStore.missions)
const selectedBadgeId = ref(localStorage.getItem(BADGE_SELECTION_STORAGE_KEY) || '')
const rankingPeriod = toRef(challengeStore, 'rankingPeriod')
const rankingYearMonth = toRef(challengeStore, 'rankingYearMonth')
const modeMenuOpen = ref(false)
const errorMessage = ref('')
const now = ref(new Date())
const ENCOURAGEMENT_STORAGE_KEY = 'jaedaero-challenge-encouragements'
const selectedRankingMember = ref(null)
const encouragedMemberKeys = ref(loadEncouragedMemberKeys())
let timerId

const rankingPodium = {
  1: { crown: rankingCrownGold, image: rankingFirstPodium },
  2: { crown: rankingCrownSilver, image: rankingSecondPodium },
  3: { crown: null, image: rankingThirdPodium },
}

const groupedMissions = computed(() => {
  if (apiMissions.value.length) {
    const groups = [
      { name: '오늘의 미션', categories: ['RECOMMENDED', 'TODAY'] },
      { name: '공통 미션', categories: ['DAILY'] },
      { name: '이벤트 미션', categories: ['ONE_TIME', 'EVENT', 'CONDITIONAL'] },
    ]

    return groups
      .map((group, groupIndex) => ({
        name: group.name,
        items: apiMissions.value
          .filter((mission) => {
            const category = String(
              mission.missionCategory || mission.missionGroup || mission.category || '',
            ).toUpperCase()
            const isDailyFallback = groupIndex === 1 && ['COMMON', 'GENERAL'].includes(category)
            const isTodayFallback = groupIndex === 0 && !category

            return group.categories.includes(category) || isDailyFallback || isTodayFallback
          })
          .map((mission) => ({
            ...mission,
            id: mission.missionId ?? mission.id,
            missionId: mission.missionId ?? mission.id,
            group: group.name,
            completed: isMissionCompleted(mission),
            type:
              mission.missionType === 'AGGRESSIVE'
                ? '공격형'
                : ['SAFE', 'BALANCED'].includes(mission.missionType)
                  ? '안정형'
                  : '공통',
          })),
      }))
      .filter((group) => group.items.length)
  }

  return []
})

const apiGroupedMissions = computed(() => (apiMissions.value.length ? groupedMissions.value : []))

const aggressiveCount = computed(() =>
  Number(profile.value?.investmentBadgeStatus?.aggressiveMissionCount ?? 0),
)
const safeCount = computed(() =>
  Number(profile.value?.investmentBadgeStatus?.safeMissionCount ?? 0),
)
const badgeProgress = computed(() =>
  getBadgeProgress(badges.value, profile.value?.investmentBadgeStatus),
)
const orderedBadgeProgress = computed(() =>
  [...badgeProgress.value].sort((first, second) => {
    const order = { SAFE: 0, BALANCED: 0, AGGRESSIVE: 1 }
    return (order[first.type] ?? 2) - (order[second.type] ?? 2)
  }),
)
const earnedInvestmentBadges = computed(() => getEarnedBadges(badgeProgress.value))
const selectedInvestmentBadge = computed(() =>
  getSelectedBadge(earnedInvestmentBadges.value, selectedBadgeId.value),
)
const badgePreviews = computed(() =>
  orderedBadgeProgress.value
    .map((progress) =>
      getSelectedBadge(
        earnedInvestmentBadges.value.filter((badge) => badge.type === progress.type),
        selectedBadgeId.value,
      ),
    )
    .filter(Boolean),
)
const aggressiveBadge = computed(() =>
  badgeProgress.value.find((badge) => badge.type === 'AGGRESSIVE'),
)
const safeBadge = computed(
  () =>
    badgeProgress.value.find((badge) => badge.type === 'SAFE') ||
    badgeProgress.value.find((badge) => badge.type === 'BALANCED'),
)
const aggressiveTier = computed(() => getBadgeTier(aggressiveCount.value))
const safeTier = computed(() => getBadgeTier(safeCount.value))
const aggressiveTarget = computed(() => getBadgeTarget(aggressiveCount.value))
const safeTarget = computed(() => getBadgeTarget(safeCount.value))
const totalCompletedMissions = computed(() =>
  badgeProgress.value.reduce((total, badge) => total + badge.missionCount, 0),
)
const showAggressiveBadge = computed(
  () => aggressiveCount.value > 0 && Boolean(aggressiveBadge.value),
)
const showSafeBadge = computed(() => safeCount.value > 0 && Boolean(safeBadge.value))
const hasBadge = computed(() => showAggressiveBadge.value || showSafeBadge.value)

function tierClass(tier) {
  return `tier-${tier.key.toLowerCase()}`
}
const resetCountdown = computed(() => {
  const tomorrow = new Date(now.value)
  tomorrow.setHours(24, 0, 0, 0)
  const remainingSeconds = Math.max(0, Math.floor((tomorrow - now.value) / 1000))
  const hours = String(Math.floor(remainingSeconds / 3600)).padStart(2, '0')
  const minutes = String(Math.floor((remainingSeconds % 3600) / 60)).padStart(2, '0')
  const seconds = String(remainingSeconds % 60).padStart(2, '0')

  return `${hours}:${minutes}:${seconds}`
})
const rankingSummary = computed(() => {
  const source = challenge.value || {}
  const result = source.monthlyResult || source.rankingResult || source.ranking || {}

  return {
    rank: result.myRankingNo ?? result.rank ?? source.myRankingNo ?? source.rank,
    memberCount: result.memberCount ?? result.groupSize ?? source.memberCount ?? source.groupSize,
    percentile:
      result.myRankPercentile ??
      result.myPercentile ??
      source.myRankPercentile ??
      source.myPercentile,
    missionCount:
      result.myMissionCompletionCount ??
      result.missionCompletionCount ??
      source.myMissionCompletionCount,
    averageMissionCount:
      result.groupAverageMissionCompletionCount ??
      result.averageMissionCompletionCount ??
      source.groupAverageMissionCompletionCount,
    topTenMissionCount:
      result.topTenPercentThreshold ??
      result.topTenPercentMissionCompletionCount ??
      source.topTenPercentThreshold,
  }
})
const rankingChart = computed(() => {
  const values = [
    Number(rankingSummary.value.averageMissionCount) || 0,
    Number(rankingSummary.value.missionCount) || 0,
    Number(rankingSummary.value.topTenMissionCount) || 0,
  ]
  const max = Math.max(...values, 1, 50)

  return values.map((value) => `${Math.max(value ? 12 : 0, (value / max) * 100)}%`)
})
const rankingChartMax = computed(() => {
  const values = [
    Number(rankingSummary.value.averageMissionCount) || 0,
    Number(rankingSummary.value.missionCount) || 0,
    Number(rankingSummary.value.topTenMissionCount) || 0,
  ]
  return Math.max(...values, 1, 50)
})
const rankingChartTicks = computed(() => {
  const max = rankingChartMax.value
  return Array.from({ length: 6 }, (_, index) => Math.round(max - (max / 5) * index))
})
const rankingAveragePosition = computed(() => {
  const average = Number(rankingSummary.value.averageMissionCount) || 0
  return `${(average / rankingChartMax.value) * 100}%`
})
const rankingComparison = computed(() => {
  const mine = Number(rankingSummary.value.missionCount) || 0
  const average = Number(rankingSummary.value.averageMissionCount) || 0
  const difference = mine - average
  return `${difference >= 0 ? '+' : ''}${difference}개`
})
const nearbyRanking = computed(() => {
  const source = challenge.value || {}
  const result = source.monthlyResult || source.rankingResult || source.ranking || source
  const myRank = Number(rankingSummary.value.rank) || 0
  const myMissionCount = Number(rankingSummary.value.missionCount) || 0
  const rankAbove = result.rankAbove ?? source.rankAbove ?? null
  const rankBelow = result.rankBelow ?? source.rankBelow ?? null
  const aboveRank = Number(rankAbove?.rank) || 0
  const aboveMissionCount = Number(rankAbove?.missionCount) || 0
  const todayMissionCount = 2

  return {
    myRank,
    myMissionCount,
    rankAbove,
    rankBelow,
    aboveRank,
    aboveMissionCount,
    hasNextRank: Boolean(rankAbove),
    isFirstPlace: myRank === 1,
    missionsToNextRank:
      Number(result.missionsToNextRank ?? source.missionsToNextRank) ||
      Math.max(0, aboveMissionCount - myMissionCount),
    projectedRank: Math.max(1, myRank - Math.min(todayMissionCount, myRank - 1)),
    todayMissionCount,
  }
})
const rankingTitle = computed(() => {
  const title = challenge.value?.cohortName || challenge.value?.groupName || '입대 동기'
  return title.endsWith('랭킹') ? title : `${title} 랭킹`
})
const rankingModeLabel = computed(() =>
  rankingPeriod.value === 'MONTHLY' ? '이번달 랭킹' : '전체 랭킹',
)
const rankingMonthLabel = computed(() => {
  const [, month] = String(rankingYearMonth.value || '').split('-')
  return month ? `${Number(month)}월 랭킹` : '월 랭킹'
})
const isCurrentRankingMonth = computed(() => rankingYearMonth.value === getCurrentYearMonth())
const minimumRankingYearMonth = computed(() => {
  const year = Number(
    challenge.value?.enlistmentYear || challenge.value?.enlistmentDate?.slice?.(0, 4),
  )
  const month = Number(
    challenge.value?.enlistmentMonth || challenge.value?.enlistmentDate?.slice?.(5, 7),
  )

  if (!Number.isInteger(year) || !Number.isInteger(month) || month < 1 || month > 12) {
    return ''
  }

  return `${year}-${String(month).padStart(2, '0')}`
})
const isFirstRankingMonth = computed(() => {
  const minimumMonth = minimumRankingYearMonth.value
  return Boolean(minimumMonth && rankingYearMonth.value <= minimumMonth)
})

const enlistmentYear = computed(() => {
  const value =
    challenge.value?.enlistmentYear || challenge.value?.enlistmentDate?.slice?.(0, 4) || ''
  const year = String(value)
  return year.length === 4 ? year.slice(2) : year
})
const enlistmentMonth = computed(() => {
  if (challenge.value?.enlistmentMonth) return challenge.value.enlistmentMonth
  const date = challenge.value?.enlistmentDate
  return date ? String(date).slice(5, 7).replace(/^0/, '') : ''
})
const currentRankingBadge = computed(() => {
  return selectedInvestmentBadge.value
})

function isCurrentRankingMember(member) {
  if (member.isMe === true || member.isCurrentUser === true || member.currentUser === true) {
    return true
  }

  const memberId = member.userId ?? member.memberId ?? member.user?.id
  const profileId = profile.value?.userId ?? profile.value?.memberId ?? profile.value?.id
  if (memberId && profileId && String(memberId) === String(profileId)) return true

  const memberNickname = member.nickname || member.nickName || member.userNickname
  return Boolean(memberNickname && memberNickname === profile.value?.nickname)
}

function normalizeRankingBadgeType(value) {
  const normalized = String(value || '').toUpperCase()
  if (['AGGRESSIVE', '공격형'].includes(normalized)) return 'AGGRESSIVE'
  if (['SAFE', 'BALANCED', '안정형'].includes(normalized)) return 'SAFE'
  return null
}

function getRankingCharacter(member) {
  const value =
    member.profileImage ||
    member.user?.profileImage ||
    member.profile?.profileImage ||
    member.characterImage ||
    member.soldierType ||
    member.branch ||
    member.militaryBranch
  const rawValue = String(value || '').trim()
  if (/^(https?:|data:|\/)/i.test(rawValue)) return value

  return getCharacterAsset(rawValue)
}

function getRankingNo(member, fallback) {
  const value = member.rankingNo ?? member.rank ?? member.ranking
  const numericValue = Number(value)
  if (Number.isFinite(numericValue) && numericValue > 0) return numericValue

  const matchedValue = String(value || '').match(/\d+/)?.[0]
  return Number(matchedValue) || fallback
}

const ranking = computed(() => {
  const supplied = challenge.value?.topRankers || challenge.value?.topMembers || []
  const normalizedMembers = supplied.map((member, index) => ({
    ...member,
    __rankingNo: getRankingNo(member, index + 1),
  }))

  return normalizedMembers
    .sort((left, right) => left.__rankingNo - right.__rankingNo)
    .slice(0, 3)
    .map((member, index) => {
      const rank = member.__rankingNo || index + 1
      const missionCount = Number(
        member.missionCompletionCount ??
          member.completedMissionCount ??
          member.missionCount ??
          member.totalMissionCount ??
          0,
      )
      const badge = member.badge || member.investmentBadge || member.currentBadge || {}
      const isCurrentMember = isCurrentRankingMember(member)
      const apiMemberType = normalizeRankingBadgeType(
        member.highestBadgeType ||
          member.investmentType ||
          member.badgeType ||
          member.missionType ||
          member.type ||
          badge.investmentType ||
          badge.missionType ||
          badge.badgeType ||
          badge.type,
      )
      const memberType = isCurrentMember
        ? selectedInvestmentBadge.value?.type || apiMemberType
        : apiMemberType
      const ownBadge = isCurrentMember
        ? selectedInvestmentBadge.value ||
          (memberType === 'SAFE'
            ? safeBadge.value
            : memberType === 'AGGRESSIVE'
              ? aggressiveBadge.value
              : currentRankingBadge.value)
        : null
      const rawTier =
        (isCurrentMember ? ownBadge?.levelInfo?.key : null) ||
        member.highestBadgeGrade ||
        member.badgeGrade ||
        member.grade ||
        member.tier ||
        member.badge?.badgeGrade ||
        member.badge?.grade ||
        member.badge?.tier ||
        member.badge?.levelInfo?.key ||
        badge.level ||
        badge.levelInfo?.key ||
        badge.tier ||
        ownBadge?.levelInfo?.key
      const tierKey = String(rawTier || '').toUpperCase()
      const tierInfo = ['BRONZE', 'SILVER', 'GOLD', 'PLATINUM', 'DIAMOND'].includes(tierKey)
        ? { key: tierKey, label: `${tierKey[0]}${tierKey.slice(1).toLowerCase()}` }
        : getBadgeTier(missionCount)
      const hasEarnedBadge =
        Boolean(ownBadge) ||
        Boolean(member.badgeImage || member.badge?.imageUrl || member.badge?.image) ||
        ['BRONZE', 'SILVER', 'GOLD', 'PLATINUM', 'DIAMOND'].includes(tierKey) ||
        missionCount > 0
      const podium = rankingPodium[rank] || rankingPodium[3]
      return {
        ...member,
        rank,
        nickname: member.nickname || member.nickName || member.userNickname || '-',
        missionCount,
        hasBadge: hasEarnedBadge,
        investmentType: memberType,
        tier: tierInfo.label,
        tierKey: tierInfo.key,
        badgeImage:
          (isCurrentMember && ownBadge
            ? getBadgeImage(ownBadge.type, ownBadge.levelInfo.key)
            : null) ||
          member.badgeImage ||
          member.badge?.imageUrl ||
          member.badge?.image ||
          badge.imageUrl ||
          badge.image ||
          (hasEarnedBadge && memberType
            ? getBadgeImage(memberType, tierInfo.key)
            : ownBadge
              ? getBadgeImage(ownBadge.type, ownBadge.levelInfo.key)
              : null),
        character: getRankingCharacter(member),
        crown: podium.crown,
        podiumImage: podium.image,
      }
    })
})

const apiRanking = computed(() => ranking.value)

function loadEncouragedMemberKeys() {
  try {
    const savedKeys = JSON.parse(localStorage.getItem(ENCOURAGEMENT_STORAGE_KEY) || '[]')
    return new Set(Array.isArray(savedKeys) ? savedKeys : [])
  } catch {
    return new Set()
  }
}

function getRankingMemberKey(member) {
  return String(member.userId ?? member.memberId ?? member.nickname ?? member.rank)
}

function hasSentEncouragement(member) {
  return encouragedMemberKeys.value.has(getRankingMemberKey(member))
}

function getEncouragementCount(member) {
  const count = Number(member.encouragementCount ?? member.cheerCount ?? member.likeCount ?? 0)
  return count + (hasSentEncouragement(member) ? 1 : 0)
}

function getRankingMemberType(member) {
  const type = normalizeRankingBadgeType(
    member.investmentType ||
      member.highestBadgeType ||
      member.badgeType ||
      member.missionType ||
      member.type ||
      member.badge?.investmentType ||
      member.badge?.missionType ||
      member.badge?.badgeType ||
      member.badge?.type ||
      member.investmentBadge?.investmentType ||
      member.investmentBadge?.missionType ||
      member.investmentBadge?.badgeType ||
      member.investmentBadge?.type,
  )
  return type === 'SAFE' ? '안정형' : type === 'AGGRESSIVE' ? '공격형' : '공통'
}

function openRankingMember(member) {
  selectedRankingMember.value = member
}

function closeRankingMember() {
  selectedRankingMember.value = null
}

function sendEncouragement() {
  const member = selectedRankingMember.value
  if (!member || isCurrentRankingMember(member) || hasSentEncouragement(member)) return

  const nextKeys = new Set(encouragedMemberKeys.value)
  nextKeys.add(getRankingMemberKey(member))
  encouragedMemberKeys.value = nextKeys
  localStorage.setItem(ENCOURAGEMENT_STORAGE_KEY, JSON.stringify([...nextKeys]))
}

function getCurrentYearMonth() {
  const date = new Date()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  return `${date.getFullYear()}-${month}`
}

async function loadChallenge() {
  errorMessage.value = ''
  const [challengeResult, missionResult] = await Promise.allSettled([
    challengeStore.load(),
    missionStore.loadTodayMissions(),
  ])

  if (challengeResult.status === 'rejected' && missionResult.status === 'rejected') {
    errorMessage.value = '챌린지 정보를 불러오지 못했어요.'
  }
}

async function changeRankingPeriod() {
  errorMessage.value = ''
  try {
    await challengeStore.load({ force: true })
  } catch {
    errorMessage.value = '랭킹 정보를 불러오지 못했어요.'
  }
}

function selectRankingPeriod(period) {
  challengeStore.setRankingPeriod(period)
  if (
    period === 'MONTHLY' &&
    minimumRankingYearMonth.value &&
    rankingYearMonth.value < minimumRankingYearMonth.value
  ) {
    challengeStore.setRankingYearMonth(minimumRankingYearMonth.value)
  }
  modeMenuOpen.value = false
  changeRankingPeriod()
}

function shiftRankingMonth(offset) {
  const [year, month] = String(rankingYearMonth.value || getCurrentYearMonth())
    .split('-')
    .map(Number)
  const nextDate = new Date(year, month - 1 + offset, 1)
  const nextYearMonth = `${nextDate.getFullYear()}-${String(nextDate.getMonth() + 1).padStart(2, '0')}`
  if (nextYearMonth > getCurrentYearMonth()) return
  if (minimumRankingYearMonth.value && nextYearMonth < minimumRankingYearMonth.value) return
  challengeStore.setRankingYearMonth(nextYearMonth)
  changeRankingPeriod()
}

async function openMission(mission) {
  const routeName = findMissionRoute(mission.actionType)
  if (!routeName) {
    errorMessage.value = '이 미션의 연결 화면은 준비 중이에요.'
    return
  }

  await router.push({
    name: routeName,
    query: { missionId: mission.missionId ?? mission.id },
  })
}

onMounted(() => {
  loadChallenge()
  timerId = window.setInterval(() => {
    now.value = new Date()
  }, 1000)
})

onBeforeUnmount(() => {
  window.clearInterval(timerId)
})
</script>

<template>
  <section class="challenge-page">
    <CommonTabs
      v-model="activeTab"
      class="challenge-tabs"
      :items="challengeTabs"
      aria-label="챌린지 메뉴"
    />

    <p
      v-if="errorMessage"
      class="challenge-error"
      role="status"
    >
      {{ errorMessage }}
    </p>

    <div
      v-if="loading"
      class="challenge-skeleton"
      aria-label="챌린지 정보를 불러오는 중"
    >
      <i class="skeleton-title" />
      <i class="skeleton-hero" />
      <i
        v-for="index in 4"
        :key="index"
        class="skeleton-card"
      />
    </div>

    <template v-else-if="activeTab === 'missions'">
      <section class="achievement-section">
        <h2>나의 <strong>미션 달성 현황</strong></h2>

        <div
          v-if="!hasBadge"
          class="empty-badge"
        >
          <img
            :src="emptyBadgeState"
            alt="아직 획득한 뱃지가 없어요"
          >
        </div>

        <div
          v-else
          class="badge-summary"
        >
          <article
            v-for="badge in badgePreviews"
            :key="badge.id"
            :class="{ 'is-selected': badge.id === selectedInvestmentBadge?.id }"
          >
            <img
              :src="badge.image"
              :alt="`${badge.typeInfo.label} ${badge.levelInfo.label} 뱃지`"
            >
            <span>{{ badge.typeInfo.label }}</span>
            <b>{{ badge.levelInfo.label }}</b>
            <small>미션 달성 {{ badge.missionCount }}개</small>
          </article>
          <aside>
            <span>달성한 총 미션</span>
            <strong>{{ totalCompletedMissions }}개</strong>
            <small
              v-for="badge in orderedBadgeProgress"
              :key="badge.type"
            >{{ badge.typeInfo.label }} {{ badge.missionCount }}개</small>
          </aside>
        </div>

        <template v-if="hasBadge">
          <div
            v-if="showSafeBadge"
            :class="['progress-row', tierClass(safeTier)]"
          >
            <div class="progress-badge">
              <img
                :src="getBadgeImage(safeBadge?.type || 'SAFE', safeTier.key)"
                alt=""
              >
              <span>안정형</span>
            </div>
            <div>
              <b :class="['tier-label', tierClass(safeTier)]">{{ safeTier.label }}</b><progress
                :class="tierClass(safeTier)"
                :value="safeCount"
                :max="safeTarget"
              /><small>현재 {{ safeCount }}개 <em>{{ safeTarget }}개</em></small>
            </div>
          </div>
          <div
            v-if="showAggressiveBadge"
            :class="['progress-row', tierClass(aggressiveTier)]"
          >
            <div class="progress-badge">
              <img
                :src="getBadgeImage('AGGRESSIVE', aggressiveTier.key)"
                alt=""
              >
              <span>공격형</span>
            </div>
            <div>
              <b :class="['tier-label', tierClass(aggressiveTier)]">{{ aggressiveTier.label }}</b><progress
                :class="tierClass(aggressiveTier)"
                :value="aggressiveCount"
                :max="aggressiveTarget"
              /><small>현재 {{ aggressiveCount }}개 <em>{{ aggressiveTarget }}개</em></small>
            </div>
          </div>
        </template>
      </section>

      <section
        v-for="group in apiGroupedMissions"
        :key="group.name"
        class="mission-group"
        :class="{ event: group.name === '이벤트 미션' }"
      >
        <header>
          <h3>{{ group.name }}</h3>
          <span v-if="group.name !== '이벤트 미션'">초기화까지 {{ resetCountdown }}</span>
        </header>
        <article
          v-for="mission in group.items"
          :key="mission.id"
          class="mission-card"
          :class="{ 'mission-card--completed': mission.completed }"
          role="button"
          tabindex="0"
          @click="openMission(mission)"
          @keydown.enter="openMission(mission)"
        >
          <span
            class="mission-check"
            :class="{ completed: mission.completed }"
          />
          <div>
            <strong>{{ mission.title }}</strong><span :class="`type-${mission.type}`">{{ mission.type }}</span><small>{{ mission.description }}</small>
          </div>
          <b class="chevron">›</b>
        </article>
      </section>
    </template>

    <template v-else>
      <section class="ranking-section">
        <div class="ranking-mode-picker">
          <button
            class="ranking-mode-trigger"
            type="button"
            @click="modeMenuOpen = !modeMenuOpen"
          >
            {{ rankingModeLabel }}
            <i
              class="ranking-mode-chevron"
              aria-hidden="true"
            />
          </button>
          <div
            v-if="modeMenuOpen"
            class="ranking-mode-menu"
          >
            <button
              type="button"
              @click="selectRankingPeriod('CUMULATIVE')"
            >
              전체 랭킹
            </button>
            <button
              type="button"
              @click="selectRankingPeriod('MONTHLY')"
            >
              이번달 랭킹
            </button>
          </div>
        </div>
        <div
          v-if="rankingPeriod === 'MONTHLY'"
          class="ranking-month-nav"
        >
          <button
            type="button"
            aria-label="이전 달"
            :disabled="isFirstRankingMonth"
            @click="shiftRankingMonth(-1)"
          >
            ‹
          </button>
          <h2>
            {{ rankingMonthLabel }}
          </h2>
          <button
            type="button"
            aria-label="다음 달"
            :disabled="isCurrentRankingMonth"
            @click="shiftRankingMonth(1)"
          >
            ›
          </button>
        </div>
        <h2 v-if="rankingPeriod !== 'MONTHLY'">
          {{ rankingTitle }}
        </h2>
        <strong>
          {{ challenge?.soldierType || challenge?.branch || profile?.militaryBranch || 'ARMY' }} ·
          {{ enlistmentYear }}년 {{ enlistmentMonth }}월 입대
        </strong>
        <small v-if="rankingPeriod === 'MONTHLY'"> 집계 기준 : 매월 9일 </small>
        <small v-else>
          집계 기준 : {{ challenge?.periodStartDate || '입대일' }} ~
          {{ challenge?.periodEndDate || '오늘' }}
        </small>

        <div
          v-if="apiRanking.length"
          class="podium"
        >
          <article
            v-for="member in apiRanking"
            :key="member.rank"
            :class="`rank-${member.rank}`"
          >
            <div class="member-label">
              <div class="member-name-row">
                <img
                  v-if="member.badgeImage"
                  class="member-rank-badge"
                  :src="member.badgeImage"
                  :alt="`${member.tier} 랭크 뱃지`"
                >
                <strong :title="`${member.tier} · ${member.nickname}`">{{
                  member.nickname
                }}</strong>
              </div>
              <small>미션 {{ member.missionCount }}개 달성</small>
            </div>
            <div class="ranking-visual">
              <img
                v-if="member.crown"
                class="ranking-crown"
                :src="member.crown"
                alt=""
              >
              <button
                class="ranking-character-wrap"
                type="button"
                :aria-label="`${member.nickname} 프로필 보기`"
                @click.stop="openRankingMember(member)"
              >
                <img
                  class="ranking-character"
                  :src="member.character"
                  :alt="`${member.nickname} 캐릭터`"
                >
              </button>
              <img
                class="ranking-podium"
                :src="member.podiumImage"
                alt=""
              >
            </div>
          </article>
        </div>
        <p
          v-else
          class="ranking-empty"
        >
          아직 랭킹 데이터가 없어요.
        </p>
      </section>

      <section class="my-rank-card">
        <h3>나의 순위</h3>
        <div>
          <strong>{{ rankingSummary.rank || '-' }}위</strong>
          <span>
            전체 {{ rankingSummary.memberCount || 0 }}명 중 상위
            {{ rankingSummary.percentile || 0 }}%
          </span>
        </div>
        <div class="rank-stats">
          <span>나<b>{{ rankingSummary.missionCount || 0 }}개</b></span>
          <span>평균<b>{{ rankingSummary.averageMissionCount || 0 }}개</b></span>
          <span>상위 10%<b>{{ rankingSummary.topTenMissionCount || 0 }}개</b></span>
        </div>
        <div class="next-rank-goal">
          <template v-if="nearbyRanking.hasNextRank">
            <div class="next-rank-goal__heading">
              <span>다음 순위까지</span>
              <strong>{{ nearbyRanking.missionsToNextRank }}개 남았어요</strong>
            </div>
            <div class="next-rank-goal__track">
              <span
                :style="{
                  width: `${(nearbyRanking.myMissionCount / nearbyRanking.aboveMissionCount) * 100}%`,
                }"
              />
            </div>
            <div class="next-rank-goal__labels">
              <span>{{ nearbyRanking.myRank }}위 · {{ nearbyRanking.myMissionCount }}개</span>
              <span>{{ nearbyRanking.aboveRank }}위 · {{ nearbyRanking.aboveMissionCount }}개</span>
            </div>
            <p>
              오늘 미션 {{ nearbyRanking.todayMissionCount }}개를 완료하면
              {{ nearbyRanking.projectedRank }}위까지 올라갈 수 있어요.
            </p>
          </template>
          <template v-else-if="nearbyRanking.isFirstPlace">
            <div class="next-rank-goal__heading">
              <span>현재 순위</span>
              <strong>현재 1위예요!</strong>
            </div>
            <p>지금의 페이스를 유지해 동기 랭킹 1위를 지켜보세요.</p>
          </template>
          <template v-else>
            <div class="next-rank-goal__heading">
              <span>다음 순위</span>
              <strong>인접 랭킹을 확인하고 있어요</strong>
            </div>
            <p>랭킹 정보가 준비되면 다음 목표를 안내해 드릴게요.</p>
          </template>
        </div>
        <div class="chart">
          <div
            class="chart-axis"
            aria-hidden="true"
          >
            <span
              v-for="tick in rankingChartTicks"
              :key="tick"
              :style="{ bottom: `${(tick / rankingChartMax) * 100}%` }"
            >{{ tick }}</span>
          </div>
          <div
            class="chart-average-line"
            :style="{ bottom: rankingAveragePosition }"
            aria-hidden="true"
          />
          <div class="chart-callout">
            동기 평균대비<br><strong>{{ rankingComparison }}</strong>
          </div>
          <div class="chart-bars">
            <i :style="{ height: rankingChart[0] }" /><i
              class="me"
              :style="{ height: rankingChart[1] }"
            /><i :style="{ height: rankingChart[2] }" />
          </div>
        </div>
        <div class="chart-labels">
          <span>하위 25%</span><span>나</span><span>상위 10%</span>
        </div>
        <div class="chart-legend">
          <span class="legend-me">나</span>
          <span class="legend-average">동기 평균</span>
        </div>
      </section>

      <section
        v-if="selectedRankingMember"
        class="ranking-profile-backdrop"
        role="dialog"
        aria-modal="true"
        aria-labelledby="ranking-profile-title"
        @click.self="closeRankingMember"
      >
        <div class="ranking-profile-modal">
          <button
            class="ranking-profile-close"
            type="button"
            aria-label="프로필 모달 닫기"
            @click="closeRankingMember"
          >
            ×
          </button>

          <div class="ranking-profile-visual">
            <span class="ranking-profile-rank">{{ selectedRankingMember.rank }}위</span>
            <img
              :src="selectedRankingMember.character"
              :alt="`${selectedRankingMember.nickname} 캐릭터`"
            >
          </div>

          <h2 id="ranking-profile-title">
            {{ selectedRankingMember.nickname }}
          </h2>
          <p class="ranking-profile-subtitle">
            <template v-if="selectedRankingMember.hasBadge">
              {{ getRankingMemberType(selectedRankingMember) }} · {{ selectedRankingMember.tier }}
            </template>
            <template v-else>
              뱃지가 없어요
            </template>
          </p>

          <div class="ranking-profile-stats">
            <span>랭킹<strong>{{ selectedRankingMember.rank }}위</strong></span>
            <span>미션<strong>{{ selectedRankingMember.missionCount }}개</strong></span>
            <span>응원<strong>{{ getEncouragementCount(selectedRankingMember) }}개</strong></span>
          </div>

          <button
            class="encouragement-button"
            :class="{ sent: hasSentEncouragement(selectedRankingMember) }"
            type="button"
            :disabled="
              isCurrentRankingMember(selectedRankingMember) ||
                hasSentEncouragement(selectedRankingMember)
            "
            @click="sendEncouragement"
          >
            <span aria-hidden="true">👍</span>
            {{
              isCurrentRankingMember(selectedRankingMember)
                ? '내 프로필이에요'
                : hasSentEncouragement(selectedRankingMember)
                  ? '응원을 보냈어요'
                  : '응원 보내기'
            }}
          </button>
          <p class="ranking-profile-hint">
            {{
              isCurrentRankingMember(selectedRankingMember)
                ? '다른 동기에게 응원을 보내보세요.'
                : '같은 사용자에게 한 번만 응원을 보낼 수 있어요.'
            }}
          </p>
        </div>
      </section>
    </template>
  </section>
</template>

<style scoped>
.challenge-page {
  min-height: 100%;
  padding: 0 20px 112px;
  color: #333;
  background: #fafafa;
}
.challenge-error {
  padding: 9px 12px;
  margin: 8px 0;
  border-radius: 12px;
  color: #d85d4e;
  background: #fff0ed;
  font-size: 12px;
  text-align: center;
}
.achievement-section {
  padding: 16px 20px 20px;
  margin: 0 -20px;
}
.achievement-section h2 {
  margin: 12px 0 20px;
  font-size: 15px;
}
.achievement-section h2 strong {
  color: #17b95f;
}
.badge-summary {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  min-height: 190px;
}
.badge-summary article {
  display: flex;
  width: 48px;
  min-width: 48px;
  flex-direction: column;
  align-items: center;
  font-size: 12px;
  gap: 0;
  text-align: center;
}
.badge-summary article.is-selected {
  width: 104px;
  min-width: 104px;
  gap: 4px;
}
.badge-summary article > span {
  max-width: 100%;
  padding: 4px 8px;
  border-radius: 14px;
  color: #555;
  background: #edf0ed;
  font-size: 12px;
  font-weight: 500;
  line-height: 1.1;
  white-space: nowrap;
  text-align: center;
}
.badge-summary article img {
  width: 48px;
  height: 48px;
  object-fit: contain;
}
.badge-summary article.is-selected img {
  width: 104px;
  height: 104px;
}
.badge-summary article b {
  color: #969696;
  font-size: 14px;
  font-weight: 500;
  line-height: 1.4;
}
.badge-summary article small {
  color: #888;
  font-size: 11px;
  font-weight: 700;
  line-height: 1.4;
  white-space: nowrap;
}
.badge-summary article:not(.is-selected) span,
.badge-summary article:not(.is-selected) b,
.badge-summary article:not(.is-selected) small {
  opacity: 0.55;
}
.badge-summary aside {
  width: 136px;
  min-width: 136px;
  min-height: 146px;
  padding: 18px 12px;
  border: 1px solid #fff;
  border-radius: 16px;
  background: rgb(255 255 255 / 58%);
  box-shadow: 0 2px 12px #00000008;
  color: #777;
  font-size: 12px;
  line-height: 1.7;
  text-align: center;
}
.badge-summary aside > span {
  display: block;
  line-height: 1.4;
}
.badge-summary aside strong {
  display: block;
  margin: 5px 0 12px;
  color: #999;
  line-height: 1.3;
}
.badge-summary aside small {
  display: block;
  margin-top: 0;
  color: #999;
  font-size: 12px;
}
.empty-badge {
  display: grid;
  place-items: center;
  min-height: 173px;
}
.empty-badge img {
  width: min(100%, 313px);
  height: 173px;
  max-height: none;
}
.progress-row {
  display: grid;
  grid-template-columns: 100px 1fr;
  align-items: center;
  gap: 6px;
  margin: 12px 0;
}
.progress-row + .progress-row {
  padding-top: 14px;
}
.progress-badge {
  display: flex;
  width: auto;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;
}
.progress-badge img {
  width: 50px;
  height: 50px;
  object-fit: contain;
}
.progress-badge span {
  min-width: 96px;
  padding: 6px 10px;
  border-radius: 18px;
  color: #65736a;
  background: #edf0ed;
  font-size: 13px;
  font-weight: 700;
  line-height: 1.1;
  text-align: center;
}
.progress-row > div:not(.progress-badge) {
  display: flex;
  width: min(100%, 275px);
  flex-direction: column;
  gap: 5px;
}
.progress-row b {
  align-self: flex-start;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 11px;
}
.progress-row.tier-bronze {
  --tier-color: #a86f45;
  --tier-background: #f7e9df;
}
.progress-row.tier-silver {
  --tier-color: #7d8b96;
  --tier-background: #edf1f4;
}
.progress-row.tier-gold {
  --tier-color: #d3a50d;
  --tier-background: #fff5cf;
}
.progress-row.tier-platinum {
  --tier-color: #65a4da;
  --tier-background: #eef8ff;
}
.progress-row.tier-diamond {
  --tier-color: #8b6bd1;
  --tier-background: #f1edff;
}
.progress-row b.tier-label {
  color: var(--tier-color);
  background: var(--tier-background);
}
.progress-row progress {
  width: 100%;
  height: 9px;
  border: 0;
  border-radius: 9px;
  overflow: hidden;
  accent-color: var(--tier-color);
  appearance: none;
}
.progress-row progress::-webkit-progress-bar {
  border-radius: 9px;
  background: #e7ebed;
}
.progress-row progress::-webkit-progress-value {
  border-radius: 9px;
  background: var(--tier-color);
}
.progress-row progress::-moz-progress-bar {
  border-radius: 9px;
  background: var(--tier-color);
}
.progress-row small {
  color: #888;
}
.progress-row em {
  float: right;
  font-style: normal;
}
.mission-group {
  padding: 20px 18px;
  margin: 10px 0;
  border-radius: 28px;
  background: #fff;
  box-shadow: 0 10px 24px #dff9e855;
}
.mission-group.event {
  background: linear-gradient(180deg, var(--green-50) 0%, var(--yellow-300) 100%);
}
.mission-group.event .mission-card {
  grid-template-columns: 24px minmax(0, 1fr) 12px;
  column-gap: 22px;
  min-height: 84px;
  padding: 16px;
}
.mission-group.event .mission-card small {
  line-height: 16px;
  white-space: normal;
}
.mission-group header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}
.mission-group h3 {
  margin: 0;
  color: #747474;
  font-size: 14px;
}
.mission-group header span {
  color: #c4c4c4;
  font-size: 12px;
}
.mission-card {
  display: grid;
  grid-template-columns: 26px 1fr 12px;
  align-items: center;
  gap: 10px;
  min-height: 62px;
  padding: 10px 12px;
  margin: 10px 0;
  border-radius: 20px;
  background: #fff;
  cursor: pointer;
}
.mission-card--completed {
  cursor: default;
}
.mission-check {
  width: 24px;
  height: 24px;
  border: 2px solid #b5c8b2;
  border-radius: 50%;
  background: #fff;
}
.mission-check.completed {
  border-color: #22c66b;
  background: #22c66b;
  box-shadow: inset 0 0 0 5px #fff;
}
.mission-card div {
  min-width: 0;
}
.mission-card strong {
  color: #777;
  font-size: 13px;
}
.mission-card div > span {
  padding: 4px 9px;
  margin-left: 8px;
  border-radius: 12px;
  font-size: 10px;
}
.type-안정형 {
  color: #20b964;
  background: #e5fff0;
}
.type-공격형 {
  color: #f07a65;
  background: #fff0ed;
}
.type-공통 {
  color: #777;
  background: #eee;
}
.mission-card small {
  display: block;
  margin-top: 5px;
  overflow: hidden;
  color: #999;
  font-size: 11px;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.chevron {
  color: #bbb;
  font-size: 24px;
}
.ranking-section {
  position: relative;
  text-align: center;
}
.ranking-filters {
  display: none;
}
.ranking-mode-picker {
  position: relative;
  z-index: 3;
  display: flex;
  justify-content: flex-end;
  min-height: 38px;
}
.ranking-mode-trigger {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border: 0;
  color: #757575;
  background: transparent;
  font-size: 13px;
  cursor: pointer;
}
.ranking-mode-chevron {
  width: 0;
  height: 0;
  border-top: 6px solid #757575;
  border-right: 4px solid transparent;
  border-left: 4px solid transparent;
}
.ranking-mode-menu {
  position: absolute;
  top: 34px;
  right: 0;
  display: grid;
  width: 116px;
  padding: 5px;
  border-radius: 10px;
  background: #fff;
  box-shadow: 0 8px 20px #00000014;
}
.ranking-mode-menu button {
  padding: 7px 8px;
  border: 0;
  border-radius: 7px;
  color: #757575;
  background: transparent;
  font-size: 12px;
  text-align: left;
  cursor: pointer;
}
.ranking-mode-menu button:hover {
  background: #f3fff8;
}
.ranking-month-nav {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin: 4px 0 2px;
}
.ranking-month-nav button {
  width: 24px;
  height: 32px;
  padding: 0;
  border: 0;
  color: #bdbdbd;
  background: transparent;
  font-size: 30px;
  line-height: 1;
  cursor: pointer;
}
.ranking-month-nav button:disabled {
  opacity: 0.35;
  cursor: default;
}
.ranking-month-nav h2 {
  margin: 0;
  font-size: 28px;
}
.ranking-section select {
  display: block;
  padding: 7px 30px 7px 15px;
  margin: 0;
  border: 0;
  border-radius: 18px;
  color: #777;
  background: #eafaf1;
}
.ranking-section input[type='month'] {
  min-width: 116px;
  padding: 7px 10px;
  border: 0;
  border-radius: 18px;
  color: #777;
  background: #f3fff8;
  font: inherit;
  font-size: 12px;
}
.ranking-section h2 {
  margin: 0 0 5px;
  font-family: var(--font-display);
  font-size: 24px;
  font-weight: 400;
  letter-spacing: -0.04em;
}
.ranking-section > strong {
  display: block;
  color: #777;
  font-size: 15px;
}
.ranking-section > small {
  color: #999;
}
.podium {
  position: relative;
  height: 250px;
  margin: 16px -4px 0;
}
.podium article {
  position: absolute;
  right: auto;
  bottom: var(--rank-bottom);
  left: var(--rank-left);
  display: flex;
  align-items: center;
  flex-direction: column;
  justify-content: flex-end;
  width: 31%;
  height: 100%;
  transform: translateX(-50%);
  --rank-left: 50%;
  --rank-bottom: 0px;
  --label-offset-x: 0px;
  --label-offset-y: 0px;
  --visual-offset-x: 0px;
  --visual-offset-y: 0px;
  --character-offset-x: 0px;
  --character-offset-y: 0px;
  --crown-offset-x: 0px;
  --crown-offset-y: 0px;
  --podium-offset-x: 0px;
  --podium-offset-y: 0px;
}
.podium .rank-1 {
  --rank-left: 50%;
  --stage-height: 196px;
  --character-bottom: 83px;
  --podium-image-width: 91px;
}
.podium .rank-2 {
  --rank-left: 24%;
  --stage-height: 168px;
  --character-bottom: 55px;
  --podium-image-width: 91px;
  --podium-offset-x: -5px;
}
.podium .rank-3 {
  --rank-left: 77%;
  --stage-height: 124px;
  --character-bottom: 40px;
  --podium-image-width: 91px;
  --crown-offset-x: -4.5px;
  --podium-offset-x: 1px;
}
.member-label {
  position: absolute;
  z-index: 2;
  bottom: var(--stage-height);
  right: 0;
  left: 0;
  display: grid;
  justify-items: center;
  min-height: 52px;
  padding: 4px 2px;
  font-size: 11px;
  transform: translate(var(--label-offset-x), var(--label-offset-y));
}
.member-name-row {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 0;
  gap: 5px;
}
.member-rank-badge {
  flex: 0 0 auto;
  width: 28px;
  height: 28px;
  object-fit: contain;
}
.member-label strong {
  display: inline-block;
  max-width: 100%;
  overflow: hidden;
  padding: 3px 9px;
  border: 1px solid #f4f4f4;
  border-radius: 999px;
  background: #fff;
  font-size: 10px;
  font-weight: 700;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.member-label small {
  display: block;
  margin-top: 2px;
  color: #aaa;
  font-size: 10px;
}
.ranking-visual {
  position: relative;
  width: 91px;
  height: var(--stage-height);
  flex: 0 0 auto;
  margin: 0 auto;
  transform: translate(var(--visual-offset-x), var(--visual-offset-y));
}
.ranking-character-wrap {
  position: absolute;
  z-index: 2;
  display: block;
  bottom: calc(var(--character-bottom) + var(--character-offset-y));
  left: calc(50% + var(--character-offset-x));
  width: 70px;
  height: 65px;
  padding: 0;
  border: 0;
  background: transparent;
  cursor: pointer;
  transform: translateX(-50%);
}
.ranking-character-wrap:focus-visible {
  border-radius: 24px;
  outline: 3px solid #42d985;
  outline-offset: 4px;
}
.ranking-character {
  display: block;
  width: 70px;
  height: 70px;
  object-fit: contain;
}
.podium .rank-2 .ranking-character {
  transform: scaleX(-1);
}
.ranking-crown,
.ranking-podium {
  position: absolute;
  left: calc(50% + var(--podium-offset-x));
  object-fit: contain;
  transform: translateX(-50%);
}
.ranking-crown {
  z-index: 4;
  bottom: calc(var(--character-bottom) + 66px + var(--crown-offset-y));
  left: calc(50% + var(--crown-offset-x));
  width: 30px;
  height: 29px;
}
.ranking-podium {
  z-index: 1;
  bottom: 0;
  width: var(--podium-image-width);
  height: auto;
  transform: translate(-50%, var(--podium-offset-y));
}
.ranking-empty {
  padding: 90px 0 70px;
  color: #aaa;
  font-size: 12px;
}
.ranking-profile-backdrop {
  position: fixed;
  z-index: var(--z-modal, 1000);
  inset: 0;
  display: grid;
  place-items: center;
  padding: 24px;
  background: rgb(27 38 32 / 42%);
}
.ranking-profile-modal {
  position: relative;
  width: min(100%, 320px);
  padding: 28px 20px 22px;
  border: 1px solid rgb(255 255 255 / 78%);
  border-radius: 28px;
  background: #fff;
  box-shadow: 0 18px 45px rgb(30 70 48 / 20%);
  text-align: center;
}
.ranking-profile-close {
  position: absolute;
  top: 10px;
  right: 14px;
  width: 32px;
  height: 32px;
  padding: 0;
  border: 0;
  color: #9ca5a0;
  background: transparent;
  font-size: 26px;
  line-height: 1;
  cursor: pointer;
}
.ranking-profile-visual {
  position: relative;
  display: grid;
  width: 104px;
  height: 104px;
  place-items: center;
  margin: 0 auto 12px;
  border-radius: 50%;
  background: linear-gradient(145deg, #effff5, #e1f7ec);
}
.ranking-profile-visual img {
  width: 82px;
  height: 82px;
  object-fit: contain;
}
.ranking-profile-rank {
  position: absolute;
  right: -7px;
  bottom: 0;
  padding: 5px 9px;
  border-radius: 999px;
  color: #fff;
  background: #31bd6d;
  font-size: 11px;
  font-weight: 700;
}
.ranking-profile-modal h2 {
  margin: 0;
  color: #343b37;
  font-size: 20px;
}
.ranking-profile-subtitle {
  margin: 5px 0 18px;
  color: #929b96;
  font-size: 12px;
}
.ranking-profile-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 6px;
  margin-bottom: 18px;
}
.ranking-profile-stats span {
  padding: 9px 4px;
  border-radius: 12px;
  color: #8a938e;
  background: #f5faf6;
  font-size: 11px;
}
.ranking-profile-stats strong {
  display: block;
  margin-top: 3px;
  color: #3a433e;
  font-size: 13px;
}
.encouragement-button {
  display: inline-flex;
  width: 100%;
  min-height: 48px;
  align-items: center;
  justify-content: center;
  gap: 7px;
  padding: 12px 18px;
  border: 0;
  border-radius: 16px;
  color: #fff;
  background: #22c66b;
  font: inherit;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition:
    background 160ms ease,
    transform 160ms ease;
}
.encouragement-button:hover:not(:disabled) {
  background: #18ae5b;
  transform: translateY(-1px);
}
.encouragement-button:focus-visible {
  outline: 3px solid #9ff0bd;
  outline-offset: 3px;
}
.encouragement-button.sent,
.encouragement-button:disabled {
  color: #7d8982;
  background: #edf2ee;
  cursor: default;
}
.ranking-profile-hint {
  margin: 10px 0 0;
  color: #a2aaa5;
  font-size: 11px;
}
.my-rank-card {
  padding: 20px;
  margin-top: -2px;
  border-radius: 28px;
  background: #fff;
  box-shadow: 0 10px 25px #0000000a;
}
.my-rank-card h3 {
  margin: 0 0 8px;
  font-size: 14px;
}
.my-rank-card > div:nth-child(2) {
  display: flex;
  align-items: baseline;
  gap: 10px;
}
.my-rank-card > div > strong {
  font-size: 26px;
}
.my-rank-card > div > span {
  color: #999;
  font-size: 12px;
}
.rank-stats {
  display: grid !important;
  grid-template-columns: repeat(3, 1fr);
  gap: 7px;
  margin: 14px 0;
}
.rank-stats span {
  padding: 8px;
  border-radius: 10px;
  text-align: center;
  background: #fff7dc;
}
.rank-stats b {
  display: block;
  margin-top: 3px;
  color: #444;
}
.next-rank-goal {
  padding: 16px;
  margin: 16px 0 20px;
  border: 1px solid #e3f4e8;
  border-radius: 18px;
  background: linear-gradient(135deg, #f6fff8 0%, #fffdf2 100%);
}
.next-rank-goal__heading {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  color: #829087;
  font-size: 12px;
}
.next-rank-goal__heading strong {
  color: #1db960;
  font-size: 14px;
}
.next-rank-goal__track {
  height: 8px;
  margin-top: 12px;
  overflow: hidden;
  border-radius: 999px;
  background: #e7eee9;
}
.next-rank-goal__track span {
  display: block;
  width: 0;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, #55e88b 0%, #b7e84e 100%);
}
.next-rank-goal__labels {
  display: flex;
  justify-content: space-between;
  margin-top: 7px;
  color: #9aa39d;
  font-size: 10px;
}
.next-rank-goal p {
  padding-top: 11px;
  margin: 11px 0 0;
  border-top: 1px solid #e8f1e9;
  color: #68756d;
  font-size: 11px;
  line-height: 1.5;
  text-align: center;
}
.chart {
  position: relative;
  height: 165px;
  margin: 42px 0 0 34px;
  border-bottom: 1px solid #dfe4e7;
  background: repeating-linear-gradient(to top, transparent 0 32px, #e1e5e8 33px);
}
.chart-axis {
  position: absolute;
  inset: 0 auto 0 -28px;
  width: 24px;
  color: #8fa1bd;
  font-size: 10px;
}
.chart-axis span {
  position: absolute;
  right: 0;
  transform: translateY(50%);
}
.chart-average-line {
  position: absolute;
  right: 0;
  left: 0;
  z-index: 1;
  border-top: 2px solid #f28a1b;
}
.chart-callout {
  position: absolute;
  top: -38px;
  left: 50%;
  z-index: 3;
  width: 108px;
  padding: 6px 4px;
  border: 1px solid #43ec91;
  border-radius: 14px;
  color: #6c7775;
  background: #f5fff8;
  font-size: 10px;
  line-height: 1.1;
  text-align: center;
  transform: translateX(-50%);
}
.chart-callout strong {
  font-size: 12px;
}
.chart-bars {
  position: absolute;
  right: 26px;
  bottom: 0;
  left: 20px;
  display: flex;
  align-items: flex-end;
  justify-content: space-around;
  height: 100%;
}
.chart-bars i {
  width: 40px;
  border-radius: 10px 10px 0 0;
  background: #bbb;
}
.chart-bars i.me {
  background: #55ee94;
}
.chart-labels {
  display: flex;
  justify-content: space-around;
  margin: 6px 26px 0 54px;
  color: #78849c;
  font-size: 10px;
}
.chart-legend {
  display: flex;
  justify-content: center;
  gap: 14px;
  margin-top: 20px;
  color: #333;
  font-size: 10px;
}
.legend-me::before {
  display: inline-block;
  width: 10px;
  height: 10px;
  margin-right: 5px;
  content: '';
  vertical-align: -1px;
  background: #55ee94;
}
.legend-average::before {
  display: inline-block;
  width: 12px;
  margin-right: 5px;
  border-top: 1px solid #f28a1b;
  content: '';
  vertical-align: 3px;
}
.challenge-skeleton {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding-top: 20px;
}
.challenge-skeleton i {
  display: block;
  border-radius: 20px;
  background: #ececec;
  animation: pulse 1.2s ease-in-out infinite;
}
.skeleton-title {
  width: 45%;
  height: 22px;
}
.skeleton-hero {
  height: 210px;
}
.skeleton-card {
  height: 96px;
}
@keyframes pulse {
  50% {
    opacity: 0.45;
  }
}
</style>
