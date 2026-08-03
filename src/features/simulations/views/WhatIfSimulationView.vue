<script setup>
import { RouterLink } from 'vue-router'
</script>

<template>
  <main class="route-page app-page">
    <h1>왓이프 시뮬레이션</h1>
    <RouterLink :to="{ name: 'ai-product-recommendation' }">
      AI 금융상품 추천 받기
    </RouterLink>
  </main>
</template>
