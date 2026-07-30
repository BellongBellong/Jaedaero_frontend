<script setup>
import { computed } from 'vue'

const props = defineProps({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: '',
  },
  headingLevel: {
    type: Number,
    default: 2,
    validator: (value) => value >= 1 && value <= 6,
  },
  compact: {
    type: Boolean,
    default: false,
  },
})

const headingTag = computed(() => `h${props.headingLevel}`)
</script>

<template>
  <div
    class="section-title"
    :class="{ 'section-title--compact': props.compact }"
  >
    <div class="section-title__copy">
      <slot name="title">
        <component
          :is="headingTag"
          class="section-title__heading"
        >
          {{ props.title }}
        </component>
      </slot>
      <slot name="description">
        <p
          v-if="props.description"
          class="section-title__description"
        >
          {{ props.description }}
        </p>
      </slot>
    </div>

    <div
      v-if="$slots.actions"
      class="section-title__actions"
    >
      <slot name="actions" />
    </div>
  </div>
</template>

<style scoped>
.section-title {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: var(--space-4, 16px);
  margin-bottom: var(--space-4, 16px);
}

.section-title--compact {
  margin-bottom: var(--space-3, 12px);
}

.section-title__copy {
  min-width: 0;
}

.section-title__heading {
  margin: 0;
  color: var(--color-text);
  font-size: clamp(19px, 3vw, 23px);
  font-weight: 800;
  letter-spacing: -0.035em;
  line-height: 1.3;
}

.section-title--compact .section-title__heading {
  font-size: 18px;
}

.section-title__description {
  margin: 6px 0 0;
  color: var(--color-text-muted);
  font-size: var(--font-size-sm, 14px);
  line-height: 1.55;
}

.section-title__actions {
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  gap: var(--space-2, 8px);
}

@media (max-width: 480px) {
  .section-title {
    align-items: center;
  }

  .section-title__description {
    font-size: 13px;
  }
}
</style>
