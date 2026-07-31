const mainRoutes = [
  {
    path: '/',
    component: () => import('@/app/layouts/MainLayout.vue'),
    children: [
      {
        path: 'home',
        name: 'dashboard',
        component: () => import('@/features/dashboard/views/DashboardView.vue'),
        meta: { requiresAuth: true, bottomNavigation: 'home' },
      },
      {
        path: 'ai-coach',
        name: 'ai-coach',
        component: () => import('@/features/ai-analysis/views/AiCoachView.vue'),
        meta: { requiresAuth: true, bottomNavigation: 'ai-coach' },
      },
      {
        path: 'challenge',
        name: 'challenge',
        component: () => import('@/features/challenges/views/ChallengeView.vue'),
        meta: { requiresAuth: true, bottomNavigation: 'challenge' },
      },
      {
        path: 'mypage',
        name: 'mypage',
        component: () => import('@/features/my-page/views/MyPageView.vue'),
        meta: { requiresAuth: true, bottomNavigation: 'profile' },
      },
      {
        path: 'transactions',
        name: 'transactions',
        component: () => import('@/features/transactions/views/TransactionHistoryView.vue'),
        meta: { requiresAuth: true, bottomNavigation: 'home' },
      },
      {
        path: 'transactions/detail',
        name: 'transaction-detail',
        component: () => import('@/features/transactions/views/TransactionDetailView.vue'),
        meta: { requiresAuth: true, bottomNavigation: 'home' },
      },
      {
        path: 'ai-financial-report',
        name: 'ai-financial-report',
        component: () => import('@/features/reports/views/AiFinancialReportView.vue'),
        meta: { requiresAuth: true, bottomNavigation: 'ai-coach' },
      },
      {
        path: 'ai-asset-analysis-result',
        name: 'ai-asset-analysis-result',
        component: () => import('@/features/ai-analysis/views/AiAssetAnalysisResultView.vue'),
        meta: { requiresAuth: true, bottomNavigation: 'ai-coach' },
      },
      {
        path: 'what-if-simulation',
        name: 'what-if-simulation',
        component: () => import('@/features/simulations/views/WhatIfSimulationView.vue'),
        meta: { requiresAuth: true, bottomNavigation: 'ai-coach' },
      },
      {
        path: 'ai-product-recommendation',
        name: 'ai-product-recommendation',
        component: () => import('@/features/simulations/views/AiProductRecommendationView.vue'),
        meta: { requiresAuth: true, bottomNavigation: 'ai-coach' },
      },
      {
        path: 'rebalancing',
        name: 'rebalancing',
        component: () => import('@/features/rebalancing/views/RebalancingView.vue'),
        meta: { requiresAuth: true, bottomNavigation: 'ai-coach' },
      },
      {
        path: 'badge-history',
        name: 'badge-history',
        component: () => import('@/features/my-page/views/BadgeHistoryView.vue'),
        meta: { requiresAuth: true, bottomNavigation: 'profile' },
      },
    ],
  },
]

export default mainRoutes
