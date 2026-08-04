<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

import coachCharacter from '@/assets/ai-coach/coach-character.svg'
import backArrowIcon from '@/assets/icons/backArrowIcon.svg'
import { createAiAnalysis } from '@/features/ai-analysis/api/aiAnalysis.api'
import { useOnboardingStore } from '@/features/onboarding/stores/onboarding.store'

const MINIMUM_ANALYZING_DURATION = 2600

const DONUT_RADIUS = 42
const DONUT_CIRCUMFERENCE = 2 * Math.PI * DONUT_RADIUS
const DONUT_SEGMENT_GAP = 3

const CATEGORY_STYLES = {
  FOOD: { color: 'var(--orange-500)', emoji: '🍔' },
  SUBSCRIPTION: { color: 'var(--category-leisure-main)', emoji: '📺' },
  TELECOM: { color: 'var(--category-transport-main)', emoji: '📱' },
  HEALTH: { color: 'var(--category-medical-main)', emoji: '💊' },
  ETC: { color: 'var(--gray-400)', emoji: '🧾' },
}

const CAUSE_STYLES = {
  FOOD_INCREASE: { emoji: '🍔', background: 'var(--orange-50)' },
  SUBSCRIPTION: { emoji: '📺', background: 'var(--category-leisure-light)' },
  SAVING_HABIT: { emoji: '💰', background: 'var(--yellow-50)' },
}

const CAUSE_TAG_CLASSES = {
  CAUTION: 'tag--caution',
  CHECK_REQUIRED: 'tag--check',
  GOOD: 'tag--good',
}

const PRODUCT_STYLES = {
  군인공제회: { emoji: '🏛️', background: 'var(--category-transport-light)' },
  장병내일준비적금: { emoji: '🎖️', background: 'var(--yellow-100)' },
}

const router = useRouter()
const onboarding = useOnboardingStore()

const phase = ref('analyzing')
const analysis = ref(null)
const errorMessage = ref('')

const nickname = computed(() => onboarding.form.nickname || '윤호')

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

async function runAnalysis() {
  phase.value = 'analyzing'
  errorMessage.value = ''

  try {
    const [response] = await Promise.all([
      createAiAnalysis({ analysisType: 'SPENDING', simulationId: null }),
      delay(MINIMUM_ANALYZING_DURATION),
    ])
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

const spendingPattern = computed(() => analysis.value?.spendingPattern ?? null)

const spendingCategories = computed(() => {
  const items = spendingPattern.value?.categories ?? []
  const total = items.reduce((sum, item) => sum + Number(item.amount || 0), 0)
  const maxAmount = Math.max(1, ...items.map((item) => Number(item.amount || 0)))

  return items.map((item) => {
    const style = CATEGORY_STYLES[item.code] ?? { color: 'var(--gray-400)', emoji: '🧾' }

    return {
      ...item,
      share: total ? Number(item.amount || 0) / total : 0,
      barRatio: Number(item.amount || 0) / maxAmount,
      color: style.color,
      emoji: style.emoji,
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

const donutMarkers = computed(() => {
  let accumulated = 0

  return spendingCategories.value.map((category) => {
    const angle = (accumulated + category.share / 2) * Math.PI * 2 - Math.PI / 2
    accumulated += category.share

    return {
      key: category.code,
      emoji: category.emoji,
      style: {
        left: `${((60 + DONUT_RADIUS * Math.cos(angle)) / 120) * 100}%`,
        top: `${((60 + DONUT_RADIUS * Math.sin(angle)) / 120) * 100}%`,
      },
    }
  })
})

const insightParts = computed(() => {
  const insight = spendingPattern.value?.insight
  if (!insight?.message) return null

  const highlight = insight.highlight || ''
  const index = highlight ? insight.message.indexOf(highlight) : -1
  if (index < 0) return { before: insight.message, highlight: '', after: '' }

  return {
    before: insight.message.slice(0, index),
    highlight,
    after: insight.message.slice(index + highlight.length),
  }
})

const causes = computed(() =>
  (analysis.value?.causes ?? []).map((cause) => {
    const style = CAUSE_STYLES[cause.code] ?? { emoji: '📌', background: 'var(--gray-100)' }

    return {
      ...cause,
      emoji: style.emoji,
      background: style.background,
      tagClass: CAUSE_TAG_CLASSES[cause.status] ?? 'tag--neutral',
    }
  }),
)

const expectedEffect = computed(() => analysis.value?.expectedEffect ?? null)

const prescriptionAmount = computed(() => {
  const amount =
    expectedEffect.value?.additionalAmount ??
    analysis.value?.recommendedScenarios?.[0]?.expectedEffectAmount

  return amount ? `+${formatWon(amount)}` : ''
})

const effectBadgeText = computed(() => {
  const amount = expectedEffect.value?.additionalAmount
  return amount ? `+${formatManwon(amount)} 더 모을 수 있어요` : ''
})

const recommendedProducts = computed(() =>
  (analysis.value?.recommendedProducts ?? []).map((product) => {
    const style = PRODUCT_STYLES[product.name] ?? { emoji: '🏦', background: 'var(--gray-100)' }

    return { ...product, emoji: style.emoji, background: style.background }
  }),
)
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
          <span
            class="analyzing__avatar"
            aria-hidden="true"
          >
            <img
              :src="coachCharacter"
              alt=""
            >
          </span>
        </header>

        <h2 class="analyzing__title">
          {{ nickname }}님의 자산을<br>
          분석중이에요
        </h2>

        <div class="analyzing__stage">
          <div class="analyzing__glow">
            <img
              class="analyzing__character"
              :src="coachCharacter"
              alt=""
              aria-hidden="true"
            >
          </div>
        </div>

        <p class="analyzing__caption">
          유노우?
        </p>
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
          <!-- 소비 패턴 분석 -->
          <article
            v-if="spendingPattern"
            class="card"
          >
            <div class="card-head">
              <span
                class="card-head__icon card-head__icon--pattern"
                aria-hidden="true"
              >📊</span>
              <div>
                <h3>소비 패턴 분석</h3>
                <p>
                  {{ spendingPattern.baseMonthLabel }} 총 지출
                  {{ formatWon(spendingPattern.totalExpenseAmount) }}
                </p>
              </div>
            </div>

            <div class="pattern">
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
                </svg>
                <span
                  v-for="marker in donutMarkers"
                  :key="marker.key"
                  class="donut__marker"
                  :style="marker.style"
                >{{ marker.emoji }}</span>
              </div>

              <ul class="pattern-list">
                <li
                  v-for="category in spendingCategories"
                  :key="category.code"
                  class="pattern-row"
                >
                  <span class="pattern-row__label">{{ category.label }}</span>
                  <span
                    class="pattern-row__bar"
                    aria-hidden="true"
                  >
                    <i
                      :style="{
                        width: `${Math.max(category.barRatio * 100, 12)}%`,
                        background: category.color,
                      }"
                    />
                  </span>
                  <span class="pattern-row__amount">{{ formatWon(category.amount) }}</span>
                </li>
              </ul>
            </div>

            <p
              v-if="insightParts"
              class="insight"
            >
              <span class="insight__label">⚡ AI 인사이트</span>
              {{ insightParts.before }}<strong>{{ insightParts.highlight }}</strong>{{ insightParts.after }}
            </p>
          </article>

          <!-- AI 원인 분석 -->
          <article
            v-if="causes.length"
            class="card"
          >
            <div class="card-head">
              <span
                class="card-head__icon card-head__icon--cause"
                aria-hidden="true"
              >ℹ️</span>
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
                <span
                  class="cause-row__chevron"
                  aria-hidden="true"
                >›</span>
              </li>
            </ul>
          </article>

          <!-- AI 처방 -->
          <article class="card card--prescription">
            <div class="card-head">
              <span
                class="card-head__icon card-head__icon--prescription"
                aria-hidden="true"
              >🤖</span>
              <div>
                <h3>AI 처방</h3>
                <p>AI 추천</p>
              </div>
            </div>

            <p class="prescription__summary">
              {{ analysis?.summary }}
            </p>

            <div
              v-if="prescriptionAmount"
              class="prescription__amount"
            >
              <strong>{{ prescriptionAmount }}</strong>
              <span class="tag tag--good">↑ 예상 증가</span>
            </div>
          </article>

          <!-- 예상 효과 -->
          <article
            v-if="expectedEffect"
            class="card"
          >
            <div class="card-head">
              <span
                class="card-head__icon card-head__icon--effect"
                aria-hidden="true"
              >✨</span>
              <div>
                <h3>예상 효과</h3>
              </div>
            </div>

            <div class="effect-row">
              <div class="effect-box">
                <span class="effect-box__eyebrow">현재</span>
                <span class="effect-box__label">예상 전역 자산</span>
                <strong>{{ formatWon(expectedEffect.currentProjectedAsset) }}</strong>
              </div>
              <span
                class="effect-row__arrow"
                aria-hidden="true"
              >›</span>
              <div class="effect-box effect-box--strategy">
                <span class="effect-box__eyebrow">AI 전략 적용</span>
                <span class="effect-box__label">예상 전역 자산</span>
                <strong>{{ formatWon(expectedEffect.strategyProjectedAsset) }}</strong>
              </div>
            </div>

            <p
              v-if="effectBadgeText"
              class="effect-badge"
            >
              {{ effectBadgeText }}
            </p>

            <div class="effect-row">
              <div class="effect-box">
                <span class="effect-box__eyebrow">현재</span>
                <span class="effect-box__label">재정적 전역일</span>
                <strong>{{ expectedEffect.currentFinancialDischargeLabel }}</strong>
              </div>
              <span
                class="effect-row__arrow"
                aria-hidden="true"
              >›</span>
              <div class="effect-box effect-box--strategy">
                <span class="effect-box__eyebrow">AI 전략</span>
                <span class="effect-box__label">재정적 전역일</span>
                <strong>{{ expectedEffect.advancedDays }}일 앞당김</strong>
              </div>
            </div>
          </article>

          <!-- 추천 상품 -->
          <section
            v-if="recommendedProducts.length"
            class="products"
            aria-labelledby="recommended-products-title"
          >
            <div class="products__head">
              <h3 id="recommended-products-title">
                추천 상품
              </h3>
              <span>AI 맞춤 추천</span>
            </div>

            <div class="products__grid">
              <article
                v-for="product in recommendedProducts"
                :key="product.productId"
                class="product-card"
              >
                <span
                  class="product-card__icon"
                  :style="{ background: product.background }"
                  aria-hidden="true"
                >{{ product.emoji }}</span>
                <strong>{{ product.name }}</strong>
                <span
                  class="product-card__stars"
                  :aria-label="`별점 5점 만점에 ${product.rating}점`"
                >
                  <i
                    v-for="star in 5"
                    :key="star"
                    :class="{ 'star--filled': star <= product.rating }"
                  >★</i>
                </span>
                <span class="product-card__tags">
                  <span
                    v-for="tag in product.tags"
                    :key="tag"
                  >{{ tag }}</span>
                </span>
              </article>
            </div>
          </section>
        </div>
      </section>
    </Transition>
  </div>
</template>

<style scoped>
.analysis-screen {
  min-height: 100%;
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
.analyzing {
  display: flex;
  min-height: 100dvh;
  flex-direction: column;
  background: linear-gradient(
    180deg,
    var(--green-500) 0%,
    var(--green-200) 34%,
    #f4f7d9 58%,
    var(--yellow-400) 100%
  );
}

.analyzing__header {
  display: flex;
  min-height: 76px;
  align-items: flex-end;
  gap: var(--space-8);
  padding: var(--space-10) var(--layout-page-padding);
}

.analyzing__header h1 {
  flex: 1;
  color: var(--gray-900);
  font-size: var(--text-h5);
  font-weight: var(--weight-bold);
  line-height: var(--leading-normal);
}

.analyzing__avatar {
  display: grid;
  width: 34px;
  height: 34px;
  place-items: center;
  overflow: hidden;
  border-radius: 50%;
  background: var(--gray-900);
}

.analyzing__avatar img {
  width: 24px;
  height: 24px;
  object-fit: contain;
}

.analyzing__title {
  margin-top: var(--space-24);
  color: var(--gray-900);
  font-size: var(--text-h5);
  font-weight: var(--weight-bold);
  line-height: var(--leading-normal);
  text-align: center;
}

.analyzing__stage {
  display: grid;
  flex: 1;
  place-items: center;
}

.analyzing__glow {
  display: grid;
  width: 260px;
  height: 260px;
  place-items: center;
  border-radius: 50%;
  background: radial-gradient(
    circle,
    rgb(255 255 255 / 85%) 0%,
    rgb(255 255 255 / 35%) 55%,
    rgb(255 255 255 / 0%) 74%
  );
}

.analyzing__character {
  width: 150px;
  height: 150px;
  object-fit: contain;
}

.analyzing__caption {
  padding-bottom: 120px;
  color: var(--olive-700);
  font-family: var(--font-display);
  font-size: var(--text-h5);
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
      transform: translateY(4px);
    }

    50% {
      transform: translateY(-6px);
    }
  }
}

/* ===== 분석 실패 ===== */
.status-panel {
  display: flex;
  min-height: 100dvh;
  flex-direction: column;
  background: var(--gray-100);
}

.status-panel__body {
  display: grid;
  flex: 1;
  gap: var(--space-16);
  place-content: center;
  justify-items: center;
  padding: 0 var(--layout-page-padding) 120px;
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
  min-height: 100dvh;
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
  font-size: var(--text-h5);
  font-weight: var(--weight-bold);
  line-height: var(--leading-normal);
}

.result__body {
  display: flex;
  flex-direction: column;
  gap: var(--space-12);
  padding: var(--space-4) var(--layout-page-padding) 130px;
}

.card {
  display: flex;
  flex-direction: column;
  gap: var(--space-16);
  padding: var(--space-20);
  border-radius: 24px;
  background: var(--white);
}

.card-head {
  display: flex;
  align-items: center;
  gap: var(--space-10);
}

.card-head__icon {
  display: grid;
  width: 36px;
  height: 36px;
  flex: none;
  place-items: center;
  border-radius: 12px;
  font-size: 18px;
}

.card-head__icon--pattern {
  background: var(--green-100);
}

.card-head__icon--cause {
  background: var(--gray-100);
}

.card-head__icon--prescription {
  background: var(--white);
}

.card-head__icon--effect {
  background: var(--yellow-100);
}

.card-head h3 {
  color: var(--gray-900);
  font-size: 15px;
  font-weight: var(--weight-bold);
  line-height: var(--leading-normal);
}

.card-head p {
  color: var(--gray-500);
  font-size: var(--text-xs);
  line-height: var(--leading-normal);
}

/* 소비 패턴 분석 */
.pattern {
  display: flex;
  align-items: center;
  gap: var(--space-16);
}

.donut {
  position: relative;
  width: 124px;
  height: 124px;
  flex: none;
}

.donut svg {
  width: 100%;
  height: 100%;
}

.donut circle {
  fill: none;
  stroke-width: 18;
}

.donut__track {
  stroke: var(--gray-100);
}

.donut__marker {
  position: absolute;
  display: grid;
  width: 22px;
  height: 22px;
  place-items: center;
  border-radius: 50%;
  background: var(--white);
  box-shadow: var(--shadow-sm);
  font-size: 12px;
  transform: translate(-50%, -50%);
}

.pattern-list {
  display: grid;
  flex: 1;
  gap: var(--space-8);
}

.pattern-row {
  display: flex;
  align-items: center;
  gap: var(--space-8);
  font-size: var(--text-xs);
}

.pattern-row__label {
  width: 30px;
  flex: none;
  color: var(--gray-900);
  font-weight: var(--weight-semibold);
}

.pattern-row__bar {
  flex: 1;
  overflow: hidden;
  border-radius: var(--radius-full);
}

.pattern-row__bar i {
  display: block;
  height: 8px;
  border-radius: var(--radius-full);
}

.pattern-row__amount {
  min-width: 64px;
  flex: none;
  color: var(--gray-900);
  font-weight: var(--weight-semibold);
  text-align: right;
}

.insight {
  padding: var(--space-12);
  border-radius: var(--radius-md);
  background: var(--orange-50);
  color: var(--gray-600);
  font-size: var(--text-xs);
  line-height: var(--leading-relaxed);
}

.insight__label {
  display: block;
  margin-bottom: 2px;
  color: var(--orange-700);
  font-weight: var(--weight-bold);
}

.insight strong {
  color: var(--orange-600);
  font-weight: var(--weight-bold);
}

/* AI 원인 분석 */
.cause-list {
  display: grid;
}

.cause-row {
  display: flex;
  align-items: center;
  gap: var(--space-12);
  padding: var(--space-12) 0;
}

.cause-row + .cause-row {
  border-top: 1px solid var(--gray-100);
}

.cause-row__icon {
  display: grid;
  width: 44px;
  height: 44px;
  flex: none;
  place-items: center;
  border-radius: var(--radius-md);
  font-size: 20px;
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
  color: var(--gray-900);
  font-size: var(--text-sm);
  font-weight: var(--weight-bold);
}

.cause-row__content p {
  color: var(--gray-500);
  font-size: var(--text-xs);
  line-height: var(--leading-normal);
}

.cause-row__chevron {
  color: var(--gray-300);
  font-size: 22px;
  line-height: 1;
}

.tag {
  padding: 2px 8px;
  border-radius: var(--radius-full);
  font-size: 11px;
  font-weight: var(--weight-bold);
  line-height: var(--leading-normal);
}

.tag--caution {
  background: var(--orange-100);
  color: var(--orange-700);
}

.tag--check {
  background: var(--category-leisure-light);
  color: var(--category-leisure-deep);
}

.tag--good {
  background: var(--green-100);
  color: var(--green-800);
}

.tag--neutral {
  background: var(--gray-100);
  color: var(--gray-600);
}

/* AI 처방 */
.card--prescription {
  border: 1px solid var(--green-200);
  background: var(--green-50);
}

.prescription__summary {
  color: var(--gray-800);
  font-size: var(--text-sm);
  font-weight: var(--weight-medium);
  line-height: var(--leading-relaxed);
}

.prescription__amount {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-8);
  padding: var(--space-16);
  border-radius: var(--radius-md);
  background: var(--white);
}

.prescription__amount strong {
  color: var(--green-700);
  font-size: var(--text-h4);
  font-weight: var(--weight-bold);
}

/* 예상 효과 */
.effect-row {
  display: flex;
  align-items: center;
  gap: var(--space-4);
}

.effect-box {
  display: grid;
  flex: 1;
  gap: 2px;
  padding: var(--space-12);
  border-radius: var(--radius-md);
  background: var(--gray-100);
}

.effect-box--strategy {
  background: var(--green-50);
}

.effect-box__eyebrow {
  color: var(--gray-500);
  font-size: 11px;
}

.effect-box--strategy .effect-box__eyebrow {
  color: var(--green-700);
  font-weight: var(--weight-bold);
}

.effect-box__label {
  color: var(--gray-600);
  font-size: var(--text-xs);
}

.effect-box strong {
  color: var(--gray-900);
  font-size: var(--text-md);
  font-weight: var(--weight-bold);
}

.effect-box--strategy strong {
  color: var(--green-700);
}

.effect-row__arrow {
  flex: none;
  color: var(--green-600);
  font-size: 20px;
  font-weight: var(--weight-bold);
}

.effect-badge {
  padding: 6px 14px;
  border-radius: var(--radius-full);
  margin: 0 auto;
  background: var(--green-100);
  color: var(--green-800);
  font-size: var(--text-xs);
  font-weight: var(--weight-bold);
}

/* 추천 상품 */
.products {
  display: grid;
  gap: var(--space-10);
  margin-top: var(--space-4);
}

.products__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--space-4);
}

.products__head h3 {
  color: var(--gray-900);
  font-size: 15px;
  font-weight: var(--weight-bold);
}

.products__head span {
  color: var(--gray-400);
  font-size: 11px;
}

.products__grid {
  display: grid;
  gap: var(--space-10);
  grid-template-columns: 1fr 1fr;
}

.product-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-8);
  padding: var(--space-16) var(--space-12);
  border-radius: var(--radius-lg);
  background: var(--white);
}

.product-card__icon {
  display: grid;
  width: 40px;
  height: 40px;
  place-items: center;
  border-radius: 12px;
  font-size: 20px;
}

.product-card strong {
  color: var(--gray-900);
  font-size: 13px;
  font-weight: var(--weight-bold);
  text-align: center;
}

.product-card__stars {
  display: flex;
  gap: 1px;
}

.product-card__stars i {
  color: var(--gray-200);
  font-size: 13px;
  font-style: normal;
}

.product-card__stars .star--filled {
  color: var(--yellow-600);
}

.product-card__tags {
  display: grid;
  width: 100%;
  gap: var(--space-4);
}

.product-card__tags span {
  padding: 3px 8px;
  border-radius: var(--radius-full);
  background: var(--gray-50);
  color: var(--gray-600);
  font-size: 11px;
  text-align: center;
}
</style>
