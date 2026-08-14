<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import militarySavingsIcon from '@/assets/onboarding/icons/military-savings.svg'
import personalAssetsIcon from '@/assets/onboarding/icons/personal-assets.svg'
import salaryAccountIcon from '@/assets/onboarding/icons/salary-account.svg'
import PrimaryButton from '@/common/components/PrimaryButton.vue'
import OnboardingStepHeader from '@/features/onboarding/components/OnboardingStepHeader.vue'
import { useOnboardingStore } from '@/features/onboarding/stores/onboarding.store'

const route = useRoute()
const router = useRouter()
const onboarding = useOnboardingStore()
const selectedAsset = ref(
  onboarding.form.accountsConnected
    ? 'personal-assets'
    : onboarding.form.salaryAccountConnected
      ? 'salary-account'
      : onboarding.form.militarySavingsConnected
        ? 'military-savings'
        : '',
)

const canConnect = computed(() => Boolean(selectedAsset.value))

function selectAsset(assetType) {
  selectedAsset.value = selectedAsset.value === assetType ? '' : assetType
}

function connect() {
  if (!canConnect.value) return
  router.push({
    name: 'connect-codef-bank',
    params: { assetType: selectedAsset.value },
    query: route.query,
  })
}
</script>

<template>
  <main class="account-connect screen">
    <OnboardingStepHeader
      :step="1"
      title="금융 연결"
      description="제대로를 이용하려면 은행 계정을 연동해야 해요."
      @back="router.back()"
    />

    <section class="connect-options">
      <button
        type="button"
        class="connect-card military-card"
        :class="{ selected: ['military-savings', 'salary-account'].includes(selectedAsset) }"
        @click="selectAsset('military-savings')"
      >
        <span class="card-heading">
          <strong>군 자산 연동</strong>
          <small class="required">필수</small>
        </span>
        <span class="card-description">제대로와 함께 전역 자산을 자동으로 계산해보세요</span>
        <span class="military-assets">
          <span class="asset-option">
            <img
              :src="militarySavingsIcon"
              alt=""
            >
            <span>장병내일준비적금</span>
          </span>
          <span
            class="asset-option"
            @click.stop="selectAsset('salary-account')"
          >
            <img
              :src="salaryAccountIcon"
              alt=""
            >
            <span>나라사랑통장(카드)</span>
          </span>
        </span>
      </button>

      <button
        type="button"
        class="connect-card personal-card"
        :class="{ selected: selectedAsset === 'personal-assets' }"
        @click="selectAsset('personal-assets')"
      >
        <span class="card-heading">
          <strong>개인 자산 연동</strong>
          <small>선택</small>
        </span>
        <span class="card-description">기타 내 자산을 통합으로 관리해보세요</span>
        <span class="personal-asset">
          <img
            :src="personalAssetsIcon"
            alt=""
          >
          <span>은행을 연결하면 계좌를 불러올 수 있어요.</span>
        </span>
      </button>
    </section>

    <PrimaryButton
      variant="green"
      :disabled="!canConnect"
      @click="connect"
    >
      연동 하러 가기
    </PrimaryButton>
  </main>
</template>

<style scoped>
.account-connect {
  display: flex;
  min-height: 100dvh;
  flex-direction: column;
  padding: 0 16px 30px 24px;
  background: #fafafa;
}

.account-connect :deep(.step-header) {
  padding: 22px 10px 0;
}

.account-connect :deep(.back-button) {
  margin-bottom: 54px;
}

.account-connect :deep(.step-header__progress) {
  margin-bottom: 8px;
}

.connect-options {
  display: grid;
  gap: 10px;
  margin-top: 32px;
}

.connect-card {
  display: flex;
  width: 100%;
  flex-direction: column;
  align-items: center;
  padding: 20px 10px;
  border: 2px solid transparent;
  border-radius: 28px;
  background: #fff;
  color: inherit;
  cursor: pointer;
  transition:
    border-color 0.16s ease,
    box-shadow 0.16s ease;
}

.connect-card.selected {
  border-color: #62ff9c;
  box-shadow: 0 4px 14px rgb(59 225 120 / 12%);
}

.card-heading {
  display: flex;
  align-items: center;
  gap: 10px;
}

.card-heading strong {
  color: #566752;
  font-size: 16px;
  line-height: 24px;
}

.card-heading small {
  padding: 2px 10px;
  border-radius: 20px;
  background: #ececec;
  color: #757575;
  font-size: 12px;
  font-weight: 700;
  line-height: 18px;
}

.card-heading small.required {
  background: #e4fff0;
  color: #22c55e;
}

.card-description {
  margin-top: 6px;
  color: #666;
  font-size: 12px;
  line-height: 16px;
}

.military-assets {
  display: flex;
  justify-content: center;
  gap: 30px;
  margin-top: 10px;
}

.asset-option,
.personal-asset {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  color: #757575;
  font-size: 12px;
  line-height: 16px;
}

.asset-option img,
.personal-asset img {
  width: 50px;
  height: 50px;
}

.personal-card {
  min-height: 176px;
}

.personal-asset {
  margin-top: 10px;
}

.primary-button {
  min-height: 58px;
  margin-top: auto;
}

.primary-button:disabled {
  background: #ececec;
  color: #bdbdbd;
}

@media (max-height: 760px) {
  .account-connect :deep(.back-button) {
    margin-bottom: 26px;
  }

  .connect-options {
    margin-top: 20px;
  }

  .connect-card {
    padding-block: 14px;
  }
}
</style>
