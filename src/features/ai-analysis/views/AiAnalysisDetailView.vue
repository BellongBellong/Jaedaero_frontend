<script setup>
import BaseBadge from '@/common/components/BaseBadge.vue'
import BaseCard from '@/common/components/common/BaseCard.vue'
import BaseIcon from '@/common/components/common/BaseIcon.vue'
import BottomNavigation from '@/components/layout/BottomNavigation.vue'

const marketIndicators = [
  { id: 'kospi-primary', name: '코스피', value: '2,740.12', change: '+1.34%', direction: 'up' },
  { id: 'kospi-secondary', name: '코스피', value: '2,740.12', change: '+1.34%', direction: 'up' },
  { id: 'us-treasury', name: '미국채 10년', value: '4.31%', change: '-0.05%', direction: 'down' },
  { id: 'usd-krw', name: '원/달러', value: '1,318원', change: '-0.05%', direction: 'down' },
]

const militaryProducts = [
  { name: '장병내일준비적금', rate: '5.0%', change: '+1.34%', direction: 'up' },
  { name: '군인공제회 목돈급여', rate: '5.2%', change: '+0.1%p', direction: 'up' },
  { name: '미국채 10년', rate: '4.31%', change: '변동없음', direction: 'neutral' },
]

const recommendations = [
  {
    title: '그냥 서브타이틀',
    badge: '추천',
    tone: 'success',
    description:
      '현재 시중 최고 금리 5.2% 제공. 여유 자금을 추가 납입하면 전역 자산 +약 32만원이 기대됩니다',
  },
  {
    title: '그냥 서브타이틀',
    badge: '참고',
    tone: 'neutral',
    description:
      '현재 시중 최고 금리 5.2% 제공. 여유 자금을 추가 납입하면 전역 자산 +약 32만원이 기대됩니다.',
  },
  {
    title: '통신비 플랜 최적화',
    badge: '참고',
    tone: 'neutral',
    description: '군인 할인 통신 플랜으로 월 최대 8,000원 절약 가능.',
  },
]

const navigationItems = [
  { id: 'home', icon: 'home', label: '홈' },
  { id: 'coach', icon: 'sparkles', label: 'AI 코치' },
  { id: 'challenge', icon: 'target', label: '챌린지' },
  { id: 'profile', icon: 'user', label: '내 정보' },
]
</script>

<template>
  <main class="analysis-detail-view">
    <div class="analysis-detail-view__glow" />

    <div class="analysis-detail-view__content">
      <header class="report-header">
        <button
          class="report-header__back"
          type="button"
          aria-label="뒤로 가기"
        >
          <BaseIcon
            name="chevron-left"
            :size="24"
            :stroke-width="2.4"
            decorative
          />
        </button>
        <h1>오늘의 AI 투자 리포트</h1>
        <BaseBadge
          class="beta-badge"
          tone="primary"
          size="sm"
        >
          BETA
        </BaseBadge>
      </header>

      <BaseCard
        class="market-report-card"
        padding="none"
      >
        <div class="market-report-card__heading">
          <div class="market-report-card__title-row">
            <h2>오늘의 AI 투자 리포트</h2>
            <BaseBadge
              class="beta-badge beta-badge--card"
              tone="primary"
              size="sm"
            >
              BETA
            </BaseBadge>
          </div>
          <time datetime="2026-07-28">2026. 07. 28 기준</time>
        </div>

        <dl class="indicator-list">
          <div
            v-for="indicator in marketIndicators"
            :key="indicator.id"
            class="indicator-row"
          >
            <dt>{{ indicator.name }}</dt>
            <dd>{{ indicator.value }}</dd>
            <BaseBadge
              class="rate-badge"
              :tone="indicator.direction === 'up' ? 'success' : 'danger'"
              size="sm"
            >
              {{ indicator.change }}
            </BaseBadge>
          </div>
        </dl>
      </BaseCard>

      <BaseCard
        class="product-trend-card"
        padding="none"
      >
        <div class="section-card-title">
          <span
            class="medal-icon"
            aria-hidden="true"
          >🏅</span>
          <h2>군 금융 상품 동향</h2>
        </div>

        <dl class="product-list">
          <div
            v-for="product in militaryProducts"
            :key="product.name"
            class="product-row"
          >
            <dt>{{ product.name }}</dt>
            <dd>{{ product.rate }}</dd>
            <BaseBadge
              class="rate-badge"
              :tone="product.direction === 'up' ? 'success' : 'neutral'"
              size="sm"
            >
              {{ product.change }}
            </BaseBadge>
          </div>
        </dl>
      </BaseCard>

      <section
        class="recommendation-section"
        aria-labelledby="recommendation-title"
      >
        <h2 id="recommendation-title">
          AI 추천 액션
        </h2>

        <div class="recommendation-list">
          <BaseCard
            v-for="recommendation in recommendations"
            :key="`${recommendation.title}-${recommendation.badge}`"
            class="recommendation-card"
            variant="elevated"
            padding="none"
          >
            <span
              class="medal-icon recommendation-card__medal"
              aria-hidden="true"
            >🏅</span>
            <div class="recommendation-card__content">
              <div class="recommendation-card__heading">
                <h3>{{ recommendation.title }}</h3>
                <BaseBadge
                  class="action-badge"
                  :tone="recommendation.tone"
                  size="sm"
                >
                  {{ recommendation.badge }}
                </BaseBadge>
              </div>
              <p>{{ recommendation.description }}</p>
            </div>
          </BaseCard>
        </div>
      </section>
    </div>

    <BottomNavigation
      class="report-bottom-navigation"
      :items="navigationItems"
      active-id="coach"
      aria-label="주요 메뉴"
    />
  </main>
</template>

<style scoped>
.analysis-detail-view {
  position: relative;
  width: min(100%, 390px);
  min-height: 100svh;
  margin: 0 auto;
  overflow: hidden;
  color: #252a27;
  background: linear-gradient(180deg, #c9f9da 0%, #e9fbef 24%, #f7f8f7 54%, #f8f8f8 100%);
}

.analysis-detail-view__glow {
  position: absolute;
  top: -95px;
  right: -110px;
  width: 380px;
  height: 390px;
  border-radius: 50%;
  background: radial-gradient(circle, rgb(99 244 151 / 24%), transparent 68%);
  filter: blur(18px);
  pointer-events: none;
}

.analysis-detail-view__content {
  position: relative;
  z-index: 1;
  padding: 30px 18px 118px;
}

.report-header {
  display: flex;
  min-height: 58px;
  align-items: center;
  gap: 8px;
  padding: 0 2px;
  margin-bottom: 10px;
}

.report-header__back {
  display: grid;
  width: 26px;
  height: 38px;
  flex: 0 0 26px;
  padding: 0;
  border: 0;
  color: #26302a;
  background: transparent;
  place-items: center;
}

.report-header h1 {
  margin: 0;
  font-size: 18px;
  font-weight: 800;
  line-height: 1.25;
  letter-spacing: -0.035em;
}

.beta-badge {
  min-height: 18px;
  padding: 0 7px;
  color: #4a7657;
  background: #e5f1e7;
  font-size: 9px;
}

.market-report-card,
.product-trend-card,
.recommendation-card {
  border-color: rgb(255 255 255 / 78%);
}

.market-report-card {
  padding: 18px 18px 14px;
  border-radius: 22px;
  background: rgb(255 255 255 / 62%);
  box-shadow: 0 6px 18px rgb(67 106 80 / 7%);
}

.market-report-card__heading {
  margin-bottom: 10px;
}

.market-report-card__title-row {
  display: flex;
  align-items: center;
  gap: 9px;
}

.market-report-card h2,
.section-card-title h2,
.recommendation-section > h2,
.recommendation-card h3 {
  margin: 0;
}

.market-report-card h2 {
  color: #6f7772;
  font-size: 12px;
  font-weight: 700;
}

.beta-badge--card {
  min-height: 17px;
  font-size: 8px;
}

.market-report-card time {
  display: block;
  margin-top: 5px;
  color: #949a96;
  font-size: 11px;
  line-height: 1.4;
}

.indicator-list,
.product-list {
  margin: 0;
}

.indicator-row,
.product-row {
  display: grid;
  align-items: center;
  border-bottom: 1px solid rgb(116 134 123 / 11%);
}

.indicator-row {
  grid-template-columns: minmax(0, 1fr) 72px 59px;
  min-height: 42px;
  column-gap: 9px;
}

.indicator-row:last-child,
.product-row:last-child {
  border-bottom: 0;
}

.indicator-row dt,
.product-row dt {
  min-width: 0;
  color: #252a27;
  font-size: 11px;
  font-weight: 700;
}

.indicator-row dd,
.product-row dd {
  justify-self: end;
  margin: 0;
  color: #5e6661;
  font-size: 11px;
}

.rate-badge {
  justify-self: end;
  min-height: 20px;
  padding: 0 8px;
  font-size: 9px;
  font-weight: 700;
}

.rate-badge.base-badge--success {
  color: #0fc761;
  background: #e5faed;
}

.rate-badge.base-badge--danger {
  color: #ff6d5c;
  background: #fff0ed;
}

.rate-badge.base-badge--neutral {
  color: #7f8581;
  background: #efefef;
}

.product-trend-card {
  margin-top: 9px;
  padding: 18px 18px 13px;
  border-radius: 21px;
  background: rgb(255 255 255 / 76%);
  box-shadow: 0 5px 16px rgb(61 79 67 / 5%);
}

.section-card-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 9px;
}

.section-card-title h2 {
  font-size: 12px;
  font-weight: 800;
}

.medal-icon {
  display: inline-grid;
  width: 16px;
  height: 18px;
  flex: 0 0 16px;
  font-size: 14px;
  line-height: 1;
  place-items: center;
}

.product-row {
  grid-template-columns: minmax(0, 1fr) 46px 62px;
  min-height: 39px;
  column-gap: 8px;
}

.recommendation-section {
  margin-top: 13px;
}

.recommendation-section > h2 {
  margin-bottom: 10px;
  font-size: 13px;
  font-weight: 800;
}

.recommendation-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.recommendation-card {
  padding: 14px 17px;
  border-color: #f7f5f2;
  border-radius: 20px;
  background: #fffefc;
  box-shadow: 0 6px 18px rgb(0 0 0 / 4%);
}

.recommendation-card :deep(.base-card__body) {
  display: grid;
  grid-template-columns: 18px minmax(0, 1fr);
  gap: 9px;
}

.recommendation-card__medal {
  margin-top: 1px;
}

.recommendation-card__content {
  min-width: 0;
}

.recommendation-card__heading {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 18px;
}

.recommendation-card h3 {
  overflow: hidden;
  color: #5f5f5f;
  font-size: 11px;
  font-weight: 600;
  line-height: 1.35;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.action-badge {
  min-height: 18px;
  padding: 0 7px;
  font-size: 8px;
}

.action-badge.base-badge--success {
  color: #35b86b;
  background: #eafbf1;
}

.action-badge.base-badge--neutral {
  color: #8a8a8a;
  background: #f1f3f2;
}

.recommendation-card p {
  margin: 5px 0 0;
  color: #909090;
  font-size: 9px;
  line-height: 1.55;
}

.report-bottom-navigation.bottom-navigation--fixed {
  right: auto;
  bottom: 38px;
  left: 50%;
  width: min(calc(100% - 96px), 270px);
  padding: 0;
  border: 0;
  border-radius: 999px;
  background: rgb(101 123 108 / 34%);
  box-shadow: 0 8px 20px rgb(42 66 50 / 10%);
  transform: translateX(-50%);
  backdrop-filter: blur(15px);
}

.report-bottom-navigation :deep(.bottom-navigation__list) {
  width: 100%;
  min-height: 59px;
  padding: 5px 12px;
}

.report-bottom-navigation :deep(.bottom-navigation__link) {
  min-height: 42px;
  padding: 0;
  border-radius: 50%;
  color: #fff;
}

.report-bottom-navigation :deep(.bottom-navigation__link:hover:not(:disabled)) {
  color: #fff;
  background: rgb(255 255 255 / 12%);
}

.report-bottom-navigation :deep(.bottom-navigation__link--active) {
  color: #fff;
  background: #20c579;
  box-shadow: 0 3px 9px rgb(0 134 77 / 20%);
}

.report-bottom-navigation :deep(.bottom-navigation__label) {
  display: none;
}

@media (min-width: 391px) {
  .analysis-detail-view {
    box-shadow: 0 0 36px rgb(0 0 0 / 12%);
  }
}

@media (max-width: 360px) {
  .analysis-detail-view__content {
    padding-right: 14px;
    padding-left: 14px;
  }

  .report-header h1 {
    font-size: 17px;
  }

  .market-report-card,
  .product-trend-card {
    padding-right: 15px;
    padding-left: 15px;
  }
}
</style>
