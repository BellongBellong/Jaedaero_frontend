<script setup>
import { useRoute, useRouter } from 'vue-router'

import pencilIcon from '@/assets/icons/pencilIcon.svg'
import { useWhatIfDetail } from '@/features/ai-analysis/composables/useWhatIfDetail'

const route = useRoute()
const router = useRouter()
const { detail, loading } = useWhatIfDetail(route.params.simulationId)

function resimulate() {
  router.push({ name: 'what-if-simulation' })
}
</script>

<template>
  <section class="what-if-detail screen">
    <p
      v-if="loading || !detail"
      class="what-if-detail__loading"
    >
      시뮬레이션을 불러오는 중이에요.
    </p>

    <template v-else>
      <article class="summary-card">
        <header class="summary-card__header">
          <div class="summary-card__title">
            <strong>{{ detail.title }}</strong>
            <button
              type="button"
              class="summary-card__rename"
              aria-label="계획 이름 수정"
            >
              <img
                :src="pencilIcon"
                alt=""
                aria-hidden="true"
              >
            </button>
          </div>
          <div class="summary-card__badges">
            <span class="pill pill--gray">What-if</span>
            <span
              v-if="detail.applied"
              class="pill pill--green"
            >
              적용중인 전략
            </span>
          </div>
        </header>

        <div class="summary-card__asset">
          <p>전역 예상 자산</p>
          <strong>{{ detail.projectedAsset }}</strong>
        </div>

        <dl class="summary-card__stats">
          <div class="summary-card__stat">
            <dt>목표 금액</dt>
            <dd>{{ detail.targetAmount }}</dd>
          </div>
          <span
            class="summary-card__divider"
            aria-hidden="true"
          />
          <div class="summary-card__stat">
            <dt>목표 수익률</dt>
            <dd>{{ detail.targetReturnRate }}</dd>
          </div>
          <span
            class="summary-card__divider"
            aria-hidden="true"
          />
          <div class="summary-card__stat">
            <dt>재정적 전역일</dt>
            <dd>{{ detail.financialDischargeDate }}</dd>
          </div>
        </dl>
      </article>

      <article class="panel">
        <header class="panel__header">
          <h2>월급 배분 계획</h2>
          <p>기준 월급 {{ detail.baseSalary }}</p>
        </header>

        <div
          class="allocation-bar"
          role="img"
          :aria-label="`투자 ${detail.allocations[0].percent}%, 군적금 ${detail.allocations[1].percent}%, 소비 ${detail.allocations[2].percent}%, 미배분 ${detail.allocations[3].percent}%`"
        >
          <span
            v-for="allocation in detail.allocations"
            :key="allocation.key"
            class="allocation-bar__segment"
            :class="`allocation-bar__segment--${allocation.tone}`"
            :style="{ width: `${allocation.percent}%` }"
          />
        </div>

        <ul class="allocation-legend">
          <li
            v-for="allocation in detail.allocations"
            :key="allocation.key"
          >
            <span
              class="allocation-legend__dot"
              :class="`allocation-legend__dot--${allocation.tone}`"
              aria-hidden="true"
            />
            <span class="allocation-legend__label">{{ allocation.label }}</span>
            <span class="allocation-legend__percent">{{ allocation.percent }}%</span>
          </li>
        </ul>
      </article>

      <article class="panel">
        <header class="panel__header">
          <h2>월 납입 금액</h2>
        </header>
        <dl class="payment-list">
          <div
            v-for="payment in detail.payments"
            :key="payment.label"
            class="payment-list__row"
          >
            <dt>{{ payment.label }}</dt>
            <dd>{{ payment.value }}</dd>
          </div>
        </dl>
      </article>

      <button
        type="button"
        class="resimulate-button"
        @click="resimulate"
      >
        이 조건으로 다시 시뮬레이션
      </button>
    </template>
  </section>
</template>

<style scoped>
.what-if-detail {
  display: flex;
  flex-direction: column;
  gap: 20px;
  min-height: 100%;
  padding: 10px 20px calc(var(--page-bottom-navigation-space) + var(--safe-area-bottom) + 20px);
  background: var(--ui-background);
}

.what-if-detail__loading {
  display: grid;
  min-height: 240px;
  place-items: center;
  color: var(--ui-sub-title);
  font-size: 14px;
}

/* ---- 요약 카드 ---- */
.summary-card {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 20px 20px 16px;
  border-radius: 28px;
  background:
    linear-gradient(
      217deg,
      rgb(130 255 175 / 50%) 0%,
      rgb(255 241 186 / 50%) 79%,
      rgb(255 231 222 / 50%) 119%
    ),
    var(--white);
}

.summary-card__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
}

.summary-card__title {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
}

.summary-card__title strong {
  color: var(--gray-600);
  font-size: 14px;
  font-weight: var(--weight-bold);
  line-height: 1.5;
}

.summary-card__rename {
  display: grid;
  width: 14px;
  height: 14px;
  flex: 0 0 auto;
  padding: 0;
  border: 0;
  background: transparent;
  cursor: pointer;
  place-items: center;
}

.summary-card__rename img {
  width: 13px;
  height: 13px;
}

.summary-card__badges {
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  gap: 10px;
}

.summary-card__asset p {
  color: #888;
  font-size: 12px;
  line-height: 1.3;
}

.summary-card__asset strong {
  color: var(--ui-text);
  font-size: 32px;
  font-weight: var(--weight-bold);
  letter-spacing: -0.32px;
  line-height: 1.4;
}

.summary-card__stats {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 60px;
  padding: 10px 0;
  margin: 0;
  border-radius: 14px;
  background: var(--white);
}

.summary-card__stat {
  display: flex;
  min-width: 0;
  flex: 1;
  flex-direction: column;
  align-items: center;
  color: var(--ui-sub-title);
}

.summary-card__stat dt {
  font-size: 12px;
  line-height: 1.5;
}

.summary-card__stat dd {
  margin: 0;
  font-size: 14px;
  font-weight: var(--weight-bold);
  font-variant-numeric: tabular-nums;
  line-height: 1.5;
  white-space: nowrap;
}

.summary-card__divider {
  width: 1px;
  height: 24px;
  flex: 0 0 auto;
  background: var(--ui-sub-title-light);
}

.pill {
  padding: 2px 10px;
  border-radius: var(--radius-full);
  font-size: 12px;
  font-weight: var(--weight-bold);
  line-height: 1.5;
  white-space: nowrap;
}

.pill--gray {
  background: var(--gray-200);
  color: var(--gray-600);
}

.pill--green {
  background: var(--green-100);
  color: #22c55e;
}

/* ---- 공통 패널 ---- */
.panel {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 20px 16px;
  border-radius: 20px;
  background: var(--white);
}

.panel__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.panel__header h2 {
  margin: 0;
  color: var(--ui-sub-title);
  font-size: 14px;
  font-weight: var(--weight-bold);
  line-height: 1.5;
}

.panel__header p {
  color: #888;
  font-size: 12px;
  line-height: 1.3;
  white-space: nowrap;
}

/* ---- 월급 배분 그래프 ----
   시안은 구간을 띄우지 않고 하나의 알약 모양으로 이어 붙이고, 구간마다 가로 그라데이션을 준다.
   그라데이션 양 끝 색은 시안에서 추출한 값이라 토큰에 없는 색이 섞여 있다. */
.allocation-bar {
  display: flex;
  height: 20px;
  overflow: hidden;
  border-radius: 50px;
  background: var(--ui-light-gray);
}

.allocation-bar__segment {
  height: 100%;
}

.allocation-bar__segment--olive {
  background: linear-gradient(90deg, var(--olive-500) 0%, #ccd5c8 100%);
}

.allocation-bar__segment--green {
  background: linear-gradient(90deg, #5eb880 0%, #91ebb3 100%);
}

.allocation-bar__segment--orange {
  background: linear-gradient(90deg, #ec947c 0%, #fed2c3 100%);
}

/* 미배분 구간은 트랙이 그대로 비치게 둔다. */
.allocation-bar__segment--gray {
  background: transparent;
}

.allocation-legend {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  padding: 0 10px;
  margin: 0;
  gap: 10px 0;
  list-style: none;
}

.allocation-legend li {
  display: flex;
  min-height: 18px;
  align-items: center;
  gap: 7px;
  padding: 0 10px;
  color: #888;
  font-size: 12px;
  line-height: 1.5;
}

.allocation-legend__dot {
  width: 9px;
  height: 9px;
  flex: 0 0 auto;
  border-radius: 50%;
}

/* 점도 막대와 같은 그라데이션을 쓴다. */
.allocation-legend__dot--olive {
  background: linear-gradient(135deg, var(--olive-500) 0%, #ccd5c8 100%);
}

.allocation-legend__dot--green {
  background: linear-gradient(135deg, #5eb880 0%, #91ebb3 100%);
}

.allocation-legend__dot--orange {
  background: linear-gradient(135deg, #ec947c 0%, #fed2c3 100%);
}

.allocation-legend__dot--gray {
  background: var(--ui-light-gray);
}

.allocation-legend__label {
  flex: 1;
}

.allocation-legend__percent {
  font-variant-numeric: tabular-nums;
}

/* ---- 월 납입 금액 ---- */
.payment-list {
  margin: 0;
}

.payment-list__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 10px 0 11px;
  border-bottom: 1px solid var(--ui-light-gray);
}

.payment-list__row:last-child {
  padding: 5px 0;
  border-bottom: 0;
}

.payment-list__row dt {
  color: var(--gray-900);
  font-size: 12px;
  font-weight: var(--weight-bold);
  line-height: 1.5;
}

.payment-list__row dd {
  margin: 0;
  color: var(--gray-600);
  font-size: 13px;
  font-weight: var(--weight-semibold);
  font-variant-numeric: tabular-nums;
  line-height: 1.5;
  white-space: nowrap;
}

/* ---- CTA ---- */
.resimulate-button {
  display: flex;
  min-height: 50px;
  align-items: center;
  justify-content: center;
  padding: 0 20px;
  border: 0;
  border-radius: 28px;
  background: var(--green-500);
  color: var(--ui-text);
  cursor: pointer;
  font-family: inherit;
  font-size: 16px;
  font-weight: var(--weight-bold);
  letter-spacing: -0.32px;
  line-height: 1.5;
}

@media (prefers-reduced-motion: no-preference) {
  .resimulate-button {
    transition: transform var(--duration-fast) var(--ease-default);
  }

  .resimulate-button:active {
    transform: scale(0.98);
  }
}
</style>
