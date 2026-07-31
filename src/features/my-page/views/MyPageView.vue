<script setup>
import { RouterLink } from 'vue-router'
</script>

<template>
  <section class="tab-page">
    <p class="tab-page__eyebrow">
      MY PAGE
    </p>
    <h1>마이페이지</h1>
    <p>내 정보와 자산 관리 설정을 확인할 수 있어요.</p>
    <RouterLink :to="{ name: 'badge-history' }">
      뱃지 획득 내역
    </RouterLink>
  </section>
</template>

<style scoped>
.tab-page {
  min-height: 100%;
  padding: 80px 24px;
  background: var(--ui-background, #fafafa);
}

.tab-page__eyebrow {
  margin: 0 0 8px;
  color: var(--green-700, #20ba5c);
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.08em;
}

h1 {
  margin: 0;
  color: var(--gray-900, #333);
  font-size: 30px;
}

p:not(.tab-page__eyebrow) {
  margin-top: 12px;
  color: var(--gray-600, #757575);
}

a {
  display: inline-block;
  margin-top: 32px;
  color: var(--green-800, #169145);
  font-weight: 700;
}
</style>
