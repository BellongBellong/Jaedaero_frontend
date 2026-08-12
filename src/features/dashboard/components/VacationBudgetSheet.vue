<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'

import PrimaryButton from '@/common/components/PrimaryButton.vue'

const props = defineProps({
  modelValue: { type: Number, default: null },
})

const emit = defineEmits(['close', 'save'])
const amount = ref('')
const inputElement = ref(null)
const viewportStyle = ref({})
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

@media (prefers-reduced-motion: reduce) {
  .vacation-budget-sheet,
  .vacation-budget-sheet__backdrop {
    animation: none;
  }
}
</style>
