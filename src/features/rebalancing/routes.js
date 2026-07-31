import RebalancingView from './views/RebalancingView.vue'

const rebalancingRoutes = [
  {
    path: '/ai-coach/rebalancing',
    name: 'Rebalancing',
    component: RebalancingView,
    meta: {
      requiresAuth: false,
    },
  },
]

export default rebalancingRoutes
