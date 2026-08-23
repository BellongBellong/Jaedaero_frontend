<script setup>
import { computed, getCurrentInstance, onBeforeUnmount, ref, watch } from 'vue'

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
  closeOnSwipe: {
    type: Boolean,
    default: true,
  },
  showClose: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue', 'close'])

const instance = getCurrentInstance()
const titleId = `bottom-sheet-title-${instance?.uid ?? 'default'}`
const captionId = `bottom-sheet-caption-${instance?.uid ?? 'default'}`

const isDragging = ref(false)
const dragOffset = ref(0)
const dragStartY = ref(0)
const previousBodyOverflow = ref('')

const sheetStyle = computed(() =>
  dragOffset.value ? { transform: `translateY(${dragOffset.value}px)` } : undefined,
)

function close(reason = 'close') {
  resetDrag()
  emit('update:modelValue', false)
  emit('close', reason)
}

function closeByBackdrop() {
  if (props.closeOnBackdrop) close('backdrop')
}

function handleKeydown(event) {
  if (event.key === 'Escape') close('escape')
}

function startDrag(event) {
  if (!props.closeOnSwipe || (event.pointerType === 'mouse' && event.button !== 0)) return

  isDragging.value = true
  dragStartY.value = event.clientY
  dragOffset.value = 0
  event.currentTarget?.setPointerCapture?.(event.pointerId)
}

function moveDrag(event) {
  if (!isDragging.value) return

  dragOffset.value = Math.max(0, event.clientY - dragStartY.value)
}

function endDrag() {
  if (!isDragging.value) return

  const shouldClose = dragOffset.value >= 96
  if (shouldClose) {
    close('swipe')
    return
  }

  isDragging.value = false
  dragOffset.value = 0
}

function cancelDrag() {
  if (!isDragging.value) return

  isDragging.value = false
  dragOffset.value = 0
}

function resetDrag() {
  isDragging.value = false
  dragOffset.value = 0
}

function lockBodyScroll() {
  previousBodyOverflow.value = document.body.style.overflow
  document.body.style.overflow = 'hidden'
  document.addEventListener('keydown', handleKeydown)
}

function unlockBodyScroll() {
  document.body.style.overflow = previousBodyOverflow.value
  document.removeEventListener('keydown', handleKeydown)
  resetDrag()
}

watch(
  () => props.modelValue,
  (isOpen) => {
    if (isOpen) {
      lockBodyScroll()
    } else {
      unlockBodyScroll()
    }
  },
  { immediate: true },
)

onBeforeUnmount(unlockBodyScroll)
</script>

<template>
  <Teleport to="body">
    <Transition name="bottom-sheet">
      <div
        v-if="modelValue"
        class="bottom-sheet-backdrop"
        @click.self="closeByBackdrop"
      >
        <section
          class="bottom-sheet"
          :class="{ 'bottom-sheet--dragging': isDragging }"
          :style="sheetStyle"
          role="dialog"
          aria-modal="true"
          :aria-labelledby="title ? titleId : undefined"
          :aria-describedby="caption ? captionId : undefined"
        >
          <div
            class="bottom-sheet__handle-area"
            role="button"
            tabindex="0"
            aria-label="아래로 밀어 닫기"
            @pointerdown="startDrag"
            @pointermove="moveDrag"
            @pointerup="endDrag"
            @pointercancel="cancelDrag"
            @keydown.enter="close('handle')"
            @keydown.space.prevent="close('handle')"
          >
            <span class="bottom-sheet__handle" />
          </div>

          <button
            v-if="showClose"
            type="button"
            class="bottom-sheet__close"
            aria-label="닫기"
            @click="close('button')"
          >
            ×
          </button>

          <header
            v-if="title || caption || $slots.header"
            class="bottom-sheet__header"
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

          <div class="bottom-sheet__content">
            <slot />
          </div>

          <footer
            v-if="$slots.footer"
            class="bottom-sheet__footer"
          >
            <slot name="footer" />
          </footer>
        </section>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.bottom-sheet-backdrop {
  position: fixed;
  z-index: var(--z-modal, 900);
  inset: 0;
  display: flex;
  width: 100%;
  max-width: var(--design-mobile-width, 393px);
  align-items: flex-end;
  margin: 0 auto;
  background: rgb(0 0 0 / 42%);
}

.bottom-sheet {
  position: relative;
  display: flex;
  width: 100%;
  max-height: calc(100dvh - 24px);
  flex-direction: column;
  overflow: hidden;
  border-radius: 36px 36px 0 0;
  background: #fff;
  color: var(--ui-text, #333);
  transition: transform var(--duration-slow, 350ms) var(--ease-default, ease);
}

.bottom-sheet--dragging {
  transition: none;
}

.bottom-sheet__handle-area {
  display: grid;
  height: 48px;
  flex: 0 0 48px;
  place-items: center;
  touch-action: none;
  cursor: grab;
}

.bottom-sheet__handle-area:active {
  cursor: grabbing;
}

.bottom-sheet__handle {
  width: 56px;
  height: 6px;
  border-radius: 999px;
  background: #e9e9e9;
}

.bottom-sheet__close {
  position: absolute;
  top: 18px;
  right: 20px;
  padding: 0;
  color: var(--ui-text, #333);
  font-size: 28px;
  line-height: 1;
}

.bottom-sheet__header {
  padding: 0 24px 24px;
}

.bottom-sheet__header h2 {
  margin: 0;
  color: var(--ui-text, #333);
  font-size: 28px;
  font-weight: 700;
  line-height: 1.3;
  word-break: keep-all;
}

.bottom-sheet__header p {
  margin: 8px 0 0;
  color: var(--ui-sub-title, #999);
  font-size: 20px;
  line-height: 1.4;
  word-break: keep-all;
}

.bottom-sheet__content {
  min-height: 0;
  padding: 0 24px;
  overflow-y: auto;
  overscroll-behavior: contain;
}

.bottom-sheet__footer {
  flex: 0 0 auto;
  padding: 24px 24px calc(24px + var(--safe-area-bottom, 0px));
}

.bottom-sheet-enter-active,
.bottom-sheet-leave-active {
  transition: opacity var(--duration-normal, 250ms) ease;
}

.bottom-sheet-enter-active .bottom-sheet,
.bottom-sheet-leave-active .bottom-sheet {
  transition: transform var(--duration-slow, 350ms) var(--ease-default, ease);
}

.bottom-sheet-enter-from,
.bottom-sheet-leave-to {
  opacity: 0;
}

.bottom-sheet-enter-from .bottom-sheet,
.bottom-sheet-leave-to .bottom-sheet {
  transform: translateY(100%);
}

@media (prefers-reduced-motion: reduce) {
  .bottom-sheet-enter-active,
  .bottom-sheet-leave-active,
  .bottom-sheet-enter-active .bottom-sheet,
  .bottom-sheet-leave-active .bottom-sheet {
    transition: none;
  }
}
</style>
