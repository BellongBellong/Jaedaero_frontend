<script setup>
import { computed } from 'vue'

const props = defineProps({
  visible: { type: Boolean, default: false },
  message: { type: String, default: '' },
  variant: { type: String, default: 'success' },
})

const icon = computed(() => ({ success: '✓', error: '!', info: 'i' })[props.variant] || '✓')
</script>

<template>
  <Transition name="base-toast">
    <div
      v-if="visible"
      class="base-toast"
      :class="`base-toast--${variant}`"
      role="status"
      aria-live="polite"
    >
      <span
        class="base-toast__icon"
        aria-hidden="true"
      >
        {{ icon }}
      </span>
      <span class="base-toast__message">{{ message }}</span>
    </div>
  </Transition>
</template>

<style scoped>
.base-toast {
  position: fixed;
  z-index: var(--z-toast);
  top: calc(var(--safe-area-top) + 16px);
  left: 50%;
  display: flex;
  align-items: center;
  width: min(calc(100vw - 48px), 300px);
  min-height: 44px;
  padding: 9px 12px 9px 10px;
  overflow: hidden;
  border: 1px solid var(--green-200);
  border-radius: var(--radius-xl);
  background: linear-gradient(135deg, var(--white) 0%, var(--green-50) 100%);
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / 90%),
    var(--shadow-lg);
  color: var(--olive-800);
  font-size: 13px;
  font-weight: var(--weight-semibold);
  line-height: 1.4;
  pointer-events: none;
  transform: translateX(-50%);
}

.base-toast--error {
  border-color: var(--orange-200);
  background: linear-gradient(135deg, var(--white) 0%, var(--orange-50) 100%);
  color: var(--orange-900);
}

.base-toast--info {
  border-color: var(--blue-200);
  background: linear-gradient(135deg, var(--white) 0%, #f4fbff 100%);
  color: var(--olive-800);
}

.base-toast__icon {
  display: inline-grid;
  width: 24px;
  height: 24px;
  flex: 0 0 auto;
  margin-right: 8px;
  border-radius: 50%;
  background: var(--green-700);
  color: var(--white);
  font-size: 13px;
  font-weight: 800;
  place-items: center;
}

.base-toast--error .base-toast__icon {
  background: var(--orange-600);
}

.base-toast--info .base-toast__icon {
  background: var(--blue-800);
}

.base-toast__message {
  min-width: 0;
}

.base-toast-enter-active,
.base-toast-leave-active {
  transition:
    opacity var(--duration-normal) var(--ease-default),
    transform var(--duration-normal) var(--ease-default);
}

.base-toast-enter-from,
.base-toast-leave-to {
  opacity: 0;
  transform: translate(-50%, -10px);
}

@media (prefers-reduced-motion: reduce) {
  .base-toast-enter-active,
  .base-toast-leave-active {
    transition: opacity var(--duration-fast) linear;
  }

  .base-toast-enter-from,
  .base-toast-leave-to {
    transform: translateX(-50%);
  }
}
</style>
