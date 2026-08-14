import { ANALYSIS_RECORD_TYPES } from '@/features/ai-analysis/mappers/analysisHistory.mapper'

/** 목록 API 응답을 받지 못했을 때 화면을 유지하기 위한 폴백 데이터. */
export const analysisHistoryRecords = [
  {
    id: 6,
    type: ANALYSIS_RECORD_TYPES.AI_ANALYSIS,
    title: '오늘의 AI 소비 분석3',
    date: '2026.08.05',
    summary: '소비는 줄었고 투자 자산은 안정적으로 증가했어요.',
    applied: true,
    metrics: [
      { label: '이번 달 소비', value: '154,000원', change: { label: '8% 감소', tone: 'orange' } },
      { label: '투자 자산', value: '420,000원', change: { label: '15% 증가', tone: 'green' } },
    ],
    projectedAsset: '1,854만원',
  },
  {
    id: 5,
    type: ANALYSIS_RECORD_TYPES.WHAT_IF,
    title: 'AI 추천 자산 계획3',
    date: '2026.08.01',
    summary: '현재 자산 흐름을 기준으로 가장 적합한 계획이에요.',
    allocationRatios: [
      { label: '10%', tone: 'green' },
      { label: '40%', tone: 'olive' },
      { label: '20%', tone: 'orange' },
    ],
    projectedAsset: '1,854만원',
  },
  {
    id: 4,
    type: ANALYSIS_RECORD_TYPES.WHAT_IF,
    title: 'AI 추천 자산 계획2',
    date: '2026.07.31',
    summary: '현재 자산 흐름을 기준으로 가장 적합한 계획이에요.',
    allocationRatios: [
      { label: '10%', tone: 'green' },
      { label: '40%', tone: 'olive' },
      { label: '20%', tone: 'orange' },
    ],
    projectedAsset: '1,854만원',
  },
  {
    id: 3,
    type: ANALYSIS_RECORD_TYPES.WHAT_IF,
    title: 'AI 추천 자산 계획1',
    date: '2026.07.14',
    summary: '현재 자산 흐름을 기준으로 가장 적합한 계획이에요.',
    allocationRatios: [
      { label: '10%', tone: 'green' },
      { label: '40%', tone: 'olive' },
      { label: '20%', tone: 'orange' },
    ],
    projectedAsset: '1,854만원',
  },
  {
    id: 2,
    type: ANALYSIS_RECORD_TYPES.AI_ANALYSIS,
    title: '오늘의 AI 소비 분석2',
    date: '2026.07.05',
    summary: '소비는 줄었고 투자 자산은 안정적으로 증가했어요.',
    metrics: [
      { label: '이번 달 소비', value: '154,000원', change: { label: '8% 감소', tone: 'orange' } },
      { label: '투자 자산', value: '420,000원', change: { label: '15% 증가', tone: 'green' } },
    ],
    projectedAsset: '1,854만원',
  },
  {
    id: 1,
    type: ANALYSIS_RECORD_TYPES.AI_ANALYSIS,
    title: '오늘의 AI 소비 분석1',
    date: '2026.05.05',
    summary: '소비는 줄었고 투자 자산은 안정적으로 증가했어요.',
    metrics: [
      { label: '이번 달 소비', value: '154,000원', change: { label: '8% 감소', tone: 'orange' } },
      { label: '투자 자산', value: '420,000원', change: { label: '15% 증가', tone: 'green' } },
    ],
    projectedAsset: '1,854만원',
  },
]
