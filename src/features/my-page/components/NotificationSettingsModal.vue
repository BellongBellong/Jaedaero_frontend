<script setup>
defineProps({
  settings: {
    type: Object,
    required: true,
  },
  enabled: { type: Boolean, default: false },
  permission: { type: String, default: 'default' },
  supported: { type: Boolean, default: true },
  loading: { type: Boolean, default: false },
  errorMessage: { type: String, default: '' },
})

const emit = defineEmits(['close', 'toggle', 'toggle-all'])

const notificationItems = [
  {
    key: 'mission',
    title: '미션 알림',
    description: '오늘의 미션 및 미션 달성 알림',
  },
  {
    key: 'marketReport',
    title: '오늘의 AI 시장 리포트',
    description: '오늘의 시장 리포트 도착 알림',
  },
  {
    key: 'ranking',
    title: '랭킹 상승 알림',
    description: '이번 달 동기 랭킹 TOP3 진입 알림',
  },
  {
    key: 'investmentGuidance',
    title: '적립식 투자 가이드 알림',
    description: '매월 28일 새 투자 가이드 도착 알림',
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

      <section class="all-notifications-control">
        <label for="notification-all">
          <b>전체 알림 허용</b>
          <span v-if="permission === 'denied'">브라우저 설정에서 알림 권한을 허용해주세요.</span>
          <span v-else-if="!supported">이 브라우저에서는 푸시 알림을 지원하지 않아요.</span>
          <span v-else>이 기기에서 제대로의 모든 알림을 받아요</span>
        </label>
        <button
          id="notification-all"
          type="button"
          class="toggle"
          :class="{ 'toggle--active': enabled }"
          role="switch"
          :aria-checked="enabled"
          :aria-label="`전체 알림 허용 ${enabled ? '끄기' : '켜기'}`"
          :disabled="loading || !supported || permission === 'denied'"
          @click="emit('toggle-all')"
        >
          <span />
        </button>
      </section>

      <p
        v-if="errorMessage"
        class="notification-error"
        role="status"
      >
        {{ errorMessage }}
      </p>

      <ul
        class="notification-options"
        :class="{ 'notification-options--disabled': !enabled }"
        :aria-disabled="!enabled"
      >
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
            :disabled="!enabled || loading"
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
  display: flex;
  width: min(100%, 383px);
  max-height: calc(100dvh - 32px);
  flex-direction: column;
  padding: 0 15px 28px;
  overflow: hidden;
  border-radius: 30px;
  background: #fff;
  color: #555;
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

.notification-error {
  margin: 10px 20px 0;
  color: var(--orange-700);
  font-size: 12px;
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
  overflow-y: auto;
  list-style: none;
  overscroll-behavior: contain;
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

.all-notifications-control {
  display: flex;
  min-height: 80px;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex: 0 0 auto;
  padding: 14px 18px;
  margin: 0 5px 10px;
  border: 1px solid rgb(255 255 255 / 78%);
  border-radius: 20px;
  background: linear-gradient(135deg, var(--green-50), var(--yellow-50));
  box-shadow: 0 7px 18px rgb(35 54 42 / 7%);
}

.all-notifications-control label span {
  white-space: normal;
}

.notification-options li {
  transition: opacity 160ms ease;
}

.notification-options--disabled li {
  opacity: 0.42;
}

.notification-options--disabled label {
  cursor: default;
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

.toggle:disabled {
  cursor: default;
  opacity: 0.48;
}

@media (prefers-reduced-motion: reduce) {
  .toggle,
  .toggle span {
    transition: none;
  }
}
</style>
