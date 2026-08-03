<template>
  <section class="tab-page app-page">
    <p class="tab-page__eyebrow">
      CHALLENGE
    </p>
    <h1>챌린지</h1>
    <p>목표를 정하고 꾸준한 금융 습관을 만들어 보세요.</p>
  </section>
</template>

<style scoped>
.tab-page__eyebrow {
  margin: 0 0 var(--space-8);
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
</style>
