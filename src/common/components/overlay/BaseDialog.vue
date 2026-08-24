<script setup>
import { getCurrentInstance, onBeforeUnmount, ref, watch } from 'vue'

import closeIcon from '@/assets/icons/closeIcon.svg'

defineOptions({
  inheritAttrs: false,
})

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: '',
  },
  caption: {
    type: String,
    default: '',
  },
  closeOnBackdrop: {
    type: Boolean,
    default: true,
  },
  closeOnEscape: {
    type: Boolean,
    default: true,
  },
  showClose: {
    type: Boolean,
    default: true,
  },
  actionLayout: {
    type: String,
    default: 'primary-wide',
    validator: (value) => ['equal', 'primary-wide'].includes(value),
  },
})

const emit = defineEmits(['update:modelValue', 'close'])

const instance = getCurrentInstance()
const titleId = `dialog-title-${instance?.uid ?? 'default'}`
const captionId = `dialog-caption-${instance?.uid ?? 'default'}`
const previousBodyOverflow = ref('')

function close(reason = 'close') {
  emit('update:modelValue', false)
  emit('close', reason)
}

function closeByBackdrop() {
  if (props.closeOnBackdrop) close('backdrop')
}

function handleKeydown(event) {
  if (props.closeOnEscape && event.key === 'Escape') close('escape')
}

function lockBodyScroll() {
  previousBodyOverflow.value = document.body.style.overflow
  document.body.style.overflow = 'hidden'
  document.addEventListener('keydown', handleKeydown)
}

function unlockBodyScroll() {
  document.body.style.overflow = previousBodyOverflow.value
  document.removeEventListener('keydown', handleKeydown)
}

watch(
  () => props.modelValue,
  (isOpen) => {
    if (isOpen) lockBodyScroll()
    else unlockBodyScroll()
  },
  { immediate: true },
)

onBeforeUnmount(unlockBodyScroll)
</script>

<template>
  <Teleport to="body">
    <Transition name="base-dialog">
      <div
        v-if="modelValue"
        class="base-dialog-backdrop"
        @click.self="closeByBackdrop"
      >
        <section
          v-bind="$attrs"
          class="base-dialog"
          role="dialog"
          aria-modal="true"
          :aria-labelledby="title ? titleId : undefined"
          :aria-describedby="caption ? captionId : undefined"
        >
          <div class="base-dialog__close-row">
            <button
              v-if="showClose"
              type="button"
              class="base-dialog__close"
              aria-label="닫기"
              @click="close('button')"
            >
              <img
                :src="closeIcon"
                alt=""
                aria-hidden="true"
              >
            </button>
          </div>

          <header
            v-if="title || caption || $slots.header"
            class="base-dialog__header"
          >
            <slot name="header">
              <h2
                v-if="title"
                :id="titleId"
              >
                {{ title }}
              </h2>
              <p
                v-if="caption"
                :id="captionId"
              >
                {{ caption }}
              </p>
            </slot>
          </header>

          <div class="base-dialog__content">
            <slot />
          </div>

          <footer
            v-if="$slots.footer || $slots.actions"
            class="base-dialog__footer"
          >
            <div
              v-if="$slots.actions"
              class="base-dialog__actions"
              :class="`base-dialog__actions--${actionLayout}`"
            >
              <slot name="actions" />
            </div>
            <div
              v-if="$slots.footer"
              class="base-dialog__footer-content"
            >
              <slot name="footer" />
            </div>
          </footer>
        </section>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.base-dialog-backdrop {
  position: fixed;
  z-index: var(--z-modal, 900);
  inset: 0;
  display: grid;
  width: 100%;
  padding: var(--space-20);
  place-items: center;
  background: rgb(0 0 0 / 42%);
}

.base-dialog {
  display: flex;
  width: min(100%, calc(var(--design-mobile-width, 393px) - (var(--space-20) * 2)));
  max-height: calc(100dvh - (var(--space-20) * 2));
  flex-direction: column;
  overflow: hidden;
  border-radius: 32px;
  background: var(--white, #fff);
  color: var(--ui-text, #333);
  padding: 20px 0;
}

.base-dialog__close-row {
  display: flex;
  height: 44px;
  flex: 0 0 44px;
  align-items: center;
  justify-content: flex-end;
  padding: 10px 30px;
}

.base-dialog__close {
  display: grid;
  width: 24px;
  height: 24px;
  place-items: center;
  padding: 0;
  border: 0;
  background: transparent;
  cursor: pointer;
}

.base-dialog__close img {
  display: block;
  width: 16px;
  height: 16px;
}

.base-dialog__header {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 0 30px 20px;
}

.base-dialog__header h2 {
  margin: 0;
  color: var(--gray-900, #333);
  font-size: var(--text-h4, 24px);
  font-weight: var(--weight-bold, 700);
  line-height: 1.3;
  word-break: keep-all;
}

.base-dialog__header p {
  margin: 0;
  color: var(--gray-600, #757575);
  font-size: var(--text-md, 16px);
  line-height: 1.5;
  word-break: keep-all;
}

.base-dialog__content {
  min-height: 0;
  padding: 0 30px;
  overflow-y: auto;
  overscroll-behavior: contain;
}

.base-dialog__footer {
  flex: 0 0 auto;
  padding: 20px 30px 0;
}

.base-dialog__actions {
  display: flex;
  align-items: stretch;
  gap: var(--space-12, 12px);
}

.base-dialog__actions > * {
  min-width: 0;
  flex: 1 1 0;
}

.base-dialog__actions--primary-wide > :first-child:not(:only-child) {
  flex: 0 0 36%;
}

.base-dialog__actions :deep(.base-button) {
  width: 100%;
  margin: 0;
}

.base-dialog__footer-content {
  display: flex;
  justify-content: center;
  margin-top: 10px;
  color: var(--ui-sub-title-light, #bdbdbd);
  font-size: var(--text-sm, 14px);
  line-height: 1.42;
}

.base-dialog-enter-active,
.base-dialog-leave-active {
  transition: opacity var(--duration-normal, 250ms) ease;
}

.base-dialog-enter-active .base-dialog,
.base-dialog-leave-active .base-dialog {
  transition: transform var(--duration-normal, 250ms) var(--ease-default, ease);
}

.base-dialog-enter-from,
.base-dialog-leave-to {
  opacity: 0;
}

.base-dialog-enter-from .base-dialog,
.base-dialog-leave-to .base-dialog {
  transform: scale(0.96);
}

@media (prefers-reduced-motion: reduce) {
  .base-dialog-enter-active,
  .base-dialog-leave-active,
  .base-dialog-enter-active .base-dialog,
  .base-dialog-leave-active .base-dialog {
    transition: none;
  }
}
</style>
