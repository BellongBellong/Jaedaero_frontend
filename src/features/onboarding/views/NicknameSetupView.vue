<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'

import PrimaryButton from '@/common/components/PrimaryButton.vue'
import { getApiErrorMessage } from '@/common/api/errorMessage'
import OnboardingStepHeader from '@/features/onboarding/components/OnboardingStepHeader.vue'
import ProfileAppearanceSheet from '@/features/onboarding/components/ProfileAppearanceSheet.vue'
import { useOnboardingStore } from '@/features/onboarding/stores/onboarding.store'
import airforce from '../../../assets/features/onboarding/profiles/profile-airforce.png'
import army from '../../../assets/features/onboarding/profiles/profile-army.png'
import defaultProfile from '../../../assets/features/onboarding/profiles/profile-default.png'
import marine from '../../../assets/features/onboarding/profiles/profile-marine.png'
import navy from '../../../assets/features/onboarding/profiles/profile-navy.png'

const router = useRouter()
const onboarding = useOnboardingStore()
const nickname = ref(onboarding.form.nickname)
const status = ref('idle')
const isComposing = ref(false)
const hasAttemptedValidation = ref(false)
const showProfileSheet = ref(false)
const errorMessage = ref('')
const loading = ref(false)
const appearanceLoading = ref(false)
const profiles = {
  'profile-army.png': army,
  'profile-marine.png': marine,
  'profile-airforce.png': airforce,
  'profile-navy.png': navy,
  'profile-default.png': defaultProfile,
}
const profileImageCodes = {
  'profile-army.png': 'ARMY',
  'profile-marine.png': 'MARINE',
  'profile-airforce.png': 'AIRFORCE',
  'profile-navy.png': 'NAVY',
}
const profileSourceCodes = {
  '#E5FFF4': 'GREEN',
  '#AEBBAA': 'OLIVE',
  '#FFF0B8': 'YELLOW',
  '#FFB39F': 'ORANGE',
  '#F7F7F7': 'GRAY',
  '#333333': 'BLACK',
}
const validNickname = computed(() => /^[가-힣a-zA-Z0-9]{2,12}$/.test(nickname.value))
const showNicknameError = computed(
  () =>
    !isComposing.value &&
    hasAttemptedValidation.value &&
    Boolean(nickname.value) &&
    !validNickname.value,
)

function handleNicknameInput(event) {
  if (event.isComposing || isComposing.value) return
  status.value = 'idle'
  errorMessage.value = ''
  hasAttemptedValidation.value = false
}

function handleCompositionStart() {
  isComposing.value = true
  status.value = 'idle'
  errorMessage.value = ''
  hasAttemptedValidation.value = false
}

function handleCompositionEnd() {
  isComposing.value = false
  status.value = 'idle'
  errorMessage.value = ''
  hasAttemptedValidation.value = false
}

async function validateNickname() {
  hasAttemptedValidation.value = true
  if (!validNickname.value) {
    errorMessage.value = '닉네임은 한글, 영문, 숫자를 조합해 2~12자로 입력해 주세요.'
    status.value = 'idle'
    return
  }
  const nicknameToCheck = nickname.value
  status.value = 'checking'
  errorMessage.value = ''
  try {
    const result = await onboarding.checkNickname(nicknameToCheck)
    if (nickname.value !== nicknameToCheck) return
    status.value = result.available ? 'available' : 'duplicate'
  } catch (error) {
    if (nickname.value !== nicknameToCheck) return
    errorMessage.value = getApiErrorMessage(
      error,
      '닉네임 중복 확인에 실패했어요. 잠시 후 다시 시도해 주세요.',
      'nickname',
    )
    status.value = 'idle'
  }
}

async function saveAppearance(image, color) {
  if (appearanceLoading.value) return

  appearanceLoading.value = true
  errorMessage.value = ''
  try {
    await onboarding.saveProfileAppearance(
      {
        profileImage: profileImageCodes[image],
        profileSource: profileSourceCodes[color],
      },
      { profileImage: image, profileBackgroundColor: color },
    )
    showProfileSheet.value = false
  } catch (error) {
    errorMessage.value = getApiErrorMessage(
      error,
      '프로필 정보를 저장하지 못했어요. 잠시 후 다시 시도해 주세요.',
      'nickname',
    )
  } finally {
    appearanceLoading.value = false
  }
}

async function next() {
  if (status.value !== 'available' || loading.value) return

  loading.value = true
  errorMessage.value = ''
  try {
    await onboarding.saveNickname(nickname.value)
    router.push({ name: 'military-info' })
  } catch (error) {
    errorMessage.value = getApiErrorMessage(
      error,
      '닉네임을 저장하지 못했어요. 잠시 후 다시 시도해 주세요.',
      'nickname',
    )
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <main class="step-page screen">
    <OnboardingStepHeader
      :step="2"
      title="닉네임 설정"
      description="어떻게 불러 드릴까요?"
      @back="router.back()"
    />
    <section class="nickname-content">
      <button
        type="button"
        class="profile-picker"
        :style="{ background: onboarding.form.profileBackgroundColor }"
        @click="showProfileSheet = true"
      >
        <img
          :src="profiles[onboarding.form.profileImage]"
          alt="선택된 프로필"
        >
        <span
          class="profile-picker__change-icon"
          aria-hidden="true"
        >
          <svg
            viewBox="0 0 16 16"
            aria-hidden="true"
          >
            <path d="M13 5.5A5 5 0 0 0 4.2 3L2.5 5M2.5 5V2.5M2.5 5H5" />
            <path d="M3 10.5A5 5 0 0 0 11.8 13l1.7-2M13.5 11v2.5M13.5 11H11" />
          </svg>
        </span>
      </button>
      <div class="nickname-row">
        <input
          v-model.trim="nickname"
          maxlength="12"
          placeholder="동의하고 시작하기"
          @compositionend="handleCompositionEnd"
          @compositionstart="handleCompositionStart"
          @input="handleNicknameInput"
        >
        <button
          :disabled="status === 'checking'"
          @click="validateNickname"
        >
          중복확인
        </button>
      </div>
      <p
        v-if="showNicknameError"
        class="form-error"
      >
        닉네임은 한글, 영문, 숫자를 조합해 2~12자로 입력해 주세요.
      </p>
      <p
        v-else-if="status === 'available'"
        class="success"
      >
        사용 가능한 이름입니다.
      </p>
      <p
        v-else-if="status === 'duplicate'"
        class="form-error"
      >
        이미 사용 중인 이름입니다.
      </p>
      <p
        v-else-if="errorMessage"
        class="form-error"
      >
        {{ errorMessage }}
      </p>
      <small>한글, 영문, 숫자 2~12자</small>
    </section>
    <PrimaryButton
      variant="green"
      :disabled="status !== 'available'"
      :loading="loading"
      @click="next"
    >
      다음으로
    </PrimaryButton>
    <ProfileAppearanceSheet
      v-if="showProfileSheet"
      :image="onboarding.form.profileImage"
      :background-color="onboarding.form.profileBackgroundColor"
      :saving="appearanceLoading"
      @close="showProfileSheet = false"
      @save="saveAppearance"
    />
  </main>
</template>

<style scoped>
.nickname-content {
  flex: 1;
  padding-top: 52px;
}
.profile-picker {
  position: relative;
  display: grid;
  width: 82px;
  height: 82px;
  place-items: center;
  margin: 0 auto 32px;
  border: 1px dashed #38ea85;
  border-radius: 50%;
}
.profile-picker img {
  width: 64px;
  height: 64px;
  object-fit: contain;
}
.profile-picker__change-icon {
  position: absolute;
  right: -3px;
  bottom: 1px;
  display: grid;
  width: 25px;
  height: 25px;
  place-items: center;
  border-radius: 50%;
  background: #2de77c;
  color: #fff;
}
.profile-picker__change-icon svg {
  width: 15px;
  height: 15px;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 1.5;
}
.nickname-row {
  display: flex;
  gap: 10px;
}
.nickname-row input {
  min-width: 0;
  flex: 1;
  padding: 0 20px;
  border: 1px solid #e4e4e4;
  border-radius: 15px;
  outline: none;
}
.nickname-row input:focus {
  border-color: #32e77e;
}
.nickname-row button {
  width: 110px;
  min-height: 54px;
  border: 0;
  border-radius: 15px;
  background: var(--green-500, #62ff9c);
  color: var(--ui-text, #333);
  font-weight: 700;
}
.nickname-row button:disabled {
  background: #ededed;
  color: #8f8f8f;
}
.nickname-content small {
  display: block;
  margin: 10px 4px;
  color: #aaa;
}
.step-page > .primary-button {
  margin-bottom: 4px;
}
.success {
  margin: 10px 4px 0;
  color: #20cc6c;
  font-size: 13px;
}
</style>
