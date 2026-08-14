<script setup>
import rankCorporal from '@/assets/onboarding/icons/rank-corporal.svg'
import rankPrivate from '@/assets/onboarding/icons/rank-private.svg'
import rankPrivateFirstClass from '@/assets/onboarding/icons/rank-private-first-class.svg'
import rankSergeant from '@/assets/onboarding/icons/rank-sergeant.svg'

const props = defineProps({
  level: { type: Number, required: true },
})

const rankIconsByLevel = {
  1: rankPrivate,
  2: rankPrivateFirstClass,
  3: rankCorporal,
  4: rankSergeant,
}
</script>

<template>
  <span
    class="rank-insignia"
    aria-hidden="true"
  >
    <img
      :src="rankIconsByLevel[props.level]"
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
  width: 14px;
  height: 14px;
}
</style>
