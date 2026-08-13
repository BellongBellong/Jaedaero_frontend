<script setup>
import { computed, nextTick, ref, watch } from 'vue'
import { RouterView, useRoute } from 'vue-router'

import AppHeader from '@/common/components/AppHeader.vue'
import BottomNavigation from '@/common/components/BottomNavigation.vue'
import MobileFrame from '@/common/components/MobileFrame.vue'
import { useLeaveModeSchedule } from '@/features/leave-mode/composables/useLeaveModeSchedule'

/* 방향 전환으로 인정할 최소 이동량 — 손가락 떨림으로 네비가 깜빡이지 않게 한다 */
const DIRECTION_THRESHOLD = 6
/* 이 지점을 지나야 네비가 줄어들기 시작한다 */
const MINIMIZE_AFTER = 72

const route = useRoute()
const contentElement = ref(null)
const isHeaderCollapsed = ref(false)
const isNavigationMinimized = ref(false)
const lastScrollTop = ref(0)
const { mode } = useLeaveModeSchedule()

const isVacationDashboard = computed(() => mode.value === 'vacation' && route.name === 'dashboard')

watch(
  () => route.fullPath,
  async () => {
    isHeaderCollapsed.value = false
    isNavigationMinimized.value = false
    lastScrollTop.value = 0
    await nextTick()
    contentElement.value?.scrollTo({
      left: 0,
      top: 0,
      behavior: 'auto',
    })
  },
)

function handleContentScroll(event) {
  const scrollTop = event.currentTarget.scrollTop
  const delta = scrollTop - lastScrollTop.value

  isHeaderCollapsed.value = route.meta.keepHeaderOnScroll ? false : scrollTop > 24

  /* 내리면 네비가 물러나고 올리면 돌아온다. 최상단에서는 항상 펼쳐둔다. */
  if (scrollTop <= MINIMIZE_AFTER) {
    isNavigationMinimized.value = false
  } else if (Math.abs(delta) >= DIRECTION_THRESHOLD) {
    isNavigationMinimized.value = delta > 0
  }

  lastScrollTop.value = scrollTop
}
</script>

<template>
  <MobileFrame
    :class="{
      'mobile-frame--ai-coach': ['ai-coach', 'ai-financial-report'].includes(route.name),
      'mobile-frame--investment-guide': route.meta.investmentGuide,
      'mobile-frame--vacation': isVacationDashboard,
      'mobile-frame--fixed-header-tabs': route.meta.keepHeaderOnScroll,
    }"
  >
    <AppHeader
      v-if="!route.meta.hideHeader"
      :title="route.meta.headerTitle"
      :badge="route.meta.headerBadge"
      :variant="route.meta.headerVariant || 'back'"
      :collapsed="isHeaderCollapsed"
      :hide-back-when-collapsed="route.meta.hideBackOnScroll"
    />

    <main
      ref="contentElement"
      class="main-layout__content"
      :class="{
        'main-layout__content--without-navigation': route.meta.hideBottomNavigation,
        'main-layout__content--vacation': isVacationDashboard,
        'main-layout__content--sticky-tabs': route.meta.stickyTabs,
      }"
      @scroll.passive="handleContentScroll"
    >
      <RouterView />
    </main>

    <div
      v-if="!route.meta.hideBottomNavigation"
      class="main-layout__bottom"
      :class="{ 'main-layout__bottom--vacation': isVacationDashboard }"
    >
      <BottomNavigation :minimized="isNavigationMinimized" />
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

:global(.mobile-frame.mobile-frame--investment-guide) {
  background: var(--ui-background);
}

:global(.mobile-frame.mobile-frame--investment-guide .app-header) {
  background: var(--ui-background);
}

:global(.mobile-frame.mobile-frame--investment-guide .app-header h1) {
  font-size: 18px;
}

:global(.mobile-frame.mobile-frame--fixed-header-tabs .app-header) {
  background: var(--ui-background);
}

:global(.mobile-frame.mobile-frame--vacation) {
  background:
    radial-gradient(
      ellipse 125% 68% at 50% 100%,
      rgb(152 204 255 / 100%) 0%,
      rgb(152 204 255 / 58%) 34%,
      rgb(152 204 255 / 20%) 58%,
      rgb(152 204 255 / 0%) 76%
    ),
    #f6f6f6;
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

.main-layout__content--vacation :deep(.app-page) {
  background: transparent;
}

.main-layout__content--sticky-tabs :deep([role='tablist']) {
  position: sticky;
  z-index: calc(var(--z-header) - 1);
  top: 0;
  background: var(--ui-background);
}

.main-layout__bottom--vacation {
  background: linear-gradient(180deg, rgb(152 204 255 / 0%), rgb(152 204 255 / 30%) 70%);
}
</style>
