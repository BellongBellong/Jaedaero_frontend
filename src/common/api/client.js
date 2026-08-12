import axios from 'axios'

const baseURL = import.meta.env.VITE_API_BASE_URL || '/api/v1'

const apiClient = axios.create({
  baseURL,
  timeout: 10_000,
  headers: {
    'Content-Type': 'application/json',
  },
})

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken')

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    const refreshToken = localStorage.getItem('refreshToken')
    const isAuthRequest =
      originalRequest?.url?.includes('/auth/login') ||
      originalRequest?.url?.includes('/auth/refresh')

    if (
      error.response?.status === 401 &&
      refreshToken &&
      originalRequest &&
      !originalRequest._retry &&
      !isAuthRequest
    ) {
      originalRequest._retry = true

      try {
        const { data } = await axios.post(`${baseURL}/auth/refresh`, { refreshToken })

        localStorage.setItem('accessToken', data.accessToken)
        if (data.refreshToken) localStorage.setItem('refreshToken', data.refreshToken)

        originalRequest.headers = originalRequest.headers || {}
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`

        return apiClient(originalRequest)
      } catch {
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('userId')

        const redirect = encodeURIComponent(`${window.location.pathname}${window.location.search}`)
        window.location.replace(`/login?redirect=${redirect}`)
      }
    } else if (error.response?.status === 401 && !isAuthRequest) {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('userId')

      const redirect = encodeURIComponent(`${window.location.pathname}${window.location.search}`)
      window.location.replace(`/login?redirect=${redirect}`)
    }

    return Promise.reject(error)
  },
)

export default apiClient
