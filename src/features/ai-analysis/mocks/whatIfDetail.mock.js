/** 시뮬레이션 상세 API가 나오기 전까지 화면 확인에 쓰는 시안 기준 데이터. */
export const whatIfDetailMock = {
  id: 5,
  title: 'AI 추천 자산 계획3',
  saved: true,
  projectedAsset: '1,854만원',
  targetAmount: '1,800만원',
  targetReturnRate: '5%',
  financialDischargeDate: '2027.11.17',
  baseSalary: '125만원',
  hasCalculationDetail: false,
  allocations: [
    { key: 'INVESTMENT', label: '투자', percent: 10, tone: 'olive' },
    { key: 'SAVING', label: '군적금', percent: 10, tone: 'green' },
    { key: 'SPENDING', label: '소비', percent: 20, tone: 'orange' },
    { key: 'UNASSIGNED', label: '미배분', percent: 50, tone: 'gray' },
  ],
  payments: [
    { label: '장병내일준비적금', value: '125,000원' },
    { label: '군적금 외 투자', value: '500,000원' },
    { label: '월 소비', value: '250,000원' },
    { label: '미 배분 금액', value: '375,000원' },
    { label: '예상 투자 연 수익률', value: '5%' },
  ],
}
