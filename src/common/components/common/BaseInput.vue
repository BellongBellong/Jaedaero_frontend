<script setup>
import { computed, nextTick, ref, useAttrs, useId, useSlots } from 'vue'

defineOptions({
  inheritAttrs: false,
})

const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: '',
  },
  id: {
    type: String,
    default: '',
  },
  label: {
    type: String,
    default: '',
  },
  type: {
    type: String,
    default: 'text',
  },
  placeholder: {
    type: String,
    default: '',
  },
  hint: {
    type: String,
    default: '',
  },
  error: {
    type: String,
    default: '',
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  readonly: {
    type: Boolean,
    default: false,
  },
  required: {
    type: Boolean,
    default: false,
  },
  clearable: {
    type: Boolean,
    default: false,
  },
  clearLabel: {
    type: String,
    default: '입력 내용 지우기',
  },
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg'].includes(value),
  },
  modelModifiers: {
    type: Object,
    default: () => ({}),
  },
})

const emit = defineEmits(['update:modelValue', 'focus', 'blur', 'change', 'clear'])

const attrs = useAttrs()
const slots = useSlots()
const generatedId = useId()
const inputElement = ref(null)

const inputId = computed(() => props.id || `base-input-${generatedId}`)
const messageId = computed(() => `${inputId.value}-message`)
const hasError = computed(() => Boolean(props.error))
const message = computed(() => props.error || props.hint)
const hasLeading = computed(() => Boolean(slots.leading))
const canClear = computed(() => {
  return (
    props.clearable &&
    !props.disabled &&
    !props.readonly &&
    props.modelValue !== null &&
    String(props.modelValue).length > 0
  )
})
const hasTrailing = computed(() => Boolean(slots.trailing) || canClear.value)
const describedBy = computed(() => {
  return [attrs['aria-describedby'], message.value ? messageId.value : ''].filter(Boolean).join(' ')
})

function normalizeValue(rawValue) {
  let nextValue = rawValue

  if (props.modelModifiers.trim) {
    nextValue = nextValue.trim()
  }

  if (props.modelModifiers.number && nextValue !== '') {
    const numberValue = Number(nextValue)
    nextValue = Number.isNaN(numberValue) ? nextValue : numberValue
  }

  return nextValue
}

function handleInput(event) {
  emit('update:modelValue', normalizeValue(event.target.value))
}

function handleFocus(event) {
  emit('focus', event)
}

function handleBlur(event) {
  emit('blur', event)
}

function handleChange(event) {
  emit('change', event)
}

async function handleClear() {
  emit('update:modelValue', '')
  emit('clear')
  await nextTick()
  inputElement.value?.focus()
}
</script>

<template>
  <div
    class="base-input"
    :class="[
      `base-input--${size}`,
      {
        'base-input--error': hasError,
        'base-input--disabled': disabled,
      },
    ]"
  >
    <label
      v-if="label"
      class="base-input__label"
      :for="inputId"
    >
      {{ label }}
      <span
        v-if="required"
        class="base-input__required"
        aria-hidden="true"
      >
        *
      </span>
    </label>

    <div class="base-input__control">
      <span
        v-if="hasLeading"
        class="base-input__adornment base-input__adornment--leading"
        aria-hidden="true"
      >
        <slot name="leading" />
      </span>

      <input
        v-bind="$attrs"
        :id="inputId"
        ref="inputElement"
        class="base-input__field"
        :class="{
          'base-input__field--leading': hasLeading,
          'base-input__field--trailing': hasTrailing,
          'base-input__field--clearable': canClear,
          'base-input__field--clearable-with-slot': canClear && $slots.trailing,
        }"
        :value="modelValue"
        :type="type"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :required="required"
        :aria-invalid="hasError ? 'true' : undefined"
        :aria-describedby="describedBy || undefined"
        @input="handleInput"
        @focus="handleFocus"
        @blur="handleBlur"
        @change="handleChange"
      >

      <span
        v-if="hasTrailing"
        class="base-input__adornment base-input__adornment--trailing"
      >
        <button
          v-if="canClear"
          class="base-input__clear"
          type="button"
          :aria-label="clearLabel"
          @click="handleClear"
        >
          <svg
            viewBox="0 0 16 16"
            aria-hidden="true"
          >
            <path d="m4 4 8 8M12 4l-8 8" />
          </svg>
        </button>
        <slot name="trailing" />
      </span>
    </div>

    <p
      v-if="message"
      :id="messageId"
      class="base-input__message"
      :class="{ 'base-input__message--error': hasError }"
      :role="hasError ? 'alert' : undefined"
    >
      {{ message }}
    </p>
  </div>
</template>

<style scoped>
.base-input {
  display: grid;
  width: 100%;
  gap: var(--space-2, 8px);
  color: var(--color-text, #1f2937);
  font-family: var(--font-family, inherit);
}

.base-input__label {
  width: fit-content;
  color: var(--color-text, #1f2937);
  font-size: var(--font-size-sm, 0.875rem);
  font-weight: var(--font-weight-semibold, 600);
  line-height: 1.4;
}

.base-input__required {
  color: var(--color-danger, #c73e3e);
}

.base-input__control {
  position: relative;
  display: flex;
  align-items: center;
}

.base-input__field {
  width: 100%;
  min-width: 0;
  border: 1px solid var(--color-border, #d7ddd9);
  border-radius: var(--radius-md, 10px);
  color: var(--color-text, #1f2937);
  background: var(--color-surface, #ffffff);
  font: inherit;
  line-height: 1.4;
  transition:
    border-color 160ms ease,
    box-shadow 160ms ease,
    background-color 160ms ease;
}

.base-input__field::placeholder {
  color: var(--color-text-placeholder, #8b9690);
  opacity: 1;
}

.base-input__field:hover:not(:disabled):not(:read-only) {
  border-color: var(--color-border-strong, #a8b4ad);
}

.base-input__field:focus-visible {
  border-color: var(--color-primary, #236b4e);
  outline: 3px solid var(--color-focus-ring, rgb(46 125 92 / 20%));
  outline-offset: 0;
}

.base-input__field:disabled {
  color: var(--color-text-disabled, #8b9690);
  background: var(--color-surface-disabled, #eef1ef);
  cursor: not-allowed;
}

.base-input__field:read-only:not(:disabled) {
  background: var(--color-surface-muted, #f7f8f7);
}

.base-input--sm .base-input__field {
  min-height: 38px;
  padding: var(--space-2, 8px) var(--space-3, 12px);
  font-size: var(--font-size-sm, 0.875rem);
}

.base-input--md .base-input__field {
  min-height: 44px;
  padding: var(--space-3, 12px) var(--space-4, 16px);
  font-size: var(--font-size-md, 1rem);
}

.base-input--lg .base-input__field {
  min-height: 52px;
  padding: var(--space-3, 12px) var(--space-4, 16px);
  font-size: var(--font-size-lg, 1.0625rem);
}

.base-input__field--leading {
  padding-left: calc(var(--space-4, 16px) + 1.5em);
}

.base-input__field--trailing {
  padding-right: calc(var(--space-4, 16px) + 1.5em);
}

.base-input__field--clearable {
  padding-right: calc(var(--space-4, 16px) + 2.75em);
}

.base-input__field--clearable-with-slot {
  padding-right: calc(var(--space-4, 16px) + 4.5em);
}

.base-input__adornment {
  position: absolute;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-muted, #66736c);
  pointer-events: none;
}

.base-input__adornment--leading {
  left: var(--space-3, 12px);
}

.base-input__adornment--trailing {
  right: var(--space-3, 12px);
  gap: var(--space-2, 8px);
  pointer-events: auto;
}

.base-input__clear {
  display: inline-grid;
  width: 28px;
  height: 28px;
  padding: 0;
  place-items: center;
  border: 0;
  border-radius: 50%;
  background: var(--color-surface-strong, #e3e8e5);
  color: var(--color-text-muted, #66736c);
  cursor: pointer;
}

.base-input__clear:hover {
  color: var(--color-text, #1f2937);
}

.base-input__clear:focus-visible {
  outline: 3px solid var(--color-focus-ring, rgb(46 125 92 / 20%));
  outline-offset: 1px;
}

.base-input__clear svg {
  width: 14px;
  height: 14px;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.75;
  stroke-linecap: round;
}

.base-input--error .base-input__field {
  border-color: var(--color-danger, #c73e3e);
}

.base-input--error .base-input__field:focus-visible {
  outline-color: var(--color-danger-focus, rgb(199 62 62 / 20%));
}

.base-input__message {
  min-height: 1.25em;
  margin: 0;
  color: var(--color-text-muted, #66736c);
  font-size: var(--font-size-xs, 0.75rem);
  line-height: 1.4;
}

.base-input__message--error {
  color: var(--color-danger, #c73e3e);
}

@media (prefers-reduced-motion: reduce) {
  .base-input__field {
    transition: none;
  }
}
</style>
