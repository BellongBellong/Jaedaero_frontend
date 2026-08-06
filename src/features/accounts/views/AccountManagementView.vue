<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import accountIcon from '@/assets/onboarding/icons/account-general.svg'
import militarySavingsIcon from '@/assets/onboarding/icons/account-military-savings.svg'
import bankBuilding from '@/assets/onboarding/icons/bank-building.png'
import bankIbk from '@/assets/onboarding/institutions/bank-ibk.svg'
import bankKb from '@/assets/onboarding/institutions/bank-kb.svg'
import bankKakao from '@/assets/onboarding/institutions/bank-kakao.svg'
import bankShinhan from '@/assets/onboarding/institutions/bank-shinhan.svg'
import bankToss from '@/assets/onboarding/institutions/bank-toss.svg'
import { disconnectAccount, getAccounts } from '@/features/accounts/api/accounts.api'
import {
  accountInstitutionKey,
  accountInstitutionName,
} from '@/features/accounts/composables/institutionMapping'

const route = useRoute()
const router = useRouter()
const accounts = ref([])
const loading = ref(true)
const loadError = ref('')
const actionError = ref('')
const selectedAccount = ref(null)
const disconnecting = ref(false)
const institutionAssets = import.meta.glob('@/assets/onboarding/institutions/*.svg', {
  eager: true,
  import: 'default',
  query: '?url',
})

const accountTypeLabels = {
  MILITARY_SAVINGS: '군 적금계좌',
  CHECKING: '입출금 통장',
  SAVINGS: '예적금계좌',
  INVESTMENT: '투자 계좌',
  SALARY: '급여 통장',
}

const bankIcons = {
  KB국민은행: bankKb,
  국민은행: bankKb,
  'IBK 기업은행': bankIbk,
  기업은행: bankIbk,
  신한은행: bankShinhan,
  토스뱅크: bankToss,
  카카오뱅크: bankKakao,
}
const securityLogoNames = [
  '미래에셋',
  '한국투자',
  'KB',
  '삼성',
  'NH',
  '교보',
  '키움',
  'SK',
  '유안타',
  '대신',
  '한화',
  '하나',
  '신한',
  'DB',
  '유진',
  '메리츠',
  'IBK',
]

const institutionAccounts = computed(() =>
  accounts.value.filter(
    (account) => accountInstitutionKey(account) === String(route.params.institutionKey),
  ),
)
const bankName = computed(() =>
  institutionAccounts.value.length
    ? accountInstitutionName(institutionAccounts.value[0])
    : String(route.query.bankName || '연결 은행'),
)
const isSecurities = computed(() => {
  const account = institutionAccounts.value[0]
  const businessType = String(
    account?.businessType || account?.institutionType || account?.financialBusinessType || '',
  ).toUpperCase()

  return (
    ['ST', 'SECURITIES', 'SECURITY', 'INVESTMENT'].includes(businessType) ||
    account?.accountType === 'INVESTMENT' ||
    /증권|금융투자/.test(bankName.value)
  )
})
const institutionTypeLabel = computed(() => (isSecurities.value ? '증권사' : '은행'))
const institutionImage = computed(() => {
  if (!isSecurities.value) return bankIcons[bankName.value] || bankBuilding

  const logoIndex = securityLogoNames.findIndex((name) => bankName.value.includes(name))
  const safeIndex = logoIndex >= 0 ? logoIndex : 0
  return institutionAssets[`/src/assets/onboarding/institutions/security-${safeIndex}.svg`]
})

function isMilitarySavings(account) {
  const name = `${account.accountName || ''} ${account.productName || ''}`
  return account.accountType === 'MILITARY_SAVINGS' || /군|장병내일준비/.test(name)
}

function displayAccountName(account) {
  return account.accountName || accountTypeLabels[account.accountType] || '금융 계좌'
}

function displayAccountNumber(account) {
  return (
    account.accountMasked ||
    account.accountNumberMasked ||
    account.accountNumber ||
    '계좌번호 정보 없음'
  )
}

async function loadAccounts() {
  loading.value = true
  loadError.value = ''
  try {
    accounts.value = await getAccounts()
  } catch {
    loadError.value = '계좌 정보를 불러오지 못했어요.'
  } finally {
    loading.value = false
  }
}

function openDisconnectModal(account) {
  actionError.value = ''
  selectedAccount.value = account
}

function closeDisconnectModal() {
  if (!disconnecting.value) selectedAccount.value = null
}

async function confirmDisconnect() {
  if (!selectedAccount.value?.accountId || disconnecting.value) return

  disconnecting.value = true
  actionError.value = ''
  try {
    const disconnectedId = selectedAccount.value.accountId
    await disconnectAccount(disconnectedId)
    accounts.value = accounts.value.filter((account) => account.accountId !== disconnectedId)
    selectedAccount.value = null
    if (institutionAccounts.value.length === 0) {
      await router.replace({ name: 'connected-banks' })
    }
  } catch {
    actionError.value = '연결을 해제하지 못했어요. 잠시 후 다시 시도해주세요.'
  } finally {
    disconnecting.value = false
  }
}

onMounted(loadAccounts)
</script>

<template>
  <main class="account-management screen">
    <header class="page-header">
      <button
        type="button"
        aria-label="연동한 금융기관 목록으로 돌아가기"
        @click="router.back()"
      >
        ‹
      </button>
      <h1>관리</h1>
    </header>

    <section
      v-if="!loading && !loadError"
      class="bank-summary"
    >
      <span class="bank-icon">
        <img
          :src="institutionImage"
          alt=""
        >
      </span>
      <span>
        <small>선택한 {{ institutionTypeLabel }}</small>
        <b>{{ bankName }}</b>
      </span>
    </section>

    <p
      v-if="loading"
      class="state-message"
    >
      계좌 정보를 불러오고 있어요.
    </p>
    <div
      v-else-if="loadError"
      class="state-message"
    >
      <p>{{ loadError }}</p>
      <button
        type="button"
        @click="loadAccounts"
      >
        다시 시도
      </button>
    </div>
    <p
      v-else-if="institutionAccounts.length === 0"
      class="state-message"
    >
      이 {{ institutionTypeLabel }}에 연결된 계좌가 없어요.
    </p>

    <ul
      v-else
      class="account-list"
    >
      <li
        v-for="account in institutionAccounts"
        :key="account.accountId"
      >
        <div class="account-info">
          <span class="account-icon">
            <img
              :src="isMilitarySavings(account) ? militarySavingsIcon : accountIcon"
              alt=""
            >
          </span>
          <span class="account-copy">
            <span>
              <b>{{ displayAccountName(account) }}</b>
              <em v-if="isMilitarySavings(account)">필수</em>
            </span>
            <small>{{ displayAccountNumber(account) }}</small>
          </span>
        </div>
        <button
          type="button"
          class="disconnect-button"
          @click="openDisconnectModal(account)"
        >
          연결 해제하기
        </button>
      </li>
    </ul>

    <Teleport to="body">
      <Transition name="modal">
        <div
          v-if="selectedAccount"
          class="modal-backdrop"
          @click.self="closeDisconnectModal"
        >
          <section
            class="disconnect-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
          >
            <button
              type="button"
              class="modal-close"
              aria-label="연결 해제 창 닫기"
              @click="closeDisconnectModal"
            >
              ×
            </button>
            <p>계좌를 삭제하면<br>불러온 거래내역도 모두 삭제돼요</p>
            <h2 id="modal-title">
              그래도 삭제하시겠습니까?
            </h2>
            <small
              v-if="actionError"
              class="action-error"
            >{{ actionError }}</small>
            <div class="modal-actions">
              <button
                type="button"
                class="confirm-button"
                :disabled="disconnecting"
                @click="confirmDisconnect"
              >
                {{ disconnecting ? '삭제 중...' : '네' }}
              </button>
              <button
                type="button"
                class="dismiss-button"
                :disabled="disconnecting"
                @click="closeDisconnectModal"
              >
                취소
              </button>
            </div>
          </section>
        </div>
      </Transition>
    </Teleport>
  </main>
</template>

<style scoped>
.account-management {
  min-height: 100%;
  padding: 45px 20px 30px;
  background: #fafafa;
  color: #333;
}

.page-header {
  display: flex;
  align-items: center;
  gap: 12px;
}
.page-header button {
  padding: 0;
  border: 0;
  background: transparent;
  color: #444;
  font-size: 40px;
  line-height: 32px;
}
.page-header h1 {
  margin: 0;
  font-size: 22px;
}
.bank-summary {
  display: flex;
  align-items: center;
  gap: 14px;
  margin: 38px 20px 24px;
}
.bank-icon {
  display: grid;
  width: 52px;
  height: 52px;
  overflow: hidden;
  border-radius: 13px;
  background: #f5f5f5;
  place-items: center;
}
.bank-icon img {
  width: 40px;
  height: 40px;
  object-fit: contain;
}
.bank-summary > span:last-child {
  display: grid;
  gap: 4px;
}
.bank-summary small {
  color: #999;
  font-size: 12px;
}
.bank-summary b {
  font-size: 17px;
}
.account-list {
  display: grid;
  padding: 0;
  margin: 0;
  gap: 12px;
  list-style: none;
}
.account-list li {
  padding: 22px 20px 20px;
  border-radius: 27px;
  background: #fff;
}
.account-info {
  display: flex;
  align-items: center;
  gap: 14px;
}
.account-icon {
  display: grid;
  width: 48px;
  height: 48px;
  flex: 0 0 48px;
  place-items: center;
}
.account-icon img {
  width: 48px;
  height: 48px;
  object-fit: contain;
}
.account-copy {
  display: grid;
  min-width: 0;
  gap: 6px;
}
.account-copy > span {
  display: flex;
  align-items: center;
  gap: 9px;
}
.account-copy b {
  overflow: hidden;
  font-size: 17px;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.account-copy em {
  padding: 4px 9px;
  border-radius: 13px;
  background: #e4fff0;
  color: #20ba5c;
  font-size: 11px;
  font-style: normal;
  font-weight: 700;
}
.account-copy small {
  color: #999;
  font-size: 12px;
}
.disconnect-button {
  width: 100%;
  min-height: 56px;
  margin-top: 19px;
  border: 0;
  border-radius: 28px;
  background: #efefef;
  color: #aaa;
  font-size: 16px;
  font-weight: 700;
}
.disconnect-button:hover {
  color: #777;
}
.state-message {
  padding: 54px 20px;
  border-radius: 27px;
  background: #fff;
  color: #999;
  text-align: center;
}
.state-message p {
  margin: 0;
}
.state-message button {
  padding: 8px 14px;
  margin-top: 12px;
  border: 0;
  border-radius: 16px;
  background: #e4fff0;
  color: #20ba5c;
  font-weight: 700;
}
.modal-backdrop {
  position: fixed;
  z-index: 1000;
  inset: 0;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  background: rgb(0 0 0 / 42%);
}
.disconnect-modal {
  position: relative;
  width: min(100%, 430px);
  padding: 64px 15px 41px;
  border-radius: 32px 32px 0 0;
  background: #fff;
  text-align: center;
}
.modal-close {
  position: absolute;
  top: 24px;
  right: 32px;
  padding: 0;
  border: 0;
  background: transparent;
  color: #444;
  font-size: 32px;
  line-height: 1;
}
.disconnect-modal p {
  margin: 0 0 10px;
  font-size: 15px;
  line-height: 1.45;
}
.disconnect-modal h2 {
  margin: 0;
  font-size: 22px;
}
.action-error {
  display: block;
  margin-top: 12px;
  color: #e45757;
}
.modal-actions {
  display: flex;
  gap: 14px;
  margin-top: 33px;
}
.modal-actions button {
  min-height: 56px;
  flex: 1;
  border: 0;
  border-radius: 28px;
  font-size: 16px;
  font-weight: 700;
}
.confirm-button {
  background: #58f49a;
  color: #333;
}
.dismiss-button {
  background: #ececec;
  color: #bbb;
}
.modal-actions button:disabled {
  cursor: wait;
  opacity: 0.65;
}
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}
.modal-enter-active .disconnect-modal,
.modal-leave-active .disconnect-modal {
  transition: transform 0.2s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
.modal-enter-from .disconnect-modal,
.modal-leave-to .disconnect-modal {
  transform: translateY(100%);
}

@media (min-width: 431px) {
  .disconnect-modal {
    margin-bottom: 24px;
    border-radius: 32px;
  }
}
</style>
