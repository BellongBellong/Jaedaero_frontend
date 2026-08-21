<script setup>
import { RouterView } from 'vue-router'

// import HomeIndicator from '@/common/components/HomeIndicator.vue'
// import MobileStatusBar from '@/common/components/MobileStatusBar.vue'
import MobileFrame from '../../common/components/layout/MobileFrame.vue'
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
  scrollbar-width: none;
  -webkit-overflow-scrolling: touch;
  background:
    radial-gradient(circle at 92% 8%, rgb(98 255 156 / 52%) 0, rgb(98 255 156 / 0%) 34%),
    var(--gray-100);
}

:global(.onboarding-mobile-frame .step-page) {
  background: transparent;
}

:global(.onboarding-mobile-frame::-webkit-scrollbar) {
  display: none;
}
</style>
