const onboardingRoutes = [
  {
    path: '/onboarding',
    component: () => import('@/app/layouts/OnboardingLayout.vue'),
    children: [
      {
        path: '',
        name: 'onboarding-intro',
        component: () => import('./views/OnboardingIntroView.vue'),
      },
      {
        path: 'accounts',
        name: 'connect-accounts',
        component: () => import('./views/AccountConnectView.vue'),
      },
      {
        path: 'nickname',
        name: 'nickname',
        component: () => import('./views/NicknameSetupView.vue'),
      },
      {
        path: 'military-info',
        name: 'military-info',
        component: () => import('./views/MilitaryInfoView.vue'),
      },
      {
        path: 'preference-goal',
        name: 'preference-goal',
        component: () => import('./views/PreferenceGoalView.vue'),
      },
    ],
  },
]

export default onboardingRoutes
