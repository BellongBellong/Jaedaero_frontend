<script setup>
import ellipseFace from '@/assets/onboarding/intro/intro-ellipse-55340.svg'
import ellipseLight from '@/assets/onboarding/intro/intro-ellipse-55370.svg'
import glow from '@/assets/onboarding/intro/intro-group-21179046400.svg'
import leftFoot from '@/assets/onboarding/intro/intro-group-21179046360.svg'
import rightFoot from '@/assets/onboarding/intro/intro-group-21179046370.svg'
import body from '@/assets/onboarding/intro/intro-union0.svg'
import leftEye from '@/assets/onboarding/intro/intro-union1.svg'
import rightEye from '@/assets/onboarding/intro/intro-union2.svg'
import mouth from '@/assets/onboarding/intro/intro-vector-10089-stroke0.svg'
import leftArm from '@/assets/onboarding/intro/intro-vector-100910.svg'
import rightArm from '@/assets/onboarding/intro/intro-vector-100920.svg'
</script>

<template>
  <div
    class="intro-art"
    aria-hidden="true"
  >
    <img
      class="glow"
      :src="glow"
    >
    <div class="body">
      <img
        class="left-foot"
        :src="leftFoot"
      >
      <img
        class="right-foot"
        :src="rightFoot"
      >
      <img
        class="face"
        :src="ellipseFace"
      >
      <img
        class="body-shape"
        :src="body"
      >
      <img
        class="face-light"
        :src="ellipseLight"
      >
      <img
        class="mouth"
        :src="mouth"
      >
      <img
        class="left-eye"
        :src="leftEye"
      >
      <img
        class="right-eye"
        :src="rightEye"
      >
    </div>
    <img
      class="left-arm"
      :src="leftArm"
    >
    <img
      class="right-arm"
      :src="rightArm"
    >
  </div>
</template>

<style scoped>
.intro-art,
.intro-art img {
  position: absolute;
}
.intro-art {
  inset: 0;
  pointer-events: none;
}
.glow {
  top: 62px;
  left: -108px;
}
.body {
  position: absolute;
  top: 266px;
  left: 253px;
  width: 144px;
  height: 172px;
  transform: rotate(6.847deg) scale(-1, 1);
  transform-origin: 0 0;
}
.left-foot {
  right: 62.03%;
  bottom: 0.05%;
  width: 37.97%;
  height: 32.11%;
  transform: translateX(-20px);
}
.right-foot {
  top: 68.08%;
  left: 99.15%;
  width: 38.01%;
  height: 31.92%;
  transform: translate(-72px, -6.53px);
}
.face {
  top: 3.21%;
  left: 5.91%;
  width: 90.28%;
  height: 75.02%;
}
.body-shape {
  top: 0;
  left: 2.83px;
  width: 141.28px;
  height: 140.3px;
}
.face-light {
  top: 7.13%;
  left: 10.72%;
  width: 80.65%;
  height: 61.1%;
  mix-blend-mode: soft-light;
}
.mouth {
  top: 18.51%;
  left: 17.75%;
  width: 53.11%;
  height: 37.98%;
}
.left-eye,
.right-eye {
  top: 37.33px;
  width: 20.49px;
  height: 34.11px;
}
.left-eye {
  left: 35.08px;
}
.right-eye {
  left: 70.93px;
}
.left-arm {
  top: 280px;
  left: 243px;
  width: 34.86px;
  height: 59.97px;
}
.right-arm {
  top: 361px;
  left: 101px;
  width: 35.42px;
  height: 50.18px;
}
</style>
