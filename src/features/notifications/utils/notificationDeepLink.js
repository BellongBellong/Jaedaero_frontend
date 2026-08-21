const DEEP_LINK_MAPPINGS = [
  { pattern: /^\/missions\/today\/?$/, replacement: '/challenge?tab=missions' },
  { pattern: /^\/challenges\/ranking\/?$/, replacement: '/challenge?tab=ranking' },
  { pattern: /^\/market-reports\/today\/?$/, replacement: '/ai-financial-report' },
  {
    pattern: /^\/investment-guidance\/(\d+)\/?$/,
    replacement: '/investment-guide/detail/$1',
  },
]

export function normalizeNotificationDeepLink(deepLink) {
  if (!deepLink || typeof deepLink !== 'string') return '/notifications'

  let url
  try {
    url = new URL(deepLink, globalThis.location?.origin || 'https://jaedaero.local')
  } catch {
    return '/notifications'
  }

  const source = `${url.pathname}${url.search}${url.hash}`

  for (const mapping of DEEP_LINK_MAPPINGS) {
    if (mapping.pattern.test(url.pathname)) {
      return url.pathname.replace(mapping.pattern, mapping.replacement)
    }
  }

  return source.startsWith('/') ? source : '/notifications'
}
