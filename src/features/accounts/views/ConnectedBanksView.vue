<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

import bankBuilding from '@/assets/onboarding/icons/bank-building.png'
import bankIbk from '@/assets/onboarding/institutions/bank-ibk.svg'
import bankKb from '@/assets/onboarding/institutions/bank-kb.svg'
import bankKakao from '@/assets/onboarding/institutions/bank-kakao.svg'
import bankShinhan from '@/assets/onboarding/institutions/bank-shinhan.svg'
import bankToss from '@/assets/onboarding/institutions/bank-toss.svg'
import { getAccounts } from '@/features/accounts/api/accounts.api'

const router = useRouter()
const accounts = ref([])
const loading = ref(true)
const errorMessage = ref('')

const bankIcons = {
  KB국민은행: bankKb,
  국민은행: bankKb,
  'IBK 기업은행': bankIbk,
  기업은행: bankIbk,
  신한은행: bankShinhan,
  토스뱅크: bankToss,
  카카오뱅크: bankKakao,
}

const accountTypeLabels = {
  MILITARY_SAVINGS: '장병내일준비적금',
  CHECKING: '입출금 통장',
  SAVINGS: '예적금계좌',
  INVESTMENT: '투자 계좌',
  SALARY: '급여 통장',
}

const connectedBanks = computed(() => {
  const grouped = new Map()

  accounts.value.forEach((account) => {
    const bankName = account.bankName || '연결 은행'
    if (!grouped.has(bankName)) grouped.set(bankName, [])
    grouped.get(bankName).push(account)
  })

  return Array.from(grouped, ([bankName, bankAccounts]) => ({
    bankName,
    accounts: bankAccounts,
    descriptions: bankAccounts.map(
      ({ accountName, accountType }) =>
        accountName || accountTypeLabels[accountType] || '연결 계좌',
    ),
  }))
})

async function loadAccounts() {
  loading.value = true
  errorMessage.value = ''
  try {
    const userId = Number(localStorage.getItem('userId'))
    accounts.value = await getAccounts(userId || undefined)
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
      <h1>연동한 은행 목록</h1>

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
        v-else-if="connectedBanks.length === 0"
        class="state-message"
      >
        <p>아직 연동한 은행이 없어요.</p>
        <small>은행을 추가해 자산을 한눈에 관리해보세요.</small>
      </div>

      <ul v-else>
        <li
          v-for="bank in connectedBanks"
          :key="bank.bankName"
        >
          <span class="bank-icon">
            <img
              :src="bankIcons[bank.bankName] || bankBuilding"
              alt=""
            >
          </span>
          <span class="bank-copy">
            <span class="bank-heading">
              <b>{{ bank.bankName }}</b>
              <em>{{ bank.accounts.length }}개</em>
            </span>
            <small>{{ bank.descriptions.join(', ') }}</small>
          </span>
          <span
            class="connected-check"
            aria-label="연동 완료"
          >✓</span>
        </li>
      </ul>
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
        @click="router.push({ name: 'connect-accounts' })"
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
  background: #e4fff0;
  color: #20ba5c;
  font-size: 12px;
  font-style: normal;
  font-weight: 700;
  white-space: nowrap;
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
