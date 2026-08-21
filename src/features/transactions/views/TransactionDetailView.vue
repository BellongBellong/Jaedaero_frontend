<script setup>
import { computed, onMounted, ref } from 'vue'
import { useTransactionsStore } from '@/features/transactions/stores/transactions.store'
import { useRoute } from 'vue-router'

import editIcon from '@/assets/icons/pencilIcon.svg'
import { useToast } from '@/common/composables/useToast'
import { transactionResponses } from '@/features/dashboard/mocks/dashboard.mock'
import CategoryChangeSheet from '@/features/transactions/components/CategoryChangeSheet.vue'
import {
  transactionCategoryIcon,
  transactionCategoryLabel,
} from '@/features/transactions/composables/transactionCategoryIconMapping'

const route = useRoute()
const transactionsStore = useTransactionsStore()
const toast = useToast()
const usesMockScenario = Boolean(route.query.persona || route.query.scenario)
const transaction = ref(
  transactionsStore.cached(route.params.transactionId) ??
    (usesMockScenario
      ? transactionResponses.find((item) => String(item.id) === String(route.params.transactionId))
      : null),
)
const categorySheetOpen = ref(false)
const selectedCategory = ref(
  ['', 'UNCLASSIFIED'].includes(String(transaction.value?.category || '').toUpperCase())
    ? 'ETC'
    : String(transaction.value?.category || 'ETC').toUpperCase(),
)
const isIncome = computed(
  () => String(transaction.value?.transactionType).toUpperCase() === 'INCOME',
)
const isEtcCategory = computed(() => selectedCategory.value === 'ETC')

const typeLabels = {
  INCOME: '입금',
  EXPENSE: '출금',
  ASSET_TRANSFER: '자산 이체',
}

function displayValue(value) {
  return value === null || value === undefined || value === '' ? '-' : value
}

function formatOptionalWon(value) {
  return value === null || value === undefined || value === ''
    ? '-'
    : `${Number(value).toLocaleString('ko-KR')}원`
}

function formatAmount(value) {
  return `${isIncome.value ? '+' : '-'}${Number(value || 0).toLocaleString('ko-KR')}원`
}

function formatFullDate(value) {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'
  const time = `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일 ${time}`
}

const categoryLabel = computed(() => {
  return transactionCategoryLabel(selectedCategory.value)
})
const detailRows = computed(() => [
  {
    label: '적요',
    value: displayValue(transaction.value?.description || transaction.value?.merchantName),
  },
  { label: '카테고리', value: categoryLabel.value, category: true },
  {
    label: '거래 유형',
    value: displayValue(
      transaction.value?.transactionMethod ||
        typeLabels[String(transaction.value?.transactionType).toUpperCase()],
    ),
  },
  { label: '입금처', value: displayValue(transaction.value?.depositSource) },
  { label: '출금처', value: displayValue(transaction.value?.withdrawalSource) },
  { label: '일시', value: formatFullDate(transaction.value?.transactionDate) },
  { label: '거래 후 잔액', value: formatOptionalWon(transaction.value?.balanceAfter) },
])

async function changeCategory(category) {
  selectedCategory.value = category
  if (transaction.value) transaction.value.category = category
  categorySheetOpen.value = false
  try {
    await transactionsStore.updateCategory(route.params.transactionId, category)
    toast.success('거래 카테고리를 변경했어요.')
  } catch {
    toast.error('거래 카테고리를 변경하지 못했어요. 잠시 후 다시 시도해주세요.')
  }
}

onMounted(async () => {
  if (transaction.value || usesMockScenario) return

  try {
    await transactionsStore.load()
    transaction.value = transactionsStore.transactions.find(
      (item) => String(item.id) === String(route.params.transactionId),
    )
    selectedCategory.value = ['', 'UNCLASSIFIED'].includes(
      String(transaction.value?.category || '').toUpperCase(),
    )
      ? 'ETC'
      : String(transaction.value?.category || 'ETC').toUpperCase()
  } catch {
    transaction.value = null
  }
})
</script>

<template>
  <main class="transaction-detail screen app-page">
    <template v-if="transaction">
      <section class="transaction-detail__hero">
        <div>
          <span>
            <img
              :src="transactionCategoryIcon(selectedCategory)"
              alt=""
              aria-hidden="true"
            >
          </span>
          <p>{{ displayValue(transaction.merchantName) }}</p>
        </div>
        <strong :class="{ 'transaction-detail__income': isIncome }">
          {{ formatAmount(transaction.amount) }}
        </strong>
      </section>

      <section class="transaction-detail__card">
        <div
          v-for="row in detailRows"
          :key="row.label"
          class="transaction-detail__row"
          :class="{ 'transaction-detail__row--category': row.category }"
        >
          <strong>{{ row.label }}</strong>
          <span
            v-if="row.category"
            class="transaction-detail__category-value"
          >
            {{ row.value }}
            <button
              type="button"
              aria-label="카테고리 수정"
              @click="categorySheetOpen = true"
            >
              <img
                :src="editIcon"
                alt=""
                aria-hidden="true"
              >
            </button>
          </span>
          <span v-else>{{ row.value }}</span>
          <p v-if="row.category && isEtcCategory">
            카테고리가 인식되지 않았어요. 직접 추가해보세요
          </p>
        </div>
      </section>

      <CategoryChangeSheet
        v-if="categorySheetOpen"
        :category="selectedCategory"
        :merchant-name="displayValue(transaction.merchantName)"
        @close="categorySheetOpen = false"
        @confirm="changeCategory"
      />
    </template>

    <p
      v-else
      class="transaction-detail__empty"
    >
      거래 정보를 찾을 수 없어요.
    </p>
  </main>
</template>

<style scoped>
.transaction-detail {
  display: flex;
  flex-direction: column;
  gap: 20px;
  background: var(--ui-background);
}

.transaction-detail__header {
  display: flex;
  align-items: center;
  gap: 10px;
}

.transaction-detail__header button {
  display: grid;
  width: 32px;
  height: 40px;
  padding: 0;
  border: 0;
  background: transparent;
  cursor: pointer;
  place-items: center;
}

.transaction-detail__header button img {
  width: 10px;
  height: 17px;
}

.transaction-detail__header h1 {
  margin: 0;
  color: var(--gray-900);
  font-family: var(--body-heading-h5-bold-font-family, 'Pretendard-Bold', sans-serif);
  font-size: var(--body-heading-h5-bold-font-size, 20px);
  font-weight: var(--body-heading-h5-bold-font-weight, 700);
  line-height: var(--body-heading-h5-bold-line-height, 150%);
}

.transaction-detail__hero {
  display: grid;
  gap: 8px;
}

.transaction-detail__hero > div {
  display: flex;
  align-items: center;
  gap: 12px;
}

.transaction-detail__hero span {
  display: grid;
  width: 18px;
  height: 18px;
  overflow: hidden;
  border-radius: 4px;
  background: var(--category-px100, #eef4e8);
  place-items: center;
}

.transaction-detail__hero span img {
  width: 14px;
  height: 14px;
  object-fit: contain;
}

.transaction-detail__hero p {
  margin: 0;
  color: var(--gray-900);
  font-size: 18px;
  line-height: 1.5;
}

.transaction-detail__hero > strong {
  color: var(--gray-900);
  font-size: 32px;
  letter-spacing: -0.01em;
  line-height: 1.4;
}

.transaction-detail__hero > .transaction-detail__income {
  color: var(--green-700);
}

.transaction-detail__card {
  display: grid;
  gap: 5px;
  padding: 20px 10px;
  border-radius: 28px;
  background: var(--white);
}

.transaction-detail__row {
  display: grid;
  min-height: 50px;
  grid-template-columns: minmax(90px, 1fr) auto;
  align-items: center;
  gap: 8px;
  padding: 14px 16px;
  border: 1px solid rgb(255 255 255 / 80%);
  border-radius: 18px;
  background: rgb(255 255 255 / 55%);
}

.transaction-detail__row > strong {
  color: var(--gray-900);
  font-size: 14px;
  font-weight: 600;
  line-height: 1.5;
}

.transaction-detail__row > span {
  color: var(--gray-600);
  font-size: 12px;
  font-weight: var(--weight-bold);
  line-height: 1.5;
  text-align: right;
}

.transaction-detail__category-value {
  display: inline-flex;
  align-items: center;
  justify-content: flex-end;
  gap: 6px;
}

.transaction-detail__category-value button {
  display: grid;
  width: 18px;
  height: 18px;
  flex: 0 0 auto;
  padding: 0;
  border: 0;
  background: transparent;
  cursor: pointer;
  place-items: center;
}

.transaction-detail__category-value img {
  width: 18px;
  height: 18px;
  object-fit: contain;
}

.transaction-detail__row--category {
  grid-template-columns: minmax(90px, 1fr) auto;
}

.transaction-detail__row > p {
  grid-column: 1 / -1;
  margin: -2px 0 0;
  color: var(--gray-400);
  font-size: 11px;
  line-height: 1.5;
  text-align: right;
}

.transaction-detail__empty {
  display: grid;
  min-height: 200px;
  margin: 0;
  border-radius: 28px;
  background: var(--white);
  color: var(--gray-400);
  font-size: 13px;
  place-items: center;
}
</style>
