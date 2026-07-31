<script setup>
import { RouterLink } from 'vue-router'
</script>

<template>
  <section class="tab-page">
    <p class="tab-page__eyebrow">
      AI COACH
    </p>
    <h1>AI 코치</h1>
    <p>나에게 맞는 자산 관리 코칭을 준비하고 있어요.</p>
    <nav aria-label="AI 코치 페이지">
      <RouterLink :to="{ name: 'ai-financial-report' }">
        AI 금융 리포트
      </RouterLink>
      <RouterLink :to="{ name: 'ai-asset-analysis-result' }">
        AI 자산 분석 결과
      </RouterLink>
      <RouterLink :to="{ name: 'what-if-simulation' }">
        왓이프 시뮬레이션
      </RouterLink>
      <RouterLink :to="{ name: 'rebalancing' }">
        리밸런싱
      </RouterLink>
    </nav>
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

nav {
  display: grid;
  gap: 14px;
  margin-top: 32px;
}

a {
  color: var(--green-800, #169145);
  font-weight: 700;
}
</style>
