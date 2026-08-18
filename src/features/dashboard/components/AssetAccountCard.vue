<script setup>
import { computed } from 'vue'

import DetailLinkButton from '../../../common/components/navigation/DetailLinkButton.vue'
import AccountTitleHeader from '@/features/dashboard/components/AccountTitleHeader.vue'
import AssetAccountListItem from '@/features/dashboard/components/AssetAccountListItem.vue'

const props = defineProps({
  data: {
    type: Object,
    default: null,
  },
})

defineEmits(['view-all'])

const accounts = computed(() => props.data?.accounts ?? [])
const visibleAccounts = computed(() => accounts.value.slice(0, 3))
const totalAsset = computed(() => {
  if (Number.isFinite(Number(props.data?.totalAsset))) return Number(props.data.totalAsset)
  return accounts.value.reduce(
    (total, account) => total + Number(account.amount ?? account.balance ?? 0),
    0,
  )
})
const viewAllLabel = computed(() =>
  accounts.value.length > 0 ? `계좌 ${accounts.value.length}개 전체 보기` : '계좌 전체 보기',
)

function formatWon(value) {
  return `${Number(value || 0).toLocaleString('ko-KR')}원`
}
</script>

<template>
  <section class="asset-account-card">
    <AccountTitleHeader
      label="총 자산"
      :value="formatWon(totalAsset)"
    />

    <ul v-if="visibleAccounts.length">
      <AssetAccountListItem
        v-for="account in visibleAccounts"
        :key="account.id || account.accountId"
        :account="account"
      />
    </ul>

    <p
      v-else
      class="asset-account-card__empty"
    >
      연결된 계좌가 없어요.
    </p>

    <DetailLinkButton
      class="asset-account-card__more"
      @click="$emit('view-all')"
    >
      {{ viewAllLabel }}
    </DetailLinkButton>
  </section>
</template>

<style scoped>
.asset-account-card {
  display: flex;
  width: 100%;
  min-height: 378px;
  flex-direction: column;
  gap: 12px;
  padding: var(--space-20);
  border-radius: 28px;
  background: var(--white);
}

.asset-account-card ul {
  display: grid;
  gap: 8px;
  padding: 0;
  margin: 0;
  list-style: none;
}

.asset-account-card__more {
  display: flex;
  width: min(100%, 260px);
  height: 44px;
  flex: 0 0 auto;
  align-self: center;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 0 16px;
  border: 0;
  border-radius: 22px;
  background: var(--gray-200);
  color: var(--gray-400);
  cursor: pointer;
  font-family: var(--font-body);
  font-size: 14px;
  font-weight: var(--weight-bold);
  letter-spacing: -0.02em;
  line-height: 1.5;
}

.asset-account-card__more img {
  width: 7px;
  height: 11px;
}

.asset-account-card__empty {
  display: grid;
  min-height: 100px;
  place-items: center;
  margin: 0;
  color: var(--gray-400);
  font-size: 13px;
}
</style>
