<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'

import PrimaryButton from '@/common/components/PrimaryButton.vue'
import { useOnboardingStore } from '@/features/onboarding/stores/onboarding.store'

const router = useRouter()
const onboarding = useOnboardingStore()
const loading = ref(false)
const preference = computed(
  () =>
    ({
      SAFE: ['🛡️', '안정형', '원금 보존 우선'],
      BALANCED: ['⚖️', '균형형', '안전과 성장의 균형'],
      AGGRESSIVE: ['🚀', '공격형', '최대 수익 추구'],
    })[onboarding.form.investmentPreference],
)
const amount = computed(() => new Intl.NumberFormat('ko-KR').format(onboarding.form.targetAmount))

function complete() {
  loading.value = true
  window.setTimeout(() => {
    onboarding.complete()
    router.replace({ name: 'dashboard' })
  }, 450)
}
</script>

<template>
  <main class="confirm screen content-screen">
    <button
      class="plain-back"
      aria-label="뒤로 가기"
      @click="router.back()"
    >
      ‹
    </button>
    <section>
      <h1>이대로 진행할까요?</h1>
      <p>선택한 내용을 마지막으로 확인해주세요.</p>
      <article>
        <small>선택한 투자 유형</small>
        <div>
          <span>{{ preference[0] }}</span><strong>{{ preference[1] }}</strong><em>{{ preference[2] }}</em>
        </div>
      </article>
      <article>
        <small>목표 전역 자산</small>
        <h2>{{ amount }}원</h2>
      </article>
    </section>
    <PrimaryButton
      :loading="loading"
      @click="complete"
    >
      네, 시작할래요
    </PrimaryButton>
  </main>
</template>

<style scoped>
.confirm {
  display: flex;
  flex-direction: column;
  padding: 44px 24px 30px;
  background: linear-gradient(180deg, #effff5, #fff 58%);
}
.confirm section {
  flex: 1;
  padding-top: 70px;
}
h1 {
  margin: 0;
  font-size: 28px;
}
section > p {
  margin: 10px 0 45px;
  color: #888;
}
article {
  padding: 20px;
  margin-bottom: 14px;
  border: 1px solid #e7e7e7;
  border-radius: 18px;
  background: #fff;
}
article small {
  color: #999;
}
article div {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 12px;
}
article div span {
  font-size: 27px;
}
article em {
  margin-left: auto;
  color: #22cd6c;
  font-size: 12px;
  font-style: normal;
}
article h2 {
  margin: 10px 0 0;
  font-size: 25px;
}
</style>
