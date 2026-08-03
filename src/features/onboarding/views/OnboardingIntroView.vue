<script setup>
import { useRouter } from 'vue-router'

import introMascot from '@/assets/onboarding/intro/intro-mascot.png'
import PrimaryButton from '@/common/components/PrimaryButton.vue'

const router = useRouter()
</script>

<template>
  <main class="intro screen">
    <h1>제대로가 처음이신가요?</h1>
    <img
      class="intro-mascot"
      :src="introMascot"
      alt=""
    >
    <h2>제대로를 이용하기 위한<br>몇가지 절차가 필요해요</h2>
    <PrimaryButton @click="router.push({ name: 'nickname' })">
      시작하기
    </PrimaryButton>
  </main>
</template>

<style scoped>
.intro {
  position: relative;
  height: 799px;
  min-height: calc(100dvh - 53px);
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
h1,
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
h1 {
  top: 162px;
  left: 98px;
}
.intro-mascot {
  position: absolute;
  top: 261px;
  left: 81px;
  width: 231px;
  height: 218px;
  object-fit: contain;
}
h2 {
  top: 596px;
  left: 103px;
}
.primary-button {
  position: absolute;
  z-index: 3;
  right: 16px;
  bottom: 40px;
  left: 24px;
  width: auto;
  background: #62ff9c;
  color: #333;
  font-size: 18px;
  font-weight: 700;
}
</style>
