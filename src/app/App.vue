<script setup>
import { RouterView } from 'vue-router'

import BaseToast from '@/common/components/feedback/BaseToast.vue'
import { useToast } from '@/common/composables/useToast'

const { message, variant, visible } = useToast()
</script>

<template>
  <RouterView />

  <BaseToast
    :message="message"
    :variant="variant"
    :visible="visible"
  />
</template>
