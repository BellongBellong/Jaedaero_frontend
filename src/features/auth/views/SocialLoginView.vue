<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { login } from '@/features/auth/api/auth.api'
import { rememberLoginRedirect, startSocialLogin } from '@/features/auth/oauth'
import brandLogo from '@/assets/onboarding/brand/brand-logo.svg'
import googleLogo from '@/assets/onboarding/brand/google-logo.svg'
import kakaoLogo from '@/assets/onboarding/brand/kakao-logo.svg'
import airforce from '@/assets/onboarding/characters/character-airforce.png'
import army from '@/assets/onboarding/characters/character-army.png'
import marine from '@/assets/onboarding/characters/character-marine.png'
import navy from '@/assets/onboarding/characters/character-navy.png'

const loadingProvider = ref('')
const errorMessage = ref('')
const characters = [army, navy, airforce, marine]
const router = useRouter()
const route = useRoute()
const isMockMode =
  import.meta.env.MODE === 'mock' || import.meta.env.VITE_USE_MOCK_SERVER === 'true'

async function handleLogin(provider) {
  loadingProvider.value = provider
  errorMessage.value = ''

  try {
    if (isMockMode) {
      const response = await login({ socialType: provider, authorizationCode: 'mock-login' })

      localStorage.setItem('accessToken', response.accessToken)
      localStorage.setItem('refreshToken', response.refreshToken)
      localStorage.setItem('userId', String(response.user?.userId || 1))
      const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/home'
      await router.push(
        (response.user?.onboardingCompleted ?? response.onboardingCompleted)
          ? redirect
          : { name: 'terms' },
      )
      return
    }

    rememberLoginRedirect(route.query.redirect)
    startSocialLogin(provider)
  } catch {
    errorMessage.value = isMockMode
      ? '로그인에 실패했어요. 목 서버 실행 상태를 확인해 주세요.'
      : '소셜 로그인 설정을 확인해 주세요.'
  } finally {
    loadingProvider.value = ''
  }
}
</script>

<template>
  <main class="login screen">
    <section class="login__content">
      <p>군인을 위한 AI 자산관리</p>
      <img
        class="login__logo"
        :src="brandLogo"
        alt="제대로"
      >
      <div class="login__characters">
        <span
          v-for="(character, index) in characters"
          :key="character"
        >
          <i />
          <img
            :src="character"
            :alt="`${index + 1}번째 군종 캐릭터`"
          >
        </span>
      </div>
    </section>
    <div class="login__actions">
      <p
        v-if="errorMessage"
        class="form-error"
      >
        {{ errorMessage }}
      </p>
      <button
        class="social-button kakao"
        :disabled="Boolean(loadingProvider)"
        @click="handleLogin('KAKAO')"
      >
        <img
          :src="kakaoLogo"
          alt=""
        >카카오로 시작하기
      </button>
      <button
        class="social-button google"
        :disabled="Boolean(loadingProvider)"
        @click="handleLogin('GOOGLE')"
      >
        <img
          :src="googleLogo"
          alt=""
        >Google로 시작하기
      </button>
    </div>
  </main>
</template>

<style scoped>
.login {
  position: relative;
  display: flex;
  height: auto;
  min-height: 100dvh;
  flex-direction: column;
  padding-bottom: calc(24px + var(--safe-area-bottom));
  background: linear-gradient(
    to top,
    #c4c4c4 0%,
    #d8d8d8 20%,
    #ebebeb 37%,
    #f6f6f6 59%,
    #f6f6f6 100%
  );
}
.login__content {
  position: relative;
  flex: 1 1 auto;
  min-height: 0;
}
.login__logo {
  position: absolute;
  top: 130px;
  left: 88px;
  width: 218px;
  height: 75px;
}
.login__content p {
  position: absolute;
  top: 101px;
  width: 100%;
  margin: 0;
  color: #ccc;
  font-family: '감탄로드감탄체', sans-serif;
  font-size: 18px;
  letter-spacing: -1.5px;
  text-align: center;
}
.login__characters {
  position: absolute;
  top: 250px;
  left: 75px;
  display: flex;
}
.login__characters span {
  position: relative;
  width: 61px;
  height: 61px;
}
.login__characters i {
  position: absolute;
  top: 50px;
  left: 17px;
  width: 27px;
  height: 8px;
  border-radius: 50%;
  background: rgb(145 143 102 / 52%);
  filter: blur(1px);
}
.login__characters img {
  position: relative;
  width: 61px;
  height: 61px;
  object-fit: contain;
}
.login__actions {
  display: grid;
  gap: 12px;
  padding: 0 24px;
}
.social-button {
  position: relative;
  min-height: 56px;
  border: 0;
  border-radius: 28px;
  font-size: 18px;
  font-weight: 700;
  cursor: pointer;
  padding-left: 45px;
}
.social-button img {
  position: absolute;
  top: 18px;
  left: 99px;
  width: 20px;
  height: 20px;
}
.kakao {
  background: #ffe500;
  color: #191919;
}
.google {
  border: 0;
  background: #fff;
  color: #333;
}
</style>
