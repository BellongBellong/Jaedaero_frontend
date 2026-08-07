<script setup>
defineProps({
  holdings: {
    type: Array,
    default: () => [],
  },
})

function formatWon(value) {
  return `${Number(value || 0).toLocaleString('ko-KR')}원`
}

function formatRate(value) {
  const rate = Number(value || 0)
  return `${rate > 0 ? '+' : ''}${rate.toFixed(1)}%`
}
</script>

<template>
  <section class="investment-holdings">
    <article
      v-for="holding in holdings"
      :key="holding.id || holding.productCode || holding.name"
      class="investment-holdings__item"
    >
      <div>
        <strong>{{ holding.name }}</strong>
        <span>{{ holding.quantityLabel || holding.quantity }}</span>
      </div>
      <div class="investment-holdings__value">
        <strong>{{ formatWon(holding.valuationAmount) }}</strong>
        <span :class="{ 'investment-holdings__loss': holding.returnRate < 0 }">
          {{ formatRate(holding.returnRate) }}
        </span>
      </div>
    </article>

    <p v-if="!holdings.length">
      보유한 투자 상품이 없어요.
    </p>
  </section>
</template>

<style scoped>
.investment-holdings {
  padding: 20px;
  border: 1px solid rgb(255 255 255 / 55%);
  border-radius: 28px;
  background: linear-gradient(117.93deg, rgb(255 255 255 / 52%), rgb(255 255 255 / 20%));
  backdrop-filter: blur(18px) saturate(125%);
  -webkit-backdrop-filter: blur(18px) saturate(125%);
}

.investment-holdings__item {
  display: flex;
  min-height: 62px;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding-block: 12px;
  border-bottom: 1px solid rgb(240 240 240 / 90%);
}

.investment-holdings__item:first-child {
  padding-top: 0;
}

.investment-holdings__item:last-of-type {
  padding-bottom: 0;
  border-bottom: 0;
}

.investment-holdings__item > div {
  display: grid;
  min-width: 0;
}

.investment-holdings__item strong {
  overflow: hidden;
  color: var(--gray-900);
  font-size: 14px;
  line-height: 1.5;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.investment-holdings__item span {
  color: var(--sub-black);
  font-size: 12px;
  line-height: 1.5;
}

.investment-holdings__value {
  flex: 0 0 auto;
  text-align: right;
}

.investment-holdings__value span {
  color: var(--green-700);
}

.investment-holdings__value .investment-holdings__loss {
  color: var(--orange-600);
}

.investment-holdings p {
  margin: 20px 0;
  color: var(--gray-400);
  font-size: 13px;
  text-align: center;
}
</style>
