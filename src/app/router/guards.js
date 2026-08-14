import { useAuthStore } from '@/features/auth/stores/auth.store'

export function registerRouterGuards(router) {
  router.beforeEach(async (to) => {
    const authStore = useAuthStore()
    await authStore.restoreSession()

    if (to.meta.requiresAuth && !authStore.isAuthenticated) {
      return {
        name: 'social-login',
        query: { redirect: to.fullPath },
      }
    }

    if (to.name === 'social-login' && authStore.isAuthenticated) {
      return {
        name: authStore.isOnboardingCompleted ? 'dashboard' : 'terms',
      }
    }

    return true
  })
}
