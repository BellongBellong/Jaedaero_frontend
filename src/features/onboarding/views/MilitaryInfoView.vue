<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

import PrimaryButton from '../../../common/components/buttons/PrimaryButton.vue'
import { getApiErrorMessage } from '@/common/api/errorMessage'
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
const soldierTypeCodes = {
  ARMY: 'ARMY',
  NAVY: 'NAVY',
  AIR_FORCE: 'AIRFORCE',
  MARINE: 'MARINE',
}
const ranks = [
  { value: 'PRIVATE', level: 1, label: '이병' },
  { value: 'PRIVATE_FIRST_CLASS', level: 2, label: '일병' },
  { value: 'CORPORAL', level: 3, label: '상병' },
  { value: 'SERGEANT', level: 4, label: '병장' },
]

async function next() {
  if (!onboarding.form.militaryType || !onboarding.form.rank) {
    errorMessage.value = '군종과 계급을 선택해 주세요.'
    return
  }
  if (!onboarding.form.enlistmentDate) {
    errorMessage.value = '입대일을 입력해 주세요.'
    return
  }
  const enlistmentDate = String(onboarding.form.enlistmentDate).trim()
  const dateParts = enlistmentDate.split('-').map(Number)
  const parsedDate = new Date(`${enlistmentDate}T00:00:00`)
  const isValidDate =
    /^\d{4}-\d{2}-\d{2}$/.test(enlistmentDate) &&
    dateParts.length === 3 &&
    parsedDate.getFullYear() === dateParts[0] &&
    parsedDate.getMonth() + 1 === dateParts[1] &&
    parsedDate.getDate() === dateParts[2]

  if (!isValidDate) {
    errorMessage.value = '입대일이 올바르지 않습니다. 실제 입대한 날짜를 선택해 주세요.'
    return
  }
  if (parsedDate > new Date()) {
    errorMessage.value = '입대일은 오늘 이후 날짜로 입력할 수 없습니다.'
    return
  }

  loading.value = true
  errorMessage.value = ''
  try {
    const soldierProfile = await saveMilitaryInfo({
      soldierType: soldierTypeCodes[onboarding.form.militaryType],
      rankName: ranks.find((rank) => rank.value === onboarding.form.rank)?.label,
      enlistmentDate: onboarding.form.enlistmentDate,
    })
    onboarding.form.challengeGroupTargetAmountAverage = Number(
      soldierProfile.challengeGroupTargetAmountAverage ?? 0,
    )
    onboarding.persist()
    router.push({ name: 'preference-goal' })
  } catch (error) {
    errorMessage.value = getApiErrorMessage(
      error,
      '군 정보를 저장하지 못했어요. 입력 내용을 확인하고 다시 시도해 주세요.',
      'military',
    )
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
          type="button"
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
          type="button"
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
      variant="green"
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
  padding-top: 20px;
}
h2 {
  margin: 0 0 12px 9px;
  color: #566752;
  font-size: 15px;
}
h2:not(:first-child) {
  margin-top: 24px;
}
.military-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 9px;
}
.military-grid button {
  appearance: none;
  display: grid;
  gap: 5px;
  min-height: 59px;
  place-items: center;
  border: 1px solid transparent;
  border-radius: 12px;
  background: #fff;
  color: #333;
  font: inherit;
}
.military-grid strong {
  color: #333;
  font-weight: 700;
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
  color: #757575;
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
  color: #555;
}
.date-input {
  width: calc(100% - 8px);
  min-height: 58px;
  margin-left: 4px;
  padding: 0 16px;
  border: 0;
  border-radius: 18px;
  background: #fff;
  color: #555;
  font-size: 16px;
  font-weight: 700;
}
</style>
