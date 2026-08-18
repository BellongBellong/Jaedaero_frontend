import aggressiveBronze from '@/assets/badges/aggressive/bronze.png'
import aggressiveDiamond from '@/assets/badges/aggressive/diamond.png'
import aggressiveGold from '@/assets/badges/aggressive/gold.png'
import aggressivePlatinum from '@/assets/badges/aggressive/platinum.png'
import aggressiveSilver from '@/assets/badges/aggressive/silver.png'
import safeBronze from '@/assets/badges/safe/bronze.png'
import safeDiamond from '@/assets/badges/safe/diamond.png'
import safeGold from '@/assets/badges/safe/gold.png'
import safePlatinum from '@/assets/badges/safe/platinum.png'
import safeSilver from '@/assets/badges/safe/silver.png'

export const BADGE_SELECTION_STORAGE_KEY = 'jaedaero-selected-investment-badge'

export const BADGE_LEVELS = [
  { key: 'BRONZE', label: 'Bronze', koreanLabel: '브론즈', level: 1, missionCount: 1 },
  { key: 'SILVER', label: 'Silver', koreanLabel: '실버', level: 2, missionCount: 10 },
  { key: 'GOLD', label: 'Gold', koreanLabel: '골드', level: 3, missionCount: 50 },
  { key: 'PLATINUM', label: 'Platinum', koreanLabel: '플래티넘', level: 4, missionCount: 100 },
  { key: 'DIAMOND', label: 'Diamond', koreanLabel: '다이아몬드', level: 5, missionCount: 300 },
]

export function getBadgeTier(missionCount) {
  const count = Number(missionCount) || 0

  return (
    [...BADGE_LEVELS].reverse().find(({ missionCount: threshold }) => count >= threshold) ||
    BADGE_LEVELS[0]
  )
}

export function getBadgeTarget(missionCount) {
  const count = Number(missionCount) || 0
  return (
    BADGE_LEVELS.find(({ missionCount: threshold }) => threshold > count)?.missionCount ||
    BADGE_LEVELS[BADGE_LEVELS.length - 1].missionCount
  )
}

const badgeTypes = {
  SAFE: { label: '안정형', imageType: 'SAFE' },
  BALANCED: { label: '균형형', imageType: 'SAFE' },
  AGGRESSIVE: { label: '공격형', imageType: 'AGGRESSIVE' },
}

const badgeImages = {
  SAFE: {
    BRONZE: safeBronze,
    SILVER: safeSilver,
    GOLD: safeGold,
    PLATINUM: safePlatinum,
    DIAMOND: safeDiamond,
  },
  AGGRESSIVE: {
    BRONZE: aggressiveBronze,
    SILVER: aggressiveSilver,
    GOLD: aggressiveGold,
    PLATINUM: aggressivePlatinum,
    DIAMOND: aggressiveDiamond,
  },
}

function toBadgeArray(payload) {
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.data)) return payload.data
  return payload?.content || payload?.items || payload?.data?.content || payload?.data?.items || []
}

function toCurrentBadgeStatuses(status) {
  if (!status) return []

  return [
    {
      missionType: 'SAFE',
      grade: status.safeGrade,
      missionCompletedCount: status.safeMissionCount,
      achieved: Boolean(status.safeGrade),
    },
    {
      missionType: 'AGGRESSIVE',
      grade: status.aggressiveGrade,
      missionCompletedCount: status.aggressiveMissionCount,
      achieved: Boolean(status.aggressiveGrade),
    },
  ].filter((badge) => badge.grade)
}

function getBadgeType(badge) {
  const code = String(badge.badgeCode || '').toUpperCase()
  const type = String(
    badge.missionType || badge.investmentType || badge.badgeType || code.split('_')[0],
  ).toUpperCase()
  return badgeTypes[type] ? type : null
}

function getMissionCount(badge) {
  const value =
    badge.missionCompletedCount ??
    badge.missionCount ??
    badge.completedMissionCount ??
    badge.totalMissionCount ??
    Number(badge.safeCount || 0) + Number(badge.aggressiveCount || 0)

  return Number.isFinite(Number(value)) ? Number(value) : 0
}

function getLevelByValue(value, badgeCode) {
  const code = String(badgeCode || '').toUpperCase()
  const levelByCode = BADGE_LEVELS.find(({ key }) => code.includes(key))
  if (levelByCode) return levelByCode

  const grade = String(value || '').toUpperCase()
  return (
    BADGE_LEVELS.find(({ key }) => key === grade) ||
    BADGE_LEVELS.find(({ level }) => level === Number(value)) ||
    BADGE_LEVELS[0]
  )
}

export function getBadgeImage(type, levelKey) {
  const imageType = badgeTypes[type]?.imageType || 'SAFE'
  return badgeImages[imageType][levelKey]
}

export function getBadgeProgress(payload, badgeStatus) {
  const progresses = [...toBadgeArray(payload), ...toCurrentBadgeStatuses(badgeStatus)]
    .map((badge) => {
      const type = getBadgeType(badge)
      if (!type) return null

      const missionCount = getMissionCount(badge)
      const inferredLevel = [...BADGE_LEVELS]
        .reverse()
        .find(({ missionCount: threshold }) => missionCount >= threshold)
      const levelInfo = getLevelByValue(
        badge.grade || badge.badgeGrade || badge.level,
        badge.badgeCode,
      )

      return {
        ...badge,
        type,
        typeInfo: badgeTypes[type],
        missionCount,
        requiredMissionCount: Number(badge.requiredMissionCount) || levelInfo.missionCount,
        levelInfo:
          badge.grade || badge.badgeGrade || badge.level ? levelInfo : inferredLevel || levelInfo,
      }
    })
    .filter(Boolean)

  const selectedProgresses = [
    ...progresses
      .reduce((byType, progress) => {
        const current = byType.get(progress.type)

        if (
          !current ||
          (progress.achieved === true && current.achieved !== true) ||
          (progress.achieved === current.achieved &&
            (progress.levelInfo.level > current.levelInfo.level ||
              (progress.levelInfo.level === current.levelInfo.level &&
                progress.missionCount > current.missionCount)))
        ) {
          byType.set(progress.type, progress)
        }

        return byType
      }, new Map())
      .values(),
  ]

  return selectedProgresses.map((progress) => ({
    ...progress,
    acquiredAtByLevel: progresses
      .filter((candidate) => candidate.type === progress.type && candidate.acquiredAt)
      .reduce(
        (dates, candidate) => ({
          ...dates,
          [candidate.levelInfo.key]: candidate.acquiredAt,
        }),
        {},
      ),
  }))
}

export function getEarnedBadges(progresses) {
  return progresses.flatMap((progress) =>
    BADGE_LEVELS.filter(({ missionCount, level }) => {
      if (progress.achieved === true) return level <= progress.levelInfo.level
      return progress.missionCount >= missionCount
    }).map((levelInfo) => ({
      id: `${progress.type}-${levelInfo.key}`,
      type: progress.type,
      typeInfo: progress.typeInfo,
      levelInfo,
      missionCount: progress.missionCount,
      acquiredAt:
        progress.acquiredAtByLevel?.[levelInfo.key] || progress.unlockedAt || progress.acquiredAt,
      image: getBadgeImage(progress.type, levelInfo.key),
    })),
  )
}

export function getSelectedBadge(badges, selectedBadgeId) {
  const selected = badges.find((badge) => badge.id === selectedBadgeId)
  if (selected) return selected

  return [...badges].sort((first, second) => {
    if (second.levelInfo.level !== first.levelInfo.level) {
      return second.levelInfo.level - first.levelInfo.level
    }
    return second.missionCount - first.missionCount
  })[0]
}
