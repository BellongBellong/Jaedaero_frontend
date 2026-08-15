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
/* 반대 방향으로 이 거리만큼 의도적으로 스크롤해야 다시 펼친다. */
const DIRECTION_CONFIRMATION_DISTANCE = 28

const route = useRoute()
const contentElement = ref(null)
const isHeaderCollapsed = ref(false)
const isNavigationMinimized = ref(false)
const lastScrollTop = ref(0)
const scrollDirection = ref(null)
const scrollDistanceInDirection = ref(0)
const { mode } = useLeaveModeSchedule()

const isVacationDashboard = computed(() => mode.value === 'vacation' && route.name === 'dashboard')
const headerTitle = computed(() => {
  if (route.name === 'transactions' && route.query.period === 'vacation') return '휴가 거래 내역'
  if (route.name === 'account-transactions' && route.query.headerTitle) {
    return String(route.query.headerTitle)
  }
  return String(route.meta.headerTitle || '')
})

watch(
  () => route.fullPath,
  async () => {
    isHeaderCollapsed.value = false
    isNavigationMinimized.value = false
    lastScrollTop.value = 0
    scrollDirection.value = null
    scrollDistanceInDirection.value = 0
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
  if (route.meta.keepHeaderOnScroll || route.meta.stickyTabs) {
    isHeaderCollapsed.value = false
  } else if (isHeaderCollapsed.value ? scrollTop < 12 : scrollTop > 32) {
    isHeaderCollapsed.value = !isHeaderCollapsed.value
  }

  /*
    네비게이션도 첫 반대 방향 이벤트에 즉시 튀지 않게 한다. iOS는 감속 중
    delta의 부호가 짧게 바뀌는 경우가 있어서, 28px의 실제 방향 전환을 확인한 뒤
    움직인다.
  */
  if (scrollTop <= MINIMIZE_AFTER) {
    isNavigationMinimized.value = false
    scrollDirection.value = null
    scrollDistanceInDirection.value = 0
  } else if (Math.abs(delta) >= DIRECTION_THRESHOLD) {
    const nextDirection = delta > 0 ? 'down' : 'up'

    if (nextDirection === scrollDirection.value) {
      scrollDistanceInDirection.value += Math.abs(delta)
    } else {
      scrollDirection.value = nextDirection
      scrollDistanceInDirection.value = Math.abs(delta)
    }

    if (scrollDistanceInDirection.value >= DIRECTION_CONFIRMATION_DISTANCE) {
      isNavigationMinimized.value = nextDirection === 'down'
    }
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
      'mobile-frame--fixed-header-tabs': route.meta.keepHeaderOnScroll || route.meta.stickyTabs,
    }"
  >
    <AppHeader
      v-if="!route.meta.hideHeader"
      :title="headerTitle"
      :badge="route.meta.headerBadge"
      :variant="route.meta.headerVariant || 'back'"
      :collapsed="isHeaderCollapsed"
    />

    <main
      ref="contentElement"
      class="main-layout__content"
      :class="{
        'main-layout__content--home': route.name === 'dashboard',
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

.main-layout__content--home {
  padding-top: calc(var(--app-header-height) + var(--safe-area-top));
}

.main-layout__bottom {
  position: absolute;
  z-index: var(--z-navigation, 20);
  right: 0;
  bottom: 0;
  left: 0;
  /*
    PWA는 이미 홈 인디케이터 영역까지 앱 캔버스가 이어진다. safe area를 다시
    더하면 바가 그 높이만큼 위로 떠 버리므로, 바는 화면 하단을 기준으로 둔다.
  */
  height: var(--bottom-navigation-area-height);
  padding-top: 8px;
  padding-bottom: 4px;
  pointer-events: none;
  /* 콘텐츠가 글래스 바와 하단 safe area 뒤로 자연스럽게 이어진다. */
  background: transparent;
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

:global(.mobile-frame.mobile-frame--investment-guide .app-header h1) {
  font-size: 18px;
}

:global(.mobile-frame.mobile-frame--fixed-header-tabs .app-header) {
  padding-bottom: 0;
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
  margin-top: 0;
  overflow: visible;
  background: var(--ui-background);
}

.main-layout__content--sticky-tabs :deep([role='tablist']::before) {
  position: absolute;
  z-index: -1;
  top: -1px;
  right: calc(50% - 50vw);
  bottom: -12px;
  left: calc(50% - 50vw);
  background: var(--ui-background);
  content: '';
}

.main-layout__bottom--vacation {
  background: transparent;
}
</style>
