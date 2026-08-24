<script setup>
const props = defineProps({
  step: { type: Number, default: 0 },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  showProgress: { type: Boolean, default: true },
})
</script>

<template>
  <section
    class="onboarding-step-intro"
    :class="{ 'onboarding-step-intro--without-progress': !props.showProgress }"
  >
    <div
      v-if="props.showProgress"
      class="onboarding-step-intro__progress"
    >
      <strong>step {{ step }}</strong>
      <div class="progress-bars">
        <i
          v-for="number in 4"
          :key="number"
          :class="{ active: number <= step }"
        />
      </div>
      <span>{{ step }}/4</span>
    </div>
    <h1>{{ title }}</h1>
    <p v-if="description">
      {{ description }}
    </p>
  </section>
</template>

<style scoped>
.onboarding-step-intro {
  padding: calc(22px + 32px + 54px + var(--safe-area-top)) 6px 0;
}
.onboarding-step-intro--without-progress {
  padding-top: calc(22px + 32px + 24px + var(--safe-area-top));
}
.onboarding-step-intro__progress {
  display: flex;
  align-items: flex-end;
  gap: var(--space-10);
  margin-bottom: var(--space-8);
}
.onboarding-step-intro__progress strong {
  font-family: var(--font-display);
  font-size: var(--text-h4);
  font-weight: 400;
  letter-spacing: -0.09em;
}
.onboarding-step-intro__progress span {
  color: var(--gray-600);
  font-size: var(--text-sm);
  font-weight: var(--weight-bold);
}
.progress-bars {
  display: flex;
  gap: 3px;
}
.progress-bars i {
  width: 14px;
  height: 5px;
  border-radius: var(--radius-full);
  background: var(--gray-300);
}
.progress-bars i.active {
  background: var(--green-600);
}
h1 {
  margin: 0;
  color: var(--ui-text);
  font-size: var(--text-h4);
  line-height: var(--leading-normal);
  letter-spacing: -0.04em;
}
p {
  margin: 0;
  color: var(--ui-text-secondary);
  font-size: var(--text-md);
  line-height: var(--leading-normal);
  white-space: pre-line;
}
</style>
