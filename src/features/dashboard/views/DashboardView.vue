<script setup>
import { onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'

import { getDashboard } from '@/features/dashboard/api/dashboard.api'

const dashboard = ref(null)
const loading = ref(true)
const errorMessage = ref('')

onMounted(async () => {
  try {
    dashboard.value = await getDashboard()
  } catch {
    errorMessage.value = '대시보드 정보를 불러오지 못했어요.'
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <main class="dashboard screen content-screen">
    <p class="eyebrow">
      온보딩 완료
    </p>
    <h1>제대로 시작할 준비가 됐어요 🎉</h1>
    <p v-if="loading">
      자산 정보를 불러오는 중...
    </p>
    <p
      v-else-if="errorMessage"
      class="form-error"
    >
      {{ errorMessage }}
    </p>
    <article v-else-if="dashboard">
      <span>현재 총자산</span>
      <strong>{{ Number(dashboard.totalAsset || 0).toLocaleString('ko-KR') }}원</strong>
    </article>
    <RouterLink :to="{ name: 'transactions' }">
      거래내역 보기
    </RouterLink>
  </main>
</template>

<style scoped>
.dashboard {
  padding: 80px 24px;
}
.eyebrow {
  color: #20c86b;
  font-weight: 700;
}
h1 {
  max-width: 310px;
  font-size: 30px;
  line-height: 1.4;
}
article {
  display: grid;
  gap: 8px;
  padding: 24px;
  margin-top: 36px;
  border-radius: 22px;
  background: #303030;
  color: #fff;
}
article strong {
  font-size: 26px;
}

a {
  display: inline-block;
  margin-top: 24px;
  color: #169145;
  font-weight: 700;
}
</style>
