<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import PrimaryButton from '@/common/components/PrimaryButton.vue'
import {
  connectAccount,
  getCodefBanks,
  getCodefSecurities,
} from '@/features/accounts/api/accounts.api'
import OnboardingStepHeader from '@/features/onboarding/components/OnboardingStepHeader.vue'
import { useOnboardingStore } from '@/features/onboarding/stores/onboarding.store'

const route = useRoute()
const router = useRouter()
const onboarding = useOnboardingStore()
const banks = ref([])
const securities = ref([])
const loading = ref(false)
const loadingBanks = ref(true)
const errorMessage = ref('')
const form = ref({
  businessType: 'BK',
  organizationCode: '',
  loginId: '',
  password: '',
  birthDate: '',
})

const assetTitle = computed(() => {
  if (route.params.assetType === 'military-savings') return '장병내일준비적금'
  if (route.params.assetType === 'salary-account') return '나라사랑통장'
  return '개인 자산'
})

const canSubmit = computed(
  () => form.value.organizationCode && form.value.loginId && form.value.password && !loading.value,
)

function markConnected() {
  if (route.params.assetType === 'military-savings') onboarding.form.militarySavingsConnected = true
  if (route.params.assetType === 'salary-account') onboarding.form.salaryAccountConnected = true
  if (route.params.assetType === 'personal-assets') onboarding.form.accountsConnected = true
  onboarding.persist()
}

watch(
  () => form.value.businessType,
  () => {
    form.value.organizationCode = ''
  },
)

async function submit() {
  if (!canSubmit.value) return

  const userId = Number(localStorage.getItem('userId'))
  if (!userId) {
    errorMessage.value = '로그인 정보를 찾을 수 없습니다. 다시 로그인해 주세요.'
    return
  }

  loading.value = true
  errorMessage.value = ''
  try {
    await connectAccount({
      userId,
      organizationCode: form.value.organizationCode,
      businessType: form.value.businessType,
      loginId: form.value.loginId,
      password: form.value.password,
      birthDate: form.value.birthDate || undefined,
    })
    markConnected()
    await router.replace({ name: 'connect-accounts' })
  } catch (error) {
    errorMessage.value =
      error.response?.data?.message || '은행 연동에 실패했습니다. 입력 정보를 확인해 주세요.'
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  try {
    const [bankList, securitiesList] = await Promise.all([getCodefBanks(), getCodefSecurities()])
    banks.value = bankList
    securities.value = securitiesList
  } catch {
    errorMessage.value = '은행 목록을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.'
  } finally {
    loadingBanks.value = false
  }
})
</script>

<template>
  <main class="step-page screen">
    <OnboardingStepHeader
      :step="1"
      :title="`${assetTitle} 연동`"
      description="은행을 선택하고 인터넷뱅킹 정보를 입력해 주세요."
      @back="router.back()"
    />

    <section class="step-content">
      <p class="notice">
        입력한 비밀번호는 CODEF 연동 요청에만 사용되며 저장하지 않습니다.
      </p>

      <label class="institution-type">
        기관 구분
        <select
          v-model="form.businessType"
          :disabled="loading"
        >
          <option value="BK">은행</option>
          <option value="ST">증권사</option>
        </select>
      </label>

      <label>
        은행
        <select
          v-model="form.organizationCode"
          :disabled="loadingBanks || loading"
        >
          <option value="">
            {{ loadingBanks ? '은행 목록을 불러오는 중...' : '은행을 선택해 주세요' }}
          </option>
          <option
            v-for="institution in form.businessType === 'BK' ? banks : securities"
            :key="institution.organizationCode"
            :value="institution.organizationCode"
          >
            {{ institution.displayName }}
          </option>
        </select>
      </label>

      <label>
        인터넷뱅킹 ID
        <input
          v-model.trim="form.loginId"
          autocomplete="username"
          placeholder="인터넷뱅킹 ID"
        >
      </label>

      <label>
        비밀번호
        <input
          v-model="form.password"
          type="password"
          autocomplete="current-password"
          placeholder="인터넷뱅킹 비밀번호"
        >
      </label>

      <label>
        생년월일 <small>은행에서 요구하는 경우만 입력</small>
        <input
          v-model.trim="form.birthDate"
          inputmode="numeric"
          maxlength="6"
          placeholder="YYMMDD"
        >
      </label>

      <p
        v-if="errorMessage"
        class="form-error"
      >
        {{ errorMessage }}
      </p>
    </section>

    <PrimaryButton
      :disabled="!canSubmit"
      @click="submit"
    >
      {{ loading ? '연동 중...' : '은행 연동하기' }}
    </PrimaryButton>
  </main>
</template>

<style scoped>
.step-content {
  display: grid;
  flex: 1;
  align-content: start;
  gap: 18px;
  padding-top: 28px;
}
.notice {
  margin: 0 0 4px;
  padding: 13px 14px;
  border-radius: 12px;
  background: #eff8f1;
  color: #69836e;
  font-size: 12px;
  line-height: 1.5;
}
label {
  display: grid;
  gap: 8px;
  color: #4b4b4b;
  font-size: 14px;
  font-weight: 700;
}
label small {
  color: #999;
  font-size: 11px;
  font-weight: 400;
}
input,
select {
  width: 100%;
  height: 52px;
  border: 1px solid #e1e1e1;
  border-radius: 12px;
  outline: 0;
  background: #fff;
  color: #333;
  font: inherit;
  font-size: 14px;
  font-weight: 400;
  padding: 0 14px;
}
input:focus,
select:focus {
  border-color: #43d981;
}
.form-error {
  margin: 2px 0 0;
  color: #ef5350;
  font-size: 13px;
}
</style>
