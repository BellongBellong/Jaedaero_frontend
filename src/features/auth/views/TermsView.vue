<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

import PrimaryButton from '../../../common/components/buttons/PrimaryButton.vue'
import { getApiErrorMessage } from '@/common/api/errorMessage'
import { useOnboardingStore } from '@/features/onboarding/stores/onboarding.store'

const router = useRouter()
const onboarding = useOnboardingStore()
const terms = [
  { id: 'service', label: '서비스 이용약관', required: true },
  { id: 'privacy', label: '개인정보 수집·이용 동의', required: true },
  { id: 'finance', label: '금융정보 조회 동의', required: true },
  { id: 'ai', label: 'AI 서비스 이용약관', required: true },
]
const termIds = terms.map((term) => term.id)
const checked = ref(onboarding.form.agreements.filter((id) => termIds.includes(id)))
const loading = ref(false)
const errorMessage = ref('')
const isOpen = ref(false)
const allChecked = computed(() => terms.every((term) => checked.value.includes(term.id)))
const requiredChecked = computed(() =>
  terms.filter((term) => term.required).every((term) => checked.value.includes(term.id)),
)

function toggleAll() {
  checked.value = allChecked.value ? [] : terms.map((term) => term.id)
}

function close() {
  if (!loading.value) isOpen.value = false
}

function handleAfterLeave() {
  router.back()
}

onMounted(() => {
  isOpen.value = true
})

async function submit() {
  if (!requiredChecked.value || loading.value) return

  loading.value = true
  errorMessage.value = ''
  try {
    await onboarding.saveAgreements(checked.value)
    router.push({ name: 'onboarding-intro' })
  } catch (error) {
    errorMessage.value = getApiErrorMessage(
      error,
      '약관 동의를 저장하지 못했어요. 잠시 후 다시 시도해 주세요.',
      'terms',
    )
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <Transition
    name="terms-sheet"
    @after-leave="handleAfterLeave"
  >
    <div
      v-if="isOpen"
      class="terms-backdrop"
      @click.self="close"
    >
      <main class="terms">
        <button
          class="close-button"
          aria-label="닫기"
          @click="close"
        >
          ×
        </button>
        <h1>서비스 이용약관</h1>
        <p>제대로 서비스 이용을 위해 약관에 동의해 주세요</p>
        <button
          class="all-check"
          type="button"
          @click="toggleAll"
        >
          약관 전체 동의<span :class="{ checked: allChecked }">✓</span>
        </button>
        <div class="term-list">
          <label
            v-for="term in terms"
            :key="term.id"
          >
            <input
              v-model="checked"
              type="checkbox"
              :value="term.id"
            >
            <span>{{ term.label }} ({{ term.required ? '필수' : '선택' }})</span>
            <b :class="{ checked: checked.includes(term.id) }">✓</b>
          </label>
        </div>
        <PrimaryButton
          :disabled="!requiredChecked"
          :loading="loading"
          @click="submit"
        >
          동의하고 시작하기
        </PrimaryButton>
        <p
          v-if="errorMessage"
          class="form-error"
        >
          {{ errorMessage }}
        </p>
      </main>
    </div>
  </Transition>
</template>

<style scoped>
.terms-backdrop {
  position: fixed;
  z-index: 100;
  display: flex;
  align-items: end;
  justify-content: center;
  background: rgb(0 0 0 / 58%);
  inset: 0;
}
.terms {
  position: relative;
  display: flex;
  width: min(100%, 393px);
  min-height: min(86dvh, 730px);
  flex-direction: column;
  padding: 74px 16px 40px;
  border-radius: 32px 32px 0 0;
  background: #fff;
}
h1 {
  margin: 0 20px 9px;
  font-size: 24px;
  line-height: 1.5;
}
p {
  margin: 0 20px 29px;
  color: #aaa;
  font-size: 14px;
  line-height: 1.5;
}
.close-button {
  position: absolute;
  top: 39px;
  right: 34px;
  border: 0;
  background: transparent;
  color: #555;
  font-size: 32px;
  line-height: 1;
}
.all-check {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 56px;
  padding: 0 20px;
  border: 0;
  border-radius: 16px;
  background: #f5f5f5;
  color: #333;
  font-size: 16px;
  font-weight: 700;
}
.all-check span,
.term-list b {
  display: grid;
  place-items: center;
  width: 24px;
  height: 24px;
  border: 2px solid #aabd9f;
  border-radius: 50%;
  background: transparent;
  color: #fff;
  font-size: 13px;
}
.all-check span.checked,
.term-list b.checked {
  border-color: #34e983;
  background: #34e983;
}
.term-list {
  display: grid;
  gap: 0;
  padding: 24px 20px 10px;
}
.term-list label {
  display: flex;
  min-height: 69px;
  align-items: center;
  justify-content: space-between;
  color: #666;
  font-size: 16px;
  text-decoration: none;
}
.term-list input {
  position: absolute;
  opacity: 0;
}
.term-list b {
  flex: 0 0 24px;
  text-decoration: none;
}
.primary-button {
  margin-top: auto;
  background: #e9e9e9;
  color: #888;
}
.primary-button:not(:disabled) {
  background: #303030;
  color: #fff;
}
.terms-sheet-enter-active,
.terms-sheet-leave-active {
  transition: background 0.24s ease;
}
.terms-sheet-enter-active .terms,
.terms-sheet-leave-active .terms {
  transition: transform 0.28s ease;
}
.terms-sheet-enter-from,
.terms-sheet-leave-to {
  background: transparent;
}
.terms-sheet-enter-from .terms,
.terms-sheet-leave-to .terms {
  transform: translateY(100%);
}
</style>
