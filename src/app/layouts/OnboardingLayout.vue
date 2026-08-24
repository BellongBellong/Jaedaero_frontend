<script setup>
import { RouterView, useRoute } from 'vue-router'

// import HomeIndicator from '@/common/components/HomeIndicator.vue'
// import MobileStatusBar from '@/common/components/MobileStatusBar.vue'
import AppHeader from '../../common/components/layout/AppHeader.vue'
import MobileFrame from '../../common/components/layout/MobileFrame.vue'

const route = useRoute()
</script>

<template>
  <div class="onboarding-layout">
    <!-- <MobileStatusBar /> -->
    <MobileFrame class="onboarding-mobile-frame">
      <AppHeader
        v-if="route.name !== 'onboarding-intro'"
        class="onboarding-app-header"
        title=""
        variant="back"
        :show-back="true"
      />
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

:deep(.onboarding-app-header) {
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
}

:deep(.onboarding-app-header .app-header__title-row) {
  display: none;
}
</style>

<style scoped>
:deep(.onboarding-mobile-frame) {
  position: relative;
  overflow: hidden;
  background: var(--ui-background);
}

:global(.onboarding-mobile-frame > main) {
  height: 100%;
  min-height: 0;
  overflow-x: hidden;
  overflow-y: auto;
  overscroll-behavior-y: contain;
  scrollbar-width: none;
  -webkit-overflow-scrolling: touch;
}

:global(.onboarding-mobile-frame .step-page) {
  background: var(--ui-background);
}

:global(.onboarding-mobile-frame > main::-webkit-scrollbar) {
  display: none;
}
</style>
