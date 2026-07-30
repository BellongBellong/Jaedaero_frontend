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
    path: '/terms',
    name: 'terms',
    component: () => import('./views/TermsView.vue'),
  },
]

export default authRoutes
