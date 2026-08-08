import { completeMission } from '@/features/missions/api/missions.api'

function getMissionId(missionId) {
  const normalizedMissionId = Array.isArray(missionId) ? missionId[0] : missionId
  const parsedMissionId = Number(normalizedMissionId)

  return Number.isSafeInteger(parsedMissionId) && parsedMissionId > 0 ? parsedMissionId : null
}

export function useMissionCompletion(route, router) {
  async function completeMissionAfterLoad() {
    const missionId = getMissionId(route.query.missionId)
    if (!missionId) return

    try {
      await completeMission(missionId)
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
