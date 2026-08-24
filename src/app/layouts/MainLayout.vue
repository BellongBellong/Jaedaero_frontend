<script setup>
import { computed, nextTick, ref, watch } from 'vue'
import { RouterView, useRoute } from 'vue-router'

import AppHeader from '../../common/components/layout/AppHeader.vue'
import BottomNavigation from '../../common/components/layout/BottomNavigation.vue'
import MobileFrame from '../../common/components/layout/MobileFrame.vue'
import { useToast } from '@/common/composables/useToast'
import { useLeaveModeSchedule } from '@/features/leave-mode/composables/useLeaveModeSchedule'
import { useTransactionsStore } from '@/features/transactions/stores/transactions.store'

/* iOS의 소수점 스크롤 노이즈만 제외하고 첫 이동부터 방향을 반영한다. */
const SCROLL_DIRECTION_EPSILON = 0.5
const NAVIGATION_TOGGLE_DISTANCE = 12

const route = useRoute()
const contentElement = ref(null)
const headerElement = ref(null)
const isHeaderCollapsed = ref(false)
/* 접힌 뒤에는 헤더 높이가 0이라 측정할 수 없으므로 펼쳐져 있을 때 값을 기억해 둔다. */
let expandedHeaderHeight = 0
const isNavigationMinimized = ref(false)
const lastScrollTop = ref(0)
let lastMaxScrollTop = 0
let navigationScrollDirection = 0
let navigationScrollDistance = 0
const { mode } = useLeaveModeSchedule()
const transactionsStore = useTransactionsStore()
const toast = useToast()

const isVacationDashboard = computed(() => mode.value === 'vacation' && route.name === 'dashboard')
const keepHeaderExpanded = computed(
  () =>
    !route.meta.collapseHeaderOnScroll && (route.meta.keepHeaderOnScroll || route.meta.stickyTabs),
)
const headerTitle = computed(() => {
  if (route.name === 'transactions' && route.query.period === 'vacation') return '휴가 거래 내역'
  return String(route.meta.headerTitle || '')
})
const headerActionTo = computed(() => {
  if (!route.meta.headerActionRoute) return null
  return { name: route.meta.headerActionRoute, query: route.query }
})
const headerSecondaryActionLabel = computed(() => route.meta.headerSecondaryActionLabel || '')
const headerSecondaryActionDisabled = computed(
  () => route.name === 'transactions' && transactionsStore.syncing,
)

async function handleHeaderSecondaryAction() {
  if (route.name !== 'transactions') return

  try {
    await transactionsStore.sync(route.query)
    toast.success('최신 거래내역으로 동기화했어요.')
  } catch {
    toast.error('동기화하지 못했어요. 잠시 후 다시 시도해 주세요.')
  }
}

watch(
  () => route.fullPath,
  async () => {
    isHeaderCollapsed.value = false
    isNavigationMinimized.value = false
    lastScrollTop.value = 0
    lastMaxScrollTop = 0
    navigationScrollDirection = 0
    navigationScrollDistance = 0
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

  /*
    헤더는 내릴 때 32px, 올릴 때 12px의 여유를 둔다. iOS 관성 스크롤의 작은
    반동으로 닫힘/열림이 반복되지 않으면서도 Chrome과 같은 방향성은 유지한다.
  */
  if (keepHeaderExpanded.value || !canCollapseHeader(event.currentTarget)) {
    isHeaderCollapsed.value = false
  } else if (isHeaderCollapsed.value ? scrollTop < 12 : scrollTop > 32) {
    isHeaderCollapsed.value = !isHeaderCollapsed.value
  }

  /* 짧은 반동 스크롤에는 반응하지 않고, 일정 거리를 누적했을 때만 전환한다. */
  if (scrollTop <= SCROLL_DIRECTION_EPSILON) {
    isNavigationMinimized.value = false
    navigationScrollDirection = 0
    navigationScrollDistance = 0
  } else if (Math.abs(delta) > SCROLL_DIRECTION_EPSILON) {
    const direction = delta > 0 ? 1 : -1
    const isAtScrollEnd = scrollTop >= maxScrollTop - SCROLL_DIRECTION_EPSILON
    const wasAtScrollEnd = lastScrollTop.value >= lastMaxScrollTop - SCROLL_DIRECTION_EPSILON

    // 헤더 접힘으로 본문 높이가 바뀌면 끝 위치가 자동 보정되어 역방향 delta가
    // 생긴다. 전후 모두 끝에 머문 경우만 무시하고, 실제 위로 스크롤은 반영한다.
    if (!(direction < 0 && isAtScrollEnd && wasAtScrollEnd)) {
      if (direction !== navigationScrollDirection) {
        navigationScrollDirection = direction
        navigationScrollDistance = 0
      }

      navigationScrollDistance += Math.abs(delta)

      if (navigationScrollDistance >= NAVIGATION_TOGGLE_DISTANCE) {
        isNavigationMinimized.value = direction > 0
        navigationScrollDistance = 0
      }
    }
  }

  lastScrollTop.value = scrollTop
  lastMaxScrollTop = maxScrollTop
}
</script>

<template>
  <MobileFrame
    :class="{
      'mobile-frame--dashboard': route.name === 'dashboard',
      'mobile-frame--ai-coach': ['ai-coach', 'ai-financial-report'].includes(route.name),
      'mobile-frame--challenge': route.name === 'challenge',
      'mobile-frame--investment-guide': route.meta.investmentGuide,
      'mobile-frame--vacation': isVacationDashboard,
      'mobile-frame--upcoming-events': route.name === 'upcoming-events',
      'mobile-frame--fixed-header-tabs': route.meta.keepHeaderOnScroll || route.meta.stickyTabs,
    }"
  >
    <AppHeader
      v-if="!route.meta.hideHeader"
      ref="headerElement"
      :title="headerTitle"
      :badge="route.meta.headerBadge"
      :variant="route.meta.headerVariant || 'back'"
      :collapsed="isHeaderCollapsed"
      :back-to="route.meta.backTo"
      :action-label="route.meta.headerActionLabel"
      :action-to="headerActionTo"
      :secondary-action-label="headerSecondaryActionLabel"
      :secondary-action-disabled="headerSecondaryActionDisabled"
      @secondary-action="handleHeaderSecondaryAction"
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
  /* 헤더가 이미 레이아웃 높이를 차지하므로, 콘텐츠와의 간격만 둔다. */
  padding-top: var(--space-32);
}

.main-layout__bottom {
  position: absolute;
  z-index: var(--z-navigation, 20);
  right: 0;
  /* safe area는 바깥 오프셋이 아니라 컨테이너 내부 여백으로 처리한다. */
  bottom: 0;
  left: 0;
  height: calc(var(--bottom-navigation-area-height) + var(--safe-area-bottom));
  padding-top: 8px;
  padding-bottom: var(--safe-area-bottom);
  pointer-events: none;
  /* 콘텐츠가 글래스 바와 하단 safe area 뒤로 자연스럽게 이어진다. */
  background: transparent;
}

.main-layout__bottom::before {
  position: absolute;
  z-index: 0;
  inset: 0;
  background: linear-gradient(180deg, transparent 0%, rgb(255 255 255 / 3%) 100%);
  content: '';
  -webkit-backdrop-filter: blur(8px) saturate(112%);
  backdrop-filter: blur(8px) saturate(112%);
  -webkit-mask: linear-gradient(
    180deg,
    transparent 0%,
    rgb(0 0 0 / 20%) 24%,
    rgb(0 0 0 / 55%) 48%,
    #000 100%
  );
  mask: linear-gradient(
    180deg,
    transparent 0%,
    rgb(0 0 0 / 20%) 24%,
    rgb(0 0 0 / 55%) 48%,
    #000 100%
  );
  pointer-events: none;
}

/* iPhone 홈 화면 PWA에서는 backdrop-filter가 고정 레이어 뒤의 콘텐츠까지
   흐리게 합성될 수 있어, 하단 안전영역을 투명한 레이어로 유지한다. */
@media (display-mode: standalone) {
  .main-layout__bottom::before {
    background: transparent;
    -webkit-backdrop-filter: none;
    backdrop-filter: none;
    -webkit-mask: none;
    mask: none;
  }
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
    radial-gradient(
      ellipse 125% 68% at -8% 104%,
      color-mix(in srgb, var(--yellow-400) 58%, transparent) 0%,
      color-mix(in srgb, var(--yellow-400) 28%, transparent) 48%,
      transparent 86%
    ),
    radial-gradient(
      ellipse 125% 68% at 108% 104%,
      color-mix(in srgb, var(--green-400) 56%, transparent) 0%,
      color-mix(in srgb, var(--green-400) 26%, transparent) 48%,
      transparent 86%
    ),
    var(--ui-background);
}

.main-layout__bottom > :deep(.bottom-navigation-shell) {
  z-index: 30;
  pointer-events: auto;
}

:global(.mobile-frame.mobile-frame--upcoming-events) {
  background:
    radial-gradient(
      ellipse 112% 70% at 50% -8%,
      color-mix(in srgb, var(--brand-primary) 46%, transparent) 0%,
      transparent 74%
    ),
    var(--ui-background);
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

:global(.mobile-frame.mobile-frame--challenge .app-header) {
  padding-bottom: var(--space-10);
}

:global(.mobile-frame.mobile-frame--vacation) {
  background:
    radial-gradient(
      ellipse 200% 100% at 50% 100%,
      rgb(152 204 255 / 100%) 0%,
      rgb(152 204 255 / 68%) 36%,
      rgb(152 204 255 / 30%) 64%,
      rgb(152 204 255 / 0%) 88%
    ),
    var(--ui-background);
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
