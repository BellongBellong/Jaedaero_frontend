<script setup>
import { RouterView } from 'vue-router'

// import HomeIndicator from '@/common/components/HomeIndicator.vue'
// import MobileStatusBar from '@/common/components/MobileStatusBar.vue'
import MobileFrame from '@/common/components/MobileFrame.vue'
</script>

<template>
  <div class="onboarding-layout">
    <!-- <MobileStatusBar /> -->
    <MobileFrame class="onboarding-mobile-frame">
      <main>
        <RouterView />
      </main>
    </MobileFrame>
    <!-- <HomeIndicator /> -->
  </div>
</template>

<style scoped>
main {
  flex: 1;
}
</style>

<style scoped>
:deep(.onboarding-mobile-frame) {
  overflow-x: hidden;
  overflow-y: auto;
  overscroll-behavior-y: contain;
  -webkit-overflow-scrolling: touch;
}
</style>
