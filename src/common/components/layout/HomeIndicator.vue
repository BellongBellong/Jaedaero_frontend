<template>
  <div
    class="home-indicator"
    aria-hidden="true"
  >
    <span />
  </div>
</template>

<style scoped>
.home-indicator {
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  display: grid;
  height: 34px;
  place-items: end center;
  padding-bottom: 8px;
  pointer-events: none;
}
.home-indicator span {
  width: 144px;
  height: 5px;
  border-radius: 100px;
  background: #000;
}
</style>
