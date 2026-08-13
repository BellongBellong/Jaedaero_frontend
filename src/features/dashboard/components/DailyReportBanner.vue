<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'

import reportMascot from '@/assets/ai-coach/coach-character.svg'
import smallMoney from '@/assets/icons/Smallmoney.png'
import starGradient from '@/assets/icons/starGradient.png'

const props = defineProps({
  greeting: {
    type: String,
    default: '오늘의 시장 흐름을 확인해보세요',
  },
  date: {
    type: [String, Array],
    default: '',
  },
  to: {
    type: [String, Object],
    default: () => ({ name: 'ai-financial-report' }),
  },
  variant: {
    type: String,
    default: 'military',
    validator: (value) => ['military', 'vacation'].includes(value),
  },
})

const normalizedDate = computed(() => {
  if (Array.isArray(props.date)) {
    const [year, month, day] = props.date.map(Number)
    if (!year || !month || !day) return ''
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  }

  return String(props.date || '')
})

const formattedDate = computed(() => {
  const sourceDate = normalizedDate.value ? new Date(normalizedDate.value) : new Date()

  if (Number.isNaN(sourceDate.getTime())) return normalizedDate.value

  return new Intl.DateTimeFormat('ko-KR', {
    month: 'long',
    day: 'numeric',
  }).format(sourceDate)
})

const dateTime = computed(() => {
  if (normalizedDate.value) return normalizedDate.value.slice(0, 10)

  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
})
</script>

<template>
  <RouterLink
    class="daily-report-banner"
    :class="`daily-report-banner--${variant}`"
    :to="to"
    aria-label="오늘의 AI 시장 리포트 보기"
  >
    <img
      class="daily-report-banner__mascot"
      :src="reportMascot"
      alt=""
      aria-hidden="true"
    >

    <div class="daily-report-banner__content">
      <p>{{ greeting }}</p>
      <div class="daily-report-banner__title">
        <strong>오늘의 AI 시장 리포트</strong>
        <time :datetime="dateTime">{{ formattedDate }}</time>
      </div>
    </div>

    <template v-if="variant === 'vacation'">
      <img
        class="daily-report-banner__vacation-star daily-report-banner__vacation-star--small"
        :src="starGradient"
        alt=""
        aria-hidden="true"
      >
      <img
        class="daily-report-banner__vacation-star daily-report-banner__vacation-star--large"
        :src="starGradient"
        alt=""
        aria-hidden="true"
      >
    </template>

    <template v-else>
      <span class="daily-report-banner__glow daily-report-banner__glow--small" />
      <span
        class="daily-report-banner__star"
        aria-hidden="true"
      >✦</span>
    </template>

    <span
      v-if="variant !== 'vacation'"
      class="daily-report-banner__report-icon"
      aria-hidden="true"
    >
      <span class="daily-report-banner__money-blur" />
      <img
        :src="smallMoney"
        alt=""
      >
    </span>
  </RouterLink>
</template>

<style scoped>
.daily-report-banner {
  position: relative;
  display: flex;
  width: 100%;
  min-height: 84px;
  align-items: center;
  gap: var(--dashboard-card-gap);
  padding: var(--dashboard-card-padding) var(--space-24);
  overflow: hidden;
  border: 1px solid rgb(255 255 255 / 18%);
  border-radius: var(--dashboard-card-radius);
  background: linear-gradient(180deg, var(--green-700) 0%, var(--green-400) 160%);
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / 20%),
    0 8px 18px rgb(32 186 92 / 13%);
  color: var(--white);
  text-decoration: none;
  transition:
    transform 180ms ease,
    filter 180ms ease;
}

.daily-report-banner--vacation {
  min-height: 88px;
  gap: var(--space-8);
  padding-right: 18px;
  padding-left: 18px;
  border-color: rgb(255 255 255 / 26%);
  background: linear-gradient(180deg, #009dff 0%, #65c6d4 100%);
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / 28%),
    0 8px 22px rgb(0 157 255 / 16%);
}

.daily-report-banner--vacation .daily-report-banner__content {
  padding-right: 34px;
}

.daily-report-banner--vacation .daily-report-banner__title {
  gap: 6px;
}

.daily-report-banner--vacation .daily-report-banner__title strong {
  overflow: visible;
  font-size: clamp(16px, 4.5vw, 18px);
  text-overflow: clip;
}

.daily-report-banner--vacation:focus-visible {
  outline-color: #7dccf7;
}

.daily-report-banner:active {
  transform: scale(0.985);
}

.daily-report-banner--vacation {
  border-color: rgb(255 255 255 / 28%);
  background: linear-gradient(180deg, #009dff 0%, #65c6d4 100%);
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / 30%),
    0 8px 22px rgb(0 157 255 / 16%);
}

.daily-report-banner:focus-visible {
  outline: 3px solid var(--green-300);
  outline-offset: 2px;
}

.daily-report-banner__mascot {
  position: relative;
  z-index: 1;
  flex: 0 0 auto;
  width: 31px;
  height: 31px;
  object-fit: contain;
}

.daily-report-banner__content {
  position: relative;
  z-index: 1;
  display: flex;
  min-width: 0;
  padding-right: 52px;
  flex-direction: column;
  justify-content: center;
  gap: 3px;
}

.daily-report-banner__content p {
  margin: 0;
  color: var(--gray-200);
  font-size: 12px;
  font-weight: var(--weight-bold);
  line-height: 1.5;
}

.daily-report-banner__title {
  display: flex;
  min-width: 0;
  align-items: center;
  flex-wrap: wrap;
  gap: 7px;
}

.daily-report-banner__title strong {
  min-width: 0;
  font-size: 18px;
  line-height: 1.5;
  white-space: normal;
  word-break: keep-all;
}

.daily-report-banner__title time {
  flex: 0 0 auto;
  color: var(--gray-200);
  font-size: 12px;
  font-weight: var(--weight-bold);
  line-height: 1.5;
}

.daily-report-banner__report-icon {
  position: absolute;
  z-index: 1;
  top: 27px;
  right: 35px;
  display: block;
  width: 38px;
  height: 38px;
}

.daily-report-banner__report-icon img {
  position: relative;
  z-index: 1;
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.daily-report-banner__money-blur {
  position: absolute;
  inset: 3px;
  border-radius: 50%;
  background: linear-gradient(198deg, var(--yellow-400), var(--yellow-100));
  filter: blur(5px);
  opacity: 0.8;
}

.daily-report-banner__glow {
  position: absolute;
  border-radius: 50%;
  background: linear-gradient(185deg, var(--yellow-400), var(--yellow-100));
  filter: blur(2px);
}

.daily-report-banner__glow--small {
  top: 14px;
  right: 53px;
  width: 8px;
  height: 8px;
}

.daily-report-banner__star {
  position: absolute;
  top: 14px;
  right: 19px;
  color: var(--yellow-300);
  font-size: 19px;
  filter: drop-shadow(0 0 3px var(--yellow-200));
  line-height: 1;
  transform: rotate(12deg);
}

.daily-report-banner__vacation-star {
  position: absolute;
  display: block;
  pointer-events: none;
  object-fit: contain;
}

.daily-report-banner__vacation-star--small {
  top: 5px;
  right: 58px;
  width: 30px;
  height: 30px;
  filter: blur(1px);
  opacity: 0.82;
}

.daily-report-banner__vacation-star--large {
  right: 4px;
  bottom: -3px;
  width: 62px;
  height: 62px;
}

@media (max-width: 360px) {
  .daily-report-banner {
    padding-right: 18px;
    padding-left: 18px;
  }

  .daily-report-banner__report-icon,
  .daily-report-banner__glow,
  .daily-report-banner__star,
  .daily-report-banner__vacation-star {
    display: none;
  }

  .daily-report-banner__content {
    padding-right: 0;
  }

  .daily-report-banner__title strong {
    font-size: 17px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .daily-report-banner {
    transition: none;
  }
}
</style>
