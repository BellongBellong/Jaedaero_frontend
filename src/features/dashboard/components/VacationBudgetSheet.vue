<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'

import PrimaryButton from '@/common/components/PrimaryButton.vue'

const props = defineProps({
  modelValue: { type: Number, default: null },
})

const emit = defineEmits(['close', 'save', 'delete'])
const amount = ref('')
const inputElement = ref(null)
const viewportStyle = ref({})
const showDeleteConfirm = ref(false)
let viewportFrame

function numericAmount(value = amount.value) {
  const number = Number(value)
  return Number.isFinite(number) ? number : 0
}

const formattedAmount = computed({
  get() {
    const value = numericAmount()
    return value > 0 ? value.toLocaleString('ko-KR') : ''
  },
  set(value) {
    amount.value = String(value)
      .replace(/[^0-9]/g, '')
      .replace(/^0+(?=\d)/, '')
  },
})

const canSubmit = computed(() => {
  const value = numericAmount()
  return value > 0 && (props.modelValue === null || value !== props.modelValue)
})

function updateViewportPosition() {
  window.cancelAnimationFrame(viewportFrame)
  viewportFrame = window.requestAnimationFrame(() => {
    const viewport = window.visualViewport
    if (!viewport) {
      viewportStyle.value = {}
      return
    }

    viewportStyle.value = {
      top: `${viewport.offsetTop}px`,
      bottom: 'auto',
      height: `${viewport.height}px`,
    }
  })
}

onMounted(() => {
  updateViewportPosition()
  window.visualViewport?.addEventListener('resize', updateViewportPosition)
  window.visualViewport?.addEventListener('scroll', updateViewportPosition)
  window.addEventListener('resize', updateViewportPosition)
})

onBeforeUnmount(() => {
  window.cancelAnimationFrame(viewportFrame)
  window.visualViewport?.removeEventListener('resize', updateViewportPosition)
  window.visualViewport?.removeEventListener('scroll', updateViewportPosition)
  window.removeEventListener('resize', updateViewportPosition)
})

watch(
  () => props.modelValue,
  async (value) => {
    amount.value = value === null ? '' : String(value)
    await nextTick()
    inputElement.value?.focus()
  },
  { immediate: true },
)

function submit() {
  if (!canSubmit.value) return
  emit('save', numericAmount())
}

function openDeleteConfirm() {
  inputElement.value?.blur()
  showDeleteConfirm.value = true
}

function deleteBudget() {
  emit('delete')
  showDeleteConfirm.value = false
}
</script>

<template>
  <div
    class="vacation-budget-sheet__backdrop"
    :style="viewportStyle"
    role="presentation"
    @click.self="$emit('close')"
  >
    <section
      class="vacation-budget-sheet"
      role="dialog"
      aria-modal="true"
      aria-labelledby="budget-sheet-title"
    >
      <div class="vacation-budget-sheet__handle" />
      <div class="vacation-budget-sheet__content">
        <header>
          <h2 id="budget-sheet-title">
            휴가 예산 변경
          </h2>
          <p>휴가 기간 동안 사용할 금액을 입력해주세요</p>
        </header>

        <p
          v-if="modelValue !== null"
          class="vacation-budget-sheet__current"
        >
          현재 설정한 금액 : {{ modelValue.toLocaleString('ko-KR') }}원
        </p>

        <span class="vacation-budget-sheet__input">
          <input
            ref="inputElement"
            v-model="formattedAmount"
            type="text"
            inputmode="numeric"
            pattern="[0-9]*"
            autocomplete="off"
            placeholder="예) 100,000원"
            aria-label="휴가 예산 금액"
            @keyup.enter="submit"
          >
          <strong v-if="numericAmount() > 0">원</strong>
        </span>

        <button
          v-if="modelValue !== null"
          class="vacation-budget-sheet__delete"
          type="button"
          @click="openDeleteConfirm"
        >
          예산 삭제 하기
        </button>
      </div>

      <div class="vacation-budget-sheet__actions">
        <PrimaryButton
          variant="green"
          shape="square"
          :disabled="!canSubmit"
          @click="submit"
        >
          변경하기
        </PrimaryButton>
      </div>
    </section>

    <div
      v-if="showDeleteConfirm"
      class="vacation-budget-sheet__confirm-backdrop"
      @click.self="showDeleteConfirm = false"
    >
      <section
        class="vacation-budget-sheet__confirm"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="vacation-budget-delete-title"
      >
        <h3 id="vacation-budget-delete-title">
          예산을 삭제하시겠습니까?
        </h3>
        <p>삭제한 휴가 예산은 다시 복구할 수 없어요.</p>
        <div>
          <button
            type="button"
            @click="showDeleteConfirm = false"
          >
            취소
          </button>
          <button
            class="vacation-budget-sheet__confirm-delete"
            type="button"
            @click="deleteBudget"
          >
            삭제
          </button>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.vacation-budget-sheet__backdrop {
  position: fixed;
  z-index: 100;
  inset: 0;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  background: rgb(24 31 27 / 36%);
  animation: vacation-budget-backdrop-enter 240ms ease-out both;
}
.vacation-budget-sheet {
  width: min(100%, 430px);
  overflow: hidden;
  padding: 20px 0 0;
  border-radius: 50px 50px 0 0;
  background: var(--white);
  box-shadow: 0 -12px 36px rgb(39 69 53 / 14%);
  animation: vacation-budget-sheet-enter 300ms cubic-bezier(0.22, 1, 0.36, 1) both;
}
.vacation-budget-sheet__handle {
  width: 36px;
  height: 5px;
  margin: 0 auto 20px;
  border-radius: 100px;
  background: var(--ui-light-gray, #ececec);
}
.vacation-budget-sheet__content {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 0 20px;
}
.vacation-budget-sheet header {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.vacation-budget-sheet h2 {
  margin: 0;
  color: var(--gray-900, #333);
  font-size: 24px;
  font-weight: var(--weight-bold);
  line-height: 1.5;
}
.vacation-budget-sheet header p,
.vacation-budget-sheet__current {
  margin: 0;
  color: var(--gray-600, #757575);
  font-size: 16px;
  letter-spacing: -0.04em;
  line-height: 1.5;
}
.vacation-budget-sheet__input {
  display: flex;
  height: 56px;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  border-radius: 20px;
  background: var(--gray-100, #f5f5f5);
}
.vacation-budget-sheet__input input {
  min-width: 0;
  flex: 1;
  border: 0;
  outline: 0;
  background: transparent;
  caret-color: var(--blue-800, #009dff);
  color: var(--ui-sub-title, #757575);
  font: inherit;
  font-size: 16px;
  font-weight: var(--weight-bold);
  letter-spacing: -0.02em;
  line-height: 1.5;
}
.vacation-budget-sheet__input input::placeholder {
  color: var(--ui-sub-title-light, #bdbdbd);
  opacity: 1;
}
.vacation-budget-sheet__input strong {
  color: var(--gray-700, #616161);
  font-size: 14px;
  line-height: 1.5;
}
.vacation-budget-sheet__delete {
  align-self: center;
  padding: 2px 0;
  border: 0;
  border-bottom: 1px solid currentcolor;
  background: transparent;
  color: var(--gray-600, #757575);
  cursor: pointer;
  font: inherit;
  font-size: 13px;
  line-height: 1.4;
}
.vacation-budget-sheet__actions {
  display: flex;
  margin-top: 20px;
}
.vacation-budget-sheet__actions :deep(.primary-button) {
  min-height: 56px;
  font-size: 18px;
  letter-spacing: -0.04em;
  line-height: 1.5;
}

.vacation-budget-sheet__confirm-backdrop {
  position: absolute;
  z-index: 2;
  inset: 0;
  display: grid;
  padding: 24px;
  background: rgb(24 31 27 / 42%);
  place-items: center;
  animation: vacation-budget-backdrop-enter 180ms ease-out both;
}
.vacation-budget-sheet__confirm {
  width: min(100%, 320px);
  padding: 24px 20px 18px;
  border-radius: 22px;
  background: var(--white);
  box-shadow: 0 18px 48px rgb(24 31 27 / 22%);
  text-align: center;
  animation: vacation-budget-confirm-enter 200ms ease-out both;
}
.vacation-budget-sheet__confirm h3 {
  margin: 0;
  color: var(--gray-900, #333);
  font-size: 18px;
  line-height: 1.5;
}
.vacation-budget-sheet__confirm p {
  margin: 6px 0 20px;
  color: var(--gray-600, #757575);
  font-size: 13px;
  line-height: 1.5;
}
.vacation-budget-sheet__confirm > div {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}
.vacation-budget-sheet__confirm button {
  height: 46px;
  border: 0;
  border-radius: 14px;
  background: var(--gray-100, #f5f5f5);
  color: var(--gray-700, #616161);
  cursor: pointer;
  font: inherit;
  font-weight: var(--weight-bold);
}
.vacation-budget-sheet__confirm .vacation-budget-sheet__confirm-delete {
  background: var(--orange-50, #fff7f3);
  color: var(--orange-600, #e37255);
}

@keyframes vacation-budget-sheet-enter {
  from {
    opacity: 0;
    transform: translateY(100%);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes vacation-budget-backdrop-enter {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes vacation-budget-confirm-enter {
  from {
    opacity: 0;
    transform: scale(0.94);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@media (prefers-reduced-motion: reduce) {
  .vacation-budget-sheet,
  .vacation-budget-sheet__backdrop {
    animation: none;
  }
}
</style>
