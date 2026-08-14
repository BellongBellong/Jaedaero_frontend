<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import arrowRightIcon from '@/assets/ai-analysis/arrowRightIcon.svg'
import arrowUpIcon from '@/assets/ai-analysis/arrowUpIcon.svg'
import causeInfoIcon from '@/assets/ai-analysis/causeInfoIcon.svg'
import analysisGlow from '@/assets/ai-coach/analysis-glow.svg'
import coachCharacter from '@/assets/ai-coach/coach-character.svg'
import backArrowIcon from '@/assets/icons/backArrowIcon.svg'
import {
  applyAiStrategy,
  createAiAnalysis,
  getAiAnalysis,
} from '@/features/ai-analysis/api/aiAnalysis.api'
import { useOnboardingStore } from '@/features/onboarding/stores/onboarding.store'

const MINIMUM_ANALYZING_DURATION = 2600

const DONUT_RADIUS = 42
const DONUT_CIRCUMFERENCE = 2 * Math.PI * DONUT_RADIUS
const DONUT_SEGMENT_GAP = 3

// 피그마 AI 분석 도안 기준 카테고리 이모지·타일 배경·막대 색상.
const SPENDING_CATEGORY_STYLES = {
  FOOD: { emoji: '🍔', tile: 'var(--category-food-light)', color: 'var(--category-food-main)' },
  PX: { emoji: '🪖', tile: 'var(--category-px-light)', color: 'var(--category-px-main)' },
  SHOPPING: {
    emoji: '🛍️',
    tile: 'var(--category-shopping-light)',
    color: 'var(--category-shopping-main)',
  },
  LEISURE: {
    emoji: '🎬',
    tile: 'var(--category-leisure-light)',
    color: 'var(--category-leisure-main)',
  },
  ETC: { emoji: '📦', tile: 'var(--gray-100)', color: 'var(--gray-400)' },
}

const FALLBACK_CATEGORY_STYLE = { emoji: '📦', tile: 'var(--gray-100)', color: 'var(--gray-400)' }

const CAUSE_STYLES = {
  SPENDING_INCREASE: { emoji: '📈', background: 'var(--category-food-light)' },
  RECURRING_PAYMENT_CHECK: { emoji: '🔁', background: 'var(--category-leisure-light)' },
  SAVING_HABIT: { emoji: '💵', background: 'var(--category-salary-light)' },
  SPENDING_STABLE: { emoji: '✅', background: 'var(--green-100)' },
}

const CAUSE_TAGS = {
  SPENDING_INCREASE: { label: '주의', className: 'tag--caution' },
  RECURRING_PAYMENT_CHECK: { label: '확인 필요', className: 'tag--check' },
  SAVING_HABIT: { label: '좋아요', className: 'tag--good' },
  SPENDING_STABLE: { label: '안정', className: 'tag--good' },
}

const route = useRoute()
const router = useRouter()
const onboarding = useOnboardingStore()

const phase = ref('analyzing')
const analysis = ref(null)
const errorMessage = ref('')

const applyState = ref('idle')
const applyErrorMessage = ref('')

const nickname = computed(() => onboarding.form.nickname || '윤호')

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

async function runAnalysis() {
  phase.value = 'analyzing'
  errorMessage.value = ''
  applyState.value = 'idle'
  applyErrorMessage.value = ''

  try {
    const analysisId = route.params.analysisId
    const response = analysisId
      ? await getAiAnalysis(analysisId)
      : (
          await Promise.all([
            createAiAnalysis({ simulationId: null }),
            delay(MINIMUM_ANALYZING_DURATION),
          ])
        )[0]
    analysis.value = response
    phase.value = 'result'
  } catch {
    errorMessage.value = 'AI 분석 결과를 불러오지 못했어요. 잠시 후 다시 시도해주세요.'
    phase.value = 'error'
  }
}

onMounted(runAnalysis)

function formatWon(value) {
  return `${Number(value || 0).toLocaleString('ko-KR')}원`
}

function formatManwon(value) {
  return `${Math.round(Number(value || 0) / 10_000).toLocaleString('ko-KR')}만원`
}

function formatPeriodDate(value) {
  const date = new Date(`${value}T00:00:00`)
  if (Number.isNaN(date.getTime())) return ''

  return `${date.getMonth() + 1}월 ${date.getDate()}일`
}

function formatFinancialDate(value) {
  if (!value) return '-'
  return String(value).replace(/-/g, '.')
}

function daysBetween(from, to) {
  if (!from || !to) return null
  const fromDate = new Date(`${from}T00:00:00`)
  const toDate = new Date(`${to}T00:00:00`)
  if (Number.isNaN(fromDate.getTime()) || Number.isNaN(toDate.getTime())) return null

  return Math.round((toDate - fromDate) / 86_400_000)
}

function formatFinancialDateChange(strategyDate, currentDate) {
  const difference = daysBetween(strategyDate, currentDate)
  if (difference == null) return '-'
  if (difference > 0) return `${difference}일 앞당김`
  if (difference < 0) return `${Math.abs(difference)}일 늦어짐`
  return '동일한 날짜'
}

function markHighlight(text, highlight) {
  const index = highlight ? text.indexOf(highlight) : -1
  if (index < 0) return { before: text, highlight: '', after: '' }

  return {
    before: text.slice(0, index),
    highlight,
    after: text.slice(index + highlight.length),
  }
}

const spendingPattern = computed(() => analysis.value?.spendingPattern ?? null)

const totalExpenseLabel = computed(() => {
  const pattern = spendingPattern.value
  if (!pattern) return ''

  const period = [formatPeriodDate(pattern.periodStart), formatPeriodDate(pattern.periodEnd)]
    .filter(Boolean)
    .join('~')

  return `${period || '이번 달'} 총 지출 ${formatWon(pattern.totalSpendingAmount)}`
})

const spendingCategories = computed(() => {
  const categories = (spendingPattern.value?.categories ?? []).filter(
    (category) => Number(category.amount) > 0,
  )
  const amounts = categories.map((category) => Number(category.amount))
  const total = amounts.reduce((sum, amount) => sum + amount, 0)

  return categories.map((category) => {
    const code = category.category
    const style = SPENDING_CATEGORY_STYLES[code] ?? FALLBACK_CATEGORY_STYLE
    const amount = Number(category.amount)

    return {
      ...category,
      code,
      label: category.displayName || code,
      ...style,
      amount,
      share: total ? amount / total : 0,
    }
  })
})

const donutSegments = computed(() => {
  let accumulated = 0

  return spendingCategories.value.map((category) => {
    const length = category.share * DONUT_CIRCUMFERENCE
    const segment = {
      key: category.code,
      color: category.color,
      dasharray: `${Math.max(length - DONUT_SEGMENT_GAP, 1)} ${DONUT_CIRCUMFERENCE}`,
      dashoffset: -(accumulated * DONUT_CIRCUMFERENCE + DONUT_SEGMENT_GAP / 2),
    }
    accumulated += category.share
    return segment
  })
})

// 인사이트 문장은 피그마 도안처럼 한 문장씩 줄바꿈해 보여준다.
const insightLines = computed(() => {
  const message = analysis.value?.comment
  if (!message) return []

  return message
    .split(/(?<=\.)\s+/)
    .filter(Boolean)
    .map((sentence) => markHighlight(sentence, ''))
})

const causes = computed(() =>
  (analysis.value?.spendingInsights ?? []).map((cause) => {
    const style = CAUSE_STYLES[cause.type] ?? { emoji: '📌', background: 'var(--gray-100)' }
    const tag = CAUSE_TAGS[cause.type] ?? { label: '분석', className: 'tag--neutral' }

    return {
      ...cause,
      code: cause.type,
      emoji: style.emoji,
      background: style.background,
      statusLabel: tag.label,
      tagClass: tag.className,
    }
  }),
)

const summaryParts = computed(() => {
  const summary =
    analysis.value?.recommendedScenario?.recommendReason ||
    analysis.value?.spendingImprovement?.action ||
    analysis.value?.comment
  if (!summary) return null

  return markHighlight(summary, '')
})

const expectedEffect = computed(() => {
  const effect = analysis.value?.spendingExpectedEffect
  const scenario = analysis.value?.recommendedScenario
  if (!effect && !scenario) return null

  const increase = Number(effect?.expectedAssetIncreaseAmount || 0)
  const currentProjectedAsset = Math.max(
    0,
    Number(effect?.expectedAssetAfterImprovement || 0) - increase,
  )
  const strategyProjectedAsset = Number(
    scenario?.expectedAsset ?? effect?.expectedAssetAfterImprovement,
  )

  return {
    currentProjectedAsset,
    strategyProjectedAsset,
    additionalAmount: Math.max(0, strategyProjectedAsset - currentProjectedAsset),
    currentFinancialDischargeLabel: formatFinancialDate(analysis.value?.financialDischargeDate),
    financialDateChangeLabel: formatFinancialDateChange(
      scenario?.financialDischargeDate,
      analysis.value?.financialDischargeDate,
    ),
  }
})

const prescriptionAmount = computed(() => {
  const amount =
    expectedEffect.value?.additionalAmount ?? analysis.value?.recommendedScenario?.expectedAsset

  return amount ? `+${formatWon(amount)}` : ''
})

const effectBadgeAmount = computed(() => {
  const amount = expectedEffect.value?.additionalAmount
  return amount ? `+${formatManwon(amount)}` : ''
})

const isFallbackGuide = computed(() => analysis.value?.generationSource === 'FALLBACK')

const applyButtonLabel = computed(() => {
  if (applyState.value === 'applying') return '적용 중...'
  if (applyState.value === 'applied') return '적용 완료'
  return 'AI 전략 적용하기'
})

async function handleApplyStrategy() {
  if (!analysis.value?.analysisId || applyState.value !== 'idle') return

  applyState.value = 'applying'
  applyErrorMessage.value = ''

  try {
    await applyAiStrategy(analysis.value.analysisId)
    applyState.value = 'applied'
  } catch {
    applyState.value = 'idle'
    applyErrorMessage.value = '전략 적용에 실패했어요. 다시 시도해주세요.'
  }
}
</script>

<template>
  <div class="analysis-screen">
    <Transition
      name="phase"
      mode="out-in"
    >
      <!-- 분석 중 -->
      <section
        v-if="phase === 'analyzing'"
        key="analyzing"
        class="analyzing"
        aria-live="polite"
      >
        <header class="analyzing__header">
          <button
            class="back-button"
            type="button"
            aria-label="이전 페이지"
            @click="router.back()"
          >
            <img
              :src="backArrowIcon"
              alt=""
              aria-hidden="true"
            >
          </button>
          <h1>AI 코치</h1>
        </header>

        <div class="analyzing__content">
          <h2 class="analyzing__title">
            {{ nickname }}님의 자산을<br>
            분석중이에요
          </h2>

          <div class="analyzing__stage">
            <img
              class="analyzing__glow"
              :src="analysisGlow"
              alt=""
              aria-hidden="true"
            >
            <img
              class="analyzing__character"
              :src="coachCharacter"
              alt=""
              aria-hidden="true"
            >
          </div>

          <p class="analyzing__caption">
            유노우?
          </p>
        </div>
      </section>

      <!-- 분석 실패 -->
      <section
        v-else-if="phase === 'error'"
        key="error"
        class="status-panel"
      >
        <header class="result__header">
          <button
            class="back-button"
            type="button"
            aria-label="이전 페이지"
            @click="router.back()"
          >
            <img
              :src="backArrowIcon"
              alt=""
              aria-hidden="true"
            >
          </button>
          <h1>AI 분석</h1>
        </header>
        <div class="status-panel__body">
          <p>{{ errorMessage }}</p>
          <button
            class="status-panel__retry"
            type="button"
            @click="runAnalysis"
          >
            다시 분석하기
          </button>
        </div>
      </section>

      <!-- 분석 결과 -->
      <section
        v-else
        key="result"
        class="result"
      >
        <header class="result__header">
          <button
            class="back-button"
            type="button"
            aria-label="이전 페이지"
            @click="router.back()"
          >
            <img
              :src="backArrowIcon"
              alt=""
              aria-hidden="true"
            >
          </button>
          <h1>AI 분석</h1>
        </header>

        <div class="result__body">
          <p
            v-if="isFallbackGuide"
            class="fallback-guide"
          >
            AI 설명 생성이 지연되어 계산된 수치를 기반으로 한 기본 가이드를 보여드려요.
          </p>

          <!-- 소비 패턴 분석 -->
          <article class="card card--expense">
            <div class="card-head">
              <span
                class="head-tile head-tile--expense"
                aria-hidden="true"
              >📊</span>
              <div>
                <h3>소비 패턴 분석</h3>
                <p>{{ totalExpenseLabel }}</p>
              </div>
            </div>

            <p
              v-if="!spendingCategories.length"
              class="pattern-empty"
            >
              이번달 지출 내역이 아직 없어요.
            </p>

            <div
              v-else
              class="pattern"
            >
              <div
                class="donut"
                aria-hidden="true"
              >
                <svg viewBox="0 0 120 120">
                  <circle
                    cx="60"
                    cy="60"
                    :r="DONUT_RADIUS"
                    class="donut__track"
                  />
                  <!-- 피그마 도안처럼 12시에서 반시계 방향으로 그리기 위해 좌우 반전 -->
                  <g transform="matrix(-1 0 0 1 120 0)">
                    <circle
                      v-for="segment in donutSegments"
                      :key="segment.key"
                      cx="60"
                      cy="60"
                      :r="DONUT_RADIUS"
                      class="donut__segment"
                      :style="{ stroke: segment.color }"
                      :stroke-dasharray="segment.dasharray"
                      :stroke-dashoffset="segment.dashoffset"
                      transform="rotate(-90 60 60)"
                    />
                  </g>
                </svg>
              </div>

              <ul class="pattern-list">
                <li
                  v-for="category in spendingCategories"
                  :key="category.code"
                  class="pattern-row"
                >
                  <span
                    class="pattern-row__tile"
                    :style="{ background: category.tile }"
                    aria-hidden="true"
                  >{{ category.emoji }}</span>
                  <span class="pattern-row__label">{{ category.label }}</span>
                  <span
                    class="pattern-row__bar"
                    aria-hidden="true"
                  >
                    <i
                      :style="{
                        width: `${Math.max(category.share * 100, 4)}%`,
                        background: category.color,
                      }"
                    />
                  </span>
                  <span class="pattern-row__amount">{{ formatWon(category.amount) }}</span>
                </li>
              </ul>
            </div>

            <div
              v-if="insightLines.length"
              class="insight"
            >
              <p class="insight__label">
                💡 AI 인사이트
              </p>
              <p
                v-for="(line, index) in insightLines"
                :key="index"
                class="insight__line"
              >
                {{ line.before }}<strong v-if="line.highlight">{{ line.highlight }}</strong>{{ line.after }}
              </p>
            </div>
          </article>

          <!-- AI 원인 분석 -->
          <article
            v-if="causes.length"
            class="card card--causes"
          >
            <div class="card-head">
              <span
                class="head-tile head-tile--causes"
                aria-hidden="true"
              >
                <img
                  :src="causeInfoIcon"
                  alt=""
                >
              </span>
              <div>
                <h3>AI 원인 분석</h3>
                <p>AI가 소비 패턴을 분석했어요</p>
              </div>
            </div>

            <ul class="cause-list">
              <li
                v-for="cause in causes"
                :key="cause.code"
                class="cause-row"
              >
                <span
                  class="cause-row__icon"
                  :style="{ background: cause.background }"
                  aria-hidden="true"
                >{{ cause.emoji }}</span>
                <div class="cause-row__content">
                  <div class="cause-row__title">
                    <strong>{{ cause.title }}</strong>
                    <span
                      class="tag"
                      :class="cause.tagClass"
                    >{{ cause.statusLabel }}</span>
                  </div>
                  <p>{{ cause.description }}</p>
                </div>
              </li>
            </ul>
          </article>

          <!-- 개선 방안 안내 + 예상 효과 -->
          <article class="card card--prescription">
            <div class="card-head card-head--prescription">
              <span
                class="head-tile head-tile--robot"
                aria-hidden="true"
              >🤖</span>
              <div>
                <h3>개선 방안 안내</h3>
                <p>AI의 자산 관리 추천 방안</p>
              </div>
            </div>

            <p
              v-if="summaryParts"
              class="prescription__summary"
            >
              {{ summaryParts.before }}<strong>{{ summaryParts.highlight }}</strong>{{ summaryParts.after }}
            </p>

            <div
              v-if="prescriptionAmount"
              class="prescription__amount"
            >
              <strong>{{ prescriptionAmount }}</strong>
              <span class="prescription__chip">
                <img
                  :src="arrowUpIcon"
                  alt=""
                  aria-hidden="true"
                >
                예상 증가
              </span>
            </div>

            <div
              v-if="expectedEffect"
              class="effect"
            >
              <div class="section-head">
                <span
                  class="head-tile head-tile--bolt"
                  aria-hidden="true"
                >⚡</span>
                <h4 class="section-head__title">
                  예상 효과
                </h4>
              </div>

              <div class="compare">
                <div class="compare__col">
                  <span class="compare__eyebrow">현재</span>
                  <div class="compare__value-group">
                    <span class="compare__label">예상 전역 자산</span>
                    <strong class="compare__value">{{
                      formatWon(expectedEffect.currentProjectedAsset)
                    }}</strong>
                  </div>
                </div>
                <span
                  class="compare__arrow"
                  aria-hidden="true"
                >
                  <img
                    :src="arrowRightIcon"
                    alt=""
                  >
                </span>
                <div class="compare__col compare__col--strategy">
                  <span class="compare__eyebrow">AI 전략 적용</span>
                  <div class="compare__value-group">
                    <span class="compare__label">예상 전역 자산</span>
                    <strong class="compare__value">{{
                      formatWon(expectedEffect.strategyProjectedAsset)
                    }}</strong>
                  </div>
                </div>
              </div>

              <p
                v-if="effectBadgeAmount"
                class="effect-badge"
              >
                <strong>{{ effectBadgeAmount }}</strong>
                <span>더 모을 수 있어요</span>
              </p>

              <div class="compare">
                <div class="compare__col">
                  <span class="compare__eyebrow">현재</span>
                  <div class="compare__value-group">
                    <span class="compare__label">재정적 전역일</span>
                    <strong class="compare__value">{{
                      expectedEffect.currentFinancialDischargeLabel
                    }}</strong>
                  </div>
                </div>
                <span
                  class="compare__arrow"
                  aria-hidden="true"
                >
                  <img
                    :src="arrowRightIcon"
                    alt=""
                  >
                </span>
                <div class="compare__col compare__col--strategy">
                  <span class="compare__eyebrow">AI 전략 적용</span>
                  <div class="compare__value-group">
                    <span class="compare__label">재정적 전역일</span>
                    <strong class="compare__value">{{
                      expectedEffect.financialDateChangeLabel
                    }}</strong>
                  </div>
                </div>
              </div>
            </div>

            <button
              class="apply-button"
              type="button"
              :disabled="applyState !== 'idle'"
              @click="handleApplyStrategy"
            >
              {{ applyButtonLabel }}
            </button>
            <p
              v-if="applyErrorMessage"
              class="apply-error"
              role="alert"
            >
              {{ applyErrorMessage }}
            </p>
          </article>
        </div>
      </section>
    </Transition>
  </div>
</template>

<style scoped>
.analysis-screen {
  display: flex;
  /* 86px = 하단 네비게이션 높이(66px) + 하단 여백(20px) */
  min-height: calc(100dvh - 86px);
  flex-direction: column;
}

.analysis-screen > * {
  flex: 1;
}

.phase-enter-active,
.phase-leave-active {
  transition: opacity var(--duration-slow) var(--ease-default);
}

.phase-enter-from,
.phase-leave-to {
  opacity: 0;
}

.back-button {
  display: grid;
  width: 24px;
  height: 24px;
  place-items: center;
  margin-bottom: 2px;
}

.back-button img {
  width: 10px;
  height: 17px;
}

/* ===== 분석 중 ===== */
/*
  배경 그라데이션은 이 요소가 아니라 MainLayout 이 프레임(.mobile-frame)에 칠한다.
  이 단계는 화면을 꽉 채워야 하는데, 안쪽 요소 높이를 dvh 로 맞추면 기기마다
  safe area 계산이 달라져 바닥에 흰 여백이 남았다. 프레임이 직접 칠하면
  레이아웃 계산과 무관하게 항상 화면 전체가 덮인다.
*/
.analyzing {
  display: flex;
  min-height: 100%;
  flex-direction: column;
  background: transparent;
}

.analyzing__header {
  display: flex;
  min-height: 76px;
  align-items: center;
  gap: 6px;
  padding: var(--space-10) var(--layout-page-padding);
}

.analyzing__header h1 {
  color: var(--gray-900);
  /* 전역 h1 은 디스플레이 폰트라 공통 AppHeader 와 글꼴이 달라진다. */
  font-family: var(--font-body);
  font-size: var(--text-h5);
  font-weight: var(--weight-bold);
  line-height: var(--leading-normal);
}

.analyzing__content {
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: center;
  gap: var(--space-10);
  padding: var(--space-20) 0;
}

.analyzing__title {
  display: grid;
  height: 76px;
  place-items: center;
  color: var(--gray-900);
  font-size: var(--text-h5);
  font-weight: var(--weight-bold);
  line-height: var(--leading-normal);
  text-align: center;
}

.analyzing__stage {
  position: relative;
  width: 221px;
  height: 435px;
  flex: none;
}

/* 피그마 도안의 글로우 프레임(221px)보다 좌우로 15.29%씩 넓게 렌더링된다.
   max-width 리셋을 풀지 않으면 SVG가 좌우로 눌려 원이 찌그러진다. */
.analyzing__glow {
  position: absolute;
  top: 0;
  left: -15.29%;
  width: 130.6%;
  max-width: none;
  height: 100%;
}

.analyzing__character {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 132px;
  height: 140px;
  object-fit: contain;
  transform: translate(-50%, -50%) scaleX(-1);
}

.analyzing__caption {
  color: var(--gray-900);
  font-size: var(--text-h5);
  font-weight: var(--weight-bold);
  line-height: var(--leading-normal);
  text-align: center;
}

@media (prefers-reduced-motion: no-preference) {
  .analyzing__glow {
    animation: glow-breathe 2.4s var(--ease-default) infinite;
  }

  .analyzing__character {
    animation: character-float 2.4s ease-in-out infinite;
  }

  @keyframes glow-breathe {
    0%,
    100% {
      transform: scale(1);
    }

    50% {
      transform: scale(1.06);
    }
  }

  @keyframes character-float {
    0%,
    100% {
      transform: translate(-50%, calc(-50% + 4px)) scaleX(-1);
    }

    50% {
      transform: translate(-50%, calc(-50% - 6px)) scaleX(-1);
    }
  }
}

/* ===== 분석 실패 ===== */
.status-panel {
  display: flex;
  flex-direction: column;
  background: var(--gray-100);
}

.status-panel__body {
  display: grid;
  flex: 1;
  gap: var(--space-16);
  place-content: center;
  justify-items: center;
  padding: 0 var(--layout-page-padding) var(--space-40);
  color: var(--gray-600);
  font-size: var(--text-sm);
  text-align: center;
}

.status-panel__retry {
  padding: 12px 28px;
  border-radius: var(--radius-full);
  background: var(--green-500);
  color: var(--gray-900);
  font-size: var(--text-sm);
  font-weight: var(--weight-bold);
}

/* ===== 분석 결과 ===== */
.result {
  background: var(--gray-100);
}

.result__header {
  position: sticky;
  z-index: var(--z-sticky);
  top: 0;
  display: flex;
  min-height: 76px;
  align-items: flex-end;
  gap: var(--space-8);
  padding: var(--space-10) var(--layout-page-padding);
  background: var(--gray-100);
}

.result__header h1 {
  color: var(--gray-900);
  /* 전역 h1 은 디스플레이 폰트라 공통 AppHeader 와 글꼴이 달라진다. */
  font-family: var(--font-body);
  font-size: var(--text-h5);
  font-weight: var(--weight-bold);
  line-height: var(--leading-normal);
}

.result__body {
  display: flex;
  flex-direction: column;
  gap: var(--space-10);
  padding: var(--space-4) var(--layout-page-padding) var(--space-40);
}

.fallback-guide {
  padding: 10px 14px;
  border: 1px solid var(--olive-100);
  border-radius: 14px;
  background: rgb(232 236 230 / 55%);
  color: var(--olive-600);
  font-size: var(--text-xs);
  line-height: 1.5;
}

.card {
  display: flex;
  flex-direction: column;
  gap: var(--space-16);
  padding: var(--space-20) var(--space-24);
  border-radius: 28px;
  background: var(--white);
}

.card--expense {
  padding: var(--space-20);
  border-radius: 24px;
}

.card-head {
  display: flex;
  align-items: center;
  gap: var(--space-8);
}

.card-head--prescription {
  gap: var(--space-10);
}

.card-head h3 {
  color: var(--ui-sub-title);
  font-size: var(--text-sm);
  font-weight: var(--weight-bold);
  line-height: var(--leading-normal);
}

.card-head p {
  color: #888;
  font-size: var(--text-sm);
  line-height: var(--leading-normal);
}

/* 카드 헤더 이모지·아이콘 타일 */
.head-tile {
  display: grid;
  flex: none;
  place-items: center;
  border-radius: var(--radius-sm);
}

.head-tile--expense {
  width: 28px;
  height: 28px;
  background: var(--orange-100);
  font-size: 14px;
}

.head-tile--causes {
  width: 24px;
  height: 24px;
  background: var(--green-50);
}

.head-tile--causes img {
  width: 13px;
  height: 13px;
}

.head-tile--robot {
  width: 32px;
  height: 32px;
  border-radius: 11px;
  background: var(--green-50);
  font-size: 16px;
}

.head-tile--bolt {
  width: 24px;
  height: 24px;
  background: var(--yellow-100);
  font-size: 13px;
}

.head-tile--star {
  width: 24px;
  height: 24px;
  background: #ede9fe;
  font-size: 13px;
}

/* 소비 패턴 분석 */
.pattern-empty {
  padding: var(--space-24) 0;
  color: var(--gray-500);
  font-size: var(--text-sm);
  text-align: center;
}

.pattern {
  display: flex;
  align-items: center;
  gap: var(--space-20);
}

.donut {
  position: relative;
  width: 68px;
  height: 68px;
  flex: none;
}

.donut svg {
  width: 100%;
  height: 100%;
}

.donut circle {
  fill: none;
  stroke-width: 22;
}

.donut__track {
  stroke: var(--gray-100);
}

.pattern-list {
  display: flex;
  flex: 1;
  flex-direction: column;
  padding: 0;
  gap: var(--space-8);
  list-style: none;
}

.pattern-row {
  display: flex;
  align-items: center;
  gap: var(--space-8);
}

.pattern-row__tile {
  display: grid;
  width: 18px;
  height: 18px;
  flex: none;
  place-items: center;
  border-radius: 4px;
  font-size: 11px;
}

.pattern-row__label {
  width: 32px;
  flex: none;
  color: var(--ui-sub-title-light);
  font-size: 11px;
}

.pattern-row__bar {
  flex: 1;
  border-radius: var(--radius-full);
  background: #f3f4f6;
}

.pattern-row__bar i {
  display: block;
  height: 6px;
  border-radius: var(--radius-full);
}

.pattern-row__amount {
  min-width: 64px;
  flex: none;
  color: #374151;
  font-size: 11px;
  font-weight: var(--weight-semibold);
  text-align: right;
}

.insight {
  display: grid;
  gap: 2px;
  padding: var(--space-12);
  border-radius: var(--radius-md);
  background: var(--orange-50);
  color: var(--ui-sub-title);
  font-size: var(--text-xs);
  line-height: 1.6;
}

.insight__label {
  color: var(--orange-500);
  font-weight: var(--weight-bold);
}

.insight__line strong {
  color: var(--orange-500);
  font-weight: var(--weight-bold);
}

/* AI 원인 분석 */
.card--causes {
  gap: var(--space-4);
  padding-bottom: var(--space-4);
}

.cause-list {
  display: flex;
  flex-direction: column;
  padding: 0;
  list-style: none;
}

.cause-row {
  display: flex;
  align-items: center;
  gap: var(--space-16);
  padding: var(--space-16) 0;
}

.cause-row + .cause-row {
  border-top: 1px solid #f3f4f6;
}

.cause-row__icon {
  display: grid;
  width: 44px;
  height: 44px;
  flex: none;
  place-items: center;
  border-radius: var(--radius-sm);
  font-size: 24px;
}

.cause-row__content {
  display: grid;
  flex: 1;
  gap: 2px;
}

.cause-row__title {
  display: flex;
  align-items: center;
  gap: var(--space-8);
}

.cause-row__title strong {
  color: var(--ui-sub-title);
  font-size: 13px;
  font-weight: var(--weight-bold);
}

.cause-row__content p {
  color: var(--ui-sub-title);
  font-size: var(--text-xs);
  line-height: var(--leading-normal);
}

.tag {
  padding: 2px 10px;
  border-radius: var(--radius-lg);
  font-size: var(--text-xs);
  font-weight: var(--weight-bold);
  line-height: var(--leading-normal);
}

.tag--caution {
  background: rgb(255 211 197 / 50%);
  color: var(--orange-500);
}

.tag--check {
  background: var(--gray-200);
  color: var(--gray-600);
}

.tag--good {
  background: var(--green-100);
  color: #22c55e;
}

.tag--neutral {
  background: var(--gray-100);
  color: var(--gray-600);
}

/* 개선 방안 안내 */
.card--prescription {
  gap: var(--space-20);
}

.prescription__summary {
  color: #374151;
  font-size: var(--text-sm);
  line-height: 1.8;
}

.prescription__summary strong {
  font-weight: var(--weight-bold);
}

.prescription__amount {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-14) var(--space-16);
  border: 1px solid rgb(59 225 120 / 22%);
  border-radius: 18px;
  background: rgb(59 225 120 / 9%);
}

.prescription__amount strong {
  color: #16a34a;
  font-size: 28px;
  font-weight: 800;
  letter-spacing: -0.5px;
  line-height: var(--leading-normal);
}

.prescription__chip {
  display: inline-flex;
  align-items: center;
  gap: var(--space-4);
  padding: 4px 10px;
  border-radius: var(--radius-full);
  background: rgb(59 225 120 / 18%);
  color: #16a34a;
  font-size: 10px;
  font-weight: var(--weight-bold);
  line-height: var(--leading-normal);
}

.prescription__chip img {
  width: 10px;
  height: 10px;
}

/* 섹션 헤더 (예상 효과 · 추천 상품) */
.section-head {
  display: flex;
  align-items: center;
  gap: var(--space-8);
}

.section-head__title {
  color: var(--ui-sub-title);
  font-size: var(--text-sm);
  font-weight: var(--weight-bold);
}

/* 예상 효과 */
.effect {
  display: grid;
  gap: var(--space-20);
}

.compare {
  display: flex;
  overflow: hidden;
  align-items: stretch;
  border: 1px solid #f3f4f6;
  border-radius: var(--radius-lg);
}

.compare__col {
  display: grid;
  flex: 1;
  gap: 5px;
  justify-items: center;
  padding: var(--space-16);
  text-align: center;
}

.compare__col--strategy {
  background: #f7fffb;
}

.compare__eyebrow {
  color: #9ca3af;
  font-size: var(--text-xs);
  line-height: var(--leading-normal);
}

.compare__col--strategy .compare__eyebrow {
  color: var(--green-700);
}

.compare__value-group {
  display: grid;
  justify-items: center;
}

.compare__label {
  color: #9ca3af;
  font-size: var(--text-xs);
  font-weight: var(--weight-bold);
  line-height: var(--leading-normal);
}

.compare__value {
  color: var(--ui-sub-title-light);
  font-size: var(--text-sm);
  font-weight: var(--weight-semibold);
  line-height: var(--leading-normal);
}

.compare__col--strategy .compare__value {
  color: var(--green-700);
}

.compare__arrow {
  display: grid;
  width: 36px;
  flex: none;
  place-items: center;
  background: rgb(59 225 120 / 9%);
}

.compare__arrow img {
  width: 20px;
  height: 20px;
}

.effect-badge {
  display: inline-flex;
  height: 54px;
  align-items: center;
  justify-content: center;
  align-self: center;
  gap: 6px;
  padding: var(--space-8) var(--space-16);
  border-radius: var(--radius-full);
  background: rgb(59 225 120 / 18%);
  color: #16a34a;
}

.effect-badge strong {
  font-size: 15px;
  font-weight: 800;
}

.effect-badge span {
  font-size: 11px;
}

.apply-button {
  height: 50px;
  border-radius: 28px;
  background: var(--green-500);
  color: var(--gray-900);
  font-size: var(--text-md);
  font-weight: var(--weight-bold);
  letter-spacing: -0.32px;
  transition:
    opacity var(--duration-fast) var(--ease-default),
    transform var(--duration-fast) var(--ease-default);
}

.apply-button:active:not(:disabled) {
  transform: scale(0.98);
}

.apply-button:disabled {
  opacity: 0.6;
  cursor: default;
}

.apply-error {
  color: var(--status-error);
  font-size: var(--text-xs);
  text-align: center;
}

/* 추천 상품 */
.products {
  display: grid;
  gap: var(--space-12);
  padding: var(--space-10) 0;
}

.products__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.products .section-head__title {
  font-size: 15px;
}

.products__more {
  display: inline-flex;
  align-items: center;
  gap: var(--space-4);
  color: #7a7a7a;
  font-size: var(--text-sm);
}

.products__more img {
  width: 7px;
  height: 11px;
}

.products__grid {
  display: grid;
  gap: var(--space-12);
  grid-template-columns: 1fr 1fr;
}

.product-card {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: var(--space-16) var(--space-14);
  border: 1px solid;
  border-radius: 22px;
  filter: drop-shadow(0 2px 6px rgb(0 0 0 / 5%));
}

.product-card--green {
  border-color: rgb(59 225 120 / 20%);
  background: #f7fffb;
}

.product-card--yellow {
  border-color: rgb(245 158 11 / 18%);
  background: #fffdf7;
}

.product-card__icon {
  display: grid;
  width: 40px;
  height: 40px;
  margin-bottom: var(--space-12);
  place-items: center;
  border-radius: 13px;
  background: rgb(255 255 255 / 80%);
  box-shadow: 0 1px 4px rgb(0 0 0 / 6%);
  font-size: 20px;
}

.product-card strong {
  margin-bottom: 6px;
  color: var(--ui-sub-title);
  font-size: 13px;
  font-weight: var(--weight-bold);
}

.product-card__tags {
  display: grid;
  width: 100%;
  gap: 6px;
}

.product-card__tags span {
  padding: 4px 10px;
  border-radius: var(--radius-full);
  font-size: 9px;
  font-weight: var(--weight-bold);
  line-height: 1.5;
  text-align: center;
}

.product-card--green .product-card__tags span:first-child {
  background: rgb(22 163 74 / 8%);
  color: #16a34a;
}

.product-card--green .product-card__tags span:nth-child(2) {
  background: rgb(86 103 82 / 8%);
  color: var(--olive-500);
}

.product-card--yellow .product-card__tags span:first-child {
  background: rgb(245 158 11 / 8%);
  color: #f59e0b;
}

.product-card--yellow .product-card__tags span:nth-child(2) {
  background: rgb(217 119 6 / 8%);
  color: #d97706;
}
</style>
