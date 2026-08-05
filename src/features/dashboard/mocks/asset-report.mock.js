export const assetReportMock = {
  summary: {
    totalAsset: 2325000,
    changeAmount: 120000,
    changeRate: 5.4,
    accounts: [
      { id: 1, name: '입출금 자산', amount: 1905000, type: 'asset' },
      { id: 2, name: '투자 자산', amount: 420000, type: 'investment' },
    ],
  },
  transactions: [
    {
      id: 1,
      date: '2026-08-05',
      title: '병장 월급',
      category: 'salary',
      categoryLabel: '급여',
      amount: 1905000,
      type: 'income',
    },
    {
      id: 2,
      date: '2026-08-05',
      title: '충성마트',
      category: 'px',
      categoryLabel: 'PX',
      amount: 18500,
      type: 'expense',
    },
    {
      id: 3,
      date: '2026-08-04',
      title: '국군복지단 식당',
      category: 'food',
      categoryLabel: '식비',
      amount: 8500,
      type: 'expense',
    },
    {
      id: 4,
      date: '2026-08-03',
      title: '올리브영',
      category: 'shopping',
      categoryLabel: '쇼핑',
      amount: 32000,
      type: 'expense',
    },
    {
      id: 5,
      date: '2026-08-02',
      title: '카카오 T',
      category: 'transport',
      categoryLabel: '교통',
      amount: 14600,
      type: 'expense',
    },
    {
      id: 6,
      date: '2026-08-01',
      title: '넷플릭스',
      category: 'leisure',
      categoryLabel: '여가',
      amount: 17000,
      type: 'expense',
    },
  ],
}

export async function getMockAssetReport() {
  return structuredClone(assetReportMock)
}
