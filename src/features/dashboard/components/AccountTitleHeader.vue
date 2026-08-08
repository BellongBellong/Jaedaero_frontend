<script setup>
defineProps({
  label: {
    type: String,
    required: true,
  },
  value: {
    type: String,
    required: true,
  },
})
</script>

<template>
  <header class="account-title-header">
    <span>{{ label }}</span>
    <strong>{{ value }}</strong>
  </header>
</template>

<style scoped>
.account-title-header {
  display: flex;
  width: 100%;
  align-items: flex-start;
  justify-content: flex-start;
  flex-direction: column;
  gap: 2px;
}

.account-title-header span {
  align-self: stretch;
  color: var(--gray-600);
  font-size: 16px;
  font-weight: var(--weight-regular);
  letter-spacing: -0.04em;
  line-height: 1.5;
}

.account-title-header strong {
  align-self: stretch;
  color: var(--gray-900);
  font-size: 24px;
  font-weight: var(--weight-bold);
  line-height: 1.5;
}
</style>
