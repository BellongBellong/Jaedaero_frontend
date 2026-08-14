<script setup>
import { computed, nextTick, ref, watch } from 'vue'
import { RouterView, useRoute } from 'vue-router'

import AppHeader from '@/common/components/AppHeader.vue'
import BottomNavigation from '@/common/components/BottomNavigation.vue'
import MobileFrame from '@/common/components/MobileFrame.vue'
import { useLeaveModeSchedule } from '@/features/leave-mode/composables/useLeaveModeSchedule'

/* iOS의 소수점 스크롤 노이즈만 제외하고 첫 이동부터 방향을 반영한다. */
const SCROLL_DIRECTION_EPSILON = 0.5

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

  /*
    헤더는 내릴 때 32px, 올릴 때 12px의 여유를 둔다. iOS 관성 스크롤의 작은
    반동으로 닫힘/열림이 반복되지 않으면서도 Chrome과 같은 방향성은 유지한다.
  */
  if (route.meta.keepHeaderOnScroll) {
    isHeaderCollapsed.value = false
  } else if (isHeaderCollapsed.value ? scrollTop < 12 : scrollTop > 32) {
    isHeaderCollapsed.value = !isHeaderCollapsed.value
  }

  /* 첫 하향 스크롤에서 바로 물러나고, 상향 스크롤에서 바로 복원한다. */
  if (scrollTop <= SCROLL_DIRECTION_EPSILON) {
    isNavigationMinimized.value = false
  } else if (delta > SCROLL_DIRECTION_EPSILON) {
    isNavigationMinimized.value = true
  } else if (delta < -SCROLL_DIRECTION_EPSILON) {
    isNavigationMinimized.value = false
  }

  lastScrollTop.value = scrollTop
}
</script>

<template>
  <MobileFrame
    :class="{
      'mobile-frame--dashboard': route.name === 'dashboard',
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
  /* AI 코치 카드의 바깥 글로우가 iOS에서 가로 스크롤 영역으로 계산되지 않게 한다. */
  overflow-x: hidden;
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
  /* 홈 인디케이터는 피하되, safe area를 컨테이너 높이에 중복 가산하지 않는다. */
  bottom: max(5px, calc(var(--safe-area-bottom) - 7px));
  left: 0;
  height: var(--bottom-navigation-area-height);
  padding-top: 8px;
  padding-bottom: 4px;
  pointer-events: none;
  /* 콘텐츠가 글래스 바와 하단 safe area 뒤로 자연스럽게 이어진다. */
  background: transparent;
}

/* 투명 iOS 상태바 뒤에서도 대시보드의 브랜드 배경이 끊기지 않게 이어 준다. */
:global(.mobile-frame.mobile-frame--dashboard) {
  background:
    radial-gradient(circle at 88% 0%, rgb(98 255 156 / 24%), transparent 34%),
    radial-gradient(circle at 8% 0%, rgb(255 229 114 / 14%), transparent 30%), var(--ui-background);
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
  background: rgb(243 255 248 / 20%);
  backdrop-filter: blur(18px);
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
  background: transparent;
}
</style>
