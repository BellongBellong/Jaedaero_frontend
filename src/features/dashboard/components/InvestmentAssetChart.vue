<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  amount: {
    type: Number,
    default: 0,
  },
  changeAmount: {
    type: Number,
    default: 0,
  },
  changeRate: {
    type: Number,
    default: 0,
  },
  history: {
    type: Array,
    default: () => [],
  },
})

const principal = computed(() => props.amount - props.changeAmount)
const chartElement = ref(null)
const activeIndex = ref(null)

function clampRate(value) {
  return Math.min(50, Math.max(0, Number(value) || 0))
}

function parseHistoryDate(item, fallback) {
  const raw = item.date || item.changedAt || item.recordedAt || item.month
  const parsed = raw ? new Date(raw) : null
  return parsed && !Number.isNaN(parsed.getTime()) ? parsed : fallback
}

const monthlyHistory = computed(() => {
  if (props.history.length < 2) return []

  const monthlyEntries = new Map()
  props.history.forEach((item, index) => {
    const fallback = new Date()
    fallback.setDate(fallback.getDate() - (props.history.length - 1 - index))
    const date = parseHistoryDate(item, fallback)
    const amount = Number(item.amount ?? item.value ?? 0)
    const derivedRate = principal.value ? ((amount - principal.value) / principal.value) * 100 : 0
    monthlyEntries.set(`${date.getFullYear()}-${date.getMonth()}`, {
      date,
      rate: clampRate(item.rate ?? item.returnRate ?? derivedRate),
    })
  })
  return [...monthlyEntries.values()].slice(-4)
})
const chartMaxRate = computed(() => {
  const peak = Math.max(0, ...monthlyHistory.value.map(({ rate }) => rate))
  return Math.min(50, Math.max(5, Math.ceil((peak * 1.25) / 5) * 5))
})
const points = computed(() => {
  return monthlyHistory.value.map((item, index, items) => ({
    x: 10 + (293 / Math.max(items.length - 1, 1)) * index,
    y: 58 - (item.rate / chartMaxRate.value) * 42,
  }))
})
const linePath = computed(() =>
  points.value.map((point, index) => `${index ? 'L' : 'M'} ${point.x} ${point.y}`).join(' '),
)
const areaPath = computed(() => {
  if (!points.value.length) return ''
  const first = points.value[0]
  const last = points.value.at(-1)
  return `${linePath.value} L ${last.x} 64 L ${first.x} 64 Z`
})
const axisLabels = computed(() => {
  return monthlyHistory.value.map((item, index) => ({
    index,
    x: points.value[index]?.x,
    label: `${item.date.getMonth() + 1}월`,
  }))
})
const activePoint = computed(() => {
  if (activeIndex.value === null) return null
  return {
    ...points.value[activeIndex.value],
    ...monthlyHistory.value[activeIndex.value],
  }
})
const tooltipX = computed(() => Math.min(244, Math.max(6, (activePoint.value?.x ?? 0) - 34)))

function updateActivePoint(event) {
  const rect = chartElement.value?.getBoundingClientRect()
  if (!rect || !monthlyHistory.value.length) return
  const x = ((event.clientX - rect.left) / rect.width) * 313
  const index = Math.round(((x - 10) / 293) * (monthlyHistory.value.length - 1))
  activeIndex.value = Math.min(monthlyHistory.value.length - 1, Math.max(0, index))
}

function formatTooltipDate(date) {
  return `${date.getMonth() + 1}월`
}

function formatWon(value) {
  return `${Number(value || 0).toLocaleString('ko-KR')}원`
}

function signedWon(value) {
  const sign = value > 0 ? '+' : ''
  return `${sign}${formatWon(value)}`
}

function signedRate(value) {
  const sign = value > 0 ? '+' : ''
  return `${sign}${Number(value || 0).toFixed(1)}%`
}
</script>

<template>
  <section class="investment-chart">
    <div class="investment-chart__metrics">
      <div>
        <span>투자 원금</span>
        <strong>{{ formatWon(principal) }}</strong>
      </div>
      <div>
        <span>평가 금액</span>
        <strong>{{ formatWon(amount) }}</strong>
      </div>
      <div>
        <span>수익</span>
        <strong :class="{ 'investment-chart__loss': changeAmount < 0 }">
          {{ signedWon(changeAmount) }}
        </strong>
      </div>
      <div>
        <span>수익률</span>
        <strong :class="{ 'investment-chart__loss': changeRate < 0 }">
          {{ signedRate(changeRate) }}
        </strong>
      </div>
    </div>

    <div
      v-if="monthlyHistory.length"
      class="investment-chart__graph"
    >
      <svg
        ref="chartElement"
        viewBox="0 0 313 100"
        role="img"
        aria-label="최근 4개월 투자 수익률 추이"
        preserveAspectRatio="none"
        @pointermove="updateActivePoint"
        @pointerleave="activeIndex = null"
      >
        <defs>
          <linearGradient
            id="investment-area-gradient"
            x1="0"
            y1="0"
            x2="0"
            y2="1"
          >
            <stop
              offset="0"
              stop-color="#20ba5c"
              stop-opacity=".18"
            />
            <stop
              offset="1"
              stop-color="#20ba5c"
              stop-opacity="0"
            />
          </linearGradient>
        </defs>
        <path
          :d="areaPath"
          fill="url(#investment-area-gradient)"
        />
        <path
          :d="linePath"
          fill="none"
          stroke="var(--green-700)"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2.5"
          vector-effect="non-scaling-stroke"
        />
        <template v-if="activePoint">
          <line
            :x1="activePoint.x"
            :x2="activePoint.x"
            y1="12"
            y2="64"
            stroke="var(--green-700)"
            stroke-dasharray="3 3"
            stroke-opacity=".35"
            vector-effect="non-scaling-stroke"
          />
          <circle
            :cx="activePoint.x"
            :cy="activePoint.y"
            r="4"
            fill="var(--green-700)"
            stroke="white"
            stroke-width="2"
            vector-effect="non-scaling-stroke"
          />
          <g class="investment-chart__tooltip">
            <rect
              :x="tooltipX"
              y="0"
              width="68"
              height="22"
              rx="8"
            />
            <text
              :x="tooltipX + 34"
              y="9"
              text-anchor="middle"
            >
              {{ formatTooltipDate(activePoint.date) }}
            </text>
            <text
              :x="tooltipX + 34"
              y="18"
              text-anchor="middle"
            >
              수익률 {{ activePoint.rate.toFixed(1) }}%
            </text>
          </g>
        </template>
        <text
          v-for="item in axisLabels"
          :key="item.index"
          :x="item.x"
          y="88"
          text-anchor="middle"
        >
          {{ item.label }}
        </text>
        <text
          x="306"
          y="12"
          text-anchor="end"
        >
          {{ chartMaxRate }}%
        </text>
        <text
          x="306"
          y="64"
          text-anchor="end"
        >
          0%
        </text>
      </svg>
    </div>
    <p
      v-else
      class="investment-chart__history-empty"
    >
      기간별 수익률 데이터는 아직 제공되지 않아요.
    </p>
  </section>
</template>

<style scoped>
.investment-chart {
  display: grid;
  gap: 12px;
  padding: 20px;
  border: 1px solid rgb(255 255 255 / 55%);
  border-radius: 28px;
  background: linear-gradient(117.93deg, rgb(255 255 255 / 52%), rgb(255 255 255 / 20%));
  backdrop-filter: blur(18px) saturate(125%);
  -webkit-backdrop-filter: blur(18px) saturate(125%);
}

.investment-chart__metrics {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 8px;
}

.investment-chart__metrics div {
  display: grid;
  min-width: 0;
  gap: 4px;
  text-align: center;
}

.investment-chart__metrics span {
  color: var(--gray-600);
  font-size: 12px;
  line-height: 1.3;
}

.investment-chart__metrics strong {
  overflow: hidden;
  color: var(--green-700);
  font-size: clamp(12px, 3.6vw, 15px);
  line-height: 1.5;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.investment-chart__metrics div:nth-child(-n + 2) strong {
  color: var(--gray-900);
}

.investment-chart__metrics .investment-chart__loss {
  color: var(--orange-600);
}

.investment-chart__graph {
  width: 100%;
  padding-top: 12px;
}

.investment-chart__history-empty {
  margin: 0;
  padding: 18px 0 6px;
  color: var(--gray-500);
  font-size: 13px;
  text-align: center;
}

.investment-chart__graph svg {
  display: block;
  width: 100%;
  height: 100px;
  overflow: visible;
  touch-action: pan-y;
}

.investment-chart__graph text {
  fill: var(--sub-black);
  font-family: var(--font-body);
  font-size: 12px;
  font-weight: var(--weight-bold);
}

.investment-chart__tooltip rect {
  fill: rgb(51 51 51 / 88%);
  backdrop-filter: blur(8px);
}

.investment-chart__tooltip text {
  fill: white;
  font-size: 7px;
  font-weight: var(--weight-regular);
}
</style>
