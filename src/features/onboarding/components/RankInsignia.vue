<script setup>
import rankIcons from '@/assets/onboarding/icons/rank-icons-reference.png'

defineProps({
  level: { type: Number, required: true },
})
</script>

<template>
  <span
    class="rank-insignia"
    aria-hidden="true"
  >
    <img
      :class="`level-${level}`"
      :src="rankIcons"
      alt=""
    >
  </span>
</template>

<style scoped>
.rank-insignia {
  position: relative;
  display: inline-block;
  width: 14px;
  height: 14px;
  flex: 0 0 14px;
  overflow: hidden;
}
.rank-insignia img {
  position: absolute;
  width: 104px;
  max-width: none;
  height: 54px;
}
.rank-insignia img.level-1 {
  top: -20px;
  left: -10px;
}
.rank-insignia img.level-2 {
  top: -20px;
  left: -32px;
}
.rank-insignia img.level-3 {
  top: -20px;
  left: -55px;
}
.rank-insignia img.level-4 {
  top: -20px;
  left: -78px;
}
</style>
