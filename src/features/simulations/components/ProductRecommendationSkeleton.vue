<template>
  <div
    class="product-skeleton"
    role="status"
    aria-live="polite"
    aria-label="추천 상품을 불러오는 중"
  >
    <div class="product-skeleton__list">
      <section
        v-for="index in 4"
        :key="index"
        class="product-skeleton__card"
      >
        <div class="product-skeleton__card-head">
          <span class="product-skeleton__icon" />
          <div class="product-skeleton__product-copy">
            <span class="product-skeleton__line product-skeleton__line--product-name" />
            <span class="product-skeleton__line product-skeleton__line--provider" />
          </div>
          <div class="product-skeleton__rate">
            <span class="product-skeleton__line product-skeleton__line--rate" />
            <span class="product-skeleton__line product-skeleton__line--rate-label" />
          </div>
        </div>
        <span class="product-skeleton__line product-skeleton__line--description" />
        <span class="product-skeleton__line product-skeleton__line--description-short" />
        <div class="product-skeleton__stats">
          <span
            v-for="stat in 3"
            :key="stat"
          />
        </div>
      </section>
    </div>

    <span class="sr-only">추천 상품 정보를 불러오고 있어요.</span>
  </div>
</template>

<style scoped>
.product-skeleton {
  display: flex;
  width: 100%;
  flex-direction: column;
}

.product-skeleton span {
  position: relative;
  display: block;
  overflow: hidden;
  background: rgb(117 117 117 / 12%);
}

.product-skeleton span::after {
  position: absolute;
  inset: 0;
  background: linear-gradient(100deg, transparent 20%, rgb(255 255 255 / 72%) 48%, transparent 76%);
  content: '';
  transform: translateX(-100%);
  animation: product-skeleton-shimmer 1.3s ease-in-out infinite;
}

.product-skeleton__line {
  height: 11px;
  border-radius: 999px;
}

.product-skeleton__list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 9px;
}

.product-skeleton__card {
  padding: 21px;
  border: 1px solid rgb(255 255 255 / 80%);
  border-radius: 24px;
  background: rgb(255 255 255 / 72%);
  box-shadow: 0 2px 16px rgb(0 0 0 / 5%);
}

.product-skeleton__card-head {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.product-skeleton__icon {
  width: 44px;
  height: 44px;
  flex: none;
  border-radius: 14px;
}

.product-skeleton__product-copy {
  display: flex;
  min-width: 0;
  flex: 1;
  flex-direction: column;
  gap: 6px;
}

.product-skeleton__line--product-name {
  width: min(124px, 80%);
  height: 14px;
}

.product-skeleton__line--provider {
  width: 68px;
  height: 9px;
}

.product-skeleton__rate {
  display: flex;
  width: 54px;
  flex: none;
  align-items: flex-end;
  flex-direction: column;
  gap: 5px;
}

.product-skeleton__line--rate {
  width: 52px;
  height: 22px;
}

.product-skeleton__line--rate-label {
  width: 34px;
  height: 8px;
}

.product-skeleton__line--description {
  width: 92%;
  margin-top: 14px;
}

.product-skeleton__line--description-short {
  width: 64%;
  margin-top: 6px;
}

.product-skeleton__stats {
  display: flex;
  gap: 16px;
  margin-top: 14px;
}

.product-skeleton__stats > span {
  width: 52px;
  height: 29px;
  border-radius: 8px;
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

@keyframes product-skeleton-shimmer {
  100% {
    transform: translateX(100%);
  }
}

@media (prefers-reduced-motion: reduce) {
  .product-skeleton span::after {
    animation: none;
  }
}

@media (max-width: 360px) {
  .product-skeleton__card {
    padding: 17px;
  }

  .product-skeleton__card-head {
    gap: 8px;
  }
}
</style>
