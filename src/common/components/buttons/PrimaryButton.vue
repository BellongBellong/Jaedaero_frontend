<script setup>
const props = defineProps({
  disabled: Boolean,
  loading: Boolean,
  type: { type: String, default: 'button' },
  variant: {
    type: String,
    default: 'dark',
    validator: (value) => ['dark', 'green'].includes(value),
  },
  shape: {
    type: String,
    default: 'pill',
    validator: (value) => ['pill', 'square'].includes(value),
  },
})

defineEmits(['click'])
</script>

<template>
  <button
    class="primary-button"
    :class="[`primary-button--${props.variant}`, `primary-button--${props.shape}`]"
    :type="type"
    :disabled="disabled || loading"
    @click="$emit('click', $event)"
  >
    {{ loading ? '잠시만 기다려주세요' : '' }}<slot v-if="!loading" />
  </button>
</template>

<style scoped>
.primary-button {
  width: 100%;
  min-height: 58px;
  padding: 0 22px;
  border: 0;
  border-radius: 29px;
  font-size: 18px;
  font-weight: 700;
  cursor: pointer;
}
.primary-button--dark {
  background: #333;
  color: #fff;
}
.primary-button--green {
  background: var(--green-500, #62ff9c);
  color: var(--ui-text, #333);
}
.primary-button--square {
  border-radius: 0;
}
.primary-button:disabled {
  background: #ededed;
  color: #8f8f8f;
  cursor: not-allowed;
}
</style>
