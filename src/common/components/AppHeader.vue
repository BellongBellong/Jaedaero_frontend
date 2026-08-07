<script setup>
import { onBeforeUnmount, onMounted } from 'vue'
import { useRouter } from 'vue-router'

import jaedaeroWordmark from '@/assets/JaedaeroWordmark.svg'
import backArrowIcon from '@/assets/icons/backArrowIcon.svg'
import ModeSwitch from '@/common/components/ModeSwitch.vue'
import NotificationButton from '@/common/components/NotificationButton.vue'
import { useLeaveModeSchedule } from '@/features/leave-mode/composables/useLeaveModeSchedule'

defineProps({
  title: { type: String, default: '' },
  badge: { type: String, default: '' },
  variant: { type: String, default: 'back' },
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

onBeforeUnmount(() => {
  window.clearTimeout(dailyRefreshTimer)
})
</script>

<template>
  <header
    class="app-header"
    :class="`app-header--${variant}`"
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
        class="app-header__back"
        type="button"
        aria-label="이전 페이지"
        @click="router.back()"
      >
        <img
          :src="backArrowIcon"
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
}
.app-header--home {
  align-items: center;
  justify-content: space-between;
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
  width: 24px;
  height: 24px;
  place-items: center;
  margin-bottom: 2px;
}
.app-header__back img {
  width: 10px;
  height: 17px;
}
.app-header__title-row {
  display: flex;
  align-items: center;
  gap: var(--space-8);
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
</style>
