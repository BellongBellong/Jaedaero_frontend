<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import aiCoachIcon from '@/assets/icons/Navigation/aiCoachIcon.svg'
import aiCoachIconGreen from '@/assets/icons/Navigation/aiCoachIconGreen.svg'
import challengeIcon from '@/assets/icons/Navigation/challengeIcon.svg'
import challengeIconGreen from '@/assets/icons/Navigation/challengeIconGreen.svg'
import homeIcon from '@/assets/icons/Navigation/homeIcon.svg'
import homeIconGreen from '@/assets/icons/Navigation/homeIconGreen.svg'
import myIcon from '@/assets/icons/Navigation/myIcon.svg'
import myIconGreen from '@/assets/icons/Navigation/myIconGreen.svg'

const props = defineProps({
  minimized: { type: Boolean, default: false },
})

const route = useRoute()
const router = useRouter()
const draggedPosition = ref(null)
const isDragging = ref(false)
const isLensAnimating = ref(false)
const isNavigating = ref(false)
const skipNextClick = ref(false)
const NAVIGATION_WIDTH = 294
const NAVIGATION_ITEM_WIDTH = 66
const NAVIGATION_HORIZONTAL_PADDING = 15
const NAVIGATION_INDICATOR_WIDTH = 72
const NAVIGATION_INDICATOR_HEIGHT = 46

const navigationItems = [
  {
    id: 'home',
    label: '홈',
    icon: homeIcon,
    activeIcon: homeIconGreen,
    to: { name: 'dashboard' },
  },
  {
    id: 'ai-coach',
    label: 'AI 코치',
    icon: aiCoachIcon,
    activeIcon: aiCoachIconGreen,
    to: { name: 'ai-coach' },
  },
  {
    id: 'challenge',
    label: '챌린지',
    icon: challengeIcon,
    activeIcon: challengeIconGreen,
    to: { name: 'challenge' },
  },
  {
    id: 'profile',
    label: '마이페이지',
    icon: myIcon,
    activeIcon: myIconGreen,
    to: { name: 'mypage' },
  },
]

const activeTab = computed(() => route.meta.bottomNavigation)
const activeIndex = computed(() => {
  const index = navigationItems.findIndex((item) => item.id === activeTab.value)
  return index === -1 ? 0 : index
})

const indicatorPosition = computed(() => {
  if (draggedPosition.value !== null) return draggedPosition.value
  return NAVIGATION_HORIZONTAL_PADDING + activeIndex.value * NAVIGATION_ITEM_WIDTH
})

/* 라우트 이동으로 메뉴가 바뀌어도 선택 블록이 새 위치까지 애니메이션되게 한다. */
watch(activeTab, () => {
  if (!isDragging.value && !isLensAnimating.value) draggedPosition.value = null
})

const lensStyle = computed(() => ({
  position: 'absolute',
  top: '30px',
  left: `${indicatorPosition.value + NAVIGATION_ITEM_WIDTH / 2}px`,
  width: `${NAVIGATION_INDICATOR_WIDTH}px`,
  height: `${NAVIGATION_INDICATOR_HEIGHT}px`,
  zIndex: 20,
  transform: 'translate(-50%, -50%) scale(1.02)',
  pointerEvents: 'none',
}))

function getIndicatorPosition(event) {
  const navigation = event.currentTarget
  const bounds = navigation.getBoundingClientRect()
  const scale = bounds.width / NAVIGATION_WIDTH
  const pointerX = (event.clientX - bounds.left) / scale
  const position = pointerX - NAVIGATION_ITEM_WIDTH / 2
  const lastItemPosition =
    NAVIGATION_HORIZONTAL_PADDING + (navigationItems.length - 1) * NAVIGATION_ITEM_WIDTH

  return Math.max(NAVIGATION_HORIZONTAL_PADDING, Math.min(lastItemPosition, position))
}

function updateDraggedPosition(event) {
  draggedPosition.value = getIndicatorPosition(event)
}

function startDrag(event) {
  if (props.minimized) return

  event.currentTarget.setPointerCapture(event.pointerId)
  isDragging.value = true
  updateDraggedPosition(event)
}

function dragIndicator(event) {
  if (isDragging.value) updateDraggedPosition(event)
}

function endDrag(event) {
  if (!isDragging.value) return

  updateDraggedPosition(event)
  const snappedIndex = Math.max(
    0,
    Math.min(
      navigationItems.length - 1,
      Math.round((draggedPosition.value - NAVIGATION_HORIZONTAL_PADDING) / NAVIGATION_ITEM_WIDTH),
    ),
  )
  const item = navigationItems[snappedIndex]

  isDragging.value = false
  isLensAnimating.value = true
  draggedPosition.value = NAVIGATION_HORIZONTAL_PADDING + snappedIndex * NAVIGATION_ITEM_WIDTH
  skipNextClick.value = true
  isNavigating.value = true

  Promise.resolve(selectTab(item)).finally(() => {
    isNavigating.value = false
  })

  window.setTimeout(() => {
    isLensAnimating.value = false
    draggedPosition.value = null
  }, 300)
}

function cancelDrag() {
  isDragging.value = false
  draggedPosition.value = null
}

function onItemClick(item) {
  if (skipNextClick.value) {
    skipNextClick.value = false
    return
  }

  const targetIndex = navigationItems.findIndex((navigationItem) => navigationItem.id === item.id)
  if (targetIndex < 0 || targetIndex === activeIndex.value) return

  // 기존 선택 위치에서 새 탭까지 물방울 렌즈가 이동한 뒤 라우트를 전환한다.
  draggedPosition.value = NAVIGATION_HORIZONTAL_PADDING + activeIndex.value * NAVIGATION_ITEM_WIDTH
  isLensAnimating.value = true
  isNavigating.value = true

  // 첫 프레임에 시작 위치를 그린 뒤 다음 프레임에 이동해야 Safari가
  // 시작·종료 상태를 하나의 렌더링으로 합치지 않고 슬라이딩을 재생한다.
  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(() => {
      draggedPosition.value = NAVIGATION_HORIZONTAL_PADDING + targetIndex * NAVIGATION_ITEM_WIDTH
      Promise.resolve(selectTab(item)).finally(() => {
        isNavigating.value = false
      })

      window.setTimeout(() => {
        isLensAnimating.value = false
        draggedPosition.value = null
      }, 300)
    })
  })
}

function selectTab(item) {
  if (item?.to) return router.push(item.to)
  return undefined
}
</script>

<template>
  <div class="bottom-navigation-shell">
    <div
      v-if="isDragging || isLensAnimating"
      class="navigation-lens"
      :style="lensStyle"
      aria-hidden="true"
    >
      <span class="navigation-lens__surface" />
    </div>

    <nav
      class="bottom-navigation glass glass--dark"
      aria-label="주요 메뉴"
      :class="{
        'bottom-navigation--dragging': isDragging,
        'bottom-navigation--navigating': isNavigating,
        'bottom-navigation--minimized': minimized,
      }"
      @pointerdown="startDrag"
      @pointermove="dragIndicator"
      @pointerup="endDrag"
      @pointercancel="cancelDrag"
    >
      <span
        class="navigation-indicator navigation-indicator__surface"
        :class="{ 'navigation-indicator--hidden': isDragging || isLensAnimating }"
        :style="{ transform: `translate3d(${indicatorPosition - 3}px, 0, 0)` }"
        aria-hidden="true"
      />

      <button
        v-for="item in navigationItems"
        :key="item.id"
        class="navigation-item"
        type="button"
        :aria-label="item.label"
        :aria-current="activeTab === item.id ? 'page' : undefined"
        @click="onItemClick(item)"
      >
        <img
          class="navigation-item__icon"
          :src="activeTab === item.id ? item.activeIcon : item.icon"
          alt=""
          aria-hidden="true"
          draggable="false"
          @dragstart.prevent
        >
      </button>
    </nav>
  </div>
</template>

<style scoped>
.bottom-navigation-shell {
  position: fixed;
  z-index: 10;
  left: 50%;
  bottom: calc(16px + var(--safe-area-bottom));
  width: 294px;
  height: 60px;
  transform: translateX(-50%);
  transform-origin: bottom center;
}

.navigation-lens {
  position: absolute !important;
  z-index: 20 !important;
  overflow: hidden;
  border: 0 !important;
  border-radius: var(--radius-full, 999px);
  background: rgb(255 255 255 / 7%) !important;
  box-shadow:
    0 4px 8px rgb(0 0 0 / 7%),
    inset 0 3px 7px rgb(255 255 255 / 7%),
    inset 0 -5px 8px color-mix(in srgb, var(--brand-deep-green) 12%, transparent) !important;
  -webkit-backdrop-filter: blur(2px) saturate(108%);
  backdrop-filter: blur(2px) saturate(108%);
  pointer-events: none !important;
  transition: left 300ms cubic-bezier(0.22, 1, 0.36, 1);
}

/* 전체 인디케이터에 균일한 배경 blur를 적용한다. */
.navigation-lens::before {
  display: none;
}

.navigation-lens__surface {
  position: relative;
  z-index: 1;
  display: block;
  width: 72px;
  height: 46px;
  overflow: hidden;
  border-radius: var(--radius-full, 999px);
  background:
    radial-gradient(circle at 25% 12%, rgb(255 255 255 / 11%), transparent 35%),
    radial-gradient(
      circle at 78% 92%,
      color-mix(in srgb, var(--brand-deep-green) 10%, transparent),
      transparent 58%
    ),
    linear-gradient(145deg, rgb(255 255 255 / 10%), transparent 55%);
  box-shadow:
    inset 0 2px 6px color-mix(in srgb, var(--brand-deep-green) 18%, transparent),
    inset 0 -6px 12px color-mix(in srgb, var(--brand-deep-green) 26%, transparent);
  pointer-events: none;
}

.navigation-lens__surface::after {
  position: absolute;
  z-index: 2;
  inset: 0;
  border-radius: inherit;
  background: linear-gradient(
    112deg,
    transparent 25%,
    rgb(255 255 255 / 14%) 44%,
    rgb(255 255 255 / 4%) 52%,
    transparent 72%
  );
  content: '';
  pointer-events: none;
  transform: translateX(-115%);
  animation: navigation-reflection-sweep 2.4s ease-in-out infinite;
}

@keyframes navigation-reflection-sweep {
  0%,
  35% {
    transform: translateX(-115%);
  }

  70%,
  100% {
    transform: translateX(115%);
  }
}

.bottom-navigation {
  box-sizing: border-box;
  position: relative !important;
  z-index: 4;
  left: auto !important;
  bottom: auto !important;
  display: flex;
  width: 294px;
  height: 60px;
  align-items: center;
  justify-content: center;
  padding: 3px 15px;
  overflow: hidden;
  isolation: isolate;
  border: 1px solid rgb(255 255 255 / 24%);
  border-radius: var(--radius-full, 999px);
  background:
    linear-gradient(135deg, rgb(255 255 255 / 17%), rgb(255 255 255 / 5%) 55%), rgb(27 34 31 / 13%);
  box-shadow:
    0 8px 24px rgb(0 0 0 / 10%),
    inset 0 1px 0 rgb(255 255 255 / 38%),
    inset 0 -1px 0 rgb(0 0 0 / 12%),
    inset 8px 10px 24px rgb(255 255 255 / 4%);
  -webkit-backdrop-filter: blur(18px) saturate(110%);
  backdrop-filter: blur(18px) saturate(110%);
  touch-action: none;
  transform: none !important;
  transform-origin: bottom center;
  transition: transform 520ms cubic-bezier(0.22, 1, 0.36, 1);
  -webkit-user-select: none;
  user-select: none;
}

.bottom-navigation.glass--dark {
  background:
    linear-gradient(135deg, rgb(255 255 255 / 17%), rgb(255 255 255 / 5%) 55%), rgb(27 34 31 / 13%) !important;
}

/* iPhone PWA에서 유리 효과가 화면 하단을 과도하게 흐리지 않게 한다. */
@media (display-mode: standalone) {
  .navigation-lens {
    background: rgb(255 255 255 / 12%) !important;
    -webkit-backdrop-filter: none;
    backdrop-filter: none;
  }
}

.bottom-navigation::before {
  position: absolute;
  z-index: 0;
  top: 1px;
  right: 12px;
  left: 12px;
  height: 48%;
  border-radius: 999px 999px 55% 55%;
  background: linear-gradient(180deg, rgb(255 255 255 / 13%), transparent);
  content: '';
  pointer-events: none;
}

.bottom-navigation::after {
  position: absolute;
  z-index: 0;
  inset: 1px;
  border: 1px solid rgb(255 255 255 / 8%);
  border-radius: inherit;
  box-shadow: inset 0 -8px 18px rgb(0 0 0 / 4%);
  content: '';
  pointer-events: none;
}

.bottom-navigation--minimized {
  transform: scale(var(--bottom-navigation-minimized-scale, 0.9)) !important;
}

.navigation-indicator {
  position: absolute;
  top: 7px;
  left: 0;
  z-index: 0;
  width: 72px;
  height: 46px;
  overflow: hidden;
  border-radius: var(--radius-full, 999px);
  pointer-events: none;
  transition:
    transform 560ms cubic-bezier(0.22, 1, 0.36, 1),
    filter 180ms ease;
  will-change: transform;
}

.navigation-indicator--hidden {
  opacity: 0;
}

.navigation-indicator__surface {
  box-sizing: border-box;
  display: block;
  width: 72px;
  height: 46px;
  border: 0;
  border-radius: inherit;
  background:
    linear-gradient(145deg, rgb(255 255 255 / 13%), rgb(255 255 255 / 4%)), rgb(125 228 163 / 8%);
  box-shadow:
    inset 0 2px 6px color-mix(in srgb, var(--brand-deep-green) 18%, transparent),
    inset 0 -6px 12px color-mix(in srgb, var(--brand-deep-green) 26%, transparent);
}

.bottom-navigation--dragging .navigation-indicator::before {
  position: absolute;
  inset: -45% -22%;
  background: linear-gradient(
    108deg,
    transparent 34%,
    rgb(255 255 255 / 35%) 47%,
    rgb(117 255 205 / 14%) 53%,
    transparent 65%
  );
  content: '';
  transform: translateX(-34%) rotate(4deg);
  transition: transform 420ms cubic-bezier(0.22, 1, 0.36, 1);
  pointer-events: none;
}

.bottom-navigation--dragging .navigation-indicator::after {
  position: absolute;
  inset: 3px;
  border: 1px solid rgb(255 255 255 / 14%);
  border-radius: inherit;
  box-shadow: inset 0 8px 10px rgb(255 255 255 / 7%);
  content: '';
  pointer-events: none;
}

.bottom-navigation--dragging .navigation-indicator {
  z-index: 2;
  /* 현재 DOM에서는 부모의 다크 배경까지 샘플링하지 않도록 필터를 끈다. */
  background: transparent !important;
  -webkit-backdrop-filter: none;
  backdrop-filter: none;
  filter: none;
  transition-duration: 60ms;
}

/* 평소에는 일반 구슬, 누르고 있을 때만 뒤 배경을 반사하는 렌즈 */
.bottom-navigation--dragging .navigation-indicator__surface {
  background: transparent !important;
}

.bottom-navigation--dragging .navigation-indicator::before {
  display: none;
}

.bottom-navigation--dragging .navigation-indicator__surface::before {
  display: none;
}

.bottom-navigation--navigating .navigation-indicator {
  z-index: 2;
}

.navigation-item {
  position: relative;
  z-index: 7;
  display: flex;
  flex: 0 0 66px;
  width: 66px;
  height: 54px;
  align-items: center;
  justify-content: center;
  padding: 0;
  overflow: hidden;
  border: 0;
  border-radius: var(--radius-full, 999px);
  background: transparent;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  transition: transform 180ms ease;
}

.navigation-item:active {
  transform: none;
}

.navigation-item:focus-visible {
  outline: 2px solid var(--green-300, #a6ffc7);
  outline-offset: -3px;
}

.navigation-item__icon {
  display: block;
  width: 36px;
  height: 36px;
  object-fit: contain;
  pointer-events: none;
  user-select: none;
  -webkit-user-drag: none;
  -webkit-user-select: none;
  opacity: 1;
  filter: none;
  transition:
    opacity var(--duration-normal, 200ms) var(--ease-default, ease),
    transform 260ms cubic-bezier(0.34, 1.56, 0.64, 1);
}

.navigation-item[aria-current='page'] .navigation-item__icon {
  opacity: 1;
  transform: scale(1.06);
}

@media (prefers-reduced-motion: reduce) {
  .bottom-navigation,
  .navigation-indicator,
  .navigation-item,
  .navigation-item__icon {
    transition: none;
  }
}
</style>
