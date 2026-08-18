<script setup>
import DetailLinkButton from '@/common/components/navigation/DetailLinkButton.vue'
import BenefitCategoryLabel from '@/features/benefits/components/BenefitCategoryLabel.vue'

defineProps({
  benefits: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
})

defineEmits(['select', 'view-all'])
</script>

<template>
  <section class="military-benefits">
    <h2>오늘의 군인 할인 혜택</h2>

    <div
      v-if="loading"
      class="military-benefits__rail"
      aria-label="혜택을 불러오는 중"
    >
      <div
        v-for="index in 4"
        :key="index"
        class="military-benefits__skeleton"
      />
    </div>

    <div
      v-else-if="benefits.length"
      class="military-benefits__rail"
    >
      <button
        v-for="benefit in benefits"
        :key="benefit.id"
        type="button"
        class="military-benefits__item"
        :aria-label="`${benefit.title} 혜택 상세 보기`"
        @click="$emit('select', benefit)"
      >
        <BenefitCategoryLabel :category="benefit.category" />
        <div class="military-benefits__copy">
          <span>{{ benefit.title }}</span>
          <strong>{{ benefit.discountSummary }}</strong>
        </div>
      </button>
    </div>

    <p
      v-else
      class="military-benefits__empty"
    >
      오늘 소개할 군인 혜택을 준비하고 있어요.
    </p>

    <DetailLinkButton
      class="military-benefits__more"
      @click="$emit('view-all')"
    >
      전체 군인혜택 모아보기
    </DetailLinkButton>
  </section>
</template>

<style scoped>
.military-benefits {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: var(--space-12);
  padding: var(--space-8) 0 0;
}

.military-benefits h2 {
  margin: 0;
  color: var(--ui-sub-title);
  font-family: var(--body-body-small-bold-font-family);
  font-size: var(--body-body-small-bold-font-size);
  font-weight: var(--body-body-small-bold-font-weight);
  line-height: var(--body-body-small-bold-line-height);
}
.military-benefits__rail {
  display: flex;
  width: 100%;
  min-width: 0;
  gap: var(--space-10);
  overflow-x: auto;
  overflow-y: hidden;
  padding-right: var(--space-20);
  padding-bottom: 2px;
  overscroll-behavior-inline: contain;
  touch-action: pan-x;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  scroll-snap-type: x proximity;
}
.military-benefits__rail::-webkit-scrollbar {
  display: none;
}
.military-benefits__item,
.military-benefits__skeleton {
  flex: 0 0 calc((100% - var(--space-10)) / 2);
  min-height: 110px;
  border-radius: var(--radius-xl);
  scroll-snap-align: start;
}
.military-benefits__item {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: var(--space-4);
  padding: var(--space-20) var(--space-16);
  background: var(--white);
  border: 0;
  text-align: left;
  cursor: pointer;
  appearance: none;
}
.military-benefits__copy {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  min-width: 0;
}
.military-benefits__copy span {
  color: var(--sub-black);
  font-family: var(--body-body-small-regular-font-family);
  font-size: var(--body-body-small-regular-font-size);
  font-weight: var(--body-body-small-regular-font-weight);
  line-height: var(--body-body-small-regular-line-height);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.military-benefits__copy strong {
  display: -webkit-box;
  overflow: hidden;
  color: var(--ui-sub-title);
  font-family: var(--body-body-small-bold-font-family);
  font-size: var(--body-body-small-bold-font-size);
  font-weight: var(--body-body-small-bold-font-weight);
  line-height: var(--body-body-small-bold-line-height);
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}
.military-benefits__skeleton {
  background: linear-gradient(
    100deg,
    rgb(255 255 255 / 55%) 30%,
    rgb(255 255 255 / 90%) 45%,
    rgb(255 255 255 / 55%) 60%
  );
  background-size: 220% 100%;
  animation: benefit-shimmer 1.4s infinite;
}
.military-benefits__empty {
  min-height: 72px;
  margin: 0;
  display: grid;
  place-items: center;
  color: var(--gray-500);
  font-family: var(--body-body-xsmall-regular-font-family);
  font-size: var(--body-body-xsmall-regular-font-size);
  font-weight: var(--body-body-xsmall-regular-font-weight);
  line-height: var(--body-body-xsmall-regular-line-height);
  text-align: center;
}
.military-benefits__more {
  align-self: flex-end;
}

@media (max-width: 350px) {
  .military-benefits__item,
  .military-benefits__skeleton {
    flex-basis: calc(100% - 44px);
  }
}
@keyframes benefit-shimmer {
  to {
    background-position-x: -220%;
  }
}
</style>
