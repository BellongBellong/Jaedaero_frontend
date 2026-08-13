<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import generalAccountIcon from '@/assets/onboarding/icons/account-general.svg'
import accountEmptyMascot from '@/assets/onboarding/icons/account-empty-mascot.svg'
import militarySavingsAccountIcon from '@/assets/onboarding/icons/account-military-savings.svg'
import recommendedAccountIcon from '@/assets/onboarding/icons/account-recommended.svg'
import { getApiErrorMessage } from '@/common/api/errorMessage'
import PrimaryButton from '@/common/components/PrimaryButton.vue'
import {
  connectAccount,
  disconnectAccount,
  getAccounts,
} from '@/features/accounts/api/accounts.api'
import {
  accountInstitutionName,
  accountOrganizationCode,
  matchesAccountInstitution,
  normalizeInstitutionName,
} from '@/features/accounts/composables/institutionMapping'
import OnboardingStepHeader from '@/features/onboarding/components/OnboardingStepHeader.vue'
import { useOnboardingStore } from '@/features/onboarding/stores/onboarding.store'

const route = useRoute()
const router = useRouter()
const onboarding = useOnboardingStore()
const banks = ref([])
const securities = ref([])
const loading = ref(false)
const accountRequestController = ref(null)
const loadingInstitutions = ref(true)
const errorMessage = ref('')
const institutionModalOpen = ref(false)
const pendingOrganizationCode = ref('')
const accountsModalOpen = ref(false)
const accountsEmptyModalOpen = ref(false)
const discoveredAccounts = ref([])
const selectedAccountIds = ref([])
const accountsConfirming = ref(false)
const requiredAccountNoticeId = ref(null)
const showConnectedSummary = ref(false)
const connectedInstitutions = ref([])
const institutionAssets = import.meta.glob('@/assets/onboarding/institutions/*.svg', {
  eager: true,
  import: 'default',
  query: '?url',
})
const fallbackBanks = [
  { organizationCode: '0004', displayName: '국민은행', logoKey: 'kb' },
  { organizationCode: '0003', displayName: '기업은행', logoKey: 'ibk' },
  { organizationCode: '0088', displayName: '신한은행', logoKey: 'shinhan' },
  { organizationCode: '0081', displayName: '하나은행', logoKey: 'hana' },
  { organizationCode: '0071', displayName: '우체국', logoKey: 'woochekook' },
  { organizationCode: '0011', displayName: '농협은행', logoKey: 'nh' },
  { organizationCode: '0007', displayName: '수협은행', logoKey: 'sh' },
  { organizationCode: '0020', displayName: '우리은행', logoKey: 'woori' },
  { organizationCode: '0031', displayName: 'iM뱅크', logoKey: 'im' },
  { organizationCode: '0034', displayName: '광주은행', logoKey: 'gwangju' },
  { organizationCode: '0035', displayName: '제주은행', logoKey: 'jeju' },
  { organizationCode: '0039', displayName: '경남은행', logoKey: 'gyeongnam' },
  { organizationCode: '0032', displayName: '부산은행', logoKey: 'busan' },
  { organizationCode: '0037', displayName: '전북은행', logoKey: 'jeonbok' },
  { organizationCode: '0023', displayName: 'SC제일은행', logoKey: 'sc' },
  { organizationCode: '0111', displayName: '지역농협', logoKey: 'nhlocal' },
  { organizationCode: '0045', displayName: '새마을금고', logoKey: 'mg' },
  { organizationCode: '0089', displayName: '케이뱅크', logoKey: 'kbank' },
]
const fallbackSecurities = [
  { organizationCode: '0238', displayName: '미래에셋증권', logoIndex: 0 },
  { organizationCode: '0243', displayName: '한국투자증권', logoIndex: 1 },
  { organizationCode: '0218', displayName: 'KB증권', logoIndex: 2 },
  { organizationCode: '0240', displayName: '삼성증권', logoIndex: 3 },
  { organizationCode: '0247', displayName: 'NH투자증권', logoIndex: 4 },
  { organizationCode: '0261', displayName: '교보증권', logoIndex: 5 },
  { organizationCode: '0264', displayName: '키움증권', logoIndex: 6 },
  { organizationCode: '0266', displayName: 'SK증권', logoIndex: 7 },
  { organizationCode: '0209', displayName: '유안타증권', logoIndex: 8 },
  { organizationCode: '0267', displayName: '대신증권', logoIndex: 9 },
  { organizationCode: '0269', displayName: '한화투자증권', logoIndex: 10 },
  { organizationCode: '0270', displayName: '하나금융투자', logoIndex: 11 },
  { organizationCode: '0278', displayName: '신한금융투자', logoIndex: 12 },
  { organizationCode: '0279', displayName: 'DB금융투자', logoIndex: 13 },
  { organizationCode: '0280', displayName: '유진투자증권', logoIndex: 14 },
  { organizationCode: '0287', displayName: '메리츠증권', logoIndex: 15 },
  { organizationCode: '0225', displayName: 'IBK투자증권', logoIndex: 16 },
]
const form = ref({
  businessType: '',
  organizationCode: '',
  loginId: '',
  password: '',
  birthDate: '',
})
const isSecuritiesOnly = computed(() => route.params.assetType === 'securities')
const allowsSecurities = computed(() =>
  ['personal-assets', 'securities'].includes(String(route.params.assetType)),
)
const isAdditionalConnection = computed(
  () =>
    route.query.mode === 'additional' ||
    ['my-page', 'dashboard', 'investment-assets'].includes(String(route.query.source || '')),
)
const isMockMode =
  import.meta.env.MODE === 'mock' || import.meta.env.VITE_USE_MOCK_SERVER === 'true'

const canSubmit = computed(
  () => form.value.organizationCode && form.value.loginId && form.value.password && !loading.value,
)
const visibleInstitutions = computed(() => {
  const templates = form.value.businessType === 'BK' ? fallbackBanks : fallbackSecurities
  const apiInstitutions = form.value.businessType === 'BK' ? banks.value : securities.value

  return templates.map((template) => {
    const templateName = normalizeInstitutionName(template.displayName)
    const matchedInstitution = apiInstitutions.find((institution) => {
      const apiName = normalizeInstitutionName(institution.displayName)
      return (
        apiName === templateName || apiName.includes(templateName) || templateName.includes(apiName)
      )
    })

    return matchedInstitution
      ? {
          ...template,
          organizationCode: matchedInstitution.organizationCode,
        }
      : template
  })
})
const pendingInstitution = computed(() =>
  visibleInstitutions.value.find(
    (institution) => institution.organizationCode === pendingOrganizationCode.value,
  ),
)
const selectedInstitution = computed(() =>
  visibleInstitutions.value.find(
    (institution) => institution.organizationCode === form.value.organizationCode,
  ),
)

const bankLogoRules = [
  ['국민', 'kb'],
  ['기업', 'ibk'],
  ['신한', 'shinhan'],
  ['하나', 'hana'],
  ['우체국', 'woochekook'],
  ['지역농협', 'nhlocal'],
  ['농협', 'nh'],
  ['수협', 'sh'],
  ['우리', 'woori'],
  ['iM', 'im'],
  ['광주', 'gwangju'],
  ['제주', 'jeju'],
  ['경남', 'gyeongnam'],
  ['부산', 'busan'],
  ['전북', 'jeonbok'],
  ['SC', 'sc'],
  ['새마을', 'mg'],
  ['케이', 'kbank'],
]
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

function institutionLogo(institution, selected, businessType = form.value.businessType) {
  const selectedSuffix = selected ? '-selected' : ''
  if (businessType === 'BK') {
    const logoKey =
      institution.logoKey ||
      bankLogoRules.find(([name]) => institution.displayName.includes(name))?.[1] ||
      'kb'
    return institutionAssets[
      `/src/assets/onboarding/institutions/bank-${logoKey}${selectedSuffix}.svg`
    ]
  }

  const logoIndex =
    institution.logoIndex ??
    securityLogoNames.findIndex((name) => institution.displayName.includes(name))
  const safeIndex = logoIndex >= 0 ? logoIndex : 0
  return institutionAssets[
    `/src/assets/onboarding/institutions/security-${safeIndex}${selectedSuffix}.svg`
  ]
}

function isInstitutionConnected(institution) {
  return connectedInstitutions.value.some(
    (connection) =>
      connection.businessType === form.value.businessType &&
      connection.institution.organizationCode === institution.organizationCode,
  )
}

function markConnected() {
  if (route.params.assetType === 'military-savings') onboarding.form.militarySavingsConnected = true
  if (route.params.assetType === 'salary-account') onboarding.form.salaryAccountConnected = true
  if (route.params.assetType === 'personal-assets') onboarding.form.accountsConnected = true
  onboarding.persist()
}

function accountBusinessType(account) {
  const businessType = String(
    account.businessType || account.institutionType || account.financialBusinessType || '',
  ).toUpperCase()

  if (
    ['ST', 'SECURITIES', 'SECURITY', 'INVESTMENT'].includes(businessType) ||
    account.accountType === 'INVESTMENT'
  ) {
    return 'ST'
  }

  return 'BK'
}

function restoreConnectedInstitutions(accounts) {
  const institutions = [...fallbackBanks, ...fallbackSecurities]
  const grouped = new Map()

  accounts.forEach((account) => {
    const businessType = accountBusinessType(account)
    if (isSecuritiesOnly.value && businessType !== 'ST') return
    const organizationCode = accountOrganizationCode(account)
    const institutionName = accountInstitutionName(account)
    const key = `${businessType}-${organizationCode || normalizeInstitutionName(institutionName)}`

    if (!grouped.has(key)) {
      const institution = institutions.find(
        (item) => item.organizationCode === organizationCode,
      ) || {
        organizationCode,
        displayName: institutionName,
      }

      grouped.set(key, {
        id: key,
        businessType,
        institution,
        accounts: [],
      })
    }

    grouped.get(key).accounts.push(account)
  })

  connectedInstitutions.value = Array.from(grouped.values())
  showConnectedSummary.value = connectedInstitutions.value.length > 0
}

async function restoreConnectionState() {
  try {
    const accounts = await getAccounts()
    restoreConnectedInstitutions(accounts)
  } catch (error) {
    errorMessage.value = getApiErrorMessage(
      error,
      '기존 연동 계좌를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.',
      'account',
    )
  }
}

watch(
  () => form.value.businessType,
  () => {
    form.value.organizationCode = ''
  },
)

function selectBusinessType(type) {
  if (loading.value || (type === 'ST' && !allowsSecurities.value)) return
  form.value.businessType = type
  errorMessage.value = ''
  pendingOrganizationCode.value = form.value.organizationCode
  institutionModalOpen.value = true
}

function closeInstitutionModal() {
  institutionModalOpen.value = false
  pendingOrganizationCode.value = ''
}

function retryAccountConnection() {
  accountsEmptyModalOpen.value = false
  errorMessage.value = ''
}

function confirmInstitution() {
  if (!pendingInstitution.value || isInstitutionConnected(pendingInstitution.value)) return
  form.value.organizationCode = pendingOrganizationCode.value
  institutionModalOpen.value = false
  errorMessage.value = ''
}

function togglePendingInstitution(organizationCode) {
  const institution = visibleInstitutions.value.find(
    (item) => item.organizationCode === organizationCode,
  )
  if (!institution || isInstitutionConnected(institution)) return

  pendingOrganizationCode.value =
    pendingOrganizationCode.value === organizationCode ? '' : organizationCode
}

function accountId(account, index) {
  return account.accountId ?? account.id ?? `discovered-${index}`
}

function accountRequirement(account) {
  const role = String(account.accountRole || account.accountType || '').toUpperCase()
  const accountName = [account.productName, account.accountName, account.product]
    .filter(Boolean)
    .join(' ')
    .replace(/\s/g, '')
  const isMilitarySavings =
    role === 'MILITARY_SAVINGS' ||
    accountName.includes('장병내일준비적금') ||
    accountName.includes('군인적금')

  if (isMilitarySavings) {
    return 'required'
  }
  if (route.params.assetType === 'salary-account' && ['CHECKING', 'SALARY'].includes(role)) {
    return 'required'
  }
  if (route.params.assetType !== 'personal-assets' && role === 'CHECKING') return 'recommended'
  return 'optional'
}

function accountIcon(account) {
  const requirement = accountRequirement(account)
  if (requirement === 'required') return militarySavingsAccountIcon
  if (requirement === 'recommended') return recommendedAccountIcon
  return generalAccountIcon
}

function accountDetail(account) {
  if (account.openedAt) {
    const [year, month, day] = String(account.openedAt).slice(0, 10).split('-')
    return `가입일 : ${year}년 ${Number(month)}월 ${Number(day)}일`
  }
  return (
    account.accountMasked ||
    account.accountNumberMasked ||
    account.accountNumber ||
    '계좌번호 정보 없음'
  )
}

function toggleAccount(account, index) {
  const id = accountId(account, index)
  if (accountRequirement(account) === 'required') {
    requiredAccountNoticeId.value = id
    return
  }

  requiredAccountNoticeId.value = null
  selectedAccountIds.value = selectedAccountIds.value.includes(id)
    ? selectedAccountIds.value.filter((selectedId) => selectedId !== id)
    : [...selectedAccountIds.value, id]
}

function closeAccountsModal() {
  accountsModalOpen.value = false
  requiredAccountNoticeId.value = null
}

async function confirmAccounts() {
  if (!selectedAccountIds.value.length || accountsConfirming.value) return

  if (!selectedInstitution.value || isInstitutionConnected(selectedInstitution.value)) {
    accountsModalOpen.value = false
    showConnectedSummary.value = true
    return
  }

  const selectedAccounts = discoveredAccounts.value.filter((account, index) =>
    selectedAccountIds.value.includes(accountId(account, index)),
  )
  const selectedIds = new Set(selectedAccountIds.value)
  const accountsToRemove = discoveredAccounts.value.filter((account, index) => {
    const persistedId = account.accountId ?? account.id
    return persistedId && !selectedIds.has(accountId(account, index))
  })

  accountsConfirming.value = true
  errorMessage.value = ''
  try {
    await Promise.all(
      accountsToRemove.map((account) => disconnectAccount(account.accountId ?? account.id)),
    )
    connectedInstitutions.value.push({
      id: `${form.value.businessType}-${form.value.organizationCode}-${Date.now()}`,
      businessType: form.value.businessType,
      institution: { ...selectedInstitution.value },
      accounts: selectedAccounts,
    })
    markConnected()
    accountsModalOpen.value = false
    showConnectedSummary.value = true
  } catch (error) {
    errorMessage.value = getApiErrorMessage(
      error,
      '선택한 계좌만 연결하지 못했어요. 잠시 후 다시 시도해 주세요.',
      'account',
    )
  } finally {
    accountsConfirming.value = false
  }
}

function startAdditionalConnection() {
  form.value = {
    businessType: isSecuritiesOnly.value ? 'ST' : '',
    organizationCode: '',
    loginId: '',
    password: '',
    birthDate: '',
  }
  discoveredAccounts.value = []
  selectedAccountIds.value = []
  errorMessage.value = ''
  showConnectedSummary.value = false
}

function nextFromSummary() {
  const destinations = {
    'my-page': { name: 'connected-banks' },
    dashboard: { name: 'dashboard' },
    'investment-assets': {
      name: 'account-assets',
      query: { tab: 'investment' },
    },
  }
  const destination = destinations[String(route.query.source || '')]

  if (destination) {
    router.replace(destination)
    return
  }

  router.push({ name: 'nickname' })
}

async function submit() {
  if (!form.value.businessType) {
    errorMessage.value = '연결할 금융기관 종류를 먼저 선택해 주세요.'
    return
  }
  if (!form.value.organizationCode) {
    errorMessage.value = '연결할 금융기관을 선택해 주세요.'
    return
  }
  if (!form.value.loginId.trim()) {
    errorMessage.value = '금융기관 인터넷뱅킹 아이디를 입력해 주세요.'
    return
  }
  if (!form.value.password) {
    errorMessage.value = '금융기관 인터넷뱅킹 비밀번호를 입력해 주세요.'
    return
  }
  if (form.value.birthDate && !/^\d{6}$/.test(form.value.birthDate)) {
    errorMessage.value = '생년월일은 주민등록번호 앞 6자리로 입력해 주세요.'
    return
  }

  const userId = Number(localStorage.getItem('userId')) || (isMockMode ? 1 : 0)
  if (!userId) {
    errorMessage.value = '로그인 사용자 정보를 찾을 수 없어요. 다시 로그인해주세요.'
    return
  }

  const requestController = new AbortController()
  accountRequestController.value = requestController
  loading.value = true
  accountsEmptyModalOpen.value = false
  errorMessage.value = ''
  try {
    await connectAccount(
      {
        userId,
        organizationCode: form.value.organizationCode,
        businessType: form.value.businessType,
        loginId: form.value.loginId,
        password: form.value.password,
        birthDate: form.value.birthDate || undefined,
      },
      { signal: requestController.signal },
    )
    const connectedAccounts = await getAccounts({ signal: requestController.signal })
    discoveredAccounts.value = connectedAccounts.filter((account) =>
      matchesAccountInstitution(account, selectedInstitution.value),
    )

    if (!discoveredAccounts.value.length) {
      accountsEmptyModalOpen.value = true
      return
    }

    selectedAccountIds.value = discoveredAccounts.value
      .map((account, index) => ({
        id: accountId(account, index),
        requirement: accountRequirement(account),
      }))
      .filter(({ requirement }) => requirement !== 'optional')
      .map(({ id }) => id)
    requiredAccountNoticeId.value = null
    accountsModalOpen.value = true
  } catch (error) {
    if (error.code === 'ERR_CANCELED') return
    errorMessage.value = getApiErrorMessage(
      error,
      '계좌 연결에 실패했어요. 금융기관 정보를 확인하고 다시 시도해 주세요.',
      'account',
    )
  } finally {
    if (accountRequestController.value === requestController) {
      accountRequestController.value = null
      loading.value = false
    }
  }
}

function abortAccountRequest() {
  accountRequestController.value?.abort()
  accountRequestController.value = null
  loading.value = false
}

onMounted(async () => {
  if (isSecuritiesOnly.value) form.value.businessType = 'ST'
  banks.value = fallbackBanks
  securities.value = allowsSecurities.value ? fallbackSecurities : []
  loadingInstitutions.value = false
  await restoreConnectionState()
})

onBeforeUnmount(abortAccountRequest)
</script>

<template>
  <main class="codef-connect screen">
    <OnboardingStepHeader
      :step="1"
      :show-progress="!isAdditionalConnection"
      :title="isSecuritiesOnly ? '증권계좌 연결' : '금융 연결'"
      :description="
        showConnectedSummary
          ? isAdditionalConnection
            ? `${isSecuritiesOnly ? '증권계좌' : '금융기관'} 연동이 완료되었어요.`
            : '군인 계좌가 있는 은행을 연결해주세요.'
          : `연결할 ${isSecuritiesOnly ? '증권사' : '금융기관'}의 인터넷뱅킹 정보를 입력해주세요.`
      "
      @back="router.back()"
    />

    <section class="step-content">
      <div
        v-if="showConnectedSummary"
        class="connected-summary"
      >
        <h2>
          {{
            isAdditionalConnection
              ? '연동한 금융기관 목록'
              : `연동한 ${connectedInstitutions[0]?.businessType === 'BK' ? '은행' : '증권사'} 목록`
          }}
        </h2>
        <article
          v-for="connection in connectedInstitutions"
          :key="connection.id"
          class="connected-card"
        >
          <span class="connected-card-icon">
            <img
              :src="institutionLogo(connection.institution, false, connection.businessType)"
              alt=""
            >
          </span>
          <span class="connected-card-copy">
            <span>
              <b>{{ connection.institution.displayName }}</b>
              <small>{{ connection.accounts.length }}개</small>
            </span>
            <em>
              {{
                connection.accounts
                  .map((account) => account.productName || account.accountName || '금융 계좌')
                  .join(', ')
              }}
            </em>
          </span>
          <span
            class="connected-card-check"
            aria-hidden="true"
          >✓</span>
        </article>
        <p
          v-if="!isAdditionalConnection"
          class="additional-tip"
        >
          💡 군적금 계좌가 있다면 연동해보세요!
        </p>
      </div>

      <template v-else>
        <div
          v-if="isSecuritiesOnly"
          class="securities-connection-state"
        >
          <strong>연결된 증권계좌가 없어요</strong>
          <span>투자 자산을 확인하려면 증권사를 연결해주세요.</span>
        </div>

        <fieldset
          v-if="!selectedInstitution"
          class="institution-type"
        >
          <legend>기관 선택</legend>
          <div class="type-buttons">
            <button
              v-if="!isSecuritiesOnly"
              type="button"
              :class="{ selected: form.businessType === 'BK' }"
              @click="selectBusinessType('BK')"
            >
              {{
                form.businessType === 'BK' && selectedInstitution
                  ? selectedInstitution.displayName
                  : '은행'
              }}
            </button>
            <button
              v-if="allowsSecurities"
              type="button"
              :class="[
                { selected: form.businessType === 'ST' && !isSecuritiesOnly },
                { 'type-buttons__securities-only': isSecuritiesOnly },
              ]"
              @click="selectBusinessType('ST')"
            >
              {{
                form.businessType === 'ST' && selectedInstitution
                  ? selectedInstitution.displayName
                  : '증권사'
              }}
            </button>
          </div>
        </fieldset>

        <div
          v-if="selectedInstitution"
          class="account-fields"
        >
          <div class="selected-institution-field">
            <strong>기관 선택</strong>
            <button
              type="button"
              class="selected-institution-card"
              @click="selectBusinessType(form.businessType)"
            >
              <span class="selected-institution-logo">
                <img
                  :src="institutionLogo(selectedInstitution, false)"
                  alt=""
                >
              </span>
              <span class="selected-institution-copy">
                <small>선택한 {{ form.businessType === 'BK' ? '은행' : '증권사' }}</small>
                <b>{{ selectedInstitution.displayName }}</b>
              </span>
              <span
                class="selected-institution-arrow"
                aria-hidden="true"
              >›</span>
            </button>
          </div>

          <label>
            인터넷뱅킹 아이디
            <input
              v-model.trim="form.loginId"
              autocomplete="username"
              placeholder="가입한 아이디를 입력해주세요"
            >
          </label>

          <label>
            인터넷뱅킹 비밀번호
            <input
              v-model="form.password"
              type="password"
              autocomplete="current-password"
              placeholder="비밀번호 입력"
            >
          </label>

          <label>
            생년월일 입력(선택)
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
        </div>
      </template>
    </section>

    <div
      v-if="showConnectedSummary"
      class="summary-actions"
    >
      <button
        type="button"
        @click="startAdditionalConnection"
      >
        추가연동
      </button>
      <button
        type="button"
        @click="nextFromSummary"
      >
        {{ isAdditionalConnection ? '완료' : '다음으로' }}
      </button>
    </div>

    <PrimaryButton
      v-else
      :disabled="loading"
      @click="submit"
    >
      {{
        loading
          ? '연결 중...'
          : canSubmit
            ? `${form.businessType === 'BK' ? '은행' : '증권'} 계좌 불러오기`
            : '계좌 연결하기'
      }}
    </PrimaryButton>

    <Transition name="institution-sheet">
      <div
        v-if="institutionModalOpen"
        class="institution-backdrop institution-backdrop--selector"
        @click.self="closeInstitutionModal"
      >
        <section
          class="institution-sheet"
          role="dialog"
          aria-modal="true"
          :aria-label="form.businessType === 'BK' ? '은행 선택' : '증권사 선택'"
        >
          <button
            type="button"
            class="sheet-close"
            aria-label="닫기"
            @click="closeInstitutionModal"
          >
            ×
          </button>
          <header>
            <h2>{{ form.businessType === 'BK' ? '은행 계좌 연동' : '증권 계좌 연동' }}</h2>
            <p>
              자산을 연결할 {{ form.businessType === 'BK' ? '은행' : '증권사' }}을 선택해주세요.<br>
              한 번에 하나씩만 가능해요.
            </p>
          </header>
          <p class="sheet-tip">
            {{
              isSecuritiesOnly
                ? '💡 보유 중인 투자 자산이 있는 증권사를 선택해주세요.'
                : '💡 군적금 및 나라사랑통장이 있는 은행은 필수 연동해주세요.'
            }}
          </p>
          <div class="institution-list">
            <button
              v-for="institution in visibleInstitutions"
              :key="institution.organizationCode"
              type="button"
              class="institution-row"
              :class="{
                selected: pendingOrganizationCode === institution.organizationCode,
                connected: isInstitutionConnected(institution),
              }"
              :aria-label="
                isInstitutionConnected(institution)
                  ? `${institution.displayName} 연결됨`
                  : `${institution.displayName} 선택`
              "
              :disabled="isInstitutionConnected(institution)"
              @click="togglePendingInstitution(institution.organizationCode)"
            >
              <img
                :src="
                  institutionLogo(
                    institution,
                    pendingOrganizationCode === institution.organizationCode,
                  )
                "
                alt=""
              >
              <span
                v-if="isInstitutionConnected(institution)"
                class="institution-connected-check"
                aria-hidden="true"
              >✓</span>
            </button>
            <p
              v-if="loadingInstitutions"
              class="institution-empty"
            >
              금융기관 목록을 불러오는 중이에요.
            </p>
            <p
              v-else-if="!visibleInstitutions.length"
              class="institution-empty"
            >
              선택할 수 있는 금융기관이 없습니다.
            </p>
          </div>
          <PrimaryButton
            :disabled="!pendingInstitution"
            @click="confirmInstitution"
          >
            {{
              pendingInstitution ? `${pendingInstitution.displayName} 선택` : '기관을 선택해주세요'
            }}
          </PrimaryButton>
        </section>
      </div>
    </Transition>

    <Transition name="institution-sheet">
      <div
        v-if="loading && selectedInstitution"
        class="institution-backdrop account-status-backdrop"
      >
        <section
          class="account-status-sheet loading-sheet"
          role="status"
          aria-live="polite"
        >
          <span
            class="loading-spinner"
            aria-hidden="true"
          />
          <div class="loading-copy">
            <h2>
              선택한 은행으로<br>
              계좌 정보를 불러오고있어요.
            </h2>
            <p>10초에서 1분 정도 소요됩니다</p>
          </div>
          <div class="loading-bank-card">
            <span class="selected-institution-logo">
              <img
                :src="institutionLogo(selectedInstitution, false)"
                alt=""
              >
            </span>
            <span class="selected-institution-copy">
              <small>선택한 {{ form.businessType === 'BK' ? '은행' : '증권사' }}</small>
              <b>{{ selectedInstitution.displayName }}</b>
            </span>
            <span
              class="loading-check"
              aria-hidden="true"
            />
          </div>
        </section>
      </div>
    </Transition>

    <Transition name="institution-sheet">
      <div
        v-if="accountsEmptyModalOpen"
        class="institution-backdrop account-status-backdrop"
      >
        <section
          class="account-status-sheet empty-sheet"
          role="dialog"
          aria-modal="true"
          aria-labelledby="empty-account-title"
        >
          <button
            type="button"
            class="sheet-close"
            aria-label="계좌 불러오기 닫기"
            @click="retryAccountConnection"
          >
            ×
          </button>
          <header>
            <h2 id="empty-account-title">
              계좌 불러오기
            </h2>
            <p>연동할 계좌를 모두 선택해주세요</p>
          </header>
          <div class="empty-bank-summary">
            <span class="selected-institution-logo">
              <img
                v-if="selectedInstitution"
                :src="institutionLogo(selectedInstitution, false)"
                alt=""
              >
            </span>
            <span class="selected-institution-copy">
              <small>선택한 {{ form.businessType === 'BK' ? '은행' : '증권사' }}</small>
              <b>{{ selectedInstitution?.displayName }}</b>
            </span>
            <span
              class="loading-check"
              aria-hidden="true"
            >✓</span>
          </div>
          <div class="empty-account-content">
            <img
              :src="accountEmptyMascot"
              alt=""
            >
            <h3>앗, 계좌가 발견되지 않았어요</h3>
            <p>
              은행 정보를 다시 확인해보거나<br>
              다른 은행으로 연동해보세요
            </p>
            <button
              type="button"
              @click="retryAccountConnection"
            >
              다시 연결하러가기
            </button>
          </div>
        </section>
      </div>
    </Transition>

    <Transition name="institution-sheet">
      <div
        v-if="accountsModalOpen"
        class="institution-backdrop"
        @click.self="closeAccountsModal"
      >
        <section
          class="accounts-sheet"
          role="dialog"
          aria-modal="true"
          aria-label="계좌 불러오기"
        >
          <button
            type="button"
            class="sheet-close accounts-sheet-close"
            aria-label="계좌 불러오기 닫기"
            @click="closeAccountsModal"
          >
            ×
          </button>
          <header>
            <h2>계좌 불러오기</h2>
            <p>
              {{ selectedInstitution?.displayName }} 계좌를 {{ discoveredAccounts.length }}개
              발견했어요!<br>
              연동할 계좌를 모두 선택해주세요.
            </p>
          </header>

          <div class="accounts-bank-card">
            <span class="selected-institution-logo">
              <img
                v-if="selectedInstitution"
                :src="institutionLogo(selectedInstitution, false)"
                alt=""
              >
            </span>
            <span class="selected-institution-copy">
              <small>선택한 {{ form.businessType === 'BK' ? '은행' : '증권사' }}</small>
              <b>{{ selectedInstitution?.displayName }}</b>
            </span>
          </div>

          <div class="discovered-account-list">
            <div
              v-for="(account, index) in discoveredAccounts"
              :key="accountId(account, index)"
              class="discovered-account-wrap"
            >
              <button
                type="button"
                class="discovered-account"
                :class="{ selected: selectedAccountIds.includes(accountId(account, index)) }"
                @click="toggleAccount(account, index)"
              >
                <img
                  :src="accountIcon(account)"
                  alt=""
                >
                <span class="discovered-account-copy">
                  <span>
                    <b>{{ account.productName || account.accountName || '금융 계좌' }}</b>
                    <small :class="accountRequirement(account)">
                      {{
                        accountRequirement(account) === 'required'
                          ? '필수'
                          : accountRequirement(account) === 'recommended'
                            ? '권장'
                            : '선택'
                      }}
                    </small>
                  </span>
                  <em>{{ accountDetail(account) }}</em>
                </span>
                <i aria-hidden="true">✓</i>
              </button>
              <p
                v-if="requiredAccountNoticeId === accountId(account, index)"
                class="required-account-notice"
              >
                필수계좌는 선택 취소할 수 없어요.
              </p>
            </div>
          </div>

          <PrimaryButton
            :disabled="accountsConfirming || !selectedAccountIds.length"
            @click="confirmAccounts"
          >
            {{ accountsConfirming ? '계좌 저장 중...' : '선택한 계좌 불러오기' }}
          </PrimaryButton>
        </section>
      </div>
    </Transition>
  </main>
</template>

<style scoped>
.codef-connect {
  position: relative;
  display: flex;
  min-height: 100dvh;
  flex-direction: column;
  padding: 0 16px 40px 20px;
  background: #fafafa;
}

.codef-connect :deep(.step-header) {
  padding: 22px 10px 0;
}

.codef-connect :deep(.back-button) {
  margin-bottom: 54px;
}

.codef-connect :deep(.step-header--without-progress .back-button) {
  margin-bottom: 24px;
}

.codef-connect :deep(.step-header__progress) {
  margin-bottom: 0;
}

.step-content {
  display: flex;
  flex: 1;
  flex-direction: column;
  padding: 22px 6px 20px;
}

.institution-type {
  padding: 0;
  border: 0;
  margin: 0;
}

.institution-type legend {
  margin-bottom: 10px;
  color: #7c8e77;
  font-size: 16px;
  font-weight: 700;
  line-height: 24px;
}

.type-buttons {
  display: flex;
  gap: 14px;
}

.type-buttons button {
  width: 152px;
  height: 42px;
  border: 1px solid transparent;
  border-radius: 16px;
  background: #fff;
  color: #b0b0b0;
  cursor: pointer;
  font-size: 14px;
}

.type-buttons button.selected {
  border-color: #62ff9c;
  background: #effff5;
  color: #20ba5c;
  font-weight: 700;
}

.type-buttons .type-buttons__securities-only {
  width: 152px;
}

.securities-connection-state {
  display: grid;
  gap: 3px;
  padding: 16px;
  margin-bottom: 18px;
  border-radius: 20px;
  background: rgb(236 236 236 / 35%);
}

.securities-connection-state strong {
  color: var(--gray-700);
  font-size: 14px;
  line-height: 1.5;
}

.securities-connection-state span {
  color: var(--gray-500);
  font-size: 12px;
  line-height: 1.5;
}

.connected-summary {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 9px;
}

.connected-summary h2 {
  margin: 0 8px 1px;
  color: #6d906e;
  font-size: 14px;
  line-height: 24px;
}

.connected-card {
  display: flex;
  min-height: 70px;
  align-items: center;
  gap: 12px;
  padding: 11px 16px;
  border-radius: 24px;
  background: #fff;
}

.connected-card-icon {
  display: grid;
  width: 42px;
  height: 42px;
  flex: 0 0 42px;
  place-items: center;
  border-radius: 13px;
  background: #f5f5f7;
  overflow: hidden;
}

.connected-card-icon img {
  width: 42px;
  height: 42px;
  transform: scale(1.32);
}

.connected-card-copy {
  display: grid;
  min-width: 0;
  gap: 3px;
}

.connected-card-copy > span {
  display: flex;
  align-items: center;
  gap: 8px;
}

.connected-card-copy b {
  color: #333;
  font-size: 14px;
}

.connected-card-copy small {
  padding: 2px 7px;
  border-radius: 20px;
  background: #e4fff0;
  color: #22c55e;
  font-size: 9px;
  font-weight: 700;
}

.connected-card-copy em {
  overflow: hidden;
  max-width: 210px;
  color: #9c9c9c;
  font-size: 10px;
  font-style: normal;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.connected-card-check {
  margin-left: auto;
  color: #56f497;
  font-size: 18px;
  font-weight: 700;
}

.additional-tip {
  padding: 10px 14px;
  margin: auto 0 0;
  border-radius: 12px;
  background: #effff5;
  color: #7c9b80;
  font-size: 10px;
  line-height: 16px;
}

.summary-actions {
  display: grid;
  grid-template-columns: 0.68fr 1.55fr;
  gap: 12px;
  margin: 0 4px;
}

.summary-actions button {
  min-height: 56px;
  border: 0;
  border-radius: 28px;
  background: #ececec;
  color: #999;
  cursor: pointer;
  font-size: 16px;
  font-weight: 700;
}

.summary-actions button:last-child {
  background: #56f497;
  color: #173522;
}

.account-fields {
  display: grid;
  gap: 18px;
}

.selected-institution-field {
  display: grid;
  gap: 10px;
}

.selected-institution-field > strong,
.account-fields > label {
  padding-inline: 10px;
  color: #7c8e77;
  font-size: 16px;
  font-weight: 700;
  line-height: 24px;
}

.selected-institution-card {
  display: flex;
  width: 100%;
  min-height: 88px;
  align-items: center;
  gap: 14px;
  padding: 20px;
  border: 0;
  border-radius: 28px;
  background: #fff;
  color: #333;
  cursor: pointer;
  text-align: left;
}

.selected-institution-logo {
  display: grid;
  width: 48px;
  height: 48px;
  flex: 0 0 48px;
  place-items: center;
  border-radius: 14px;
  background: #f5f5f7;
  overflow: hidden;
}

.selected-institution-logo img {
  width: 48px;
  height: 48px;
  transform: scale(1.32);
}

.selected-institution-copy {
  display: grid;
  gap: 2px;
}

.selected-institution-copy small {
  color: #bdbdbd;
  font-size: 12px;
  line-height: 18px;
}

.selected-institution-copy b {
  color: #333;
  font-size: 16px;
  line-height: 24px;
}

.selected-institution-arrow {
  margin-left: auto;
  color: #999;
  font-size: 30px;
  font-weight: 300;
  line-height: 30px;
}

label {
  display: grid;
  gap: 8px;
  color: #4b4b4b;
  font-size: 14px;
  font-weight: 700;
}

.account-fields input {
  height: 44px;
  border-width: 1.5px;
  border-radius: 15px;
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
  padding: 0 14px;
  border: 1px solid #e1e1e1;
  border-radius: 12px;
  outline: 0;
  background: #fff;
  color: #333;
  font: inherit;
  font-size: 14px;
  font-weight: 400;
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

.primary-button {
  width: calc(100% - 8px);
  min-height: 56px;
  margin: 0 4px;
}

.primary-button:disabled {
  background: #ececec;
  color: #bdbdbd;
}

.institution-backdrop {
  position: absolute;
  z-index: 20;
  display: flex;
  align-items: flex-end;
  padding: 10px 12px 0;
  background: rgb(0 0 0 / 48%);
  inset: 0;
}

.institution-sheet {
  position: relative;
  display: flex;
  width: 100%;
  height: min(78dvh, 660px);
  max-height: calc(100dvh - 92px);
  flex-direction: column;
  padding: 38px 16px 12px;
  border-radius: 24px 24px 0 0;
  background: #fff;
}

.sheet-close {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 32px;
  height: 32px;
  padding: 0;
  border: 0;
  background: transparent;
  color: #555;
  cursor: pointer;
  font-size: 30px;
  line-height: 30px;
}

.institution-sheet h2 {
  margin: 0;
  color: #333;
  font-size: 18px;
  line-height: 27px;
}

.institution-sheet header p {
  margin: 1px 0 0;
  color: #757575;
  font-size: 11px;
  line-height: 16px;
}

.sheet-tip {
  padding: 9px 12px;
  margin: 10px 0 12px;
  border-radius: 10px;
  background: #effff5;
  color: #5e7666;
  font-size: 9px;
  line-height: 14px;
}

.institution-list {
  display: grid;
  grid-template-columns: repeat(3, 74px);
  grid-auto-rows: 74px;
  align-content: start;
  justify-content: space-between;
  gap: 8px 6px;
  min-height: 0;
  flex: 1;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: #cfcfcf transparent;
}

.institution-row {
  position: relative;
  display: grid;
  width: 74px;
  height: 74px;
  place-items: center;
  padding: 0;
  border: 0;
  border-radius: 50%;
  background: transparent;
  cursor: pointer;
}

.institution-row.selected {
  background: transparent;
}

.institution-row.connected {
  cursor: default;
  opacity: 0.62;
}

.institution-row img {
  display: block;
  width: 74px;
  height: 74px;
}

.institution-connected-check {
  position: absolute;
  right: 1px;
  bottom: 1px;
  display: grid;
  width: 21px;
  height: 21px;
  place-items: center;
  border: 2px solid #fff;
  border-radius: 50%;
  background: #56f497;
  color: #fff;
  font-size: 12px;
  font-weight: 700;
}

.institution-empty {
  grid-column: 1 / -1;
  padding: 50px 10px;
  margin: 0;
  color: #999;
  font-size: 13px;
  text-align: center;
}

.institution-sheet > .primary-button {
  width: 100%;
  flex: 0 0 56px;
  margin: 10px 0 0;
  background: #56f497;
  color: #173522;
  font-size: 13px;
}

.institution-sheet > .primary-button:disabled {
  background: #ececec;
  color: #bdbdbd;
}

.accounts-sheet {
  position: relative;
  display: flex;
  width: 100%;
  height: min(78dvh, 660px);
  flex-direction: column;
  padding: 30px 16px 12px;
  border-radius: 24px 24px 0 0;
  background: #fff;
}

.accounts-sheet-close {
  top: 14px;
  right: 16px;
  z-index: 1;
}

.accounts-sheet > header {
  padding-right: 36px;
}

.account-status-backdrop {
  align-items: center;
  flex-direction: column;
  justify-content: center;
  padding: 0;
}

.account-status-sheet {
  position: relative;
  width: 100%;
  border-radius: 30px;
  background: #fff;
}

.loading-sheet {
  width: calc(100% - 52px);
  min-height: 366px;
  padding: 40px 20px 36px;
  border-radius: 46px;
}

.loading-spinner {
  display: block;
  width: 48px;
  height: 48px;
  margin: 0 auto 31px;
  border: 8px solid #ededed;
  border-right-color: #58f49a;
  border-radius: 50%;
  animation: loading-spin 0.85s linear infinite;
}

.loading-copy {
  text-align: center;
}

.loading-copy h2 {
  margin: 0;
  color: #333;
  font-size: 20px;
  line-height: 30px;
}

.loading-copy p {
  margin: 4px 0 25px;
  color: #999;
  font-size: 12px;
}

.loading-bank-card {
  display: flex;
  min-height: 88px;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  border: 1px solid #ddffeb;
  border-radius: 28px;
  background: #fff;
  box-shadow: 0 0 12px rgb(88 244 154 / 18%);
}

.loading-check {
  display: none;
}

@keyframes loading-spin {
  to {
    transform: rotate(360deg);
  }
}

.empty-sheet {
  min-height: 695px;
  padding: 66px 30px 30px;
}

.empty-sheet > header h2 {
  margin: 0;
  color: #333;
  font-size: 24px;
}

.empty-sheet > header p {
  margin: 4px 0 26px;
  color: #777;
  font-size: 14px;
}

.empty-bank-summary {
  display: flex;
  align-items: center;
  gap: 14px;
}

.empty-account-content {
  display: flex;
  align-items: center;
  flex-direction: column;
  padding-top: 69px;
  text-align: center;
}

.empty-account-content > img {
  width: 55px;
  height: 66px;
  margin-bottom: 39px;
}

.empty-account-content h3 {
  margin: 0 0 12px;
  color: #c4c4c4;
  font-size: 22px;
}

.empty-account-content p {
  margin: 0 0 27px;
  color: #888;
  font-size: 14px;
  line-height: 23px;
}

.empty-account-content button {
  width: 257px;
  min-height: 56px;
  border: 0;
  border-radius: 28px;
  background: #ececec;
  color: #c5c5c5;
  font-size: 16px;
  font-weight: 700;
}

.accounts-sheet h2 {
  margin: 0;
  color: #333;
  font-size: 24px;
  line-height: 36px;
}

.accounts-sheet header > p {
  margin: 4px 0 0;
  color: #757575;
  font-size: 14px;
  line-height: 21px;
}

.accounts-bank-card {
  display: flex;
  min-height: 88px;
  align-items: center;
  gap: 14px;
  padding: 20px;
  margin-top: 18px;
  border-radius: 28px;
  background: #fafafa;
}

.discovered-account-list {
  min-height: 0;
  flex: 1;
  margin-top: 18px;
  overflow-y: auto;
}

.discovered-account-wrap + .discovered-account-wrap {
  border-top: 1px solid #f0f0f0;
}

.discovered-account {
  display: flex;
  width: 100%;
  min-height: 82px;
  align-items: center;
  gap: 12px;
  padding: 14px 4px;
  border: 0;
  background: transparent;
  color: #333;
  cursor: pointer;
  text-align: left;
}

.discovered-account > img {
  width: 50px;
  height: 50px;
  flex: 0 0 50px;
}

.discovered-account-copy {
  display: grid;
  min-width: 0;
  gap: 5px;
}

.discovered-account-copy > span {
  display: flex;
  align-items: center;
  gap: 8px;
}

.discovered-account-copy b {
  overflow: hidden;
  font-size: 15px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.discovered-account-copy small {
  padding: 2px 8px;
  border-radius: 20px;
  background: #ececec;
  color: #757575;
  font-size: 10px;
  font-weight: 700;
}

.discovered-account-copy small.required,
.discovered-account-copy small.recommended {
  background: #e4fff0;
  color: #22c55e;
}

.discovered-account-copy em {
  color: #999;
  font-size: 11px;
  font-style: normal;
}

.discovered-account > i {
  display: grid;
  width: 22px;
  height: 22px;
  flex: 0 0 22px;
  margin-left: auto;
  place-items: center;
  border: 1.5px solid #ddd;
  border-radius: 50%;
  color: transparent;
  font-size: 12px;
  font-style: normal;
}

.discovered-account.selected > i {
  border-color: #3be178;
  background: #3be178;
  color: #fff;
}

.required-account-notice {
  padding: 8px 12px;
  margin: -5px 0 8px;
  border-radius: 8px;
  background: #fff3f3;
  color: #e65e5e;
  font-size: 11px;
  text-align: center;
}

.accounts-sheet > .primary-button {
  width: 100%;
  flex: 0 0 56px;
  margin: 10px 0 0;
  background: #56f497;
  color: #173522;
  font-size: 14px;
}

.accounts-sheet > .primary-button:disabled {
  background: #ececec;
  color: #bdbdbd;
}

.institution-sheet-enter-active,
.institution-sheet-leave-active {
  transition: background 0.2s ease;
}

.institution-sheet-enter-active .institution-sheet,
.institution-sheet-leave-active .institution-sheet,
.institution-sheet-enter-active .accounts-sheet,
.institution-sheet-leave-active .accounts-sheet {
  transition: transform 0.26s ease;
}

.institution-sheet-enter-from,
.institution-sheet-leave-to {
  background: transparent;
}

.institution-sheet-enter-from .institution-sheet,
.institution-sheet-leave-to .institution-sheet,
.institution-sheet-enter-from .accounts-sheet,
.institution-sheet-leave-to .accounts-sheet {
  transform: translateY(100%);
}

@media (max-height: 760px) {
  .codef-connect :deep(.back-button) {
    margin-bottom: 26px;
  }

  .codef-connect :deep(.step-header) {
    padding-top: 22px;
  }

  .account-fields {
    gap: 10px;
  }

  input,
  select {
    height: 46px;
  }
}
</style>
