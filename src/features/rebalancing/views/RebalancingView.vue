<script setup>
import { useRouter } from 'vue-router'

import aiCoachCharacter from '@/assets/AI 코치 캐릭.svg'
import glidePathStage1 from '@/assets/리밸런싱.글라이드패스(우주선)=1단계.svg'
import glidePathStage2 from '@/assets/리밸런싱.글라이드패스(우주선)=2단계.svg'
import glidePathStage3 from '@/assets/리밸런싱.글라이드패스(우주선)=3단계.svg'
import glidePathStage4 from '@/assets/리밸런싱.글라이드패스(우주선)=4단계.svg'
import BaseIcon from '@/common/components/common/BaseIcon.vue'

const router = useRouter()
const currentStep = 4
const glidePathVisualStep = 3

const glidePathImages = {
  1: glidePathStage1,
  2: glidePathStage2,
  3: glidePathStage3,
  4: glidePathStage4,
}

const currentGlidePathImage = glidePathImages[glidePathVisualStep]

const marketRows = [
  { name: '코스피', value: '2,740.12', change: '+1.34%', positive: true },
  { name: '미국채 10년', value: '4.31%', change: '-0.05%', positive: false },
  { name: '원/달러', value: '1,318', change: '-0.05%', positive: false },
]

const navigationItems = [
  { id: 'home', icon: 'home', label: '홈' },
  { id: 'coach', icon: 'sparkles', label: 'AI 코치', active: true },
  { id: 'challenge', icon: 'target', label: '챌린지' },
  { id: 'profile', icon: 'user', label: '내 정보' },
]

const openReport = () => {
  router.push({ name: 'AiAnalysisDetail', params: { analysisId: '1' } })
}
</script>

<template>
  <main class="coach-page">
    <div class="coach-page__glow" />

    <header class="coach-header">
      <button
        class="icon-button"
        type="button"
        aria-label="뒤로 가기"
        @click="router.back()"
      >
        <BaseIcon
          name="chevron-left"
          :size="26"
          :stroke-width="2.5"
          decorative
        />
      </button>
      <h1>AI 코치</h1>
    </header>

    <section
      class="coach-content"
      aria-labelledby="coach-question"
    >
      <h2 id="coach-question">
        지금 윤호님에게 필요한<br>금융 행동은 무엇일까요?
      </h2>

      <article class="report-card">
        <img
          class="robot-character"
          :src="aiCoachCharacter"
          alt=""
          width="92"
          height="101"
        >

        <div class="report-card__heading">
          <strong>오늘의 AI 투자 리포트</strong>
          <span class="beta-badge">BETA</span>
          <time datetime="2026-07-28">2026. 07. 28 기준</time>
        </div>

        <dl class="market-list">
          <div
            v-for="item in marketRows"
            :key="item.name"
            class="market-row"
          >
            <dt>{{ item.name }}</dt>
            <dd>{{ item.value }}</dd>
            <span :class="['change-badge', { 'change-badge--positive': item.positive }]">
              {{ item.change }}
            </span>
          </div>
        </dl>

        <div class="report-tip">
          <span aria-hidden="true">💡</span>
          <p>
            군인공제회 금리가 <strong>5.2%</strong>로 시중은행 대비 유리한 환경이에요. 추가 납입을
            검토해보세요.
          </p>
        </div>

        <button
          class="text-link"
          type="button"
          @click="openReport"
        >
          전체 리포트 보기
          <BaseIcon
            name="chevron-right"
            :size="14"
            decorative
          />
        </button>
      </article>

      <section
        class="analysis-menu"
        aria-labelledby="analysis-menu-title"
      >
        <h3 id="analysis-menu-title">
          AI 분석 메뉴
        </h3>
        <div class="analysis-menu__items">
          <button
            class="analysis-menu__item"
            type="button"
            @click="openReport"
          >
            <span class="analysis-menu__circle">
              <span
                class="control-symbol"
                aria-hidden="true"
              >
                <i /><i /><i />
              </span>
              <span class="analysis-menu__label"><b>what if</b>시뮬레이션</span>
            </span>
          </button>
          <button
            class="analysis-menu__item"
            type="button"
            @click="openReport"
          >
            <span class="analysis-menu__circle">
              <span
                class="analysis-face"
                aria-hidden="true"
              >
                <i class="analysis-face__eye analysis-face__eye--left" />
                <i class="analysis-face__eye analysis-face__eye--right" />
                <i class="analysis-face__smile" />
              </span>
              <span class="analysis-menu__label">AI 분석</span>
            </span>
          </button>
          <button
            class="analysis-menu__item"
            type="button"
            @click="openReport"
          >
            <span class="analysis-menu__circle">
              <span
                class="record-symbol"
                aria-hidden="true"
              />
              <span class="analysis-menu__label">분석 기록</span>
            </span>
          </button>
        </div>
      </section>

      <article class="rebalancing-card">
        <p>리밸런싱 · 글라이드패스</p>
        <div class="rebalancing-card__body">
          <div>
            <span class="current-step">현재 단계</span>
            <strong>{{ currentStep }}단계 <em>집중 납입기</em></strong>
            <span class="step-chip">전역 D-54</span>
          </div>
          <img
            class="glide-path-visual"
            :src="currentGlidePathImage"
            alt=""
            width="117"
            height="68"
          >
        </div>
        <div class="risk-labels">
          <span>안전 85%</span>
          <span>위험 15%</span>
        </div>
        <div class="risk-bar">
          <span /><i />
        </div>
        <button
          class="rebalancing-link"
          type="button"
          @click="openReport"
        >
          현재 전략 보기
          <BaseIcon
            name="chevron-right"
            :size="14"
            decorative
          />
        </button>
      </article>
    </section>

    <button
      class="assistant-button"
      type="button"
      aria-label="AI 도우미 열기"
    >
      <span class="assistant-button__face">•ᴗ•</span>
    </button>

    <nav
      class="bottom-nav"
      aria-label="주요 메뉴"
    >
      <button
        v-for="item in navigationItems"
        :key="item.id"
        :class="['bottom-nav__item', { 'bottom-nav__item--active': item.active }]"
        type="button"
        :aria-current="item.active ? 'page' : undefined"
      >
        <span class="bottom-nav__icon">
          <BaseIcon
            :name="item.icon"
            :size="22"
            :stroke-width="2.5"
            decorative
          />
        </span>
        <span class="sr-only">{{ item.label }}</span>
      </button>
    </nav>
  </main>
</template>

<style scoped>
.coach-page {
  position: relative;
  width: min(100%, 390px);
  min-height: 100svh;
  margin: 0 auto;
  overflow: hidden;
  color: #272727;
  background: linear-gradient(
    180deg,
    #ccf7dc 0%,
    #eaf8ef 27%,
    #fbfbfa 52%,
    #fafbf5 65%,
    #fff3bd 86%,
    #e5f5c5 100%
  );
}

.coach-page__glow {
  position: absolute;
  right: -70px;
  bottom: -55px;
  width: 430px;
  height: 390px;
  background:
    radial-gradient(circle at 92% 34%, rgb(119 239 151 / 36%), transparent 48%),
    radial-gradient(circle at 18% 83%, rgb(255 222 111 / 34%), transparent 52%);
  filter: blur(24px);
  pointer-events: none;
}

.coach-header {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  gap: 0;
  height: 70px;
  padding: 16px 14px 4px;
}

.coach-header h1 {
  margin: 0;
  font-size: 17px;
  font-weight: 800;
  letter-spacing: -0.025em;
}

.icon-button {
  display: grid;
  width: 24px;
  height: 40px;
  padding: 0;
  border: 0;
  color: inherit;
  background: transparent;
  place-items: center;
  cursor: pointer;
}

.coach-content {
  position: relative;
  z-index: 1;
  padding: 8px 14px 112px;
}

.coach-content h2 {
  margin: 0 0 12px 14px;
  font-size: 20px;
  line-height: 1.42;
  letter-spacing: -0.04em;
}

.report-card {
  position: relative;
  padding: 23px 15px 10px;
  border-radius: 26px;
  background: rgb(255 255 255 / 98%);
}

.report-card__heading {
  display: grid;
  grid-template-columns: max-content max-content;
  align-items: center;
  justify-content: start;
  gap: 6px 8px;
  margin-bottom: 12px;
  color: #727272;
  font-size: 12px;
}

.report-card__heading strong {
  font-size: 13px;
}

.report-card__heading time {
  grid-column: 1 / -1;
  color: #9a9a9a;
}

.beta-badge {
  padding: 3px 8px;
  border-radius: 999px;
  color: #668168;
  background: #e8eee6;
  font-size: 9px;
  font-weight: 800;
}

.robot-character {
  position: absolute;
  z-index: 2;
  top: -38px;
  right: 10px;
  display: block;
  width: 106px;
  height: 116px;
  filter: drop-shadow(0 8px 9px rgb(0 0 0 / 11%));
  object-fit: contain;
  pointer-events: none;
}

.market-list {
  margin: 0;
}

.market-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 68px 58px;
  align-items: center;
  min-height: 38px;
  column-gap: 9px;
  font-size: 11px;
}

.market-row dt {
  font-weight: 700;
}
.market-row dd {
  justify-self: end;
  margin: 0;
  color: #666;
}

.change-badge {
  justify-self: end;
  padding: 4px 7px;
  border-radius: 999px;
  color: #ff755f;
  background: #fff1ed;
  font-size: 10px;
  font-weight: 800;
}

.change-badge--positive {
  color: #1fc968;
  background: #e7faed;
}

.report-tip {
  display: flex;
  gap: 6px;
  margin-top: 5px;
  padding: 11px 10px;
  border-radius: 13px;
  color: #65736b;
  background: #e8fff0;
  font-size: 10px;
  line-height: 1.6;
}

.report-tip p {
  margin: 0;
}
.report-tip strong {
  color: #20ad5d;
}

.text-link,
.rebalancing-link {
  display: flex;
  align-items: center;
  gap: 1px;
  margin: 5px 0 0 auto;
  padding: 0;
  border: 0;
  color: #999;
  background: transparent;
  font-size: 10px;
  cursor: pointer;
}

.analysis-menu {
  margin-top: 7px;
}

.analysis-menu h3 {
  margin: 0 0 9px;
  color: #707772;
  font-size: 13px;
  font-weight: 600;
}

.analysis-menu__items {
  display: grid;
  grid-template-columns: repeat(3, clamp(84px, 27.7vw, 108px));
  justify-content: center;
  gap: 10px;
}

.analysis-menu__item {
  min-width: 0;
  padding: 0;
  border: 0;
  border-radius: 50%;
  background: transparent;
  font: inherit;
  cursor: pointer;
}

.analysis-menu__circle {
  display: flex;
  width: 100%;
  aspect-ratio: 1;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 10px;
  border: 1px solid rgb(255 255 255 / 82%);
  border-radius: 50%;
  background: rgb(255 255 255 / 28%);
  box-shadow: inset 0 0 12px rgb(255 255 255 / 10%);
  backdrop-filter: blur(10px);
}

.analysis-menu__label {
  color: #747b77;
  font-size: 10px;
  line-height: 1.3;
  text-align: center;
}

.analysis-menu__label b {
  display: block;
  font-weight: 500;
}

.control-symbol {
  display: flex;
  width: 29px;
  height: 27px;
  justify-content: space-between;
  padding: 0 3px;
}

.control-symbol i {
  position: relative;
  width: 1.5px;
  border-radius: 3px;
  background: #69dfac;
}

.control-symbol i::after {
  position: absolute;
  top: 5px;
  left: -2.5px;
  width: 6px;
  height: 7px;
  border-radius: 2px;
  background: #ffd84d;
  content: '';
}

.control-symbol i:nth-child(2)::after {
  top: 16px;
  background: #ff8b7d;
}
.control-symbol i:nth-child(3)::after {
  top: 9px;
  background: #50cfc1;
}

.analysis-face {
  position: relative;
  display: grid;
  width: 27px;
  height: 27px;
  border: 2px solid rgb(255 230 138 / 62%);
  border-radius: 50%;
  background:
    radial-gradient(circle at 35% 30%, #f2ffb0 0 12%, transparent 13%),
    linear-gradient(145deg, #d8ef72 8%, #52dda0 58%, #21bd82 100%);
  box-shadow:
    0 2px 7px rgb(27 190 125 / 28%),
    0 0 0 2px rgb(239 255 203 / 20%);
  place-items: center;
}

.analysis-face__eye {
  position: absolute;
  top: 9px;
  width: 2px;
  height: 3px;
  border-radius: 50%;
  background: #158866;
}

.analysis-face__eye--left {
  left: 7px;
}

.analysis-face__eye--right {
  right: 7px;
}

.analysis-face__smile {
  position: absolute;
  top: 12px;
  left: 9px;
  width: 6px;
  height: 5px;
  border-bottom: 1.5px solid #158866;
  border-radius: 50%;
}

.record-symbol {
  position: relative;
  width: 27px;
  height: 27px;
  border: 3px solid rgb(255 255 255 / 38%);
  border-radius: 7px;
  background: linear-gradient(140deg, #66e3ae 10%, #75df85 52%, #e7da64 100%);
  box-shadow:
    0 3px 9px rgb(72 224 139 / 18%),
    inset 0 0 5px rgb(255 255 255 / 32%);
}

.record-symbol::after {
  position: absolute;
  inset: 3px;
  border-radius: 4px;
  background: linear-gradient(145deg, rgb(255 255 255 / 34%), transparent 62%);
  content: '';
}

.rebalancing-card {
  position: relative;
  min-height: 150px;
  margin-top: 8px;
  padding: 18px 22px;
  border: 1px solid rgb(255 255 255 / 90%);
  border-radius: 24px;
  color: #5e6f62;
  background: rgb(255 255 255 / 76%);
  text-align: left;
  backdrop-filter: blur(9px);
}

.rebalancing-card > p {
  margin: 0 0 13px;
  color: #797979;
  font-size: 11px;
}
.rebalancing-card__body {
  display: flex;
  justify-content: space-between;
}
.rebalancing-card__body > div:first-child {
  display: flex;
  flex-direction: column;
}
.current-step {
  margin-bottom: 2px;
  color: #999;
  font-size: 9px;
}
.rebalancing-card strong {
  font-size: 15px;
}
.rebalancing-card em {
  color: #1ebd57;
  font-style: normal;
}
.step-chip {
  align-self: flex-start;
  margin-top: 5px;
  padding: 3px 8px;
  border-radius: 999px;
  background: #e8ffeb;
  color: #39a75e;
  font-size: 9px;
}
.glide-path-visual {
  display: block;
  width: 117px;
  height: 68px;
  margin: -4px -3px 0 0;
  object-fit: contain;
}
.risk-labels {
  display: flex;
  gap: 41px;
  margin-top: 8px;
  color: #8a8a8a;
  font-size: 9px;
}
.risk-bar {
  display: flex;
  width: 112px;
  height: 11px;
  margin-top: 4px;
  overflow: hidden;
  background: #eee;
}
.risk-bar span {
  width: 85%;
  background: linear-gradient(90deg, #bbe578, #43e177);
}
.risk-bar i {
  flex: 1;
  background: linear-gradient(90deg, #ff9f85, #fff);
}
.rebalancing-link {
  position: absolute;
  right: 18px;
  bottom: 21px;
  color: #718b78;
  font-weight: 700;
}

.assistant-button {
  position: fixed;
  z-index: 5;
  top: 51%;
  left: max(7px, calc(50% - 188px));
  display: grid;
  width: 38px;
  height: 38px;
  padding: 3px;
  border: 3px solid #28a8ff;
  border-radius: 50% 50% 50% 8px;
  color: #1574bd;
  background: white;
  box-shadow: 0 2px 7px rgb(0 0 0 / 18%);
  place-items: center;
  cursor: pointer;
}

.assistant-button__face {
  display: grid;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  color: white;
  background: linear-gradient(135deg, #1bd3ff, #6959ff);
  font-size: 9px;
  font-weight: 800;
  place-items: center;
}

.bottom-nav {
  position: fixed;
  z-index: 4;
  right: 0;
  bottom: 32px;
  left: 0;
  display: flex;
  width: min(calc(100% - 96px), 270px);
  height: 60px;
  align-items: center;
  justify-content: space-around;
  margin: auto;
  padding: 7px 12px;
  border-radius: 999px;
  background: rgb(173 183 176 / 62%);
  box-shadow: 0 5px 14px rgb(72 72 72 / 6%);
  backdrop-filter: blur(9px);
}

.bottom-nav__item {
  display: grid;
  width: 46px;
  height: 46px;
  flex: 0 0 46px;
  padding: 0;
  border: 0;
  border-radius: 50%;
  color: white;
  background: transparent;
  place-items: center;
  cursor: pointer;
}

.bottom-nav__item--active {
  width: 64px;
  flex-basis: 64px;
  border-radius: 999px;
  background: #20c987;
  box-shadow: 0 2px 6px rgb(32 161 108 / 10%);
}
.bottom-nav__icon {
  display: grid;
  place-items: center;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
}

@media (min-width: 391px) {
  .coach-page {
    box-shadow: 0 0 36px rgb(0 0 0 / 12%);
  }
}

@media (max-width: 360px) {
  .coach-content {
    padding-right: 14px;
    padding-left: 14px;
  }
  .coach-content h2 {
    margin-left: 14px;
  }
}
</style>
