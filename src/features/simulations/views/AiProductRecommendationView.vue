<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

import backArrowIcon from '@/assets/icons/backArrowIcon.svg'
import { useOnboardingStore } from '@/features/onboarding/stores/onboarding.store'
import { getProductRecommendations } from '@/features/reports/api/reports.api'

const PRODUCT_EMOJIS = {
  '군인공제회 목돈급여': '🏅',
  'CMA 통장': '💛',
  '나라사랑카드 CMA': '🏦',
}

// 피그마 도안 기준: 금리 톤이 아이콘 타일 배경·금리 색상 테마를 결정한다.
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

const router = useRouter()
const onboarding = useOnboardingStore()

const products = ref([])
const errorMessage = ref('')

const nickname = computed(() => onboarding.form.nickname || '윤호')

const recommendedProducts = computed(() =>
  products.value.map((product) => ({
    ...product,
    emoji: PRODUCT_EMOJIS[product.productName] ?? '🏦',
    themeClass: RATE_TONE_THEMES[product.rateTone] ?? 'product-card--olive',
    rateText: product.expectedReturnRate == null ? '-' : `${product.expectedReturnRate}%`,
    riskLabel: RISK_GRADE_LABELS[product.riskGrade] ?? '-',
  })),
)

onMounted(async () => {
  try {
    const response = await getProductRecommendations()
    products.value = Array.isArray(response) ? response : []
  } catch {
    errorMessage.value = '추천 상품을 불러오지 못했어요. 잠시 후 다시 시도해주세요.'
  }
})
</script>

<template>
  <section class="product-screen">
    <header class="product-screen__header">
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
      <h1>투자상품 추천</h1>
    </header>

    <p class="product-screen__intro">
      {{ nickname }}님의 전역 목표와 리스크 성향을<br>
      바탕으로 선별한 투자상품 추천들이에요.
    </p>

    <p
      v-if="errorMessage"
      class="product-screen__error"
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
  /* 86px = 하단 네비게이션 높이(66px) + 하단 여백(20px) */
  min-height: calc(100dvh - 86px);
  padding: 0 var(--layout-page-padding) var(--space-40);
  background:
    radial-gradient(
      ellipse 550px 720px at 92% 98%,
      var(--yellow-400) 0%,
      rgb(255 236 189 / 0%) 100%
    ),
    radial-gradient(
      ellipse 150px 190px at 72% 24%,
      var(--orange-200) 0%,
      rgb(255 236 189 / 0%) 100%
    ),
    radial-gradient(circle 550px at 0% 102%, var(--green-500) 0%, rgb(98 255 156 / 0%) 100%),
    #f6f6f6;
}

.product-screen__header {
  display: flex;
  min-height: 76px;
  align-items: center;
  gap: 6px;
  padding: var(--space-10) 0;
}

.product-screen__header h1 {
  color: var(--gray-900);
  font-size: var(--text-h5);
  font-weight: var(--weight-bold);
  line-height: var(--leading-normal);
}

.back-button {
  display: grid;
  width: 24px;
  height: 24px;
  place-items: center;
}

.back-button img {
  width: 10px;
  height: 17px;
}

.product-screen__intro {
  padding: 0 var(--space-20);
  margin-top: var(--space-10);
  color: var(--ui-sub-title);
  font-size: var(--text-md);
  letter-spacing: -0.32px;
  line-height: var(--leading-normal);
}

.product-screen__error {
  margin-top: var(--space-40);
  color: var(--orange-600);
  font-size: var(--text-sm);
  text-align: center;
}

.product-list {
  display: flex;
  flex-direction: column;
  padding: 0;
  margin-top: var(--space-10);
  gap: var(--space-10);
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
  gap: var(--space-12);
}

.product-card__icon {
  display: grid;
  width: 44px;
  height: 44px;
  flex: none;
  place-items: center;
  border-radius: var(--radius-md);
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
  gap: var(--space-8);
}

.product-card__name strong {
  color: var(--gray-900);
  font-size: var(--text-sm);
  font-weight: var(--weight-bold);
  line-height: var(--leading-normal);
  word-break: keep-all;
}

.product-card__badge {
  flex: none;
  padding: 2px 6px;
  border-radius: var(--radius-full);
  background: rgb(98 255 156 / 25%);
  color: var(--green-900);
  font-size: 9px;
  font-weight: var(--weight-bold);
  line-height: var(--leading-normal);
  white-space: nowrap;
}

.product-card__title p {
  margin-top: 2px;
  color: #aaa;
  font-size: 11px;
  line-height: var(--leading-normal);
}

.product-card__rate {
  flex: none;
  text-align: right;
}

.product-card__rate strong {
  display: block;
  font-size: var(--text-h5);
  font-weight: var(--weight-bold);
  line-height: var(--leading-normal);
}

.product-card__rate span {
  display: block;
  font-size: 10px;
  line-height: var(--leading-normal);
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
  margin-top: var(--space-12);
  color: #666;
  font-size: var(--text-xs);
  line-height: 1.55;
}

.product-card__stats {
  display: flex;
  margin-top: var(--space-12);
  gap: var(--space-16);
}

.product-card__stats dt {
  color: #aaa;
  font-size: 10px;
  line-height: var(--leading-normal);
}

.product-card__stats dd {
  color: #555;
  font-size: var(--text-xs);
  font-weight: var(--weight-bold);
  line-height: 1.5;
}

.product-card__stats dd.product-card__risk {
  color: var(--green-900);
}
</style>
