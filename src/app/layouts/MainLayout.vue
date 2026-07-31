<script setup>
import { RouterView } from 'vue-router'

import BottomNavigation from '@/common/components/BottomNavigation.vue'
import MobileFrame from '@/common/components/MobileFrame.vue'
</script>

<template>
  <MobileFrame>
    <main class="main-layout__content">
      <RouterView />
    </main>
    <BottomNavigation />
  </MobileFrame>
</template>

<style scoped>
.main-layout__content {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
}

.main-layout__content :deep(.screen) {
  min-height: 100%;
}
</style>
