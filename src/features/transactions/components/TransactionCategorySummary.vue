<script setup>
import {
  transactionCategoryIcon,
  transactionCategoryLabel,
} from '@/features/transactions/composables/transactionCategoryIconMapping'

defineProps({
  category: {
    type: String,
    default: 'ETC',
  },
  merchantName: {
    type: String,
    default: '-',
  },
})
</script>

<template>
  <div class="category-summary">
    <span>
      <img
        :src="transactionCategoryIcon(category)"
        alt=""
        aria-hidden="true"
      >
    </span>
    <div>
      <strong>{{ transactionCategoryLabel(category) }}</strong>
      <p>{{ merchantName || '-' }}</p>
    </div>
  </div>
</template>

<style scoped>
.category-summary {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 10px;
  border-radius: 20px;
  background: rgb(236 236 236 / 30%);
}

.category-summary > span {
  display: grid;
  width: 56px;
  height: 54px;
  flex: 0 0 auto;
  border-radius: 14px;
  background: radial-gradient(circle, white 0%, rgb(255 255 255 / 0%) 72%);
  place-items: center;
}

.category-summary img {
  width: 44px;
  height: 44px;
  object-fit: contain;
}

.category-summary > div {
  display: grid;
  min-width: 0;
  gap: 2px;
}

.category-summary strong {
  color: var(--gray-900);
  font-size: 24px;
  line-height: 1.5;
}

.category-summary p {
  overflow: hidden;
  margin: 0;
  color: var(--gray-600);
  font-size: 16px;
  letter-spacing: -0.04em;
  line-height: 1.5;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
