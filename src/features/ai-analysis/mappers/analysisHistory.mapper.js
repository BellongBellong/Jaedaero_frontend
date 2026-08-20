import { formatDate, formatTenThousandWon, formatWon, toNumber, toPercent } from './format.js'

export const ANALYSIS_RECORD_TYPES = {
  AI_ANALYSIS: 'AI_ANALYSIS',
  WHAT_IF: 'WHAT_IF',
}

export const AI_ANALYSIS_TITLE = '오늘의 AI 소비 분석'
export const WHAT_IF_TITLE = 'AI 추천 자산 계획'

const WHAT_IF_SUMMARY = '현재 자산 흐름을 기준으로 가장 적합한 계획이에요.'

function toPercentLabel(part, total) {
  return `${toPercent(part, total)}%`
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
  return response?.simulations ?? response?.content ?? response?.data ?? []
}

function toConsumerFacingAiTitle(title) {
  if (!title) return AI_ANALYSIS_TITLE

  return title.replace('AI 금융 분석', 'AI 소비 분석').replace('AI 투자 리포트', 'AI 소비 분석')
}

/** 통합 분석 이력 API의 단일 항목을 카드 모델로 변환한다. */
export function mapAnalysisHistoryItem(item) {
  const type =
    item?.historyType === 'WHAT_IF'
      ? ANALYSIS_RECORD_TYPES.WHAT_IF
      : ANALYSIS_RECORD_TYPES.AI_ANALYSIS
  const metrics = []

  if (type === ANALYSIS_RECORD_TYPES.AI_ANALYSIS && item?.spendingAmount != null) {
    metrics.push({
      label: '이번 달 소비',
      value: formatWon(item.spendingAmount),
      change: toRateChange(item.spendingChangeRate),
    })
  }

  if (type === ANALYSIS_RECORD_TYPES.AI_ANALYSIS && item?.expectedAssetIncreaseAmount != null) {
    metrics.push({
      label: '예상 자산 증가',
      value: formatWon(item.expectedAssetIncreaseAmount),
    })
  }

  return {
    id: `${type === ANALYSIS_RECORD_TYPES.WHAT_IF ? 'sim' : 'ai'}-${item?.sourceId}`,
    sourceId: item?.sourceId,
    type,
    title:
      type === ANALYSIS_RECORD_TYPES.WHAT_IF
        ? item?.title || WHAT_IF_TITLE
        : toConsumerFacingAiTitle(item?.title),
    date: formatDate(item?.createdAt),
    sortKey: item?.createdAt ?? '',
    summary: item?.summary ?? '',
    applied: Boolean(item?.isApplied),
    metrics,
    allocationRatios: type === ANALYSIS_RECORD_TYPES.WHAT_IF ? toAllocationRatios(item) : undefined,
    projectedAsset: item?.expectedAsset == null ? '' : formatTenThousandWon(item.expectedAsset),
    generationSource: item?.generationSource,
  }
}

/** AnalysisHistoryPageResponse를 목록과 서버 집계 요약으로 변환한다. */
export function mapAnalysisHistoryPage(response) {
  const histories = Array.isArray(response?.histories) ? response.histories : []

  return {
    records: sortAnalysisRecords(histories.map(mapAnalysisHistoryItem)),
    totalCount: toNumber(response?.totalCount),
    hasNext: Boolean(response?.hasNext),
    latestDate: formatDate(response?.latestAnalyzedAt),
    latestProjectedAsset:
      response?.latestExpectedAsset == null
        ? ''
        : formatTenThousandWon(response.latestExpectedAsset),
  }
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

/**
 * 저축/투자/소비 비율을 만든다.
 * 시뮬레이션 화면은 항목마다 기준 금액이 달라(저축은 군적금, 나머지는 월급) 금액에서 역산할 수 없다.
 * 그래서 사용자가 설정한 비율이 응답에 있으면 그 값을 그대로 쓰고,
 * 없는 과거 기록만 세 항목 합 대비 비중으로 근사한다.
 */
function toAllocationRatios(simulation) {
  const saving = toNumber(simulation?.monthlySavingAmount)
  const investment = toNumber(simulation?.monthlyInvestmentAmount)
  const spending = toNumber(simulation?.monthlySpendingAmount)
  const total = saving + investment + spending

  const hasRates = [
    simulation?.savingRate,
    simulation?.investmentRate,
    simulation?.spendingRate,
  ].every((rate) => rate !== undefined && rate !== null)

  if (hasRates) {
    return [
      { label: `${Math.round(toNumber(simulation.savingRate))}%`, tone: 'green' },
      { label: `${Math.round(toNumber(simulation.investmentRate))}%`, tone: 'olive' },
      { label: `${Math.round(toNumber(simulation.spendingRate))}%`, tone: 'orange' },
    ]
  }

  return [
    { label: toPercentLabel(saving, total), tone: 'green' },
    { label: toPercentLabel(investment, total), tone: 'olive' },
    { label: toPercentLabel(spending, total), tone: 'orange' },
  ]
}

/** SimulationResponse를 분석 기록 카드 모델로 변환한다. */
export function mapSimulationRecord(simulation) {
  const simulationId = simulation?.simulationId ?? simulation?.id
  const createdAt = simulation?.createdAt

  return {
    id: `sim-${simulationId}`,
    sourceId: simulationId,
    type: ANALYSIS_RECORD_TYPES.WHAT_IF,
    title: WHAT_IF_TITLE,
    // SimulationResponse에는 생성일이 없으므로 없는 날짜를 만들어내지 않는다.
    date: createdAt ? formatDate(createdAt) : '',
    // 저장 이력은 최신순이며 ID는 단조 증가하므로 생성일 부재 시 ID로 순서를 보존한다.
    sortKey: createdAt ?? String(simulationId ?? '').padStart(16, '0'),
    summary: WHAT_IF_SUMMARY,
    allocationRatios: toAllocationRatios(simulation),
    projectedAsset: formatTenThousandWon(
      simulation?.expectedAsset ?? simulation?.projectedAssetAtDischarge,
    ),
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

/** AI 소비 분석 목록과 시뮬레이션 목록을 하나의 기록 목록으로 합친다. */
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

/** 적용 중인 AI 소비 분석을 먼저 두고, 같은 우선순위에서는 최근 기록을 앞에 둔다. */
export function sortAnalysisRecords(records) {
  return [...records].sort((first, second) => {
    const firstIsAppliedAi =
      first.type === ANALYSIS_RECORD_TYPES.AI_ANALYSIS && Boolean(first.applied)
    const secondIsAppliedAi =
      second.type === ANALYSIS_RECORD_TYPES.AI_ANALYSIS && Boolean(second.applied)
    const appliedOrder = Number(secondIsAppliedAi) - Number(firstIsAppliedAi)

    if (appliedOrder) return appliedOrder
    return orderKey(second).localeCompare(orderKey(first))
  })
}
