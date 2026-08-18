const CATEGORY_ALIASES = {
  CARD: '카드',
  CARD_BENEFIT: '카드',
  CREDIT_CARD: '카드',
  TRANSPORT: '교통',
  TRANSPORTATION: '교통',
  LEISURE: '여가',
  CULTURE: '여가',
  ACCOMMODATION: '숙박',
  LODGING: '숙박',
  HOTEL: '숙박',
  SELF_DEVELOPMENT: '자기계발',
  EDUCATION: '자기계발',
  ETC: '기타',
  OTHER: '기타',
}

export function normalizeBenefitCategory(category) {
  const value = String(category || '기타').trim()
  return CATEGORY_ALIASES[value.toUpperCase()] || value
}

export function normalizeBenefits(response) {
  const payload = response?.data ?? response
  const benefits = Array.isArray(payload)
    ? payload
    : payload?.benefits || payload?.content || payload?.items || []

  return benefits.map((benefit, index) => ({
    ...benefit,
    id: benefit.id ?? benefit.benefitId ?? index,
    category: normalizeBenefitCategory(benefit.category || benefit.benefitCategory),
    title: benefit.title || benefit.brandName || benefit.providerName || '군인 혜택',
    discountSummary:
      benefit.discountSummary ||
      benefit.summary ||
      benefit.description ||
      benefit.benefitContent ||
      '-',
    validFrom: benefit.validFrom || benefit.startDate || '',
    validTo: benefit.validTo || benefit.endDate || '',
    target: benefit.target || benefit.eligibility || benefit.rank || '-',
    content:
      benefit.content ||
      benefit.benefitContent ||
      benefit.discountSummary ||
      benefit.description ||
      '-',
    method: benefit.method || benefit.usageMethod || benefit.requiredProof || '-',
    precautions: benefit.precautions || benefit.notice || benefit.notes || '-',
  }))
}

function hashText(value) {
  return [...value].reduce((hash, character) => (hash * 31 + character.charCodeAt(0)) >>> 0, 7)
}

export function getBenefitDayKey(date = new Date()) {
  const shiftedDate = new Date(date.getTime() - 6 * 60 * 60 * 1000)
  return `${shiftedDate.getFullYear()}-${shiftedDate.getMonth() + 1}-${shiftedDate.getDate()}`
}

export function selectDailyBenefits(benefits, limit = 4, date = new Date()) {
  const dayKey = getBenefitDayKey(date)

  return [...benefits]
    .map((benefit) => ({ benefit, order: hashText(`${dayKey}:${benefit.id}`) }))
    .sort((first, second) => first.order - second.order)
    .slice(0, limit)
    .map(({ benefit }) => benefit)
}
