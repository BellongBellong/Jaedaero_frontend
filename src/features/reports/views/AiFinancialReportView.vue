<script setup>
import { onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { useMissionCompletion } from '@/features/missions/composables/useMissionCompletion'

const route = useRoute()
const router = useRouter()
const { completeMissionAfterLoad } = useMissionCompletion(route, router)

const marketRows = [
  { label: '코스피', value: '2,740.12', change: '+1.34%', tone: 'positive' },
  { label: '코스피', value: '2,740.12', change: '+1.34%', tone: 'positive' },
  { label: '미국채 10년', value: '4.31%', change: '-0.05%', tone: 'negative' },
  { label: '원/달러', value: '1,318원', change: '-0.05%', tone: 'negative' },
]

const productRows = [
  { label: '장병내일준비적금', value: '5.0%', change: '+1.34%', tone: 'positive' },
  { label: '군인공제회 목돈급여', value: '5.2%', change: '+0.1%p', tone: 'positive' },
  { label: '미국채 10년', value: '4.31%', change: '변동없음', tone: 'neutral' },
]

const recommendedActions = [
  {
    title: '그냥 서브타이틀',
    badge: '추천',
    tone: 'positive',
    description:
      '현재 시중 최고 금리 5.2% 제공. 여유 자금을 추가 납입하면 전역 자산 +약 32만원이 기대됩니다',
  },
  {
    title: '그냥 서브타이틀',
    badge: '참고',
    tone: 'neutral',
    description:
      '현재 시중 최고 금리 5.2% 제공. 여유 자금을 추가 납입하면 전역 자산 +약 32만원 기대.',
  },
  {
    title: '통신비 플랜 최적화',
    badge: '참고',
    tone: 'neutral',
    description: '군인 할인 통신 플랜으로 월 최대 8,000원 절약 가능.',
  },
]

onMounted(() => {
  completeMissionAfterLoad()
})
</script>

<template>
  <section class="financial-report-screen">
    <article class="report-panel market-panel">
      <header class="report-panel__header">
        <div>
          <div class="report-title-row">
            <h2>오늘의 AI 투자 리포트</h2>
            <span class="beta-badge">BETA</span>
          </div>
          <p>2026. 07. 28 기준</p>
        </div>
      </header>

      <dl class="data-list">
        <div
          v-for="(row, index) in marketRows"
          :key="index"
          class="data-list__row"
        >
          <dt>{{ row.label }}</dt>
          <dd>
            <span>{{ row.value }}</span>
            <em :class="`status-pill--${row.tone}`">{{ row.change }}</em>
          </dd>
        </div>
      </dl>
    </article>

    <article class="report-panel product-panel">
      <h2 class="product-panel__title">
        <span aria-hidden="true">🏅</span>
        군 금융 상품 동향
      </h2>

      <dl class="data-list">
        <div
          v-for="row in productRows"
          :key="row.label"
          class="data-list__row"
        >
          <dt>{{ row.label }}</dt>
          <dd>
            <span>{{ row.value }}</span>
            <em :class="`status-pill--${row.tone}`">{{ row.change }}</em>
          </dd>
        </div>
      </dl>
    </article>

    <section
      class="action-section"
      aria-labelledby="action-title"
    >
      <h2 id="action-title">
        AI 추천 액션
      </h2>

      <div class="action-list">
        <article
          v-for="(action, index) in recommendedActions"
          :key="index"
          class="action-card"
        >
          <span
            class="action-card__icon"
            aria-hidden="true"
          >🏅</span>
          <div>
            <div class="action-card__title-row">
              <h3>{{ action.title }}</h3>
              <span :class="`status-pill--${action.tone}`">{{ action.badge }}</span>
            </div>
            <p>{{ action.description }}</p>
          </div>
        </article>
      </div>
    </section>
  </section>
</template>

<style scoped>
.financial-report-screen {
  display: flex;
  min-height: 100%;
  flex-direction: column;
  gap: 10px;
  padding: 10px 20px 40px;
  color: var(--gray-900);
}

.report-panel {
  padding: 21px;
  border: 1px solid rgb(255 255 255 / 90%);
  border-radius: 24px;
  background: rgb(255 255 255 / 50%);
}

.report-panel__header h2,
.product-panel__title,
.action-section > h2,
.action-card h3 {
  font-family: var(--font-body);
}

.report-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.report-title-row h2 {
  color: var(--gray-600);
  font-size: 14px;
  font-weight: var(--weight-bold);
  line-height: 1.5;
}

.report-panel__header p {
  padding-top: 4px;
  color: #888;
  font-size: 14px;
  line-height: 1.5;
}

.beta-badge,
.status-pill--positive,
.status-pill--negative,
.status-pill--neutral {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 2px 10px;
  border-radius: var(--radius-full);
  font-size: 12px;
  font-style: normal;
  font-weight: var(--weight-bold);
  line-height: 1.5;
  white-space: nowrap;
}

.beta-badge {
  background: var(--olive-100);
  color: var(--olive-500);
}

.status-pill--positive {
  background: var(--green-100);
  color: #22c55e;
}

.status-pill--negative {
  background: var(--orange-50);
  color: var(--orange-600);
}

.status-pill--neutral {
  background: var(--gray-200);
  color: var(--gray-600);
}

.data-list {
  margin-top: 4px;
}

.data-list__row {
  display: flex;
  min-height: 42px;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--ui-light-gray);
  font-size: 12px;
  line-height: 1.5;
}

.data-list__row:last-child {
  border-bottom: 0;
}

.data-list dt {
  font-weight: var(--weight-bold);
}

.data-list dd {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--gray-600);
  font-size: 13px;
  font-weight: var(--weight-semibold);
}

.product-panel__title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: var(--weight-bold);
  line-height: 1.5;
}

.product-panel__title span {
  width: 20px;
  font-size: 18px;
}

.product-panel .data-list {
  margin-top: 12px;
}

.action-section {
  margin-top: 2px;
}

.action-section > h2 {
  font-size: 15px;
  font-weight: var(--weight-bold);
  line-height: 1.5;
}

.action-list {
  display: grid;
  gap: 10px;
  padding-top: 12px;
}

.action-card {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  padding: 17px;
  border: 1px solid rgb(255 255 255 / 80%);
  border-radius: 22px;
  background: var(--white);
  box-shadow: 0 2px 8px rgb(0 0 0 / 5%);
}

.action-card__icon {
  width: 20px;
  padding-top: 2px;
  font-size: 20px;
  line-height: 28px;
}

.action-card > div {
  min-width: 0;
  flex: 1;
}

.action-card__title-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.action-card h3 {
  color: var(--gray-600);
  font-size: 14px;
  font-weight: var(--weight-bold);
  line-height: 1.5;
}

.action-card p {
  padding-top: 4px;
  color: var(--gray-600);
  font-size: 12px;
  line-height: 1.5;
}
</style>
