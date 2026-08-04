<script setup>
defineProps({
  settings: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['close', 'toggle'])

const notificationItems = [
  {
    key: 'aiReport',
    title: '오늘의 AI 리포트',
    description: '매일 18시 금융 시장 분석 알림',
  },
  {
    key: 'mission',
    title: '미션 알림',
    description: '새 미션 및 완료 알림',
  },
  {
    key: 'payday',
    title: '급여 알림',
    description: '월급 지급일 D-3 알림',
  },
  {
    key: 'leaveMode',
    title: '휴가 모드 알림',
    description: '휴가, 외박, 외출 당일 모드 변경 알림',
  },
]
</script>

<template>
  <div
    class="notification-backdrop"
    @click.self="emit('close')"
  >
    <section
      class="notification-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="notification-settings-title"
    >
      <header>
        <h2 id="notification-settings-title">
          알림 설정
        </h2>
        <button
          type="button"
          class="close-button"
          aria-label="알림 설정 닫기"
          @click="emit('close')"
        >
          &times;
        </button>
      </header>

      <ul>
        <li
          v-for="item in notificationItems"
          :key="item.key"
        >
          <label :for="`notification-${item.key}`">
            <b>{{ item.title }}</b>
            <span>{{ item.description }}</span>
          </label>
          <button
            :id="`notification-${item.key}`"
            type="button"
            class="toggle"
            :class="{ 'toggle--active': settings[item.key] }"
            role="switch"
            :aria-checked="settings[item.key]"
            :aria-label="`${item.title} ${settings[item.key] ? '끄기' : '켜기'}`"
            @click="emit('toggle', item.key)"
          >
            <span />
          </button>
        </li>
      </ul>
    </section>
  </div>
</template>

<style scoped>
.notification-backdrop {
  position: fixed;
  z-index: 30;
  inset: 0;
  display: grid;
  padding: 16px;
  background: rgb(0 0 0 / 48%);
  place-items: center;
}

.notification-modal {
  width: min(100%, 383px);
  padding: 0 15px 28px;
  overflow: hidden;
  border-radius: 30px;
  background: #fff;
  color: #555;
}

header {
  position: relative;
  min-height: 69px;
}

h2 {
  margin: 0;
  color: #3f3f3f;
  font-size: 20px;
  line-height: 69px;
  text-align: center;
}

.close-button {
  position: absolute;
  top: 20px;
  right: 11px;
  padding: 0;
  border: 0;
  background: transparent;
  color: #444;
  font-size: 31px;
  line-height: 1;
}

ul {
  padding: 0;
  margin: 0;
  list-style: none;
}

li {
  display: flex;
  min-height: 84px;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 10px 20px;
  border-bottom: 1px solid #e9e9e9;
}

label {
  display: grid;
  min-width: 0;
  gap: 4px;
  cursor: pointer;
}

label b {
  color: #666;
  font-size: 17px;
}

label span {
  color: #999;
  font-size: 13px;
  white-space: nowrap;
}

.toggle {
  position: relative;
  width: 44px;
  height: 24px;
  flex: 0 0 44px;
  padding: 0;
  border: 0;
  border-radius: 999px;
  background: #dedede;
  transition: background-color 160ms ease;
}

.toggle span {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 1px 3px rgb(0 0 0 / 18%);
  transition: transform 160ms ease;
}

.toggle--active {
  background: #58f49a;
}

.toggle--active span {
  transform: translateX(20px);
}

.toggle:focus-visible {
  outline: 2px solid #20c86c;
  outline-offset: 3px;
}

@media (prefers-reduced-motion: reduce) {
  .toggle,
  .toggle span {
    transition: none;
  }
}
</style>
