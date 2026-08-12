<script setup>
defineProps({
  variant: {
    type: String,
    default: 'military',
    validator: (value) => ['military', 'vacation'].includes(value),
  },
})
</script>

<template>
  <div
    class="dashboard-skeleton"
    :class="`dashboard-skeleton--${variant}`"
    role="status"
    aria-live="polite"
    aria-label="대시보드 정보를 불러오는 중"
  >
    <div class="dashboard-skeleton__dday">
      <div class="dashboard-skeleton__date-row">
        <div class="dashboard-skeleton__lines">
          <span class="dashboard-skeleton__line dashboard-skeleton__line--label" />
          <span class="dashboard-skeleton__line dashboard-skeleton__line--dday" />
          <span class="dashboard-skeleton__line dashboard-skeleton__line--message" />
        </div>
        <span class="dashboard-skeleton__actual-date" />
      </div>
      <div class="dashboard-skeleton__achievement-row">
        <div class="dashboard-skeleton__lines">
          <span class="dashboard-skeleton__line dashboard-skeleton__line--label" />
          <span class="dashboard-skeleton__line dashboard-skeleton__line--rate" />
          <span class="dashboard-skeleton__line dashboard-skeleton__line--asset" />
        </div>
        <span class="dashboard-skeleton__character" />
      </div>
      <span class="dashboard-skeleton__progress" />
    </div>

    <div class="dashboard-skeleton__quick-cards">
      <div
        v-for="index in 2"
        :key="index"
        class="dashboard-skeleton__quick-card"
      >
        <span class="dashboard-skeleton__line dashboard-skeleton__line--card-title" />
        <span class="dashboard-skeleton__line dashboard-skeleton__line--card-item" />
        <span class="dashboard-skeleton__line dashboard-skeleton__line--card-item" />
      </div>
    </div>

    <div class="dashboard-skeleton__asset-card">
      <div class="dashboard-skeleton__tabs">
        <span class="dashboard-skeleton__line dashboard-skeleton__line--tab" />
        <span class="dashboard-skeleton__line dashboard-skeleton__line--tab" />
      </div>
      <span
        v-for="index in 3"
        :key="index"
        class="dashboard-skeleton__asset-row"
      />
    </div>

    <span class="sr-only">대시보드 정보를 불러오고 있어요.</span>
  </div>
</template>

<style scoped>
.dashboard-skeleton {
  display: flex;
  flex-direction: column;
  gap: var(--dashboard-gap);
  width: 100%;
}

.dashboard-skeleton span,
.dashboard-skeleton__quick-card,
.dashboard-skeleton__dday,
.dashboard-skeleton__asset-card {
  position: relative;
  overflow: hidden;
}

.dashboard-skeleton span::after,
.dashboard-skeleton__quick-card::after,
.dashboard-skeleton__dday::after,
.dashboard-skeleton__asset-card::after {
  position: absolute;
  inset: 0;
  background: linear-gradient(100deg, transparent 20%, rgb(255 255 255 / 58%) 48%, transparent 76%);
  content: '';
  transform: translateX(-100%);
  animation: dashboard-skeleton-shimmer 1.35s ease-in-out infinite;
}

.dashboard-skeleton__circle,
.dashboard-skeleton__line,
.dashboard-skeleton__actual-date,
.dashboard-skeleton__character,
.dashboard-skeleton__progress,
.dashboard-skeleton__asset-row {
  display: block;
  background: rgb(117 117 117 / 12%);
}

.dashboard-skeleton__lines {
  display: flex;
  min-width: 0;
  flex: 1;
  flex-direction: column;
  gap: var(--space-8);
}

.dashboard-skeleton__line {
  height: 12px;
  border-radius: var(--radius-full);
}

.dashboard-skeleton__dday {
  display: flex;
  min-height: clamp(340px, 92vw, 362px);
  flex-direction: column;
  justify-content: space-between;
  padding: clamp(24px, 8vw, 32px) var(--space-20);
  border: 1px solid rgb(255 255 255 / 60%);
  border-radius: var(--dashboard-card-radius);
  background: rgb(255 255 255 / 58%);
  backdrop-filter: blur(20px);
}

.dashboard-skeleton__date-row,
.dashboard-skeleton__achievement-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-16);
}

.dashboard-skeleton__line--label {
  width: 112px;
  height: 15px;
}
.dashboard-skeleton__line--dday {
  width: 110px;
  height: 42px;
}
.dashboard-skeleton__line--message {
  width: min(220px, 58vw);
  height: 22px;
}
.dashboard-skeleton__actual-date {
  width: 88px;
  height: 112px;
  border-radius: 28px;
}
.dashboard-skeleton__line--rate {
  width: 92px;
  height: 34px;
}
.dashboard-skeleton__line--asset {
  width: 124px;
  height: 15px;
}
.dashboard-skeleton__character {
  width: 68px;
  height: 82px;
  margin: 2px 28px 0 0;
  border-radius: 30px;
}
.dashboard-skeleton__progress {
  width: 100%;
  height: 8px;
  border-radius: var(--radius-full);
}

.dashboard-skeleton__quick-cards {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--dashboard-gap);
}

.dashboard-skeleton__quick-card {
  display: flex;
  aspect-ratio: 1;
  flex-direction: column;
  gap: var(--space-12);
  padding: var(--space-20);
  border-radius: var(--dashboard-card-radius);
  background: rgb(255 255 255 / 62%);
}

.dashboard-skeleton__line--card-title {
  width: 74%;
  height: 16px;
}
.dashboard-skeleton__line--card-item {
  width: 100%;
  height: 40px;
  border-radius: 12px;
}

.dashboard-skeleton__asset-card {
  display: flex;
  min-height: 310px;
  flex-direction: column;
  gap: var(--space-12);
  padding: var(--space-20);
  border-radius: var(--dashboard-card-radius);
  background: rgb(255 255 255 / 64%);
}

.dashboard-skeleton__tabs {
  display: flex;
  gap: var(--space-16);
  margin-bottom: var(--space-8);
}

.dashboard-skeleton__line--tab {
  width: 112px;
  height: 18px;
}
.dashboard-skeleton__asset-row {
  width: 100%;
  height: 64px;
  border-radius: 20px;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

@keyframes dashboard-skeleton-shimmer {
  100% {
    transform: translateX(100%);
  }
}

@media (prefers-reduced-motion: reduce) {
  .dashboard-skeleton span::after,
  .dashboard-skeleton__quick-card::after,
  .dashboard-skeleton__dday::after,
  .dashboard-skeleton__asset-card::after {
    animation: none;
  }
}

@media (max-width: 350px) {
  .dashboard-skeleton__quick-cards {
    grid-template-columns: 1fr;
  }
  .dashboard-skeleton__quick-card {
    aspect-ratio: auto;
    min-height: 160px;
  }
}
</style>
