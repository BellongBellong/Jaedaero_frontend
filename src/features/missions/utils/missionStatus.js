const COMPLETED_STATUSES = new Set(['COMPLETED', 'DONE', 'ACHIEVED', 'SUCCESS'])

function isCompletedFlag(value) {
  if (typeof value === 'string') {
    return ['TRUE', 'Y', 'YES', 'COMPLETED', 'DONE', 'ACHIEVED'].includes(
      value.trim().toUpperCase(),
    )
  }

  return value === true || value === 1
}

export function isMissionCompleted(mission) {
  if (!mission) return false

  const status = String(
    mission.status || mission.missionStatus || mission.completionStatus || '',
  ).toUpperCase()

  return (
    isCompletedFlag(mission.completed) ||
    isCompletedFlag(mission.isCompleted) ||
    isCompletedFlag(mission.complete) ||
    isCompletedFlag(mission.isComplete) ||
    isCompletedFlag(mission.missionCompleted) ||
    isCompletedFlag(mission.done) ||
    Boolean(mission.completedAt) ||
    COMPLETED_STATUSES.has(status)
  )
}
