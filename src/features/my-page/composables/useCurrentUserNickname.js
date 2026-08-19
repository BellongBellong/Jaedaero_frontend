import { computed, ref } from 'vue'

import { useAuthStore } from '@/features/auth/stores/auth.store'
import { useMyPageStore } from '@/features/my-page/stores/my-page.store'

function normalizeNickname(value) {
  return typeof value === 'string' ? value.trim() : ''
}

export function useCurrentUserNickname() {
  const authStore = useAuthStore()
  const myPageStore = useMyPageStore()
  const profileNickname = ref('')

  const nickname = computed(
    () => profileNickname.value || normalizeNickname(authStore.user?.nickname),
  )
  const honorificNickname = computed(() => (nickname.value ? `${nickname.value}님` : '회원님'))

  async function loadNickname() {
    try {
      await myPageStore.load()
      const profile = myPageStore.profile
      profileNickname.value = normalizeNickname(profile?.nickname)
    } catch {
      // 세션에 닉네임이 있으면 유지하고, 없으면 화면에서 "회원님"으로 표시한다.
    }
  }

  return { nickname, honorificNickname, loadNickname }
}
