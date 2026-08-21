<script setup>
import { computed, ref, watch } from 'vue'

import { useToast } from '@/common/composables/useToast'

const props = defineProps({
  account: { type: Object, required: true },
})

const emit = defineEmits(['saved'])
const toast = useToast()

const accountAlias = ref('')
const accountPurpose = ref('LIVING')
const includeInTotalAssets = ref(true)
const isPrimaryAccount = ref(false)
const saved = ref(false)

const purposeOptions = [
  { value: 'LIVING', label: '생활비' },
  { value: 'SALARY', label: '급여' },
  { value: 'SAVING', label: '저축' },
]

const accountId = computed(() => props.account.accountId ?? props.account.id)
const storageKey = computed(() => `account-edit-preferences:${accountId.value}`)
const institutionName = computed(
  () => props.account.institutionName || props.account.bankName || '금융기관 정보 없음',
)
const accountNumber = computed(
  () =>
    props.account.accountNumber ||
    props.account.accountNumberMasked ||
    props.account.accountMasked ||
    '계좌번호 정보 없음',
)

function defaultAlias() {
  return (
    props.account.accountAlias ||
    props.account.accountName ||
    props.account.productName ||
    props.account.name ||
    ''
  )
}

function loadPreferences() {
  accountAlias.value = defaultAlias()
  accountPurpose.value = props.account.accountPurpose || 'LIVING'
  includeInTotalAssets.value = props.account.includeInTotalAssets !== false
  isPrimaryAccount.value = Boolean(props.account.isPrimaryAccount)

  try {
    const stored = JSON.parse(localStorage.getItem(storageKey.value) || 'null')
    if (!stored) return
    accountAlias.value = stored.accountAlias || accountAlias.value
    accountPurpose.value = stored.accountPurpose || accountPurpose.value
    includeInTotalAssets.value = stored.includeInTotalAssets ?? includeInTotalAssets.value
    isPrimaryAccount.value = stored.isPrimaryAccount ?? isPrimaryAccount.value
    emit('saved', {
      accountAlias: accountAlias.value,
      accountPurpose: accountPurpose.value,
      includeInTotalAssets: includeInTotalAssets.value,
      isPrimaryAccount: isPrimaryAccount.value,
    })
  } catch {
    // 저장된 예시 설정이 손상된 경우 계좌 원본값을 사용한다.
  }
}

function saveAccount() {
  const preferences = {
    accountAlias: accountAlias.value.trim() || defaultAlias(),
    accountPurpose: accountPurpose.value,
    includeInTotalAssets: includeInTotalAssets.value,
    isPrimaryAccount: isPrimaryAccount.value,
  }

  localStorage.setItem(storageKey.value, JSON.stringify(preferences))
  accountAlias.value = preferences.accountAlias
  saved.value = true
  emit('saved', preferences)
  toast.success('계좌 설정을 저장했어요.')
  window.setTimeout(() => {
    saved.value = false
  }, 1800)
}

watch(accountId, loadPreferences, { immediate: true })
</script>

<template>
  <form
    class="account-edit"
    @submit.prevent="saveAccount"
  >
    <div class="account-edit__intro">
      <h2>계좌 수정</h2>
      <p>대시보드와 자산 화면에 표시할 계좌 정보를 설정해보세요.</p>
    </div>

    <label class="account-edit__field">
      <span>계좌 별칭</span>
      <input
        v-model="accountAlias"
        type="text"
        maxlength="20"
        placeholder="예: 월급 통장"
      >
    </label>

    <fieldset class="account-edit__purpose">
      <legend>계좌 용도</legend>
      <div>
        <button
          v-for="option in purposeOptions"
          :key="option.value"
          type="button"
          :class="{ 'account-edit__purpose-button--active': accountPurpose === option.value }"
          @click="accountPurpose = option.value"
        >
          {{ option.label }}
        </button>
      </div>
    </fieldset>

    <div class="account-edit__settings">
      <label>
        <span>
          <b>총 자산에 포함</b>
          <small>이 계좌의 잔액을 총 자산 계산에 포함해요.</small>
        </span>
        <input
          v-model="includeInTotalAssets"
          type="checkbox"
          role="switch"
        >
      </label>
      <label>
        <span>
          <b>주 계좌로 설정</b>
          <small>자산 화면에서 이 계좌를 우선 표시해요.</small>
        </span>
        <input
          v-model="isPrimaryAccount"
          type="checkbox"
          role="switch"
        >
      </label>
    </div>

    <dl class="account-edit__readonly">
      <div>
        <dt>금융기관</dt>
        <dd>{{ institutionName }}</dd>
      </div>
      <div>
        <dt>계좌번호</dt>
        <dd>{{ accountNumber }}</dd>
      </div>
    </dl>

    <p class="account-edit__notice">
      금융기관과 계좌번호는 연결된 금융기관 정보이므로 직접 수정할 수 없어요.
    </p>

    <button
      class="account-edit__submit"
      type="submit"
    >
      저장하기
    </button>
    <p
      v-if="saved"
      class="account-edit__saved"
      role="status"
    >
      계좌 설정을 저장했어요.
    </p>
  </form>
</template>

<style scoped>
.account-edit {
  display: grid;
  gap: var(--space-20, 20px);
  padding: var(--space-20, 20px);
  border-radius: 28px;
  background: rgb(255 255 255 / 72%);
  backdrop-filter: blur(18px);
}

.account-edit__intro h2,
.account-edit__intro p {
  margin: 0;
}

.account-edit__intro h2 {
  color: var(--gray-900);
  font-family: var(--body-heading-h5-bold-font-family, 'Pretendard-Bold', sans-serif);
  font-size: var(--body-heading-h5-bold-font-size, 20px);
  line-height: var(--body-heading-h5-bold-line-height, 150%);
}

.account-edit__intro p,
.account-edit__notice {
  color: var(--ui-sub-title-light);
  font-size: 12px;
  line-height: 1.5;
}

.account-edit__field {
  display: grid;
  gap: 8px;
}

.account-edit__field > span,
.account-edit__purpose legend {
  color: var(--ui-sub-title);
  font-size: 14px;
  font-weight: 700;
  line-height: 1.5;
}

.account-edit__field input {
  width: 100%;
  height: 52px;
  padding: 0 16px;
  border: 1px solid transparent;
  border-radius: 16px;
  outline: none;
  background: var(--gray-100);
  color: var(--gray-900);
  font: inherit;
}

.account-edit__field input:focus {
  border-color: var(--green-600);
  background: var(--white);
}

.account-edit__purpose {
  padding: 0;
  margin: 0;
  border: 0;
}

.account-edit__purpose > div {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin-top: 8px;
}

.account-edit__purpose button {
  height: 42px;
  border: 0;
  border-radius: 14px;
  background: var(--gray-100);
  color: var(--gray-500);
  font: inherit;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
}

.account-edit__purpose .account-edit__purpose-button--active {
  background: var(--green-100);
  color: var(--green-700);
}

.account-edit__settings {
  display: grid;
  border-radius: 18px;
  background: rgb(245 245 245 / 70%);
}

.account-edit__settings label {
  display: flex;
  min-height: 70px;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 14px 16px;
}

.account-edit__settings label + label {
  border-top: 1px solid var(--gray-200);
}

.account-edit__settings span {
  display: grid;
  gap: 2px;
}

.account-edit__settings b {
  color: var(--gray-900);
  font-size: 14px;
}

.account-edit__settings small {
  color: var(--gray-500);
  font-size: 11px;
  line-height: 1.4;
}

.account-edit__settings input {
  width: 42px;
  height: 24px;
  flex: 0 0 auto;
  appearance: none;
  border-radius: 999px;
  background: var(--gray-300);
  cursor: pointer;
  transition: background 160ms ease;
}

.account-edit__settings input::before {
  display: block;
  width: 20px;
  height: 20px;
  margin: 2px;
  border-radius: 50%;
  background: var(--white);
  content: '';
  transition: transform 160ms ease;
}

.account-edit__settings input:checked {
  background: var(--green-600);
}

.account-edit__settings input:checked::before {
  transform: translateX(18px);
}

.account-edit__readonly {
  display: grid;
  gap: 12px;
  margin: 0;
}

.account-edit__readonly div {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.account-edit__readonly dt {
  color: var(--gray-600);
  font-size: 13px;
  font-weight: 700;
}

.account-edit__readonly dd {
  overflow: hidden;
  margin: 0;
  color: var(--gray-500);
  font-size: 13px;
  text-align: right;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.account-edit__notice {
  padding: 12px 14px;
  margin: 0;
  border-radius: 14px;
  background: var(--green-50);
  color: var(--olive-500);
}

.account-edit__submit {
  width: 100%;
  height: 52px;
  border: 0;
  border-radius: 26px;
  background: var(--green-500);
  color: var(--gray-900);
  font: inherit;
  font-weight: 700;
  cursor: pointer;
}

.account-edit__saved {
  margin: -10px 0 0;
  color: var(--green-700);
  font-size: 12px;
  text-align: center;
}
</style>
