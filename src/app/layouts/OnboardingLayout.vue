<script setup>
import { RouterView } from 'vue-router'

import HomeIndicator from '@/common/components/HomeIndicator.vue'
import MobileStatusBar from '@/common/components/MobileStatusBar.vue'
</script>

<template>
  <div class="onboarding-layout">
    <MobileStatusBar />
    <main>
      <RouterView />
    </main>
    <HomeIndicator />
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
  min-height: calc(100dvh - 53px);
}
.onboarding-layout :deep(.screen) {
  min-height: calc(100dvh - 53px);
  padding-bottom: 40px;
}
</style>
