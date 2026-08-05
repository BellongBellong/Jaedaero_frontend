<script setup>
import assetBlock from '@/assets/icons/account/assetBlock.png'
import investBlock from '@/assets/icons/account/investBlock.png'

defineProps({
  data: {
    type: Object,
    default: null,
  },
})

const accountIcons = {
  asset: assetBlock,
  investment: investBlock,
}

function formatWon(value) {
  return `${Number(value || 0).toLocaleString('ko-KR')}원`
}
</script>

<template>
  <div
    v-if="data"
    class="asset-account-summary"
  >
    <div class="asset-account-summary__total">
      <span>총 자산</span>
      <strong>{{ formatWon(data.totalAsset) }}</strong>
      <p>
        지난달보다
        <b>+{{ formatWon(data.changeAmount) }} ({{ data.changeRate }}%)</b>
      </p>
    </div>

    <ul v-if="data.accounts?.length">
      <li
        v-for="account in data.accounts"
        :key="account.id"
      >
        <span class="asset-account-summary__name">
          <img
            :src="accountIcons[account.type] || assetBlock"
            alt=""
            aria-hidden="true"
          >
          {{ account.name }}
        </span>
        <strong>{{ formatWon(account.amount) }}</strong>
      </li>
    </ul>
    <p
      v-else
      class="asset-account-summary__empty"
    >
      연결된 자산이 없어요.
    </p>
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
  gap: 18px;
}

.asset-account-summary__total {
  padding: 18px;
  border-radius: 20px;
  background: linear-gradient(135deg, var(--green-100), rgb(255 255 255 / 45%));
}

.asset-account-summary__total > span {
  color: var(--gray-600);
  font-size: 13px;
  font-weight: var(--weight-bold);
}

.asset-account-summary__total > strong {
  display: block;
  margin-top: 4px;
  color: var(--gray-900);
  font-size: 28px;
  letter-spacing: -0.04em;
}

.asset-account-summary__total p {
  margin: 5px 0 0;
  color: var(--gray-500);
  font-size: 12px;
}

.asset-account-summary__total b {
  color: var(--green-700);
}

.asset-account-summary ul {
  display: grid;
  gap: 10px;
  padding: 0;
  margin: 0;
  list-style: none;
}

.asset-account-summary li {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 13px 14px;
  border-radius: 16px;
  background: var(--ui-background);
}

.asset-account-summary__name {
  display: flex;
  align-items: center;
  gap: 9px;
  color: var(--gray-600);
  font-size: 13px;
  font-weight: var(--weight-bold);
}

.asset-account-summary__name img {
  width: 30px;
  height: 30px;
}

.asset-account-summary li strong {
  color: var(--gray-900);
  font-size: 14px;
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
