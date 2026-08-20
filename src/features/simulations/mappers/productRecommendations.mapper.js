const PRODUCT_EMOJIS = {
  '군인공제회 목돈급여': '🏅',
  'CMA 통장': '💛',
  '나라사랑카드 CMA': '🏦',
}

const RATE_TONE_THEMES = {
  NEUTRAL: 'product-card--olive',
  YELLOW: 'product-card--yellow',
  GREEN: 'product-card--green',
}

const RISK_GRADE_LABELS = {
  1: '매우낮음',
  2: '낮음',
  3: '보통',
  4: '높음',
  5: '매우높음',
}

const RISK_LEVEL_LABELS = {
  LOW: '매우낮음',
  MEDIUM: '보통',
  HIGH: '높음',
  VERY_HIGH: '매우높음',
}

const RISK_LEVEL_THEMES = {
  LOW: 'product-card--green',
  MEDIUM: 'product-card--olive',
  HIGH: 'product-card--yellow',
  VERY_HIGH: 'product-card--yellow',
}

function providerFromName(name) {
  return (
    String(name || '')
      .trim()
      .split(/\s+/)[0] || 'ETF'
  )
}

function returnRateOf(item) {
  if (item?.expectedReturnRate != null) return item.expectedReturnRate

  const rates = Array.isArray(item?.returns) ? item.returns : []
  const preferred =
    rates.find((rate) => rate.period === 'ONE_YEAR' && rate.available) ||
    rates.find((rate) => rate.available)

  return preferred?.returnRate ?? null
}

function groupedRecommendations(response) {
  const groups = Array.isArray(response?.groups) ? response.groups : []
  const groupedItems = groups.flatMap((group) =>
    (group.items ?? []).map((item) => ({
      ...item,
      assetBucket: item.assetBucket ?? group.assetBucket,
      riskLevel: item.riskLevel ?? group.riskLevel,
      eligibleForRecommendation:
        group.eligibleForRecommendation !== false && item.eligibleForRecommendation !== false,
    })),
  )
  const itemById = new Map(groupedItems.map((item) => [item.isuCd, item]))
  const personalized = Array.isArray(response?.personalizedRecommendations)
    ? response.personalizedRecommendations
    : []

  if (personalized.length) {
    return personalized.map((recommendation) => {
      const product = itemById.get(recommendation.isuCd) ?? {}

      return {
        ...product,
        ...recommendation,
        classificationReasons: recommendation.reasons ?? product.classificationReasons,
      }
    })
  }

  return groupedItems.filter((item) => item.eligibleForRecommendation)
}

function normalizeRecommendation(item, index) {
  const productName = item?.productName ?? item?.name ?? '추천 상품'
  const expectedReturnRate = returnRateOf(item)
  const riskLabel = RISK_LEVEL_LABELS[item?.riskLevel] ?? RISK_GRADE_LABELS[item?.riskGrade] ?? '-'
  const legacyTags = Array.isArray(item?.tags) ? item.tags.filter(Boolean).slice(0, 2) : []
  const previewTags = legacyTags.length
    ? legacyTags
    : [
        riskLabel === '-' ? '맞춤 추천' : `위험도 ${riskLabel}`,
        expectedReturnRate == null ? 'AI 추천' : `1년 수익률 ${expectedReturnRate}%`,
      ]

  return {
    ...item,
    id: item?.id ?? item?.productId ?? item?.isuCd ?? `${productName}-${index}`,
    productName,
    provider: item?.provider ?? providerFromName(productName),
    expectedReturnRate,
    reason: item?.reason ?? item?.classificationReasons?.[0] ?? '',
    rateLabel: item?.rateLabel ?? '최근 1년',
    badge: item?.badge ?? null,
    minDepositLabel: item?.minDepositLabel ?? '제한없음',
    maxDepositLabel: item?.maxDepositLabel ?? '제한없음',
    emoji: item?.emoji ?? PRODUCT_EMOJIS[productName] ?? '🏦',
    themeClass:
      item?.themeClass ??
      RISK_LEVEL_THEMES[item?.riskLevel] ??
      RATE_TONE_THEMES[item?.rateTone] ??
      (item?.theme ? `product-card--${item.theme}` : 'product-card--olive'),
    rateText: expectedReturnRate == null ? '-' : `${expectedReturnRate}%`,
    riskLabel,
    previewTags,
  }
}

export function mapProductRecommendations(response, { limit = 5 } = {}) {
  const recommendations = Array.isArray(response) ? response : groupedRecommendations(response)

  return recommendations.slice(0, limit).map(normalizeRecommendation)
}
