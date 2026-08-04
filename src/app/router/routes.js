import DashboardPage from '@/features/dashboard/pages/DashboardPage.vue'
import AICoachPage from '@/features/ai-analysis/pages/AICoachPage.vue'
import ChallengePage from '@/features/challenges/pages/ChallengePage.vue'
import MyPage from '@/features/my-page/pages/MyPage.vue'

export default [
  {
    path: '/dashboard',
    name: 'dashboard',
    component: DashboardPage,
    meta: {
      bottomNavigation: 'home',
    },
  },
  {
    path: '/ai-coach',
    name: 'ai-coach',
    component: AICoachPage,
    meta: {
      bottomNavigation: 'ai-coach',
    },
  },
  {
    path: '/challenge',
    name: 'challenge',
    component: ChallengePage,
    meta: {
      bottomNavigation: 'challenge',
    },
  },
  {
    path: '/mypage',
    name: 'mypage',
    component: MyPage,
    meta: {
      bottomNavigation: 'profile',
    },
  },
]
