<script setup>
import backIcon from '@/assets/onboarding/icons/step1-icon0.svg'

const props = defineProps({
  step: { type: Number, required: true },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  showProgress: { type: Boolean, default: true },
})

defineEmits(['back'])
</script>

<template>
  <header
    class="step-header"
    :class="{ 'step-header--without-progress': !props.showProgress }"
  >
    <button
      class="back-button"
      aria-label="뒤로 가기"
      @click="$emit('back')"
    >
      <img
        :src="backIcon"
        alt=""
      >
    </button>
    <div
      v-if="props.showProgress"
      class="step-header__progress"
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
  </header>
</template>

<style scoped>
.step-header {
  padding: 22px 6px 0;
}
.back-button {
  display: grid;
  width: 32px;
  height: 32px;
  margin: 0 0 54px -6px;
  padding: 4px;
  place-items: center;
  border: 0;
  background: transparent;
  cursor: pointer;
}
.back-button img {
  width: 24px;
  height: 24px;
}
.step-header--without-progress .back-button {
  margin-bottom: 24px;
}
.step-header__progress {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}
.step-header__progress strong {
  font-family: '감탄로드감탄체', sans-serif;
  font-size: 24px;
  font-weight: 400;
  letter-spacing: -0.09em;
}
.step-header__progress span {
  color: #d1d1d1;
  font-size: 13px;
  font-weight: 700;
}
.progress-bars {
  display: flex;
  gap: 3px;
}
.progress-bars i {
  width: 14px;
  height: 5px;
  border-radius: 4px;
  background: #e5e5e5;
}
.progress-bars i.active {
  background: #39eb87;
}
h1 {
  margin: 0;
  font-size: 24px;
  line-height: 1.5;
  letter-spacing: -0.04em;
}
p {
  margin: 0;
  color: #999;
  font-size: 16px;
  line-height: 1.5;
}
</style>
