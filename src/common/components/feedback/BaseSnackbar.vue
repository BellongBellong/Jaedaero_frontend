<script setup>
defineProps({
  visible: { type: Boolean, default: false },
  title: { type: String, default: '' },
  message: { type: String, default: '' },
  iconSrc: { type: String, default: '' },
  actionLabel: { type: String, default: '' },
  placement: { type: String, default: 'top' },
  variant: { type: String, default: 'default' },
})

const emit = defineEmits(['activate', 'dismiss'])
</script>

<template>
  <Teleport to="body">
    <Transition
      name="base-snackbar"
      mode="out-in"
    >
      <aside
        v-if="visible"
        class="base-snackbar"
        :class="[`base-snackbar--${placement}`, `base-snackbar--${variant}`]"
        role="status"
        aria-live="polite"
      >
        <button
          type="button"
          class="base-snackbar__content"
          :class="{ 'base-snackbar__content--plain': !iconSrc }"
          :aria-label="[title, message].filter(Boolean).join('. ')"
          @click="emit('activate')"
        >
          <span
            v-if="iconSrc"
            class="base-snackbar__icon"
            aria-hidden="true"
          >
            <img
              :src="iconSrc"
              alt=""
            >
          </span>

          <span class="base-snackbar__copy">
            <strong v-if="title">{{ title }}</strong>
            <span v-if="message">{{ message }}</span>
          </span>
        </button>

        <button
          v-if="actionLabel"
          type="button"
          class="base-snackbar__action"
          @click.stop="emit('activate')"
        >
          {{ actionLabel }}
        </button>
      </aside>
    </Transition>
  </Teleport>
</template>

<style scoped>
.base-snackbar {
  position: fixed;
  z-index: var(--z-toast);
  right: 50%;
  top: calc(var(--safe-area-top) + var(--app-header-height) + 12px);
  display: grid;
  width: min(calc(100vw - 44px), 354px);
  min-height: 62px;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 12px;
  box-sizing: border-box;
  padding: 12px 16px 12px 20px;
  overflow: hidden;
  border: 1px solid rgb(255 255 255 / 4%);
  border-radius: 15px;
  background: rgb(51 51 51 / 90%);
  box-shadow: 0 12px 28px rgb(0 0 0 / 22%);
  -webkit-backdrop-filter: blur(6px);
  backdrop-filter: blur(6px);
  transform: translateX(50%);
}

.base-snackbar--bottom {
  top: auto;
  bottom: calc(var(--bottom-navigation-area-height) + var(--safe-area-bottom) + 16px);
}

.base-snackbar--badge {
  width: min(calc(100vw - 24px), 410px);
  min-height: 96px;
  padding: 14px 16px 14px 18px;
  border-radius: 22px;
}

.base-snackbar--badge .base-snackbar__content {
  grid-template-columns: 52px minmax(0, 1fr);
  gap: 12px;
}

.base-snackbar--badge .base-snackbar__icon {
  width: 52px;
  height: 52px;
}

.base-snackbar--badge .base-snackbar__icon img {
  width: 52px;
  height: 52px;
}

.base-snackbar--badge .base-snackbar__copy {
  gap: 0;
}

.base-snackbar--badge .base-snackbar__copy strong,
.base-snackbar--badge .base-snackbar__copy span {
  font-size: 17px;
  line-height: 1.45;
}

.base-snackbar__content {
  display: grid;
  min-width: 0;
  grid-template-columns: 24px minmax(0, 1fr);
  gap: 14px;
  align-items: center;
  border: 0;
  background: transparent;
  padding: 0;
  color: #fff;
  text-align: left;
}

.base-snackbar__content--plain {
  grid-template-columns: minmax(0, 1fr);
}

.base-snackbar__icon {
  display: grid;
  width: 24px;
  height: 24px;
  place-items: center;
}

.base-snackbar__icon img {
  width: 24px;
  height: 24px;
  object-fit: contain;
}

.base-snackbar__copy {
  display: grid;
  min-width: 0;
  gap: 2px;
}

.base-snackbar__copy strong,
.base-snackbar__copy span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: normal;
}

.base-snackbar__copy strong {
  color: #fff;
  font-size: 14px;
  font-weight: 700;
  line-height: 1.35;
}

.base-snackbar__copy span {
  color: #fff;
  font-size: 14px;
  font-weight: 700;
  line-height: 1.35;
}

.base-snackbar__action {
  align-self: center;
  min-height: 26px;
  padding: 4px 10px;
  border: 0;
  border-radius: 999px;
  background: #ececec;
  color: #757575;
  font-size: 11px;
  font-weight: 700;
  white-space: nowrap;
}

.base-snackbar__content:active,
.base-snackbar__action:active {
  opacity: 0.68;
}

.base-snackbar-enter-active,
.base-snackbar-leave-active {
  transition:
    opacity var(--duration-normal) var(--ease-default),
    transform var(--duration-normal) var(--ease-default);
}

.base-snackbar-enter-from,
.base-snackbar-leave-to {
  opacity: 0;
  transform: translate(50%, 12px);
}

@media (prefers-reduced-motion: reduce) {
  .base-snackbar-enter-active,
  .base-snackbar-leave-active {
    transition: opacity var(--duration-fast) linear;
  }
}
</style>
