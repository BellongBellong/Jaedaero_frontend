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
const MAX_GOAL_AMOUNT = 100_000_000

const numericAmount = computed(() =>
  Math.min(Number(amountInput.value.replaceAll(',', '')) || 0, MAX_GOAL_AMOUNT),
)
const canSave = computed(() => numericAmount.value > 0 && !props.saving)

function formatAmount(value) {
  const digits = String(value ?? '')
    .replace(/\D/g, '')
    .slice(0, 9)
  const amount = Math.min(Number(digits) || 0, MAX_GOAL_AMOUNT)
  amountInput.value = amount ? amount.toLocaleString('ko-KR') : ''
}

function handleInput(event) {
  formatAmount(event.target.value)
  event.target.value = amountInput.value
}

function handleCompositionEnd(event) {
  formatAmount(event.target.value)
  event.target.value = amountInput.value
}

function preventNonNumericKey(event) {
  if (event.ctrlKey || event.metaKey) return
  if (event.key === 'Process' || (event.key.length === 1 && !/[0-9]/.test(event.key))) {
    event.preventDefault()
  }
}

function preventNonNumericInput(event) {
  if (event.inputType.startsWith('insert') && event.data && /\D/.test(event.data)) {
    event.preventDefault()
  }
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
        &#49352;&#47196;&#50868; &#47785;&#54364; &#44552;&#50529;&#51012;
        &#51077;&#47141;&#54644;&#51452;&#49464;&#50836;.
      </p>
      <div class="input-row">
        <label class="amount-field">
          <span class="sr-only">&#49352;&#47196;&#50868; &#47785;&#54364; &#44552;&#50529;</span>
          <input
            :value="amountInput"
            type="text"
            inputmode="numeric"
            maxlength="11"
            pattern="[0-9,]*"
            placeholder="&#49352;&#47196;&#50868; &#47785;&#54364; &#44552;&#50529;"
            autofocus
            @keydown="preventNonNumericKey"
            @beforeinput="preventNonNumericInput"
            @compositionend="handleCompositionEnd"
            @input="handleInput"
            @keyup.enter="save"
          >
          <span class="currency">&#50896;</span>
        </label>
      </div>
      <p class="limit-copy">
        &#52572;&#45824; 1&#50613;&#50896;&#44620;&#51648; &#49444;&#51221;&#54624; &#49688;
        &#51080;&#50612;&#50836;
      </p>
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
  display: flex;
  align-items: flex-end;
  justify-content: center;
  background: rgb(0 0 0 / 42%);
}

.goal-modal {
  position: relative;
  display: flex;
  flex-direction: column;
  width: min(100%, 393px);
  padding: 24px 20px calc(16px + var(--safe-area-bottom));
  border-radius: 28px 28px 0 0;
  background: #fff;
  box-shadow: 0 -8px 30px rgb(0 0 0 / 8%);
}

:global(.goal-sheet-enter-active),
:global(.goal-sheet-leave-active) {
  transition: opacity 320ms ease;
}

:global(.goal-sheet-enter-from),
:global(.goal-sheet-leave-to) {
  opacity: 0;
}

:global(.goal-sheet-enter-active) .goal-modal,
:global(.goal-sheet-leave-active) .goal-modal {
  transition: transform 380ms cubic-bezier(0.22, 1, 0.36, 1);
}

:global(.goal-sheet-enter-from) .goal-modal,
:global(.goal-sheet-leave-to) .goal-modal {
  transform: translateY(100%);
}

@media (prefers-reduced-motion: reduce) {
  :global(.goal-sheet-enter-active),
  :global(.goal-sheet-leave-active),
  :global(.goal-sheet-enter-active) .goal-modal,
  :global(.goal-sheet-leave-active) .goal-modal {
    transition: none;
  }
}

h2 {
  margin: 0;
  color: #191f28;
  font-size: 20px;
  font-weight: 700;
}

.close-button {
  position: absolute;
  top: 20px;
  right: 20px;
  padding: 0;
  border: 0;
  background: transparent;
  color: #8b95a1;
  font-size: 26px;
  line-height: 1;
}

.modal-description {
  margin: 8px 0 0;
  color: #6b7684;
  font-size: 15px;
}

.input-row {
  margin-top: 24px;
}

.amount-field {
  display: flex;
  align-items: center;
  border: 2px solid transparent;
  border-radius: 16px;
  background: #f5f6f7;
  transition:
    border-color 160ms ease,
    background 160ms ease;
}

.amount-field:focus-within {
  border-color: #58f49a;
  background: #fff;
}

input {
  width: 100%;
  height: 64px;
  min-width: 0;
  padding: 0 4px 0 16px;
  border: 0;
  background: transparent;
  outline: none;
  color: #191f28;
  font-size: 28px;
  font-weight: 700;
  text-align: right;
}

.currency {
  flex: 0 0 auto;
  padding-right: 16px;
  color: #6b7684;
  font-size: 20px;
  font-weight: 700;
}

input::placeholder {
  color: #b0b8c1;
  font-size: 16px;
  font-weight: 400;
}

.limit-copy {
  margin: 8px 2px 0;
  color: #8b95a1;
  font-size: 12px;
}

.error-message {
  margin: 8px 2px 0;
  color: #ff4b4b;
  font-size: 13px;
}

.confirm-button {
  width: 100%;
  height: 52px;
  margin-top: 24px;
  border: 0;
  border-radius: 16px;
  background: #58f49a;
  color: #252525;
  font-size: 16px;
  font-weight: 700;
}

.confirm-button:disabled {
  background: #e9ecef;
  color: #a4a7ad;
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
