<script setup>
import { ref } from 'vue'

import airforce from '@/assets/onboarding/profiles/profile-airforce.png'
import army from '@/assets/onboarding/profiles/profile-army.png'
import marine from '@/assets/onboarding/profiles/profile-marine.png'
import navy from '@/assets/onboarding/profiles/profile-navy.png'

const props = defineProps({
  image: { type: String, required: true },
  backgroundColor: { type: String, required: true },
})
const emit = defineEmits(['close', 'save'])
const selectedImage = ref(props.image)
const selectedColor = ref(props.backgroundColor)
const profiles = [
  ['profile-army.png', army],
  ['profile-navy.png', navy],
  ['profile-airforce.png', airforce],
  ['profile-marine.png', marine],
]
const colors = ['#E5FFF4', '#AEBBAA', '#FFF0B8', '#FFB39F', '#F7F7F7', '#333333']
</script>

<template>
  <div
    class="sheet-backdrop"
    @click.self="emit('close')"
  >
    <section class="profile-sheet">
      <button
        class="close-button"
        aria-label="프로필 이미지 변경 닫기"
        @click="emit('close')"
      >
        ×
      </button>
      <h2>프로필 이미지 변경</h2>
      <h3>캐릭터 선택</h3>
      <div class="profile-options">
        <button
          v-for="[name, source] in profiles"
          :key="name"
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
          :class="{ selected: selectedColor === color }"
          :style="{ background: color }"
          @click="selectedColor = color"
        />
      </div>
      <button
        class="save-button"
        @click="emit('save', selectedImage, selectedColor)"
      >
        변경하기
      </button>
    </section>
  </div>
</template>

<style scoped>
.sheet-backdrop {
  position: fixed;
  z-index: 20;
  inset: 0;
  display: grid;
  background: #0007;
  place-items: center;
}
.profile-sheet {
  position: relative;
  width: min(calc(100% - 28px), 353px);
  padding: 27px 20px 20px;
  border-radius: 27px;
  background: #fff;
}
.close-button {
  position: absolute;
  top: 16px;
  right: 19px;
  padding: 0;
  border: 0;
  background: transparent;
  color: #444;
  font-size: 25px;
  line-height: 1;
}
h2 {
  margin: 0 0 38px;
  font-size: 18px;
  text-align: center;
}
h3 {
  margin: 0 0 12px;
  color: #6f886e;
  font-size: 11px;
}
.profile-options,
.color-options {
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}
.profile-options button {
  display: grid;
  width: 51px;
  height: 51px;
  place-items: center;
  border: 1px solid transparent;
  border-radius: 50%;
  background: #f5f5f5;
}
.profile-options button.selected,
.color-options button.selected {
  border-color: #37e982;
}
.profile-options img {
  width: 40px;
  height: 40px;
  object-fit: contain;
}
.color-options button {
  width: 36px;
  height: 36px;
  border: 1px solid transparent;
  border-radius: 50%;
}
.save-button {
  width: 100%;
  min-height: 54px;
  margin-top: 0;
  border: 0;
  border-radius: 27px;
  background: #35eb84;
  font-weight: 700;
}
</style>
