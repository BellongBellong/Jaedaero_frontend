<template>
  <section class="tab-page">
    <p class="tab-page__eyebrow">
      AI COACH
    </p>
    <h1>AI 코치</h1>
    <p>나에게 맞는 자산 관리 코칭을 준비하고 있어요.</p>
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
</style>
