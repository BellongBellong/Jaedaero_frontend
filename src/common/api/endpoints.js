export const ENDPOINTS = {
  auth: {
    login: '/auth/login',
    refresh: '/auth/refresh',
    logout: '/auth/logout',
  },
  users: {
    me: '/users/me',
    nicknameAvailability: '/users/nickname/availability',
    nickname: '/users/nickname',
    profileAppearance: '/users/profile-appearance',
    investmentBadges: '/users/investment-badges',
  },
  agreements: '/agreements',
  onboarding: {
    militaryInfo: '/onboarding/military-info',
    investmentPreference: '/onboarding/investment-preference',
  },
  goals: '/goals',
  accounts: {
    connect: '/accounts/connect',
    list: '/accounts',
    detail: (accountId) => `/accounts/${accountId}`,
  },
  dashboard: '/dashboard',
  cashflow: '/cashflow',
  simulations: {
    list: '/simulations',
    detail: (simulationId) => `/simulations/${simulationId}`,
  },
  aiAnalyses: {
    create: '/ai-analyses',
    detail: (analysisId) => `/ai-analyses/${analysisId}`,
    apply: (analysisId) => `/ai-analyses/${analysisId}/apply`,
  },
  strategyApplications: '/strategy-applications',
  transactions: {
    list: '/transactions',
    category: (transactionId) => `/transactions/${transactionId}/category`,
  },
  soldierSavings: '/soldier-savings',
  challenges: {
    group: '/challenges/group',
  },
  missions: {
    today: '/missions/today',
    complete: (missionId) => `/missions/${missionId}/complete`,
  },
  reports: {
    discharge: '/reports/discharge',
  },
  products: {
    recommendations: '/products/recommendations',
  },
  benefits: '/benefits',
  rebalancing: {
    recommendations: '/rebalancing/recommendations',
    apply: (rebalancingId) => `/rebalancing/recommendations/${rebalancingId}/apply`,
  },
  deviceTokens: '/device-tokens',
  notifications: {
    list: '/notifications',
    read: (notificationId) => `/notifications/${notificationId}/read`,
  },
  leaveMode: {
    start: '/leave-mode',
    current: '/leave-mode/current',
  },
  marketReport: {
    today: '/market-reports/today',
  },
}
