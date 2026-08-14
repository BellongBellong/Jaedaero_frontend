import { ref } from 'vue'

import {
  ANALYSIS_RECORD_TYPES,
  mapAnalysisHistoryRecords,
} from '@/features/ai-analysis/mappers/analysisHistory.mapper'
import { mapWhatIfDetail } from '@/features/ai-analysis/mappers/whatIfDetail.mapper'
import { whatIfDetailMock } from '@/features/ai-analysis/mocks/whatIfDetail.mock'
import { getMyPageProfile } from '@/features/my-page/api/myPage.api'
import { getSimulation, getSimulations } from '@/features/simulations/api/simulations.api'

/** What-if 화면이 마지막으로 저장한 시나리오를 남겨두는 저장소 키. */
const SAVED_SIMULATION_KEY = 'jaedaero-latest-simulation'

function savedSimulationId() {
  try {
    return JSON.parse(sessionStorage.getItem(SAVED_SIMULATION_KEY) || '{}')?.simulationId ?? null
  } catch {
    return null
  }
}

function valueOf(result) {
  return result.status === 'fulfilled' ? result.value : null
}

/** 목록과 같은 번호가 붙은 제목을 찾는다. 목록 조회에 실패하면 번호 없이 표시한다. */
function titleFromList(simulations, simulationId) {
  if (!simulations) return ''

  return (
    mapAnalysisHistoryRecords({ simulations }).find(
      (record) =>
        record.type === ANALYSIS_RECORD_TYPES.WHAT_IF &&
        String(record.sourceId) === String(simulationId),
    )?.title || ''
  )
}

export function useWhatIfDetail(simulationId) {
  const detail = ref(null)
  const loading = ref(false)
  const error = ref(null)
  const source = ref('api')

  async function load() {
    loading.value = true
    error.value = null

    const [simulation, simulations, profile] = await Promise.allSettled([
      getSimulation(simulationId),
      getSimulations(),
      getMyPageProfile(),
    ])

    if (simulation.status === 'rejected') {
      error.value = simulation.reason
      detail.value = whatIfDetailMock
      source.value = 'mock-fallback'
      loading.value = false
      return
    }

    const me = valueOf(profile)
    detail.value = mapWhatIfDetail(simulation.value, {
      monthlySalary: me?.monthlySalary ?? me?.soldierProfile?.monthlySalary,
      saved: String(savedSimulationId()) === String(simulationId),
      title: titleFromList(valueOf(simulations), simulationId),
    })
    error.value = simulations.reason ?? profile.reason ?? null
    source.value = error.value ? 'api-partial' : 'api'
    loading.value = false
  }

  load()

  return { detail, loading, error, source, reload: load }
}
