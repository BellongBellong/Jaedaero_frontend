<script setup>
import { computed, useAttrs } from 'vue'

defineOptions({ inheritAttrs: false })

const props = defineProps({
  modelValue: { type: Number, default: 0 },
  min: { type: Number, default: 0 },
  max: { type: Number, default: 100 },
  step: { type: Number, default: 1 },
  color: { type: String, default: 'var(--green-500)' },
  disabled: { type: Boolean, default: false },
})
const emit = defineEmits(['update:modelValue', 'change'])
const attrs = useAttrs()

const progress = computed(() => {
  const range = props.max - props.min
  if (range <= 0) return 0
  return Math.min(100, Math.max(0, ((props.modelValue - props.min) / range) * 100))
})

const sliderStyle = computed(() => ({
  '--liquid-slider-progress': `${progress.value}%`,
  '--liquid-slider-color': props.color,
}))
</script>

<template>
  <span
    class="liquid-glass-slider"
    :class="{ 'liquid-glass-slider--disabled': disabled }"
  >
    <input
      v-bind="attrs"
      class="liquid-glass-slider__input"
      :style="sliderStyle"
      type="range"
      :value="modelValue"
      :min="min"
      :max="max"
      :step="step"
      :disabled="disabled"
      @input="emit('update:modelValue', Number($event.target.value))"
      @change="emit('change', Number($event.target.value))"
    >
  </span>
</template>

<style scoped>
.liquid-glass-slider {
  display: flex;
  min-width: 0;
  width: 100%;
  height: 20px;
  align-items: center;
}

.liquid-glass-slider__input {
  width: 100%;
  height: 20px;
  margin: 0;
  appearance: none;
  background: transparent;
  cursor: pointer;
}

.liquid-glass-slider__input::-webkit-slider-runnable-track {
  height: 5px;
  border-radius: 999px;
  background: linear-gradient(
    to right,
    var(--liquid-slider-color) 0 var(--liquid-slider-progress),
    var(--gray-200) var(--liquid-slider-progress) 100%
  );
}

.liquid-glass-slider__input::-webkit-slider-thumb {
  width: 13px;
  height: 13px;
  margin-top: -4px;
  appearance: none;
  border: 1px solid rgb(255 255 255 / 66%);
  border-radius: 50%;
  background: var(--liquid-slider-color);
  background:
    radial-gradient(circle at 35% 28%, rgb(255 255 255 / 54%), transparent 38%),
    color-mix(in srgb, var(--liquid-slider-color) 86%, white 14%);
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / 52%),
    0 2px 5px rgb(0 0 0 / 22%);
  transition: transform 160ms cubic-bezier(0.22, 1, 0.36, 1);
}

.liquid-glass-slider__input:active::-webkit-slider-thumb {
  transform: scale(1.22);
}

.liquid-glass-slider__input::-moz-range-track {
  height: 5px;
  border-radius: 999px;
  background: var(--gray-200);
}

.liquid-glass-slider__input::-moz-range-progress {
  height: 5px;
  border-radius: 999px;
  background: var(--liquid-slider-color);
}

.liquid-glass-slider__input::-moz-range-thumb {
  width: 13px;
  height: 13px;
  border: 1px solid rgb(255 255 255 / 66%);
  border-radius: 50%;
  background: var(--liquid-slider-color);
  box-shadow: 0 2px 5px rgb(0 0 0 / 22%);
}

.liquid-glass-slider__input:focus-visible {
  outline: 2px solid var(--green-300);
  outline-offset: 3px;
}

.liquid-glass-slider--disabled {
  opacity: 0.58;
}

.liquid-glass-slider--disabled .liquid-glass-slider__input {
  cursor: not-allowed;
}

@media (prefers-reduced-motion: reduce) {
  .liquid-glass-slider__input::-webkit-slider-thumb {
    transition: none;
  }
}
</style>
