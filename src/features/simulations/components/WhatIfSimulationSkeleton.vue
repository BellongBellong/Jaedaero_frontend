<template>
  <div
    class="simulation-skeleton"
    role="status"
    aria-live="polite"
    aria-label="왓이프 시뮬레이션을 불러오는 중"
  >
    <section class="simulation-skeleton__card simulation-skeleton__summary">
      <div class="simulation-skeleton__summary-copy">
        <span class="simulation-skeleton__line simulation-skeleton__line--label" />
        <span class="simulation-skeleton__line simulation-skeleton__line--day" />
        <span class="simulation-skeleton__line simulation-skeleton__line--message" />
      </div>
      <span class="simulation-skeleton__date" />
      <div class="simulation-skeleton__asset">
        <span class="simulation-skeleton__line simulation-skeleton__line--label" />
        <span class="simulation-skeleton__line simulation-skeleton__line--amount" />
      </div>
    </section>

    <section class="simulation-skeleton__card simulation-skeleton__allocation">
      <span class="simulation-skeleton__line simulation-skeleton__line--title" />
      <span class="simulation-skeleton__line simulation-skeleton__line--description" />
      <div
        v-for="index in 3"
        :key="index"
        class="simulation-skeleton__allocation-row"
      >
        <span class="simulation-skeleton__icon" />
        <span class="simulation-skeleton__line simulation-skeleton__line--name" />
        <span class="simulation-skeleton__range" />
        <span class="simulation-skeleton__value" />
      </div>
      <span class="simulation-skeleton__allocation-total" />
    </section>

    <section class="simulation-skeleton__card simulation-skeleton__return">
      <span class="simulation-skeleton__line simulation-skeleton__line--title" />
      <div class="simulation-skeleton__return-control">
        <span class="simulation-skeleton__icon simulation-skeleton__icon--large" />
        <span class="simulation-skeleton__line simulation-skeleton__line--name" />
        <span class="simulation-skeleton__control" />
        <span class="simulation-skeleton__control simulation-skeleton__control--wide" />
        <span class="simulation-skeleton__control" />
      </div>
      <span class="simulation-skeleton__line simulation-skeleton__line--hint" />
    </section>

    <section class="simulation-skeleton__card simulation-skeleton__result">
      <span class="simulation-skeleton__line simulation-skeleton__line--title" />
      <span class="simulation-skeleton__result-panel" />
      <span class="simulation-skeleton__button" />
    </section>

    <span class="sr-only">시뮬레이션 정보를 불러오고 있어요.</span>
  </div>
</template>

<style scoped>
.simulation-skeleton {
  display: flex;
  width: 100%;
  flex-direction: column;
  gap: 10px;
}

.simulation-skeleton__card {
  padding: 16px;
  border: 1px solid rgb(255 255 255 / 90%);
  border-radius: 28px;
  background: rgb(255 255 255 / 72%);
}

.simulation-skeleton span {
  position: relative;
  display: block;
  overflow: hidden;
  background: rgb(117 117 117 / 12%);
}

.simulation-skeleton span::after {
  position: absolute;
  inset: 0;
  background: linear-gradient(100deg, transparent 20%, rgb(255 255 255 / 70%) 48%, transparent 76%);
  content: '';
  transform: translateX(-100%);
  animation: simulation-skeleton-shimmer 1.3s ease-in-out infinite;
}

.simulation-skeleton__summary {
  display: grid;
  grid-template-columns: 1fr 76px;
  gap: 12px 20px;
}

.simulation-skeleton__summary-copy {
  display: flex;
  flex-direction: column;
  gap: 7px;
}

.simulation-skeleton__line {
  height: 12px;
  border-radius: 999px;
}

.simulation-skeleton__line--label {
  width: 72px;
}

.simulation-skeleton__line--day {
  width: 104px;
  height: 42px;
}

.simulation-skeleton__line--message {
  width: min(190px, 65%);
  height: 16px;
}

.simulation-skeleton__date {
  width: 76px;
  height: 86px;
  border-radius: 20px;
}

.simulation-skeleton__asset {
  display: flex;
  grid-column: 1 / -1;
  flex-direction: column;
  gap: 7px;
}

.simulation-skeleton__line--amount {
  width: 142px;
  height: 28px;
}

.simulation-skeleton__allocation {
  display: flex;
  flex-direction: column;
  gap: 8px;
  background: rgb(255 255 255 / 90%);
}

.simulation-skeleton__line--title {
  width: 84px;
  height: 16px;
}

.simulation-skeleton__line--description {
  width: min(278px, 82%);
  margin-bottom: 2px;
}

.simulation-skeleton__allocation-row {
  display: grid;
  grid-template-columns: 30px 42px minmax(60px, 1fr) 86px;
  align-items: center;
  gap: 8px;
}

.simulation-skeleton__icon {
  width: 30px;
  height: 30px;
  border-radius: 10px;
}

.simulation-skeleton__line--name {
  width: 36px;
}

.simulation-skeleton__range {
  width: 100%;
  height: 6px;
  border-radius: 999px;
}

.simulation-skeleton__value {
  width: 86px;
  height: 34px;
  border-radius: 15px;
}

.simulation-skeleton__allocation-total {
  width: 100%;
  height: 42px;
  margin-top: 2px;
  border-radius: 16px;
}

.simulation-skeleton__return {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.simulation-skeleton__return-control {
  display: grid;
  grid-template-columns: 40px 1fr 32px 68px 32px;
  align-items: center;
  gap: 8px;
}

.simulation-skeleton__icon--large {
  width: 40px;
  height: 40px;
  border-radius: 14px;
}

.simulation-skeleton__control {
  width: 32px;
  height: 32px;
  border-radius: 50%;
}

.simulation-skeleton__control--wide {
  width: 68px;
  border-radius: 12px;
}

.simulation-skeleton__line--hint {
  width: 88%;
}

.simulation-skeleton__result {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.simulation-skeleton__result-panel {
  width: 100%;
  height: 250px;
  border-radius: 22px;
}

.simulation-skeleton__button {
  width: 100%;
  height: 50px;
  border-radius: 18px;
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

@keyframes simulation-skeleton-shimmer {
  100% {
    transform: translateX(100%);
  }
}

@media (prefers-reduced-motion: reduce) {
  .simulation-skeleton span::after {
    animation: none;
  }
}
</style>
