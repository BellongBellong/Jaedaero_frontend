<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import militarySavingsIcon from '../../../assets/features/onboarding/icons/military-savings.svg'
import personalAssetsIcon from '../../../assets/features/onboarding/icons/personal-assets.svg'
import salaryAccountIcon from '../../../assets/features/onboarding/icons/salary-account.svg'
import BaseButton from '@/common/components/buttons/BaseButton.vue'
import OnboardingStepIntro from '@/common/components/layout/OnboardingStepIntro.vue'
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
    <OnboardingStepIntro
      :step="1"
      title="금융 연결"
      description="제대로를 이용하려면 은행 계정을 연동해야 해요."
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

    <BaseButton
      class="account-connect-button"
      variant="primary"
      size="lg"
      block
      :disabled="!canConnect"
      @click="connect"
    >
      연동 하러 가기
    </BaseButton>
  </main>
</template>

<style scoped>
.account-connect {
  display: flex;
  min-height: 100dvh;
  flex-direction: column;
  padding: 0 16px 30px 24px;
  background: var(--ui-background);
}

.connect-options {
  display: grid;
  gap: var(--space-10);
  margin-top: var(--space-32);
}

.connect-card {
  display: flex;
  width: 100%;
  flex-direction: column;
  align-items: center;
  padding: 20px 10px;
  border: 2px solid transparent;
  border-radius: var(--radius-xl);
  background: var(--white);
  color: inherit;
  cursor: pointer;
  transition:
    border-color 0.16s ease,
    box-shadow 0.16s ease;
}

.connect-card.selected {
  border-color: var(--green-500);
  box-shadow: 0 4px 14px rgb(59 225 120 / 12%);
}

.card-heading {
  display: flex;
  align-items: center;
  gap: var(--space-10);
}

.card-heading strong {
  color: var(--olive-500);
  font-size: var(--text-md);
  line-height: 24px;
}

.card-heading small {
  padding: 2px 10px;
  border-radius: var(--radius-lg);
  background: var(--ui-light-gray);
  color: var(--gray-600);
  font-size: var(--text-xs);
  font-weight: 700;
  line-height: 18px;
}

.card-heading small.required {
  background: var(--green-100);
  color: var(--green-700);
}

.card-description {
  margin-top: 6px;
  color: var(--ui-text-secondary);
  font-size: var(--text-xs);
  line-height: 16px;
}

.military-assets {
  display: flex;
  justify-content: center;
  gap: 30px;
  margin-top: var(--space-10);
}

.asset-option,
.personal-asset {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-10);
  color: var(--gray-600);
  font-size: var(--text-xs);
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
  margin-top: var(--space-10);
}

.account-connect-button {
  min-height: 58px;
  margin-top: auto;
}

.account-connect-button:disabled {
  background: var(--ui-light-gray);
  color: var(--gray-400);
}

@media (max-height: 760px) {
  .connect-options {
    margin-top: var(--space-20);
  }

  .connect-card {
    padding-block: 14px;
  }
}
</style>
