<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import aiCoachIcon from '@/assets/icons/aiCoachIcon.svg'
import challengeIcon from '@/assets/icons/challengeIcon.svg'
import homeIcon from '@/assets/icons/homeIcon.svg'
import myIcon from '@/assets/icons/myIcon.svg'

const props = defineProps({
  minimized: { type: Boolean, default: false },
})

const route = useRoute()
const router = useRouter()
const draggedPosition = ref(null)
const isDragging = ref(false)
const isNavigating = ref(false)
const skipNextClick = ref(false)

const navigationItems = [
  { id: 'home', label: '홈', icon: homeIcon, to: { name: 'dashboard' } },
  { id: 'ai-coach', label: 'AI 코치', icon: aiCoachIcon, to: { name: 'ai-coach' } },
  { id: 'challenge', label: '챌린지', icon: challengeIcon, to: { name: 'challenge' } },
  { id: 'profile', label: '마이페이지', icon: myIcon, to: { name: 'mypage' } },
]

const activeTab = computed(() => route.meta.bottomNavigation)
const activeIndex = computed(() => {
  const index = navigationItems.findIndex((item) => item.id === activeTab.value)

  return index === -1 ? 0 : index
})
const indicatorPosition = computed(() => {
  if (draggedPosition.value !== null) return draggedPosition.value

  return 15 + activeIndex.value * 60
})

function getIndicatorPosition(event) {
  const navigation = event.currentTarget
  const bounds = navigation.getBoundingClientRect()
  const position = event.clientX - bounds.left - 30
  const minimumPosition = 15
  const maximumPosition = bounds.width - 75

  return Math.max(minimumPosition, Math.min(maximumPosition, position))
}

function updateDraggedPosition(event) {
  draggedPosition.value = getIndicatorPosition(event)
}

function startDrag(event) {
  /* 물러난 상태에서는 탭만 받는다 — 좁아진 바에서 드래그는 오조작이 된다 */
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
  const snappedIndex = Math.round((draggedPosition.value - 15) / 60)
  const item = navigationItems[snappedIndex]

  isDragging.value = false
  draggedPosition.value = 15 + snappedIndex * 60
  skipNextClick.value = true
  isNavigating.value = true

  Promise.resolve(selectTab(item)).finally(() => {
    isNavigating.value = false
  })

  window.setTimeout(() => {
    draggedPosition.value = null
  }, 220)
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

  selectTab(item)
}

function selectTab(item) {
  if (item.to) return router.push(item.to)

  return undefined
}
</script>

<template>
  <nav
    class="bottom-navigation glass glass--dark"
    aria-label="주요 메뉴"
    :class="{
      'bottom-navigation--dragging': isDragging,
      'bottom-navigation--glass-overlay': isDragging || isNavigating,
      'bottom-navigation--minimized': minimized,
    }"
    @pointerdown="startDrag"
    @pointermove="dragIndicator"
    @pointerup="endDrag"
    @pointercancel="cancelDrag"
  >
    <span
      class="navigation-indicator"
      :style="{ transform: `translateX(${indicatorPosition}px)` }"
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
        :src="item.icon"
        alt=""
        aria-hidden="true"
      >
    </button>
  </nav>
</template>

<style scoped>
/*
  글래스 재료는 .glass / .glass--dark 유틸이 담당한다 (utilities.css).
  여기서는 형태와 배치만 다룬다 — 재료 속성을 다시 선언하면
  스코프 선택자가 유틸을 덮어써서 토큰 단일 소스가 깨진다.

  아이콘 자산이 fill="white" 하드코딩이라 dark appearance를 쓴다.
*/
.bottom-navigation {
  position: relative;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 270px;
  height: var(--bottom-navigation-height);
  padding: 8px 15px;
  margin: 0 auto;
  overflow: hidden;
  border-radius: var(--radius-full);
  touch-action: none;
  transform-origin: bottom center;
  /* Instagram식 liquid glass처럼 상태는 즉시 받되 크기는 느긋하게 따라온다. */
  transition: transform 520ms cubic-bezier(0.22, 1, 0.36, 1);
  will-change: transform;
  -webkit-backface-visibility: hidden;
  backface-visibility: hidden;
}

/*
  Apple의 tab bar minimize — 스크롤을 내리면 바가 물러나 콘텐츠를 앞세운다.

  개별 치수 대신 transform으로 줄인다. 상하좌우가 정확히 같은 비율로
  줄고, 인디케이터 위치 계산(15 + index * 60)이 손상되지 않는다.
  줄어든 동안에는 드래그를 막으므로 스케일된 좌표계를 다룰 일이 없다.
*/
.bottom-navigation--minimized {
  transform: scale(var(--bottom-navigation-minimized-scale));
}

/*
  concentric — 컨테이너가 캡슐이므로 인디케이터도 캡슐로 맞춘다.

  backdrop-filter를 걸지 않는다. 부모가 이미 필터링된 상태라
  중첩 backdrop-filter는 iOS Safari에서 배경 샘플링이 깨진다.
  대신 그라데이션 + inset 스페큘러로 렌즈감을 만든다.
*/
.navigation-indicator {
  position: absolute;
  top: 8px;
  left: 0;
  width: 60px;
  height: 50px;
  border-radius: var(--radius-full);
  background: radial-gradient(closest-side, rgb(255 255 255 / 40%) 0%, rgb(59 225 120 / 40%) 100%);
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / 42%),
    inset 1px 0 0 rgb(255 255 255 / 32%),
    inset 0 -1px 1px rgb(0 0 0 / 13%),
    inset -1px 0 1px rgb(0 0 0 / 11%);
  pointer-events: none;
  z-index: 0;
  transition: transform 220ms var(--ease-default);
}

.bottom-navigation--dragging .navigation-indicator {
  transition-duration: 70ms;
}

.bottom-navigation--glass-overlay .navigation-indicator {
  z-index: 2;
}

.navigation-item {
  display: flex;
  flex: 0 0 60px;
  width: 60px;
  height: 50px;
  align-items: center;
  justify-content: center;
  padding: 0;
  overflow: hidden;
  border: 0;
  border-radius: var(--radius-full);
  background: transparent;
  cursor: pointer;
  transition: transform 180ms ease;
  z-index: 1;
}

.navigation-item:active {
  transform: scale(0.94);
}

.navigation-item:focus-visible {
  outline: 2px solid var(--green-300, #a6ffc7);
  outline-offset: -3px;
}

/* 선택 상태는 불투명도로 구분한다 — 이전에는 구분 자체가 없었다 */
.navigation-item__icon {
  display: block;
  flex: 0 0 auto;
  /* 새 30px viewBox의 균일 여백을 감안해 이전과 같은 실제 도형 크기로 맞춘다. */
  width: 34px;
  height: 34px;
  margin: 0;
  object-fit: contain;
  opacity: 0.6;
  transition: opacity var(--duration-normal) var(--ease-default);
}

.navigation-item[aria-current='page'] .navigation-item__icon {
  opacity: 1;
}

@media (prefers-reduced-motion: reduce) {
  .bottom-navigation,
  .navigation-item,
  .navigation-item__icon {
    transition: none;
  }

  .navigation-indicator {
    transition: none;
  }
}
</style>
