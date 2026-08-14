<script setup>
defineProps({
  modelValue: { type: String, required: true },
  items: { type: Array, default: () => [] },
  ariaLabel: { type: String, default: '탭 메뉴' },
})

defineEmits(['update:modelValue'])
</script>

<template>
  <nav
    class="common-tabs"
    role="tablist"
    :aria-label="ariaLabel"
  >
    <button
      v-for="item in items"
      :key="item.value"
      type="button"
      role="tab"
      :aria-selected="modelValue === item.value"
      :class="{ 'common-tabs__tab--active': modelValue === item.value }"
      @click="$emit('update:modelValue', item.value)"
    >
      {{ item.label }}
    </button>
  </nav>
</template>

<style scoped>
.common-tabs {
  display: flex;
  width: 100%;
  align-items: flex-start;
  gap: 0;
  overflow: hidden;
  background: transparent;
}

.common-tabs button {
  display: flex;
  min-width: 0;
  flex: 1 1 0;
  align-items: center;
  justify-content: center;
  padding: var(--space-10) 0;
  border: 0;
  border-bottom: 2px solid transparent;
  border-radius: var(--radius-md) var(--radius-md) 0 0;
  background: transparent;
  color: var(--ui-sub-title-light);
  font-family: var(--body-body-small-bold-font-family);
  font-size: var(--body-body-small-bold-font-size);
  font-weight: var(--body-body-small-bold-font-weight);
  line-height: var(--body-body-small-bold-line-height);
  white-space: nowrap;
  cursor: pointer;
}

.common-tabs .common-tabs__tab--active {
  border-bottom: 2px solid var(--Brand-DeepGreen, var(--green-700));
  background: rgb(243 255 248 / 20%);
  color: var(--Brand-DeepGreen, var(--green-700));
}
</style>
