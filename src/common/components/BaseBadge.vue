<script setup>
defineProps({
  as: {
    type: String,
    default: 'span',
  },
  label: {
    type: String,
    default: '',
  },
  tone: {
    type: String,
    default: 'neutral',
    validator: (value) => {
      return ['neutral', 'primary', 'info', 'success', 'warning', 'danger'].includes(value)
    },
  },
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md'].includes(value),
  },
  dot: {
    type: Boolean,
    default: false,
  },
  ariaLabel: {
    type: String,
    default: '',
  },
})
</script>

<template>
  <component
    :is="as"
    class="base-badge"
    :class="[`base-badge--${tone}`, `base-badge--${size}`]"
    :aria-label="ariaLabel || undefined"
  >
    <span
      v-if="dot"
      class="base-badge__dot"
      aria-hidden="true"
    />
    <slot>{{ label }}</slot>
  </component>
</template>

<style scoped>
.base-badge {
  display: inline-flex;
  align-items: center;
  width: fit-content;
  max-width: 100%;
  border-radius: var(--radius-full, 999px);
  font-family: var(--font-family, inherit);
  font-weight: var(--font-weight-semibold, 600);
  line-height: 1;
  white-space: nowrap;
}

.base-badge--sm {
  min-height: 20px;
  padding: 0 var(--space-2, 8px);
  font-size: var(--font-size-2xs, 0.6875rem);
  gap: var(--space-1, 4px);
}

.base-badge--md {
  min-height: 24px;
  padding: 0 var(--space-2, 8px);
  font-size: var(--font-size-xs, 0.75rem);
  gap: var(--space-1, 4px);
}

.base-badge--neutral {
  color: var(--color-text-muted, #59665f);
  background: var(--color-neutral-soft, #eef1ef);
}

.base-badge--primary {
  color: var(--color-primary-strong, #18513a);
  background: var(--color-primary-subtle, #e2f0e9);
}

.base-badge--info {
  color: var(--color-info-strong, #245b8c);
  background: var(--color-info-soft, #e5f0fa);
}

.base-badge--success {
  color: var(--color-success-strong, #17633c);
  background: var(--color-success-soft, #ddf4e7);
}

.base-badge--warning {
  color: var(--color-warning-strong, #82520b);
  background: var(--color-warning-soft, #fff0cf);
}

.base-badge--danger {
  color: var(--color-danger-strong, #962f2f);
  background: var(--color-danger-soft, #fde6e6);
}

.base-badge__dot {
  width: 0.5em;
  height: 0.5em;
  flex: 0 0 auto;
  border-radius: 50%;
  background: currentColor;
}
</style>
