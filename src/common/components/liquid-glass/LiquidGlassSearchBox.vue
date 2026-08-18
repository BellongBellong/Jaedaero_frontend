<script setup>
import { computed, ref } from 'vue'

import LiquidGlassContainer from './LiquidGlassContainer.vue'

const props = defineProps({
  modelValue: { type: String, default: '' },
  placeholder: { type: String, default: '검색' },
  ariaLabel: { type: String, default: '검색어' },
  disabled: { type: Boolean, default: false },
})
const emit = defineEmits(['update:modelValue', 'focus', 'blur', 'submit'])

const inputElement = ref(null)
const hasValue = computed(() => props.modelValue.length > 0)

function clear() {
  if (props.disabled) return
  emit('update:modelValue', '')
  inputElement.value?.focus()
}

defineExpose({ focus: () => inputElement.value?.focus() })
</script>

<template>
  <LiquidGlassContainer
    as="form"
    class="liquid-glass-search-box"
    tone="clear"
    radius="999px"
    :blur="4"
    :disabled="disabled"
    role="search"
    @submit.prevent="emit('submit', modelValue)"
  >
    <svg
      class="liquid-glass-search-box__icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      aria-hidden="true"
    >
      <circle
        cx="11"
        cy="11"
        r="7"
      />
      <path d="m20 20-4-4" />
    </svg>
    <input
      ref="inputElement"
      :value="modelValue"
      type="search"
      :placeholder="placeholder"
      :aria-label="ariaLabel"
      :disabled="disabled"
      @input="emit('update:modelValue', $event.target.value)"
      @focus="emit('focus')"
      @blur="emit('blur')"
    >
    <button
      v-if="hasValue"
      class="liquid-glass-search-box__clear"
      type="button"
      aria-label="검색어 지우기"
      @click="clear"
    >
      ×
    </button>
  </LiquidGlassContainer>
</template>

<style scoped>
.liquid-glass-search-box {
  display: flex;
  width: 100%;
  height: 44px;
  align-items: center;
  gap: 10px;
  padding: 0 14px;
  transition:
    transform 260ms cubic-bezier(0.22, 1, 0.36, 1),
    box-shadow 260ms ease;
}

.liquid-glass-search-box:focus-within {
  transform: scale(1.01);
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / 76%),
    inset 0 -1px 0 rgb(26 34 29 / 9%),
    0 7px 22px rgb(26 34 29 / 11%);
}

.liquid-glass-search-box__icon {
  width: 18px;
  height: 18px;
  flex: 0 0 auto;
  color: var(--gray-500);
}

.liquid-glass-search-box input {
  min-width: 0;
  height: 100%;
  flex: 1;
  padding: 0;
  border: 0;
  outline: 0;
  background: transparent;
  color: var(--ui-text);
  font: inherit;
}

.liquid-glass-search-box input::-webkit-search-cancel-button {
  display: none;
}

.liquid-glass-search-box__clear {
  display: grid;
  width: 24px;
  height: 24px;
  flex: 0 0 auto;
  place-items: center;
  padding: 0 0 2px;
  border: 0;
  border-radius: 50%;
  background: rgb(99 99 102 / 18%);
  color: var(--gray-600);
  font-size: 18px;
  line-height: 1;
}
</style>
