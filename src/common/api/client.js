import axios from 'axios'

import { clearAuthSession, readAuthSession, updateAuthTokens } from '@/common/auth/auth.storage'

const baseURL = import.meta.env.VITE_API_BASE_URL || '/api/v1'

const apiClient = axios.create({
  baseURL,
  timeout: 10_000,
  headers: {
    'Content-Type': 'application/json',
  },
})

const refreshClient = axios.create({
  baseURL,
  timeout: 10_000,
  headers: {
    'Content-Type': 'application/json',
  },
})

let refreshPromise = null

function isAuthRequest(url) {
  return url?.includes('/auth/login') || url?.includes('/auth/refresh')
}

function redirectToLogin() {
  if (typeof window === 'undefined') {
    return
  }

  const redirect = encodeURIComponent(`${window.location.pathname}${window.location.search}`)
  window.location.replace(`/login?redirect=${redirect}`)
}

apiClient.interceptors.request.use((config) => {
  const token = readAuthSession().accessToken
  const authRequest = isAuthRequest(config.url)

  if (token && !authRequest) {
    config.headers.Authorization = `Bearer ${token}`
  } else if (authRequest && config.headers?.Authorization) {
    delete config.headers.Authorization
  }

  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    const refreshToken = readAuthSession().refreshToken
    const authRequest = isAuthRequest(originalRequest?.url)

    if (
      error.response?.status === 401 &&
      refreshToken &&
      originalRequest &&
      !originalRequest._retry &&
      !authRequest
    ) {
      if (!refreshPromise) {
        refreshPromise = refreshClient
          .post('/auth/refresh', { refreshToken })
          .then(({ data }) => {
            updateAuthTokens(data)
            return data
          })
          .catch((refreshError) => {
            clearAuthSession()
            redirectToLogin()
            throw refreshError
          })
          .finally(() => {
            refreshPromise = null
          })
      }

      try {
        const data = await refreshPromise

        originalRequest._retry = true
        originalRequest.headers = originalRequest.headers || {}
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`

        return apiClient(originalRequest)
      } catch (refreshError) {
        return Promise.reject(refreshError)
      }
    } else if (error.response?.status === 401 && !authRequest) {
      clearAuthSession()
      redirectToLogin()
    }

    return Promise.reject(error)
  },
)

export default apiClient
