const WON_PER_TEN_THOUSAND = 10_000

export function toNumber(value, fallback = 0) {
  const number = Number(value)
  return Number.isFinite(number) ? number : fallback
}

/** 1234567 → "1,234,567원" */
export function formatWon(value) {
  return `${toNumber(value).toLocaleString('ko-KR')}원`
}

/** 19900000 → "1,990만원" */
export function formatTenThousandWon(value) {
  return `${Math.round(toNumber(value) / WON_PER_TEN_THOUSAND).toLocaleString('ko-KR')}만원`
}

/** "2026-08-10T06:40:22.952Z" → "2026.08.10" */
export function formatDate(value) {
  return String(value ?? '')
    .slice(0, 10)
    .replace(/-/g, '.')
}

/** 부분/전체 → "31%". 전체가 0이면 0%. */
export function toPercent(part, total) {
  return total ? Math.round((toNumber(part) / toNumber(total)) * 100) : 0
}
