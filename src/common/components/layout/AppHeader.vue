<script setup>
import { onBeforeUnmount, onMounted } from 'vue'
import { useRouter } from 'vue-router'

import jaedaeroWordmark from '../../../assets/JaedaeroWordmark.svg'
import backwardIcon from '../../../assets/icons/backArrowIcon.svg'
import ModeSwitch from '../buttons/ModeSwitch.vue'
import NotificationButton from '../buttons/NotificationButton.vue'
import { useLeaveModeSchedule } from '@/features/leave-mode/composables/useLeaveModeSchedule.js'

defineProps({
  title: { type: String, default: '' },
  badge: { type: String, default: '' },
  variant: { type: String, default: 'back' },
  collapsed: { type: Boolean, default: false },
  hidden: { type: Boolean, default: false },
  hideBackWhenCollapsed: { type: Boolean, default: false },
})

const router = useRouter()
const { mode, setMode, refreshMode } = useLeaveModeSchedule()
let dailyRefreshTimer

function scheduleNextRefresh() {
  const now = new Date()
  const nextDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 1)
  dailyRefreshTimer = window.setTimeout(() => {
    refreshMode()
    scheduleNextRefresh()
  }, nextDay - now)
}

onMounted(() => {
  refreshMode()
  scheduleNextRefresh()
})

onBeforeUnmount(() => window.clearTimeout(dailyRefreshTimer))
</script>

<template>
  <header
    class="app-header"
    :class="[
      `app-header--${variant}`,
      {
        'app-header--collapsed': collapsed && variant !== 'home',
        'app-header--hidden': hidden,
        'app-header--hide-collapsed-back': hideBackWhenCollapsed,
      },
    ]"
    :aria-hidden="hidden ? 'true' : undefined"
    :inert="hidden"
  >
    <template v-if="variant === 'home'">
      <img
        class="app-header__brand"
        :src="jaedaeroWordmark"
        alt="제대로"
      >
      <div class="app-header__actions">
        <ModeSwitch
          :model-value="mode"
          @update:model-value="setMode"
        />
        <NotificationButton :mode="mode" />
      </div>
    </template>
    <template v-else>
      <button
        v-if="variant === 'back'"
        class="app-header__back"
        type="button"
        aria-label="이전 페이지"
        @click="router.back()"
      >
        <img
          :src="backwardIcon"
          alt=""
          aria-hidden="true"
        >
      </button>
      <div>
        <div class="app-header__title-row">
          <h1>{{ title }}</h1>
          <span
            v-if="badge"
            class="app-header__badge"
          >
            {{ badge }}
          </span>
        </div>
      </div>
    </template>
  </header>
</template>

<style scoped>
.app-header {
  position: relative;
  z-index: var(--z-header);
  display: flex;
  flex: 0 0 calc(var(--app-header-height) + var(--safe-area-top));
  width: 100%;
  height: calc(var(--app-header-height) + var(--safe-area-top));
  align-items: flex-end;
  gap: var(--space-8);
  padding: calc(var(--space-10) + var(--safe-area-top))
    max(var(--layout-page-padding), var(--safe-area-right)) var(--space-10)
    max(var(--layout-page-padding), var(--safe-area-left));
  background: transparent;
  transition:
    flex-basis 260ms cubic-bezier(0.22, 1, 0.36, 1),
    height 260ms cubic-bezier(0.22, 1, 0.36, 1),
    padding 260ms cubic-bezier(0.22, 1, 0.36, 1),
    transform var(--chrome-motion-duration, 280ms)
      var(--chrome-motion-ease, cubic-bezier(0.22, 1, 0.36, 1)),
    opacity 180ms ease;
  will-change: transform, opacity;
}
.app-header--hidden {
  opacity: 0;
  pointer-events: none;
  transform: translate3d(0, -100%, 0);
}
.app-header--collapsed {
  flex-basis: 0;
  height: 0;
  padding: 0;
}
.app-header--collapsed .app-header__title-row {
  visibility: hidden;
  opacity: 0;
  pointer-events: none;
}
.app-header--collapsed .app-header__back {
  position: fixed;
  top: calc(var(--safe-area-top) + 10px);
  left: max(
    calc(var(--safe-area-left) + var(--layout-page-padding)),
    calc((100vw - var(--design-mobile-width)) / 2 + var(--layout-page-padding))
  );
  z-index: var(--z-header);
  margin: 0;
}
.app-header--collapsed.app-header--hide-collapsed-back .app-header__back {
  display: none;
}
.app-header--home {
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  align-items: center;
  justify-content: space-between;
  background: linear-gradient(180deg, rgb(250 250 250 / 100%) 0%, rgb(255 255 255 / 0%) 100%);
  backdrop-filter: blur(1.5px);
  -webkit-backdrop-filter: blur(1.5px);
}
.app-header--back {
  align-items: center;
  gap: 14px;
}
.app-header__brand {
  display: block;
  width: 65px;
  height: 22px;
}
.app-header__actions {
  display: flex;
  align-items: center;
  gap: var(--space-8);
}
.app-header__back {
  display: grid;
  flex-shrink: 0;
  width: 48px;
  height: 48px;
  place-items: center;
  margin: 0;
  padding: 0;
  border: 1px solid rgb(255 255 255 / 90%);
  border-radius: var(--radius-full);
  background: rgb(255 255 255 / 18%);
  backdrop-filter: blur(18px) saturate(125%);
  -webkit-backdrop-filter: blur(18px) saturate(125%);
}
.app-header__back img {
  display: block;
  width: 10px;
  height: 17px;
  object-fit: contain;
}
.app-header__title-row {
  display: flex;
  align-items: center;
  gap: var(--space-8);
  transition: opacity 120ms ease;
}
.app-header__badge {
  padding: 2px 10px;
  border-radius: var(--radius-full);
  background: var(--olive-100);
  color: var(--olive-500);
  font-size: var(--text-xs);
  font-weight: var(--weight-bold);
  line-height: var(--leading-normal);
}
h1 {
  color: var(--ui-ext);
  font-family: var(--font-body);
  font-size: var(--text-h5);
  font-weight: var(--weight-bold);
  line-height: var(--leading-normal);
}

@media (prefers-reduced-motion: reduce) {
  .app-header {
    transition: none;
  }
}
</style>
