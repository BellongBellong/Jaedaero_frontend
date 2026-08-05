<script setup>
import { computed } from 'vue'

import assetIcon from '@/assets/icons/Category/assetIconSmall.png'
import etcIcon from '@/assets/icons/Category/etcIconSmall.png'
import foodIcon from '@/assets/icons/Category/foodIconSmall.png'
import leisureIcon from '@/assets/icons/Category/leisureIconSmall.png'
import medicalIcon from '@/assets/icons/Category/medicalIconSmall.png'
import pxIcon from '@/assets/icons/Category/PXIconSmall.png'
import salaryIcon from '@/assets/icons/Category/salaryIconSmall.png'
import shoppingIcon from '@/assets/icons/Category/shoppingIconSmall.png'
import transportIcon from '@/assets/icons/Category/transportIconSmall.png'

const props = defineProps({
  transactions: {
    type: Array,
    default: () => [],
  },
})

const categoryIcons = {
  asset: assetIcon,
  etc: etcIcon,
  food: foodIcon,
  leisure: leisureIcon,
  medical: medicalIcon,
  px: pxIcon,
  salary: salaryIcon,
  shopping: shoppingIcon,
  transport: transportIcon,
}

const groupedTransactions = computed(() =>
  props.transactions.reduce((groups, transaction) => {
    const date = transaction.date || '날짜 없음'
    const group = groups.find((item) => item.date === date)

    if (group) {
      group.items.push(transaction)
    } else {
      groups.push({ date, items: [transaction] })
    }

    return groups
  }, []),
)

function formatDate(date) {
  if (!date || date === '날짜 없음') return date

  const [, month, day] = date.split('-').map(Number)
  return `${month}월 ${day}일`
}

function formatAmount(transaction) {
  const prefix = transaction.type === 'income' ? '+' : '-'
  return `${prefix}${Number(transaction.amount || 0).toLocaleString('ko-KR')}원`
}
</script>

<template>
  <div
    v-if="transactions.length"
    class="asset-transactions"
  >
    <section
      v-for="group in groupedTransactions"
      :key="group.date"
      class="asset-transactions__group"
    >
      <h2>{{ formatDate(group.date) }}</h2>
      <ul>
        <li
          v-for="transaction in group.items"
          :key="transaction.id"
        >
          <img
            :src="categoryIcons[transaction.category] || etcIcon"
            alt=""
            aria-hidden="true"
          >
          <div class="asset-transactions__detail">
            <strong>{{ transaction.title }}</strong>
            <span>{{ transaction.categoryLabel }}</span>
          </div>
          <strong
            class="asset-transactions__amount"
            :class="{ 'asset-transactions__amount--income': transaction.type === 'income' }"
          >
            {{ formatAmount(transaction) }}
          </strong>
        </li>
      </ul>
    </section>
  </div>

  <p
    v-else
    class="asset-transactions__empty"
  >
    거래내역이 없어요.
  </p>
</template>

<style scoped>
.asset-transactions {
  display: grid;
  gap: 18px;
}

.asset-transactions__group h2 {
  margin: 0 0 8px;
  color: var(--gray-500);
  font-size: 12px;
}

.asset-transactions ul {
  display: grid;
  gap: 4px;
  padding: 0;
  margin: 0;
  list-style: none;
}

.asset-transactions li {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 10px;
  padding: 10px 2px;
}

.asset-transactions li > img {
  width: 36px;
  height: 36px;
  flex: 0 0 auto;
  object-fit: contain;
}

.asset-transactions__detail {
  display: grid;
  min-width: 0;
  flex: 1;
}

.asset-transactions__detail strong {
  overflow: hidden;
  color: var(--gray-900);
  font-size: 14px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.asset-transactions__detail span {
  color: var(--gray-400);
  font-size: 11px;
}

.asset-transactions__amount {
  flex: 0 0 auto;
  color: var(--gray-900);
  font-size: 14px;
}

.asset-transactions__amount--income {
  color: var(--green-700);
}

.asset-transactions__empty {
  display: grid;
  min-height: 220px;
  place-items: center;
  margin: 0;
  color: var(--gray-500);
  font-size: 13px;
}
</style>
