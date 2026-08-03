<script setup>
import { RouterLink } from 'vue-router'
</script>

<template>
  <main class="route-page app-page">
    <h1>거래내역</h1>
    <RouterLink :to="{ name: 'transaction-detail' }">
      상세 내역 보기
    </RouterLink>
  </main>
</template>
