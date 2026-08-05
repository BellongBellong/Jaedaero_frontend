<script setup>
import alarmIcon from '@/assets/icons/alarmIcon.svg'

defineProps({
  mode: { type: String, default: 'military' },
})
</script>

<template>
  <button
    class="notification-button"
    :class="`notification-button--${mode}`"
    type="button"
    aria-label="알림"
  >
    <img
      :src="alarmIcon"
      alt=""
      aria-hidden="true"
    >
  </button>
</template>

<style scoped>
.notification-button {
  display: grid;
  width: 40px;
  height: 40px;
  place-items: center;
  border: 1px solid rgb(255 255 255 / 52%);
  border-radius: var(--radius-full);
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / 76%),
    inset 0 -1px 0 rgb(255 255 255 / 20%),
    0 7px 18px rgb(35 54 42 / 9%);
  transition:
    background var(--duration-slow) var(--ease-default),
    box-shadow var(--duration-slow) var(--ease-default);
  backdrop-filter: blur(18px) saturate(135%);
  -webkit-backdrop-filter: blur(18px) saturate(135%);
}

.notification-button--military {
  background:
    radial-gradient(circle at 32% 20%, rgb(255 255 255 / 58%), transparent 38%),
    linear-gradient(180deg, rgb(196 255 219 / 52%), rgb(255 244 184 / 45%));
}

.notification-button--vacation {
  background:
    radial-gradient(circle at 32% 20%, rgb(255 255 255 / 62%), transparent 38%),
    linear-gradient(180deg, rgb(190 222 255 / 58%), rgb(230 242 255 / 44%));
}

.notification-button img {
  width: 15px;
  height: 16px;
  filter: blur(1.35px);
  opacity: 0.86;
}
</style>
