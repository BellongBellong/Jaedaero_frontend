<template>
  <div class="mobile-frame">
    <slot />
  </div>
</template>

<style scoped>
.mobile-frame {
  position: relative;
  display: flex;
  flex-direction: column;
  width: min(100%, var(--mobile-width));
  height: min(100dvh, var(--mobile-height));
  margin: 0 auto;
  overflow: hidden;
  background: var(--ui-background);
}
</style>
