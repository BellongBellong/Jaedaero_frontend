const dashboardRoutes = [
  {
    path: '/home',
    name: 'dashboard',
    component: () => import('./views/DashboardView.vue'),
    meta: { requiresAuth: true },
  },
]

export default dashboardRoutes
