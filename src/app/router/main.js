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
    ],
  },
]

export default mainRoutes
