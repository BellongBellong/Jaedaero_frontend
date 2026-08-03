import AiAnalysisDetailView from './views/AiAnalysisDetailView.vue'

const aiAnalysisRoutes = [
  {
    path: '/ai-coach/analyses/:analysisId',
    name: 'AiAnalysisDetail',
    component: AiAnalysisDetailView,
    meta: {
      requiresAuth: false,
    },
  },
]

export default aiAnalysisRoutes
