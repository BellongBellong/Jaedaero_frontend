import { createRouter, createWebHistory } from 'vue-router'

import accountRoutes from '@/features/accounts/routes'
import aiCoachRoutes from '@/features/ai-coach/routes'
import authRoutes from '@/features/auth/routes'
import cashflowRoutes from '@/features/cashflow/routes'
import cohortRoutes from '@/features/cohort/routes'
import dashboardRoutes from '@/features/dashboard/routes'
import eventRoutes from '@/features/events/routes'
import missionRoutes from '@/features/missions/routes'
import myPageRoutes from '@/features/my-page/routes'
import onboardingRoutes from '@/features/onboarding/routes'
import vacationRoutes from '@/features/vacation/routes'

import { registerRouterGuards } from './guards'

const routes = [
  ...authRoutes,
  ...onboardingRoutes,
  ...dashboardRoutes,
  ...accountRoutes,
  ...cashflowRoutes,
  ...aiCoachRoutes,
  ...missionRoutes,
  ...eventRoutes,
  ...vacationRoutes,
  ...cohortRoutes,
  ...myPageRoutes,
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

registerRouterGuards(router)

export default router
