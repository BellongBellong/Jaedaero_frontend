<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import aiRecommendationBot from '@/assets/simulations/ai-recommendation-bot.png'
import { getProductRecommendations } from '@/features/reports/api/reports.api'
import { useMissionCompletion } from '@/features/missions/composables/useMissionCompletion'

const SIMULATION_STORAGE_KEY = 'jaedaero-latest-simulation'

const PRODUCT_EMOJIS = {
  '군인공제회 목돈급여': '🏅',
  'CMA 통장': '💛',
  '나라사랑카드 CMA': '🏦',
}

const RATE_TONE_THEMES = {
  NEUTRAL: 'product-card--olive',
  YELLOW: 'product-card--yellow',
  GREEN: 'product-card--green',
}

const RISK_GRADE_LABELS = {
  1: '매우낮음',
  2: '낮음',
  3: '보통',
  4: '높음',
  5: '매우높음',
}

const route = useRoute()
const router = useRouter()
const { completeMissionAfterLoad } = useMissionCompletion(route, router)
const products = ref([])
const errorMessage = ref('')
const scenario = ref({
  annualReturnRate: 5,
  investmentPercent: 30,
  currentAsset: 0,
  generatedAt: new Date().toISOString(),
})

const recommendedProducts = computed(() =>
  products.value.map((product) => ({
    ...product,
    emoji: PRODUCT_EMOJIS[product.productName] ?? '🏦',
    themeClass: RATE_TONE_THEMES[product.rateTone] ?? 'product-card--olive',
    rateText: product.expectedReturnRate == null ? '-' : `${product.expectedReturnRate}%`,
    riskLabel: RISK_GRADE_LABELS[product.riskGrade] ?? '-',
  })),
)

const analysisDate = computed(() => {
  const date = new Date(scenario.value.generatedAt)

  if (Number.isNaN(date.getTime())) return '-'

  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
    .format(date)
    .replaceAll(' ', '')
})

onMounted(async () => {
  try {
    const savedScenario = JSON.parse(sessionStorage.getItem(SIMULATION_STORAGE_KEY) || 'null')
    if (savedScenario) scenario.value = { ...scenario.value, ...savedScenario }
  } catch {
    sessionStorage.removeItem(SIMULATION_STORAGE_KEY)
  }

  try {
    const response = await getProductRecommendations()
    products.value = Array.isArray(response) ? response : []
    await completeMissionAfterLoad()
  } catch {
    errorMessage.value = '추천 상품을 불러오지 못했어요. 잠시 후 다시 시도해주세요.'
  }
})
</script>

<template>
  <section class="product-screen">
    <section class="analysis-card">
      <div class="analysis-card__head">
        <span class="analysis-card__bot">
          <img
            :src="aiRecommendationBot"
            alt=""
            aria-hidden="true"
          >
        </span>
        <div>
          <strong>AI 분석 완료 <em>BETA</em></strong>
          <time :datetime="scenario.generatedAt">{{ analysisDate }}</time>
        </div>
      </div>
      <ul>
        <li>
          <span aria-hidden="true">✓</span>
          예상 수익률 <b>{{ scenario.annualReturnRate }}%</b>
        </li>
        <li>
          <span aria-hidden="true">✓</span>
          투자 비율 <b>{{ scenario.investmentPercent }}%</b>
        </li>
        <li>
          <span aria-hidden="true">✓</span>
          현재 자금 반영
        </li>
      </ul>
    </section>

    <h2 class="product-screen__section-title">
      추천 상품
    </h2>

    <p
      v-if="errorMessage"
      class="product-screen__error"
      role="alert"
    >
      {{ errorMessage }}
    </p>

    <ul
      v-else
      class="product-list"
    >
      <li
        v-for="product in recommendedProducts"
        :key="product.id"
        class="product-card"
        :class="product.themeClass"
      >
        <div class="product-card__head">
          <span
            class="product-card__icon"
            aria-hidden="true"
          >{{ product.emoji }}</span>
          <div class="product-card__title">
            <div class="product-card__name">
              <strong>{{ product.productName }}</strong>
              <span
                v-if="product.badge"
                class="product-card__badge"
              >{{ product.badge }}</span>
            </div>
            <p>{{ product.provider }}</p>
          </div>
          <div class="product-card__rate">
            <strong>{{ product.rateText }}</strong>
            <span>{{ product.rateLabel }}</span>
          </div>
        </div>

        <p class="product-card__description">
          {{ product.reason }}
        </p>

        <dl class="product-card__stats">
          <div>
            <dt>최소 납입</dt>
            <dd>{{ product.minDepositLabel }}</dd>
          </div>
          <div>
            <dt>최대 납입</dt>
            <dd>{{ product.maxDepositLabel }}</dd>
          </div>
          <div>
            <dt>위험도</dt>
            <dd class="product-card__risk">
              {{ product.riskLabel }}
            </dd>
          </div>
        </dl>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.product-screen {
  min-height: 100%;
  padding: 0 var(--layout-page-padding) calc(var(--page-bottom-navigation-space) + 20px);
  background: #f6f6f6;
  color: var(--gray-900);
}

.product-screen__header {
  display: flex;
  min-height: 76px;
  align-items: center;
  gap: 10px;
  padding: 10px 0;
}

.product-screen__header h1 {
  font-size: 20px;
  font-weight: 700;
  line-height: 1.5;
}

.back-button {
  display: grid;
  width: 24px;
  height: 24px;
  place-items: center;
  border: 0;
  background: transparent;
  cursor: pointer;
}

.back-button img {
  width: 10px;
  height: 17px;
}

.back-button:focus-visible {
  border-radius: 6px;
  outline: 2px solid var(--green-300);
  outline-offset: 2px;
}

.analysis-card {
  padding: 16px 20px;
  margin-top: 6px;
  border-radius: 26px;
  background: linear-gradient(116deg, #fff9dc 0%, #dfffd4 48%, #c4ffd9 100%);
}

.analysis-card__head {
  display: flex;
  align-items: center;
  gap: 10px;
}

.analysis-card__bot {
  display: grid;
  width: 34px;
  height: 34px;
  place-items: center;
  overflow: hidden;
  border-radius: 50%;
  background: rgb(255 255 255 / 58%);
}

.analysis-card__bot img {
  width: 27px;
  height: 27px;
  object-fit: cover;
  transform: scaleX(-1);
}

.analysis-card__head > div {
  display: flex;
  flex-direction: column;
}

.analysis-card__head strong {
  color: var(--gray-600);
  font-size: 14px;
  line-height: 1.5;
}

.analysis-card__head em {
  padding: 3px 9px;
  margin-left: 6px;
  border-radius: 20px;
  background: var(--olive-100);
  color: var(--olive-500);
  font-size: 10px;
  font-style: normal;
}

.analysis-card__head time {
  color: var(--gray-500);
  font-size: 13px;
  line-height: 1.5;
}

.analysis-card ul {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 14px 18px;
  margin-top: 8px;
  border-radius: 17px;
  background: rgb(255 255 255 / 90%);
  list-style: none;
}

.analysis-card li {
  display: flex;
  align-items: center;
  gap: 9px;
  color: var(--gray-600);
  font-size: 12px;
  font-weight: 700;
}

.analysis-card li > span {
  display: grid;
  width: 14px;
  height: 14px;
  place-items: center;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--yellow-400), var(--green-500));
  color: #fff;
  font-size: 10px;
}

.analysis-card li b {
  color: var(--green-700);
}

.product-screen__section-title {
  padding: 0 10px;
  margin-top: 12px;
  color: var(--gray-600);
  font-size: 14px;
  line-height: 1.5;
}

.product-screen__error {
  margin-top: 40px;
  color: var(--orange-600);
  font-size: 12px;
  text-align: center;
}

.product-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 0;
  margin-top: 9px;
  list-style: none;
}

.product-card {
  padding: 21px;
  border: 1px solid rgb(255 255 255 / 80%);
  border-radius: 24px;
  background: rgb(255 255 255 / 72%);
  box-shadow: 0 2px 16px rgb(0 0 0 / 5%);
}

.product-card__head {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.product-card__icon {
  display: grid;
  width: 44px;
  height: 44px;
  flex: none;
  place-items: center;
  border-radius: 14px;
  font-size: 20px;
}

.product-card--olive .product-card__icon {
  background: rgb(86 103 82 / 13%);
}

.product-card--yellow .product-card__icon {
  background: rgb(255 229 114 / 13%);
}

.product-card--green .product-card__icon {
  background: rgb(98 255 156 / 13%);
}

.product-card__title {
  min-width: 0;
  flex: 1;
}

.product-card__name {
  display: flex;
  align-items: center;
  gap: 8px;
}

.product-card__name strong {
  color: var(--gray-900);
  font-size: 14px;
  line-height: 1.5;
  word-break: keep-all;
}

.product-card__badge {
  flex: none;
  padding: 2px 6px;
  border-radius: 999px;
  background: rgb(98 255 156 / 25%);
  color: var(--green-900);
  font-size: 9px;
  font-weight: 700;
}

.product-card__title p {
  margin-top: 2px;
  color: #aaa;
  font-size: 11px;
  line-height: 1.5;
}

.product-card__rate {
  flex: none;
  text-align: right;
}

.product-card__rate strong {
  display: block;
  font-size: 20px;
  line-height: 1.5;
}

.product-card__rate span {
  display: block;
  font-size: 10px;
  line-height: 1.5;
}

.product-card--olive .product-card__rate strong {
  color: var(--olive-500);
}

.product-card--olive .product-card__rate span {
  color: rgb(86 103 82 / 80%);
}

.product-card--yellow .product-card__rate strong {
  color: var(--yellow-400);
}

.product-card--yellow .product-card__rate span {
  color: rgb(255 229 114 / 80%);
}

.product-card--green .product-card__rate strong {
  color: var(--green-500);
}

.product-card--green .product-card__rate span {
  color: rgb(98 255 156 / 80%);
}

.product-card__description {
  margin-top: 12px;
  color: #666;
  font-size: 12px;
  line-height: 1.55;
}

.product-card__stats {
  display: flex;
  gap: 16px;
  margin-top: 12px;
}

.product-card__stats dt {
  color: #aaa;
  font-size: 10px;
  line-height: 1.5;
}

.product-card__stats dd {
  margin: 0;
  color: #555;
  font-size: 12px;
  font-weight: 700;
  line-height: 1.5;
}

.product-card__stats dd.product-card__risk {
  color: var(--green-900);
}

@media (max-width: 360px) {
  .product-card {
    padding: 17px;
  }

  .product-card__head {
    gap: 8px;
  }

  .product-card__stats {
    gap: 12px;
  }
}
</style>
