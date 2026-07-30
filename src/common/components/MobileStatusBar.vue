<script setup>
import battery from '@/assets/onboarding/status/status-battery.svg'
import cellular from '@/assets/onboarding/status/status-cellular.svg'
import wifi from '@/assets/onboarding/status/status-wifi.svg'
</script>

<template>
  <div
    class="mobile-status"
    aria-hidden="true"
  >
    <strong>9:41</strong>
    <div class="mobile-status__icons">
      <img :src="cellular"><img :src="wifi"><img :src="battery">
    </div>
  </div>
</template>

<style scoped>
.mobile-status {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex: 0 0 53px;
  height: 53px;
  padding: 0 27px 0 31px;
  color: #111;
  font-size: 17px;
  line-height: 22px;
}
.mobile-status__icons {
  display: flex;
  align-items: center;
  gap: 7px;
}
.mobile-status__icons img:nth-child(1) {
  width: 19.2px;
}
.mobile-status__icons img:nth-child(2) {
  width: 17.14px;
}
.mobile-status__icons img:nth-child(3) {
  width: 27.33px;
}
</style>
