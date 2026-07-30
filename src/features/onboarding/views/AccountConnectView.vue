<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

import bankBuilding from '@/assets/onboarding/icons/bank-building.png'
import PrimaryButton from '@/common/components/PrimaryButton.vue'
import { connectAccount, getAccounts } from '@/features/accounts/api/accounts.api'
import OnboardingStepHeader from '@/features/onboarding/components/OnboardingStepHeader.vue'
import { useOnboardingStore } from '@/features/onboarding/stores/onboarding.store'

const router = useRouter()
const onboarding = useOnboardingStore()
const loadingTarget = ref('')
const errorMessage = ref('')
const accounts = ref([])

const assets = computed(() => [
  {
    id: 'military-savings',
    title: '장병내일준비적금',
    badge: '필수',
    description: '적금을 기반으로 전역 자산을 계산해요.',
    connected: onboarding.form.militarySavingsConnected,
  },
  {
    id: 'salary-account',
    title: '나라사랑통장',
    badge: '권장',
    description: '월급과 내 자산을 관리할 수 있어요.',
    connected: onboarding.form.salaryAccountConnected,
  },
])

const canContinue = computed(() => onboarding.form.militarySavingsConnected)

function accountTypeFor(target) {
  if (target === 'military-savings') return 'MILITARY_SAVINGS'
  if (target === 'salary-account') return 'CHECKING'
  return 'ALL'
}

async function connect(target) {
  if (loadingTarget.value) return

  loadingTarget.value = target
  errorMessage.value = ''
  try {
    const result = await connectAccount({ accountType: accountTypeFor(target) })

    if (target === 'military-savings') onboarding.form.militarySavingsConnected = true
    if (target === 'salary-account') onboarding.form.salaryAccountConnected = true
    if (target === 'personal-assets') {
      accounts.value = result.accounts ?? []
      onboarding.form.accountsConnected = true
    }
    onboarding.persist()
  } catch {
    errorMessage.value = '계좌 연결에 실패했어요. 잠시 후 다시 시도해주세요.'
  } finally {
    loadingTarget.value = ''
  }
}

function next() {
  if (!canContinue.value) return
  router.push({ name: 'nickname' })
}

onMounted(async () => {
  if (!onboarding.form.accountsConnected) return

  try {
    accounts.value = await getAccounts()
  } catch {
    onboarding.form.accountsConnected = false
  }
})
</script>

<template>
  <main class="step-page screen">
    <OnboardingStepHeader
      :step="1"
      title="금융 연결"
      description="정확한 자산 분석을 위해 금융 계좌를 연결해주세요."
      @back="router.back()"
    />

    <section class="step-content">
      <h2>군인 자산 연동</h2>
      <button
        v-for="asset in assets"
        :key="asset.id"
        class="asset-card"
        :class="{ connected: asset.connected }"
        :disabled="Boolean(loadingTarget) || asset.connected"
        @click="connect(asset.id)"
      >
        <span class="asset-icon">
          <img
            :src="bankBuilding"
            alt=""
          >
        </span>
        <span class="asset-copy">
          <strong>
            {{ asset.title }}
            <small :class="{ recommended: asset.badge === '권장' }">{{ asset.badge }}</small>
          </strong>
          <span>{{ asset.description }}</span>
        </span>
        <span
          class="connection-state"
          :class="{ active: asset.connected }"
          aria-hidden="true"
        >
          <span
            v-if="loadingTarget === asset.id"
            class="spinner"
          />
          <span v-else>✓</span>
        </span>
      </button>

      <h2>개인 자산 연동</h2>
      <div
        v-if="onboarding.form.accountsConnected"
        class="bank-list"
      >
        <div
          v-for="account in accounts"
          :key="account.id"
          class="bank-row"
        >
          <span class="bank-copy">
            <b>{{ account.bankName }}</b>
            <small>1개 계좌</small>
          </span>
        </div>
        <p
          v-if="!accounts.length"
          class="empty-assets"
        >
          연결된 개인 자산이 없어요.
        </p>
      </div>
      <button
        v-else
        class="connect-card"
        :disabled="Boolean(loadingTarget) || !canContinue"
        @click="connect('personal-assets')"
      >
        <span>
          {{
            loadingTarget === 'personal-assets'
              ? '금융기관에서 자산을 불러오는 중이에요.'
              : '기타 개인 자산을 불러와 관리할 수 있어요.'
          }}
        </span>
        <b>{{ loadingTarget === 'personal-assets' ? '연동 중' : '＋ 자산 불러오기' }}</b>
      </button>

      <p
        v-if="errorMessage"
        class="form-error"
      >
        {{ errorMessage }}
      </p>
    </section>

    <PrimaryButton
      :disabled="!canContinue"
      @click="next"
    >
      다음으로
    </PrimaryButton>
  </main>
</template>

<style scoped>
.step-content {
  flex: 1;
  padding-top: 24px;
}
h2 {
  margin: 0 0 10px 10px;
  color: #79947d;
  font-size: 15px;
  font-weight: 700;
}
h2:not(:first-child) {
  margin-top: 22px;
}
.asset-card {
  display: flex;
  width: 100%;
  min-height: 74px;
  align-items: center;
  gap: 12px;
  padding: 14px 13px;
  margin-bottom: 9px;
  border: 1px solid transparent;
  border-radius: 16px;
  background: #fff;
  color: #333;
  text-align: left;
}
.asset-card.connected {
  border-color: #d9f5e4;
}
.asset-icon {
  display: grid;
  width: 42px;
  height: 42px;
  flex: 0 0 42px;
  place-items: center;
  border-radius: 12px;
  background: #f0f4f0;
  color: #7c9a81;
  font-size: 19px;
  font-weight: 800;
}
.asset-icon img {
  width: 24px;
  height: 24px;
  object-fit: contain;
}
.asset-copy {
  display: grid;
  min-width: 0;
  gap: 5px;
}
.asset-copy strong {
  color: #333;
  font-size: 14px;
}
.asset-copy > span {
  color: #999;
  font-size: 11px;
}
.asset-copy small {
  padding: 3px 6px;
  margin-left: 3px;
  border-radius: 6px;
  background: #e5fff0;
  color: #20c86b;
  font-size: 9px;
}
.asset-copy small.recommended {
  background: #f2f2f2;
  color: #999;
}
.connection-state {
  display: grid;
  width: 24px;
  height: 24px;
  flex: 0 0 24px;
  margin-left: auto;
  place-items: center;
  color: #bdbdbd;
  font-size: 22px;
}
.connection-state.active {
  color: #25d875;
}
.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid #d6d6d6;
  border-top-color: #25d875;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
.connect-card {
  display: flex;
  width: 100%;
  min-height: 82px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 9px;
  padding: 13px 16px;
  border: 0;
  border-radius: 16px;
  background: #fff;
  color: #999;
  font-size: 11px;
  text-align: center;
}
.connect-card b {
  color: #23ce6f;
  font-size: 12px;
}
.connect-card:disabled b {
  padding: 8px 13px;
  border-radius: 9px;
  background: #f2f2f2;
  color: #c8c8c8;
}
.bank-list {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  padding: 16px;
  border-radius: 16px;
  background: #fff;
}
.bank-row {
  min-height: 57px;
  padding: 10px 12px;
  border-radius: 8px;
  background: #fffdf8;
}
.bank-copy {
  display: grid;
  gap: 5px;
}
.bank-copy b {
  color: #555;
  font-size: 11px;
}
.bank-copy small {
  color: #e4ba42;
  font-size: 10px;
}
.empty-assets {
  grid-column: 1 / -1;
  margin: 0;
  padding: 20px;
  color: #aaa;
  font-size: 12px;
  text-align: center;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
