<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

import PrimaryButton from '@/common/components/PrimaryButton.vue'
import OnboardingStepHeader from '@/features/onboarding/components/OnboardingStepHeader.vue'
import RankInsignia from '@/features/onboarding/components/RankInsignia.vue'
import { saveMilitaryInfo } from '@/features/onboarding/api/onboarding.api'
import { useOnboardingStore } from '@/features/onboarding/stores/onboarding.store'

const router = useRouter()
const onboarding = useOnboardingStore()
const loading = ref(false)
const errorMessage = ref('')
const militaryTypes = [
  { value: 'ARMY', icon: '🪖', label: '육군', duration: '18개월' },
  { value: 'NAVY', icon: '⚓', label: '해군', duration: '20개월' },
  { value: 'AIR_FORCE', icon: '✈️', label: '공군', duration: '21개월' },
  { value: 'MARINE', icon: '🦅', label: '해병대', duration: '18개월' },
]
const ranks = [
  { value: 'PRIVATE', level: 1, label: '이병' },
  { value: 'PRIVATE_FIRST_CLASS', level: 2, label: '일병' },
  { value: 'CORPORAL', level: 3, label: '상병' },
  { value: 'SERGEANT', level: 4, label: '병장' },
]

async function next() {
  loading.value = true
  errorMessage.value = ''
  try {
    await saveMilitaryInfo({
      militaryType: onboarding.form.militaryType,
      rank: onboarding.form.rank,
      enlistmentDate: onboarding.form.enlistmentDate,
    })
    onboarding.persist()
    router.push({ name: 'preference-goal' })
  } catch {
    errorMessage.value = '군 정보를 저장하지 못했어요.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <main class="step-page screen">
    <OnboardingStepHeader
      :step="3"
      title="군 정보 입력"
      description="전역 예정일과 자산 분석에 사용됩니다"
      @back="router.back()"
    />
    <section class="military-content">
      <h2>군 종류</h2>
      <div class="military-grid">
        <button
          v-for="type in militaryTypes"
          :key="type.value"
          :class="{ selected: onboarding.form.militaryType === type.value }"
          @click="onboarding.form.militaryType = type.value"
        >
          <strong>{{ type.icon }} {{ type.label }}</strong><span>{{ type.duration }}</span>
        </button>
      </div>
      <h2>현재 계급</h2>
      <div class="rank-grid">
        <button
          v-for="rank in ranks"
          :key="rank.value"
          :class="{ selected: onboarding.form.rank === rank.value }"
          @click="onboarding.form.rank = rank.value"
        >
          <RankInsignia :level="rank.level" />
          <span>{{ rank.label }}</span>
        </button>
      </div>
      <h2>입대일</h2>
      <input
        v-model="onboarding.form.enlistmentDate"
        class="date-input"
        type="date"
      >
      <p
        v-if="errorMessage"
        class="form-error"
      >
        {{ errorMessage }}
      </p>
    </section>
    <PrimaryButton
      :loading="loading"
      @click="next"
    >
      다음으로
    </PrimaryButton>
  </main>
</template>

<style scoped>
.military-content {
  flex: 1;
  padding-top: 16px;
}
h2 {
  margin: 0 0 9px 9px;
  color: #79947d;
  font-size: 15px;
}
h2:not(:first-child) {
  margin-top: 17px;
}
.military-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 9px;
}
.military-grid button {
  display: grid;
  gap: 5px;
  min-height: 59px;
  place-items: center;
  border: 1px solid transparent;
  border-radius: 12px;
  background: #fff;
}
.military-grid button.selected,
.rank-grid button.selected {
  border-color: #2ce77c;
  background: #caffdf;
}
.military-grid span {
  padding: 3px 10px;
  border-radius: 14px;
  background: #f3f5f3;
  color: #aab4aa;
  font-size: 11px;
}
.rank-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}
.rank-grid button {
  display: flex;
  min-height: 40px;
  align-items: center;
  justify-content: center;
  gap: 4px;
  border: 1px solid transparent;
  border-radius: 14px;
  background: #fff;
  color: #777;
}
.date-input {
  width: 100%;
  min-height: 48px;
  padding: 0 16px;
  border: 0;
  border-radius: 16px;
  background: #fff;
  color: #555;
  font-size: 15px;
  font-weight: 700;
}
</style>
