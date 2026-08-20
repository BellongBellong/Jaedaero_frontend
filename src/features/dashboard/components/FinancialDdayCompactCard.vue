<script setup>
import { computed } from 'vue'

import armyCharacter from '@/assets/character/army.png'
import AssetProgressMarker from '@/features/dashboard/components/AssetProgressMarker.vue'

const props = defineProps({
  financialDday: { type: Number, default: null },
  expectedAsset: { type: Number, default: 0 },
  currentAsset: { type: Number, default: 0 },
  targetAmount: { type: Number, default: 0 },
  characterImage: { type: String, default: '' },
  mode: {
    type: String,
    default: 'default',
    validator: (value) => ['default', 'vacation'].includes(value),
  },
})

const achievementRate = computed(() => {
  const target = Number(props.targetAmount)
  if (!Number.isFinite(target) || target <= 0) return 0

  const asset = Number(props.expectedAsset)
  return Math.max(0, Math.min(100, ((Number.isFinite(asset) ? asset : 0) / target) * 100))
})

const markerPosition = computed(() => `clamp(30px, ${achievementRate.value}%, calc(100% - 30px))`)
const bubbleDirection = computed(() => {
  const rate = achievementRate.value
  if (rate <= 30) return 'diagonal-left'
  if (rate <= 50) return 'diagonal-right'
  if (rate <= 70) return 'diagonal-left'
  return 'diagonal-right'
})
const bubbleSide = computed(() =>
  ['diagonal-left'].includes(bubbleDirection.value) ? 'right' : 'left',
)
const ddaySide = computed(() => (achievementRate.value > 50 ? 'left' : 'right'))

const progressStyle = computed(() => ({ width: `${achievementRate.value}%` }))
const formattedCurrentAsset = computed(() => formatAmount(props.currentAsset))
const formattedTargetAmount = computed(() => formatAmount(props.targetAmount))

function formatAmount(value) {
  const number = Number(value)
  return Number.isFinite(number)
    ? number.toLocaleString('ko-KR', { maximumFractionDigits: 2 })
    : '0'
}

function formatDday(value) {
  const days = Number(value)
  if (!Number.isFinite(days)) return '-'
  if (days === 0) return 'D-day'
  return days > 0 ? `D-${days}` : `D+${Math.abs(days)}`
}
</script>

<template>
  <section
    class="financial-dday-compact"
    :class="`financial-dday-compact--${mode}`"
    aria-label="재정적 전역일 요약"
  >
    <p
      class="financial-dday-compact__dday"
      :class="`financial-dday-compact__dday--${ddaySide}`"
    >
      재정적 전역일 <strong>{{ formatDday(financialDday) }}</strong>
    </p>

    <div class="financial-dday-compact__graph">
      <div class="financial-dday-compact__track">
        <span class="financial-dday-compact__rail" />
        <span
          class="financial-dday-compact__progress"
          :style="progressStyle"
        />
      </div>

      <div
        class="financial-dday-compact__marker"
        :style="{ left: markerPosition }"
      >
        <AssetProgressMarker
          class="financial-dday-compact__bubble"
          :class="`financial-dday-compact__bubble--${bubbleSide}`"
          :amount="formattedCurrentAsset"
          :direction="bubbleDirection"
          :mode="mode"
        />
        <img
          class="financial-dday-compact__character"
          :src="characterImage || armyCharacter"
          alt="선택한 캐릭터"
        >
      </div>
    </div>

    <p class="financial-dday-compact__target">
      목표 {{ formattedTargetAmount }}만원
    </p>
  </section>
</template>

<style scoped>
.financial-dday-compact,
.financial-dday-compact * {
  box-sizing: border-box;
}

.financial-dday-compact {
  position: relative;
  width: 100%;
  height: 126px;
  overflow: hidden;
  border: 1px solid rgb(255 255 255 / 65%);
  border-radius: var(--dashboard-card-radius, 28px);
  background:
    radial-gradient(circle at 100% 50%, rgb(98 255 156 / 22%), transparent 46%),
    rgb(255 255 255 / 92%);
  box-shadow: 0 8px 24px rgb(51 51 51 / 9%);
  backdrop-filter: blur(16px);
}

.financial-dday-compact--vacation {
  background:
    radial-gradient(circle at 100% 50%, rgb(0 157 255 / 18%), transparent 48%),
    rgb(255 255 255 / 92%);
}

.financial-dday-compact__dday {
  position: absolute;
  top: 20px;
  z-index: 1;
  max-width: 43%;
  margin: 0;
  color: var(--gray-500);
  font-family: var(--body-body-small-regular-font-family, 'Pretendard', sans-serif);
  font-size: var(--body-body-small-regular-font-size, 14px);
  line-height: 150%;
  white-space: nowrap;
}

.financial-dday-compact__dday strong {
  font-weight: 400;
}

.financial-dday-compact__dday--right {
  right: 22px;
  text-align: right;
}
.financial-dday-compact__dday--left {
  left: 22px;
  text-align: left;
}

.financial-dday-compact__graph {
  position: absolute;
  right: 22px;
  bottom: 47px;
  left: 22px;
  height: 8px;
}

.financial-dday-compact__track,
.financial-dday-compact__rail,
.financial-dday-compact__progress {
  position: absolute;
  inset: 0;
  height: 8px;
  border-radius: 999px;
}

.financial-dday-compact__rail {
  background: var(--gray-300);
}

.financial-dday-compact__progress {
  right: auto;
  min-width: 0;
  background: linear-gradient(90deg, var(--green-400), var(--green-700));
}

.financial-dday-compact--vacation .financial-dday-compact__progress {
  background: linear-gradient(90deg, var(--blue-400), var(--blue-800));
}

.financial-dday-compact__marker {
  position: absolute;
  top: 50%;
  z-index: 2;
  width: 54px;
  height: 54px;
  translate: -50% -50%;
}

.financial-dday-compact__character {
  position: absolute;
  inset: 0;
  width: 54px;
  height: 54px;
  object-fit: contain;
  filter: drop-shadow(0 7px 6px rgb(32 186 92 / 25%));
}

.financial-dday-compact--vacation .financial-dday-compact__character {
  filter: drop-shadow(0 7px 6px rgb(0 157 255 / 24%));
}

.financial-dday-compact__bubble {
  position: absolute;
  bottom: calc(100% - 5px);
  z-index: 3;
}

.financial-dday-compact__bubble--right {
  left: 28px;
}
.financial-dday-compact__bubble--left {
  right: 28px;
}

.financial-dday-compact__target {
  position: absolute;
  right: 22px;
  bottom: 12px;
  margin: 0;
  color: var(--gray-500);
  font-family: var(--body-body-small-regular-font-family, 'Pretendard', sans-serif);
  font-size: var(--body-body-small-regular-font-size, 14px);
  line-height: 150%;
}

@media (max-width: 350px) {
  .financial-dday-compact__dday {
    font-size: 12px;
  }
  .financial-dday-compact__graph {
    right: 16px;
    left: 16px;
  }
}
</style>
