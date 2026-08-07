<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'

import SelectionOptionButton from '@/common/components/common/SelectionOptionButton.vue'

defineProps({
  modelValue: {
    type: String,
    default: 'ALL',
  },
  options: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['update:modelValue', 'close'])
const dragOffset = ref(0)
const dragStart = ref(0)
const dragging = ref(false)

function selectOption(value) {
  emit('update:modelValue', value)
  emit('close')
}

function startDrag(event) {
  dragging.value = true
  dragStart.value = event.clientY
  event.currentTarget.setPointerCapture(event.pointerId)
}

function moveDrag(event) {
  if (!dragging.value) return
  dragOffset.value = Math.max(0, event.clientY - dragStart.value)
}

function endDrag(event) {
  if (!dragging.value) return
  dragging.value = false
  event.currentTarget.releasePointerCapture(event.pointerId)
  if (dragOffset.value >= 70) emit('close')
  else dragOffset.value = 0
}

function closeOnEscape(event) {
  if (event.key === 'Escape') emit('close')
}

onMounted(() => {
  document.body.style.overflow = 'hidden'
  window.addEventListener('keydown', closeOnEscape)
})

onBeforeUnmount(() => {
  document.body.style.overflow = ''
  window.removeEventListener('keydown', closeOnEscape)
})
</script>

<template>
  <div
    class="transaction-filter-backdrop"
    @click.self="$emit('close')"
  >
    <section
      class="transaction-filter-sheet"
      :class="{ 'transaction-filter-sheet--dragging': dragging }"
      :style="{ transform: `translateY(${dragOffset}px)` }"
      role="dialog"
      aria-modal="true"
      aria-labelledby="transaction-filter-title"
    >
      <div
        class="transaction-filter-sheet__handle"
        aria-label="아래로 밀어 필터 닫기"
        @pointerdown="startDrag"
        @pointermove="moveDrag"
        @pointerup="endDrag"
        @pointercancel="endDrag"
      >
        <span />
      </div>
      <div class="transaction-filter-sheet__body">
        <h2 id="transaction-filter-title">
          내역 선택
        </h2>
        <div
          class="transaction-filter-sheet__options"
          role="listbox"
          aria-label="거래내역 필터"
        >
          <SelectionOptionButton
            v-for="option in options"
            :key="option.value"
            :label="option.label"
            :selected="modelValue === option.value"
            @select="selectOption(option.value)"
          />
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.transaction-filter-backdrop {
  position: fixed;
  z-index: 80;
  inset: 0 max(0px, calc((100vw - var(--mobile-width)) / 2));
  display: flex;
  align-items: flex-end;
  background: rgb(0 0 0 / 45%);
  animation: transaction-filter-fade 220ms ease-out both;
}

.transaction-filter-sheet {
  width: 100%;
  padding-top: 12px;
  overflow: hidden;
  border-radius: 50px 50px 0 0;
  background: var(--white);
  transition: transform 220ms ease-out;
  animation: transaction-filter-up 260ms ease-out both;
}

.transaction-filter-sheet--dragging {
  transition: none;
}

.transaction-filter-sheet__handle {
  display: grid;
  height: 28px;
  cursor: grab;
  touch-action: none;
  place-items: start center;
}

.transaction-filter-sheet__handle span {
  width: 36px;
  height: 5px;
  border-radius: 100px;
  background: var(--gray-200);
}

.transaction-filter-sheet__body {
  display: grid;
  gap: 12px;
  padding: 0 20px 28px;
}

.transaction-filter-sheet h2 {
  margin: 0;
  color: var(--gray-900);
  font-size: 20px;
  line-height: 1.5;
}

.transaction-filter-sheet__options {
  display: grid;
}

@keyframes transaction-filter-up {
  from {
    transform: translateY(100%);
  }
}

@keyframes transaction-filter-fade {
  from {
    opacity: 0;
  }
}
</style>
