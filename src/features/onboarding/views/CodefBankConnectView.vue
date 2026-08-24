<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import generalAccountIcon from '../../../assets/features/onboarding/icons/account-general.svg'
import accountEmptyMascot from '../../../assets/features/onboarding/icons/account-empty-mascot.svg'
import militarySavingsAccountIcon from '../../../assets/features/onboarding/icons/account-military-savings.svg'
import recommendedAccountIcon from '../../../assets/features/onboarding/icons/account-recommended.svg'
import detailViewIcon from '../../../assets/features/my-page/detail-view.svg'
import selectedCheckIcon from '@/assets/icons/stateCheckIcon.svg'
import { getApiErrorMessage } from '@/common/api/errorMessage'
import PrimaryButton from '../../../common/components/buttons/PrimaryButton.vue'
import BaseButton from '@/common/components/buttons/BaseButton.vue'
import BaseTooltip from '@/common/components/feedback/BaseTooltip.vue'
import BaseBottomSheet from '@/common/components/overlay/BaseBottomSheet.vue'
import {
  accountConnectionStatus,
  accountInstitutionName,
  accountOrganizationCode,
  matchesAccountInstitution,
  normalizeOrganizationCode,
  normalizeInstitutionName,
} from '@/features/accounts/composables/institutionMapping'
import { bankAccountBlockIcon } from '@/features/accounts/composables/bankAccountIconMapping'
import OnboardingStepIntro from '@/common/components/layout/OnboardingStepIntro.vue'
import { useOnboardingStore } from '@/features/onboarding/stores/onboarding.store'
import { useAccountsStore } from '@/features/accounts/stores/accounts.store'

const route = useRoute()
const router = useRouter()
const onboarding = useOnboardingStore()
const accountsStore = useAccountsStore()
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
const securitiesAssets = import.meta.glob('@/assets/institutions/Securities/*.{svg,png}', {
  eager: true,
  import: 'default',
  query: '?url',
})
const bankAssets = import.meta.glob('@/assets/institutions/banks/*.svg', {
  eager: true,
  import: 'default',
  query: '?url',
})

const securitiesAssetsByFilename = Object.fromEntries(
  Object.entries(securitiesAssets).map(([assetPath, assetUrl]) => [
    assetPath.split('/').pop(),
    assetUrl,
  ]),
)
const bankAssetsByFilename = Object.fromEntries(
  Object.entries(bankAssets).map(([assetPath, assetUrl]) => [assetPath.split('/').pop(), assetUrl]),
)
const bankLogoFilenames = {
  kb: 'KB.svg',
  ibk: 'IBK.svg',
  shinhan: 'Shinhan.svg',
  woochekook: 'Wochekook.svg',
  nh: 'NH.svg',
  nhlocal: 'NHlocal.svg',
  sh: 'SH.svg',
  woori: 'Woori.svg',
  im: 'iM.svg',
  gwangju: 'KJB.svg',
  jeju: 'Jeju.svg',
  gyeongnam: 'Kyeongnam.svg',
  busan: 'Busan.svg',
  jeonbok: 'JeonBok.svg',
  sc: 'SC.svg',
  mg: 'MG.svg',
  kbank: 'Kbank.svg',
  hana: 'Hana.svg',
}
const fallbackBanks = [
  { organizationCode: '0004', displayName: '국민은행', logoKey: 'kb' },
  { organizationCode: '0003', displayName: '기업은행', logoKey: 'ibk' },
  { organizationCode: '0088', displayName: '신한은행', logoKey: 'shinhan' },
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
  { organizationCode: '0081', displayName: '하나은행', logoKey: 'hana' },
]
const fallbackSecurities = [
  { organizationCode: '0238', displayName: '미래에셋증권', logoFilename: 'Mirae.svg' },
  {
    organizationCode: '0243',
    displayName: '한국투자증권',
    logoFilename: 'KoreaInvestment.svg',
  },
  { organizationCode: '0218', displayName: 'KB증권', logoFilename: 'KB.svg' },
  { organizationCode: '0240', displayName: '삼성증권', logoFilename: 'Samsung.svg' },
  { organizationCode: '0247', displayName: 'NH투자증권', logoFilename: 'NH.svg' },
  { organizationCode: '0261', displayName: '교보증권', logoFilename: 'Kyobo.svg' },
  { organizationCode: '0266', displayName: 'SK증권', logoFilename: 'SK.png' },
  { organizationCode: '0209', displayName: '유안타증권', logoFilename: 'Yuanta.svg' },
  { organizationCode: '0267', displayName: '대신증권', logoFilename: 'Daesin.svg' },
  { organizationCode: '0269', displayName: '한화투자증권', logoFilename: 'Hanhwa.svg' },
  { organizationCode: '0278', displayName: '신한금융투자', logoFilename: 'Shinhan.svg' },
  { organizationCode: '0279', displayName: 'DB금융투자', logoFilename: 'DB.svg' },
  { organizationCode: '0280', displayName: '유진투자증권', logoFilename: 'Eugene.svg' },
  { organizationCode: '0287', displayName: '메리츠증권', logoFilename: 'Meritz.png' },
]
const form = ref({
  businessType: '',
  organizationCode: '',
  loginId: '',
  password: '',
  birthDate: '',
})
const isSecuritiesOnly = computed(
  () => route.params.assetType === 'securities' || route.meta.securitiesOnly === true,
)
const allowsSecurities = computed(
  () =>
    isSecuritiesOnly.value ||
    ['personal-assets', 'securities'].includes(String(route.params.assetType)),
)
const isAdditionalConnection = computed(
  () =>
    route.query.mode === 'additional' ||
    ['my-page', 'dashboard', 'investment-assets', 'investment-plan'].includes(
      String(route.query.source || ''),
    ),
)
const canSubmit = computed(
  () => form.value.organizationCode && form.value.loginId && form.value.password && !loading.value,
)

function findApiInstitution(template, templates, apiInstitutions) {
  const templateCode = normalizeOrganizationCode(template.organizationCode)
  const templateName = normalizeInstitutionName(template.displayName)
  const codeMatch = apiInstitutions.find(
    (institution) => normalizeOrganizationCode(institution.organizationCode) === templateCode,
  )

  if (codeMatch) return codeMatch

  const exactNameMatch = apiInstitutions.find(
    (institution) => normalizeInstitutionName(institution.displayName) === templateName,
  )

  if (exactNameMatch) return exactNameMatch

  return apiInstitutions.find((institution) => {
    const apiName = normalizeInstitutionName(institution.displayName)
    const closestTemplateName = templates
      .map((item) => normalizeInstitutionName(item.displayName))
      .filter((name) => apiName.includes(name) || name.includes(apiName))
      .sort((first, second) => second.length - first.length)[0]

    return closestTemplateName === templateName
  })
}

const visibleInstitutions = computed(() => {
  const templates = form.value.businessType === 'BK' ? fallbackBanks : fallbackSecurities
  const apiInstitutions = form.value.businessType === 'BK' ? banks.value : securities.value

  return templates.map((template) => {
    const matchedInstitution = findApiInstitution(template, templates, apiInstitutions)

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
    (institution) =>
      normalizeOrganizationCode(institution.organizationCode) ===
      normalizeOrganizationCode(pendingOrganizationCode.value),
  ),
)
const selectedInstitution = computed(() =>
  visibleInstitutions.value.find(
    (institution) =>
      normalizeOrganizationCode(institution.organizationCode) ===
      normalizeOrganizationCode(form.value.organizationCode),
  ),
)

function isPendingInstitution(institution) {
  return (
    normalizeOrganizationCode(pendingOrganizationCode.value) ===
    normalizeOrganizationCode(institution?.organizationCode)
  )
}

const bankLogoRules = [
  ['국민', 'kb'],
  ['기업', 'ibk'],
  ['신한', 'shinhan'],
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
  ['하나', 'hana'],
]
const securityLogoRules = [
  ['미래에셋', 'Mirae.svg'],
  ['한국투자', 'KoreaInvestment.svg'],
  ['KB', 'KB.svg'],
  ['삼성', 'Samsung.svg'],
  ['NH', 'NH.svg'],
  ['교보', 'Kyobo.svg'],
  ['키움', 'Kiwoom.svg'],
  ['SK', 'SK.png'],
  ['유안타', 'Yuanta.svg'],
  ['대신', 'Daesin.svg'],
  ['한화', 'Hanhwa.svg'],
  ['하나', 'Hana.svg'],
  ['신한', 'Shinhan.svg'],
  ['DB', 'DB.svg'],
  ['유진', 'Eugene.svg'],
  ['메리츠', 'Meritz.png'],
  ['IBK', 'IBK.svg'],
]

function institutionLogo(institution, selected, businessType = form.value.businessType) {
  if (businessType === 'BK') {
    const logoKey =
      institution.logoKey ||
      bankLogoRules.find(([name]) => institution.displayName.includes(name))?.[1] ||
      'kb'
    return bankAssetsByFilename[bankLogoFilenames[logoKey]]
  }

  const logoFilename =
    institution.logoFilename ||
    securityLogoRules.find(([name]) => institution.displayName.includes(name))?.[1] ||
    'Mirae.svg'
  return securitiesAssetsByFilename[logoFilename] || securitiesAssetsByFilename['Mirae.svg']
}

function connectedInstitutionLogo(connection) {
  if (connection.businessType !== 'BK') {
    return institutionLogo(connection.institution, false, connection.businessType)
  }

  return bankAccountBlockIcon(connection.accounts[0])
}

function isInstitutionConnected(institution) {
  return connectedInstitutions.value.some(
    (connection) =>
      connection.businessType === form.value.businessType &&
      connection.institution.organizationCode === institution.organizationCode &&
      connection.accounts.some((account) => accountConnectionStatus(account) === 'active'),
  )
}

function markConnected() {
  if (route.params.assetType === 'military-savings') {
    onboarding.updateForm({ militarySavingsConnected: true })
  }
  if (route.params.assetType === 'salary-account') {
    onboarding.updateForm({ salaryAccountConnected: true })
  }
  if (route.params.assetType === 'personal-assets') {
    onboarding.updateForm({ accountsConnected: true })
  }
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
  showConnectedSummary.value =
    connectedInstitutions.value.length > 0 && !isAdditionalConnection.value
}

async function restoreConnectionState() {
  try {
    await accountsStore.load()
    restoreConnectedInstitutions(accountsStore.accounts)
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
  pendingOrganizationCode.value = ''
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
  const normalizedCode = normalizeOrganizationCode(organizationCode)
  const institution = visibleInstitutions.value.find(
    (item) => normalizeOrganizationCode(item.organizationCode) === normalizedCode,
  )
  if (!institution || isInstitutionConnected(institution)) {
    return
  }

  pendingOrganizationCode.value =
    normalizeOrganizationCode(pendingOrganizationCode.value) === normalizedCode
      ? ''
      : normalizedCode
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
    await Promise.all(accountsToRemove.map((account) => accountsStore.disconnect(account)))
    const connection = {
      id: `${form.value.businessType}-${form.value.organizationCode}-${Date.now()}`,
      businessType: form.value.businessType,
      institution: { ...selectedInstitution.value },
      accounts: selectedAccounts,
    }
    const existingConnectionIndex = connectedInstitutions.value.findIndex(
      (item) =>
        item.businessType === connection.businessType &&
        item.institution.organizationCode === connection.institution.organizationCode,
    )

    if (existingConnectionIndex >= 0) {
      connectedInstitutions.value.splice(existingConnectionIndex, 1, connection)
    } else {
      connectedInstitutions.value.push(connection)
    }
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
  const source = String(route.query.source || '')
  const destination =
    source === 'investment-plan'
      ? {
          name:
            route.query.returnTo === 'investment-plan-edit'
              ? 'investment-plan-edit'
              : 'investment-plan-create',
        }
      : destinations[source]

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

  const userId = Number(localStorage.getItem('userId')) || 0
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
    await accountsStore.connect(
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
    const connectedAccounts = await accountsStore.load({
      force: true,
      config: { signal: requestController.signal },
    })
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
  await restoreConnectionState()
  loadingInstitutions.value = false
})

onBeforeUnmount(abortAccountRequest)
</script>

<template>
  <main class="codef-connect screen">
    <OnboardingStepIntro
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
    />

    <section
      v-if="loadingInstitutions"
      class="step-content connection-skeleton"
      aria-busy="true"
      aria-label="연동 정보 불러오는 중"
    >
      <span class="connection-skeleton__label" />
      <div class="connection-skeleton__types">
        <span
          v-if="!isSecuritiesOnly"
          class="connection-skeleton__card"
        />
        <span
          v-if="allowsSecurities"
          class="connection-skeleton__card"
        />
      </div>
      <span class="connection-skeleton__button" />
    </section>

    <section
      v-else
      class="step-content"
    >
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
              :src="connectedInstitutionLogo(connection)"
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
        <BaseTooltip
          v-if="!isAdditionalConnection && form.businessType === 'BK'"
          class="additional-tip"
        >
          💡 군적금 계좌가 있다면 연동해보세요!
        </BaseTooltip>
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
              <img
                class="type-button-arrow"
                :src="detailViewIcon"
                alt=""
                aria-hidden="true"
              >
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
              <img
                class="type-button-arrow"
                :src="detailViewIcon"
                alt=""
                aria-hidden="true"
              >
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
              <img
                class="selected-institution-arrow"
                :src="detailViewIcon"
                alt=""
                aria-hidden="true"
              >
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
      v-if="!loadingInstitutions && showConnectedSummary"
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

    <BaseButton
      v-if="!loadingInstitutions && !showConnectedSummary"
      class="connect-submit-button"
      variant="primary"
      size="lg"
      block
      :loading="loading"
      @click="submit"
    >
      {{
        loading
          ? '연결 중...'
          : canSubmit
            ? `${form.businessType === 'BK' ? '은행' : '증권'} 계좌 불러오기`
            : '계좌 연결하기'
      }}
    </BaseButton>

    <BaseBottomSheet
      v-model="institutionModalOpen"
      :title="form.businessType === 'BK' ? '은행 계좌 연동' : '증권 계좌 연동'"
      :caption="`자산을 연결할 ${form.businessType === 'BK' ? '은행' : '증권사'}을 선택해주세요. 한 번에 하나씩만 가능해요.`"
      @close="closeInstitutionModal"
    >
      <BaseTooltip
        v-if="form.businessType === 'BK'"
        class="sheet-tip"
      >
        💡 군적금 및 나라사랑통장이 있는 은행은 필수 연동해주세요.
      </BaseTooltip>
      <div class="institution-list">
        <button
          v-for="institution in visibleInstitutions"
          :key="institution.organizationCode"
          type="button"
          class="institution-row"
          :class="{
            selected: isPendingInstitution(institution),
            connected: isInstitutionConnected(institution),
          }"
          :aria-label="
            isPendingInstitution(institution)
              ? `${institution.displayName} 선택됨`
              : isInstitutionConnected(institution)
                ? `${institution.displayName} 연결됨`
                : `${institution.displayName} 선택`
          "
          :disabled="isInstitutionConnected(institution)"
          @click="togglePendingInstitution(institution.organizationCode)"
        >
          <span class="institution-row__content">
            <img
              class="institution-row__logo"
              :src="institutionLogo(institution, false)"
              alt=""
            >
            <span class="institution-row__name">{{ institution.displayName }}</span>
          </span>
          <img
            v-if="isPendingInstitution(institution)"
            class="institution-row__check"
            :src="selectedCheckIcon"
            alt=""
            aria-hidden="true"
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

      <template #footer>
        <div class="institution-sheet-footer">
          <PrimaryButton
            variant="green"
            :disabled="!pendingInstitution"
            @click="confirmInstitution"
          >
            {{
              pendingInstitution ? `${pendingInstitution.displayName} 선택` : '기관을 선택해주세요'
            }}
          </PrimaryButton>
        </div>
      </template>
    </BaseBottomSheet>

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

    <BaseBottomSheet
      v-model="accountsModalOpen"
      title="계좌 불러오기"
      :caption="`${selectedInstitution?.displayName} 계좌를 ${discoveredAccounts.length}개 발견했어요! 연동할 계좌를 모두 선택해주세요.`"
      @close="closeAccountsModal"
    >
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

      <template #footer>
        <div class="accounts-sheet-footer">
          <PrimaryButton
            variant="green"
            :disabled="accountsConfirming || !selectedAccountIds.length"
            @click="confirmAccounts"
          >
            {{ accountsConfirming ? '계좌 저장 중...' : '선택한 계좌 불러오기' }}
          </PrimaryButton>
        </div>
      </template>
    </BaseBottomSheet>
  </main>
</template>

<style scoped>
.codef-connect {
  position: relative;
  display: flex;
  min-height: 100dvh;
  flex-direction: column;
  padding: 0 16px 40px 20px;
  background: var(--ui-background);
}

.step-content {
  display: flex;
  flex: 1;
  flex-direction: column;
  padding: 22px 6px 20px;
}

.connection-skeleton {
  gap: 18px;
}

.connection-skeleton > span,
.connection-skeleton__card {
  position: relative;
  overflow: hidden;
  border-radius: 18px;
  background: var(--ui-light-gray);
}

.connection-skeleton > span::after,
.connection-skeleton__card::after {
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, transparent, rgb(255 255 255 / 55%), transparent);
  content: '';
  transform: translateX(-100%);
  animation: connection-skeleton-shimmer 1.25s ease-in-out infinite;
}

.connection-skeleton__label {
  width: 92px;
  height: 22px;
}

.connection-skeleton__types {
  display: flex;
  flex-direction: column;
  gap: var(--space-14);
}

.connection-skeleton__card {
  width: 100%;
  height: 76px;
  border: 1px solid var(--ui-border);
  background: var(--white);
}

.connection-skeleton__button {
  width: 100%;
  height: 56px;
  margin-top: auto;
  border-radius: var(--radius-xl);
}

@keyframes connection-skeleton-shimmer {
  to {
    transform: translateX(100%);
  }
}

.institution-type {
  padding: 0;
  border: 0;
  margin: 0;
}

.institution-type legend {
  margin-bottom: var(--space-10);
  color: var(--olive-400);
  font-size: var(--text-md);
  font-weight: 700;
  line-height: 24px;
}

.type-buttons {
  display: flex;
  flex-direction: column;
  gap: var(--space-14);
}

.type-buttons button {
  position: relative;
  display: flex;
  width: 100%;
  flex: 0 0 auto;
  min-height: 76px;
  align-items: center;
  justify-content: flex-start;
  padding: 14px 18px;
  border: 1px solid var(--ui-border);
  border-radius: var(--radius-lg);
  background: var(--white);
  box-shadow: 0 2px 8px rgb(31 41 55 / 5%);
  color: var(--ui-text);
  cursor: pointer;
  font-size: var(--text-md);
  font-weight: 700;
  text-align: left;
  transition:
    border-color 0.16s ease,
    background-color 0.16s ease,
    box-shadow 0.16s ease;
}

.type-buttons button.selected {
  border-color: var(--green-500);
  background: var(--green-50);
  color: var(--green-700);
  box-shadow: 0 4px 12px rgb(59 225 120 / 12%);
}

.type-buttons button {
  padding-right: 18px;
}

.type-button-arrow {
  width: 24px;
  height: 24px;
  margin-left: auto;
}

.type-buttons .type-buttons__securities-only {
  width: 100%;
}

.securities-connection-state {
  display: grid;
  gap: 3px;
  padding: 16px;
  margin-bottom: 18px;
  border-radius: var(--radius-lg);
  background: rgb(236 236 236 / 35%);
}

.securities-connection-state strong {
  color: var(--gray-700);
  font-size: var(--text-sm);
  line-height: 1.5;
}

.securities-connection-state span {
  color: var(--gray-500);
  font-size: var(--text-xs);
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
  color: var(--olive-400);
  font-size: var(--text-sm);
  line-height: 24px;
}

.connected-card {
  display: flex;
  min-height: 70px;
  align-items: center;
  gap: var(--space-12);
  padding: 11px 16px;
  border-radius: 24px;
  background: var(--white);
}

.connected-card-icon {
  display: grid;
  width: 42px;
  height: 42px;
  flex: 0 0 42px;
  place-items: center;
  border-radius: 13px;
  background: var(--gray-100);
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
  gap: var(--space-8);
}

.connected-card-copy b {
  color: var(--ui-text);
  font-size: var(--text-sm);
}

.connected-card-copy small {
  padding: 2px 7px;
  border-radius: var(--radius-lg);
  background: var(--green-100);
  color: var(--green-700);
  font-size: 9px;
  font-weight: 700;
}

.connected-card-copy em {
  overflow: hidden;
  max-width: 210px;
  color: var(--gray-500);
  font-size: 10px;
  font-style: normal;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.connected-card-check {
  margin-left: auto;
  color: var(--green-400);
  font-size: var(--text-lg);
  font-weight: 700;
}

.additional-tip {
  margin: auto 0 0;
}

.summary-actions {
  display: grid;
  grid-template-columns: 0.68fr 1.55fr;
  gap: var(--space-12);
  margin: 0 4px;
}

.summary-actions button {
  min-height: 56px;
  border: 0;
  border-radius: var(--radius-xl);
  background: var(--ui-light-gray);
  color: var(--gray-500);
  cursor: pointer;
  font-size: var(--text-md);
  font-weight: 700;
}

.summary-actions button:last-child {
  background: var(--green-500);
  color: var(--olive-800);
}

.account-fields {
  display: grid;
  gap: 18px;
}

.selected-institution-field {
  display: grid;
  gap: var(--space-10);
}

.selected-institution-field > strong,
.account-fields > label {
  padding-inline: 10px;
  color: var(--olive-400);
  font-size: var(--text-md);
  font-weight: 700;
  line-height: 24px;
}

.selected-institution-card {
  display: flex;
  width: 100%;
  min-height: 88px;
  align-items: center;
  gap: var(--space-14);
  padding: 20px;
  border: 0;
  border-radius: var(--radius-xl);
  background: var(--white);
  color: var(--ui-text);
  cursor: pointer;
  text-align: left;
}

.selected-institution-logo {
  display: grid;
  width: 48px;
  height: 48px;
  flex: 0 0 48px;
  place-items: center;
  border-radius: var(--radius-md);
  background: var(--gray-100);
  overflow: hidden;
}

.selected-institution-logo img {
  width: 48px;
  height: 48px;
  object-fit: contain;
}

.selected-institution-copy {
  display: grid;
  gap: 2px;
}

.selected-institution-copy small {
  color: var(--gray-400);
  font-size: var(--text-xs);
  line-height: 18px;
}

.selected-institution-copy b {
  color: var(--ui-text);
  font-size: var(--text-md);
  line-height: 24px;
}

.selected-institution-arrow {
  width: 24px;
  height: 24px;
  margin-left: auto;
}

label {
  display: grid;
  gap: var(--space-8);
  color: var(--gray-800);
  font-size: var(--text-sm);
  font-weight: 700;
}

.account-fields input {
  height: 44px;
  border-width: 1.5px;
  border-radius: 15px;
}

label small {
  color: var(--gray-500);
  font-size: 11px;
  font-weight: 400;
}

input,
select {
  width: 100%;
  height: 52px;
  padding: 0 14px;
  border: 1px solid var(--ui-border);
  border-radius: 12px;
  outline: 0;
  background: var(--white);
  color: var(--ui-text);
  font: inherit;
  font-size: var(--text-sm);
  font-weight: 400;
}

input:focus,
select:focus {
  border-color: var(--green-600);
}

.form-error {
  margin: 2px 0 0;
  color: var(--orange-700);
  font-size: 13px;
}

.connect-submit-button {
  width: calc(100% - 8px);
  min-height: 56px;
  margin: 0 4px;
}

.connect-submit-button:disabled {
  background: var(--ui-light-gray);
  color: var(--gray-400);
}

.institution-backdrop {
  position: absolute;
  z-index: 20;
  display: flex;
  align-items: flex-end;
  padding: 0;
  background: rgb(0 0 0 / 48%);
  inset: 0;
}

.sheet-close {
  position: absolute;
  top: 30px;
  right: 20px;
  width: 24px;
  height: 24px;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--gray-800);
  cursor: pointer;
  font-size: 28px;
  line-height: 24px;
}

.sheet-tip {
  width: 100%;
  max-width: none;
  margin: 0 0 20px;
}

.institution-list {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 91.65px));
  grid-auto-rows: auto;
  align-content: start;
  justify-content: space-between;
  column-gap: 14px;
  row-gap: 23px;
  height: 390px;
  min-height: 0;
  flex: 1 1 390px;
  padding: 0 10px;
  overflow-y: auto;
  overscroll-behavior: contain;
  scrollbar-width: none;
  -webkit-overflow-scrolling: touch;
}

.institution-list::-webkit-scrollbar {
  display: none;
  width: 0;
  height: 0;
}

.institution-row {
  position: relative;
  display: flex;
  width: 100%;
  max-width: 91.65px;
  aspect-ratio: 1;
  align-items: center;
  justify-content: center;
  justify-self: center;
  padding: 0;
  border: 0;
  border-radius: 50%;
  background: rgb(51 51 51 / 5%);
  cursor: pointer;
  transition:
    border-color 0.16s ease,
    background-color 0.16s ease,
    box-shadow 0.16s ease;
}

.institution-row.selected {
  border: 1px solid var(--green-600, #3be178);
  background: var(--green-200, #cbffe0);
  box-shadow: 0 0 4px var(--green-200, #cbffe0);
}

.institution-row.connected {
  cursor: default;
  opacity: 0.55;
}

.institution-row__content {
  display: flex;
  min-width: 0;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  gap: 5px;
}

.institution-row .institution-row__logo {
  display: block;
  width: 38px;
  height: 40px;
  object-fit: contain;
}

.institution-row__name {
  max-width: 78px;
  overflow: hidden;
  color: var(--ui-sub-title, #757575);
  font-family: var(--body-body-xsmall-regular-font-family, 'Pretendard-Regular', sans-serif);
  font-size: var(--body-body-xsmall-regular-font-size, 12px);
  font-weight: var(--body-body-xsmall-regular-font-weight, 400);
  line-height: var(--body-body-xsmall-regular-line-height, 130%);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.institution-row .institution-row__check {
  position: absolute;
  top: 11px;
  right: 0;
  width: 20px;
  height: 20px;
}

@media (max-width: 360px) {
  .institution-list {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    column-gap: 10px;
    padding: 0 4px;
  }
}

.institution-connected-check {
  position: absolute;
  right: 0;
  bottom: 0;
  display: grid;
  width: 21px;
  height: 21px;
  place-items: center;
  border: 2px solid var(--white);
  border-radius: 50%;
  background: var(--green-400);
  color: var(--white);
  font-size: var(--text-xs);
  font-weight: 700;
}

.institution-empty {
  grid-column: 1 / -1;
  padding: 50px 10px;
  margin: 0;
  color: var(--gray-500);
  font-size: 13px;
  text-align: center;
}

.institution-sheet-footer {
  width: 100%;
}

.institution-sheet-footer :deep(.primary-button) {
  width: 100%;
  min-height: 56px;
  margin: 0;
  background: var(--green-500);
  color: var(--olive-800);
  font-size: 13px;
}

.institution-sheet-footer :deep(.primary-button:disabled) {
  background: var(--ui-light-gray);
  color: var(--gray-400);
}

@media (max-height: 760px) {
  .institution-list {
    height: auto;
    flex-basis: 280px;
  }

  .sheet-tip {
    margin: 0 0 20px;
  }
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
  background: var(--white);
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
  border: 8px solid var(--gray-200);
  border-right-color: var(--green-400);
  border-radius: 50%;
  animation: loading-spin 0.85s linear infinite;
}

.loading-copy {
  text-align: center;
}

.loading-copy h2 {
  margin: 0;
  color: var(--ui-text);
  font-size: 20px;
  line-height: 30px;
}

.loading-copy p {
  margin: 4px 0 25px;
  color: var(--gray-500);
  font-size: var(--text-xs);
}

.loading-bank-card {
  display: flex;
  min-height: 88px;
  align-items: center;
  gap: var(--space-12);
  padding: 16px 20px;
  border: 1px solid var(--green-100);
  border-radius: var(--radius-xl);
  background: var(--white);
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
  color: var(--ui-text);
  font-size: var(--text-h4);
}

.empty-sheet > header p {
  margin: 4px 0 26px;
  color: var(--gray-600);
  font-size: var(--text-sm);
}

.empty-bank-summary {
  display: flex;
  align-items: center;
  gap: var(--space-14);
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
  color: var(--gray-400);
  font-size: 22px;
}

.empty-account-content p {
  margin: 0 0 27px;
  color: var(--gray-600);
  font-size: var(--text-sm);
  line-height: 23px;
}

.empty-account-content button {
  width: 257px;
  min-height: 56px;
  border: 0;
  border-radius: var(--radius-xl);
  background: var(--ui-light-gray);
  color: var(--gray-400);
  font-size: var(--text-md);
  font-weight: 700;
}

.accounts-bank-card {
  display: flex;
  min-height: 88px;
  align-items: center;
  gap: var(--space-14);
  padding: 20px;
  margin-top: 0;
  border-radius: var(--radius-xl);
  background: var(--ui-background);
}

.discovered-account-list {
  min-height: 0;
  flex: 1;
  margin-top: var(--space-20);
  overflow-y: auto;
}

.discovered-account-wrap + .discovered-account-wrap {
  border-top: 1px solid var(--gray-100);
}

.discovered-account {
  display: flex;
  width: 100%;
  min-height: 82px;
  align-items: center;
  gap: var(--space-12);
  padding: 14px 20px;
  border: 0;
  background: transparent;
  color: var(--ui-text);
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
  gap: var(--space-8);
}

.discovered-account-copy b {
  overflow: hidden;
  font-size: 15px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.discovered-account-copy small {
  padding: 2px 8px;
  border-radius: var(--radius-lg);
  background: var(--ui-light-gray);
  color: var(--gray-600);
  font-size: 10px;
  font-weight: 700;
}

.discovered-account-copy small.required,
.discovered-account-copy small.recommended {
  background: var(--green-100);
  color: var(--green-700);
}

.discovered-account-copy em {
  color: var(--gray-500);
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
  border: 1.5px solid var(--gray-300);
  border-radius: 50%;
  color: transparent;
  font-size: var(--text-xs);
  font-style: normal;
}

.discovered-account.selected > i {
  border-color: var(--green-600);
  background: var(--green-600);
  color: var(--white);
}

.required-account-notice {
  padding: 8px 12px;
  margin: -5px 0 8px;
  border-radius: 8px;
  background: var(--orange-50);
  color: var(--orange-600);
  font-size: 11px;
  text-align: center;
}

.accounts-sheet-footer {
  width: 100%;
}

.accounts-sheet-footer :deep(.primary-button) {
  width: 100%;
  min-height: 56px;
  margin: 0;
  background: var(--green-500);
  color: var(--olive-800);
  font-size: var(--text-sm);
}

.accounts-sheet-footer :deep(.primary-button:disabled) {
  background: var(--ui-light-gray);
  color: var(--gray-400);
}

.institution-sheet-enter-active,
.institution-sheet-leave-active {
  transition: background 0.2s ease;
}

.institution-sheet-enter-active .institution-sheet,
.institution-sheet-leave-active .institution-sheet,
.institution-sheet-enter-from,
.institution-sheet-leave-to {
  background: transparent;
}

@media (max-height: 760px) {
  .account-fields {
    gap: var(--space-10);
  }

  input,
  select {
    height: 46px;
  }
}
</style>
