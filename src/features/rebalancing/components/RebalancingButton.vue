<script setup>
defineOptions({ name: 'RebalancingCard' })

defineProps({
  disabled: {
    type: Boolean,
    default: false,
  },
  ariaLabel: {
    type: String,
    default: '리밸런싱 상세 화면으로 이동',
  },
})

const emit = defineEmits(['click'])

function handleClick(event) {
  emit('click', event)
}
</script>

<template>
  <button
    type="button"
    class="rebalancing-button"
    :disabled="disabled"
    :aria-label="ariaLabel"
    @click="handleClick"
  >
    <svg
      class="rebalancing-button__icon"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        d="M7 17 17 7M9 7h8v8"
        fill="none"
        stroke="currentColor"
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
      />
    </svg>
  </button>
</template>

<style scoped>
.rebalancing-button {
  display: inline-flex;
  width: 48px;
  height: 48px;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  padding: 0;
  border: 0;
  border-radius: 50%;
  color: var(--color-text, #173b2c);
  background: var(--color-accent, #53f392);
  cursor: pointer;
  transition:
    filter 160ms ease,
    transform 120ms ease;
}

.rebalancing-button:hover:not(:disabled) {
  filter: brightness(0.97);
}

.rebalancing-button:active:not(:disabled) {
  transform: scale(0.94);
}

.rebalancing-button:focus-visible {
  outline: 3px solid rgb(23 59 44 / 25%);
  outline-offset: 3px;
}

.rebalancing-button:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.rebalancing-button__icon {
  width: 24px;
  height: 24px;
}

@media (prefers-reduced-motion: reduce) {
  .rebalancing-button {
    transition: none;
  }
}
</style>
