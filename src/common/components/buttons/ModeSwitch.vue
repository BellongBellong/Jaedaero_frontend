<script setup>
import { computed } from 'vue'

import switchIcon from '@/assets/icons/reflectIcon.svg'

const props = defineProps({
  modelValue: { type: String, default: 'military' },
  interactive: { type: Boolean, default: false },
})
const emit = defineEmits(['update:modelValue'])

const currentMode = computed(() =>
  props.modelValue === 'military'
    ? {
        label: '생활관모드',
        emoji: '🪖',
        className: 'military',
      }
    : {
        label: '휴가모드',
        emoji: '🏖️',
        className: 'vacation',
      },
)

function toggleMode() {
  if (!props.interactive) return
  emit('update:modelValue', props.modelValue === 'military' ? 'vacation' : 'military')
}
</script>

<template>
  <button
    class="mode-switch"
    :class="currentMode.className"
    :disabled="!interactive"
    @click="toggleMode"
  >
    <div class="mode-switch__icon">
      <Transition
        name="fade"
        mode="out-in"
      >
        <span
          :key="modelValue"
          class="mode-switch__emoji"
          aria-hidden="true"
        >
          {{ currentMode.emoji }}
        </span>
      </Transition>
    </div>

    <Transition
      name="slide"
      mode="out-in"
    >
      <span
        :key="modelValue"
        class="mode-switch__label"
      >
        {{ currentMode.label }}
      </span>
    </Transition>

    <img
      class="mode-switch__switch"
      :class="{ rotate: modelValue === 'vacation' }"
      :src="switchIcon"
      alt=""
    >
  </button>
</template>

<style scoped>
.mode-switch {
  display: inline-flex;
  align-items: center;
  gap: var(--space-8);

  height: 40px;
  padding: 4px 10px;

  border: 1px solid rgb(255 255 255 / 48%);
  border-radius: 999px;

  cursor: pointer;

  transition:
    background 0.35s ease,
    transform 0.2s ease,
    box-shadow 0.35s ease;

  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / 72%),
    inset 0 -1px 0 rgb(255 255 255 / 18%),
    0 6px 16px rgb(35 54 42 / 8%);

  backdrop-filter: blur(16px) saturate(130%);
  -webkit-backdrop-filter: blur(16px) saturate(130%);
}

.mode-switch:hover {
  transform: translateY(-1px);
}

.mode-switch:active {
  transform: scale(0.97);
}
.mode-switch:disabled {
  cursor: default;
}

@media (display-mode: standalone) {
  .mode-switch {
    -webkit-backdrop-filter: none;
    backdrop-filter: none;
  }
}

.mode-switch.military {
  background:
    linear-gradient(180deg, rgb(255 255 255 / 38%), rgb(255 255 255 / 8%)),
    linear-gradient(180deg, rgb(192 251 215 / 48%), rgb(255 244 186 / 42%));
}

.mode-switch.vacation {
  background:
    linear-gradient(180deg, rgb(255 255 255 / 38%), rgb(255 255 255 / 8%)),
    linear-gradient(180deg, rgb(190 221 255 / 54%), rgb(225 239 255 / 42%));
}

.mode-switch__icon {
  display: grid;
  place-items: center;

  width: 24px;
  height: 24px;

  border-radius: 50%;

  background: rgb(82 102 78 / 28%);
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / 38%),
    0 2px 7px rgb(34 48 38 / 10%);
}

.mode-switch.vacation .mode-switch__icon {
  background: rgb(114 160 204 / 22%);
}

.mode-switch__emoji {
  display: block;
  font-family: 'Apple Color Emoji', 'Segoe UI Emoji', sans-serif;
  font-size: 12px;
  line-height: 1;
}

.mode-switch__label {
  color: var(--gray-700);

  font-size: var(--text-xs);
  font-weight: var(--weight-medium);

  white-space: nowrap;
}

.mode-switch__switch {
  width: 14px;
  height: 14px;

  margin-left: auto;

  transition: transform 0.35s ease;
}

.mode-switch__switch.rotate {
  transform: rotate(180deg);
}

/* 텍스트 */

.slide-enter-active,
.slide-leave-active {
  transition: 0.2s ease;
}

.slide-enter-from {
  opacity: 0;
  transform: translateY(6px);
}

.slide-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

/* 아이콘 */

.fade-enter-active,
.fade-leave-active {
  transition: 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: scale(0.8) rotate(-90deg);
}
</style>
