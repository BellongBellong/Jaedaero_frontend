<script setup>
import { computed, nextTick, ref } from 'vue'
import { useRouter } from 'vue-router'

import confirmationEditIcon from '../../../assets/features/onboarding/icons/confirmation-edit.svg'
import PrimaryButton from '../../../common/components/buttons/PrimaryButton.vue'
import { getApiErrorMessage } from '@/common/api/errorMessage'
import { characterAssets, characterAssetsByProfileName } from '@/common/constants/characterAssets'
import { useToast } from '@/common/composables/useToast'
import OnboardingStepHeader from '@/features/onboarding/components/OnboardingStepHeader.vue'
import { useOnboardingStore } from '@/features/onboarding/stores/onboarding.store'

const router = useRouter()
const onboarding = useOnboardingStore()
const toast = useToast()
const loading = ref(false)
const completing = ref(false)
const showConfirmModal = ref(false)
const errorMessage = ref('')
const preferenceGrid = ref(null)
const targetAmountInput = ref(null)
const targetAmountStep = 100
const maxMilitarySavingsAmountInTenThousands = 2000
const preferences = [
  { value: 'SAFE', icon: '🛡️', label: '안정형', caption: '원금 보존 우선' },
  { value: 'BALANCED', icon: '⚖️', label: '균형형', caption: '안전↔성장 사이' },
  { value: 'AGGRESSIVE', icon: '🚀', label: '공격형', caption: '최대 수익 추구' },
]
const profileImages = {
  ...characterAssetsByProfileName,
  'profile-default.png': characterAssets.ARMY,
}
const selectedProfileImage = computed(
  () => profileImages[onboarding.form.profileImage] ?? characterAssets.ARMY,
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
const estimatedDischargeAmount = computed(() => onboarding.form.challengeGroupTargetAmountAverage)
const isAboveEstimatedAmount = computed(
  () => onboarding.form.targetAmount > estimatedDischargeAmount.value,
)
const goalTone = computed(() => {
  const targetAmount = Number(onboarding.targetAmountInTenThousands)

  if (targetAmount <= 2300) return 'green'
  if (targetAmount <= 2600) return 'gray'
  return 'red'
})
const militarySavingsExpectedAmountInTenThousands = computed(() =>
  Math.min(
    Math.max(0, Number(onboarding.targetAmountInTenThousands) || 0),
    maxMilitarySavingsAmountInTenThousands,
  ),
)
const requiredSavingsAmountInTenThousands = computed(() =>
  Math.max(
    0,
    Number(onboarding.targetAmountInTenThousands) -
      militarySavingsExpectedAmountInTenThousands.value,
  ),
)
const formattedRequiredSavings = computed(
  () => `${new Intl.NumberFormat('ko-KR').format(requiredSavingsAmountInTenThousands.value)}만 원`,
)
const formattedMilitarySavings = computed(
  () =>
    `${new Intl.NumberFormat('ko-KR').format(
      militarySavingsExpectedAmountInTenThousands.value,
    )}만 원`,
)
const canDecreaseTargetAmount = computed(() => Number(onboarding.targetAmountInTenThousands) > 0)

function adjustTargetAmount(direction) {
  const currentAmount = Number(onboarding.targetAmountInTenThousands) || 0
  onboarding.targetAmountInTenThousands = Math.max(0, currentAmount + direction * targetAmountStep)
  targetAmountInput.value?.focus()
}

async function next() {
  if (!onboarding.form.investmentPreference) {
    errorMessage.value = '투자 성향을 선택해 주세요.'
    return
  }
  if (!Number.isFinite(onboarding.form.targetAmount) || onboarding.form.targetAmount <= 0) {
    errorMessage.value = '목표 금액을 1만원 이상 입력해 주세요.'
    return
  }

  loading.value = true
  errorMessage.value = ''
  try {
    await onboarding.previewPreference()
    showConfirmModal.value = true
  } catch (error) {
    errorMessage.value = getApiErrorMessage(
      error,
      '투자 성향과 목표 금액을 저장하지 못했어요. 잠시 후 다시 시도해 주세요.',
      'preference',
    )
  } finally {
    loading.value = false
  }
}

function closeModal() {
  if (!completing.value) showConfirmModal.value = false
}

async function editPreference() {
  closeModal()
  await nextTick()
  const selectedButton = preferenceGrid.value?.querySelector('button.selected')
  selectedButton?.focus()
  selectedButton?.scrollIntoView({ behavior: 'smooth', block: 'center' })
}

async function editTargetAmount() {
  closeModal()
  await nextTick()
  targetAmountInput.value?.focus()
  targetAmountInput.value?.scrollIntoView({ behavior: 'smooth', block: 'center' })
}

async function complete() {
  if (completing.value) return

  completing.value = true
  errorMessage.value = ''

  try {
    await onboarding.completeOnboarding()
    toast.success('준비가 끝났어요! 이제 나만의 자산 관리를 시작해볼까요?')
    await router.replace({ name: 'dashboard' })
  } catch (error) {
    const serverMessage = error.response?.data?.message
    errorMessage.value = serverMessage
      ? `대시보드 정보를 준비하지 못했어요. ${serverMessage}`
      : '대시보드 정보를 준비하지 못했어요. 잠시 후 다시 시도해주세요.'
  } finally {
    completing.value = false
  }
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
      <div
        ref="preferenceGrid"
        class="preference-grid"
      >
        <button
          v-for="item in preferences"
          :key="item.value"
          type="button"
          :class="{ selected: onboarding.form.investmentPreference === item.value }"
          @click="onboarding.form.investmentPreference = item.value"
        >
          <span>{{ item.icon }}</span><strong>{{ item.label }}</strong><small>{{ item.caption }}</small>
        </button>
      </div>
      <h2>목표 전역 자금</h2>
      <div class="goal-card">
        <p>전역시에 모으고 싶은<br>목표 금액을 설정해주세요.</p>
        <div class="goal-amount-control">
          <button
            type="button"
            class="goal-amount-button"
            :disabled="!canDecreaseTargetAmount"
            aria-label="목표 전역 자금 100만 원 줄이기"
            @click="adjustTargetAmount(-1)"
          >
            −
          </button>
          <label><input
            ref="targetAmountInput"
            v-model.number="onboarding.targetAmountInTenThousands"
            :class="goalTone"
            type="number"
            min="0"
            step="100"
          ><span>만 원</span></label>
          <button
            type="button"
            class="goal-amount-button"
            aria-label="목표 전역 자금 100만 원 늘리기"
            @click="adjustTargetAmount(1)"
          >
            +
          </button>
        </div>
        <p
          v-if="isAboveEstimatedAmount"
          class="goal-warning"
        >
          <span>!</span> 목표금액이 동기 평균 보다 높은 편이에요
        </p>
        <div
          class="goal-breakdown"
          :class="goalTone"
        >
          <span>군적금 수령 예상금액 {{ formattedMilitarySavings }}</span>
          <b>＋</b>
          <span>저축 {{ formattedRequiredSavings }}</span>
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
      variant="green"
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
            <p
              v-if="onboarding.form.nickname"
              class="confirm-nickname"
            >
              {{ onboarding.form.nickname }}님
            </p>
            <h2 id="confirm-title">
              이대로 진행할까요?
            </h2>

            <div class="confirm-summary">
              <div class="summary-column">
                <h3>선택한 투자 유형</h3>
                <button
                  type="button"
                  class="summary-item"
                  aria-label="투자 유형 수정"
                  @click="editPreference"
                >
                  <img
                    class="summary-pencil"
                    :src="confirmationEditIcon"
                    alt=""
                  >
                  <span class="summary-icon">{{ selectedPreference.icon }}</span>
                  <strong>{{ selectedPreference.label }}</strong>
                  <em>{{ selectedPreference.caption }}</em>
                </button>
              </div>
              <div class="summary-column">
                <h3>목표 전역 자산</h3>
                <button
                  type="button"
                  class="summary-item"
                  aria-label="목표 전역 자산 수정"
                  @click="editTargetAmount"
                >
                  <img
                    class="summary-pencil"
                    :src="confirmationEditIcon"
                    alt=""
                  >
                  <strong class="summary-amount">{{ formattedAmount }}</strong>
                </button>
              </div>
            </div>

            <p
              v-if="errorMessage"
              class="form-error confirm-error"
            >
              {{ errorMessage }}
            </p>

            <PrimaryButton
              variant="green"
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
  appearance: none;
  display: grid;
  min-height: 94px;
  place-items: center;
  border: 1px solid transparent;
  border-radius: 12px;
  background: #fff;
  color: #333;
  font: inherit;
}
.preference-grid button.selected {
  border-color: #2be77b;
  background: #caffdf;
}
.preference-grid strong {
  color: #333;
  font-size: 13px;
}
.preference-grid small {
  padding: 4px 8px;
  border-radius: 12px;
  background: #f6f7f6;
  color: #757575;
  font-size: 10px;
  white-space: nowrap;
}
h2 {
  margin: 27px 0 12px 10px;
  color: #566752;
  font-size: 15px;
}
.step-page > .primary-button {
  margin-top: 16px;
}
.goal-card {
  padding: 23px 10px;
  border-radius: 26px;
  background: #fff;
  text-align: center;
}
.goal-card > p {
  margin: 0 0 13px;
  color: #666;
  font-size: 14px;
  line-height: 1.55;
}
.goal-card label {
  display: inline-flex;
  align-items: center;
  gap: 12px;
}
.goal-amount-control {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
}
.goal-amount-button {
  display: grid;
  width: 36px;
  height: 36px;
  place-items: center;
  padding: 0;
  border: 0;
  border-radius: 50%;
  background: #effff5;
  color: #20ba5c;
  font-size: 24px;
  line-height: 1;
}
.goal-amount-button:disabled {
  background: #f0f0f0;
  color: #aaa;
  cursor: not-allowed;
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
.goal-card input.green {
  border-bottom-color: #3aed87;
}
.goal-card input.gray {
  border-bottom-color: #aebbaa;
}
.goal-card input.red {
  border-bottom-color: #ff8a72;
}
.goal-warning {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  margin: 14px 0 0;
  color: #ff765c;
  font-size: 11px;
}
.goal-warning span {
  display: inline-grid;
  width: 12px;
  height: 12px;
  place-items: center;
  border-radius: 50%;
  background: #ff765c;
  color: #fff;
  font-size: 9px;
  font-weight: 800;
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
.goal-breakdown.gray span {
  background: #eef1ed;
  color: #7d8e7c;
}
.goal-breakdown.red span {
  background: #fff4f1;
  color: #ff765c;
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
  padding: 62px 14px 39px;
  border-radius: 30px;
  background: #fff;
  box-shadow: 0 18px 50px rgb(0 0 0 / 18%);
}
.confirm-close {
  position: absolute;
  top: 28px;
  right: 29px;
  padding: 0;
  border: 0;
  background: transparent;
  color: #333;
  color: #555;
  font-size: 29px;
  line-height: 1;
}
.confirm-avatar {
  display: grid;
  width: 76px;
  height: 76px;
  margin: 0 auto 25px;
  overflow: hidden;
  place-items: center;
  border-radius: 50%;
  background: #edf1ec;
}
.confirm-avatar img {
  width: 60px;
  height: 60px;
  object-fit: contain;
}
.confirm-nickname {
  margin: 0 0 8px;
  color: #566752;
  font-family: var(--font-display, '감탄로드감탄체'), sans-serif;
  font-size: 18px;
  font-weight: 400;
  letter-spacing: -0.02em;
  text-align: center;
}
.confirm-modal h2 {
  margin: 0 0 33px;
  color: #6d6d6d;
  font-size: 18px;
  line-height: 27px;
  text-align: center;
}
.confirm-summary {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 18px;
  padding: 21px 18px 20px;
  margin-bottom: 60px;
  border-radius: 26px;
  background: linear-gradient(135deg, #d5f7e3 0%, #f6f7d9 100%);
}
.summary-column {
  display: grid;
  gap: 11px;
}
.summary-column h3 {
  margin: 0;
  color: #728a70;
  color: #758d77;
  font-size: 11px;
  font-weight: 800;
  text-align: center;
  white-space: nowrap;
}
.confirm-summary .summary-item {
  position: relative;
  display: grid;
  width: 100%;
  min-height: 90px;
  justify-items: center;
  align-content: center;
  padding: 13px 7px 10px;
  border: 0;
  border-radius: 16px;
  background: #fff;
  color: #333;
  font: inherit;
  text-align: center;
  cursor: pointer;
}
.confirm-summary .summary-item:focus-visible {
  outline: 2px solid #3be178;
  outline-offset: 2px;
}
.summary-icon {
  margin-bottom: 4px;
  font-size: 14px;
}
.confirm-summary strong {
  color: #555;
  font-size: 15px;
}
.confirm-summary em {
  padding: 5px 8px;
  margin-top: 6px;
  border-radius: 18px;
  background: #effff5;
  color: #28d67a;
  font-size: 10px;
  font-style: normal;
  white-space: nowrap;
}
.summary-pencil {
  position: absolute;
  top: 13px;
  right: 10px;
  width: 12px;
  height: 12px;
  object-fit: contain;
}
.confirm-summary .summary-amount {
  padding: 9px 8px;
  border-radius: 13px;
  background: #fffdf4;
  color: #f2bd32;
  font-size: 14px;
  white-space: nowrap;
}
.confirm-modal .primary-button {
  min-height: 54px;
  background: #59f494;
  color: #15552e;
  font-size: 15px;
  font-weight: 700;
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
