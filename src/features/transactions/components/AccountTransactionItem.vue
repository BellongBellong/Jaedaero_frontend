<script setup>
import { transactionCategoryIcon } from '@/features/transactions/composables/transactionCategoryIconMapping'

const props = defineProps({
  transaction: {
    type: Object,
    required: true,
  },
})

defineEmits(['select'])

const isIncome = () => String(props.transaction.transactionType).toUpperCase() === 'INCOME'

function formatAmount() {
  const sign = isIncome() ? '+' : '-'
  return `${sign}${Number(props.transaction.amount || 0).toLocaleString('ko-KR')}원`
}

function formatDate(value) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value || ''
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hour = date.getHours()
  const minute = String(date.getMinutes()).padStart(2, '0')
  return `${month}.${day} ${hour}:${minute}`
}
</script>

<template>
  <li class="account-transaction">
    <button
      type="button"
      @click="$emit('select', transaction)"
    >
      <span class="account-transaction__icon">
        <img
          :src="transactionCategoryIcon(transaction.category)"
          alt=""
          aria-hidden="true"
        >
      </span>
      <span class="account-transaction__copy">
        <strong>{{ transaction.merchantName || transaction.title || '거래 내역' }}</strong>
        <span>{{ formatDate(transaction.transactionDate) }}</span>
      </span>
      <strong
        class="account-transaction__amount"
        :class="{ 'account-transaction__amount--income': isIncome() }"
      >
        {{ formatAmount() }}
      </strong>
    </button>
  </li>
</template>

<style scoped>
.account-transaction > button {
  display: flex;
  width: 100%;
  min-height: 64px;
  align-items: center;
  gap: 18px;
  padding: 10px;
  border: 0;
  background: transparent;
  cursor: pointer;
  font-family: inherit;
  text-align: left;
}

.account-transaction__icon {
  display: grid;
  width: 44px;
  height: 44px;
  flex: 0 0 auto;
  overflow: hidden;
  border-radius: 10px;
  background: var(--category-px100, #eef4e8);
  place-items: center;
}

.account-transaction__icon img {
  width: 34px;
  height: 34px;
  object-fit: contain;
}

.account-transaction__copy {
  display: flex;
  min-width: 0;
  flex: 1;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
  gap: 0;
}

.account-transaction__copy strong,
.account-transaction__amount {
  color: var(--gray-900);
  font-family:
    'SF Pro Display',
    'SF Pro Text',
    -apple-system,
    BlinkMacSystemFont,
    sans-serif;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: -0.15px;
  line-height: 21px;
}

.account-transaction__copy > span {
  color: var(--sub-black);
  font-family:
    'SF Pro Text',
    'SF Pro Display',
    -apple-system,
    BlinkMacSystemFont,
    sans-serif;
  font-size: 12px;
  font-weight: 400;
  letter-spacing: 0;
  line-height: 18px;
}

.account-transaction__amount {
  flex: 0 0 auto;
  margin-left: auto;
  text-align: right;
}

.account-transaction__amount--income {
  color: var(--green-700);
}
</style>
