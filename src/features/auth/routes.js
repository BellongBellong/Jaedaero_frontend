const authRoutes = [
  {
    path: '/',
    name: 'splash',
    component: () => import('./views/SplashView.vue'),
  },
  {
    path: '/login',
    name: 'social-login',
    component: () => import('./views/SocialLoginView.vue'),
  },
  {
    path: '/auth/callback/:provider',
    name: 'social-login-callback',
    component: () => import('./views/SocialLoginCallbackView.vue'),
  },
  {
    path: '/terms',
    name: 'terms',
    component: () => import('./views/TermsView.vue'),
  },
]

export default authRoutes
