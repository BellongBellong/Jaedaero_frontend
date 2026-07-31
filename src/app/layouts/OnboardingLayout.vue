<script setup>
import { RouterView } from 'vue-router'
</script>

<template>
  <div class="onboarding-layout">
    <main>
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
.onboarding-layout {
  position: relative;
  width: min(100%, 393px);
  min-height: 100dvh;
  margin: 0 auto;
  overflow: hidden;
  background: #f6f6f6;
}
.onboarding-layout > main {
  min-height: 100dvh;
}
.onboarding-layout :deep(.screen) {
  min-height: 100dvh;
}
</style>
