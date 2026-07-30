<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'

import editPencil from '@/assets/onboarding/icons/edit-pencil.png'
import profileAirforce from '@/assets/onboarding/profiles/profile-airforce.png'
import profileArmy from '@/assets/onboarding/profiles/profile-army.png'
import profileDefault from '@/assets/onboarding/profiles/profile-default.png'
import profileMarine from '@/assets/onboarding/profiles/profile-marine.png'
import profileNavy from '@/assets/onboarding/profiles/profile-navy.png'
import PrimaryButton from '@/common/components/PrimaryButton.vue'
import OnboardingStepHeader from '@/features/onboarding/components/OnboardingStepHeader.vue'
import { previewInvestmentPreference, saveGoal } from '@/features/onboarding/api/onboarding.api'
import { useOnboardingStore } from '@/features/onboarding/stores/onboarding.store'

const router = useRouter()
const onboarding = useOnboardingStore()
const loading = ref(false)
const completing = ref(false)
const showConfirmModal = ref(false)
const errorMessage = ref('')
const preferences = [
  { value: 'SAFE', icon: '🛡️', label: '안정형', caption: '원금 보존 우선' },
  { value: 'BALANCED', icon: '⚖️', label: '균형형', caption: '안전↔성장 사이' },
  { value: 'AGGRESSIVE', icon: '🚀', label: '공격형', caption: '최대 수익 추구' },
]
const profileImages = {
  'profile-army.png': profileArmy,
  'profile-navy.png': profileNavy,
  'profile-airforce.png': profileAirforce,
  'profile-marine.png': profileMarine,
  'profile-default.png': profileDefault,
}
const selectedProfileImage = computed(
  () => profileImages[onboarding.form.profileImage] ?? profileArmy,
)
const selectedPreference = computed(() =>
  preferences.find((item) => item.value === onboarding.form.investmentPreference),
)
const formattedAmount = computed(
  () =>
    `${new Intl.NumberFormat('ko-KR').format(
      Math.round(onboarding.form.targetAmount / 10000),
    )}만 원`,
)

async function next() {
  loading.value = true
  errorMessage.value = ''
  try {
    await Promise.all([
      previewInvestmentPreference({
        investmentPreference: onboarding.form.investmentPreference,
      }),
      saveGoal({ targetAmount: onboarding.form.targetAmount }),
    ])
    onboarding.persist()
    showConfirmModal.value = true
  } catch {
    errorMessage.value = '설정 내용을 저장하지 못했어요.'
  } finally {
    loading.value = false
  }
}

function closeModal() {
  if (!completing.value) showConfirmModal.value = false
}

function complete() {
  completing.value = true
  window.setTimeout(() => {
    onboarding.complete()
    router.replace({ name: 'dashboard' })
  }, 450)
}
</script>

<template>
  <main class="step-page screen">
    <OnboardingStepHeader
      :step="4"
      title="투자 성향 설정"
      description="전역 자산을 운용하고 싶은&#10;본인의 투자 성향을 설정해 주세요"
      @back="router.back()"
    />
    <section class="preference-content">
      <div class="preference-grid">
        <button
          v-for="item in preferences"
          :key="item.value"
          :class="{ selected: onboarding.form.investmentPreference === item.value }"
          @click="onboarding.form.investmentPreference = item.value"
        >
          <span>{{ item.icon }}</span><strong>{{ item.label }}</strong><small>{{ item.caption }}</small>
        </button>
      </div>
      <h2>목표 전역 자금</h2>
      <div class="goal-card">
        <p>전역시에 모으고 싶은<br>목표 금액을 설정해주세요.</p>
        <label><input
          v-model.number="onboarding.targetAmountInTenThousands"
          type="number"
          min="0"
          step="100"
        ><span>만 원</span></label>
        <div class="goal-breakdown">
          <span>군적금 수령 예상금액 2,000만 원</span><b>＋</b><span>저축 자산 300만 원</span>
        </div>
      </div>
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

    <Teleport to="body">
      <Transition name="modal">
        <div
          v-if="showConfirmModal"
          class="confirm-backdrop"
          role="presentation"
          @click.self="closeModal"
        >
          <section
            class="confirm-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-title"
          >
            <button
              class="confirm-close"
              aria-label="확인 창 닫기"
              @click="closeModal"
            >
              ×
            </button>

            <div
              class="confirm-avatar"
              :style="{ background: onboarding.form.profileBackgroundColor }"
            >
              <img
                :src="selectedProfileImage"
                alt=""
              >
            </div>
            <h2 id="confirm-title">
              이대로 진행할까요?
            </h2>

            <div class="confirm-summary">
              <div class="summary-column">
                <h3>선택한 투자 유형</h3>
                <article>
                  <img
                    class="summary-pencil"
                    :src="editPencil"
                    alt=""
                  >
                  <span class="summary-icon">{{ selectedPreference.icon }}</span>
                  <strong>{{ selectedPreference.label }}</strong>
                  <em>{{ selectedPreference.caption }}</em>
                </article>
              </div>
              <div class="summary-column">
                <h3>목표 전역 자산</h3>
                <article>
                  <img
                    class="summary-pencil"
                    :src="editPencil"
                    alt=""
                  >
                  <strong class="summary-amount">{{ formattedAmount }}</strong>
                </article>
              </div>
            </div>

            <PrimaryButton
              :loading="completing"
              @click="complete"
            >
              네, 시작할래요
            </PrimaryButton>
          </section>
        </div>
      </Transition>
    </Teleport>
  </main>
</template>

<style scoped>
.preference-content {
  flex: 1;
  padding-top: 22px;
}
.preference-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}
.preference-grid button {
  display: grid;
  min-height: 94px;
  place-items: center;
  border: 1px solid transparent;
  border-radius: 12px;
  background: #fff;
}
.preference-grid button.selected {
  border-color: #2be77b;
  background: #caffdf;
}
.preference-grid strong {
  font-size: 13px;
}
.preference-grid small {
  padding: 4px 8px;
  border-radius: 12px;
  background: #f6f7f6;
  color: #a7aca8;
  font-size: 10px;
  white-space: nowrap;
}
h2 {
  margin: 27px 0 12px 10px;
  color: #79947d;
  font-size: 15px;
}
.goal-card {
  padding: 23px 10px;
  border-radius: 26px;
  background: #fff;
  text-align: center;
}
.goal-card > p {
  margin: 0 0 13px;
  color: #777;
  font-size: 14px;
  line-height: 1.55;
}
.goal-card label {
  display: inline-flex;
  align-items: center;
  gap: 12px;
}
.goal-card input {
  width: 85px;
  padding: 7px 4px;
  border: 0;
  border-bottom: 2px solid #3aed87;
  outline: none;
  font-size: 17px;
  font-weight: 700;
  text-align: center;
}
.goal-breakdown {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 9px;
  margin-top: 16px;
}
.goal-breakdown span {
  padding: 6px 8px;
  border-radius: 13px;
  background: #effff5;
  color: #1dc767;
  font-size: 10px;
}
.goal-breakdown b {
  color: #aaa;
}
.confirm-backdrop {
  position: fixed;
  z-index: 100;
  display: grid;
  background: rgb(0 0 0 / 58%);
  inset: 0;
  place-items: center;
}
.confirm-modal {
  position: relative;
  width: min(calc(100% - 44px), 353px);
  padding: 31px 14px 36px;
  border-radius: 28px;
  background: #fff;
  box-shadow: 0 18px 50px rgb(0 0 0 / 18%);
}
.confirm-close {
  position: absolute;
  top: 18px;
  right: 22px;
  padding: 0;
  border: 0;
  background: transparent;
  color: #333;
  font-size: 27px;
  line-height: 1;
}
.confirm-avatar {
  display: grid;
  width: 60px;
  height: 60px;
  margin: 0 auto 22px;
  overflow: hidden;
  place-items: center;
  border-radius: 50%;
  background: #edf1ec;
}
.confirm-avatar img {
  width: 48px;
  height: 48px;
  object-fit: contain;
}
.confirm-modal h2 {
  margin: 0 0 34px;
  color: #777;
  font-size: 18px;
  text-align: center;
}
.confirm-summary {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  padding: 27px 26px 25px;
  margin-bottom: 54px;
  border-radius: 31px;
  background: #fafafa;
}
.summary-column {
  display: grid;
  gap: 18px;
}
.summary-column h3 {
  margin: 0;
  color: #728a70;
  font-size: 12px;
  font-weight: 800;
  text-align: center;
  white-space: nowrap;
}
.confirm-summary article {
  position: relative;
  display: grid;
  min-height: 121px;
  justify-items: center;
  align-content: center;
  padding: 18px 8px 12px;
  border-radius: 14px;
  background: #fff;
}
.summary-icon {
  margin-bottom: 6px;
  font-size: 16px;
}
.confirm-summary strong {
  color: #555;
  font-size: 18px;
}
.confirm-summary em {
  padding: 7px 12px;
  margin-top: 7px;
  border-radius: 18px;
  background: #effff5;
  color: #28d67a;
  font-size: 12px;
  font-style: normal;
  white-space: nowrap;
}
.summary-pencil {
  position: absolute;
  top: 19px;
  right: 15px;
  width: 10px;
  height: 10px;
  object-fit: contain;
  opacity: 0.45;
}
.confirm-summary .summary-amount {
  padding: 12px 9px;
  border-radius: 17px;
  background: #fffdf4;
  color: #f2bd32;
  font-size: 17px;
  white-space: nowrap;
}
.confirm-modal .primary-button {
  min-height: 54px;
  background: #59f494;
  color: #333;
  font-size: 17px;
}
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.18s ease;
}
.modal-enter-active .confirm-modal,
.modal-leave-active .confirm-modal {
  transition: transform 0.18s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
.modal-enter-from .confirm-modal,
.modal-leave-to .confirm-modal {
  transform: translateY(12px) scale(0.98);
}
</style>
