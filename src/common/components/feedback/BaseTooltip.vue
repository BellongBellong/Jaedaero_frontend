<script setup>
defineProps({
  text: {
    type: String,
    default: '',
  },
})
</script>

<template>
  <aside
    class="base-tooltip"
    role="note"
  >
    <div class="base-tooltip__container">
      <p class="base-tooltip__text">
        <slot>{{ text }}</slot>
      </p>
    </div>
  </aside>
</template>

<style scoped>
.base-tooltip,
.base-tooltip * {
  box-sizing: border-box;
}

.base-tooltip {
  position: relative;
  display: flex;
  width: min(100%, 313px);
  flex: 0 0 auto;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
}

.base-tooltip__container {
  position: relative;
  display: flex;
  width: 100%;
  flex: 0 0 auto;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
  padding: 12px;
  border-radius: 14px;
  background: var(--green-100, #e4fff0);
}

.base-tooltip__text {
  position: relative;
  width: 100%;
  margin: 0;
  color: var(--ui-sub-title, #757575);
  font-family: 'Pretendard-Bold', sans-serif;
  font-size: 12px;
  font-weight: 700;
  line-height: 19.2px;
  text-align: left;
  overflow-wrap: anywhere;
}
</style>
