import { WHAT_IF_TITLE } from './analysisHistory.mapper.js'
import { formatTenThousandWon, formatWon, toNumber, toPercent } from './format.js'

/**
 * SimulationResponse를 시뮬레이션 상세 화면 모델로 변환한다.
 *
 * 월급 배분은 기준 월급(`monthlySalary`) 대비 비중으로 계산하고,
 * 어디에도 배정되지 않은 금액을 '미배분'으로 채운다.
 */
export function mapWhatIfDetail(simulation, { monthlySalary, applied = false, title } = {}) {
  const salary = toNumber(monthlySalary)
  const saving = toNumber(simulation?.monthlySavingAmount)
  const investment = toNumber(simulation?.monthlyInvestmentAmount)
  const spending = toNumber(simulation?.monthlySpendingAmount)
  // 시드처럼 배분 합계가 월급을 넘는 데이터가 있어 음수로 내려가지 않게 막는다.
  const unassigned = Math.max(0, salary - (saving + investment + spending))
  const returnRate = toNumber(simulation?.annualReturnRate)

  return {
    id: simulation?.id,
    title: title || WHAT_IF_TITLE,
    applied,
    projectedAsset: formatTenThousandWon(simulation?.projectedAssetAtDischarge),
    targetAmount: formatTenThousandWon(simulation?.targetAmount),
    targetReturnRate: `${returnRate}%`,
    financialDischargeDate: String(simulation?.financialDischargeDate ?? '').replace(/-/g, '.'),
    baseSalary: salary ? formatTenThousandWon(salary) : '-',
    allocations: [
      { key: 'INVESTMENT', label: '투자', percent: toPercent(investment, salary), tone: 'olive' },
      { key: 'SAVING', label: '군적금', percent: toPercent(saving, salary), tone: 'green' },
      { key: 'SPENDING', label: '소비', percent: toPercent(spending, salary), tone: 'orange' },
      { key: 'UNASSIGNED', label: '미배분', percent: toPercent(unassigned, salary), tone: 'gray' },
    ],
    payments: [
      { label: '장병내일준비적금', value: formatWon(saving) },
      { label: '군적금 외 투자', value: formatWon(investment) },
      { label: '월 소비', value: formatWon(spending) },
      { label: '미 배분 금액', value: formatWon(unassigned) },
      { label: '목표 투자 수익', value: `${returnRate}%` },
    ],
  }
}
