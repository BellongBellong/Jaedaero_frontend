<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

import securityDefault from '@/assets/onboarding/institutions/security-0.svg'
import { getAccounts } from '@/features/accounts/api/accounts.api'
import { bankAccountIcon } from '@/features/accounts/composables/bankAccountIconMapping'
import {
  accountConnectionStatus,
  accountConnectionStatusLabel,
  accountInstitutionKey,
  accountInstitutionName,
} from '@/features/accounts/composables/institutionMapping'

const router = useRouter()
const accounts = ref([])
const loading = ref(true)
const errorMessage = ref('')

const securityAssets = import.meta.glob('@/assets/onboarding/institutions/security-*.svg', {
  eager: true,
  import: 'default',
  query: '?url',
})
const securityLogoIndexByCode = {
  '0238': 0,
  '0243': 1,
  '0218': 2,
  '0240': 3,
  '0247': 4,
  '0261': 5,
  '0264': 6,
  '0266': 7,
  '0209': 8,
  '0267': 9,
  '0269': 10,
  '0270': 11,
  '0278': 12,
  '0279': 13,
  '0280': 14,
  '0287': 15,
  '0225': 16,
}

const accountTypeLabels = {
  MILITARY_SAVINGS: '장병내일준비적금',
  CHECKING: '입출금 통장',
  SAVINGS: '예적금계좌',
  INVESTMENT: '투자 계좌',
  SALARY: '급여 통장',
}

function institutionCategory(account) {
  const businessType = String(
    account.businessType || account.institutionType || account.financialBusinessType || '',
  ).toUpperCase()
  const institutionName = accountInstitutionName(account)

  if (['ST', 'SECURITIES', 'SECURITY', 'INVESTMENT'].includes(businessType)) {
    return 'securities'
  }
  if (account.accountType === 'INVESTMENT' || /증권|금융투자/.test(institutionName)) {
    return 'securities'
  }
  return 'banks'
}

const connectedInstitutions = computed(() => {
  const grouped = new Map()

  accounts.value.forEach((account) => {
    const institutionKey = accountInstitutionKey(account)
    const status = accountConnectionStatus(account)
    const groupKey = `${institutionKey}:${status}`
    if (!grouped.has(groupKey)) {
      grouped.set(groupKey, {
        institutionKey,
        bankName: accountInstitutionName(account),
        category: institutionCategory(account),
        status,
        accounts: [],
      })
    }
    grouped.get(groupKey).accounts.push(account)
  })

  return Array.from(
    grouped.values(),
    ({ institutionKey, bankName, category, status, accounts: institutionAccounts }) => ({
      institutionKey,
      bankName,
      category,
      status,
      statusLabel: accountConnectionStatusLabel(institutionAccounts[0]),
      accounts: institutionAccounts,
      descriptions: institutionAccounts.map(
        ({ accountName, accountType }) =>
          accountName || accountTypeLabels[accountType] || '연결 계좌',
      ),
    }),
  )
})

const institutionSections = computed(() => [
  {
    key: 'banks',
    title: '연동한 은행 목록',
    institutions: connectedInstitutions.value.filter(({ category }) => category === 'banks'),
  },
  {
    key: 'securities',
    title: '연동한 증권사 목록',
    institutions: connectedInstitutions.value.filter(({ category }) => category === 'securities'),
  },
])

function institutionIcon(institution) {
  if (institution.category === 'securities') {
    const logoIndex = securityLogoIndexByCode[institution.institutionKey]
    return (
      securityAssets[`/src/assets/onboarding/institutions/security-${logoIndex ?? 0}.svg`] ||
      securityDefault
    )
  }
  return bankAccountIcon(institution.accounts[0])
}

async function loadAccounts() {
  loading.value = true
  errorMessage.value = ''
  try {
    accounts.value = await getAccounts()
  } catch {
    errorMessage.value = '연동한 은행을 불러오지 못했어요.'
  } finally {
    loading.value = false
  }
}

onMounted(loadAccounts)
</script>

<template>
  <main class="connected-banks screen">
    <button
      type="button"
      class="back-button"
      aria-label="마이페이지로 돌아가기"
      @click="router.back()"
    >
      ‹
    </button>

    <section class="content">
      <p
        v-if="loading"
        class="state-message"
      >
        연동한 은행을 불러오고 있어요.
      </p>
      <div
        v-else-if="errorMessage"
        class="state-message"
      >
        <p>{{ errorMessage }}</p>
        <button
          type="button"
          @click="loadAccounts"
        >
          다시 시도
        </button>
      </div>
      <div
        v-else-if="connectedInstitutions.length === 0"
        class="state-message"
      >
        <p>아직 연동한 은행이 없어요.</p>
        <small>은행을 추가해 자산을 한눈에 관리해보세요.</small>
      </div>

      <template v-else>
        <section
          v-for="section in institutionSections"
          v-show="section.institutions.length"
          :key="section.key"
          class="institution-section"
        >
          <h1>{{ section.title }}</h1>
          <ul>
            <li
              v-for="institution in section.institutions"
              :key="`${institution.institutionKey}-${institution.status}`"
              tabindex="0"
              role="button"
              :aria-label="`${institution.bankName} ${institution.statusLabel} 계좌 관리`"
              @click="
                router.push({
                  name: 'connected-bank-management',
                  params: { institutionKey: institution.institutionKey },
                })
              "
              @keydown.enter="
                router.push({
                  name: 'connected-bank-management',
                  params: { institutionKey: institution.institutionKey },
                })
              "
            >
              <span class="bank-icon">
                <img
                  :src="institutionIcon(institution)"
                  alt=""
                >
              </span>
              <span class="bank-copy">
                <span class="bank-heading">
                  <b>{{ institution.bankName }}</b>
                  <em class="account-count">{{ institution.accounts.length }}개</em>
                  <em
                    class="account-status"
                    :class="`account-status--${institution.status}`"
                  >{{ institution.statusLabel }}</em>
                </span>
                <small>{{ institution.descriptions.join(', ') }}</small>
              </span>
              <span
                v-if="institution.status === 'active'"
                class="connected-check"
                aria-hidden="true"
              >›</span>
            </li>
          </ul>
        </section>
      </template>
    </section>

    <footer>
      <button
        type="button"
        class="cancel-button"
        @click="router.back()"
      >
        취소
      </button>
      <button
        type="button"
        class="add-button"
        @click="
          router.push({
            name: 'connect-codef-bank',
            params: { assetType: 'personal-assets' },
            query: { source: 'my-page' },
          })
        "
      >
        추가 연동하기
      </button>
    </footer>
  </main>
</template>

<style scoped>
.connected-banks {
  display: flex;
  min-height: 100%;
  flex-direction: column;
  padding: 45px 20px 20px;
  background: #fafafa;
  color: #333;
}

.back-button {
  width: 24px;
  height: 35px;
  padding: 0;
  border: 0;
  background: transparent;
  color: #444;
  font-size: 40px;
  line-height: 28px;
  text-align: left;
}

.content {
  margin-top: 41px;
}

h1 {
  margin: 0 0 13px;
  color: #7c8e77;
  font-size: 15px;
}

.institution-section + .institution-section {
  margin-top: 28px;
}

ul {
  display: grid;
  padding: 0;
  margin: 0;
  gap: 10px;
  list-style: none;
}

li {
  display: flex;
  min-height: 91px;
  align-items: center;
  gap: 14px;
  padding: 16px 20px;
  border-radius: 27px;
  background: #fff;
  cursor: pointer;
}

li:focus-visible {
  outline: 2px solid #58f49a;
  outline-offset: 2px;
}

.bank-icon {
  display: grid;
  width: 49px;
  height: 49px;
  flex: 0 0 49px;
  overflow: hidden;
  border-radius: 12px;
  background: #f5f5f5;
  place-items: center;
}

.bank-icon img {
  width: 38px;
  height: 38px;
  object-fit: contain;
}

.bank-copy {
  display: grid;
  min-width: 0;
  gap: 5px;
}

.bank-heading {
  display: flex;
  align-items: center;
  gap: 10px;
}

.bank-heading b {
  overflow: hidden;
  font-size: 17px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.bank-heading em {
  padding: 3px 11px;
  border-radius: 15px;
  font-size: 12px;
  font-style: normal;
  font-weight: 700;
  white-space: nowrap;
}
.account-count,
.account-status--active {
  background: #e4fff0;
  color: #20ba5c;
}

.account-status--disconnected {
  background: #fff0f0;
  color: #e45757;
}

.bank-copy small {
  overflow: hidden;
  color: #999;
  font-size: 11px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.connected-check {
  margin-left: auto;
  color: #58f49a;
  font-size: 22px;
  font-weight: 700;
}

.state-message {
  padding: 54px 20px;
  border-radius: 27px;
  background: #fff;
  color: #999;
  text-align: center;
}

.state-message p {
  margin: 0 0 6px;
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

footer {
  display: flex;
  gap: 14px;
  margin-top: auto;
}

footer button {
  min-height: 56px;
  border: 0;
  border-radius: 29px;
  font-size: 16px;
  font-weight: 700;
}

.cancel-button {
  width: 110px;
  background: #ececec;
  color: #bdbdbd;
}

.add-button {
  flex: 1;
  background: #58f49a;
  color: #333;
}

@media (max-height: 700px) {
  .connected-banks {
    padding-top: 26px;
  }

  .content {
    margin-top: 24px;
  }

  li {
    min-height: 78px;
  }
}
</style>
