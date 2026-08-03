<script setup>
import { RouterView, useRoute } from 'vue-router'

import AppHeader from '@/common/components/AppHeader.vue'
import BottomNavigation from '@/common/components/BottomNavigation.vue'
import MobileFrame from '@/common/components/MobileFrame.vue'

const route = useRoute()
</script>

<template>
  <MobileFrame
    :class="{
      'mobile-frame--ai-coach': route.name === 'ai-coach',
    }"
  >
    <AppHeader
      v-if="!route.meta.hideHeader"
      :title="route.meta.headerTitle"
      :variant="route.meta.headerVariant || 'back'"
    />
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

:global(.mobile-frame.mobile-frame--ai-coach) {
  background:
    radial-gradient(circle at 92% 8%, rgb(98 255 156 / 52%) 0, rgb(98 255 156 / 0%) 34%),
    var(--gray-100);
}

.main-layout__content :deep(.screen) {
  min-height: 100%;
}

.main-layout__content :deep(.app-page) {
  min-height: 100%;
  padding: var(--space-24) var(--layout-page-padding) var(--space-40);
  background: var(--ui-background);
  color: var(--ui-ext);
}
</style>
