<script setup>
import { computed, ref, watch } from 'vue'

const props = defineProps({
  amount: {
    type: Number,
    default: 0,
  },
  saving: {
    type: Boolean,
    default: false,
  },
  errorMessage: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['close', 'save'])
const amountInput = ref('')

const numericAmount = computed(() => Number(amountInput.value.replaceAll(',', '')) || 0)
const canSave = computed(() => numericAmount.value > 0 && !props.saving)

function formatAmount(value) {
  const digits = String(value ?? '')
    .replace(/\D/g, '')
    .slice(0, 12)
  amountInput.value = digits ? Number(digits).toLocaleString('ko-KR') : ''
}

function handleInput(event) {
  formatAmount(event.target.value)
}

function save() {
  if (canSave.value) emit('save', numericAmount.value)
}

watch(
  () => props.amount,
  (amount) => formatAmount(amount || ''),
  { immediate: true },
)
</script>

<template>
  <div
    class="goal-backdrop"
    @click.self="emit('close')"
  >
    <section
      class="goal-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="goal-modal-title"
    >
      <button
        type="button"
        class="close-button"
        aria-label="목표 금액 변경 닫기"
        @click="emit('close')"
      >
        &times;
      </button>
      <h2 id="goal-modal-title">
        목표금액변경
      </h2>
      <div class="input-row">
        <label>
          <span class="sr-only">새로운 목표 금액</span>
          <input
            :value="amountInput"
            type="text"
            inputmode="numeric"
            maxlength="16"
            placeholder="목표금액설정"
            autofocus
            @input="handleInput"
            @keyup.enter="save"
          >
        </label>
        <button
          type="button"
          class="confirm-button"
          :disabled="!canSave"
          @click="save"
        >
          {{ saving ? '저장 중' : '확인' }}
        </button>
      </div>
      <p :class="{ error: errorMessage }">
        {{ errorMessage || '새로운 목표금액이 생겼나요?' }}
      </p>
    </section>
  </div>
</template>

<style scoped>
.goal-backdrop {
  position: fixed;
  z-index: 30;
  inset: 0;
  display: grid;
  padding: 16px;
  background: rgb(0 0 0 / 48%);
  place-items: center;
}

.goal-modal {
  position: relative;
  width: min(100%, 383px);
  min-height: 208px;
  padding: 31px 15px 24px;
  border-radius: 30px;
  background: #fff;
}

h2 {
  margin: 0 0 26px;
  color: #333;
  font-size: 20px;
  text-align: center;
}

.close-button {
  position: absolute;
  top: 27px;
  right: 29px;
  padding: 0;
  border: 0;
  background: transparent;
  color: #444;
  font-size: 32px;
  line-height: 1;
}

.input-row {
  display: flex;
  gap: 10px;
}

label {
  min-width: 0;
  flex: 1;
}

input {
  width: 100%;
  height: 43px;
  padding: 0 20px;
  border: 1px solid #ddd;
  border-radius: 15px;
  outline: none;
  color: #555;
  font: inherit;
}

input:focus {
  border-color: #58f49a;
}

input::placeholder {
  color: #888;
}

.confirm-button {
  width: 108px;
  height: 43px;
  border: 0;
  border-radius: 15px;
  background: #58f49a;
  color: #555;
  font-weight: 700;
}

.confirm-button:disabled {
  background: #ddd;
  color: #999;
}

p {
  margin: 9px 5px 0;
  color: #aaa;
  font-size: 13px;
}

p.error {
  color: #ff4b4b;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
}
</style>
