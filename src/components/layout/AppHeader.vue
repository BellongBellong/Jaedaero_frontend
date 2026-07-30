<script setup>
import { RouterLink } from 'vue-router'

const props = defineProps({
  appName: {
    type: String,
    default: '제대로',
  },
  homeTo: {
    type: [String, Object],
    default: null,
  },
  sticky: {
    type: Boolean,
    default: false,
  },
  compact: {
    type: Boolean,
    default: false,
  },
})
</script>

<template>
  <header
    class="app-header"
    :class="{
      'app-header--sticky': props.sticky,
      'app-header--compact': props.compact,
    }"
  >
    <div class="app-header__inner">
      <slot name="brand">
        <RouterLink
          v-if="props.homeTo"
          class="app-header__brand"
          :to="props.homeTo"
          :aria-label="`${props.appName} 홈`"
        >
          <span
            class="app-header__logo"
            aria-hidden="true"
          >
            <span class="app-header__logo-dot" />
          </span>
          <span class="app-header__name">{{ props.appName }}</span>
        </RouterLink>

        <div
          v-else
          class="app-header__brand"
        >
          <span
            class="app-header__logo"
            aria-hidden="true"
          >
            <span class="app-header__logo-dot" />
          </span>
          <span class="app-header__name">{{ props.appName }}</span>
        </div>
      </slot>

      <nav
        v-if="$slots.navigation"
        class="app-header__navigation"
        aria-label="상단 메뉴"
      >
        <slot name="navigation" />
      </nav>

      <div
        v-if="$slots.actions"
        class="app-header__actions"
      >
        <slot name="actions" />
      </div>
    </div>
  </header>
</template>

<style scoped>
.app-header {
  position: relative;
  z-index: 20;
  width: 100%;
  border-bottom: 1px solid color-mix(in srgb, var(--color-border) 72%, transparent);
  background: color-mix(in srgb, var(--color-surface) 92%, transparent);
  backdrop-filter: blur(18px);
}

.app-header--sticky {
  position: sticky;
  top: 0;
}

.app-header__inner {
  display: flex;
  align-items: center;
  width: min(100%, var(--content-max-width, 1180px));
  min-height: 72px;
  margin: 0 auto;
  padding: 0 var(--page-gutter, 24px);
}

.app-header--compact .app-header__inner {
  min-height: 60px;
}

.app-header__brand {
  display: inline-flex;
  flex: 0 0 auto;
  align-items: center;
  gap: 10px;
  color: var(--color-text);
  text-decoration: none;
}

.app-header__logo {
  position: relative;
  display: grid;
  width: 34px;
  height: 34px;
  place-items: center;
  overflow: hidden;
  border-radius: 12px;
  background: linear-gradient(145deg, var(--color-primary), var(--color-primary-strong));
  box-shadow: 0 8px 18px color-mix(in srgb, var(--color-primary) 24%, transparent);
}

.app-header__logo::before,
.app-header__logo::after {
  position: absolute;
  border-radius: 999px;
  background: var(--color-white);
  content: '';
  transform: rotate(-35deg);
}

.app-header__logo::before {
  width: 7px;
  height: 19px;
  margin-right: 8px;
}

.app-header__logo::after {
  width: 7px;
  height: 13px;
  margin-top: 7px;
  margin-left: 8px;
  opacity: 0.72;
}

.app-header__logo-dot {
  position: absolute;
  top: 6px;
  right: 6px;
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--color-accent);
}

.app-header__name {
  font-size: 19px;
  font-weight: 800;
  letter-spacing: -0.04em;
}

.app-header__navigation {
  display: flex;
  align-items: center;
  gap: var(--space-4, 16px);
  margin-left: auto;
}

.app-header__actions {
  display: flex;
  align-items: center;
  gap: var(--space-2, 8px);
  margin-left: auto;
}

.app-header__navigation + .app-header__actions {
  margin-left: var(--space-5, 20px);
}

@media (max-width: 767px) {
  .app-header__inner {
    min-height: 60px;
  }

  .app-header__navigation {
    display: none;
  }

  .app-header__name {
    font-size: 18px;
  }
}
</style>
