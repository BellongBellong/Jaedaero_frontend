import { readonly, ref, shallowRef } from 'vue'

const visible = ref(false)
const title = ref('')
const message = ref('')
const iconSrc = ref('')
const actionLabel = ref('')
const placement = ref('top')
const action = shallowRef(null)
let hideTimer = null
const queue = []

function clearHideTimer() {
  if (!hideTimer) return

  window.clearTimeout(hideTimer)
  hideTimer = null
}

function dismiss() {
  clearHideTimer()
  visible.value = false
  title.value = ''
  message.value = ''
  iconSrc.value = ''
  actionLabel.value = ''
  placement.value = 'top'
  action.value = null

  const next = queue.shift()
  if (next) window.setTimeout(() => present(next), 260)
}

function present(options) {
  title.value = options.title || ''
  message.value = options.message || ''
  iconSrc.value = options.iconSrc || ''
  actionLabel.value = options.actionLabel || ''
  placement.value = options.placement === 'bottom' ? 'bottom' : 'top'
  action.value = typeof options.onAction === 'function' ? options.onAction : null
  visible.value = true

  hideTimer = window.setTimeout(() => {
    dismiss()
  }, options.duration || 5000)
}

function show(options = {}) {
  if (!options.title && !options.message) return

  if (visible.value) {
    queue.push(options)
    return
  }

  clearHideTimer()
  present(options)
}

async function activate() {
  const nextAction = action.value
  dismiss()
  if (nextAction) await nextAction()
}

export function useSnackbar() {
  return {
    visible: readonly(visible),
    title: readonly(title),
    message: readonly(message),
    iconSrc: readonly(iconSrc),
    actionLabel: readonly(actionLabel),
    placement: readonly(placement),
    show,
    activate,
    dismiss,
  }
}
