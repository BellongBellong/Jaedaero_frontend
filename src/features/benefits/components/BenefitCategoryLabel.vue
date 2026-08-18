<script setup>
import { computed } from 'vue'

import { normalizeBenefitCategory } from '@/features/benefits/utils/benefitMapper'

const props = defineProps({ category: { type: String, default: '기타' } })
const label = computed(() => normalizeBenefitCategory(props.category))
const tone = computed(() => {
  const tones = {
    카드: 'safe',
    교통: 'transport',
    여가: 'leisure',
    숙박: 'lodging',
    자기계발: 'growth',
  }
  return tones[label.value] || 'etc'
})
</script>

<template>
  <span
    class="app-label"
    :class="`label--${tone}`"
  >{{ label }}</span>
</template>
