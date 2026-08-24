<script setup>
import { ref } from 'vue'

import BaseButton from '@/common/components/buttons/BaseButton.vue'
import { characterProfileOptions } from '@/common/constants/characterAssets'
import BaseDialog from '@/common/components/overlay/BaseDialog.vue'

const props = defineProps({
  image: { type: String, required: true },
  backgroundColor: { type: String, required: true },
  saving: { type: Boolean, default: false },
})
const emit = defineEmits(['close', 'save'])
const selectedImage = ref(props.image)
const selectedColor = ref(props.backgroundColor)
const profiles = characterProfileOptions.map(({ name, source }) => [name, source])
const colors = ['#E5FFF4', '#AEBBAA', '#FFF0B8', '#FFB39F', '#F7F7F7', '#333333']
</script>

<template>
  <BaseDialog
    :model-value="true"
    class="profile-dialog"
    @close="emit('close')"
  >
    <h2 class="profile-title">
      프로필 이미지 변경
    </h2>
    <div
      class="current-profile"
      :style="{ background: selectedColor }"
    >
      <img
        :src="profiles.find(([name]) => name === selectedImage)?.[1]"
        alt="선택된 캐릭터"
      >
    </div>
    <h3>캐릭터 선택</h3>
    <div class="profile-options">
      <button
        v-for="[name, source] in profiles"
        :key="name"
        type="button"
        :class="{ selected: selectedImage === name }"
        @click="selectedImage = name"
      >
        <img
          :src="source"
          alt=""
        >
      </button>
    </div>
    <h3>배경색 선택</h3>
    <div class="color-options">
      <button
        v-for="color in colors"
        :key="color"
        type="button"
        :class="{ selected: selectedColor === color }"
        :style="{ background: color }"
        :aria-label="`${color} 배경색`"
        @click="selectedColor = color"
      />
    </div>

    <template #actions>
      <BaseButton
        block
        :disabled="saving"
        @click="emit('save', selectedImage, selectedColor)"
      >
        {{ saving ? '저장 중...' : '변경하기' }}
      </BaseButton>
    </template>
  </BaseDialog>
</template>

<style scoped>
:global(.profile-dialog .base-dialog__header) {
  align-items: center;
}
:global(.profile-dialog .base-dialog__content) {
  padding-inline: 26px;
}
:global(.profile-dialog .base-dialog__footer) {
  padding: 0 26px 9px;
}
.profile-title {
  margin: 0 0 31px;
  font-size: 20px;
  text-align: center;
}
h3 {
  margin: 0 0 14px;
  color: var(--olive-400);
  font-size: var(--text-xs);
  font-weight: 700;
}
.current-profile {
  display: grid;
  width: 80px;
  height: 80px;
  place-items: center;
  margin: 0 auto 29px;
  border-radius: 50%;
}
.current-profile img {
  width: 61px;
  height: 61px;
  object-fit: contain;
}
.profile-options,
.color-options {
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 35px;
}
.profile-options button {
  display: grid;
  width: 65px;
  height: 65px;
  place-items: center;
  border: 1px dashed transparent;
  border-radius: 50%;
  background: var(--gray-100);
}
.profile-options button.selected,
.color-options button.selected {
  border: 1px solid var(--green-600);
}
.profile-options button.selected {
  border-style: dashed;
}
.profile-options img {
  width: 51px;
  height: 51px;
  object-fit: contain;
}
.color-options button {
  width: 41px;
  height: 41px;
  border: 1px solid transparent;
  border-radius: 50%;
}
</style>
