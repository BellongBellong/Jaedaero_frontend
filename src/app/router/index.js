import { createRouter, createWebHistory } from 'vue-router'

import accountRoutes from '@/features/accounts/routes'
import aiAnalysisRoutes from '@/features/ai-analysis/routes'
import authRoutes from '@/features/auth/routes'
import cashflowRoutes from '@/features/cashflow/routes'
import dashboardRoutes from '@/features/dashboard/routes'
import challengeRoutes from '@/features/challenges/routes'
import leaveModeRoutes from '@/features/leave-mode/routes'
import marketReportRoutes from '@/features/market-report/routes'
import missionRoutes from '@/features/missions/routes'
import myPageRoutes from '@/features/my-page/routes'
import notificationRoutes from '@/features/notifications/routes'
import onboardingRoutes from '@/features/onboarding/routes'
import rebalancingRoutes from '@/features/rebalancing/routes'
import reportRoutes from '@/features/reports/routes'
import simulationRoutes from '@/features/simulations/routes'
import soldierSavingRoutes from '@/features/soldier-savings/routes'
import transactionRoutes from '@/features/transactions/routes'

import { registerRouterGuards } from './guards'

const routes = [
  ...authRoutes,
  ...onboardingRoutes,
  ...dashboardRoutes,
  ...accountRoutes,
  ...cashflowRoutes,
  ...simulationRoutes,
  ...aiAnalysisRoutes,
  ...transactionRoutes,
  ...soldierSavingRoutes,
  ...challengeRoutes,
  ...missionRoutes,
  ...reportRoutes,
  ...rebalancingRoutes,
  ...notificationRoutes,
  ...leaveModeRoutes,
  ...marketReportRoutes,
  ...myPageRoutes,
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

registerRouterGuards(router)

export default router
