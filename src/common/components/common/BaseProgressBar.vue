<script setup>
import { computed } from 'vue'

const props = defineProps({
  value: {
    type: Number,
    default: 0,
  },
  max: {
    type: Number,
    default: 100,
  },
  label: {
    type: String,
    default: '',
  },
  valueLabel: {
    type: String,
    default: '',
  },
  showValue: {
    type: Boolean,
    default: false,
  },
  tone: {
    type: String,
    default: 'primary',
    validator: (value) => ['primary', 'info', 'success', 'warning', 'danger'].includes(value),
  },
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg'].includes(value),
  },
})

const normalizedMax = computed(() => {
  return Number.isFinite(props.max) && props.max > 0 ? props.max : 100
})
const normalizedValue = computed(() => {
  if (!Number.isFinite(props.value)) {
    return 0
  }

  return Math.min(Math.max(props.value, 0), normalizedMax.value)
})
const percentage = computed(() => (normalizedValue.value / normalizedMax.value) * 100)
const formattedPercentage = computed(() => `${Math.round(percentage.value)}%`)
const accessibleValueLabel = computed(() => props.valueLabel || formattedPercentage.value)
</script>

<template>
  <div class="progress-bar">
    <div
      v-if="label || showValue"
      class="progress-bar__header"
    >
      <span
        v-if="label"
        class="progress-bar__label"
      >
        {{ label }}
      </span>
      <span
        v-if="showValue"
        class="progress-bar__value"
      >
        {{ valueLabel || formattedPercentage }}
      </span>
    </div>
    <div
      class="progress-bar__track"
      :class="`progress-bar__track--${size}`"
      role="progressbar"
      :aria-label="label || undefined"
      aria-valuemin="0"
      :aria-valuemax="normalizedMax"
      :aria-valuenow="normalizedValue"
      :aria-valuetext="accessibleValueLabel"
    >
      <span
        class="progress-bar__fill"
        :class="`progress-bar__fill--${tone}`"
        :style="{ width: `${percentage}%` }"
      />
    </div>
  </div>
</template>

<style scoped>
.progress-bar {
  display: grid;
  width: 100%;
  gap: var(--space-2, 8px);
  font-family: var(--font-family, inherit);
}

.progress-bar__header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--space-3, 12px);
}

.progress-bar__label {
  min-width: 0;
  overflow: hidden;
  color: var(--color-text, #1f2937);
  font-size: var(--font-size-sm, 0.875rem);
  font-weight: var(--font-weight-medium, 500);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.progress-bar__value {
  flex: 0 0 auto;
  color: var(--color-text-muted, #59665f);
  font-size: var(--font-size-xs, 0.75rem);
  font-variant-numeric: tabular-nums;
}

.progress-bar__track {
  width: 100%;
  overflow: hidden;
  border-radius: var(--radius-full, 999px);
  background: var(--color-surface-strong, #e3e8e5);
}

.progress-bar__track--sm {
  height: 4px;
}

.progress-bar__track--md {
  height: 8px;
}

.progress-bar__track--lg {
  height: 12px;
}

.progress-bar__fill {
  display: block;
  height: 100%;
  border-radius: inherit;
  transition: width 300ms ease;
}

.progress-bar__fill--primary {
  background: var(--color-primary, #236b4e);
}

.progress-bar__fill--info {
  background: var(--color-info, #3277ad);
}

.progress-bar__fill--success {
  background: var(--color-success, #228451);
}

.progress-bar__fill--warning {
  background: var(--color-warning, #c47b10);
}

.progress-bar__fill--danger {
  background: var(--color-danger, #c73e3e);
}

@media (prefers-reduced-motion: reduce) {
  .progress-bar__fill {
    transition: none;
  }
}
</style>
