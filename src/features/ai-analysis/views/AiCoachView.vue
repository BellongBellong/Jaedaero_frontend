<script setup>
import { computed, onMounted } from 'vue'
import { RouterLink, useRouter } from 'vue-router'

import analysisIcon from '../../../assets/features/ai-coach/analysis.svg'
import coachCharacter from '../../../assets/features/ai-coach/coach-character.svg'
import glidepathImage from '../../../assets/features/ai-coach/glidepath.svg'
import historyIcon from '../../../assets/features/ai-coach/history.svg'
import whatIfIcon from '../../../assets/features/ai-coach/what-if.svg'
import nextArrowIcon from '@/assets/icons/nextArrowIcon.svg'
import DetailLinkButton from '@/common/components/common/DetailLinkButton.vue'
import { useTodayMarketIndicators } from '@/features/market-report/composables/useTodayMarketIndicators'
import { useTodayMarketReport } from '@/features/market-report/composables/useTodayMarketReport'
import {
  formatReportDate,
  mapMarketIndicators,
} from '@/features/market-report/mappers/marketReport.mapper'
import { useCurrentUserNickname } from '@/features/my-page/composables/useCurrentUserNickname'

const router = useRouter()
const { honorificNickname, loadNickname } = useCurrentUserNickname()

const { report, error, load } = useTodayMarketReport()
const {
  report: indicatorReport,
  error: indicatorsError,
  load: loadIndicators,
} = useTodayMarketIndicators()
const marketRows = computed(() => mapMarketIndicators(indicatorReport.value?.indicators))
const isReportReady = computed(() => Boolean(report.value && indicatorReport.value))
const reportLoadError = computed(() => error.value || indicatorsError.value)

function retryReport() {
  load()
  loadIndicators()
}

function openFinancialReport() {
  router.push({ name: 'ai-financial-report' })
}
const reportDate = computed(() => {
  const formattedDate = formatReportDate(report.value)
  return formattedDate.replace(/\s\d{1,2}시(?=\s기준)/, '')
})
const reportSummary = computed(() => report.value?.summary || '')

onMounted(() => {
  loadNickname()
  load()
  loadIndicators()
})

const analysisMenus = [
  {
    label: 'AI 소비 분석',
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
    to: { name: 'analysis-history' },
  },
]
</script>

<template>
  <section class="ai-coach-screen">
    <div class="ai-coach-screen__content">
      <header class="coach-intro">
        <h2>
          지금 {{ honorificNickname }}에게 필요한<br>
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

        <template v-if="isReportReady">
          <div class="report-card__body">
            <div class="report-card__heading">
              <strong>오늘의 AI 시장 리포트</strong>
              <span>BETA</span>
            </div>
            <p class="report-card__date">
              {{ reportDate }}
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
              <span class="report-insight__label">
                <span
                  class="report-insight__icon"
                  aria-hidden="true"
                >💡</span>
                AI 요약
              </span>
              {{ reportSummary }}
            </p>
          </div>

          <DetailLinkButton
            class="report-card__link"
            @click="openFinancialReport"
          >
            전체 리포트 보기
          </DetailLinkButton>
        </template>

        <div
          v-else-if="reportLoadError"
          class="report-card__load-error"
          role="status"
        >
          시장 리포트를 불러오지 못했어요.
          <button
            type="button"
            @click="retryReport"
          >
            다시 시도
          </button>
        </div>

        <div
          v-else
          class="report-card__skeleton"
          role="status"
          aria-label="오늘의 AI 시장 리포트를 불러오는 중"
        >
          <span class="report-card__skeleton-line report-card__skeleton-line--title" />
          <span class="report-card__skeleton-line report-card__skeleton-line--date" />
          <div class="report-card__skeleton-metrics">
            <span
              v-for="index in 4"
              :key="index"
              class="report-card__skeleton-line report-card__skeleton-line--metric"
            />
          </div>
          <span class="report-card__skeleton-summary" />
        </div>
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
        :to="{ name: 'investment-guide' }"
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
            <img
              class="glidepath-card__chevron"
              :src="nextArrowIcon"
              alt=""
              aria-hidden="true"
            >
          </span>
        </div>
      </RouterLink>
    </div>
  </section>
</template>

<style scoped>
.ai-coach-screen {
  min-height: 100%;
  padding: 10px 20px calc(var(--page-bottom-navigation-space) + var(--safe-area-bottom) + 40px);
  color: var(--gray-900);
}

.ai-coach-screen__content {
  display: flex;
  flex-direction: column;
  gap: 10px;
  /*
    리포트 카드의 빛번짐(::before)이 z-index: -1로 카드 뒤에 깔린다.
    여기서 스태킹 컨텍스트를 만들지 않으면 그 레이어가 .app-page의
    불투명 배경 뒤까지 내려가서 아예 안 보인다.
  */
  isolation: isolate;
}

.coach-intro {
  display: flex;
  min-height: 76px;
  align-items: center;
  padding: 18px 0 2px;
}

.coach-intro h2 {
  font-family: var(--font-body);
  font-size: 20px;
  font-weight: var(--weight-bold);
  line-height: 1.5;
}

/*
  테두리를 도는 각도. conic-gradient의 from을 애니메이션하려면
  브라우저가 이 값을 색이 아닌 '각도'로 보간할 줄 알아야 한다.
  @property 없이는 custom property가 이산값이라 뚝뚝 끊긴다.

  inherits: true여야 ::before/::after가 같은 각도를 물려받는다.
  애니메이션이 하나뿐이므로 세 겹의 위상이 어긋날 수가 없다.
*/
@property --report-border-angle {
  syntax: '<angle>';
  initial-value: 0deg;
  inherits: true;
}

/*
  AI 리포트 카드.

  하드한 테두리 선을 두지 않는다. 선이 있으면 그것만 따로 도드라지고
  뒤의 빛과 분리돼 보인다. 대신 카드 면이 그대로 빛으로 번져 나가게 한다 —
  발광 가장자리(::after)가 테두리 역할을 겸한다.

  두 겹이 '같은' conic-gradient를 쓴다. 색 배치가 각도별로 완전히
  일치해야 가까운 빛과 먼 빛의 밝은 자리가 겹쳐서 하나로 읽힌다.
  각도 변수 하나로 묶여 있어 위상이 어긋날 수가 없다.

    ::after  가장자리  흐림 12px  0.85   ← 테두리 역할
    ::before 후광      흐림 26px  0.36~0.56

  도형을 돌리지 않고 그라데이션의 각도만 돌린다. 그래야 모서리 둥근
  사각형에서도 귀퉁이가 쓸고 지나가는 게 보이지 않는다.
*/
.report-card {
  /*
    두 겹이 공유하는 색 배치. 한 곳에서만 고친다.
    원래 색(#e37255 / #ffe26d / #009dff)의 색상은 유지하되 명도를 올렸다.
    어두운 원색을 흐리면 탁하게 번져서 그늘처럼 보인다.
    네온은 빛이라 밝은 쪽에서 출발해야 한다.
  */
  --report-glow-stops: #ff8f6e 0%, #ffe26d 30%, #4db8ff 62%, #ff8f6e 100%;

  position: relative;
  display: flex;
  min-height: 303px;
  flex-direction: column;
  overflow: visible;
  border-radius: 28px;
  background: linear-gradient(145deg, rgb(255 255 255 / 99%), rgb(255 255 255 / 96%));
  /*
    빛이 위아래 글씨를 침범하지 않도록 여백을 확보한다.
    후광은 카드 밖으로 번지는 게 목적이라, 카드 자리만큼만 잡으면
    이웃 텍스트 위로 올라탄다.
  */
  margin: 20px 0 26px;
  /*
    그림자를 쓰지 않는다. 어두운 드롭섀도가 깔리면 빛이 아니라
    그늘로 읽혀서 네온 느낌이 죽는다. 경계는 헤어라인으로만 잡는다.
  */
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / 95%),
    0 0 0 1px rgb(60 50 75 / 6%);
  animation: report-card-spin 4.8s linear infinite;
}

/*
  발광 가장자리. 카드 면이 불투명해 가운데를 덮으므로
  둘레로 새어 나온 빛만 보이고, 그게 테두리처럼 읽힌다.

  폴백 각도 필수. @property 미지원 브라우저(iOS 16.3 이하)에서는
  이 값이 등록되지 않아 var()가 비고, 각도가 없으면 conic-gradient
  전체가 무효가 되어 빛이 통째로 사라진다. 회전만 멈추게 한다.
*/
.report-card::after {
  content: '';
  position: absolute;
  z-index: -1;
  /* 카드에 바짝 붙인다 — 멀리 밀면 위아래 글씨를 침범한다 */
  inset: -6px;
  border-radius: 34px;
  background: conic-gradient(from var(--report-border-angle, 0deg), var(--report-glow-stops));
  /* saturate로 채도를 올려 파스텔이 아니라 네온으로 읽히게 한다 */
  filter: blur(13px) saturate(150%);
  opacity: 0.9;
  pointer-events: none;
}

/*
  후광 — 카드 바깥으로 멀리 퍼진다.
  원으로 두는 이유는 여기만 transform으로 돌리기 때문이다. 가장 크고
  가장 흐린 레이어라, 매 프레임 블러를 다시 계산하는 대신 한 번 만든
  레이어를 회전시키는 편이 싸다. 원은 돌려도 실루엣이 변하지 않는다.
*/
.report-card::before {
  content: '';
  position: absolute;
  z-index: -1;
  top: 50%;
  left: 50%;
  width: 366px;
  height: 366px;
  margin: -183px 0 0 -183px;
  border-radius: 50%;
  background: conic-gradient(from 0deg, var(--report-glow-stops));
  filter: blur(24px) saturate(140%);
  opacity: 0.5;
  pointer-events: none;
  will-change: transform;
  animation:
    report-card-orbit 4.8s linear infinite,
    report-card-bloom-breathe 3.2s ease-in-out infinite;
}

@keyframes report-card-spin {
  to {
    --report-border-angle: 360deg;
  }
}

@keyframes report-card-orbit {
  to {
    transform: rotate(1turn);
  }
}

@keyframes report-card-bloom-breathe {
  0%,
  100% {
    opacity: 0.42;
  }

  50% {
    opacity: 0.64;
  }
}

@media (prefers-reduced-motion: reduce) {
  .report-card,
  .report-card::before {
    animation: none;
  }

  .report-card::before {
    opacity: 0.42;
  }
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
  padding: 20px 20px 10px;
}

.report-card__skeleton {
  display: flex;
  min-height: 303px;
  flex: 1;
  flex-direction: column;
  padding: 24px 20px 18px;
}

.report-card__skeleton-line,
.report-card__skeleton-summary {
  position: relative;
  display: block;
  overflow: hidden;
  border-radius: var(--radius-full);
  background: rgb(230 235 231 / 82%);
}

.report-card__skeleton-line::after,
.report-card__skeleton-summary::after {
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, transparent, rgb(255 255 255 / 72%), transparent);
  content: '';
  transform: translateX(-100%);
  animation: report-skeleton-shimmer 1.2s ease-in-out infinite;
}

.report-card__skeleton-line--title {
  width: 152px;
  height: 17px;
}

.report-card__skeleton-line--date {
  width: 98px;
  height: 12px;
  margin-top: 10px;
}

.report-card__skeleton-metrics {
  display: grid;
  gap: 15px;
  margin-top: 24px;
}

.report-card__skeleton-line--metric {
  width: 100%;
  height: 18px;
}

.report-card__skeleton-summary {
  width: 100%;
  height: 64px;
  margin-top: auto;
  border-radius: 14px;
}

.report-card__load-error {
  display: grid;
  min-height: 303px;
  place-content: center;
  gap: 12px;
  padding: 24px;
  color: var(--gray-600);
  font-size: 13px;
  text-align: center;
}

.report-card__load-error button {
  padding: 8px 12px;
  border-radius: var(--radius-full);
  background: var(--green-100);
  color: var(--green-700);
  font-weight: var(--weight-bold);
}

@keyframes report-skeleton-shimmer {
  to {
    transform: translateX(100%);
  }
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
  font-size: 12px;
  line-height: 1.5;
}

.report-metrics {
  display: grid;
  gap: 12px;
  padding: 16px 0 0;
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
  color: #757575;
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
  margin-top: 14px;
  border-radius: 14px;
  background: var(--green-100);
  color: var(--gray-600);
  font-size: 11px;
  line-height: 1.6;
}

.report-insight strong {
  color: var(--green-700);
  font-weight: var(--weight-bold);
}

.report-insight__label {
  display: flex;
  align-items: center;
  gap: 4px;
  padding-bottom: 2px;
  color: #757575;
  font-size: 11px;
  font-weight: var(--weight-bold);
}

.report-insight__icon {
  font-size: 12px;
  line-height: 1;
}

.report-card__link {
  display: flex;
  min-height: 32px;
  align-items: center;
  justify-content: flex-end;
  gap: 4px;
  padding: 4px 20px 8px 10px;
  color: var(--olive-400);
  font-size: 11px;
  line-height: 1.3;
}

.report-card__chevron,
.glidepath-card__chevron {
  display: block;
  width: 7px;
  height: 11px;
  object-fit: contain;
  filter: grayscale(1) opacity(0.62);
}

.analysis-section {
  padding-top: 10px;
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
  gap: 6px;
  overflow: hidden;
  border: 1px solid rgb(255 255 255 / 82%);
  border-radius: 50%;
  background: radial-gradient(circle, rgb(255 255 255 / 18%) 0%, rgb(255 255 255 / 82%) 100%);
}

.analysis-menu__item img {
  width: 36px;
  height: 36px;
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
  gap: 6px;
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
