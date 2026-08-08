<script setup>
import { onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { useMissionCompletion } from '@/features/missions/composables/useMissionCompletion'

const route = useRoute()
const router = useRouter()
const { completeMissionAfterLoad } = useMissionCompletion(route, router)

onMounted(() => {
  completeMissionAfterLoad()
})
</script>

<template>
  <main class="route-page app-page">
    <h1>리밸런싱</h1>
  </main>
</template>
