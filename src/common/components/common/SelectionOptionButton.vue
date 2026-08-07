<script setup>
import selectedIcon from '@/assets/icons/checkIconBasic.svg'

defineProps({
  label: {
    type: String,
    required: true,
  },
  selected: {
    type: Boolean,
    default: false,
  },
})

defineEmits(['select'])
</script>

<template>
  <button
    class="selection-option"
    type="button"
    role="option"
    :aria-selected="selected"
    @click="$emit('select')"
  >
    <span>{{ label }}</span>
    <img
      v-if="selected"
      :src="selectedIcon"
      alt=""
      aria-hidden="true"
    >
    <span
      v-else
      class="selection-option__placeholder"
      aria-hidden="true"
    />
  </button>
</template>

<style scoped>
.selection-option {
  display: flex;
  width: 100%;
  min-height: 55px;
  align-items: center;
  justify-content: space-between;
  padding: 14px 20px;
  border: 0;
  border-bottom: 1px solid transparent;
  background: transparent;
  color: var(--gray-700);
  cursor: pointer;
  font-family: var(--font-body);
  font-size: 18px;
  font-weight: var(--weight-bold);
  letter-spacing: -0.04em;
  line-height: 1.5;
  text-align: left;
}

.selection-option img,
.selection-option__placeholder {
  width: 24px;
  height: 24px;
  flex: 0 0 auto;
}
</style>
