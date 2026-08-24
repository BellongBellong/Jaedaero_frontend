<script setup>
import { computed } from 'vue'

import missionAlarmIcon from '@/assets/features/notification/missionAlarmIcon.png'
import toastSuccessCheckIcon from '@/assets/icons/toast-success-check.png'

const props = defineProps({
  visible: { type: Boolean, default: false },
  message: { type: String, default: '' },
  variant: { type: String, default: 'success' },
  placement: { type: String, default: 'top' },
})

const icon = computed(() => ({ success: '✓', error: '!', info: 'i' })[props.variant] || '✓')
</script>

<template>
  <Transition name="base-toast">
    <div
      v-if="visible"
      class="base-toast"
      :class="[`base-toast--${variant}`, `base-toast--${placement}`]"
      role="status"
      aria-live="polite"
    >
      <span
        class="base-toast__icon"
        :class="{ 'base-toast__icon--mission': variant === 'mission' }"
        aria-hidden="true"
      >
        <img
          v-if="variant === 'mission'"
          :src="missionAlarmIcon"
          alt=""
        >
        <img
          v-else-if="variant === 'success'"
          :src="toastSuccessCheckIcon"
          alt=""
        >
        <span v-else>{{ icon }}</span>
      </span>
      <span class="base-toast__message">{{ message }}</span>
    </div>
  </Transition>
</template>

<style scoped>
.base-toast {
  position: fixed;
  z-index: var(--z-toast);
  top: calc(var(--safe-area-top) + 22px);
  left: 50%;
  display: flex;
  align-items: center;
  width: min(calc(100vw - 44px), 354px);
  min-height: 54px;
  box-sizing: border-box;
  padding: 10px 18px;
  overflow: hidden;
  border: 1px solid rgb(255 255 255 / 4%);
  border-radius: 14px;
  background: rgb(51 51 51 / 88%);
  box-shadow: 0 12px 28px rgb(0 0 0 / 22%);
  color: #fff;
  font-size: 13px;
  font-weight: 700;
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
  width: 18px;
  height: 18px;
  flex: 0 0 auto;
  margin-right: 10px;
  border-radius: 50%;
  background: #62ff9c;
  color: #333;
  font-size: 11px;
  font-weight: 800;
  place-items: center;
}

.base-toast--bottom {
  top: auto;
  bottom: calc(var(--bottom-navigation-area-height) + var(--safe-area-bottom) + 16px);
}

.base-toast__icon img {
  width: 18px;
  height: 18px;
  object-fit: contain;
}

.base-toast__icon--mission {
  overflow: hidden;
  border-radius: 0;
  background: transparent;
}

.base-toast--error .base-toast__icon {
  background: var(--orange-600);
}

.base-toast--info .base-toast__icon {
  background: var(--blue-800);
}

.base-toast__message {
  min-width: 0;
  color: #fff;
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
