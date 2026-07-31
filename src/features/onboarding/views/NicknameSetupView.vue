<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'

import PrimaryButton from '@/common/components/PrimaryButton.vue'
import OnboardingStepHeader from '@/features/onboarding/components/OnboardingStepHeader.vue'
import ProfileAppearanceSheet from '@/features/onboarding/components/ProfileAppearanceSheet.vue'
import {
  checkNickname,
  saveNickname,
  saveProfileAppearance,
} from '@/features/onboarding/api/onboarding.api'
import { useOnboardingStore } from '@/features/onboarding/stores/onboarding.store'
import airforce from '@/assets/onboarding/profiles/profile-airforce.png'
import army from '@/assets/onboarding/profiles/profile-army.png'
import defaultProfile from '@/assets/onboarding/profiles/profile-default.png'
import marine from '@/assets/onboarding/profiles/profile-marine.png'
import navy from '@/assets/onboarding/profiles/profile-navy.png'

const router = useRouter()
const onboarding = useOnboardingStore()
const nickname = ref(onboarding.form.nickname)
const status = ref('idle')
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
const validNickname = computed(() => /^[가-힣a-zA-Z]{2,12}$/.test(nickname.value))

async function validateNickname() {
  if (!validNickname.value) return
  const nicknameToCheck = nickname.value
  status.value = 'checking'
  errorMessage.value = ''
  try {
    const result = await checkNickname(nicknameToCheck)
    if (nickname.value !== nicknameToCheck) return
    status.value = result.available ? 'available' : 'duplicate'
  } catch {
    if (nickname.value !== nicknameToCheck) return
    errorMessage.value = '중복 확인 중 오류가 발생했어요.'
    status.value = 'idle'
  }
}

async function saveAppearance(image, color) {
  if (appearanceLoading.value) return

  appearanceLoading.value = true
  errorMessage.value = ''
  try {
    await saveProfileAppearance({
      profileImage: profileImageCodes[image],
      profileSource: profileSourceCodes[color],
    })
    onboarding.form.profileImage = image
    onboarding.form.profileBackgroundColor = color
    onboarding.persist()
    showProfileSheet.value = false
  } catch {
    errorMessage.value = '프로필 정보를 저장하지 못했어요. 잠시 후 다시 시도해주세요.'
  } finally {
    appearanceLoading.value = false
  }
}

async function next() {
  if (status.value !== 'available' || loading.value) return

  loading.value = true
  errorMessage.value = ''
  onboarding.form.nickname = nickname.value
  try {
    await saveNickname(onboarding.form.nickname)
    onboarding.persist()
    router.push({ name: 'military-info' })
  } catch {
    errorMessage.value = '프로필 정보를 저장하지 못했어요. 잠시 후 다시 시도해주세요.'
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
        class="profile-picker"
        :style="{ background: onboarding.form.profileBackgroundColor }"
        @click="showProfileSheet = true"
      >
        <img
          :src="profiles[onboarding.form.profileImage]"
          alt="선택된 프로필"
        ><span>⟳</span>
      </button>
      <div class="nickname-row">
        <input
          v-model.trim="nickname"
          maxlength="12"
          placeholder="동의하고 시작하기"
          @input="status = 'idle'"
        >
        <button
          :disabled="!validNickname || status === 'checking'"
          @click="validateNickname"
        >
          중복확인
        </button>
      </div>
      <p
        v-if="status === 'available'"
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
      <small>한글, 영문 최대 12자</small>
    </section>
    <PrimaryButton
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
.profile-picker span {
  position: absolute;
  right: -2px;
  bottom: 2px;
  display: grid;
  width: 26px;
  height: 26px;
  place-items: center;
  border-radius: 50%;
  background: #2de77c;
  color: #fff;
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
  background: #333;
  color: #fff;
  font-weight: 700;
}
.nickname-row button:disabled {
  background: #ddd;
  color: #999;
}
.nickname-content small {
  display: block;
  margin: 10px 4px;
  color: #aaa;
}
.success {
  margin: 10px 4px 0;
  color: #20cc6c;
  font-size: 13px;
}
</style>
