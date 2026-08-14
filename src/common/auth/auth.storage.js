const AUTH_SESSION_KEY = 'auth.session'
const ACCESS_TOKEN_KEY = 'accessToken'
const REFRESH_TOKEN_KEY = 'refreshToken'
const USER_ID_KEY = 'userId'
const AUTH_SESSION_UPDATED_EVENT = 'jaedaero:auth-session-updated'
const AUTH_SESSION_CLEARED_EVENT = 'jaedaero:auth-session-cleared'

function dispatchAuthEvent(name, detail) {
  if (
    typeof window === 'undefined' ||
    typeof window.dispatchEvent !== 'function' ||
    typeof CustomEvent === 'undefined'
  ) {
    return
  }

  window.dispatchEvent(new CustomEvent(name, { detail }))
}

function getStorage() {
  if (typeof window === 'undefined') {
    return null
  }

  try {
    return window.localStorage
  } catch {
    return null
  }
}

function getItem(key) {
  const storage = getStorage()

  if (!storage) {
    return null
  }

  try {
    return storage.getItem(key)
  } catch {
    return null
  }
}

function setItem(key, value) {
  const storage = getStorage()

  if (!storage) {
    return
  }

  try {
    storage.setItem(key, value)
  } catch {
    // 로컬스토리지를 사용할 수 없는 브라우저에서는 메모리 상태만 유지합니다.
  }
}

function removeItem(key) {
  const storage = getStorage()

  if (!storage) {
    return
  }

  try {
    storage.removeItem(key)
  } catch {
    // 로컬스토리지를 사용할 수 없는 브라우저에서는 삭제를 건너뜁니다.
  }
}

function parseSession() {
  const rawSession = getItem(AUTH_SESSION_KEY)

  if (!rawSession) {
    return null
  }

  try {
    const session = JSON.parse(rawSession)
    return session && typeof session === 'object' ? session : null
  } catch {
    removeItem(AUTH_SESSION_KEY)
    return null
  }
}

export function readAuthSession() {
  const session = parseSession() || {}

  return {
    accessToken: session.accessToken || getItem(ACCESS_TOKEN_KEY),
    refreshToken: session.refreshToken || getItem(REFRESH_TOKEN_KEY),
    expiresIn: Number(session.expiresIn) || 0,
    accessTokenExpiresAt: Number(session.accessTokenExpiresAt) || 0,
    user: session.user || null,
  }
}

export function saveAuthSession(session) {
  const normalizedSession = {
    accessToken: session.accessToken || null,
    refreshToken: session.refreshToken || null,
    expiresIn: Number(session.expiresIn) || 0,
    accessTokenExpiresAt: Number(session.accessTokenExpiresAt) || 0,
    user: session.user || null,
  }

  setItem(AUTH_SESSION_KEY, JSON.stringify(normalizedSession))

  if (normalizedSession.accessToken) {
    setItem(ACCESS_TOKEN_KEY, normalizedSession.accessToken)
  } else {
    removeItem(ACCESS_TOKEN_KEY)
  }

  if (normalizedSession.refreshToken) {
    setItem(REFRESH_TOKEN_KEY, normalizedSession.refreshToken)
  } else {
    removeItem(REFRESH_TOKEN_KEY)
  }

  if (normalizedSession.user?.userId) {
    setItem(USER_ID_KEY, String(normalizedSession.user.userId))
  } else {
    removeItem(USER_ID_KEY)
  }

  dispatchAuthEvent(AUTH_SESSION_UPDATED_EVENT, normalizedSession)

  return normalizedSession
}

export function updateAuthTokens(tokenResponse) {
  const currentSession = readAuthSession()
  const expiresIn = Number(tokenResponse?.expiresIn) || currentSession.expiresIn

  return saveAuthSession({
    ...currentSession,
    accessToken: tokenResponse?.accessToken || currentSession.accessToken,
    refreshToken: tokenResponse?.refreshToken || currentSession.refreshToken,
    expiresIn,
    accessTokenExpiresAt: expiresIn
      ? Date.now() + expiresIn * 1000
      : currentSession.accessTokenExpiresAt,
  })
}

export function clearAuthSession() {
  removeItem(AUTH_SESSION_KEY)
  removeItem(ACCESS_TOKEN_KEY)
  removeItem(REFRESH_TOKEN_KEY)
  removeItem(USER_ID_KEY)
  dispatchAuthEvent(AUTH_SESSION_CLEARED_EVENT)
}

export { AUTH_SESSION_CLEARED_EVENT, AUTH_SESSION_UPDATED_EVENT }
