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
    activate: (accountId) => `/accounts/${accountId}/activate`,
  },
  dashboard: '/dashboard',
  cashflow: '/cashflow',
  simulations: {
    defaults: '/simulations/defaults',
    list: '/simulations',
    detail: (simulationId) => `/simulations/${simulationId}`,
  },
  aiAnalyses: {
    create: '/ai-analyses',
    detail: (analysisId) => `/ai-analyses/${analysisId}`,
    apply: (analysisId) => `/ai-analyses/${analysisId}/apply`,
  },
  analysisHistories: '/analysis-histories',
  strategyApplications: '/strategy-applications',
  transactions: {
    list: '/transactions',
    securities: (accountId) => `/transactions/securities/${accountId}`,
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
  recurringInvestmentPlans: {
    me: '/recurring-investment-plans/me',
  },
  investmentGuidances: {
    latest: '/investment-guidances/latest',
    create: '/investment-guidances',
    detail: (guidanceId) => `/investment-guidances/${guidanceId}`,
    apply: (guidanceId) => `/investment-guidances/${guidanceId}/apply`,
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
    todayIndicators: '/market-reports/today/indicators',
  },
}
