<script setup>
import { useRouter } from 'vue-router'

import introMascot from '../../../assets/features/onboarding/intro/intro-mascot.png'
import PrimaryButton from '../../../common/components/buttons/PrimaryButton.vue'
import OnboardingStepHeader from '@/features/onboarding/components/OnboardingStepHeader.vue'

const router = useRouter()
</script>

<template>
  <main class="intro screen">
    <OnboardingStepHeader
      title="제대로가 처음이신가요?"
      :show-progress="false"
      :show-back="false"
    />
    <img
      class="intro-mascot"
      :src="introMascot"
      alt=""
    >
    <h2>제대로를 이용하기 위한<br>몇가지 절차가 필요해요</h2>
    <PrimaryButton
      variant="green"
      @click="router.push({ name: 'connect-accounts' })"
    >
      시작하기
    </PrimaryButton>
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
    #f6f6f6;
}
h2 {
  position: absolute;
  z-index: 2;
  margin: 0;
  color: #333;
  font-family: '감탄로드감탄체', sans-serif;
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
.intro :deep(.step-header) {
  position: absolute;
  top: 162px;
  right: 0;
  left: 0;
  padding: 0;
  text-align: center;
}
.intro :deep(.step-header h1) {
  color: #333;
  font-family: '감탄로드감탄체', sans-serif;
  font-size: 23px;
  font-weight: 400;
  line-height: 1.48;
  letter-spacing: normal;
  text-rendering: geometricPrecision;
  -webkit-font-smoothing: antialiased;
}
.primary-button {
  position: absolute;
  z-index: 3;
  right: 24px;
  bottom: 40px;
  left: 24px;
  width: auto;
  background: #62ff9c;
  color: #333;
  font-size: 18px;
  font-weight: 700;
}
</style>
