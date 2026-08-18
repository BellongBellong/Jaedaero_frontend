<script setup>
import { computed, useAttrs } from 'vue'

defineOptions({ inheritAttrs: false })

const props = defineProps({
  as: { type: String, default: 'div' },
  tone: { type: String, default: 'light' },
  blur: { type: Number, default: 4 },
  radius: { type: String, default: '24px' },
  disabled: { type: Boolean, default: false },
})

const attrs = useAttrs()
const surfaceStyle = computed(() => ({
  '--liquid-glass-blur': `${Math.max(0, props.blur)}px`,
  '--liquid-glass-radius': props.radius,
}))
</script>

<template>
  <component
    :is="as"
    v-bind="attrs"
    class="liquid-glass-container"
    :class="[`liquid-glass-container--${tone}`, { 'liquid-glass-container--disabled': disabled }]"
    :style="surfaceStyle"
    :disabled="as === 'button' ? disabled : undefined"
  >
    <span
      class="liquid-glass-container__material"
      aria-hidden="true"
    />
    <span
      class="liquid-glass-container__specular"
      aria-hidden="true"
    />
    <slot />
  </component>
</template>

<style scoped>
/*
  vue-web-liquid-glass의 edge blur/specular 구조를 iOS Safari에서도 안정적인
  CSS backdrop-filter와 inset highlight로 옮긴 공통 표면이다.
*/
.liquid-glass-container {
  --liquid-glass-fill: rgb(255 255 255 / 18%);
  --liquid-glass-stroke: rgb(255 255 255 / 64%);
  --liquid-glass-highlight: rgb(255 255 255 / 68%);
  --liquid-glass-shade: rgb(26 34 29 / 10%);
  --liquid-glass-shadow: 0 6px 20px rgb(26 34 29 / 12%);

  position: relative;
  isolation: isolate;
  overflow: hidden;
  border: 1px solid var(--liquid-glass-stroke);
  border-radius: var(--liquid-glass-radius);
  background: transparent;
  box-shadow:
    inset 0 1px 0 var(--liquid-glass-highlight),
    inset 0 -1px 0 var(--liquid-glass-shade),
    var(--liquid-glass-shadow);
}

.liquid-glass-container--dark {
  --liquid-glass-fill: rgb(28 30 29 / 48%);
  --liquid-glass-stroke: rgb(255 255 255 / 42%);
  --liquid-glass-highlight: rgb(255 255 255 / 34%);
  --liquid-glass-shade: rgb(0 0 0 / 24%);
  --liquid-glass-shadow: 0 7px 20px rgb(0 0 0 / 20%);
}

.liquid-glass-container--clear {
  --liquid-glass-fill: rgb(255 255 255 / 9%);
  --liquid-glass-stroke: rgb(255 255 255 / 52%);
  --liquid-glass-shadow: 0 4px 14px rgb(26 34 29 / 8%);
}

.liquid-glass-container__material,
.liquid-glass-container__specular {
  position: absolute;
  z-index: -1;
  inset: 0;
  border-radius: inherit;
  pointer-events: none;
}

.liquid-glass-container__material {
  background: var(--liquid-glass-fill);
  backdrop-filter: blur(var(--liquid-glass-blur)) saturate(135%);
  -webkit-backdrop-filter: blur(var(--liquid-glass-blur)) saturate(135%);
}

.liquid-glass-container__specular {
  background:
    linear-gradient(145deg, rgb(255 255 255 / 26%) 0%, transparent 28%),
    linear-gradient(330deg, rgb(255 255 255 / 10%) 0%, transparent 24%);
  box-shadow:
    inset 1px 1px 0 rgb(255 255 255 / 22%),
    inset -1px -1px 0 rgb(0 0 0 / 6%);
}

.liquid-glass-container--disabled {
  opacity: 0.52;
}

@media (prefers-reduced-transparency: reduce) {
  .liquid-glass-container__material {
    background: rgb(244 244 244 / 96%);
    backdrop-filter: none;
    -webkit-backdrop-filter: none;
  }

  .liquid-glass-container--dark .liquid-glass-container__material {
    background: rgb(43 43 43 / 94%);
  }
}

@supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))) {
  .liquid-glass-container__material {
    background: rgb(244 244 244 / 92%);
  }

  .liquid-glass-container--dark .liquid-glass-container__material {
    background: rgb(43 43 43 / 90%);
  }
}
</style>
