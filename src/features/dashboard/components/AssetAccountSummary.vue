<script setup>
import { computed } from 'vue'

import arrowIcon from '@/assets/icons/arrow.svg'
import accountsavingBlock from '@/assets/icons/account/accountsavingBlock.png'
import assetBlock from '@/assets/icons/account/assetBlock.png'
import consumptionBlock from '@/assets/icons/account/consumptionBlock.png'
import investBlock from '@/assets/icons/account/investBlock.png'
import { isSecuritiesAccount } from '@/features/accounts/composables/institutionMapping'
import DetailLinkButton from '../../../common/components/navigation/DetailLinkButton.vue'

const props = defineProps({
  data: {
    type: Object,
    default: null,
  },
})

defineEmits(['view-all'])

const accountIcons = {
  account: consumptionBlock,
  savings: accountsavingBlock,
  investment: investBlock,
}

function accountGroup(account) {
  if (isSecuritiesAccount(account)) return 'investment'
  const type = String(account.accountType || account.type || '').toUpperCase()
  if (['MILITARY_SAVINGS', 'SAVINGS', 'INSTALLMENT_SAVINGS'].includes(type)) return 'savings'
  return 'account'
}

const groupedAssets = computed(() => {
  const accounts = props.data?.accounts ?? []
  const totals = accounts.reduce(
    (result, account) => {
      result[accountGroup(account)] += Number(account.amount ?? account.balance ?? 0)
      return result
    },
    { account: 0, savings: 0, investment: 0 },
  )

  return [
    { id: 'account', label: '계좌 자산', amount: totals.account },
    { id: 'savings', label: '적금 자산', amount: totals.savings },
    { id: 'investment', label: '투자 자산', amount: totals.investment },
  ]
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
      <img
        class="asset-account-summary__arrow"
        :src="arrowIcon"
        alt=""
        aria-hidden="true"
      >
    </button>

    <ul>
      <li
        v-for="asset in groupedAssets"
        :key="asset.id"
      >
        <img
          :src="accountIcons[asset.id] || assetBlock"
          alt=""
          aria-hidden="true"
        >
        <span class="asset-account-summary__copy">
          <strong>{{ formatWon(asset.amount) }}</strong>
          <span>{{ asset.label }}</span>
        </span>
      </li>
    </ul>

    <DetailLinkButton
      class="asset-account-summary__more"
      @click="$emit('view-all')"
    >
      전체 자산 보기
    </DetailLinkButton>
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

.asset-account-summary__arrow {
  width: 7px;
  height: 11px;
  margin-left: 2px;
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
  display: flex;
  align-items: center;
  justify-self: end;
  gap: 5px;
  padding: 2px 0;
  border: 0;
  background: transparent;
  color: var(--gray-400);
  cursor: pointer;
  font-size: 12px;
}

.asset-account-summary__more img {
  width: 7px;
  height: 11px;
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
