export const dashboardMock = {
  dailyReport: {
    greeting: '저녁은 맛있게 드셨나요?',
    title: '오늘의 금융 AI 리포트',
    date: '2026-07-29',
  },
  financialDday: {
    financialDday: 54,
    actualDday: 60,
    actualDischargeDate: '2026-09-26',
    differenceDays: 4,
    achievementRate: 80.2,
    currentAmount: 1354,
    netAsset: 800,
    targetAmount: 1700,
  },
  missions: [
    { id: 1, title: '오늘의 리포트 확인', completed: true },
    { id: 2, title: '나라사랑카드\n혜택 확인하기', completed: false },
    { id: 3, title: '이번 달 소비 확인하기', completed: false },
    { id: 4, title: '저축 목표 점검하기', completed: false },
  ],
  assetSummary: {
    monthly: {
      income: {
        amount: 1905000,
        changeRate: 15,
        description: '병장 월급 1,800,000원',
      },
      investment: {
        amount: 420000,
        changeAmount: 15000,
        changeRate: 15,
      },
      spending: {
        amount: 154000,
        targetAmount: 100000,
      },
    },
    forecast: {
      totalAmount: 18540000,
      labels: ['2월', '3월', '4월', '5월', '6월', '현재'],
      expected: [800, 980, 1160, 1320, 1560, 1740],
      target: [800, 1050, 1290, 1510, 1780, 2050],
    },
  },
}
