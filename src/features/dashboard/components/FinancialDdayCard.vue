<script setup>
import { computed } from 'vue'

import armyCharacter from '@/assets/icons/character/army.png'

const props = defineProps({
  financialDday: {
    type: Number,
    default: 54,
  },
  actualDday: {
    type: Number,
    default: 60,
  },
  actualDischargeDate: {
    type: String,
    default: '2026-09-26',
  },
  financialDischargeDate: {
    type: String,
    default: '2026-09-20',
  },
  achievementRate: {
    type: Number,
    default: 80.2,
  },
  currentAsset: {
    type: Number,
    default: 800,
  },
  targetAmount: {
    type: Number,
    default: 1700,
  },
})

const normalizedRate = computed(() => Math.min(Math.max(props.achievementRate, 0), 100))
const progressWidth = computed(() => `${normalizedRate.value}%`)
const markerPosition = computed(() => `clamp(39px, ${normalizedRate.value}%, calc(100% - 39px))`)
const isLowProgress = computed(() => normalizedRate.value < 45)

const formattedActualDate = computed(() => {
  if (!props.actualDischargeDate) return '-'

  return props.actualDischargeDate.replaceAll('-', '.')
})

function toUtcDate(date) {
  const [year, month, day] = String(date).slice(0, 10).split('-').map(Number)

  if (!year || !month || !day) return null

  return Date.UTC(year, month - 1, day)
}

const dischargeDifferenceDays = computed(() => {
  const financialDate = toUtcDate(props.financialDischargeDate)
  const actualDate = toUtcDate(props.actualDischargeDate)

  if (financialDate === null || actualDate === null) {
    return props.actualDday - props.financialDday
  }

  return Math.round((actualDate - financialDate) / 86400000)
})

const dischargeMessage = computed(() => {
  if (dischargeDifferenceDays.value > 0) {
    return `실제 전역일보다 ${dischargeDifferenceDays.value}일 더 빨라요!`
  }

  if (dischargeDifferenceDays.value < 0) {
    return `실제 전역일보다 ${Math.abs(dischargeDifferenceDays.value)}일 느려요!`
  }

  return '전역일에 맞춰 목표 자산을 달성할 것으로 예상돼요!'
})

function formatAmount(value) {
  return Number(value || 0).toLocaleString('ko-KR')
}
</script>

<template>
  <section class="financial-dday-card">
    <div class="financial-dday-card__dates">
      <div class="financial-dday-card__financial-date">
        <p class="financial-dday-card__label">
          재정적 전역일
        </p>
        <strong class="financial-dday-card__main-dday">D-{{ financialDday }}</strong>
        <p class="financial-dday-card__message">
          {{ dischargeMessage }}
        </p>
      </div>

      <div class="financial-dday-card__actual-date">
        <span>실제 전역일</span>
        <strong>D-{{ actualDday }}</strong>
        <time :datetime="actualDischargeDate">{{ formattedActualDate }}</time>
      </div>
    </div>

    <div
      class="financial-dday-card__progress-section"
      :class="{ 'financial-dday-card__progress-section--low': isLowProgress }"
    >
      <div class="financial-dday-card__achievement">
        <p>전역 목표 금액 달성률</p>
        <strong>{{ achievementRate }}%</strong>
        <span>순자산 {{ formatAmount(currentAsset) }}만원</span>
      </div>

      <div
        class="financial-dday-card__marker"
        :style="{ left: markerPosition }"
      >
        <div class="financial-dday-card__amount-bubble">
          <strong>{{ formatAmount(currentAsset) }}</strong>
          <span>만원</span>
        </div>
        <span class="financial-dday-card__bubble-tail" />
        <div class="financial-dday-card__character-wrap">
          <span class="financial-dday-card__character-shadow" />
          <img
            :src="armyCharacter"
            alt=""
            aria-hidden="true"
          >
        </div>
      </div>

      <div class="financial-dday-card__goal">
        <div
          class="financial-dday-card__track"
          role="progressbar"
          aria-label="전역 목표 금액 달성률"
          aria-valuemin="0"
          aria-valuemax="100"
          :aria-valuenow="normalizedRate"
        >
          <span :style="{ width: progressWidth }" />
        </div>
        <p>목표 {{ formatAmount(targetAmount) }}만원</p>
      </div>
    </div>
  </section>
</template>

<style scoped>
.financial-dday-card {
  position: relative;
  isolation: isolate;
  width: 100%;
  min-height: clamp(340px, 92vw, 362px);
  padding: clamp(28px, 8vw, 37px) clamp(14px, 4.6vw, 18px) var(--space-20);
  overflow: hidden;
  border: 1px solid rgb(255 255 255 / 72%);
  border-radius: var(--dashboard-card-radius);
  background:
    linear-gradient(145deg, rgb(255 255 255 / 34%), rgb(255 255 255 / 12%)), rgb(255 255 255 / 20%);
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / 85%),
    inset 0 -1px 0 rgb(255 255 255 / 24%),
    0 12px 32px rgb(51 51 51 / 7%);
  backdrop-filter: blur(22px) saturate(135%);
  -webkit-backdrop-filter: blur(22px) saturate(135%);
  color: var(--gray-900);
}

.financial-dday-card::before {
  position: absolute;
  z-index: -1;
  inset: 0;
  border-radius: inherit;
  background:
    radial-gradient(circle at 10% 0%, rgb(255 255 255 / 55%), transparent 42%),
    radial-gradient(circle at 90% 100%, rgb(98 255 156 / 8%), transparent 38%);
  content: '';
  pointer-events: none;
}

.financial-dday-card p {
  margin: 0;
}

.financial-dday-card__dates {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  gap: var(--dashboard-gap);
  padding: 0 2px;
}

.financial-dday-card__financial-date {
  min-width: 0;
}

.financial-dday-card__label {
  color: var(--gray-600);
  font-size: 14px;
  font-weight: var(--weight-bold);
  line-height: 1.5;
}

.financial-dday-card__main-dday {
  display: block;
  font-family: var(--font-display);
  font-size: clamp(34px, 10vw, 40px);
  font-weight: 400;
  letter-spacing: -0.02em;
  line-height: 1.4;
}

.financial-dday-card__message {
  display: inline-flex;
  max-width: 100%;
  padding: 2px 10px;
  overflow: hidden;
  border-radius: 20px;
  background: var(--dashboard-success-soft);
  color: var(--dashboard-success);
  font-size: 12px;
  line-height: 1.5;
  white-space: normal;
}

.financial-dday-card__actual-date {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 10px 12px;
  border-radius: 20px;
  background: var(--olive-200);
}

.financial-dday-card__actual-date span {
  color: var(--white);
  font-family: var(--font-display);
  font-size: 12px;
  line-height: 1.5;
}

.financial-dday-card__actual-date strong {
  color: var(--olive-500);
  font-family: var(--font-display);
  font-size: 24px;
  font-weight: 400;
  letter-spacing: -0.05em;
  line-height: 1.5;
}

.financial-dday-card__actual-date time {
  color: var(--gray-600);
  font-size: 12px;
  line-height: 1.3;
}

.financial-dday-card__progress-section {
  position: relative;
  min-height: 177px;
  margin-top: clamp(20px, 7vw, 29px);
  padding: 10px 8px 0;
}

.financial-dday-card__achievement {
  display: flex;
  width: fit-content;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
}

.financial-dday-card__progress-section--low .financial-dday-card__achievement {
  margin-left: auto;
  padding-right: 2px;
}

.financial-dday-card__achievement p {
  color: var(--gray-500);
  font-size: 14px;
  font-weight: var(--weight-bold);
  line-height: 1.5;
}

.financial-dday-card__achievement strong {
  color: var(--green-700);
  font-family: var(--font-display);
  font-size: 24px;
  font-weight: 400;
  letter-spacing: -0.05em;
  line-height: 1.5;
}

.financial-dday-card__achievement span {
  color: var(--dashboard-muted-text);
  font-size: 14px;
  line-height: 1.5;
}

.financial-dday-card__marker {
  position: absolute;
  top: 10px;
  width: 77px;
  transform: translateX(-50%);
}

.financial-dday-card__amount-bubble {
  display: flex;
  width: max-content;
  align-items: center;
  gap: 4px;
  padding: 10px;
  border-radius: 20px;
  background: linear-gradient(180deg, var(--green-500) 0%, var(--green-50) 100%);
  font-size: 12px;
  line-height: 1.5;
}

.financial-dday-card__amount-bubble strong {
  color: var(--green-700);
}

.financial-dday-card__amount-bubble span {
  color: var(--gray-800);
}

.financial-dday-card__bubble-tail {
  display: block;
  width: 0;
  height: 0;
  margin: -2px auto 0;
  border-top: 14px solid var(--green-50);
  border-right: 11px solid transparent;
  border-left: 11px solid transparent;
}

.financial-dday-card__character-wrap {
  position: relative;
  width: 55px;
  height: 55px;
  margin: -1px auto 0;
}

.financial-dday-card__character-wrap img {
  position: relative;
  z-index: 1;
  display: block;
  width: 55px;
  height: 55px;
  object-fit: contain;
}

.financial-dday-card__character-shadow {
  position: absolute;
  bottom: 1px;
  left: 8px;
  width: 39px;
  height: 12px;
  border-radius: 50%;
  background: var(--green-900);
  filter: blur(7px);
}

.financial-dday-card__goal {
  position: absolute;
  right: 8px;
  bottom: 0;
  left: 8px;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 9px;
}

.financial-dday-card__track {
  position: relative;
  width: 100%;
  height: 7px;
  border-radius: 999px;
  background: var(--dashboard-track);
}

.financial-dday-card__track span {
  position: relative;
  display: block;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, var(--green-500), var(--green-800));
}

.financial-dday-card__track span::after {
  position: absolute;
  top: 50%;
  right: 0;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: var(--green-800);
  content: '';
  transform: translate(50%, -50%);
}

.financial-dday-card__goal p {
  color: var(--dashboard-muted-text);
  font-size: 14px;
  line-height: 1.5;
}

@media (max-width: 360px) {
  .financial-dday-card {
    padding-right: 14px;
    padding-left: 14px;
  }

  .financial-dday-card__message {
    max-width: 190px;
  }
}
</style>
