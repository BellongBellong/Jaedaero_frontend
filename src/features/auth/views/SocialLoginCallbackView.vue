<script setup>
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { getRedirectUri, validateSocialLoginCallback } from '@/features/auth/oauth'
import { useAuthStore } from '@/features/auth/stores/auth.store'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const errorMessage = ref('로그인 처리 중입니다...')

onMounted(async () => {
  const provider = String(route.params.provider || '').toUpperCase()

  try {
    const authorizationCode = validateSocialLoginCallback(provider, route.query)
    const response = await authStore.login({
      socialType: provider,
      authorizationCode,
      redirectUri: getRedirectUri(provider),
    })

    await router.replace({
      name: response.user?.onboardingCompleted ? 'dashboard' : 'terms',
    })
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
