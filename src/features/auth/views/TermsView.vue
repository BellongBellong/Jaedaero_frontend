<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'

import PrimaryButton from '@/common/components/PrimaryButton.vue'
import HomeIndicator from '@/common/components/HomeIndicator.vue'
import { useOnboardingStore } from '@/features/onboarding/stores/onboarding.store'

const router = useRouter()
const onboarding = useOnboardingStore()
const terms = [
  { id: 'service', label: '서비스 이용약관', required: true },
  { id: 'privacy', label: '개인정보 수집·이용 동의', required: true },
  { id: 'finance', label: '금융정보 조회 동의', required: true },
  { id: 'ai', label: 'AI 서비스 이용약관', required: true },
  { id: 'marketing', label: '마케팅 정보 수신 동의', required: false },
]
const checked = ref([...onboarding.form.agreements])
const allChecked = computed(() => checked.value.length === terms.length)
const requiredChecked = computed(() =>
  terms.filter((term) => term.required).every((term) => checked.value.includes(term.id)),
)

function toggleAll() {
  checked.value = allChecked.value ? [] : terms.map((term) => term.id)
}

function submit() {
  onboarding.form.agreements = checked.value
  onboarding.persist()
  router.push({ name: 'onboarding-intro' })
}
</script>

<template>
  <main class="terms screen">
    <button
      class="close-button"
      aria-label="닫기"
      @click="router.back()"
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
      @click="submit"
    >
      동의하고 시작하기
    </PrimaryButton>
    <HomeIndicator />
  </main>
</template>

<style scoped>
.terms {
  position: relative;
  display: flex;
  height: 100dvh;
  flex-direction: column;
  padding: 74px 16px 40px;
  border-radius: 42px 42px 0 0;
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
</style>
