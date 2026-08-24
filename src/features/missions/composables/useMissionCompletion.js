import { useToast } from '@/common/composables/useToast'
import aggressiveDiamond from '@/assets/badges/aggressive/diamond.png'
import { useSnackbar } from '@/common/composables/useSnackbar'
import { useMissionStore } from '@/features/missions/stores/mission.store'
import { BADGE_LEVELS, getBadgeImage } from '@/features/my-page/composables/investmentBadges'

const BADGE_MISSION_THRESHOLDS = new Set([1, 10, 50, 100, 300])

function getMissionId(missionId) {
  const normalizedMissionId = Array.isArray(missionId) ? missionId[0] : missionId
  const parsedMissionId = Number(normalizedMissionId)

  return Number.isSafeInteger(parsedMissionId) && parsedMissionId > 0 ? parsedMissionId : null
}

function unwrapResponse(response) {
  return response?.data ?? response?.result ?? response ?? null
}

function getBadgeStatus(response) {
  const payload = unwrapResponse(response)
  const type = String(payload?.missionType || '').toUpperCase()
  const isSafe = type === 'SAFE'

  return {
    type,
    count: Number(payload?.[isSafe ? 'safeMissionCount' : 'aggressiveMissionCount'] || 0),
    grade: payload?.[isSafe ? 'safeGrade' : 'aggressiveGrade'],
  }
}

function hasBadgeChanged(response) {
  const payload = unwrapResponse(response)
  if (payload?.badgeChanged || payload?.badge?.badgeChanged) return true

  const { count, grade } = getBadgeStatus(response)
  return Boolean(grade && BADGE_MISSION_THRESHOLDS.has(count))
}

function badgeCopy(response) {
  const payload = unwrapResponse(response)
  const badge = payload?.currentBadge || payload?.badge || {}
  const status = getBadgeStatus(response)
  const type = String(badge.investmentType || badge.missionType || status.type).toUpperCase()
  const grade = String(
    badge.badgeGrade || badge.grade || badge.level || status.grade || '',
  ).toUpperCase()
  const typeLabel =
    {
      SAFE: '안정형',
      BALANCED: '균형형',
      AGGRESSIVE: '공격형',
    }[type] || '새로운'
  const gradeLabel =
    {
      BRONZE: '브론즈',
      SILVER: '실버',
      GOLD: '골드',
      PLATINUM: '플래티넘',
      DIAMOND: '다이아몬드',
    }[grade] || '뱃지'

  const gradeKey =
    BADGE_LEVELS.find(({ key, level }) => key === grade || String(level) === grade)?.key || grade
  const imageType = type === 'BALANCED' ? 'SAFE' : type

  return {
    title: `${typeLabel} ${gradeLabel}`,
    message: '뱃지를 획득했어요',
    iconSrc: getBadgeImage(imageType, gradeKey) || aggressiveDiamond,
  }
}

export function useMissionCompletion(route, router, actionType) {
  const missionStore = useMissionStore()
  const toast = useToast()
  const snackbar = useSnackbar()

  function showMissionSuccess(completedCount = 1) {
    if (actionType === 'VIEW_AI_ANALYSIS') {
      toast.mission('AI 분석 수행 미션을 달성했어요')
      return
    }

    toast.mission(completedCount > 1 ? `${completedCount}개 미션 달성` : '미션 달성')
  }

  function showBadgeSuccess(response) {
    if (!hasBadgeChanged(response)) return

    snackbar.show({
      ...badgeCopy(response),
      variant: 'badge',
      placement: 'bottom',
      actionLabel: '뱃지 현황 보러가기',
      onAction: () => router.push({ name: 'badge-history' }),
    })
  }

  async function completeMissionAfterLoad() {
    const missionId = getMissionId(route.query.missionId)
    if (!missionId) {
      try {
        const completedMissions = await missionStore.completeByActionType(actionType)
        if (completedMissions.length) {
          showMissionSuccess(completedMissions.length)
          const badgeResponse = completedMissions.find(hasBadgeChanged)
          if (badgeResponse) showBadgeSuccess(badgeResponse)
        }
      } catch {
        return
      }
      return
    }

    try {
      const response = await missionStore.completeMissionById(missionId)
      showMissionSuccess()
      showBadgeSuccess(response)
    } catch (error) {
      // 이미 완료된 미션은 화면 이용 흐름을 막지 않습니다.
      if (error.response?.status !== 409) return
    }

    const query = { ...route.query }
    delete query.missionId
    await router.replace({ query })
  }

  return { completeMissionAfterLoad }
}
