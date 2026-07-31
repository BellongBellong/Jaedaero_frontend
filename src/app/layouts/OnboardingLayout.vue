<script setup>
import { RouterView } from 'vue-router'

// import HomeIndicator from '@/common/components/HomeIndicator.vue'
// import MobileStatusBar from '@/common/components/MobileStatusBar.vue'
import MobileFrame from '@/common/components/MobileFrame.vue'
</script>

<template>
  <div class="onboarding-layout">
    <!-- <MobileStatusBar /> -->
    <MobileFrame>
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
