const availableMission = (id, title, missionGroup = 'TODAY') => ({
  id,
  missionGroup,
  title,
  description: `${title} 미션을 진행해보세요`,
  missionType: 'COMMON',
  status: 'AVAILABLE',
  progress: 0,
  target: 1,
  completed: false,
})

const completedMission = (id, title, missionGroup = 'TODAY') => ({
  ...availableMission(id, title, missionGroup),
  status: 'COMPLETED',
  progress: 1,
  completed: true,
})

export const DASHBOARD_PERSONAS = {
  PRIVATE_NEWCOMER: 'private-newcomer',
  PFC_SAFE_PX: 'pfc-safe-px',
  CORPORAL_BALANCED_PROFIT: 'corporal-balanced-profit',
  SERGEANT_AGGRESSIVE_LOSS: 'sergeant-aggressive-loss',
}

export const dashboardPersonaMocks = {
  [DASHBOARD_PERSONAS.PRIVATE_NEWCOMER]: {
    profile: {
      userId: 101,
      nickname: '첫걸음곰',
      rank: 'PRIVATE',
      rankName: '이병',
      investmentPreference: 'BALANCED',
    },
    dailyReport: {
      greeting: '군 생활의 첫 금융 습관을 시작해볼까요?',
      title: '오늘의 금융 AI 리포트',
    },
    financialDday: {
      financialDday: 214,
      actualDday: 226,
      financialDischargeDate: '2027-03-08',
      actualDischargeDate: '2027-03-20',
      achievementRate: 2.1,
      currentAsset: 35,
      targetAmount: 1700,
    },
    missions: [
      availableMission(101, '첫 금융리포트 확인'),
      availableMission(102, '군 적금 알아보기'),
      availableMission(103, '데일리 시장리포트 보기', 'DAILY'),
      availableMission(104, '소비 내역 확인하기', 'DAILY'),
    ],
    events: [],
    assetSummary: {
      monthly: {
        income: {
          amount: 0,
          salaryAmount: 750000,
          salaryLabel: '이병 월급',
          otherIncomeAmount: 0,
          hasAdditionalIncome: false,
          changeRate: 0,
        },
        investment: {
          hasSecuritiesAccount: false,
          amount: 0,
          changeAmount: 0,
          changeRate: 0,
          monthlyPaymentTarget: 0,
        },
        spending: {
          amount: 42000,
          targetAmount: 150000,
        },
      },
      total: {
        totalAsset: 350000,
        accounts: [
          {
            id: 1011,
            accountType: 'CHECKING',
            bankName: '신한은행',
            name: '나라사랑월급통장',
            amount: 350000,
          },
        ],
      },
      forecast: {
        totalAmount: 14100000,
        labels: ['8월', '9월', '10월', '11월', '12월', '현재'],
        expected: [35, 150, 270, 390, 510, 1410],
        target: [35, 170, 320, 480, 650, 1700],
      },
    },
  },

  [DASHBOARD_PERSONAS.PFC_SAFE_PX]: {
    profile: {
      userId: 102,
      nickname: '절약일병',
      rank: 'PRIVATE_FIRST_CLASS',
      rankName: '일병',
      investmentPreference: 'SAFE',
    },
    dailyReport: {
      greeting: '이번 주 PX 소비를 함께 점검해볼까요?',
      title: '오늘의 금융 AI 리포트',
    },
    financialDday: {
      financialDday: 149,
      actualDday: 157,
      financialDischargeDate: '2027-01-02',
      actualDischargeDate: '2027-01-10',
      achievementRate: 26,
      currentAsset: 520,
      targetAmount: 2000,
    },
    missions: [
      completedMission(201, '오늘의 소비리포트 확인'),
      availableMission(202, 'PX 소비 줄이기'),
      completedMission(203, '데일리 금융리포트 보기', 'DAILY'),
      completedMission(204, '데일리 시장리포트 보기', 'DAILY'),
    ],
    events: [
      {
        id: 201,
        userId: 102,
        eventType: 'VACATION',
        title: '8월 정기휴가',
        startDate: '2026-08-14',
        endDate: '2026-08-16',
        expectedExpense: 180000,
        notificationEnabled: true,
        autoVacationMode: true,
      },
    ],
    assetSummary: {
      monthly: {
        income: {
          amount: 900000,
          salaryAmount: 900000,
          salaryLabel: '일병 월급',
          otherIncomeAmount: 0,
          hasAdditionalIncome: false,
          changeRate: 0,
        },
        investment: {
          hasSecuritiesAccount: false,
          amount: 0,
          changeAmount: 0,
          changeRate: 0,
          monthlyPaymentTarget: 0,
        },
        spending: {
          amount: 238000,
          targetAmount: 150000,
        },
      },
      total: {
        totalAsset: 5200000,
        accounts: [
          {
            id: 1021,
            accountType: 'MILITARY_SAVINGS',
            bankName: 'KB국민은행',
            name: '장병내일준비적금',
            amount: 4400000,
          },
          {
            id: 1022,
            accountType: 'CHECKING',
            bankName: '신한은행',
            name: '나라사랑월급통장',
            amount: 800000,
          },
        ],
      },
      forecast: {
        totalAmount: 17600000,
        labels: ['8월', '9월', '10월', '11월', '12월', '현재'],
        expected: [520, 650, 790, 930, 1080, 1760],
        target: [520, 680, 850, 1030, 1220, 2000],
      },
    },
  },

  [DASHBOARD_PERSONAS.CORPORAL_BALANCED_PROFIT]: {
    profile: {
      userId: 103,
      nickname: '균형상병',
      rank: 'CORPORAL',
      rankName: '상병',
      investmentPreference: 'BALANCED',
    },
    dailyReport: {
      greeting: '이번 달 부수입과 투자 성과가 좋아요!',
      title: '오늘의 금융 AI 리포트',
    },
    financialDday: {
      financialDday: 55,
      actualDday: 70,
      financialDischargeDate: '2026-09-30',
      actualDischargeDate: '2026-10-15',
      achievementRate: 55.9,
      currentAsset: 1285,
      targetAmount: 2300,
    },
    missions: [
      completedMission(301, '오늘의 투자리포트 확인'),
      availableMission(302, '월 투자 목표 확인하기'),
      completedMission(303, '데일리 금융리포트 보기', 'DAILY'),
      availableMission(304, '데일리 시장리포트 보기', 'DAILY'),
    ],
    events: [
      {
        id: 301,
        userId: 103,
        eventType: 'PAYDAY',
        title: '월급날',
        startDate: '2026-08-10',
        endDate: '2026-08-10',
        expectedExpense: 0,
        notificationEnabled: true,
      },
      {
        id: 302,
        userId: 103,
        eventType: 'VACATION',
        title: '포상휴가',
        startDate: '2026-08-21',
        endDate: '2026-08-22',
        expectedExpense: 120000,
        notificationEnabled: true,
      },
      {
        id: 303,
        userId: 103,
        eventType: 'PROMOTION',
        title: '병장 진급',
        startDate: '2026-09-15',
        endDate: '2026-09-15',
        expectedExpense: 50000,
        notificationEnabled: true,
      },
      {
        id: 304,
        userId: 103,
        eventType: 'CUSTOM',
        title: '적금 만기 확인',
        startDate: '2026-09-28',
        endDate: '2026-09-28',
        expectedExpense: 0,
        notificationEnabled: false,
      },
    ],
    assetSummary: {
      monthly: {
        income: {
          amount: 1350000,
          salaryAmount: 1200000,
          salaryLabel: '상병 월급',
          otherIncomeAmount: 150000,
          hasAdditionalIncome: true,
          changeRate: 12.5,
        },
        investment: {
          hasSecuritiesAccount: true,
          amount: 2420000,
          changeAmount: 120000,
          changeRate: 5.2,
          monthlyPaymentTarget: 200000,
        },
        spending: {
          amount: 108000,
          targetAmount: 180000,
        },
      },
      total: {
        totalAsset: 12850000,
        accounts: [
          {
            id: 1031,
            accountType: 'MILITARY_SAVINGS',
            bankName: 'KB국민은행',
            name: '장병내일준비적금',
            amount: 7600000,
          },
          {
            id: 1032,
            accountType: 'CHECKING',
            bankName: '신한은행',
            name: '나라사랑월급통장',
            amount: 2830000,
          },
          {
            id: 1033,
            accountType: 'INVESTMENT',
            bankName: 'KB증권',
            name: '나라사랑종합증권',
            amount: 2420000,
          },
        ],
      },
      forecast: {
        totalAmount: 21100000,
        labels: ['5월', '6월', '7월', '8월', '9월', '현재'],
        expected: [980, 1060, 1150, 1285, 1430, 2110],
        target: [1020, 1120, 1230, 1360, 1510, 2300],
      },
    },
  },

  [DASHBOARD_PERSONAS.SERGEANT_AGGRESSIVE_LOSS]: {
    profile: {
      userId: 104,
      nickname: '전역앞병장',
      rank: 'SERGEANT',
      rankName: '병장',
      investmentPreference: 'AGGRESSIVE',
    },
    dailyReport: {
      greeting: '전역 전 투자 손실과 지출을 점검해보세요.',
      title: '오늘의 금융 AI 리포트',
    },
    financialDday: {
      financialDday: 59,
      actualDday: 51,
      financialDischargeDate: '2026-10-04',
      actualDischargeDate: '2026-09-26',
      achievementRate: 83.5,
      currentAsset: 1420,
      targetAmount: 1700,
    },
    missions: [
      completedMission(401, '오늘의 투자리포트 확인'),
      completedMission(402, '전역 목표 점검하기'),
      completedMission(403, '데일리 금융리포트 보기', 'DAILY'),
      completedMission(404, '데일리 시장리포트 보기', 'DAILY'),
    ],
    events: [
      {
        id: 401,
        userId: 104,
        eventType: 'VACATION',
        title: '말출',
        startDate: '2026-09-10',
        endDate: '2026-09-25',
        expectedExpense: 350000,
        notificationEnabled: true,
        autoVacationMode: true,
      },
      {
        id: 402,
        userId: 104,
        eventType: 'DISCHARGE',
        title: '전역',
        startDate: '2026-09-26',
        endDate: '2026-09-26',
        expectedExpense: 0,
        notificationEnabled: true,
      },
    ],
    assetSummary: {
      monthly: {
        income: {
          amount: 1500000,
          salaryAmount: 1500000,
          salaryLabel: '병장 월급',
          otherIncomeAmount: 0,
          hasAdditionalIncome: false,
          changeRate: 0,
        },
        investment: {
          hasSecuritiesAccount: true,
          amount: 4200000,
          changeAmount: -180000,
          changeRate: -4.1,
          monthlyPaymentTarget: 300000,
        },
        spending: {
          amount: 154000,
          targetAmount: 100000,
        },
      },
      total: {
        totalAsset: 14200000,
        accounts: [
          {
            id: 1041,
            accountType: 'MILITARY_SAVINGS',
            bankName: 'KB국민은행',
            name: '장병내일준비적금',
            amount: 7700000,
          },
          {
            id: 1042,
            accountType: 'CHECKING',
            bankName: '신한은행',
            name: '나라사랑월급통장',
            amount: 2300000,
          },
          {
            id: 1043,
            accountType: 'INVESTMENT',
            bankName: '한국투자증권',
            name: '종합투자계좌',
            amount: 4200000,
          },
        ],
      },
      forecast: {
        totalAmount: 16400000,
        labels: ['4월', '5월', '6월', '7월', '8월', '현재'],
        expected: [1120, 1210, 1310, 1380, 1420, 1640],
        target: [1150, 1270, 1390, 1510, 1600, 1700],
      },
    },
  },
}

export const DEFAULT_DASHBOARD_PERSONA = DASHBOARD_PERSONAS.PRIVATE_NEWCOMER
