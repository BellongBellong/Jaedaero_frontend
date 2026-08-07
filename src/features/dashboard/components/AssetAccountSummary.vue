<script setup>
import { computed } from 'vue'

import accountsavingBlock from '@/assets/icons/account/accountsavingBlock.png'
import assetBlock from '@/assets/icons/account/assetBlock.png'
import consumptionBlock from '@/assets/icons/account/consumptionBlock.png'
import investBlock from '@/assets/icons/account/investBlock.png'

const props = defineProps({
  data: {
    type: Object,
    default: null,
  },
})

defineEmits(['view-all'])

const accountIcons = {
  militarySavings: accountsavingBlock,
  salary: consumptionBlock,
  asset: assetBlock,
  investment: investBlock,
}

function accountGroup(account) {
  const type = String(account.accountType || account.type || '').toUpperCase()
  if (type === 'MILITARY_SAVINGS') return 'militarySavings'
  if (['SALARY', 'CHECKING'].includes(type)) return 'salary'
  if (['INVESTMENT', 'SECURITIES', 'SECURITY'].includes(type)) return 'investment'
  return 'asset'
}

function isKookminSecurities(account) {
  const label = `${account.bankName || ''} ${account.name || account.accountName || ''}`
  return /국민|KB/i.test(label)
}

const visibleAccounts = computed(() => {
  const accounts = props.data?.accounts ?? []
  const militarySavings = accounts
    .filter((account) => accountGroup(account) === 'militarySavings')
    .sort((first, second) => Number(second.amount || 0) - Number(first.amount || 0))[0]
  const salary = accounts
    .filter((account) => accountGroup(account) === 'salary')
    .sort((first, second) => Number(second.amount || 0) - Number(first.amount || 0))[0]
  const investment = accounts
    .filter((account) => accountGroup(account) === 'investment')
    .sort((first, second) => {
      const preferredDifference =
        Number(isKookminSecurities(second)) - Number(isKookminSecurities(first))
      return preferredDifference || Number(second.amount || 0) - Number(first.amount || 0)
    })[0]

  const prioritized = [militarySavings, salary, investment].filter(Boolean)
  const prioritizedIds = new Set(prioritized.map(({ id }) => id))
  const fallback = accounts
    .filter((account) => !prioritizedIds.has(account.id))
    .sort((first, second) => Number(second.amount || 0) - Number(first.amount || 0))

  return [...prioritized, ...fallback].slice(0, 3)
})

const totalAsset = computed(() => {
  if (Number.isFinite(Number(props.data?.totalAsset))) return Number(props.data.totalAsset)

  return (props.data?.accounts ?? []).reduce(
    (total, account) => total + Number(account.amount || 0),
    0,
  )
})

function formatWon(value) {
  return `${Number(value || 0).toLocaleString('ko-KR')}원`
}
</script>

<template>
  <div
    v-if="data"
    class="asset-account-summary"
  >
    <button
      type="button"
      class="asset-account-summary__total"
      @click="$emit('view-all')"
    >
      <span>총 자산</span>
      <strong>{{ formatWon(totalAsset) }}</strong>
      <span aria-hidden="true">›</span>
    </button>

    <ul v-if="visibleAccounts.length">
      <li
        v-for="account in visibleAccounts"
        :key="account.id"
      >
        <img
          :src="accountIcons[accountGroup(account)] || assetBlock"
          alt=""
          aria-hidden="true"
        >
        <span class="asset-account-summary__copy">
          <strong>{{ formatWon(account.amount) }}</strong>
          <span>{{ account.name || account.accountName }}</span>
        </span>
      </li>
    </ul>
    <p
      v-else
      class="asset-account-summary__empty"
    >
      연결된 자산이 없어요.
    </p>

    <button
      v-if="visibleAccounts.length"
      type="button"
      class="asset-account-summary__more"
      @click="$emit('view-all')"
    >
      전체 자산 보기 <span aria-hidden="true">›</span>
    </button>
  </div>

  <p
    v-else
    class="asset-account-summary__empty"
  >
    자산 현황이 없어요.
  </p>
</template>

<style scoped>
.asset-account-summary {
  display: grid;
  gap: 12px;
}

.asset-account-summary__total {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 0;
  border: 0;
  background: transparent;
  cursor: pointer;
  text-align: left;
}

.asset-account-summary__total > span {
  color: var(--gray-600);
  font-size: 14px;
}

.asset-account-summary__total > strong {
  color: var(--green-700);
  font-size: 16px;
  letter-spacing: -0.02em;
}

.asset-account-summary__total > span:last-child {
  margin-left: 2px;
  color: var(--gray-400);
  font-size: 26px;
  line-height: 0.8;
}

.asset-account-summary ul {
  display: grid;
  gap: 8px;
  padding: 0;
  margin: 0;
  list-style: none;
}

.asset-account-summary li {
  position: relative;
  isolation: isolate;
  display: flex;
  min-height: 68px;
  align-items: center;
  gap: 14px;
  padding: 10px var(--space-20);
  overflow: hidden;
  border: 1px solid rgb(255 255 255 / 58%);
  border-radius: 20px;
  background:
    linear-gradient(90deg, rgb(255 255 255 / 10%), rgb(255 255 255 / 4%)), rgb(255 255 255 / 10%);
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / 72%),
    0 8px 24px rgb(51 51 51 / 5%);
  backdrop-filter: blur(18px) saturate(120%);
  -webkit-backdrop-filter: blur(18px) saturate(120%);
}

.asset-account-summary li::before {
  position: absolute;
  z-index: -1;
  inset: 0;
  background: radial-gradient(circle at 8% 0%, rgb(255 255 255 / 50%), transparent 46%);
  content: '';
  pointer-events: none;
}

.asset-account-summary li > img {
  flex: 0 0 auto;
  width: 30px;
  height: 30px;
  object-fit: contain;
}

.asset-account-summary__copy {
  display: grid;
  min-width: 0;
  gap: 1px;
}

.asset-account-summary__copy strong {
  color: var(--gray-900);
  font-size: 14px;
}

.asset-account-summary__copy span {
  overflow: hidden;
  color: var(--gray-400);
  font-size: 12px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.asset-account-summary__more {
  justify-self: end;
  padding: 2px 0;
  border: 0;
  background: transparent;
  color: var(--gray-400);
  cursor: pointer;
  font-size: 12px;
}

.asset-account-summary__more span {
  font-size: 20px;
  vertical-align: -2px;
}

.asset-account-summary__empty {
  display: grid;
  min-height: 180px;
  place-items: center;
  margin: 0;
  color: var(--gray-500);
  font-size: 13px;
}
</style>
