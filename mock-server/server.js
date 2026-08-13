const path = require('path')
const jsonServer = require('json-server')

const server = jsonServer.create()
const router = jsonServer.router(path.join(__dirname, 'db.json'))
const middlewares = jsonServer.defaults()
const db = router.db
const PORT = Number(process.env.MOCK_PORT || 8080)

server.use(middlewares)
server.use(jsonServer.bodyParser)

db.defaults({
  agreements: [],
  loginResponses: [],
  refreshTokenResponses: [],
  investmentPreferenceResponses: [],
  codefConnections: [],
  dashboardResponses: [],
  cashflowForecasts: [],
  aiAnalyses: [],
  strategyApplications: [],
  soldierSavings: [],
  challengeGroups: [],
  dischargeReports: [],
  productRecommendations: [],
  militaryBenefits: [],
  recurringInvestmentPlans: [],
  investmentGuidances: [],
  deviceTokens: [],
  leaveModes: [],
  todayMarketReports: [],
}).write()

const first = (resource, fallback = null) => db.get(resource).value()?.[0] ?? fallback
const list = (resource) => db.get(resource).value() ?? []
const nextId = (resource) => {
  const ids = list(resource).map((item) => Number(item.id) || 0)
  return Math.max(0, ...ids) + 1
}
const paginate = (items, page = 0, size = 20) => {
  const start = Number(page) * Number(size)
  return items.slice(start, start + Number(size))
}

server.post('/api/v1/auth/login', (req, res) => {
  const user = first('users')
  const response = first('loginResponses', {
    accessToken: 'mock-access-token',
    refreshToken: 'mock-refresh-token',
    onboardingCompleted: user?.onboardingCompleted || false,
  })
  res.status(200).json({
    ...response,
    user: response.user || {
      userId: user?.id || 1,
      onboardingCompleted: response.onboardingCompleted ?? user?.onboardingCompleted ?? false,
    },
    provider: req.body?.socialType || 'GOOGLE',
  })
})

server.post('/api/v1/auth/refresh', (_req, res) => {
  res.status(200).json(
    first('refreshTokenResponses', {
      accessToken: 'mock-access-token-refreshed',
      refreshToken: 'mock-refresh-token',
    }),
  )
})

server.post('/api/v1/auth/logout', (_req, res) => res.status(204).end())
server.get('/api/v1/users/me', (_req, res) => {
  const user = first('users')

  if (!user) return res.status(404).json({ message: 'User not found' })

  const soldierProfile = list('soldierProfiles').find(
    (profile) => Number(profile.userId) === Number(user.id),
  )

  return res.status(200).json({
    ...user,
    ...(soldierProfile || {}),
    userId: user.id,
  })
})
server.delete('/api/v1/users/me', (_req, res) => res.status(204).end())
server.get('/api/v1/users/me', (_req, res) => {
  const user = first('users')
  const soldier = first('soldierProfiles')
  const goal = first('goals')
  res.status(200).json({
    userId: user?.id || 1,
    nickname: user?.nickname || '',
    profileImage: user?.profileImage,
    profileBackgroundColor: user?.profileBackgroundColor,
    soldierProfile: soldier,
    goal,
  })
})

server.get('/api/v1/users/nickname/availability', (req, res) => {
  const nickname = String(req.query.nickname || '').trim()
  const duplicated = list('users').some((user) => user.nickname === nickname)
  res.status(200).json({ nickname, available: nickname.length >= 2 && !duplicated })
})

server.put('/api/v1/users/nickname', (req, res) => {
  db.get('users').find({ id: 1 }).assign({ nickname: req.body.nickname }).write()
  res.status(204).end()
})

server.put('/api/v1/users/profile-appearance', (req, res) => {
  db.get('users')
    .find({ id: 1 })
    .assign({
      profileImage: req.body.profileImage,
      profileBackgroundColor: req.body.profileBackgroundColor,
      profileSource: req.body.profileSource || 'PRESET',
    })
    .write()
  res.status(204).end()
})

server.post('/api/v1/agreements', (req, res) => {
  const created = {
    id: nextId('agreements'),
    userId: 1,
    ...req.body,
    agreedAt: new Date().toISOString(),
  }
  db.get('agreements').push(created).write()
  res.status(201).json(created)
})

server.post('/api/v1/onboarding/military-info', (req, res) => {
  const current = first('soldierProfiles') || { id: 1, userId: 1 }
  const updated = { ...current, ...req.body }
  db.set('soldierProfiles', [updated]).write()
  res.status(201).json(updated)
})

server.post('/api/v1/onboarding/investment-preference', (req, res) => {
  const preview = first(
    'investmentPreferenceResponses',
    first('investmentPreferencePreviews', {
      expectedReturnRate: 3.2,
      riskLevel: 'LOW',
    }),
  )
  res.status(200).json({ ...preview, investmentPreference: req.body.investmentPreference })
})

server.post('/api/v1/onboarding/complete', (_req, res) => {
  db.get('users').find({ id: 1 }).assign({ onboardingCompleted: true }).write()
  res.status(200).json({ onboardingCompleted: true })
})

server.put('/api/v1/goals', (req, res) => {
  const goal = { id: first('goals')?.id || 1, userId: 1, goalStatus: 'CHALLENGING', ...req.body }
  db.set('goals', [goal]).write()
  res.status(200).json(goal)
})
server.get('/api/v1/goals', (_req, res) => res.status(200).json(first('goals')))

server.get('/api/v1/codef/institutions/banks', (_req, res) =>
  res.status(200).json([
    { organizationCode: '0004', displayName: '국민은행' },
    { organizationCode: '0003', displayName: '기업은행' },
    { organizationCode: '0088', displayName: '신한은행' },
    { organizationCode: '0081', displayName: '하나은행' },
    { organizationCode: '0011', displayName: '농협은행' },
    { organizationCode: '0020', displayName: '우리은행' },
  ]),
)
server.get('/api/v1/codef/institutions/securities', (_req, res) =>
  res.status(200).json([
    { organizationCode: '0238', displayName: '미래에셋증권' },
    { organizationCode: '0243', displayName: '한국투자증권' },
    { organizationCode: '0218', displayName: 'KB증권' },
  ]),
)

server.post('/api/v1/accounts/connect', (req, res) => {
  const organizationCode = String(req.body?.organizationCode || '')

  if (organizationCode) {
    db.get('connectedAccounts')
      .filter((account) => String(account.organizationCode || '') === organizationCode)
      .each((account) => {
        account.accountStatus = 'ACTIVE'
      })
      .write()
  }

  res.status(201).json(
    first('codefConnections', {
      connected: true,
      accounts: list('connectedAccounts'),
    }),
  )
})
server.delete('/api/v1/accounts/:accountId', (req, res) => {
  const accountId = Number(req.params.accountId)
  const account = db.get('connectedAccounts').find({ id: accountId }).value()

  if (!account) return res.status(404).json({ message: 'Account not found' })

  const updated = { ...account, accountStatus: 'DISCONNECTED' }
  db.get('connectedAccounts').find({ id: accountId }).assign(updated).write()
  res.status(204).end()
})
server.get('/api/v1/accounts/:userId', (req, res) => {
  const userId = Number(req.params.userId)
  res
    .status(200)
    .json(list('connectedAccounts').filter((account) => Number(account.userId) === userId))
})

server.get('/api/v1/dashboard', (_req, res) =>
  res.status(200).json(first('dashboardResponses', first('dashboardSummaries'))),
)
server.get('/api/v1/cashflow', (req, res) => {
  const projection = first('cashflowProjections', {})
  const fallback = {
    ...projection,
    requestedMonths: 8,
    months: list('assetProjections').map((item) => ({
      date: item.date,
      projectedAsset: item.amount,
      planType: item.planType,
    })),
  }
  const response = first('cashflowForecasts', fallback)
  const months = Number(req.query.months || response.requestedMonths || 8)
  res.status(200).json({
    ...response,
    requestedMonths: months,
    months: (response.months || []).slice(0, months),
  })
})

const MILITARY_SAVINGS_RATE = 5

// 전역일까지 남은 개월 수. 화면(WhatIfSimulationView)과 동일하게 D-day를 30으로 나눠 올림한다.
const remainingMonthsUntilDischarge = () => {
  const dischargeDate = first('soldierProfiles')?.dischargeDate
  if (!dischargeDate) return 1

  const days = Math.ceil((new Date(dischargeDate) - new Date()) / 86_400_000)
  return Math.max(1, Math.ceil(days / 30))
}

/**
 * 전역 시점 예상 자산을 계산한다.
 * 실제 백엔드가 담당할 계산이며, 목 서버에서는 화면의 미리보기 계산과 같은 방식으로 근사한다.
 * 군적금은 단리, 투자금은 월 복리로 쌓는다.
 */
const calculateProjectedAsset = ({
  monthlySavingAmount,
  monthlyInvestmentAmount,
  annualReturnRate,
}) => {
  const months = remainingMonthsUntilDischarge()
  const monthlyReturnRate = Number(annualReturnRate || 0) / 100 / 12
  const monthlySaving = Number(monthlySavingAmount || 0)
  const monthlyInvestment = Number(monthlyInvestmentAmount || 0)

  let savingInterest = 0
  let futureInvestmentValue = 0

  for (let index = 0; index < months; index += 1) {
    savingInterest += monthlySaving * (months - index) * (MILITARY_SAVINGS_RATE / 100 / 12)
    futureInvestmentValue = (futureInvestmentValue + monthlyInvestment) * (1 + monthlyReturnRate)
  }

  const currentAsset = Number(
    first('dashboardResponses', first('dashboardSummaries', {}))?.totalAsset || 0,
  )

  return Math.round(currentAsset + monthlySaving * months + savingInterest + futureInvestmentValue)
}

server.post('/api/v1/simulations', (req, res) => {
  const base = first('simulations')
  const payload = { ...base, ...req.body }
  // 시드 값을 그대로 복사하지 않고 입력값으로 다시 계산한다.
  const projectedAssetAtDischarge = calculateProjectedAsset(payload)
  const created = {
    ...payload,
    id: nextId('simulations'),
    projectedAssetAtDischarge,
    differenceFromCurrent:
      projectedAssetAtDischarge -
      Number(
        first('dashboardResponses', first('dashboardSummaries', {}))?.projectedAssetAtDischarge ||
          0,
      ),
    createdAt: new Date().toISOString(),
  }
  db.get('simulations').push(created).write()
  res.status(201).json(created)
})
server.get('/api/v1/simulations', (req, res) => {
  res.status(200).json(paginate(list('simulations'), req.query.page, req.query.size))
})
server.get('/api/v1/simulations/:simulationId', (req, res) => {
  const item = db
    .get('simulations')
    .find({ id: Number(req.params.simulationId) })
    .value()
  item ? res.status(200).json(item) : res.status(404).json({ message: 'Simulation not found' })
})

server.post('/api/v1/ai-analyses', (req, res) => {
  const base = first('aiAnalyses', first('aiReports', {}))
  const created = {
    ...base,
    id: nextId('aiAnalyses'),
    simulationId: req.body.simulationId || null,
    generatedAt: new Date().toISOString(),
  }
  db.get('aiAnalyses').push(created).write()
  res.status(201).json(created)
})
server.get('/api/v1/ai-analyses', (req, res) => {
  res.status(200).json(paginate(list('aiAnalyses'), req.query.page, req.query.size))
})
server.get('/api/v1/ai-analyses/:analysisId', (req, res) => {
  const item = db
    .get('aiAnalyses')
    .find({ id: Number(req.params.analysisId) })
    .value()
  item ? res.status(200).json(item) : res.status(404).json({ message: 'AI analysis not found' })
})
server.post('/api/v1/ai-analyses/:analysisId/apply', (req, res) => {
  const base = first('strategyApplications')
  const created = {
    ...base,
    id: nextId('strategyApplications'),
    analysisId: Number(req.params.analysisId),
    appliedAt: new Date().toISOString(),
  }
  db.get('strategyApplications').push(created).write()
  res.status(201).json(created)
})
server.get('/api/v1/strategy-applications', (req, res) => {
  res.status(200).json(paginate(list('strategyApplications'), req.query.page, req.query.size))
})

server.get('/api/v1/transactions', (req, res) => {
  let items = list('transactions')
  if (req.query.accountId)
    items = items.filter((item) => item.accountId === Number(req.query.accountId))
  if (req.query.category) items = items.filter((item) => item.category === req.query.category)
  if (req.query.startDate)
    items = items.filter((item) => item.transactionDate >= req.query.startDate)
  if (req.query.endDate)
    items = items.filter((item) => item.transactionDate <= `${req.query.endDate}T23:59:59`)
  res.status(200).json(items)
})
server.put('/api/v1/transactions/:transactionId/category', (req, res) => {
  const chain = db.get('transactions').find({ id: Number(req.params.transactionId) })
  const item = chain.value()
  if (!item) return res.status(404).json({ message: 'Transaction not found' })
  chain
    .assign({
      category: req.body.category,
      categorySourceType: 'USER',
      classificationConfidence: 1,
    })
    .write()
  res.status(200).json(chain.value())
})

server.get('/api/v1/soldier-savings', (_req, res) =>
  res
    .status(200)
    .json(
      first(
        'soldierSavings',
        list('connectedAccounts').find((item) => item.accountType === 'MILITARY_SAVINGS') || null,
      ),
    ),
)
server.get('/api/v1/challenges/group', (_req, res) =>
  res.status(200).json(first('challengeGroups', first('cohortComparisons'))),
)
server.get('/api/v1/users/investment-badges', (_req, res) =>
  res.status(200).json(list('investmentBadges')),
)
server.get('/api/v1/missions/today', (_req, res) => res.status(200).json(list('missions')))
server.post('/api/v1/missions/:missionId/complete', (req, res) => {
  const chain = db.get('missions').find({ id: Number(req.params.missionId) })
  const item = chain.value()
  if (!item) return res.status(404).json({ message: 'Mission not found' })
  chain.assign({ status: 'COMPLETED', progress: item.target }).write()
  res
    .status(200)
    .json({ mission: chain.value(), badgeChanged: false, currentBadge: first('investmentBadges') })
})

server.get('/api/v1/reports/discharge', (_req, res) =>
  res.status(200).json(first('dischargeReports', first('dashboardSummaries'))),
)
server.get('/api/v1/products/recommendations', (_req, res) =>
  res.status(200).json(list('productRecommendations')),
)
server.get('/api/v1/benefits', (req, res) => {
  let items = list('militaryBenefits')
  if (!items.length) items = list('benefits')
  if (req.query.category) items = items.filter((item) => item.category === req.query.category)
  if (req.query.rank)
    items = items.filter((item) => item.rank === 'ALL' || item.rank === req.query.rank)
  res.status(200).json(items)
})

server.get('/api/v1/recurring-investment-plans/me', (_req, res) =>
  res.status(200).json(first('recurringInvestmentPlans')),
)
server.put('/api/v1/recurring-investment-plans/me', (req, res) => {
  const updated = {
    id: first('recurringInvestmentPlans')?.id || 1,
    userId: 1,
    ...req.body,
    updatedAt: new Date().toISOString(),
  }
  db.set('recurringInvestmentPlans', [updated]).write()
  res.status(200).json(updated)
})
server.get('/api/v1/investment-guidances/latest', (_req, res) =>
  res.status(200).json(first('investmentGuidances')),
)
server.post('/api/v1/investment-guidances', (_req, res) => {
  const created = {
    ...(first('investmentGuidances') || {}),
    id: nextId('investmentGuidances'),
    createdAt: new Date().toISOString(),
  }
  db.get('investmentGuidances').push(created).write()
  res.status(201).json(created)
})
server.post('/api/v1/investment-guidances/:guidanceId/apply', (req, res) => {
  const base = first('strategyApplications')
  const created = {
    ...base,
    id: nextId('strategyApplications'),
    analysisId: null,
    sourceType: 'INVESTMENT_GUIDANCE',
    sourceId: Number(req.params.guidanceId),
    ...req.body,
    appliedAt: new Date().toISOString(),
  }
  db.get('strategyApplications').push(created).write()
  res.status(201).json(created)
})

server.post('/api/v1/device-tokens', (req, res) => {
  const created = { id: nextId('deviceTokens'), ...req.body, createdAt: new Date().toISOString() }
  db.get('deviceTokens').push(created).write()
  res.status(201).json(created)
})
server.get('/api/v1/notifications', (req, res) => {
  res.status(200).json(paginate(list('notifications'), req.query.page, req.query.size))
})
server.put('/api/v1/notifications/:notificationId/read', (req, res) => {
  const chain = db.get('notifications').find({ id: Number(req.params.notificationId) })
  if (!chain.value()) return res.status(404).json({ message: 'Notification not found' })
  chain.assign({ isRead: true }).write()
  res.status(204).end()
})

server.post('/api/v1/leave-mode', (req, res) => {
  const current = first('leaveModes', first('vacationModes')) || { id: 1 }
  const updated = { ...current, ...req.body, active: true }
  db.set('leaveModes', [updated]).write()
  res.status(201).json(updated)
})
server.get('/api/v1/leave-mode/current', (_req, res) => {
  const current = first('leaveModes', first('vacationModes'))
  if (!current?.active) return res.status(204).end()
  res.status(200).json(current)
})
server.get('/api/v1/market-reports/today', (_req, res) =>
  res
    .status(200)
    .json(
      first(
        'todayMarketReports',
        list('aiReports').find((item) => item.reportType === 'DAILY_MARKET') || null,
      ),
    ),
)

// 원본 리소스를 확인할 때만 사용: /__db/users, /__db/transactions 등
server.use('/__db', router)

server.listen(PORT, () => {
  console.log(`JAEDAERO mock API: http://localhost:${PORT}/api/v1`)
})
