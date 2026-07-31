<script setup>
import { computed } from 'vue'

import BaseBadge from './BaseBadge.vue'

const STATUS_CONFIG = Object.freeze({
  neutral: { label: '일반', tone: 'neutral' },
  primary: { label: '진행 중', tone: 'primary' },
  info: { label: '안내', tone: 'info' },
  active: { label: '진행 중', tone: 'primary' },
  pending: { label: '대기 중', tone: 'warning' },
  scheduled: { label: '예정', tone: 'info' },
  completed: { label: '완료', tone: 'success' },
  success: { label: '완료', tone: 'success' },
  connected: { label: '연결됨', tone: 'success' },
  warning: { label: '확인 필요', tone: 'warning' },
  danger: { label: '주의', tone: 'danger' },
  error: { label: '오류', tone: 'danger' },
  failed: { label: '실패', tone: 'danger' },
  inactive: { label: '비활성', tone: 'neutral' },
  disabled: { label: '사용 안 함', tone: 'neutral' },
})

const props = defineProps({
  status: {
    type: String,
    default: 'inactive',
  },
  label: {
    type: String,
    default: '',
  },
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md'].includes(value),
  },
  showDot: {
    type: Boolean,
    default: true,
  },
})

const normalizedStatus = computed(() => props.status.trim().toLowerCase())
const config = computed(() => {
  return (
    STATUS_CONFIG[normalizedStatus.value] || {
      label: props.status || STATUS_CONFIG.inactive.label,
      tone: 'neutral',
    }
  )
})
const displayLabel = computed(() => props.label || config.value.label)
</script>

<template>
  <BaseBadge
    :tone="config.tone"
    :size="size"
    :dot="showDot"
  >
    <slot>{{ displayLabel }}</slot>
  </BaseBadge>
</template>
