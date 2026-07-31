<script setup>
import { RouterLink } from 'vue-router'
</script>

<template>
  <main class="route-page">
    <h1>거래 상세 내역</h1>
    <RouterLink :to="{ name: 'transactions' }">
      거래내역으로 돌아가기
    </RouterLink>
  </main>
</template>

<style scoped>
.route-page {
  padding: 80px 24px;
}
</style>
