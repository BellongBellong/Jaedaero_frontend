<script setup>
import { computed } from 'vue'

import assetBlockIcon from '@/assets/icons/account/assetBlock.png'
import arrowIcon from '@/assets/icons/arrow.svg'
import pencilIcon from '@/assets/icons/pencilIcon.svg'

const props = defineProps({
  spentAmount: { type: Number, default: 0 },
  budget: { type: Number, default: null },
  loading: { type: Boolean, default: false },
})

defineEmits(['edit', 'view-transactions'])

const hasBudget = computed(() => props.budget !== null && Number.isFinite(props.budget))
const status = computed(() => {
  if (!hasBudget.value || props.spentAmount === props.budget) return null
  return props.spentAmount < props.budget ? '여유' : '초과'
})
const progress = computed(() => {
  if (!hasBudget.value || props.budget <= 0) return 0
  return Math.min(100, Math.round((props.spentAmount / props.budget) * 100))
})

function formatWon(amount) {
  return `${Number(amount || 0).toLocaleString('ko-KR')}원`
}
</script>

<template>
  <section
    class="vacation-budget"
    aria-labelledby="vacation-budget-title"
  >
    <div class="vacation-budget__heading">
      <img
        :src="assetBlockIcon"
        alt=""
        aria-hidden="true"
      >
      <h2 id="vacation-budget-title">
        휴가 예산
      </h2>
      <span
        v-if="status"
        class="vacation-budget__status"
        :class="`vacation-budget__status--${status === '여유' ? 'safe' : 'over'}`"
      >{{ status }}</span>
    </div>

    <div class="vacation-budget__metrics">
      <div class="vacation-budget__amount-row">
        <strong>{{ loading ? '불러오는 중' : formatWon(spentAmount) }}</strong>
        <button
          type="button"
          aria-label="휴가 예산 목표 설정 또는 수정"
          @click="$emit('edit')"
        >
          <span>{{ hasBudget ? `목표 ${formatWon(budget)}` : '목표를 설정해주세요' }}</span>
          <img
            :src="pencilIcon"
            alt=""
            aria-hidden="true"
          >
        </button>
      </div>

      <div
        class="vacation-budget__track"
        aria-hidden="true"
      >
        <span :style="{ width: `${progress}%` }" />
      </div>
    </div>

    <button
      class="vacation-budget__transactions"
      type="button"
      @click="$emit('view-transactions')"
    >
      휴가 기간 거래 내역 보기
      <img
        :src="arrowIcon"
        alt=""
        aria-hidden="true"
      >
    </button>
  </section>
</template>

<style scoped>
.vacation-budget {
  display: flex;
  overflow: hidden;
  padding: 10px 20px;
  border: 1px solid rgb(255 255 255 / 28%);
  border-radius: 20px;
  background: linear-gradient(86.33deg, rgb(255 255 255 / 10%) 0%, rgb(0 157 255 / 10%) 100%);
  box-shadow: inset 0 1px 0 rgb(255 255 255 / 28%);
  backdrop-filter: blur(18px) saturate(135%);
  -webkit-backdrop-filter: blur(18px) saturate(135%);
  flex-direction: column;
  gap: 10px;
}

.vacation-budget__heading,
.vacation-budget__amount-row,
.vacation-budget__transactions {
  display: flex;
  align-items: center;
}

.vacation-budget__heading {
  gap: 8px;
}
.vacation-budget__heading > img {
  width: 30px;
  height: 30px;
  object-fit: contain;
}
.vacation-budget__heading h2 {
  margin: 0;
  color: var(--ui-sub-title, #757575);
  font-size: 14px;
  line-height: 1.5;
  font-weight: var(--weight-bold);
}

.vacation-budget__status {
  padding: 2px 10px;
  border-radius: 20px;
  font-size: 12px;
  line-height: 1.5;
  font-weight: var(--weight-bold);
}
.vacation-budget__status--safe {
  background: #effbf4;
  color: #20b968;
}
.vacation-budget__status--over {
  background: var(--orange-50, #fff7f3);
  color: var(--orange-600, #e37255);
}

.vacation-budget__metrics {
  display: flex;
  width: 100%;
  flex-direction: column;
  gap: 6px;
}

.vacation-budget__amount-row {
  align-items: flex-end;
  justify-content: space-between;
  gap: 12px;
}
.vacation-budget__amount-row > strong {
  flex: 0 0 auto;
  color: var(--gray-900, #333);
  font-size: 14px;
  line-height: 1.5;
}
.vacation-budget__amount-row button {
  display: flex;
  min-width: 0;
  align-items: center;
  justify-content: flex-end;
  gap: 4px;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--ui-sub-title, #757575);
  cursor: pointer;
  font: inherit;
  font-size: 12px;
  line-height: 1.3;
}
.vacation-budget__amount-row button span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.vacation-budget__amount-row button img {
  width: 14px;
  height: 14px;
  flex: 0 0 auto;
  opacity: 0.58;
}

.vacation-budget__track {
  height: 6px;
  overflow: hidden;
  border-radius: 3px;
  background: #f0ede5;
}
.vacation-budget__track span {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(270deg, #009dff 0%, #cce2ff 100%);
  transition: width 180ms ease;
}

.vacation-budget__transactions {
  width: 100%;
  justify-content: flex-end;
  gap: 2px;
  padding: 0;
  border: 0;
  background: transparent;
  color: #7a7a7a;
  cursor: pointer;
  font: inherit;
  font-size: 14px;
}
.vacation-budget__transactions img {
  width: 7px;
  height: 11px;
}
</style>
