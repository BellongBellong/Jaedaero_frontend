<script setup>
import { computed, nextTick, onBeforeUnmount, ref } from 'vue'

import checkIcon from '@/assets/icons/checkIconBasic.svg'
import dropdownIcon from '@/assets/icons/dropdownIcon.svg'

const props = defineProps({
  modelValue: {
    type: String,
    required: true,
  },
  options: {
    type: Array,
    default: () => [],
  },
  ariaLabel: {
    type: String,
    default: '항목 선택',
  },
})

const emit = defineEmits(['update:modelValue'])
const trigger = ref(null)
const open = ref(false)
const menuPosition = ref({ top: '0px', left: '0px' })

const selectedLabel = computed(
  () => props.options.find(({ value }) => value === props.modelValue)?.label ?? '',
)

function updatePosition() {
  const rect = trigger.value?.getBoundingClientRect()
  if (!rect) return

  const menuWidth = 104
  const mobileWidth = Number.parseFloat(
    getComputedStyle(document.documentElement).getPropertyValue('--mobile-width'),
  )
  const frameWidth =
    Number.isFinite(mobileWidth) && mobileWidth > 0
      ? Math.min(window.innerWidth, mobileWidth)
      : window.innerWidth
  const frameLeft = Math.max(0, (window.innerWidth - frameWidth) / 2)
  const left = Math.min(
    Math.max(rect.left, frameLeft + 20),
    frameLeft + frameWidth - menuWidth - 20,
  )

  menuPosition.value = {
    top: `${rect.top}px`,
    left: `${left}px`,
  }
}

async function toggle() {
  if (open.value) {
    close()
    return
  }
  open.value = true
  await nextTick()
  updatePosition()
  document.body.style.overflow = 'hidden'
  window.addEventListener('resize', updatePosition)
  window.addEventListener('keydown', closeOnEscape)
}

function close() {
  open.value = false
  document.body.style.overflow = ''
  window.removeEventListener('resize', updatePosition)
  window.removeEventListener('keydown', closeOnEscape)
}

function select(value) {
  emit('update:modelValue', value)
  close()
}

function closeOnEscape(event) {
  if (event.key === 'Escape') close()
}

onBeforeUnmount(close)
</script>

<template>
  <div class="common-dropdown">
    <button
      ref="trigger"
      class="common-dropdown__trigger"
      type="button"
      :aria-label="ariaLabel"
      :aria-expanded="open"
      aria-haspopup="listbox"
      @click="toggle"
    >
      <span>{{ selectedLabel }}</span>
      <img
        :src="dropdownIcon"
        alt=""
        aria-hidden="true"
      >
    </button>

    <Teleport to="body">
      <div
        v-if="open"
        class="common-dropdown__backdrop"
        @click="close"
      >
        <div
          class="common-dropdown__menu"
          :style="menuPosition"
          role="listbox"
          :aria-label="ariaLabel"
          @click.stop
        >
          <button
            v-for="option in options"
            :key="option.value"
            type="button"
            role="option"
            :aria-selected="modelValue === option.value"
            @click="select(option.value)"
          >
            <span>{{ option.label }}</span>
            <img
              v-if="modelValue === option.value"
              :src="checkIcon"
              alt=""
              aria-hidden="true"
            >
          </button>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.common-dropdown {
  width: fit-content;
}

.common-dropdown__trigger {
  display: inline-flex;
  min-height: 36px;
  align-items: center;
  gap: 8px;
  padding: 0 10px;
  border: 0;
  background: transparent;
  color: var(--gray-600);
  cursor: pointer;
  font-family: var(--font-body);
  font-size: 14px;
  font-weight: var(--weight-bold);
  line-height: 1.5;
}

.common-dropdown__trigger img {
  width: 8px;
  height: 7px;
  object-fit: contain;
}

.common-dropdown__backdrop {
  position: fixed;
  z-index: var(--z-modal, 1000);
  inset: 0 max(0px, calc((100vw - var(--mobile-width)) / 2));
  background: rgb(0 0 0 / 18%);
}

.common-dropdown__menu {
  position: fixed;
  display: grid;
  width: 104px;
  padding: 10px 14px;
  border-radius: 20px;
  background: var(--white);
  box-shadow: 0 10px 28px rgb(51 51 51 / 10%);
}

.common-dropdown__menu button {
  display: grid;
  min-height: 28px;
  grid-template-columns: 1fr 18px;
  align-items: center;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--gray-700);
  cursor: pointer;
  font-family: var(--font-body);
  font-size: 14px;
  font-weight: var(--weight-bold);
  line-height: 1.5;
  text-align: left;
}

.common-dropdown__menu button img {
  width: 18px;
  height: 18px;
}
</style>
