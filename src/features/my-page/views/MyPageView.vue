<script setup>
import { RouterLink } from 'vue-router'
</script>

<template>
  <section class="tab-page app-page">
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
.tab-page__eyebrow {
  margin: 0 0 8px;
  color: var(--green-700);
  font-size: var(--text-xs);
  font-weight: var(--weight-bold);
  letter-spacing: 0.08em;
}

h1 {
  margin: 0;
  color: var(--ui-ext);
  font-size: var(--text-h3);
}

p:not(.tab-page__eyebrow) {
  margin-top: var(--space-12);
  color: var(--ui-text-secondary);
}

a {
  display: inline-block;
  margin-top: var(--space-32);
  color: var(--green-800);
  font-weight: var(--weight-bold);
}
</style>
