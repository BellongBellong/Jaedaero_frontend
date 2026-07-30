<script setup>
import { computed, ref, watch } from 'vue'

import Icon from './BaseIcon.vue'

const props = defineProps({
  src: {
    type: String,
    default: '',
  },
  alt: {
    type: String,
    default: undefined,
  },
  name: {
    type: String,
    default: '',
  },
  size: {
    type: [String, Number],
    default: 'md',
    validator: (value) => {
      return typeof value === 'number' ? value > 0 : ['sm', 'md', 'lg', 'xl'].includes(value)
    },
  },
  status: {
    type: String,
    default: '',
    validator: (value) => ['', 'online', 'offline', 'away', 'busy'].includes(value),
  },
  statusLabel: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['load', 'error'])

const imageFailed = ref(false)

const showImage = computed(() => Boolean(props.src) && !imageFailed.value)
const initials = computed(() => {
  const words = props.name.trim().split(/\s+/).filter(Boolean)

  if (words.length > 1) {
    return words
      .slice(0, 2)
      .map((word) => Array.from(word)[0])
      .join('')
      .toUpperCase()
  }

  return Array.from(words[0] || '')
    .slice(0, 2)
    .join('')
    .toUpperCase()
})
const imageAlt = computed(() => {
  if (props.alt !== undefined) {
    return props.alt
  }

  return props.name ? `${props.name} 프로필` : ''
})
const fallbackLabel = computed(() => imageAlt.value || '프로필 이미지')
const sizeClass = computed(() => {
  return typeof props.size === 'string' ? `profile-avatar--${props.size}` : ''
})
const sizeStyle = computed(() => {
  return typeof props.size === 'number' ? { '--avatar-size': `${props.size}px` } : undefined
})
const resolvedStatusLabel = computed(() => {
  if (props.statusLabel) {
    return props.statusLabel
  }

  const labels = {
    online: '온라인',
    offline: '오프라인',
    away: '자리 비움',
    busy: '방해 금지',
  }

  return labels[props.status] || ''
})

watch(
  () => props.src,
  () => {
    imageFailed.value = false
  },
)

function handleLoad(event) {
  emit('load', event)
}

function handleError(event) {
  imageFailed.value = true
  emit('error', event)
}
</script>

<template>
  <span
    class="profile-avatar"
    :class="sizeClass"
    :style="sizeStyle"
  >
    <img
      v-if="showImage"
      class="profile-avatar__image"
      :src="src"
      :alt="imageAlt"
      @load="handleLoad"
      @error="handleError"
    >
    <span
      v-else
      class="profile-avatar__fallback"
      role="img"
      :aria-label="fallbackLabel"
    >
      <span
        v-if="initials"
        aria-hidden="true"
      >
        {{ initials }}
      </span>
      <Icon
        v-else
        name="user"
        size="55%"
        decorative
      />
    </span>
    <span
      v-if="status"
      class="profile-avatar__status"
      :class="`profile-avatar__status--${status}`"
      role="status"
      :aria-label="resolvedStatusLabel"
    />
  </span>
</template>

<style scoped>
.profile-avatar {
  --avatar-size: 40px;

  position: relative;
  display: inline-flex;
  width: var(--avatar-size);
  height: var(--avatar-size);
  flex: 0 0 var(--avatar-size);
  font-family: var(--font-family, inherit);
}

.profile-avatar--sm {
  --avatar-size: 32px;
}

.profile-avatar--md {
  --avatar-size: 40px;
}

.profile-avatar--lg {
  --avatar-size: 52px;
}

.profile-avatar--xl {
  --avatar-size: 64px;
}

.profile-avatar__image,
.profile-avatar__fallback {
  width: 100%;
  height: 100%;
  overflow: hidden;
  border-radius: var(--radius-full, 999px);
}

.profile-avatar__image {
  display: block;
  object-fit: cover;
  background: var(--color-surface-muted, #eef1ef);
}

.profile-avatar__fallback {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--color-primary-strong, #18513a);
  background: var(--color-primary-subtle, #e2f0e9);
  font-size: calc(var(--avatar-size) * 0.34);
  font-weight: var(--font-weight-semibold, 600);
  line-height: 1;
  text-transform: uppercase;
}

.profile-avatar__status {
  position: absolute;
  right: 0;
  bottom: 0;
  width: max(9px, calc(var(--avatar-size) * 0.24));
  height: max(9px, calc(var(--avatar-size) * 0.24));
  border: 2px solid var(--color-surface, #ffffff);
  border-radius: 50%;
}

.profile-avatar__status--online {
  background: var(--color-success, #228451);
}

.profile-avatar__status--offline {
  background: var(--color-neutral, #8b9690);
}

.profile-avatar__status--away {
  background: var(--color-warning, #c47b10);
}

.profile-avatar__status--busy {
  background: var(--color-danger, #c73e3e);
}
</style>
