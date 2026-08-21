<script setup>
import { bankAccountIcon } from '@/features/accounts/composables/bankAccountIconMapping'

const props = defineProps({
  account: {
    type: Object,
    required: true,
  },
  clickable: {
    type: Boolean,
    default: false,
  },
})

defineEmits(['select'])

function formatWon(value) {
  return `${Number(value || 0).toLocaleString('ko-KR')}원`
}

function accountName(account) {
  return account.accountName || account.name || account.productName || '연결 계좌'
}
</script>

<template>
  <li class="asset-account-list-item">
    <button
      type="button"
      :disabled="!clickable"
      @click="$emit('select', account)"
    >
      <span class="asset-account-list-item__icon">
        <img
          :src="bankAccountIcon(account)"
          alt=""
          aria-hidden="true"
        >
      </span>
      <span class="asset-account-list-item__copy">
        <strong>{{ formatWon(account.amount ?? account.balance) }}</strong>
        <span>{{ accountName(props.account) }}</span>
      </span>
    </button>
  </li>
</template>

<style scoped>
.asset-account-list-item {
  overflow: hidden;
  border: 1px solid rgb(255 255 255 / 55%);
  border-radius: 20px;
  background: linear-gradient(117.93deg, rgb(255 255 255 / 42%) 0%, rgb(255 255 255 / 14%) 100%);
  box-shadow:
    inset 0 0 4px rgb(0 0 0 / 8%),
    inset 0 1px 0 rgb(255 255 255 / 65%),
    inset 0 -1px 0 rgb(0 0 0 / 6%);
  backdrop-filter: blur(18px) saturate(125%);
  -webkit-backdrop-filter: blur(18px) saturate(125%);
}

.asset-account-list-item > button {
  display: flex;
  width: 100%;
  min-height: 60px;
  align-items: center;
  gap: 14px;
  padding: 6px var(--space-20);
  border: 0;
  background: transparent;
  font-family: var(--font-body);
  text-align: left;
}

.asset-account-list-item > button:not(:disabled) {
  cursor: pointer;
}

.asset-account-list-item > button:disabled {
  color: inherit;
  opacity: 1;
}

.asset-account-list-item__icon {
  position: relative;
  display: grid;
  width: 36px;
  height: 36px;
  flex: 0 0 auto;
  overflow: hidden;
  border: 1px solid rgb(255 255 255 / 42%);
  border-radius: 10px;
  background: rgb(255 248 221 / 32%);
  box-shadow: inset 0 1px 0 rgb(255 255 255 / 48%);
  place-items: center;
}

.asset-account-list-item__icon img {
  width: 30px;
  height: 30px;
  object-fit: contain;
}

.asset-account-list-item__copy {
  display: grid;
  min-width: 0;
  gap: 4px;
  padding-block: 2px;
}

.asset-account-list-item__copy strong {
  color: var(--gray-900);
  font-size: 14px;
  line-height: 1.5;
}

.asset-account-list-item__copy > span {
  overflow: hidden;
  color: var(--gray-400);
  font-size: 12px;
  line-height: 1.3;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
