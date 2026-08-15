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

    if (error.response?.status !== 401 || authRequest) {
      return Promise.reject(error)
    }

    /*
      재발급 후 재시도한 요청이 다시 401이면 세션 만료가 아니라 해당 리소스의 접근 권한 문제다.
      이때 세션을 지우면 화면 하나의 권한 오류로 사용자가 통째로 로그아웃된다.
      세션은 유지하고 호출한 화면이 오류를 처리하도록 그대로 넘긴다.
    */
    if (originalRequest?._retry) {
      return Promise.reject(error)
    }

    if (refreshToken && originalRequest) {
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
    } else {
      // 재발급에 쓸 리프레시 토큰이 없으면 실제로 로그인이 필요한 상태다.
      clearAuthSession()
      redirectToLogin()
    }

    return Promise.reject(error)
  },
)

export default apiClient
