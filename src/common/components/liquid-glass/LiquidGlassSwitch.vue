<script setup>
import LiquidGlassContainer from './LiquidGlassContainer.vue'

defineProps({
  modelValue: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  ariaLabel: { type: String, default: '설정 전환' },
})
const emit = defineEmits(['update:modelValue'])
</script>

<template>
  <LiquidGlassContainer
    as="button"
    class="liquid-glass-switch"
    :class="{ 'liquid-glass-switch--checked': modelValue }"
    tone="clear"
    radius="999px"
    :blur="3"
    :disabled="disabled"
    type="button"
    role="switch"
    :aria-checked="modelValue"
    :aria-label="ariaLabel"
    @click="emit('update:modelValue', !modelValue)"
  >
    <span class="liquid-glass-switch__thumb" />
  </LiquidGlassContainer>
</template>

<style scoped>
.liquid-glass-switch {
  width: 48px;
  height: 28px;
  padding: 3px;
  border-color: rgb(118 118 128 / 16%);
  background: rgb(118 118 128 / 18%);
  cursor: pointer;
  transition:
    background 220ms ease,
    transform 180ms ease;
}

.liquid-glass-switch--checked {
  background: rgb(41 210 106 / 56%);
}

.liquid-glass-switch:active:not(:disabled) {
  transform: scale(0.96);
}

.liquid-glass-switch__thumb {
  display: block;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: rgb(255 255 255 / 88%);
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / 92%),
    0 2px 7px rgb(0 0 0 / 18%);
  transform: translateX(0);
  transition: transform 300ms cubic-bezier(0.22, 1, 0.36, 1);
}

.liquid-glass-switch--checked .liquid-glass-switch__thumb {
  transform: translateX(20px);
}
</style>
