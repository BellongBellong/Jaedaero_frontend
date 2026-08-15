import { useMissionStore } from '@/features/missions/stores/mission.store'

function getMissionId(missionId) {
  const normalizedMissionId = Array.isArray(missionId) ? missionId[0] : missionId
  const parsedMissionId = Number(normalizedMissionId)

  return Number.isSafeInteger(parsedMissionId) && parsedMissionId > 0 ? parsedMissionId : null
}

export function useMissionCompletion(route, router, actionType) {
  const missionStore = useMissionStore()

  async function completeMissionAfterLoad() {
    const missionId = getMissionId(route.query.missionId)
    if (!missionId) {
      try {
        await missionStore.completeByActionType(actionType)
      } catch {
        return
      }
      return
    }

    try {
      await missionStore.completeMissionById(missionId)
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
