<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'

import reportMascot from '../../../assets/features/ai-coach/coach-character.webp'
import smallMoney from '@/assets/icons/Smallmoney.png'
import parasolGradient from '@/assets/icons/parasolGradient.png'
import starGradient from '@/assets/icons/starGradient.webp'

const props = defineProps({
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

/**
 * 격려 문구 작성 가이드
 * - 모바일 배너에서 한 줄 노출을 유지하기 위해 최대 22자 권장
 * - 너무 긴 문구는 우측 장식 요소와 과도하게 겹칠 수 있음
 * - 줄바꿈X 한줄 유지 우선
 */
const ENCOURAGEMENT_MESSAGES = {
  military: {
    morning: [
      '좋은 아침이에요! 오늘도 힘차게 시작해요.',
      '오늘 하루도 무사히, 힘차게 보내봐요!',
      '아침 든든히 챙기고 오늘도 파이팅!',
    ],
    afternoon: [
      '오전 일과 수고했어요! 오후도 힘내봐요.',
      '점심 맛있게 드셨나요? 오후도 파이팅!',
      '잠깐 숨 고르고, 오후 일과도 힘내봐요!',
    ],
    evening: [
      '오늘 하루도 정말 수고 많았어요.',
      '저녁 맛있게 드셨나요? 편안한 밤 보내요.',
      '오늘도 잘 버텨냈어요! 푹 쉬어가요.',
    ],
  },
  vacation: {
    morning: ['즐거운 휴가 아침이에요! 오늘을 만끽해요.', '소중한 휴가, 기분 좋게 시작해봐요!'],
    afternoon: ['즐거운 휴가 보내고 계신가요?', '휴가 중에도 점심 든든히 챙겨 드세요!'],
    evening: ['오늘 휴가도 즐거우셨나요? 푹 쉬어요.', '소중한 사람들과 편안한 저녁 보내세요.'],
  },
}

const messagePeriod = computed(() => {
  const hour = new Date().getHours()

  if (hour < 11) return 'morning'
  if (hour < 17) return 'afternoon'
  return 'evening'
})

const encouragementMessage = computed(() => {
  const messages = ENCOURAGEMENT_MESSAGES[props.variant][messagePeriod.value]
  const today = new Date()
  const dateSeed = today.getFullYear() * 372 + (today.getMonth() + 1) * 31 + today.getDate()

  return messages[dateSeed % messages.length]
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
      <p>{{ encouragementMessage }}</p>

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
        class="daily-report-banner__vacation-parasol"
        :src="parasolGradient"
        alt=""
        aria-hidden="true"
      >
    </template>

    <template v-else>
      <span class="daily-report-banner__glow daily-report-banner__glow--small" />
      <span
        class="daily-report-banner__star"
        aria-hidden="true"
      >
        ✦
      </span>
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
  border-color: rgb(255 255 255 / 28%);
  background: linear-gradient(180deg, #009dff 0%, #65c6d4 100%);
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / 30%),
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

.daily-report-banner:focus-visible {
  outline: 3px solid var(--green-300);
  outline-offset: 2px;
}

.daily-report-banner__mascot {
  position: relative;
  z-index: 1;
  flex: 0 0 auto;
  width: 39px;
  height: 44px;
  object-fit: contain;
}

.daily-report-banner__content {
  position: relative;
  z-index: 2;
  display: flex;
  min-width: 0;
  padding-right: 10px;
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

  /* 격려 문구는 배너 높이가 늘어나지 않도록 한 줄 유지 */
  white-space: nowrap;
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

.daily-report-banner__vacation-parasol {
  position: absolute;
  right: -7px;
  bottom: -14px;
  display: block;
  width: 82px;
  height: 86px;
  pointer-events: none;
  object-fit: contain;
  opacity: 0.72;
}

@media (max-width: 360px) {
  .daily-report-banner {
    padding-right: 18px;
    padding-left: 18px;
  }

  .daily-report-banner__report-icon,
  .daily-report-banner__glow,
  .daily-report-banner__star,
  .daily-report-banner__vacation-star,
  .daily-report-banner__vacation-parasol {
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
