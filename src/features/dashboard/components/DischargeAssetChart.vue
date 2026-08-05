<script setup>
import { computed } from 'vue'

const props = defineProps({
  data: {
    type: Object,
    default: null,
  },
})

const hasChart = computed(
  () =>
    props.data?.labels?.length > 1 &&
    props.data?.expected?.length === props.data.labels.length &&
    props.data?.target?.length === props.data.labels.length,
)

function toPoints(values) {
  if (!values?.length) return ''

  const allValues = [...(props.data?.expected ?? []), ...(props.data?.target ?? [])]
  const min = Math.min(...allValues)
  const max = Math.max(...allValues)
  const range = max - min || 1

  return values
    .map((value, index) => {
      const x = 10 + (index / (values.length - 1)) * 280
      const y = 92 - ((value - min) / range) * 68

      return `${x},${y}`
    })
    .join(' ')
}

function formatManwon(value) {
  return Math.round(Number(value || 0) / 10_000).toLocaleString('ko-KR')
}
</script>

<template>
  <div
    v-if="data && hasChart"
    class="asset-forecast"
  >
    <p class="asset-forecast__total">
      <strong>{{ formatManwon(data.totalAmount) }}</strong>
      <span>만원</span>
    </p>

    <div class="asset-forecast__chart">
      <svg
        viewBox="0 0 300 104"
        role="img"
        aria-label="월별 전역 예상 자산 그래프"
        preserveAspectRatio="none"
      >
        <polyline
          :points="toPoints(data.target)"
          class="asset-forecast__line asset-forecast__line--target"
        />
        <polyline
          :points="toPoints(data.expected)"
          class="asset-forecast__line asset-forecast__line--expected"
        />
      </svg>
      <div class="asset-forecast__labels">
        <span
          v-for="label in data.labels"
          :key="label"
        >{{ label }}</span>
      </div>
    </div>
  </div>

  <p
    v-else
    class="asset-forecast__empty"
  >
    전역 예상 자산 데이터가 없어요.
  </p>
</template>

<style scoped>
.asset-forecast {
  display: flex;
  min-height: 220px;
  flex-direction: column;
}

.asset-forecast__total {
  display: flex;
  align-items: flex-end;
  gap: 5px;
  margin: 0;
  color: var(--gray-900);
}

.asset-forecast__total strong {
  font-size: 40px;
  letter-spacing: -0.04em;
  line-height: 1;
}

.asset-forecast__total span {
  padding-bottom: 3px;
  font-size: 16px;
  font-weight: var(--weight-bold);
}

.asset-forecast__chart {
  margin-top: auto;
}

.asset-forecast__chart svg {
  display: block;
  width: 100%;
  height: 112px;
  overflow: visible;
}

.asset-forecast__line {
  fill: none;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 3;
  vector-effect: non-scaling-stroke;
}

.asset-forecast__line--target {
  stroke: #5d7058;
  stroke-dasharray: 6 6;
}

.asset-forecast__line--expected {
  stroke: #70f6a4;
}

.asset-forecast__labels {
  display: flex;
  justify-content: space-between;
  color: var(--gray-300);
  font-size: 11px;
}

.asset-forecast__empty {
  display: grid;
  min-height: 220px;
  place-items: center;
  margin: 0;
  color: var(--gray-500);
  font-size: 13px;
}
</style>
