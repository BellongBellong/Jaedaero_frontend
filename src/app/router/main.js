const mainRoutes = [
  {
    path: '/',
    component: () => import('@/app/layouts/MainLayout.vue'),
    children: [
      {
        path: 'home',
        name: 'dashboard',
        component: () => import('@/features/dashboard/views/DashboardView.vue'),
        meta: {
          requiresAuth: true,
          bottomNavigation: 'home',
          headerVariant: 'home',
        },
      },
      {
        path: 'ai-coach',
        name: 'ai-coach',
        component: () => import('@/features/ai-analysis/views/AiCoachView.vue'),
        meta: {
          requiresAuth: true,
          bottomNavigation: 'ai-coach',
          headerTitle: 'AI 코치',
          headerVariant: 'title',
        },
      },
      {
        path: 'challenge',
        name: 'challenge',
        component: () => import('@/features/challenges/views/ChallengeView.vue'),
        meta: { requiresAuth: true, bottomNavigation: 'challenge', headerTitle: '챌린지' },
      },
      {
        path: 'mypage',
        name: 'mypage',
        component: () => import('@/features/my-page/views/MyPageView.vue'),
        meta: { requiresAuth: true, bottomNavigation: 'profile', headerTitle: '마이페이지' },
      },
      {
        path: 'mypage/connected-banks',
        name: 'connected-banks',
        component: () => import('@/features/accounts/views/ConnectedBanksView.vue'),
        meta: { requiresAuth: true, hideHeader: true, hideBottomNavigation: true },
      },
      {
        path: 'mypage/connected-banks/:institutionKey',
        name: 'connected-bank-management',
        component: () => import('@/features/accounts/views/AccountManagementView.vue'),
        meta: { requiresAuth: true, hideHeader: true, hideBottomNavigation: true },
      },
      {
        path: 'transactions',
        name: 'transactions',
        component: () => import('@/features/transactions/views/TransactionHistoryView.vue'),
        meta: { requiresAuth: true, bottomNavigation: 'home', hideHeader: true },
      },
      {
        path: 'upcoming-events',
        name: 'upcoming-events',
        component: () => import('@/features/dashboard/views/UpcomingEventsView.vue'),
        meta: { requiresAuth: true, bottomNavigation: 'home', headerTitle: '예정된 이벤트' },
      },
      {
        path: 'monthly-asset-report',
        name: 'monthly-asset-report',
        component: () => import('@/features/dashboard/views/MonthlyAssetReportView.vue'),
        meta: { requiresAuth: true, bottomNavigation: 'home', headerTitle: '이번 달 자산 현황' },
      },
      {
        path: 'assets',
        name: 'asset-overview',
        component: () => import('@/features/dashboard/views/AssetOverviewView.vue'),
        meta: { requiresAuth: true, bottomNavigation: 'home', headerTitle: '자산 현황' },
      },
      {
        path: 'assets/accounts',
        name: 'account-assets',
        component: () => import('@/features/dashboard/views/AccountAssetsView.vue'),
        meta: { requiresAuth: true, bottomNavigation: 'home', hideHeader: true },
      },
      {
        path: 'transactions/detail/:transactionId',
        name: 'transaction-detail',
        component: () => import('@/features/transactions/views/TransactionDetailView.vue'),
        meta: { requiresAuth: true, bottomNavigation: 'home', hideHeader: true },
      },
      {
        path: 'transactions/accounts/:accountId',
        name: 'account-transactions',
        component: () => import('@/features/transactions/views/AccountTransactionView.vue'),
        meta: { requiresAuth: true, bottomNavigation: 'home', hideHeader: true },
      },
      {
        path: 'ai-financial-report',
        name: 'ai-financial-report',
        component: () => import('@/features/reports/views/AiFinancialReportView.vue'),
        meta: {
          requiresAuth: true,
          bottomNavigation: 'ai-coach',
          headerTitle: '오늘의 AI 시장 리포트',
          headerBadge: 'BETA',
        },
      },
      {
        path: 'ai-asset-analysis-result',
        name: 'ai-asset-analysis-result',
        component: () => import('@/features/ai-analysis/views/AiAssetAnalysisResultView.vue'),
        meta: {
          requiresAuth: true,
          bottomNavigation: 'ai-coach',
          hideHeader: true,
        },
      },
      {
        path: 'analysis-history',
        name: 'analysis-history',
        component: () => import('@/features/ai-analysis/views/AnalysisHistoryView.vue'),
        meta: {
          requiresAuth: true,
          bottomNavigation: 'ai-coach',
          headerTitle: 'AI 분석 기록',
        },
      },
      {
        path: 'analysis-history/what-if/:simulationId',
        name: 'what-if-detail',
        component: () => import('@/features/ai-analysis/views/WhatIfDetailView.vue'),
        meta: {
          requiresAuth: true,
          bottomNavigation: 'ai-coach',
          headerTitle: '시뮬레이션 상세보기',
        },
      },
      {
        path: 'what-if-simulation',
        name: 'what-if-simulation',
        component: () => import('@/features/simulations/views/WhatIfSimulationView.vue'),
        meta: {
          requiresAuth: true,
          bottomNavigation: 'ai-coach',
          headerTitle: 'What-if 시뮬레이션',
        },
      },
      {
        path: 'ai-product-recommendation',
        name: 'ai-product-recommendation',
        component: () => import('@/features/simulations/views/AiProductRecommendationView.vue'),
        meta: { requiresAuth: true, bottomNavigation: 'ai-coach', hideHeader: true },
      },
      {
        path: 'rebalancing',
        name: 'rebalancing',
        component: () => import('@/features/rebalancing/views/RebalancingView.vue'),
        meta: { requiresAuth: true, bottomNavigation: 'ai-coach', headerTitle: '리밸런싱' },
      },
      {
        path: 'badge-history',
        name: 'badge-history',
        component: () => import('@/features/my-page/views/BadgeHistoryView.vue'),
        meta: { requiresAuth: true, bottomNavigation: 'profile', headerTitle: '뱃지 획득 내역' },
      },
    ],
  },
]

export default mainRoutes
