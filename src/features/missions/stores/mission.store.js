import { ref } from 'vue'
import { defineStore } from 'pinia'

import {
  completeMission as completeMissionRequest,
  getTodayMissions as getTodayMissionsRequest,
} from '@/features/missions/api/missions.api'
import { isMissionCompleted } from '@/features/missions/utils/missionStatus'

function getDateKey() {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

function getUserKey() {
  if (typeof window === 'undefined') return ''

  try {
    return window.localStorage.getItem('userId') || ''
  } catch {
    return ''
  }
}

function normalizeActionType(actionType) {
  return String(actionType || '')
    .trim()
    .toUpperCase()
}

function getMissionId(mission) {
  const rawMissionId = mission?.missionId ?? mission?.id ?? mission
  const normalizedMissionId = Array.isArray(rawMissionId) ? rawMissionId[0] : rawMissionId
  const parsedMissionId = Number(normalizedMissionId)

  return Number.isSafeInteger(parsedMissionId) && parsedMissionId > 0 ? parsedMissionId : null
}

function getMissionList(response) {
  if (Array.isArray(response)) return response

  const missions = response?.data ?? response?.missions ?? response?.items ?? []
  return Array.isArray(missions) ? missions : []
}

function getMissionActionType(mission) {
  return normalizeActionType(mission?.actionType ?? mission?.action_type)
}

export const useMissionStore = defineStore('missions', () => {
  const missions = ref([])
  const loading = ref(false)
  const error = ref(null)
  const loadedContext = ref('')
  let pendingRequest = null

  async function loadTodayMissions({ force = false } = {}) {
    const context = `${getUserKey()}:${getDateKey()}`
    if (!force && loadedContext.value === context) return missions.value
    if (pendingRequest) return pendingRequest

    missions.value = []
    loadedContext.value = ''

    const request = (async () => {
      loading.value = true
      error.value = null

      try {
        missions.value = getMissionList(await getTodayMissionsRequest())
        loadedContext.value = context
        return missions.value
      } catch (requestError) {
        error.value = requestError
        throw requestError
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

  function findPendingByActionType(actionType) {
    const normalizedActionType = normalizeActionType(actionType)
    if (!normalizedActionType) return []

    return missions.value.filter(
      (mission) =>
        getMissionActionType(mission) === normalizedActionType && !isMissionCompleted(mission),
    )
  }

  function markCompleted(missionId) {
    const normalizedMissionId = getMissionId(missionId)
    if (!normalizedMissionId) return

    missions.value = missions.value.map((mission) =>
      getMissionId(mission) === normalizedMissionId ? { ...mission, completed: true } : mission,
    )
  }

  async function completeMissionById(missionId) {
    const normalizedMissionId = getMissionId(missionId)
    if (!normalizedMissionId) return null

    const response = await completeMissionRequest(normalizedMissionId)
    markCompleted(normalizedMissionId)
    return response
  }

  async function completeByActionType(actionType) {
    await loadTodayMissions()

    const completedMissions = []
    for (const mission of findPendingByActionType(actionType)) {
      const missionId = getMissionId(mission)
      if (!missionId) continue

      try {
        completedMissions.push(await completeMissionById(missionId))
      } catch (requestError) {
        if (requestError.response?.status === 409) {
          markCompleted(missionId)
        }
      }
    }

    return completedMissions
  }

  function reset() {
    missions.value = []
    loading.value = false
    error.value = null
    loadedContext.value = ''
    pendingRequest = null
  }

  return {
    missions,
    loading,
    error,
    loadTodayMissions,
    findPendingByActionType,
    completeMissionById,
    completeByActionType,
    markCompleted,
    reset,
  }
})
