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
const headerElement = ref(null)
const isHeaderCollapsed = ref(false)
const isChromeHidden = ref(false)
/* 접힌 뒤에는 헤더 높이가 0이라 측정할 수 없으므로 펼쳐져 있을 때 값을 기억해 둔다. */
let expandedHeaderHeight = 0
const isNavigationMinimized = ref(false)
const lastScrollTop = ref(0)
const { mode } = useLeaveModeSchedule()

const isVacationDashboard = computed(() => mode.value === 'vacation' && route.name === 'dashboard')
const isSynchronizedChrome = computed(() => Boolean(route.meta.synchronizedChrome))
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
    isChromeHidden.value = false
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

function readExpandedHeaderHeight() {
  const element = headerElement.value?.$el

  if (element && !isHeaderCollapsed.value) {
    const height = element.offsetHeight
    if (height > 0) expandedHeaderHeight = height
  }

  return expandedHeaderHeight
}

/*
  헤더를 접으면 본문 영역이 헤더 높이만큼 커져 최대 스크롤량이 그만큼 줄어든다.
  스크롤 여유가 헤더 높이에 가까운 화면에서는 접히는 순간 scrollTop이 열림
  임계값 아래로 잘려 다시 펼쳐지고, 이 과정이 반복되며 헤더가 떨린다.
  접은 뒤에도 열림 임계값을 넘는 여유가 남는 경우에만 접도록 막는다.
*/
function canCollapseHeader(element) {
  const currentMaxScroll = element.scrollHeight - element.clientHeight
  const maxScrollAfterCollapse = isHeaderCollapsed.value
    ? currentMaxScroll
    : currentMaxScroll - readExpandedHeaderHeight()

  return maxScrollAfterCollapse > 12
}

function handleContentScroll(event) {
  const maxScrollTop = Math.max(
    0,
    event.currentTarget.scrollHeight - event.currentTarget.clientHeight,
  )
  const scrollTop = Math.max(0, Math.min(event.currentTarget.scrollTop, maxScrollTop))
  const delta = scrollTop - lastScrollTop.value

  if (isSynchronizedChrome.value) {
    isHeaderCollapsed.value = false

    if (scrollTop <= SCROLL_DIRECTION_EPSILON) {
      isChromeHidden.value = false
      isNavigationMinimized.value = false
    } else if (delta > SCROLL_DIRECTION_EPSILON) {
      isChromeHidden.value = true
      isNavigationMinimized.value = true
    } else if (delta < -SCROLL_DIRECTION_EPSILON) {
      isChromeHidden.value = false
      isNavigationMinimized.value = false
    }

    lastScrollTop.value = scrollTop
    return
  }

  /*
    헤더는 내릴 때 32px, 올릴 때 12px의 여유를 둔다. iOS 관성 스크롤의 작은
    반동으로 닫힘/열림이 반복되지 않으면서도 Chrome과 같은 방향성은 유지한다.
  */
  if (
    route.meta.keepHeaderOnScroll ||
    route.meta.stickyTabs ||
    !canCollapseHeader(event.currentTarget)
  ) {
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
      'mobile-frame--fixed-header-tabs': route.meta.keepHeaderOnScroll || route.meta.stickyTabs,
      'mobile-frame--synchronized-chrome': isSynchronizedChrome,
    }"
  >
    <AppHeader
      v-if="!route.meta.hideHeader"
      ref="headerElement"
      :title="headerTitle"
      :badge="route.meta.headerBadge"
      :variant="route.meta.headerVariant || 'back'"
      :collapsed="isHeaderCollapsed"
      :hidden="isSynchronizedChrome && isChromeHidden"
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
      :class="{
        'main-layout__bottom--vacation': isVacationDashboard,
      }"
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
  /* 홈 인디케이터는 피하되, safe area를 컨테이너 높이에 중복 가산하지 않는다. */
  bottom: max(5px, calc(var(--safe-area-bottom) - 7px));
  left: 0;
  height: var(--bottom-navigation-area-height);
  padding-top: 8px;
  padding-bottom: 4px;
  pointer-events: none;
  /* 콘텐츠가 글래스 바와 하단 safe area 뒤로 자연스럽게 이어진다. */
  background: transparent;
  transition:
    transform var(--chrome-motion-duration, 280ms)
      var(--chrome-motion-ease, cubic-bezier(0.22, 1, 0.36, 1)),
    opacity 180ms ease;
  will-change: transform, opacity;
}

/*
  AI 분석 로딩 단계는 배경이 화면 전체를 덮어야 한다.
  안쪽 요소 높이를 dvh 로 맞추면 기기별 safe area 계산 차이로 바닥에 흰 여백이
  남으므로, 프레임이 직접 칠해 레이아웃 계산과 무관하게 항상 꽉 차게 한다.
*/
:global(.mobile-frame:has(.analyzing)) {
  background:
    radial-gradient(
      ellipse 500px 640px at -5% 91%,
      var(--yellow-400) 0%,
      rgb(255 236 189 / 0%) 100%
    ),
    radial-gradient(circle 576px at 100% 14.5%, var(--green-500) 0%, rgb(98 255 156 / 0%) 100%),
    #f6f6f6;
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

/*
  AI 코치는 하나의 스크롤 방향 신호로 헤더의 출입과 하단 바의 축소를 맞춘다.
  헤더를 문서 흐름에서 분리하고 동일한 높이를 콘텐츠에 항상 예약해 두므로,
  다시 나타날 때 본문을 아래로 밀지 않는다.
*/
:global(.mobile-frame.mobile-frame--synchronized-chrome) {
  --chrome-motion-duration: 280ms;
  --chrome-motion-ease: cubic-bezier(0.22, 1, 0.36, 1);
}

:global(.mobile-frame.mobile-frame--synchronized-chrome .app-header) {
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  flex: none;
  background: linear-gradient(
    180deg,
    rgb(246 246 246 / 42%) 0%,
    rgb(246 246 246 / 16%) 72%,
    rgb(246 246 246 / 0%) 100%
  );
  backdrop-filter: blur(4px) saturate(112%);
  -webkit-backdrop-filter: blur(4px) saturate(112%);
}

.mobile-frame--synchronized-chrome .main-layout__content {
  padding-top: calc(var(--app-header-height) + var(--safe-area-top));
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

@media (prefers-reduced-motion: reduce) {
  .main-layout__bottom {
    transition: none;
  }
}
</style>
