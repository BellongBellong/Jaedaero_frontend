const INDICATOR_META = {
  KOSPI: { label: '코스피', valueSuffix: '' },
  KOSDAQ: { label: '코스닥', valueSuffix: '' },
  US_TREASURY_10Y: { label: '미국채 10년', valueSuffix: '%' },
  USD_KRW: { label: '원/달러', valueSuffix: '원' },
}

function toParts(value) {
  if (Array.isArray(value)) return value

  if (typeof value !== 'string') return []

  const matched = value.match(
    /^(\d{4})-(\d{1,2})-(\d{1,2})(?:[T\s](\d{1,2})(?::\d{2}(?::\d{2})?)?)?/,
  )
  if (!matched) return []

  return matched.slice(1).map((part) => (part === undefined ? undefined : Number(part)))
}

function formatNumber(value, maximumFractionDigits = 2) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return '-'

  return new Intl.NumberFormat('ko-KR', {
    maximumFractionDigits,
  }).format(Number(value))
}

function formatDate(parts, withTime = false) {
  const [year, month, day, hour] = toParts(parts)
  if (!year || !month || !day) return ''

  const date = `${year}. ${String(month).padStart(2, '0')}. ${String(day).padStart(2, '0')}`
  return withTime && hour !== undefined ? `${date} ${hour}시 기준` : date
}

export function formatReportDate(report) {
  return formatDate(report?.validFrom || report?.reportDate, true)
}

export function formatValidUntil(report) {
  const [year, month, day, hour] = toParts(report?.validUntil)
  if (!year || !month || !day) return ''
  return `${month}월 ${day}일 ${hour ?? 0}시까지 볼 수 있어요.`
}

function formatChange(indicator) {
  if (indicator?.change === null || indicator?.change === undefined) {
    return '등락 정보 없음'
  }

  const change = Number(indicator.change)
  const rate = Number(indicator.changeRate)
  const arrow = change >= 0 ? '▲' : '▼'
  const changeValue = formatNumber(
    Math.abs(change),
    indicator.indicatorType === 'US_TREASURY_10Y' ? 2 : 2,
  )
  const changeUnit = indicator.indicatorType === 'US_TREASURY_10Y' ? '%p' : ''
  const rateValue = formatNumber(Math.abs(rate), 2)

  return `${arrow} ${changeValue}${changeUnit} · ${rateValue}%`
}

export function mapMarketIndicators(indicators = [], fallback = []) {
  const rows = indicators
    .map((indicator) => {
      const meta = INDICATOR_META[indicator?.indicatorType]
      if (!meta) return null

      const isRate = indicator.indicatorType === 'US_TREASURY_10Y'
      const value = `${formatNumber(indicator.observedValue, isRate ? 3 : 2)}${meta.valueSuffix}`
      const isNegative = Number(indicator.change) < 0

      return {
        label: meta.label,
        value,
        change: formatChange(indicator),
        tone: indicator.change === null ? 'neutral' : isNegative ? 'negative' : 'positive',
      }
    })
    .filter(Boolean)

  return rows.length ? rows : fallback
}

export function mapMarketSources(sources = [], fallback = []) {
  const rows = sources
    .filter((source) => source?.title && source?.url)
    .map((source) => ({ title: source.title, url: source.url }))

  return rows.length ? rows : fallback
}
