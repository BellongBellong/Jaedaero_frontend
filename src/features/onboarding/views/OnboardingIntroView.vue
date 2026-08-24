<script setup>
import { useRouter } from 'vue-router'

import introMascot from '../../../assets/features/onboarding/intro/intro-mascot.png'
import BaseButton from '@/common/components/buttons/BaseButton.vue'
import OnboardingStepIntro from '@/common/components/layout/OnboardingStepIntro.vue'

const router = useRouter()
</script>

<template>
  <main class="intro screen">
    <OnboardingStepIntro
      title="제대로가 처음이신가요?"
      :show-progress="false"
    />
    <img
      class="intro-mascot"
      :src="introMascot"
      alt=""
    >
    <h2>제대로를 이용하기 위한<br>몇가지 절차가 필요해요</h2>
    <BaseButton
      class="intro-button"
      variant="primary"
      size="lg"
      block
      @click="router.push({ name: 'connect-accounts' })"
    >
      시작하기
    </BaseButton>
  </main>
</template>

<style scoped>
.intro {
  position: relative;
  height: 799px;
  min-height: calc(100dvh - 53px);
  overflow: visible;
  padding: 0 20px 74px;
  background:
    radial-gradient(
      ellipse 235px 215px at 50% 41%,
      rgb(114 255 127 / 58%) 0%,
      rgb(152 255 139 / 35%) 38%,
      rgb(246 246 246 / 0%) 76%
    ),
    radial-gradient(
      ellipse 245px 220px at 50% 56%,
      rgb(225 246 111 / 48%) 0%,
      rgb(239 249 171 / 26%) 43%,
      rgb(246 246 246 / 0%) 78%
    ),
    var(--ui-background);
}
h2 {
  position: absolute;
  z-index: 2;
  margin: 0;
  color: var(--ui-text);
  font-family: var(--font-display);
  font-size: 23px;
  font-weight: 400;
  line-height: 1.48;
  letter-spacing: normal;
  text-rendering: geometricPrecision;
  -webkit-font-smoothing: antialiased;
}
.intro-mascot {
  position: absolute;
  top: 261px;
  left: 50%;
  width: 231px;
  height: 218px;
  transform: translateX(-50%);
  object-fit: contain;
}
h2 {
  top: 596px;
  left: 0;
  width: 100%;
  text-align: center;
}
.intro :deep(.onboarding-step-intro) {
  position: absolute;
  top: 162px;
  right: 0;
  left: 0;
  padding: 0;
  text-align: center;
}
.intro :deep(.onboarding-step-intro h1) {
  color: var(--ui-text);
  font-family: var(--font-display);
  font-size: 23px;
  font-weight: 400;
  line-height: 1.48;
  letter-spacing: normal;
  text-rendering: geometricPrecision;
  -webkit-font-smoothing: antialiased;
}
.intro-button {
  position: absolute;
  z-index: 3;
  right: 24px;
  bottom: 40px;
  left: 24px;
  width: auto;
  background: var(--green-500);
  color: var(--ui-text);
  font-size: var(--text-lg);
  font-weight: 700;
}
</style>
