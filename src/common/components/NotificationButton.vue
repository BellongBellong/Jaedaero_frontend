<script setup>
import alarmIcon from '@/assets/icons/alarmIcon.png'
</script>

<template>
  <button
    class="notification-button"
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
  border-radius: var(--radius-full);
  background: var(--green-100);
}
.notification-button img {
  width: 15px;
  height: 17px;
}
</style>
