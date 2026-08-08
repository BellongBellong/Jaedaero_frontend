<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'

import TransactionCategorySummary from '@/features/transactions/components/TransactionCategorySummary.vue'
import {
  transactionCategoryIcon,
  transactionCategoryOptions,
} from '@/features/transactions/composables/transactionCategoryIconMapping'

const props = defineProps({
  category: {
    type: String,
    default: 'ETC',
  },
  merchantName: {
    type: String,
    default: '-',
  },
})

const emit = defineEmits(['close', 'confirm'])
const selectedCategory = ref(
  ['', 'UNCLASSIFIED'].includes(String(props.category || '').toUpperCase())
    ? 'ETC'
    : String(props.category).toUpperCase(),
)
const dragStart = ref(0)
const dragOffset = ref(0)
const dragging = ref(false)

function startDrag(event) {
  dragging.value = true
  dragStart.value = event.clientY
  event.currentTarget.setPointerCapture(event.pointerId)
}

function moveDrag(event) {
  if (dragging.value) dragOffset.value = Math.max(0, event.clientY - dragStart.value)
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
    class="category-sheet-backdrop"
    @click.self="$emit('close')"
  >
    <section
      class="category-sheet"
      :class="{ 'category-sheet--dragging': dragging }"
      :style="{ transform: `translateY(${dragOffset}px)` }"
      role="dialog"
      aria-modal="true"
      aria-labelledby="category-sheet-title"
    >
      <div
        class="category-sheet__handle"
        aria-label="아래로 밀어 카테고리 변경 닫기"
        @pointerdown="startDrag"
        @pointermove="moveDrag"
        @pointerup="endDrag"
        @pointercancel="endDrag"
      >
        <span />
      </div>

      <div class="category-sheet__body">
        <h2 id="category-sheet-title">
          카테고리 변경
        </h2>

        <TransactionCategorySummary
          :category="selectedCategory"
          :merchant-name="merchantName"
        />

        <div class="category-sheet__grid">
          <button
            v-for="option in transactionCategoryOptions"
            :key="option.value"
            type="button"
            :class="{ 'category-sheet__option--selected': selectedCategory === option.value }"
            @click="selectedCategory = option.value"
          >
            <img
              :src="transactionCategoryIcon(option.value)"
              alt=""
              aria-hidden="true"
            >
            <span>{{ option.label }}</span>
          </button>
        </div>

        <div class="category-sheet__actions">
          <button
            type="button"
            @click="$emit('close')"
          >
            취소
          </button>
          <button
            type="button"
            @click="$emit('confirm', selectedCategory)"
          >
            변경하기
          </button>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.category-sheet-backdrop {
  position: fixed;
  z-index: 85;
  inset: 0 max(0px, calc((100vw - var(--mobile-width)) / 2));
  display: flex;
  align-items: flex-end;
  background: rgb(0 0 0 / 45%);
}

.category-sheet {
  width: 100%;
  max-height: min(90dvh, 760px);
  overflow: auto;
  border-radius: 50px 50px 0 0;
  background: var(--white);
  transition: transform 220ms ease-out;
  animation: category-sheet-up 260ms ease-out both;
}

.category-sheet--dragging {
  transition: none;
}

.category-sheet__handle {
  display: grid;
  height: 48px;
  cursor: grab;
  touch-action: none;
  place-items: center;
}

.category-sheet__handle span {
  width: 36px;
  height: 5px;
  border-radius: 100px;
  background: var(--gray-200);
}

.category-sheet__body {
  display: grid;
  gap: 20px;
  padding: 0 20px 32px;
}

.category-sheet h2 {
  margin: 0;
  color: var(--gray-900);
  font-size: 24px;
  line-height: 1.5;
}

.category-sheet__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px 18px;
}

.category-sheet__grid button {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 9px;
  padding: 4px;
  border: 1px solid transparent;
  border-radius: 12px;
  background: transparent;
  color: var(--gray-600);
  cursor: pointer;
  font-family: var(--font-body);
  font-size: 14px;
  font-weight: var(--weight-bold);
  text-align: left;
}

.category-sheet__grid .category-sheet__option--selected {
  border-color: rgb(32 186 92 / 30%);
  background: var(--green-100);
  color: var(--green-700);
}

.category-sheet__grid img {
  width: 44px;
  height: 44px;
  flex: 0 0 auto;
  object-fit: contain;
}

.category-sheet__actions {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 14px;
  margin-top: 8px;
}

.category-sheet__actions button {
  height: 56px;
  border: 0;
  border-radius: 28px;
  background: var(--gray-200);
  color: var(--gray-400);
  cursor: pointer;
  font-family: var(--font-body);
  font-size: 18px;
  font-weight: var(--weight-bold);
}

.category-sheet__actions button:last-child {
  background: var(--green-300, #62ff9c);
  color: var(--gray-900);
}

@keyframes category-sheet-up {
  from {
    transform: translateY(100%);
  }
}
</style>
