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
        aria-label="&#47785;&#54364; &#44552;&#50529; &#48320;&#44221; &#45803;&#44592;"
        @click="emit('close')"
      >
        &times;
      </button>
      <h2 id="goal-modal-title">
        &#47785;&#54364; &#44552;&#50529; &#48320;&#44221;
      </h2>
      <p class="modal-description">
        &#49352;&#47196;&#50868; &#47785;&#54364; &#44552;&#50529;&#51060;
        &#51080;&#51012;&#44620;&#50836;?
      </p>
      <div class="input-row">
        <label>
          <span class="sr-only">&#49352;&#47196;&#50868; &#47785;&#54364; &#44552;&#50529;</span>
          <input
            :value="amountInput"
            type="text"
            inputmode="numeric"
            maxlength="16"
            placeholder="&#49352;&#47196;&#50868; &#47785;&#54364; &#44552;&#50529;"
            autofocus
            @input="handleInput"
            @keyup.enter="save"
          >
        </label>
      </div>
      <p
        v-if="errorMessage"
        class="error-message"
      >
        {{ errorMessage }}
      </p>
      <button
        type="button"
        class="confirm-button"
        :disabled="!canSave"
        @click="save"
      >
        {{ saving ? '\uC800\uC7A5 \uC911' : '\uBCC0\uACBD' }}
      </button>
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
  display: flex;
  flex-direction: column;
  width: min(100%, 383px);
  min-height: min(497px, calc(100dvh - 32px));
  padding: 32px 15px 28px;
  border-radius: 30px;
  background: #fff;
}

h2 {
  margin: 0;
  color: #333;
  font-size: 20px;
  font-weight: 700;
  text-align: center;
}

.close-button {
  position: absolute;
  top: 30px;
  right: 31px;
  padding: 0;
  border: 0;
  background: transparent;
  color: #444;
  font-size: 32px;
  line-height: 1;
}

.modal-description {
  margin: 57px 15px 0;
  color: #333;
  font-size: 16px;
}

.input-row {
  margin-top: 16px;
}

label {
  display: block;
}

input {
  width: 100%;
  height: 44px;
  padding: 0 21px;
  border: 1px solid #e1e1e1;
  border-radius: 15px;
  outline: none;
  color: #555;
  font: inherit;
}

input:focus {
  border-color: #58f49a;
}

input::placeholder {
  color: #777;
}

.error-message {
  margin: 8px 15px 0;
  color: #ff4b4b;
  font-size: 13px;
}

.confirm-button {
  width: 100%;
  height: 56px;
  margin-top: auto;
  border: 0;
  border-radius: 28px;
  background: #58f49a;
  color: #252525;
  font-size: 16px;
  font-weight: 700;
}

.confirm-button:disabled {
  background: #58f49a;
  color: #252525;
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
