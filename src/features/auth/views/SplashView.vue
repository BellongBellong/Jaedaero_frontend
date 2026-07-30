<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'

import HomeIndicator from '@/common/components/HomeIndicator.vue'
import MobileStatusBar from '@/common/components/MobileStatusBar.vue'
import brandLogo from '@/assets/onboarding/brand/brand-logo.svg'
import airforce from '@/assets/onboarding/characters/character-airforce.png'
import army from '@/assets/onboarding/characters/character-army.png'
import marine from '@/assets/onboarding/characters/character-marine.png'
import navy from '@/assets/onboarding/characters/character-navy.png'

const router = useRouter()
const characters = [army, navy, airforce, marine]

onMounted(() => {
  window.setTimeout(() => router.replace({ name: 'social-login' }), 1100)
})
</script>

<template>
  <main class="splash screen">
    <MobileStatusBar />
    <p class="splash__tagline">
      군인을 위한<br>AI 자산관리
    </p>
    <img
      class="splash__logo"
      :src="brandLogo"
      alt="제대로"
    >
    <div class="character-lineup">
      <span
        v-for="(character, index) in characters"
        :key="character"
      >
        <i /><img
          :src="character"
          :alt="`${index + 1}번째 군종 캐릭터`"
        >
      </span>
    </div>
    <HomeIndicator />
  </main>
</template>

<style scoped>
.splash {
  position: relative;
  height: 852px;
  min-height: 100dvh;
  background: linear-gradient(
    to top,
    #c6c6c6 0%,
    #d9d9d9 19%,
    #ededed 36%,
    #f6f6f6 58%,
    #f6f6f6 100%
  );
}
.splash__tagline {
  position: absolute;
  top: 146px;
  left: 0;
  width: 100%;
  margin: 0;
  color: #333;
  font-family: '감탄로드감탄체', sans-serif;
  font-size: 35px;
  line-height: 1;
  letter-spacing: -4px;
  text-align: center;
  mix-blend-mode: difference;
}
.splash__logo {
  position: absolute;
  top: 297px;
  left: 112px;
  width: 168px;
  height: 57px;
}
.character-lineup {
  position: absolute;
  top: 523px;
  left: 58px;
  display: flex;
}
.character-lineup span {
  position: relative;
  width: 70px;
  height: 70px;
}
.character-lineup i {
  position: absolute;
  top: 56px;
  left: 19px;
  width: 32px;
  height: 9px;
  border-radius: 50%;
  background: rgb(145 143 102 / 52%);
  filter: blur(1px);
}
.character-lineup img {
  position: relative;
  width: 70px;
  height: 70px;
  object-fit: contain;
}
</style>
