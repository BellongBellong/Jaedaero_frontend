const path = require('path')
const jsonServer = require('json-server')

const server = jsonServer.create()
const router = jsonServer.router(path.join(__dirname, 'db.json'))
const middlewares = jsonServer.defaults()
const db = router.db
const PORT = Number(process.env.MOCK_PORT || 3001)

server.use(middlewares)
server.use(jsonServer.bodyParser)

const first = (resource) => db.get(resource).value()?.[0] ?? null
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
  const response = first('loginResponses')
  res.status(200).json({ ...response, provider: req.body?.socialType || 'GOOGLE' })
})

server.post('/api/v1/auth/refresh', (_req, res) => {
  res.status(200).json(first('refreshTokenResponses'))
})

server.post('/api/v1/auth/logout', (_req, res) => res.status(204).end())
server.delete('/api/v1/users/me', (_req, res) => res.status(204).end())

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
  const preview = first('investmentPreferencePreviews')
  res.status(200).json({ ...preview, investmentPreference: req.body.investmentPreference })
})

server.post('/api/v1/goals', (req, res) => {
  const goal = { id: first('goals')?.id || 1, userId: 1, goalStatus: 'CHALLENGING', ...req.body }
  db.set('goals', [goal]).write()
  res.status(201).json(goal)
})
server.get('/api/v1/goals', (_req, res) => res.status(200).json(first('goals')))

server.post('/api/v1/accounts/connect', (_req, res) =>
  res.status(201).json(first('codefConnections')),
)
server.get('/api/v1/accounts', (_req, res) => res.status(200).json(list('connectedAccounts')))

server.get('/api/v1/dashboard', (_req, res) => res.status(200).json(first('dashboardResponses')))
server.get('/api/v1/cashflow', (req, res) => {
  const response = first('cashflowForecasts')
  const months = Number(req.query.months || response.requestedMonths)
  res
    .status(200)
    .json({ ...response, requestedMonths: months, months: response.months.slice(0, months) })
})

server.post('/api/v1/simulations', (req, res) => {
  const base = first('simulations')
  const created = {
    ...base,
    id: nextId('simulations'),
    ...req.body,
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
  const base = first('aiAnalyses')
  const created = {
    ...base,
    id: nextId('aiAnalyses'),
    simulationId: req.body.simulationId || null,
    generatedAt: new Date().toISOString(),
  }
  db.get('aiAnalyses').push(created).write()
  res.status(201).json(created)
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

server.get('/api/v1/soldier-savings', (_req, res) => res.status(200).json(first('soldierSavings')))
server.get('/api/v1/challenges/group', (_req, res) =>
  res.status(200).json(first('challengeGroups')),
)
server.get('/api/v1/users/investment-badges', (req, res) => {
  res.status(200).json(paginate(list('investmentBadges'), req.query.page, req.query.size))
})
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
  res.status(200).json(first('dischargeReports')),
)
server.get('/api/v1/products/recommendations', (_req, res) =>
  res.status(200).json(list('productRecommendations')),
)
server.get('/api/v1/benefits', (req, res) => {
  let items = list('militaryBenefits')
  if (req.query.category) items = items.filter((item) => item.category === req.query.category)
  if (req.query.rank)
    items = items.filter((item) => item.rank === 'ALL' || item.rank === req.query.rank)
  res.status(200).json(items)
})

server.get('/api/v1/rebalancing/recommendations', (_req, res) =>
  res.status(200).json(first('rebalancingRecommendations')),
)
server.post('/api/v1/rebalancing/recommendations/:rebalancingId/apply', (req, res) => {
  const base = first('strategyApplications')
  const created = {
    ...base,
    id: nextId('strategyApplications'),
    analysisId: null,
    sourceType: 'REBALANCING',
    sourceId: Number(req.params.rebalancingId),
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
  const current = first('leaveModes') || { id: 1 }
  const updated = { ...current, ...req.body, active: true }
  db.set('leaveModes', [updated]).write()
  res.status(201).json(updated)
})
server.get('/api/v1/leave-mode/current', (_req, res) => {
  const current = first('leaveModes')
  if (!current?.active) return res.status(204).end()
  res.status(200).json(current)
})
server.get('/api/v1/market-reports/today', (_req, res) =>
  res.status(200).json(first('todayMarketReports')),
)

// 원본 리소스를 확인할 때만 사용: /__db/users, /__db/transactions 등
server.use('/__db', router)

server.listen(PORT, () => {
  console.log(`JAEDAERO mock API: http://localhost:${PORT}/api/v1`)
})
