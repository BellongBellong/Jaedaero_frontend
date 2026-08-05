<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'

import analysisIcon from '@/assets/ai-coach/analysis.svg'
import coachCharacter from '@/assets/ai-coach/coach-character.svg'
import glidepathImage from '@/assets/ai-coach/glidepath.svg'
import historyIcon from '@/assets/ai-coach/history.svg'
import whatIfIcon from '@/assets/ai-coach/what-if.svg'
import { useOnboardingStore } from '@/features/onboarding/stores/onboarding.store'

const onboarding = useOnboardingStore()

const nickname = computed(() => onboarding.form.nickname || '윤호')

const marketRows = [
  { label: '코스피', value: '2,740.12', change: '+1.34%', tone: 'positive' },
  { label: '미국채 10년', value: '4.31%', change: '-0.05%', tone: 'negative' },
  { label: '원/달러', value: '1,318', change: '-0.05%', tone: 'negative' },
]

const analysisMenus = [
  {
    label: 'AI 분석',
    icon: analysisIcon,
    to: { name: 'ai-asset-analysis-result' },
  },
  {
    label: 'what if\n시뮬레이션',
    icon: whatIfIcon,
    to: { name: 'what-if-simulation' },
  },
  {
    label: '분석 기록',
    icon: historyIcon,
    to: { name: 'ai-financial-report' },
  },
]
</script>

<template>
  <section class="ai-coach-screen">
    <div class="ai-coach-screen__content">
      <header class="coach-intro">
        <h2>
          지금 {{ nickname }}님에게 필요한<br>
          금융 행동은 무엇일까요?
        </h2>
      </header>

      <article class="report-card">
        <img
          class="report-card__character"
          :src="coachCharacter"
          alt=""
          aria-hidden="true"
        >

        <div class="report-card__body">
          <div class="report-card__heading">
            <strong>오늘의 AI 투자 리포트</strong>
            <span>BETA</span>
          </div>
          <p class="report-card__date">
            2026. 07. 28 기준
          </p>

          <dl class="report-metrics">
            <div
              v-for="row in marketRows"
              :key="row.label"
              class="report-metrics__row"
            >
              <dt>{{ row.label }}</dt>
              <dd>
                <span>{{ row.value }}</span>
                <em :class="`metric-change--${row.tone}`">{{ row.change }}</em>
              </dd>
            </div>
          </dl>

          <p class="report-insight">
            <span aria-hidden="true">💡</span>
            군인공제회 금리가 <strong>5.2%</strong>로 시중은행 대비 유리한 환경이에요. 추가 납입을
            검토해보세요.
          </p>
        </div>

        <RouterLink
          class="report-card__link"
          :to="{ name: 'ai-financial-report' }"
        >
          전체 리포트 보기
          <span aria-hidden="true">›</span>
        </RouterLink>
      </article>

      <section
        class="analysis-section"
        aria-labelledby="analysis-menu-title"
      >
        <h3 id="analysis-menu-title">
          AI 분석 메뉴
        </h3>
        <nav
          class="analysis-menu"
          aria-label="AI 분석 메뉴"
        >
          <RouterLink
            v-for="menu in analysisMenus"
            :key="menu.label"
            class="analysis-menu__item"
            :to="menu.to"
          >
            <img
              :src="menu.icon"
              alt=""
              aria-hidden="true"
            >
            <span>{{ menu.label }}</span>
          </RouterLink>
        </nav>
      </section>

      <RouterLink
        class="glidepath-card"
        :to="{ name: 'rebalancing' }"
      >
        <h3>적립식투자 가이드</h3>
        <div class="glidepath-card__summary">
          <div>
            <span class="glidepath-card__eyebrow">현재 단계</span>
            <strong>4단계 <em>집중 납입기</em></strong>
            <span class="glidepath-card__badge">전역 D-54</span>
          </div>
          <img
            :src="glidepathImage"
            alt=""
            aria-hidden="true"
          >
        </div>
        <div class="glidepath-card__footer">
          <div class="risk-bar">
            <div class="risk-bar__labels">
              <span>안전 85%</span>
              <span>위험 15%</span>
            </div>
            <div
              class="risk-bar__track"
              aria-hidden="true"
            >
              <span />
              <span />
            </div>
          </div>
          <span class="glidepath-card__link">
            투자 가이드 보기
            <b aria-hidden="true">›</b>
          </span>
        </div>
      </RouterLink>
    </div>
  </section>
</template>

<style scoped>
.ai-coach-screen {
  min-height: 100%;
  padding: 10px 20px 40px;
  color: var(--gray-900);
}

.ai-coach-screen__content {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.coach-intro {
  display: flex;
  min-height: 76px;
  align-items: center;
  padding: 10px 20px;
}

.coach-intro h2 {
  font-family: var(--font-body);
  font-size: 20px;
  font-weight: var(--weight-bold);
  line-height: 1.5;
}

.report-card {
  position: relative;
  display: flex;
  min-height: 303px;
  flex-direction: column;
  overflow: visible;
  border-radius: 28px;
  background: var(--white);
}

.report-card__character {
  position: absolute;
  z-index: 1;
  top: -38px;
  right: 8px;
  width: 92px;
  height: 101px;
  object-fit: contain;
  pointer-events: none;
}

.report-card__body {
  flex: 1;
  padding: 20px 20px 16px;
}

.report-card__heading {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--gray-600);
  font-size: 14px;
  line-height: 1.5;
}

.report-card__heading strong {
  font-weight: var(--weight-bold);
}

.report-card__heading span {
  padding: 2px 10px;
  border-radius: var(--radius-full);
  background: var(--olive-100);
  color: var(--olive-500);
  font-size: 12px;
  font-weight: var(--weight-bold);
}

.report-card__date {
  padding-top: 4px;
  color: #888;
  font-size: 14px;
  line-height: 1.5;
}

.report-metrics {
  display: grid;
  gap: 10px;
  padding: 10px 10px 0;
}

.report-metrics__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 12px;
  line-height: 1.5;
}

.report-metrics dt {
  font-weight: var(--weight-bold);
}

.report-metrics dd {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--gray-900);
  font-size: 13px;
  font-weight: var(--weight-semibold);
}

.report-metrics em {
  min-width: 52px;
  padding: 2px 10px;
  border-radius: var(--radius-full);
  font-size: 12px;
  font-style: normal;
  font-weight: var(--weight-bold);
  text-align: center;
}

.metric-change--positive {
  background: var(--green-100);
  color: #22c55e;
}

.metric-change--negative {
  background: var(--orange-50);
  color: var(--orange-600);
}

.metric-change--neutral {
  background: var(--gray-200);
  color: var(--gray-600);
}

.report-insight {
  min-height: 62px;
  padding: 12px;
  margin-top: 10px;
  border-radius: 14px;
  background: var(--green-100);
  color: var(--gray-600);
  font-size: 12px;
  line-height: 1.6;
}

.report-insight strong {
  color: var(--green-700);
  font-weight: var(--weight-bold);
}

.report-card__link {
  display: flex;
  min-height: 40px;
  align-items: center;
  justify-content: flex-end;
  gap: 2px;
  padding: 10px;
  color: var(--olive-400);
  font-size: 12px;
  line-height: 1.3;
}

.report-card__link span,
.glidepath-card__link b {
  font-size: 22px;
  font-weight: var(--weight-regular);
  line-height: 0.7;
}

.analysis-section h3 {
  padding: 0 10px;
  color: var(--gray-600);
  font-family: var(--font-body);
  font-size: 14px;
  font-weight: var(--weight-bold);
  line-height: 1.5;
}

.analysis-menu {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 13px;
  margin-top: 8px;
}

.analysis-menu__item {
  display: flex;
  width: 100px;
  height: 100px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border: 1px solid rgb(255 255 255 / 82%);
  border-radius: 50%;
  background: radial-gradient(circle, rgb(255 255 255 / 18%) 0%, rgb(255 255 255 / 82%) 100%);
}

.analysis-menu__item img {
  width: 50px;
  height: 50px;
  object-fit: contain;
}

.analysis-menu__item span {
  color: #888;
  font-size: 12px;
  line-height: 1.3;
  text-align: center;
  white-space: pre-line;
}

.glidepath-card {
  display: flex;
  min-height: 204px;
  flex-direction: column;
  gap: 10px;
  padding: 21px;
  border: 1px solid rgb(255 255 255 / 90%);
  border-radius: 24px;
  background: rgb(255 255 255 / 50%);
}

.glidepath-card h3 {
  color: var(--gray-600);
  font-family: var(--font-body);
  font-size: 14px;
  font-weight: var(--weight-bold);
  line-height: 1.5;
}

.glidepath-card__summary {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}

.glidepath-card__summary > div {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.glidepath-card__eyebrow {
  color: var(--gray-600);
  font-size: 12px;
  line-height: 1.5;
}

.glidepath-card__summary strong {
  color: var(--gray-900);
  font-size: 17px;
  line-height: 1.5;
}

.glidepath-card__summary strong em {
  color: var(--green-700);
  font-style: normal;
}

.glidepath-card__badge {
  padding: 2px 10px;
  border-radius: var(--radius-full);
  background: var(--olive-100);
  color: var(--olive-500);
  font-size: 12px;
  font-weight: var(--weight-bold);
}

.glidepath-card__summary img {
  width: 116px;
  height: 68px;
  object-fit: contain;
}

.glidepath-card__footer {
  display: flex;
  min-height: 40px;
  align-items: flex-end;
  justify-content: space-between;
  padding: 10px;
}

.risk-bar {
  width: 131px;
}

.risk-bar__labels {
  display: flex;
  justify-content: space-between;
  color: var(--gray-600);
  font-size: 12px;
  line-height: 1.3;
}

.risk-bar__track {
  display: flex;
  height: 14px;
  gap: 5px;
  margin-top: 1px;
}

.risk-bar__track span:first-child {
  width: 106px;
  background: linear-gradient(94deg, var(--yellow-300), var(--green-600));
}

.risk-bar__track span:last-child {
  width: 20px;
  background: linear-gradient(90deg, var(--orange-50), var(--orange-500));
}

.glidepath-card__link {
  display: flex;
  align-items: center;
  color: var(--olive-400);
  font-size: 12px;
  font-weight: var(--weight-bold);
  line-height: 1.3;
}

@media (max-width: 370px) {
  .analysis-menu {
    gap: 8px;
  }

  .analysis-menu__item {
    width: 92px;
    height: 92px;
  }
}

@media (prefers-reduced-motion: no-preference) {
  .analysis-menu__item,
  .glidepath-card,
  .report-card__link {
    transition: transform var(--duration-fast) var(--ease-default);
  }

  .analysis-menu__item:active,
  .glidepath-card:active,
  .report-card__link:active {
    transform: scale(0.98);
  }
}
</style>
