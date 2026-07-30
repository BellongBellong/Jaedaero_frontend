<script setup>
import BaseBadge from './BaseBadge.vue'
import Icon from './BaseIcon.vue'

const props = defineProps({
  items: {
    type: Array,
    default: () => [],
  },
  activeId: {
    type: [String, Number],
    default: '',
  },
  ariaLabel: {
    type: String,
    default: '주요 메뉴',
  },
  fixed: {
    type: Boolean,
    default: true,
  },
})

const emit = defineEmits(['select'])

function isActive(item) {
  return item.active === true || (props.activeId !== '' && item.id === props.activeId)
}

function itemKey(item, index) {
  return item.id ?? item.name ?? `${item.label || 'navigation-item'}-${index}`
}

function hasBadge(item) {
  return item.badge !== undefined && item.badge !== null && item.badge !== ''
}

function formatBadge(badge) {
  if (typeof badge === 'number' && badge > 99) {
    return '99+'
  }

  return String(badge)
}

function handleSelect(item, event) {
  if (!item.disabled) {
    emit('select', item, event)
  }
}
</script>

<template>
  <nav
    class="bottom-navigation"
    :class="{ 'bottom-navigation--fixed': fixed }"
    :aria-label="ariaLabel"
  >
    <ul class="bottom-navigation__list">
      <li
        v-for="(item, index) in items"
        :key="itemKey(item, index)"
        class="bottom-navigation__item"
      >
        <RouterLink
          v-if="item.to && !item.disabled"
          class="bottom-navigation__link"
          :class="{ 'bottom-navigation__link--active': isActive(item) }"
          :to="item.to"
          :aria-current="isActive(item) ? 'page' : undefined"
          @click="handleSelect(item, $event)"
        >
          <span class="bottom-navigation__icon">
            <Icon
              v-if="item.icon"
              :name="item.icon"
              :size="24"
              decorative
            />
            <BaseBadge
              v-if="hasBadge(item)"
              class="bottom-navigation__badge"
              tone="danger"
              size="sm"
              :aria-label="`${item.label} 알림 ${formatBadge(item.badge)}개`"
            >
              {{ formatBadge(item.badge) }}
            </BaseBadge>
          </span>
          <span class="bottom-navigation__label">{{ item.label }}</span>
        </RouterLink>

        <button
          v-else
          class="bottom-navigation__link"
          :class="{ 'bottom-navigation__link--active': isActive(item) }"
          type="button"
          :disabled="item.disabled"
          :aria-current="isActive(item) ? 'page' : undefined"
          @click="handleSelect(item, $event)"
        >
          <span class="bottom-navigation__icon">
            <Icon
              v-if="item.icon"
              :name="item.icon"
              :size="24"
              decorative
            />
            <BaseBadge
              v-if="hasBadge(item)"
              class="bottom-navigation__badge"
              tone="danger"
              size="sm"
              :aria-label="`${item.label} 알림 ${formatBadge(item.badge)}개`"
            >
              {{ formatBadge(item.badge) }}
            </BaseBadge>
          </span>
          <span class="bottom-navigation__label">{{ item.label }}</span>
        </button>
      </li>
    </ul>
  </nav>
</template>

<style scoped>
.bottom-navigation {
  z-index: var(--bottom-navigation-z-index, 100);
  width: 100%;
  padding-bottom: env(safe-area-inset-bottom, 0);
  border-top: 1px solid var(--color-border-subtle, #e7ebe8);
  background: var(--color-surface, #ffffff);
  box-shadow: var(--shadow-navigation, 0 -4px 16px rgb(17 24 39 / 7%));
  font-family: var(--font-family, inherit);
}

.bottom-navigation--fixed {
  position: fixed;
  right: 0;
  bottom: 0;
  left: 0;
}

.bottom-navigation__list {
  display: grid;
  grid-auto-columns: minmax(0, 1fr);
  grid-auto-flow: column;
  width: min(100%, var(--navigation-max-width, 520px));
  min-height: 64px;
  margin: 0 auto;
  padding: var(--space-1, 4px) var(--space-2, 8px);
  list-style: none;
}

.bottom-navigation__item {
  min-width: 0;
}

.bottom-navigation__link {
  position: relative;
  display: flex;
  width: 100%;
  min-width: 44px;
  min-height: 56px;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: var(--space-1, 4px);
  margin: 0;
  padding: var(--space-1, 4px);
  border: 0;
  border-radius: var(--radius-md, 10px);
  color: var(--color-text-muted, #66736c);
  background: transparent;
  font: inherit;
  text-decoration: none;
  cursor: pointer;
  transition:
    color 160ms ease,
    background-color 160ms ease;
}

.bottom-navigation__link:hover:not(:disabled) {
  color: var(--color-primary, #236b4e);
  background: var(--color-primary-subtle, #edf6f1);
}

.bottom-navigation__link:focus-visible {
  outline: 3px solid var(--color-focus-ring, rgb(46 125 92 / 24%));
  outline-offset: -3px;
}

.bottom-navigation__link:disabled {
  cursor: not-allowed;
  opacity: 0.45;
}

.bottom-navigation__link--active,
.bottom-navigation__link.router-link-active {
  color: var(--color-primary, #236b4e);
}

.bottom-navigation__icon {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 24px;
}

.bottom-navigation__badge {
  position: absolute;
  top: -8px;
  left: calc(100% - 5px);
  min-width: 20px;
  justify-content: center;
  padding-right: var(--space-1, 4px);
  padding-left: var(--space-1, 4px);
}

.bottom-navigation__label {
  width: 100%;
  overflow: hidden;
  font-size: var(--font-size-2xs, 0.6875rem);
  font-weight: var(--font-weight-medium, 500);
  line-height: 1.2;
  text-align: center;
  text-overflow: ellipsis;
  white-space: nowrap;
}

@media (prefers-reduced-motion: reduce) {
  .bottom-navigation__link {
    transition: none;
  }
}
</style>
