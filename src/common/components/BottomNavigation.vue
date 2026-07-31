<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import aiCoachIcon from '@/assets/icons/aiCoachIcon.svg'
import challengeIcon from '@/assets/icons/challengeIcon.svg'
import homeIcon from '@/assets/icons/homeIcon.svg'
import myIcon from '@/assets/icons/myIcon.svg'

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
    class="bottom-navigation"
    aria-label="주요 메뉴"
    :class="{
      'bottom-navigation--dragging': isDragging,
      'bottom-navigation--glass-overlay': isDragging || isNavigating,
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
.bottom-navigation {
  position: relative;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 270px;
  height: 66px;
  padding: 8px 15px;
  margin: 0 auto 20px;
  overflow: hidden;
  border: 1px solid rgb(255 255 255 / 62%);
  border-radius: 50px;
  background: rgb(51 51 51 / 52%);
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / 28%),
    0 8px 24px rgb(0 0 0 / 18%);
  backdrop-filter: blur(18px) saturate(140%);
  -webkit-backdrop-filter: blur(18px) saturate(140%);
  touch-action: none;
}

.navigation-indicator {
  position: absolute;
  top: 8px;
  left: 0;
  width: 60px;
  height: 50px;
  border-radius: 28px;
  background: var(
    --navigation-gradient,
    radial-gradient(closest-side, rgb(255 255 255 / 40%) 0%, rgb(59 225 120 / 40%) 100%)
  );
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / 40%),
    inset 1px 0 0 rgb(255 255 255 / 32%),
    inset 0 -1px 1px rgb(0 0 0 / 13%),
    inset -1px 0 1px rgb(0 0 0 / 11%);
  pointer-events: none;
  z-index: 0;
  transition: transform 220ms cubic-bezier(0.2, 0.8, 0.2, 1);
  backdrop-filter: blur(2px) brightness(100%) saturate(100%);
  -webkit-backdrop-filter: blur(2px) brightness(100%) saturate(100%);
}

.bottom-navigation--dragging .navigation-indicator {
  transition-duration: 70ms;
}

.bottom-navigation--glass-overlay .navigation-indicator {
  z-index: 2;
}

.navigation-item {
  display: grid;
  flex: 0 0 60px;
  place-items: center;
  width: 60px;
  height: 50px;
  padding: 2px 16px;
  overflow: hidden;
  border: 0;
  border-radius: 28px;
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

.navigation-item__icon {
  display: block;
  width: 30px;
  height: 30px;
  object-fit: contain;
}

@media (prefers-reduced-motion: reduce) {
  .navigation-item {
    transition: none;
  }

  .navigation-indicator {
    transition: none;
  }
}
</style>
