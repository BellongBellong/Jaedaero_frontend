<script setup>
import { computed } from 'vue'

defineOptions({
  inheritAttrs: false,
})

const props = defineProps({
  as: {
    type: String,
    default: 'div',
  },
  variant: {
    type: String,
    default: 'default',
    validator: (value) => ['default', 'outlined', 'elevated', 'muted'].includes(value),
  },
  padding: {
    type: String,
    default: 'md',
    validator: (value) => ['none', 'sm', 'md', 'lg'].includes(value),
  },
  interactive: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  loadingLabel: {
    type: String,
    default: '불러오는 중',
  },
  errorMessage: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['click'])

const componentTag = computed(() => {
  if (props.interactive && props.as === 'div') {
    return 'button'
  }

  return props.as
})
const isNativeButton = computed(() => componentTag.value === 'button')
const isNativeLink = computed(() => componentTag.value === 'a')
const needsButtonSemantics = computed(() => {
  return props.interactive && !isNativeButton.value && !isNativeLink.value
})

function handleClick(event) {
  if (props.disabled) {
    event.preventDefault()
    return
  }

  emit('click', event)
}

function handleKeydown(event) {
  if (!needsButtonSemantics.value || props.disabled) {
    return
  }

  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    emit('click', event)
  }
}
</script>

<template>
  <component
    :is="componentTag"
    v-bind="$attrs"
    class="base-card"
    :class="[
      `base-card--${variant}`,
      `base-card--padding-${padding}`,
      {
        'base-card--interactive': interactive,
        'base-card--disabled': disabled,
      },
    ]"
    :type="isNativeButton ? 'button' : undefined"
    :disabled="isNativeButton && disabled ? true : undefined"
    :role="needsButtonSemantics ? 'button' : undefined"
    :tabindex="needsButtonSemantics && !disabled ? 0 : undefined"
    :aria-disabled="!isNativeButton && disabled ? 'true' : undefined"
    :aria-busy="loading ? 'true' : undefined"
    @click="handleClick"
    @keydown="handleKeydown"
  >
    <header
      v-if="$slots.header"
      class="base-card__header"
    >
      <slot name="header" />
    </header>
    <div
      v-if="loading"
      class="base-card__state"
    >
      <slot name="loading">
        <span
          class="base-card__spinner"
          aria-hidden="true"
        />
        <span>{{ loadingLabel }}</span>
      </slot>
    </div>
    <div
      v-else-if="errorMessage"
      class="base-card__state base-card__state--error"
      role="alert"
    >
      <slot
        name="error"
        :message="errorMessage"
      >
        {{ errorMessage }}
      </slot>
    </div>
    <div
      v-else
      class="base-card__body"
    >
      <slot />
    </div>
    <footer
      v-if="!loading && !errorMessage && ($slots.footer || $slots.actions)"
      class="base-card__footer"
    >
      <slot name="footer" />
      <div
        v-if="$slots.actions"
        class="base-card__actions"
      >
        <slot name="actions" />
      </div>
    </footer>
  </component>
</template>

<style scoped>
.base-card {
  display: block;
  width: 100%;
  min-width: 0;
  margin: 0;
  border: 1px solid transparent;
  border-radius: var(--radius-lg, 16px);
  color: var(--color-text, #1f2937);
  background: var(--color-surface, #ffffff);
  font-family: var(--font-family, inherit);
  text-align: left;
}

button.base-card {
  appearance: none;
}

.base-card--default {
  border-color: var(--color-border-subtle, #e7ebe8);
}

.base-card--outlined {
  border-color: var(--color-border, #d7ddd9);
}

.base-card--elevated {
  border-color: var(--color-border-subtle, #eef1ef);
  box-shadow: var(--shadow-card, 0 6px 20px rgb(17 24 39 / 9%));
}

.base-card--muted {
  background: var(--color-surface-muted, #f5f7f6);
}

.base-card--padding-none {
  padding: 0;
}

.base-card--padding-sm {
  padding: var(--space-3, 12px);
}

.base-card--padding-md {
  padding: var(--space-4, 16px);
}

.base-card--padding-lg {
  padding: var(--space-6, 24px);
}

.base-card--interactive {
  cursor: pointer;
  transition:
    border-color 160ms ease,
    box-shadow 160ms ease,
    transform 160ms ease;
}

.base-card--interactive:hover:not(.base-card--disabled) {
  border-color: var(--color-primary-soft, #8db9a7);
  box-shadow: var(--shadow-card-hover, 0 8px 24px rgb(17 24 39 / 12%));
  transform: translateY(-1px);
}

.base-card--interactive:focus-visible {
  outline: 3px solid var(--color-focus-ring, rgb(46 125 92 / 24%));
  outline-offset: 2px;
}

.base-card--disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

.base-card__header,
.base-card__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3, 12px);
}

.base-card__header {
  margin-bottom: var(--space-4, 16px);
}

.base-card__footer {
  margin-top: var(--space-4, 16px);
}

.base-card__body {
  min-width: 0;
}

.base-card__state {
  display: flex;
  min-height: 96px;
  align-items: center;
  justify-content: center;
  gap: var(--space-2, 8px);
  color: var(--color-text-muted, #66736c);
  font-size: var(--font-size-sm, 0.875rem);
  text-align: center;
}

.base-card__state--error {
  color: var(--color-danger, #c73e3e);
}

.base-card__spinner {
  width: 18px;
  height: 18px;
  border: 2px solid currentColor;
  border-right-color: transparent;
  border-radius: 50%;
  animation: base-card-spin 700ms linear infinite;
}

.base-card__actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: var(--space-2, 8px);
  margin-left: auto;
}

@keyframes base-card-spin {
  to {
    transform: rotate(360deg);
  }
}

@media (prefers-reduced-motion: reduce) {
  .base-card--interactive {
    transition: none;
  }

  .base-card__spinner {
    animation-duration: 1.4s;
  }
}
</style>
