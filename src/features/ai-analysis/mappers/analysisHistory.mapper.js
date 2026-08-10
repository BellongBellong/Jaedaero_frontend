export const ANALYSIS_RECORD_TYPES = {
  AI_ANALYSIS: 'AI_ANALYSIS',
  WHAT_IF: 'WHAT_IF',
}

const WON_PER_TEN_THOUSAND = 10_000

const AI_ANALYSIS_TITLE = '오늘의 AI 투자 리포트'
const WHAT_IF_TITLE = 'AI 추천 자산 계획'

const WHAT_IF_SUMMARY = '현재 자산 흐름을 기준으로 가장 적합한 계획이에요.'

function toNumber(value, fallback = 0) {
  const number = Number(value)
  return Number.isFinite(number) ? number : fallback
}

function formatWon(value) {
  return `${toNumber(value).toLocaleString('ko-KR')}원`
}

function formatTenThousandWon(value) {
  return `${Math.round(toNumber(value) / WON_PER_TEN_THOUSAND).toLocaleString('ko-KR')}만원`
}

function formatDate(value) {
  return String(value ?? '')
    .slice(0, 10)
    .replace(/-/g, '.')
}

function toPercentLabel(part, total) {
  return `${total ? Math.round((toNumber(part) / total) * 100) : 0}%`
}

/** 전월 대비 증감률(%)을 배지로 만든다. 값이 없으면 배지를 만들지 않는다. */
function toRateChange(rate) {
  const value = toNumber(rate)
  if (!value) return undefined

  return {
    label: `${Math.abs(value)}% ${value > 0 ? '증가' : '감소'}`,
    tone: value > 0 ? 'green' : 'orange',
  }
}

/** 정렬 기준값. 시각이 있으면 시각까지, 없으면 표시용 날짜로 비교한다. */
function orderKey(record) {
  return String(record?.sortKey || record?.date || '')
}

/** 페이지네이션 응답과 배열 응답을 모두 목록으로 받아낸다. */
function unwrapList(response) {
  if (Array.isArray(response)) return response
  return response?.content ?? response?.data ?? []
}

/** AiAnalysisResponse를 분석 기록 카드 모델로 변환한다. */
export function mapAiAnalysisRecord(analysis, appliedAnalysisIds = new Set()) {
  const projectedAsset = toNumber(analysis?.expectedEffect?.strategyProjectedAsset)
  const spendingPattern = analysis?.spendingPattern
  const investmentPattern = analysis?.investmentPattern
  const metrics = []

  // 응답에 없는 지표는 대체값으로 채우지 않고 칸 자체를 그리지 않는다.
  if (spendingPattern?.totalExpenseAmount != null) {
    metrics.push({
      label: '이번 달 소비',
      value: formatWon(spendingPattern.totalExpenseAmount),
      change: toRateChange(spendingPattern.changeRate),
    })
  }

  if (investmentPattern?.totalInvestmentAmount != null) {
    metrics.push({
      label: '투자 자산',
      value: formatWon(investmentPattern.totalInvestmentAmount),
      change: toRateChange(investmentPattern.changeRate),
    })
  }

  return {
    id: `ai-${analysis?.id}`,
    sourceId: analysis?.id,
    type: ANALYSIS_RECORD_TYPES.AI_ANALYSIS,
    title: AI_ANALYSIS_TITLE,
    date: formatDate(analysis?.generatedAt ?? analysis?.createdAt),
    // 같은 날 여러 건이 쌓여도 순서가 유지되도록 시각까지 담은 원본 값을 남긴다.
    sortKey: analysis?.generatedAt ?? analysis?.createdAt ?? '',
    summary: analysis?.summary ?? '',
    applied: appliedAnalysisIds.has(analysis?.id),
    metrics,
    projectedAsset: projectedAsset ? formatTenThousandWon(projectedAsset) : '',
  }
}

/** SimulationResponse를 분석 기록 카드 모델로 변환한다. */
export function mapSimulationRecord(simulation) {
  const saving = toNumber(simulation?.monthlySavingAmount)
  const investment = toNumber(simulation?.monthlyInvestmentAmount)
  const spending = toNumber(simulation?.monthlySpendingAmount)
  const total = saving + investment + spending

  return {
    id: `sim-${simulation?.id}`,
    sourceId: simulation?.id,
    type: ANALYSIS_RECORD_TYPES.WHAT_IF,
    title: WHAT_IF_TITLE,
    date: formatDate(simulation?.createdAt),
    sortKey: simulation?.createdAt ?? '',
    summary: WHAT_IF_SUMMARY,
    allocationRatios: [
      { label: toPercentLabel(saving, total), tone: 'green' },
      { label: toPercentLabel(investment, total), tone: 'olive' },
      { label: toPercentLabel(spending, total), tone: 'orange' },
    ],
    projectedAsset: formatTenThousandWon(simulation?.projectedAssetAtDischarge),
  }
}

/**
 * 종류별로 오래된 기록부터 1번을 매겨 제목 뒤에 붙인다.
 * 가장 최근 기록이 가장 큰 번호를 갖는다.
 */
function withSequenceTitles(records) {
  const sequences = new Map()

  return [...records]
    .sort((first, second) => orderKey(first).localeCompare(orderKey(second)))
    .map((record) => {
      const sequence = (sequences.get(record.type) ?? 0) + 1
      sequences.set(record.type, sequence)

      return { ...record, sequence, title: `${record.title}${sequence}` }
    })
}

/** AI 분석 목록과 시뮬레이션 목록을 하나의 기록 목록으로 합친다. */
export function mapAnalysisHistoryRecords({ analyses, simulations, applications } = {}) {
  const appliedAnalysisIds = new Set(
    unwrapList(applications)
      .map((application) => application?.analysisId)
      .filter((analysisId) => analysisId !== undefined && analysisId !== null),
  )

  return withSequenceTitles([
    ...unwrapList(analyses).map((analysis) => mapAiAnalysisRecord(analysis, appliedAnalysisIds)),
    ...unwrapList(simulations).map((simulation) => mapSimulationRecord(simulation)),
  ])
}

/** 최근 기록이 앞에 오도록 정렬한다. */
export function sortAnalysisRecords(records) {
  return [...records].sort((first, second) => orderKey(second).localeCompare(orderKey(first)))
}
