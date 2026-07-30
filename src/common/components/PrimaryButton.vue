<script setup>
defineProps({
  disabled: Boolean,
  loading: Boolean,
  type: { type: String, default: 'button' },
})

defineEmits(['click'])
</script>

<template>
  <button
    class="primary-button"
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
  background: #333;
  color: #fff;
  font-size: 18px;
  font-weight: 700;
  cursor: pointer;
}
.primary-button:disabled {
  background: #ededed;
  color: #8f8f8f;
  cursor: not-allowed;
}
</style>
