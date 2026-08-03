<script setup>
import { computed, ref } from 'vue'

import militaryModeIcon from '@/assets/icons/militeryModeIcon.svg'
import vacationModeIcon from '@/assets/icons/vacationModeIcon.svg'
import switchIcon from '@/assets/icons/reflectIcon.svg'

const mode = ref('military')

const currentMode = computed(() =>
  mode.value === 'military'
    ? {
        label: '생활관모드',
        icon: militaryModeIcon,
        className: 'military',
      }
    : {
        label: '휴가모드',
        icon: vacationModeIcon,
        className: 'vacation',
      },
)

function toggleMode() {
  mode.value = mode.value === 'military' ? 'vacation' : 'military'
}
</script>

<template>
  <button
    class="mode-switch"
    :class="currentMode.className"
    @click="toggleMode"
  >
    <div class="mode-switch__icon">
      <Transition
        name="fade"
        mode="out-in"
      >
        <img
          :key="mode"
          :src="currentMode.icon"
          alt=""
        >
      </Transition>
    </div>

    <Transition
      name="slide"
      mode="out-in"
    >
      <span
        :key="mode"
        class="mode-switch__label"
      >
        {{ currentMode.label }}
      </span>
    </Transition>

    <img
      class="mode-switch__switch"
      :class="{ rotate: mode === 'vacation' }"
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

  height: 32px;
  padding: 4px 10px;

  border: none;
  border-radius: 999px;

  cursor: pointer;

  transition:
    background 0.35s ease,
    transform 0.2s ease,
    box-shadow 0.35s ease;

  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / 40%),
    0 8px 20px rgb(0 0 0 / 8%);

  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}

.mode-switch:hover {
  transform: translateY(-1px);
}

.mode-switch:active {
  transform: scale(0.97);
}

/* 생활관 */

.mode-switch.military {
  background:
    linear-gradient(180deg, rgb(255 255 255 / 18%) 0%, rgb(255 255 255 / 6%) 100%),
    linear-gradient(0deg, rgb(255 229 114 / 20%) 0%, rgb(98 255 156 / 20%) 100%);
}

/* 휴가 */

.mode-switch.vacation {
  background:
    linear-gradient(180deg, rgb(255 255 255 / 18%) 0%, rgb(255 255 255 / 6%) 100%),
    linear-gradient(0deg, rgb(204 226 255 / 25%) 0%, rgb(152 204 255 / 18%) 100%);
}

.mode-switch__icon {
  display: grid;
  place-items: center;

  width: 24px;
  height: 24px;

  border-radius: 50%;

  background: rgb(255 255 255 / 40%);
}

.mode-switch__icon img {
  width: 18px;
  height: 18px;
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
