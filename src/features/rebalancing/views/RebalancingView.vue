<script setup>
import RebalancingButton from '../components/RebalancingButton.vue'

const handleMove = () => {
  console.log('버튼 클릭 성공!')
}
</script>

<template>
  <main class="rebalancing-view">
    <RebalancingButton @click="handleMove" />
  </main>
</template>

<style scoped>
.rebalancing-view {
  display: flex;
  min-height: 100vh;
  align-items: center;
  justify-content: center;
}
</style>
