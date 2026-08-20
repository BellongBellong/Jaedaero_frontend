<script setup>
import arrowIcon from '@/assets/icons/arrow.svg'

defineProps({
  ariaLabel: { type: String, default: '' },
})

defineEmits(['click'])
</script>

<template>
  <button
    type="button"
    class="detail-link-button"
    :aria-label="ariaLabel || undefined"
    @click="$emit('click', $event)"
  >
    <span><slot /></span>
    <img
      :src="arrowIcon"
      alt=""
      aria-hidden="true"
    >
  </button>
</template>

<style scoped>
.detail-link-button {
  display: inline-flex;
  align-items: center;
  justify-content: flex-end;
  gap: 6px;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--ui-sub-title);
  font-family: var(--body-body-small-regular-font-family);
  font-size: var(--body-body-small-regular-font-size);
  font-weight: var(--body-body-small-regular-font-weight);
  line-height: var(--body-body-small-regular-line-height);
  white-space: nowrap;
  cursor: pointer;
}

.detail-link-button img {
  width: 6px;
  height: 12px;
  flex: 0 0 auto;
  object-fit: contain;
}

/* label.css와 함께 사용할 때 공통 링크의 기본 투명 스타일보다 라벨 표현을 우선한다. */
.detail-link-button.app-label {
  min-height: 22px;
  padding: 2px 10px;
  border-radius: 20px;
}

.detail-link-button.app-label.label--safe {
  background: var(--green-100);
  color: var(--green-700);
}

.detail-link-button.app-label.label--safe img {
  filter: var(
    --detail-link-icon-filter,
    brightness(0) saturate(100%) invert(57%) sepia(78%) saturate(513%) hue-rotate(90deg)
      brightness(89%) contrast(92%)
  );
}
</style>
