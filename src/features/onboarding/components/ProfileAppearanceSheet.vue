<script setup>
import { ref } from 'vue'

import airforce from '@/assets/onboarding/profiles/profile-airforce.png'
import army from '@/assets/onboarding/profiles/profile-army.png'
import marine from '@/assets/onboarding/profiles/profile-marine.png'
import navy from '@/assets/onboarding/profiles/profile-navy.png'

const props = defineProps({
  image: { type: String, required: true },
  backgroundColor: { type: String, required: true },
  saving: { type: Boolean, default: false },
})
const emit = defineEmits(['close', 'save'])
const selectedImage = ref(props.image)
const selectedColor = ref(props.backgroundColor)
const profiles = [
  ['profile-army.png', army],
  ['profile-marine.png', marine],
  ['profile-airforce.png', airforce],
  ['profile-navy.png', navy],
]
const colors = ['#E5FFF4', '#AEBBAA', '#FFF0B8', '#FFB39F', '#F7F7F7', '#333333']
</script>

<template>
  <div
    class="sheet-backdrop"
    @click.self="emit('close')"
  >
    <section
      class="profile-sheet"
      role="dialog"
      aria-modal="true"
      aria-labelledby="profile-title"
    >
      <button
        class="close-button"
        type="button"
        aria-label="프로필 이미지 변경 닫기"
        @click="emit('close')"
      >
        &times;
      </button>
      <h2 id="profile-title">
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
        type="button"
        :disabled="saving"
        @click="emit('save', selectedImage, selectedColor)"
      >
        {{ saving ? '저장 중...' : '변경하기' }}
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
  padding: 16px;
  background: rgb(0 0 0 / 48%);
  place-items: center;
}
.profile-sheet {
  position: relative;
  width: min(100%, 383px);
  padding: 31px 26px 29px;
  border-radius: 30px;
  background: #fff;
}
.close-button {
  position: absolute;
  top: 29px;
  right: 28px;
  padding: 0;
  border: 0;
  background: transparent;
  color: #444;
  font-size: 34px;
  line-height: 1;
}
h2 {
  margin: 0 0 31px;
  font-size: 20px;
  text-align: center;
}
h3 {
  margin: 0 0 14px;
  color: #6f886e;
  font-size: 12px;
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
  background: #f5f5f5;
}
.profile-options button.selected,
.color-options button.selected {
  border: 1px solid #37e982;
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
.save-button {
  width: 100%;
  min-height: 57px;
  margin-top: -2px;
  border: 0;
  border-radius: 29px;
  background: #58f49a;
  color: #222;
  font-size: 16px;
  font-weight: 700;
}
.save-button:disabled {
  cursor: wait;
  opacity: 0.7;
}
</style>
type="button" :aria-label="`${name.replace('profile-', '').replace('.png', '')} 캐릭터`"
type="button" :aria-label="`${color} 배경색`"
