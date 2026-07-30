<script setup>
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { login } from '@/features/auth/api/auth.api'
import { getRedirectUri, validateSocialLoginCallback } from '@/features/auth/oauth'

const route = useRoute()
const router = useRouter()
const errorMessage = ref('로그인 처리 중입니다...')

onMounted(async () => {
  const provider = String(route.params.provider || '').toUpperCase()

  try {
    const authorizationCode = validateSocialLoginCallback(provider, route.query)
    const response = await login({
      socialType: provider,
      authorizationCode,
      redirectUri: getRedirectUri(provider),
    })

    localStorage.setItem('accessToken', response.accessToken)
    localStorage.setItem('refreshToken', response.refreshToken)
    await router.replace({ name: 'terms' })
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : '소셜 로그인에 실패했습니다.'
  }
})
</script>

<template>
  <main class="callback screen">
    <p>{{ errorMessage }}</p>
  </main>
</template>

<style scoped>
.callback {
  display: grid;
  min-height: 100dvh;
  place-items: center;
  color: #333;
}
</style>
