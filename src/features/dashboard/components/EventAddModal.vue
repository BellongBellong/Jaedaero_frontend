<script setup>
import { computed, ref } from 'vue'

const emit = defineEmits(['close', 'save'])
const title = ref('')
const date = ref('')
const canSave = computed(() => title.value.trim().length > 0 && Boolean(date.value))

function save() {
  if (!canSave.value) return

  emit('save', {
    title: title.value.trim(),
    date: date.value,
  })
}
</script>

<template>
  <div
    class="event-modal-backdrop"
    @click.self="emit('close')"
  >
    <section
      class="event-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="event-modal-title"
    >
      <button
        class="event-modal__close"
        type="button"
        aria-label="이벤트 추가 닫기"
        @click="emit('close')"
      >
        &times;
      </button>

      <h2 id="event-modal-title">
        이벤트 추가
      </h2>

      <label>
        <span>이벤트명</span>
        <input
          v-model="title"
          type="text"
          maxlength="20"
          placeholder="예: 연가"
          autofocus
        >
      </label>

      <label>
        <span>예정일</span>
        <input
          v-model="date"
          type="date"
        >
      </label>

      <button
        class="event-modal__save"
        type="button"
        :disabled="!canSave"
        @click="save"
      >
        추가하기
      </button>
    </section>
  </div>
</template>

<style scoped>
.event-modal-backdrop {
  position: fixed;
  z-index: 40;
  inset: 0;
  display: grid;
  padding: 20px;
  background: rgb(0 0 0 / 45%);
  place-items: center;
}

.event-modal {
  position: relative;
  display: grid;
  width: min(100%, 345px);
  gap: 16px;
  padding: 28px 24px 24px;
  border-radius: 28px;
  background: var(--white);
  box-shadow: 0 20px 50px rgb(0 0 0 / 18%);
}

.event-modal h2 {
  margin: 0 0 4px;
  color: var(--gray-900);
  font-size: 20px;
  text-align: center;
}

.event-modal__close {
  position: absolute;
  top: 20px;
  right: 22px;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--gray-600);
  cursor: pointer;
  font-size: 30px;
  line-height: 1;
}

.event-modal label {
  display: grid;
  gap: 7px;
  color: var(--gray-700);
  font-size: 13px;
  font-weight: var(--weight-bold);
}

.event-modal input {
  width: 100%;
  height: 46px;
  padding: 0 14px;
  border: 1px solid var(--gray-300);
  border-radius: 14px;
  outline: none;
  color: var(--gray-900);
  background: var(--gray-50);
}

.event-modal input:focus {
  border-color: var(--green-600);
}

.event-modal__save {
  height: 46px;
  margin-top: 4px;
  border: 0;
  border-radius: 14px;
  background: var(--green-600);
  color: var(--white);
  cursor: pointer;
  font-weight: var(--weight-bold);
}

.event-modal__save:disabled {
  background: var(--gray-300);
  cursor: default;
}
</style>
