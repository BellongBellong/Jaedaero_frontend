<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

import checkboxFalseIcon from '@/assets/icons/Category/CheckboxFalse.svg'
import checkboxIcon from '@/assets/icons/Category/CheckboxIcon.png'
import closeIcon from '@/assets/icons/Category/closeIcon.svg'
import arrowIcon from '@/assets/icons/arrow.svg'

const props = defineProps({
  missions: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['close', 'mission-click', 'view-progress'])
const now = ref(new Date())
let timerId

const dailyMissions = computed(() =>
  props.missions.filter((mission) => mission.missionGroup === 'DAILY'),
)
const todayMissions = computed(() =>
  props.missions.filter((mission) => ['TODAY', 'RECOMMENDED'].includes(mission.missionGroup)),
)
const resetCountdown = computed(() => {
  const tomorrow = new Date(now.value)
  tomorrow.setHours(24, 0, 0, 0)
  const remainingSeconds = Math.max(0, Math.floor((tomorrow - now.value) / 1000))
  const hours = String(Math.floor(remainingSeconds / 3600)).padStart(2, '0')
  const minutes = String(Math.floor((remainingSeconds % 3600) / 60)).padStart(2, '0')
  const seconds = String(remainingSeconds % 60).padStart(2, '0')

  return `${hours}:${minutes}:${seconds}`
})

function missionTypeLabel(type) {
  return { COMMON: '공통', SAFE: '안정형', AGGRESSIVE: '공격형' }[type || 'COMMON'] ?? '공통'
}

function missionTypeClass(type) {
  return (
    { SAFE: 'safe', AGGRESSIVE: 'notification', COMMON: 'default' }[type || 'COMMON'] ?? 'default'
  )
}

function closeOnEscape(event) {
  if (event.key === 'Escape') emit('close')
}

onMounted(() => {
  document.body.style.overflow = 'hidden'
  window.addEventListener('keydown', closeOnEscape)
  timerId = window.setInterval(() => {
    now.value = new Date()
  }, 1000)
})

onBeforeUnmount(() => {
  document.body.style.overflow = ''
  window.removeEventListener('keydown', closeOnEscape)
  window.clearInterval(timerId)
})
</script>

<template>
  <div
    class="mission-sheet-backdrop"
    @click.self="$emit('close')"
  >
    <section
      class="mission-sheet"
      role="dialog"
      aria-modal="true"
      aria-labelledby="mission-sheet-title"
    >
      <button
        class="mission-sheet__close"
        type="button"
        aria-label="오늘의 미션 닫기"
        @click="$emit('close')"
      >
        <img
          :src="closeIcon"
          alt=""
          aria-hidden="true"
        >
      </button>

      <header class="mission-sheet__intro">
        <h2 id="mission-sheet-title">
          오늘의 미션
        </h2>
        <p>오늘의 미션을 달성하고 뱃지를 획득해보세요</p>
      </header>

      <div class="mission-sheet__scroll">
        <section
          v-for="group in [
            { key: 'daily', title: '데일리 미션', missions: dailyMissions },
            { key: 'today', title: '오늘의 미션', missions: todayMissions },
          ]"
          :key="group.key"
          class="mission-sheet__group"
        >
          <header>
            <h3>{{ group.title }}</h3>
            <p>
              초기화까지 <strong>{{ resetCountdown }}</strong>
            </p>
          </header>

          <ul v-if="group.missions.length">
            <li
              v-for="mission in group.missions"
              :key="mission.id"
            >
              <button
                type="button"
                @click="$emit('mission-click', mission)"
              >
                <img
                  class="mission-sheet__check"
                  :src="mission.completed ? checkboxIcon : checkboxFalseIcon"
                  alt=""
                  aria-hidden="true"
                >
                <span class="mission-sheet__content">
                  <span>
                    <strong>{{ mission.title }}</strong>
                    <em
                      class="app-label"
                      :class="`label--${missionTypeClass(mission.missionType)}`"
                    >
                      {{ missionTypeLabel(mission.missionType) }}
                    </em>
                  </span>
                  <small>{{ mission.description }}</small>
                </span>
                <img
                  class="mission-sheet__arrow"
                  :src="arrowIcon"
                  alt=""
                  aria-hidden="true"
                >
              </button>
            </li>
          </ul>

          <p
            v-else
            class="mission-sheet__empty"
          >
            등록된 미션이 없어요.
          </p>
        </section>
      </div>

      <button
        class="mission-sheet__progress"
        type="button"
        @click="emit('view-progress')"
      >
        나의 미션 진행상황 보러가기
        <img
          :src="arrowIcon"
          alt=""
          aria-hidden="true"
        >
      </button>
    </section>
  </div>
</template>

<style scoped>
.mission-sheet-backdrop {
  position: fixed;
  z-index: var(--z-modal);
  inset: 0 max(0px, calc((100vw - var(--mobile-width)) / 2));
  display: flex;
  align-items: flex-end;
  background: rgb(0 0 0 / 45%);
  animation: mission-backdrop-enter 240ms ease-out both;
}

.mission-sheet {
  position: relative;
  display: flex;
  width: 100%;
  max-height: min(800px, 92dvh);
  flex-direction: column;
  overflow: hidden;
  border-radius: 36px 36px 0 0;
  background: var(--white);
  box-shadow: 0 -12px 36px rgb(0 0 0 / 14%);
  animation: mission-sheet-enter 320ms cubic-bezier(0.22, 1, 0.36, 1) both;
}

@keyframes mission-sheet-enter {
  from {
    transform: translateY(100%);
  }

  to {
    transform: translateY(0);
  }
}

@keyframes mission-backdrop-enter {
  from {
    background: rgb(0 0 0 / 0%);
  }

  to {
    background: rgb(0 0 0 / 45%);
  }
}

.mission-sheet__close {
  position: absolute;
  z-index: 1;
  top: 20px;
  right: 22px;
  width: 36px;
  height: 36px;
  padding: 0;
  border: 0;
  background: transparent;
  cursor: pointer;
}

.mission-sheet__close img {
  display: block;
  width: 16px;
  height: 16px;
  margin: auto;
}

.mission-sheet__intro {
  padding: 76px var(--space-24) var(--space-16);
  border-bottom: 1px solid var(--gray-200);
}

.mission-sheet__intro h2,
.mission-sheet__intro p,
.mission-sheet__group h3,
.mission-sheet__group p {
  margin: 0;
}

.mission-sheet__intro h2 {
  color: var(--gray-900);
  font-size: 24px;
}

.mission-sheet__intro p {
  margin-top: 6px;
  color: var(--gray-600);
  font-size: 14px;
}

.mission-sheet__scroll {
  overflow-y: auto;
  padding: 0 var(--space-24);
}

.mission-sheet__group {
  padding: var(--space-20) 0;
}

.mission-sheet__group + .mission-sheet__group {
  border-top: 1px solid var(--gray-200);
}

.mission-sheet__group > header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-8);
}

.mission-sheet__group h3 {
  color: var(--gray-700);
  font-size: 14px;
}

.mission-sheet__group header p {
  color: var(--gray-400);
  font-size: 12px;
}

.mission-sheet__group header strong {
  font-size: 14px;
}

.mission-sheet__group ul {
  display: grid;
  gap: 12px;
  padding: var(--space-12) 0 0;
  margin: 0;
  list-style: none;
}

.mission-sheet__group li > button {
  display: flex;
  width: 100%;
  align-items: center;
  gap: 12px;
  padding: 8px 4px;
  border: 0;
  background: transparent;
  cursor: pointer;
  text-align: left;
}

.mission-sheet__check {
  flex: 0 0 auto;
  width: 24px;
  height: 24px;
  object-fit: contain;
}

.mission-sheet__content {
  display: grid;
  min-width: 0;
  flex: 1;
  gap: 3px;
}

.mission-sheet__content > span {
  display: flex;
  align-items: center;
  gap: 8px;
}

.mission-sheet__content strong {
  overflow: hidden;
  color: var(--ui-sub-title);
  font-size: 14px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.mission-sheet__content em {
  flex: 0 0 auto;
  font-style: normal;
}

.mission-sheet__content small {
  overflow: hidden;
  color: var(--gray-500);
  font-size: 11px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.mission-sheet__arrow {
  width: 7px;
  height: 11px;
  object-fit: contain;
}

.mission-sheet__empty {
  padding: var(--space-20) 0;
  color: var(--gray-500);
  font-size: 12px;
  text-align: center;
}

.mission-sheet__progress {
  display: flex;
  width: 100%;
  min-height: 48px;
  align-items: center;
  justify-content: center;
  gap: 5px;
  border: 0;
  border-top: 1px solid var(--gray-200);
  background: var(--white);
  color: var(--gray-500);
  cursor: pointer;
  font-size: 13px;
}

.mission-sheet__progress img {
  width: 7px;
  height: 11px;
}

@media (prefers-reduced-motion: reduce) {
  .mission-sheet-backdrop,
  .mission-sheet {
    animation: none;
  }
}
</style>
