<script setup>
import { useRouter } from 'vue-router'

import backArrowIcon from '@/assets/icons/backArrowIcon.svg'
import ModeSwitch from '@/common/components/ModeSwitch.vue'
import NotificationButton from '@/common/components/NotificationButton.vue'

defineProps({
  title: { type: String, default: '' },
  variant: { type: String, default: 'back' },
})

const router = useRouter()
</script>

<template>
  <header
    class="app-header"
    :class="`app-header--${variant}`"
  >
    <template v-if="variant === 'home'">
      <strong class="app-header__brand">제대로</strong>
      <div class="app-header__actions">
        <ModeSwitch />
        <NotificationButton />
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
        <h1>{{ title }}</h1>
      </div>
    </template>
  </header>
</template>

<style scoped>
.app-header {
  position: relative;
  z-index: var(--z-header);
  display: flex;
  min-height: 76px;
  align-items: flex-end;
  gap: var(--space-8);
  padding: var(--space-10) var(--layout-page-padding);
  background: transparent;
}
.app-header--home {
  align-items: center;
  justify-content: space-between;
}
.app-header__brand {
  color: var(--ui-ext);
  font-family: var(--font-display);
  font-size: var(--text-h3);
  font-weight: var(--weight-bold);
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
h1 {
  color: var(--ui-ext);
  font-family: var(--font-body);
  font-size: var(--text-h5);
  font-weight: var(--weight-bold);
  line-height: var(--leading-normal);
}
</style>
