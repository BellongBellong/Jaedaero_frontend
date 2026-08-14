import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

import * as authApi from '@/features/auth/api/auth.api'
import {
  AUTH_SESSION_CLEARED_EVENT,
  AUTH_SESSION_UPDATED_EVENT,
  clearAuthSession,
  readAuthSession,
  saveAuthSession,
  updateAuthTokens,
} from '@/common/auth/auth.storage'

const ACCESS_TOKEN_REFRESH_THRESHOLD_MS = 30_000

export const useAuthStore = defineStore('auth', () => {
  const accessToken = ref(null)
  const refreshToken = ref(null)
  const expiresIn = ref(0)
  const accessTokenExpiresAt = ref(0)
  const user = ref(null)
  const initialized = ref(false)
  const loading = ref(false)

  const isAuthenticated = computed(() => Boolean(accessToken.value))
  const isOnboardingCompleted = computed(() => Boolean(user.value?.onboardingCompleted))

  function applySession(session) {
    accessToken.value = session.accessToken
    refreshToken.value = session.refreshToken
    expiresIn.value = session.expiresIn
    accessTokenExpiresAt.value = session.accessTokenExpiresAt
    user.value = session.user
  }

  function hydrate() {
    const session = readAuthSession()
    applySession(session)
    return session
  }

  function saveSession(response) {
    const tokenLifetime = Number(response?.expiresIn) || 0
    const session = saveAuthSession({
      accessToken: response?.accessToken,
      refreshToken: response?.refreshToken,
      expiresIn: tokenLifetime,
      accessTokenExpiresAt: tokenLifetime ? Date.now() + tokenLifetime * 1000 : 0,
      user: response?.user || null,
    })

    applySession(session)
    return session
  }

  function saveTokenResponse(response) {
    const session = updateAuthTokens(response)
    applySession(session)
    return session
  }

  function clearSession() {
    clearAuthSession()
    applySession({
      accessToken: null,
      refreshToken: null,
      expiresIn: 0,
      accessTokenExpiresAt: 0,
      user: null,
    })
  }

  function markOnboardingCompleted() {
    if (!accessToken.value || !user.value) {
      return
    }

    const currentSession = readAuthSession()
    const updatedUser = { ...user.value, onboardingCompleted: true }
    const session = saveAuthSession({ ...currentSession, user: updatedUser })

    applySession(session)
  }

  async function login(payload) {
    loading.value = true

    try {
      const response = await authApi.login(payload)
      saveSession(response)
      return response
    } finally {
      loading.value = false
    }
  }

  async function refreshAccessToken() {
    hydrate()

    if (!refreshToken.value) {
      clearSession()
      return false
    }

    try {
      const response = await authApi.refreshToken({ refreshToken: refreshToken.value })
      saveTokenResponse(response)
      return true
    } catch {
      clearSession()
      return false
    }
  }

  async function restoreSession() {
    if (initialized.value) {
      return isAuthenticated.value
    }

    loading.value = true
    hydrate()

    try {
      if (!refreshToken.value) {
        if (accessTokenExpiresAt.value && accessTokenExpiresAt.value <= Date.now()) {
          clearSession()
        }

        return isAuthenticated.value
      }

      const accessTokenIsValid =
        accessToken.value &&
        accessTokenExpiresAt.value > Date.now() + ACCESS_TOKEN_REFRESH_THRESHOLD_MS

      if (accessTokenIsValid) {
        return true
      }

      return await refreshAccessToken()
    } finally {
      initialized.value = true
      loading.value = false
    }
  }

  async function logout() {
    try {
      if (accessToken.value) {
        await authApi.logout()
      }
    } finally {
      clearSession()
    }
  }

  function handleSessionUpdated(event) {
    if (event.detail) {
      applySession(event.detail)
    }
  }

  function handleSessionCleared() {
    applySession({
      accessToken: null,
      refreshToken: null,
      expiresIn: 0,
      accessTokenExpiresAt: 0,
      user: null,
    })
  }

  if (typeof window !== 'undefined') {
    window.addEventListener(AUTH_SESSION_UPDATED_EVENT, handleSessionUpdated)
    window.addEventListener(AUTH_SESSION_CLEARED_EVENT, handleSessionCleared)
  }

  return {
    accessToken,
    refreshToken,
    expiresIn,
    accessTokenExpiresAt,
    user,
    initialized,
    loading,
    isAuthenticated,
    isOnboardingCompleted,
    hydrate,
    saveSession,
    saveTokenResponse,
    clearSession,
    markOnboardingCompleted,
    login,
    refreshAccessToken,
    restoreSession,
    logout,
  }
})
