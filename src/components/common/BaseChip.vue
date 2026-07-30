<script setup>
import { computed } from 'vue'

const props = defineProps({
  label: {
    type: String,
    default: '',
  },
  selected: {
    type: Boolean,
    default: false,
  },
  selectable: {
    type: Boolean,
    default: false,
  },
  removable: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md'].includes(value),
  },
  removeLabel: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['click', 'update:selected', 'remove'])

const accessibleRemoveLabel = computed(() => {
  return props.removeLabel || `${props.label || '항목'} 제거`
})

function handleClick(event) {
  if (props.disabled) {
    return
  }

  if (props.selectable) {
    emit('update:selected', !props.selected)
  }

  emit('click', event)
}

function handleRemove(event) {
  if (!props.disabled) {
    emit('remove', event)
  }
}
</script>

<template>
  <span
    class="base-chip"
    :class="[
      `base-chip--${size}`,
      {
        'base-chip--selected': selected,
        'base-chip--disabled': disabled,
      },
    ]"
  >
    <button
      class="base-chip__action"
      type="button"
      :disabled="disabled"
      :aria-pressed="selectable ? String(selected) : undefined"
      @click="handleClick"
    >
      <span
        v-if="$slots.leading"
        class="base-chip__leading"
        aria-hidden="true"
      >
        <slot name="leading" />
      </span>
      <span class="base-chip__label">
        <slot>{{ label }}</slot>
      </span>
    </button>

    <button
      v-if="removable"
      class="base-chip__remove"
      type="button"
      :disabled="disabled"
      :aria-label="accessibleRemoveLabel"
      @click="handleRemove"
    >
      <svg
        viewBox="0 0 16 16"
        aria-hidden="true"
      >
        <path d="m4 4 8 8M12 4l-8 8" />
      </svg>
    </button>
  </span>
</template>

<style scoped>
.base-chip {
  display: inline-flex;
  align-items: stretch;
  width: fit-content;
  max-width: 100%;
  overflow: hidden;
  border: 1px solid var(--color-border, #d7ddd9);
  border-radius: var(--radius-full, 999px);
  color: var(--color-text-muted, #59665f);
  background: var(--color-surface, #ffffff);
  font-family: var(--font-family, inherit);
  transition:
    color 160ms ease,
    border-color 160ms ease,
    background-color 160ms ease;
}

.base-chip:hover:not(.base-chip--disabled) {
  border-color: var(--color-primary-soft, #8db9a7);
}

.base-chip--selected {
  color: var(--color-primary-strong, #18513a);
  border-color: var(--color-primary, #236b4e);
  background: var(--color-primary-subtle, #e2f0e9);
}

.base-chip--disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

.base-chip__action,
.base-chip__remove {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 0;
  color: inherit;
  background: transparent;
  font: inherit;
  cursor: pointer;
}

.base-chip__action:disabled,
.base-chip__remove:disabled {
  cursor: not-allowed;
}

.base-chip__action:focus-visible,
.base-chip__remove:focus-visible {
  z-index: 1;
  outline: 3px solid var(--color-focus-ring, rgb(46 125 92 / 24%));
  outline-offset: -2px;
}

.base-chip--sm {
  min-height: 32px;
  font-size: var(--font-size-xs, 0.75rem);
}

.base-chip--md {
  min-height: 40px;
  font-size: var(--font-size-sm, 0.875rem);
}

.base-chip__action {
  min-width: 0;
  padding: 0 var(--space-3, 12px);
  gap: var(--space-2, 8px);
}

.base-chip__label {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.base-chip__leading {
  display: inline-flex;
  flex: 0 0 auto;
}

.base-chip__remove {
  width: 36px;
  flex: 0 0 36px;
  padding: 0;
  border-left: 1px solid rgb(0 0 0 / 8%);
}

.base-chip__remove svg {
  width: 16px;
  height: 16px;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.75;
  stroke-linecap: round;
}

@media (prefers-reduced-motion: reduce) {
  .base-chip {
    transition: none;
  }
}
</style>
