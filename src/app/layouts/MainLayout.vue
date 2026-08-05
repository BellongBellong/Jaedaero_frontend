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
      'mobile-frame--ai-coach': ['ai-coach', 'ai-financial-report'].includes(route.name),
    }"
  >
    <AppHeader
      v-if="!route.meta.hideHeader"
      :title="route.meta.headerTitle"
      :badge="route.meta.headerBadge"
      :variant="route.meta.headerVariant || 'back'"
    />

    <main
      class="main-layout__content"
      :class="{ 'main-layout__content--without-navigation': route.meta.hideBottomNavigation }"
    >
      <RouterView />
    </main>

    <div
      v-if="!route.meta.hideBottomNavigation"
      class="main-layout__bottom"
    >
      <BottomNavigation />
    </div>
  </MobileFrame>
</template>

<style scoped>
.main-layout__content {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overscroll-behavior-y: contain;
  scrollbar-width: none;
  -webkit-overflow-scrolling: touch;
}

.main-layout__content::-webkit-scrollbar {
  display: none;
}

.main-layout__bottom {
  position: absolute;
  z-index: var(--z-navigation, 20);
  right: 0;
  bottom: 0;
  left: 0;
  height: calc(var(--bottom-navigation-area-height) + var(--safe-area-bottom));
  padding-top: 8px;
  padding-bottom: var(--safe-area-bottom);
  pointer-events: none;
  background: linear-gradient(180deg, rgb(250 250 250 / 0%), rgb(250 250 250 / 88%) 70%);
}

.main-layout__bottom > :deep(.bottom-navigation) {
  pointer-events: auto;
}

:global(.mobile-frame.mobile-frame--ai-coach) {
  background:
    radial-gradient(circle at 92% 8%, rgb(98 255 156 / 52%) 0, rgb(98 255 156 / 0%) 34%),
    var(--gray-100);
}

.main-layout__content :deep(.screen) {
  min-height: 100%;
  overflow: visible;
}

.main-layout__content :deep(.app-page) {
  min-height: 100%;
  padding: var(--space-24) max(var(--layout-page-padding), var(--safe-area-right))
    calc(var(--page-bottom-navigation-space) + var(--safe-area-bottom))
    max(var(--layout-page-padding), var(--safe-area-left));
  background: var(--ui-background);
  color: var(--ui-ext);
}

.main-layout__content--without-navigation :deep(.app-page) {
  padding-bottom: calc(var(--space-40) + var(--safe-area-bottom));
}
</style>
