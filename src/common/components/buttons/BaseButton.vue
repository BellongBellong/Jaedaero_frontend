<script setup>
import { computed } from 'vue'

defineOptions({
  inheritAttrs: false,
})

const props = defineProps({
  variant: {
    type: String,
    default: 'primary',
    validator: (value) => ['primary', 'secondary', 'ghost', 'danger'].includes(value),
  },
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg'].includes(value),
  },
  type: {
    type: String,
    default: 'button',
    validator: (value) => ['button', 'submit', 'reset'].includes(value),
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  block: {
    type: Boolean,
    default: false,
  },
  ariaLabel: {
    type: String,
    default: '',
  },
  loadingLabel: {
    type: String,
    default: '처리 중',
  },
})

const emit = defineEmits(['click'])

const isDisabled = computed(() => props.disabled || props.loading)
const accessibleLabel = computed(() => {
  if (props.loading) {
    return props.loadingLabel
  }

  return props.ariaLabel || undefined
})

function handleClick(event) {
  if (isDisabled.value) {
    event.preventDefault()
    return
  }

  emit('click', event)
}
</script>

<template>
  <button
    v-bind="$attrs"
    class="base-button"
    :class="[
      `base-button--${variant}`,
      `base-button--${size}`,
      { 'base-button--block': block, 'base-button--loading': loading },
    ]"
    :type="type"
    :disabled="isDisabled"
    :aria-busy="loading ? 'true' : undefined"
    :aria-label="accessibleLabel"
    @click="handleClick"
  >
    <span
      v-if="loading"
      class="base-button__spinner"
      aria-hidden="true"
    />
    <span
      class="base-button__content"
      :class="{ 'base-button__content--hidden': loading }"
    >
      <span
        v-if="$slots.leading"
        class="base-button__icon"
        aria-hidden="true"
      >
        <slot name="leading" />
      </span>
      <span class="base-button__label">
        <slot />
      </span>
      <span
        v-if="$slots.trailing"
        class="base-button__icon"
        aria-hidden="true"
      >
        <slot name="trailing" />
      </span>
    </span>
  </button>
</template>

<style scoped>
.base-button {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 0;
  border: 1px solid transparent;
  border-radius: var(--radius-md, 10px);
  font-family: var(--font-family, inherit);
  font-weight: var(--font-weight-semibold, 600);
  line-height: 1;
  cursor: pointer;
  transition:
    background-color 160ms ease,
    border-color 160ms ease,
    color 160ms ease,
    box-shadow 160ms ease,
    transform 120ms ease;
}

.base-button:hover:not(:disabled) {
  filter: brightness(0.97);
}

.base-button:active:not(:disabled) {
  transform: translateY(1px);
}

.base-button:focus-visible {
  outline: 3px solid var(--color-focus-ring, rgb(46 125 92 / 28%));
  outline-offset: 2px;
}

.base-button:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

.base-button--primary {
  color: var(--color-on-primary, #ffffff);
  background: var(--color-primary, #236b4e);
  box-shadow: var(--shadow-button, 0 2px 6px rgb(17 24 39 / 12%));
}

.base-button--secondary {
  color: var(--color-primary, #236b4e);
  background: var(--color-surface, #ffffff);
  border-color: var(--color-primary, #236b4e);
}

.base-button--ghost {
  color: var(--color-text, #1f2937);
  background: transparent;
}

.base-button--ghost:hover:not(:disabled) {
  background: var(--color-surface-muted, #f3f5f4);
}

.base-button--danger {
  color: var(--color-on-danger, #ffffff);
  background: var(--color-danger, #c73e3e);
}

.base-button--sm {
  min-height: 36px;
  padding: 0 var(--space-3, 12px);
  font-size: var(--font-size-sm, 0.875rem);
  gap: var(--space-2, 8px);
}

.base-button--md {
  min-height: 44px;
  padding: 0 var(--space-4, 16px);
  font-size: var(--font-size-md, 1rem);
  gap: var(--space-2, 8px);
}

.base-button--lg {
  min-height: 52px;
  padding: 0 var(--space-5, 20px);
  font-size: var(--font-size-lg, 1.0625rem);
  gap: var(--space-2, 8px);
}

.base-button--block {
  width: 100%;
}

.base-button__content {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 0;
  gap: inherit;
}

.base-button__content--hidden {
  visibility: hidden;
}

.base-button__label {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.base-button__icon {
  display: inline-flex;
  flex: 0 0 auto;
}

.base-button__spinner {
  position: absolute;
  width: 1.1em;
  height: 1.1em;
  border: 2px solid currentColor;
  border-right-color: transparent;
  border-radius: 50%;
  animation: base-button-spin 700ms linear infinite;
}

@keyframes base-button-spin {
  to {
    transform: rotate(360deg);
  }
}

@media (prefers-reduced-motion: reduce) {
  .base-button {
    transition: none;
  }

  .base-button__spinner {
    animation-duration: 1.4s;
  }
}
</style>
