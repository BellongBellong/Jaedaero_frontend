import { readonly, ref } from 'vue'

const message = ref('')
const variant = ref('success')
const visible = ref(false)
const placement = ref('top')
let hideTimer = null

function dismiss() {
  visible.value = false
  message.value = ''
  placement.value = 'top'
  if (hideTimer) {
    window.clearTimeout(hideTimer)
    hideTimer = null
  }
}

function show(nextMessage, options = {}) {
  if (!nextMessage) return

  message.value = nextMessage
  variant.value = options.variant || 'success'
  placement.value = options.placement === 'bottom' ? 'bottom' : 'top'
  visible.value = true

  if (hideTimer) window.clearTimeout(hideTimer)
  hideTimer = window.setTimeout(() => {
    visible.value = false
    message.value = ''
    placement.value = 'top'
    hideTimer = null
  }, options.duration || 2800)
}

function success(nextMessage, duration) {
  show(nextMessage, { variant: 'success', duration })
}

function error(nextMessage, duration) {
  show(nextMessage, { variant: 'error', duration: duration || 3600 })
}

function info(nextMessage, duration) {
  show(nextMessage, { variant: 'info', duration })
}

function mission(nextMessage = '미션 달성', duration) {
  show(nextMessage, { variant: 'mission', duration })
}

export function useToast() {
  return {
    message: readonly(message),
    variant: readonly(variant),
    placement: readonly(placement),
    visible: readonly(visible),
    show,
    success,
    error,
    info,
    mission,
    dismiss,
  }
}
