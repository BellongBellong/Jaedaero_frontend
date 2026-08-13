const PROVIDERS = {
  GOOGLE: {
    authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
    clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID,
    scope: 'openid',
  },
  KAKAO: {
    authorizationEndpoint: 'https://kauth.kakao.com/oauth/authorize',
    clientId: import.meta.env.VITE_KAKAO_CLIENT_ID,
  },
}

const STATE_STORAGE_KEY = 'social-login-state'
const REDIRECT_STORAGE_KEY = 'social-login-redirect'

function createState() {
  const bytes = new Uint8Array(24)
  crypto.getRandomValues(bytes)
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('')
}

export function getRedirectUri(provider) {
  return `${window.location.origin}/auth/callback/${provider.toLowerCase()}`
}

export function rememberLoginRedirect(value) {
  const redirect =
    typeof value === 'string' && value.startsWith('/') && !value.startsWith('//') ? value : '/home'
  sessionStorage.setItem(REDIRECT_STORAGE_KEY, redirect)
}

export function consumeLoginRedirect() {
  const redirect = sessionStorage.getItem(REDIRECT_STORAGE_KEY)
  sessionStorage.removeItem(REDIRECT_STORAGE_KEY)
  return redirect && redirect.startsWith('/') && !redirect.startsWith('//') ? redirect : '/home'
}

export function startSocialLogin(provider) {
  const config = PROVIDERS[provider]
  if (!config?.clientId) {
    throw new Error(`${provider} client ID is not configured.`)
  }

  const state = createState()
  sessionStorage.setItem(STATE_STORAGE_KEY, state)

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: config.clientId,
    redirect_uri: getRedirectUri(provider),
    state,
  })

  if (config.scope) {
    params.set('scope', config.scope)
  }

  if (provider === 'GOOGLE') {
    params.set('prompt', 'select_account')
  }

  window.location.assign(`${config.authorizationEndpoint}?${params.toString()}`)
}

export function validateSocialLoginCallback(provider, query) {
  if (!PROVIDERS[provider]) {
    throw new Error('Unsupported social login provider.')
  }

  const expectedState = sessionStorage.getItem(STATE_STORAGE_KEY)
  sessionStorage.removeItem(STATE_STORAGE_KEY)

  if (!expectedState || query.state !== expectedState) {
    throw new Error('Invalid social login request.')
  }

  if (query.error) {
    throw new Error(query.error_description || 'Social login was cancelled.')
  }

  if (typeof query.code !== 'string' || !query.code) {
    throw new Error('Authorization code is missing.')
  }

  return query.code
}
