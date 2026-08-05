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
  width: 100%;
  height: 100dvh;
  margin: 0 auto;
  overflow: hidden;
  background: var(--ui-background);
}

@media (min-width: 600px) {
  .mobile-frame {
    max-width: var(--design-mobile-width);
  }
}
</style>
