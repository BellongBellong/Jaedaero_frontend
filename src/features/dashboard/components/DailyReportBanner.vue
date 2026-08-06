<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'

import reportMascot from '@/assets/ai-coach/coach-character.svg'
import smallMoney from '@/assets/icons/Smallmoney.png'

const props = defineProps({
  greeting: {
    type: String,
    default: '저녁은 맛있게 드셨나요?',
  },
  title: {
    type: String,
    default: '오늘의 금융 AI 리포트',
  },
  date: {
    type: String,
    default: '',
  },
})

const formattedDate = computed(() => {
  const sourceDate = props.date ? new Date(props.date) : new Date()

  if (Number.isNaN(sourceDate.getTime())) return props.date

  return new Intl.DateTimeFormat('ko-KR', {
    month: 'long',
    day: 'numeric',
  }).format(sourceDate)
})

const dateTime = computed(() => {
  if (props.date) return props.date.slice(0, 10)

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
    :to="{ name: 'ai-financial-report' }"
    aria-label="오늘의 금융 AI 리포트 보기"
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
        <strong>{{ title }}</strong>
        <time :datetime="dateTime">{{ formattedDate }}</time>
      </div>
    </div>

    <span class="daily-report-banner__glow daily-report-banner__glow--small" />
    <span
      class="daily-report-banner__star"
      aria-hidden="true"
    >✦</span>

    <span
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
  width: 31px;
  height: 31px;
  object-fit: contain;
}

.daily-report-banner__content {
  position: relative;
  z-index: 1;
  display: flex;
  min-width: 0;
  padding-right: 58px;
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
  gap: 7px;
  white-space: nowrap;
}

.daily-report-banner__title strong {
  overflow: hidden;
  font-size: 18px;
  line-height: 1.5;
  text-overflow: ellipsis;
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

@media (max-width: 360px) {
  .daily-report-banner {
    padding-right: 18px;
    padding-left: 18px;
  }

  .daily-report-banner__report-icon,
  .daily-report-banner__glow,
  .daily-report-banner__star {
    display: none;
  }

  .daily-report-banner__content {
    padding-right: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .daily-report-banner {
    transition: none;
  }
}
</style>
