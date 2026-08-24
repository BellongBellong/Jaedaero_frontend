<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'

defineOptions({
  inheritAttrs: false,
})

const props = defineProps({
  state: {
    type: String,
    default: 'default',
    validator: (value) => ['default', 'disabled'].includes(value),
  },
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
  inset: {
    type: Boolean,
    default: false,
  },
  keyboardAware: {
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

const isDisabled = computed(() => props.state === 'disabled' || props.disabled || props.loading)
const accessibleLabel = computed(() => {
  if (props.loading) {
    return props.loadingLabel
  }

  return props.ariaLabel || undefined
})

const isKeyboardOpen = ref(false)
const keyboardInset = ref(0)
let isMounted = false
let visualViewport = null

const keyboardStyle = computed(() => {
  if (!isKeyboardOpen.value) return undefined

  return {
    '--base-button-keyboard-bottom': `${keyboardInset.value}px`,
  }
})

function updateKeyboardState() {
  if (!props.keyboardAware || !visualViewport) return

  const inset = Math.max(0, window.innerHeight - visualViewport.height - visualViewport.offsetTop)
  const keyboardIsOpen = inset >= 100

  isKeyboardOpen.value = keyboardIsOpen
  keyboardInset.value = keyboardIsOpen ? inset : 0
}

function bindKeyboardObserver() {
  if (!props.keyboardAware || typeof window === 'undefined') return

  visualViewport = window.visualViewport
  window.addEventListener('resize', updateKeyboardState)
  visualViewport?.addEventListener('resize', updateKeyboardState)
  visualViewport?.addEventListener('scroll', updateKeyboardState)
  updateKeyboardState()
}

function unbindKeyboardObserver() {
  window.removeEventListener('resize', updateKeyboardState)
  visualViewport?.removeEventListener('resize', updateKeyboardState)
  visualViewport?.removeEventListener('scroll', updateKeyboardState)
  visualViewport = null
  isKeyboardOpen.value = false
  keyboardInset.value = 0
}

function handleClick(event) {
  if (isDisabled.value) {
    event.preventDefault()
    return
  }

  emit('click', event)
}

onMounted(() => {
  isMounted = true
  bindKeyboardObserver()
})

watch(
  () => props.keyboardAware,
  (enabled) => {
    if (!isMounted) return
    if (enabled) bindKeyboardObserver()
    else unbindKeyboardObserver()
  },
)

onBeforeUnmount(() => {
  if (typeof window !== 'undefined') unbindKeyboardObserver()
})
</script>

<template>
  <button
    v-bind="$attrs"
    class="base-button"
    :class="[
      `base-button--state-${isDisabled ? 'disabled' : 'default'}`,
      `base-button--${variant}`,
      `base-button--${size}`,
      {
        'base-button--block': block,
        'base-button--inset': inset,
        'base-button--keyboard': isKeyboardOpen,
        'base-button--loading': loading,
      },
    ]"
    :style="keyboardStyle"
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
  display: flex;
  align-items: center;
  justify-content: center;
  height: 56px;
  min-width: 0;
  border: 1px solid transparent;
  border-radius: 28px;
  color: var(--ui-text, #333333);
  font-family: var(--body-body-large-bold-font-family, 'Pretendard-Bold', sans-serif);
  font-size: var(--body-body-large-bold-font-size, 18px);
  font-weight: var(--body-body-large-bold-font-weight, 700);
  letter-spacing: var(--body-body-large-bold-letter-spacing, -0.04em);
  line-height: var(--body-body-large-bold-line-height, 150%);
  cursor: pointer;
}

.base-button,
.base-button * {
  box-sizing: border-box;
}

.base-button:focus-visible {
  outline: 3px solid var(--color-focus-ring, rgb(46 125 92 / 28%));
  outline-offset: 2px;
}

.base-button:disabled {
  cursor: not-allowed;
}

.base-button.base-button--state-disabled,
.base-button.base-button--state-disabled:disabled {
  border-color: transparent;
  color: var(--ui-sub-title-light, #bdbdbd);
  background: var(--ui-light-gray, #ececec);
  opacity: 1;
}

.base-button--primary {
  color: var(--ui-text, #333333);
  background: var(--green-500, #62ff9c);
}

.base-button--secondary {
  color: var(--brand-primary, var(--green-700, #20ba5c));
  background: var(--ui-surface, #ffffff);
  border-color: var(--brand-primary, var(--green-700, #20ba5c));
}

.base-button--ghost {
  color: var(--ui-text, #1f2937);
  background: transparent;
}

.base-button--ghost:hover:not(:disabled) {
  background: var(--gray-50, #f3f5f4);
}

.base-button--danger {
  color: var(--white, #ffffff);
  background: var(--red-500, #c73e3e);
}

.base-button--sm {
  height: 36px;
  min-height: 36px;
  padding: 0 var(--space-3, 12px);
  font-size: var(--font-size-sm, 0.875rem);
  gap: var(--space-2, 8px);
}

.base-button--md {
  height: 44px;
  min-height: 44px;
  padding: 0 var(--space-4, 16px);
  font-size: var(--font-size-md, 1rem);
  gap: var(--space-2, 8px);
}

.base-button--lg {
  height: 56px;
  min-height: 56px;
  padding: 0 var(--space-20, 20px);
  gap: 10px;
}

.base-button--block {
  width: 100%;
}

.base-button--inset {
  width: calc(100% - (var(--layout-page-padding, 20px) * 2));
  margin-inline: var(--layout-page-padding, 20px);
}

.base-button--keyboard {
  position: fixed;
  z-index: var(--z-fab, 500);
  bottom: var(--base-button-keyboard-bottom, 0px);
  left: 50%;
  width: min(100vw, var(--design-mobile-width, 393px));
  min-height: 56px;
  margin: 0;
  border-radius: 0;
  padding-inline: var(--layout-page-padding, 20px);
  transform: translateX(-50%);
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
