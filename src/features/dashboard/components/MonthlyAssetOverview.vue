<script setup>
import { computed } from 'vue'

import assetBlock from '@/assets/icons/account/assetBlock.png'
import consumptionBlock from '@/assets/icons/account/consumptionBlock.png'
import investBlock from '@/assets/icons/account/investBlock.png'

const props = defineProps({
  data: {
    type: Object,
    default: null,
  },
  showReportLink: {
    type: Boolean,
    default: true,
  },
})

defineEmits(['view-report'])

const spendingRate = computed(() => {
  const amount = props.data?.spending?.amount ?? 0
  const target = props.data?.spending?.targetAmount ?? 0

  return target > 0 ? Math.min((amount / target) * 100, 100) : 0
})

const isSpendingOver = computed(
  () => (props.data?.spending?.amount ?? 0) > (props.data?.spending?.targetAmount ?? 0),
)

function formatWon(value) {
  return `${Number(value || 0).toLocaleString('ko-KR')}원`
}
</script>

<template>
  <div
    v-if="data"
    class="monthly-assets"
  >
    <article class="monthly-assets__income">
      <div class="monthly-assets__heading">
        <img
          :src="assetBlock"
          alt=""
          aria-hidden="true"
        >
        <span>수입</span>
      </div>
      <div class="monthly-assets__income-value">
        <div>
          <strong>{{ formatWon(data.income.amount) }}</strong>
          <span class="monthly-assets__badge">+{{ data.income.changeRate }}%</span>
        </div>
        <small>{{ data.income.description }}</small>
      </div>
    </article>

    <div class="monthly-assets__lower">
      <article class="monthly-assets__tile monthly-assets__tile--investment">
        <div class="monthly-assets__heading">
          <img
            :src="investBlock"
            alt=""
            aria-hidden="true"
          >
          <span>투자</span>
        </div>
        <strong>{{ formatWon(data.investment.amount) }}</strong>
        <div class="monthly-assets__investment-change">
          <span>+ {{ Number(data.investment.changeAmount).toLocaleString('ko-KR') }}</span>
          <span class="monthly-assets__badge">+{{ data.investment.changeRate }}%</span>
        </div>
      </article>

      <RouterLink
        class="monthly-assets__tile monthly-assets__tile--spending"
        :to="{ name: 'monthly-asset-report' }"
        aria-label="이번 달 자산 현황 리포트 보기"
      >
        <div class="monthly-assets__heading">
          <img
            :src="consumptionBlock"
            alt=""
            aria-hidden="true"
          >
          <span>지출</span>
          <span
            class="monthly-assets__status"
            :class="{ 'monthly-assets__status--safe': !isSpendingOver }"
          >
            {{ isSpendingOver ? '초과 ▲' : '여유' }}
          </span>
        </div>
        <strong>{{ formatWon(data.spending.amount) }}</strong>
        <div class="monthly-assets__progress">
          <span :style="{ width: `${spendingRate}%` }" />
        </div>
        <small>목표 {{ formatWon(data.spending.targetAmount) }}</small>
      </RouterLink>
    </div>

    <button
      v-if="showReportLink"
      class="monthly-assets__report"
      type="button"
      @click="$emit('view-report')"
    >
      전체 리포트 보기 <span aria-hidden="true">›</span>
    </button>
  </div>

  <p
    v-else
    class="monthly-assets__empty"
  >
    이번 달 자산 현황이 없어요.
  </p>
</template>

<style scoped>
.monthly-assets {
  display: flex;
  width: 100%;
  flex-direction: column;
  gap: var(--dashboard-card-gap);
}

.monthly-assets article {
  color: var(--gray-900);
}

.monthly-assets__income {
  display: flex;
  min-height: 68px;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--dashboard-gap);
  padding: 10px 16px;
  border-radius: 20px;
  background: linear-gradient(90deg, rgb(255 255 255 / 20%), rgb(166 255 199 / 20%));
}

.monthly-assets__heading {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 8px;
  color: var(--gray-600);
  font-size: 14px;
  font-weight: var(--weight-bold);
}

.monthly-assets__heading img {
  width: 30px;
  height: 30px;
  object-fit: contain;
}

.monthly-assets__income-value {
  display: grid;
  min-width: 0;
  gap: 2px;
}

.monthly-assets__income-value > div {
  display: flex;
  align-items: center;
  gap: 4px;
}

.monthly-assets strong {
  font-size: 14px;
  line-height: 1.5;
  white-space: nowrap;
}

.monthly-assets small {
  color: var(--gray-400);
  font-size: 11px;
  line-height: 1.3;
}

.monthly-assets__badge {
  padding: 2px 9px;
  border-radius: 20px;
  background: var(--green-100);
  color: var(--dashboard-success);
  font-size: 12px;
  font-weight: var(--weight-bold);
  white-space: nowrap;
}

.monthly-assets__lower {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--dashboard-card-gap);
}

.monthly-assets__tile {
  display: flex;
  min-width: 0;
  min-height: 98px;
  flex-direction: column;
  gap: 3px;
  padding: 10px 12px;
  border-radius: 20px;
}

.monthly-assets__tile--investment {
  background: linear-gradient(270deg, rgb(255 255 255 / 10%), rgb(174 187 167 / 12%));
}

.monthly-assets__tile--spending {
  background: linear-gradient(270deg, rgb(255 255 255 / 10%), rgb(255 163 131 / 12%));
  color: var(--gray-900);
  cursor: pointer;
  text-decoration: none;
  transition:
    transform 160ms ease,
    box-shadow 160ms ease;
}

.monthly-assets__tile--spending:active {
  transform: scale(0.98);
}

.monthly-assets__tile--spending:focus-visible {
  outline: 3px solid var(--orange-200);
  outline-offset: 2px;
}

.monthly-assets__tile .monthly-assets__heading {
  gap: 6px;
}

.monthly-assets__status {
  margin-left: auto;
  padding: 2px 7px;
  border-radius: 20px;
  background: var(--orange-100);
  color: var(--orange-600);
  font-size: 11px;
  white-space: nowrap;
}

.monthly-assets__status--safe {
  background: var(--green-100);
  color: var(--green-700);
}

.monthly-assets__investment-change {
  display: flex;
  align-items: center;
  gap: 5px;
  color: var(--dashboard-success);
  font-size: 11px;
}

.monthly-assets__progress {
  height: 6px;
  overflow: hidden;
  border-radius: 3px;
  background: var(--gray-200);
}

.monthly-assets__progress span {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(270deg, var(--orange-600), var(--orange-200));
}

.monthly-assets__tile--spending small {
  align-self: flex-end;
}

.monthly-assets__report {
  align-self: flex-end;
  padding: 2px 0;
  border: 0;
  background: transparent;
  color: var(--olive-400);
  cursor: pointer;
  font-size: 12px;
}

.monthly-assets__report span {
  color: var(--gray-400);
  font-size: 20px;
  vertical-align: -2px;
}

.monthly-assets__empty {
  display: grid;
  min-height: 190px;
  place-items: center;
  margin: 0;
  color: var(--gray-500);
  font-size: 13px;
}

@media (max-width: 350px) {
  .monthly-assets__income,
  .monthly-assets__income-value > div {
    align-items: flex-start;
    flex-direction: column;
  }

  .monthly-assets__lower {
    grid-template-columns: 1fr;
  }
}

@media (prefers-reduced-motion: reduce) {
  .monthly-assets__tile--spending {
    transition: none;
  }
}
</style>
