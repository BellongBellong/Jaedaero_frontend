<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'

import Icon from '@/components/common/BaseIcon.vue'

const props = defineProps({
  title: {
    type: String,
    required: true,
  },
  subtitle: {
    type: String,
    default: '',
  },
  headingLevel: {
    type: Number,
    default: 1,
    validator: (value) => value >= 1 && value <= 6,
  },
  backTo: {
    type: [String, Object],
    default: null,
  },
  backLabel: {
    type: String,
    default: '뒤로 가기',
  },
  showBack: {
    type: Boolean,
    default: true,
  },
  sticky: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits({
  back: (event) => event instanceof Event,
})

const headingTag = computed(() => `h${props.headingLevel}`)
</script>

<template>
  <header
    class="screen-header"
    :class="{ 'screen-header--sticky': props.sticky }"
  >
    <div
      v-if="props.showBack || $slots.leading"
      class="screen-header__leading"
    >
      <slot name="leading">
        <RouterLink
          v-if="props.backTo"
          class="screen-header__back"
          :to="props.backTo"
          :aria-label="props.backLabel"
        >
          <Icon
            name="arrow-left"
            :size="20"
          />
        </RouterLink>
        <button
          v-else
          class="screen-header__back"
          type="button"
          :aria-label="props.backLabel"
          @click="emit('back', $event)"
        >
          <Icon
            name="arrow-left"
            :size="20"
          />
        </button>
      </slot>
    </div>

    <div class="screen-header__copy">
      <slot name="title">
        <component
          :is="headingTag"
          class="screen-header__title"
        >
          {{ props.title }}
        </component>
      </slot>
      <p
        v-if="props.subtitle"
        class="screen-header__subtitle"
      >
        {{ props.subtitle }}
      </p>
      <slot />
    </div>

    <div
      v-if="$slots.actions"
      class="screen-header__actions"
    >
      <slot name="actions" />
    </div>
  </header>
</template>

<style scoped>
.screen-header {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: start;
  gap: var(--space-3, 12px);
  width: 100%;
  padding: var(--space-4, 16px) 0 var(--space-5, 20px);
}

.screen-header--sticky {
  position: sticky;
  top: 0;
  z-index: 15;
  background: color-mix(in srgb, var(--color-background) 94%, transparent);
  backdrop-filter: blur(16px);
}

.screen-header__leading {
  min-width: 44px;
}

.screen-header__back {
  display: inline-grid;
  width: 44px;
  height: 44px;
  padding: 0;
  place-items: center;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md, 14px);
  background: var(--color-surface);
  color: var(--color-text);
  cursor: pointer;
  text-decoration: none;
  transition:
    border-color 160ms ease,
    box-shadow 160ms ease,
    transform 160ms ease;
}

.screen-header__back:hover {
  border-color: var(--color-primary-soft);
  box-shadow: var(--shadow-sm);
  transform: translateY(-1px);
}

.screen-header__back:focus-visible {
  outline: 3px solid var(--color-focus-ring);
  outline-offset: 2px;
}

.screen-header__copy {
  min-width: 0;
  padding-top: 5px;
}

.screen-header__title {
  margin: 0;
  color: var(--color-text);
  font-size: clamp(24px, 4vw, 32px);
  font-weight: 800;
  letter-spacing: -0.045em;
  line-height: 1.2;
}

.screen-header__subtitle {
  margin: 7px 0 0;
  color: var(--color-text-muted);
  font-size: var(--font-size-sm, 14px);
  line-height: 1.55;
}

.screen-header__actions {
  display: flex;
  align-items: center;
  gap: var(--space-2, 8px);
}

@media (max-width: 480px) {
  .screen-header {
    padding-top: var(--space-3, 12px);
  }

  .screen-header__title {
    font-size: 24px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .screen-header__back {
    transition: none;
  }
}
</style>
