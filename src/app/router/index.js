import { createRouter, createWebHistory } from 'vue-router'

import authRoutes from '@/features/auth/routes'
import onboardingRoutes from '@/features/onboarding/routes'
import mainRoutes from './main'

import { registerRouterGuards } from './guards'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [...authRoutes, ...onboardingRoutes, ...mainRoutes],
  scrollBehavior() {
    return { left: 0, top: 0 }
  },
})

registerRouterGuards(router)

export default router
