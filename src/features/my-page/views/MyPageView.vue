<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

import badgeArrow from '@/assets/my-page/icon2.svg'
import bankIcon from '@/assets/my-page/icon3.svg'
import goalIcon from '@/assets/my-page/icon5.svg'
import notificationIcon from '@/assets/my-page/icon7.svg'
import logoutIcon from '@/assets/my-page/icon9.svg'
import profileAirforce from '@/assets/onboarding/profiles/profile-airforce.png'
import profileArmy from '@/assets/onboarding/profiles/profile-army.png'
import profileMarine from '@/assets/onboarding/profiles/profile-marine.png'
import profileNavy from '@/assets/onboarding/profiles/profile-navy.png'
import { getAccounts } from '@/features/accounts/api/accounts.api'
import { logout } from '@/features/auth/api/auth.api'
import GoalAmountModal from '@/features/my-page/components/GoalAmountModal.vue'
import NotificationSettingsModal from '@/features/my-page/components/NotificationSettingsModal.vue'
import ProfileAppearanceSheet from '@/features/onboarding/components/ProfileAppearanceSheet.vue'
import {
  checkNicknameAvailability,
  getGoal,
  getMyPageProfile,
  updateNickname,
  updateGoal,
  updateProfileAppearance,
  withdrawUser,
} from '@/features/my-page/api/myPage.api'

const router = useRouter()
const profile = ref(null)
const connectedAccountCount = ref(0)
const activeDialog = ref('')
const saving = ref(false)
const errorMessage = ref('')
const nicknameInput = ref('')
const nicknameStatus = ref('idle')
const goalAmount = ref(0)
const defaultNotificationSettings = {
  aiReport: false,
  mission: true,
  payday: false,
  leaveMode: true,
}
const notificationSettings = ref({ ...defaultNotificationSettings })

const profileImages = {
  ARMY: profileArmy,
  NAVY: profileNavy,
  AIRFORCE: profileAirforce,
  MARINE: profileMarine,
  'profile-army.png': profileArmy,
  'profile-navy.png': profileNavy,
  'profile-airforce.png': profileAirforce,
  'profile-marine.png': profileMarine,
}
const imageNames = {
  ARMY: 'profile-army.png',
  NAVY: 'profile-navy.png',
  AIRFORCE: 'profile-airforce.png',
  MARINE: 'profile-marine.png',
}
const imageCodes = Object.fromEntries(
  Object.entries(imageNames).map(([code, name]) => [name, code]),
)
const profileBackgrounds = {
  GREEN: '#E5FFF4',
  OLIVE: '#AEBBAA',
  YELLOW: '#FFF0B8',
  ORANGE: '#FFB39F',
  GRAY: '#F7F7F7',
  BLACK: '#333333',
}
const backgroundCodes = Object.fromEntries(
  Object.entries(profileBackgrounds).map(([code, color]) => [color, code]),
)
const militaryLabels = { ARMY: '육군', NAVY: '해군', AIRFORCE: '공군', MARINE: '해병대' }
const rankLabels = {
  PRIVATE: '이병',
  PRIVATE_FIRST_CLASS: '일병',
  CORPORAL: '상병',
  SERGEANT: '병장',
}
const nickname = computed(() => profile.value?.nickname || '사용자')
const currentImageName = computed(
  () =>
    imageNames[profile.value?.profileImage] || profile.value?.profileImage || 'profile-army.png',
)
const currentBackground = computed(
  () =>
    profile.value?.profileBackgroundColor ||
    profileBackgrounds[profile.value?.profileSource] ||
    '#E5FFF4',
)
const militaryLabel = computed(() => {
  const type = profile.value?.militaryType || profile.value?.soldierType
  const rank = profile.value?.rank || profile.value?.militaryRank
  return (
    [militaryLabels[type], rankLabels[rank] || rank].filter(Boolean).join(' · ') || '군 복무 정보'
  )
})
const validNickname = computed(() => /^[가-힣a-zA-Z]{2,12}$/.test(nicknameInput.value))

function openNicknameDialog() {
  nicknameInput.value = nickname.value
  nicknameStatus.value = 'idle'
  errorMessage.value = ''
  activeDialog.value = 'nickname'
}

function closeDialog() {
  if (saving.value) return
  activeDialog.value = ''
  errorMessage.value = ''
}

function toggleNotification(key) {
  notificationSettings.value[key] = !notificationSettings.value[key]
  localStorage.setItem('jaedaero-notification-settings', JSON.stringify(notificationSettings.value))
}

async function saveGoalAmount(targetAmount) {
  if (saving.value) return
  saving.value = true
  errorMessage.value = ''
  try {
    const result = await updateGoal(targetAmount)
    goalAmount.value = result?.targetAmount ?? targetAmount
    activeDialog.value = ''
  } catch {
    errorMessage.value = '목표 금액을 변경하지 못했어요. 잠시 후 다시 시도해주세요.'
  } finally {
    saving.value = false
  }
}

async function validateNickname() {
  if (!validNickname.value || saving.value) return
  saving.value = true
  errorMessage.value = ''
  try {
    const result = await checkNicknameAvailability(nicknameInput.value)
    nicknameStatus.value = result.available ? 'available' : 'duplicate'
  } catch {
    errorMessage.value = '중복 확인 중 오류가 발생했어요.'
  } finally {
    saving.value = false
  }
}

async function saveNickname() {
  if (nicknameStatus.value !== 'available' || saving.value) return
  saving.value = true
  try {
    await updateNickname(nicknameInput.value)
    profile.value = { ...profile.value, nickname: nicknameInput.value }
    activeDialog.value = ''
  } catch {
    errorMessage.value = '닉네임을 변경하지 못했어요. 잠시 후 다시 시도해주세요.'
  } finally {
    saving.value = false
  }
}

async function saveAppearance(image, color) {
  if (saving.value) return
  saving.value = true
  errorMessage.value = ''
  try {
    await updateProfileAppearance({
      profileImage: imageCodes[image],
      profileSource: backgroundCodes[color],
    })
    profile.value = {
      ...profile.value,
      profileImage: imageCodes[image],
      profileSource: backgroundCodes[color],
      profileBackgroundColor: color,
    }
    activeDialog.value = ''
  } catch {
    errorMessage.value = '프로필 이미지를 변경하지 못했어요.'
  } finally {
    saving.value = false
  }
}

function clearSession() {
  localStorage.removeItem('accessToken')
  localStorage.removeItem('refreshToken')
  localStorage.removeItem('userId')
}

async function confirmLogout() {
  if (saving.value) return
  saving.value = true
  try {
    await logout()
  } finally {
    clearSession()
    await router.replace({ name: 'social-login' })
    saving.value = false
  }
}

async function confirmWithdraw() {
  if (saving.value) return
  saving.value = true
  try {
    await withdrawUser()
    clearSession()
    await router.replace({ name: 'social-login' })
  } catch {
    errorMessage.value = '탈퇴 처리 중 오류가 발생했어요.'
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  try {
    const savedSettings = JSON.parse(localStorage.getItem('jaedaero-notification-settings'))
    if (savedSettings && typeof savedSettings === 'object') {
      notificationSettings.value = { ...defaultNotificationSettings, ...savedSettings }
    }
  } catch {
    localStorage.removeItem('jaedaero-notification-settings')
  }

  const userId = Number(localStorage.getItem('userId'))
  const [profileResult, accountsResult, goalResult] = await Promise.allSettled([
    getMyPageProfile(),
    userId ? getAccounts(userId) : Promise.resolve([]),
    getGoal(),
  ])
  if (profileResult.status === 'fulfilled') profile.value = profileResult.value
  if (accountsResult.status === 'fulfilled') {
    connectedAccountCount.value = new Set(accountsResult.value.map(({ bankName }) => bankName)).size
  }
  if (goalResult.status === 'fulfilled') goalAmount.value = goalResult.value?.targetAmount || 0
})
</script>

<template>
  <main class="mypage screen">
    <section class="profile-section">
      <button
        type="button"
        class="profile-avatar"
        :style="{ background: currentBackground }"
        aria-label="프로필 이미지 변경"
        @click="activeDialog = 'appearance'"
      >
        <img
          :src="profileImages[profile?.profileImage] || profileArmy"
          alt="현재 프로필"
        >
        <span aria-hidden="true">↻</span>
      </button>
      <h2>{{ nickname }}</h2>
      <p>{{ militaryLabel }}</p>
      <button
        type="button"
        class="nickname-button"
        @click="openNicknameDialog"
      >
        닉네임 변경
      </button>
    </section>

    <section class="settings-card badge-card">
      <h3>투자 배지</h3>
      <button
        type="button"
        class="badge-summary"
        @click="router.push({ name: 'badge-history' })"
      >
        <span class="badge-icon">🏅</span>
        <span><b>나의 투자 배지</b><small>배지 내역 보기</small></span>
        <img
          :src="badgeArrow"
          alt=""
        >
      </button>
    </section>

    <section class="settings-card">
      <h3>계정 설정</h3>
      <button
        type="button"
        class="menu-row"
        @click="router.push({ name: 'connected-banks' })"
      >
        <span class="menu-icon bank"><img
          :src="bankIcon"
          alt=""
        ></span><b>연결 계좌</b> <small>{{ connectedAccountCount }}개 연결됨</small><span class="chevron">›</span>
      </button>
      <button
        type="button"
        class="menu-row"
        @click="activeDialog = 'goal'"
      >
        <span class="menu-icon goal"><img
          :src="goalIcon"
          alt=""
        ></span><b>목표 금액 변경</b>
        <span class="chevron">›</span>
      </button>
    </section>

    <section class="settings-card app-settings">
      <h3>앱 설정</h3>
      <button
        type="button"
        class="menu-row"
        @click="activeDialog = 'notifications'"
      >
        <span class="menu-icon"><img
          :src="notificationIcon"
          alt=""
        ></span><b>알림 설정</b>
        <span class="chevron">›</span>
      </button>
      <button
        type="button"
        class="menu-row logout"
        @click="activeDialog = 'logout'"
      >
        <span class="menu-icon"><img
          :src="logoutIcon"
          alt=""
        ></span><b>로그아웃</b>
      </button>
      <button
        type="button"
        class="withdraw"
        @click="activeDialog = 'withdraw'"
      >
        회원 탈퇴
      </button>
    </section>

    <ProfileAppearanceSheet
      v-if="activeDialog === 'appearance'"
      :image="currentImageName"
      :background-color="currentBackground"
      :saving="saving"
      @close="closeDialog"
      @save="saveAppearance"
    />

    <NotificationSettingsModal
      v-if="activeDialog === 'notifications'"
      :settings="notificationSettings"
      @close="closeDialog"
      @toggle="toggleNotification"
    />

    <GoalAmountModal
      v-if="activeDialog === 'goal'"
      :amount="goalAmount"
      :saving="saving"
      :error-message="errorMessage"
      @close="closeDialog"
      @save="saveGoalAmount"
    />

    <div
      v-if="activeDialog === 'nickname'"
      class="dialog-backdrop"
      @click.self="closeDialog"
    >
      <section
        class="dialog nickname-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="nickname-title"
      >
        <button
          type="button"
          class="dialog-close"
          aria-label="닫기"
          @click="closeDialog"
        >
          &times;
        </button>
        <h2 id="nickname-title">
          닉네임 변경
        </h2>
        <div class="nickname-row">
          <input
            v-model.trim="nicknameInput"
            maxlength="12"
            placeholder="닉네임 변경"
            aria-label="새 닉네임"
            @input="nicknameStatus = 'idle'"
            @keyup.enter="validateNickname"
          >
          <button
            type="button"
            :disabled="!validNickname || saving"
            @click="validateNickname"
          >
            중복확인
          </button>
        </div>
        <p
          v-if="nicknameStatus === 'available'"
          class="success"
        >
          ●&nbsp; 사용 가능한 이름입니다.
        </p>
        <p
          v-else-if="nicknameStatus === 'duplicate'"
          class="error"
        >
          이미 사용 중인 이름입니다.
        </p>
        <p
          v-else-if="errorMessage"
          class="error"
        >
          {{ errorMessage }}
        </p>
        <p
          v-else
          class="hint"
        >
          ●&nbsp; 한글, 영문 최대 12자
        </p>
        <button
          v-if="nicknameStatus === 'available'"
          type="button"
          class="dialog-primary compact"
          :disabled="saving"
          @click="saveNickname"
        >
          변경하기
        </button>
      </section>
    </div>

    <div
      v-if="['logout', 'withdraw'].includes(activeDialog)"
      class="dialog-backdrop"
      @click.self="closeDialog"
    >
      <section
        class="dialog confirm-dialog"
        role="alertdialog"
        aria-modal="true"
      >
        <button
          type="button"
          class="dialog-close"
          aria-label="닫기"
          @click="closeDialog"
        >
          &times;
        </button>
        <h2 :class="{ 'withdraw-title': activeDialog === 'withdraw' }">
          {{ activeDialog === 'logout' ? '로그아웃' : '탈퇴하기' }}
        </h2>
        <p>정말로 {{ activeDialog === 'logout' ? '로그아웃' : '탈퇴' }} 하시겠습니까?</p>
        <button
          type="button"
          class="dialog-primary"
          :disabled="saving"
          @click="activeDialog === 'logout' ? confirmLogout() : confirmWithdraw()"
        >
          네
        </button>
        <button
          type="button"
          class="dialog-secondary"
          :disabled="saving"
          @click="closeDialog"
        >
          {{ activeDialog === 'logout' ? '아니요' : '아니요 전역은 멀었어요...' }}
        </button>
        <p
          v-if="errorMessage"
          class="error"
        >
          {{ errorMessage }}
        </p>
      </section>
    </div>
  </main>
</template>

<style scoped>
.mypage {
  padding: 24px 20px 14px;
  background: #fafafa;
  color: #333;
}
.profile-section {
  display: flex;
  align-items: center;
  flex-direction: column;
  padding: 20px 0 30px;
}
.profile-avatar {
  position: relative;
  display: grid;
  width: 82px;
  height: 82px;
  place-items: center;
  border: 1px dashed #31e47c;
  border-radius: 50%;
}
.profile-avatar > img {
  width: 64px;
  height: 64px;
  object-fit: contain;
}
.profile-avatar span {
  position: absolute;
  right: -2px;
  bottom: 0;
  display: grid;
  width: 27px;
  height: 27px;
  place-items: center;
  border-radius: 50%;
  background: #35e780;
  color: #fff;
}
.profile-section h2 {
  margin: 16px 0 4px;
  font-size: 21px;
  text-decoration: underline;
}
.profile-section p {
  margin: 0 0 8px;
  color: #777;
  font-size: 14px;
  font-weight: 700;
}
.nickname-button {
  padding: 5px 12px;
  border: 0;
  border-radius: 14px;
  background: #eee;
  color: #888;
  font-size: 12px;
}
.settings-card {
  padding: 20px;
  margin-bottom: 15px;
  border-radius: 28px;
  background: #fff;
}
.settings-card h3 {
  margin: 0 0 9px;
  color: #999;
  font-size: 15px;
  font-weight: 500;
}
.badge-summary,
.menu-row {
  display: flex;
  width: 100%;
  align-items: center;
  padding: 0;
  border: 0;
  background: transparent;
  text-align: left;
}
.badge-icon {
  display: grid;
  width: 47px;
  height: 47px;
  place-items: center;
  border: 1px solid #7bf3ac;
  border-radius: 14px;
  font-size: 22px;
}
.badge-summary > span:nth-child(2) {
  display: grid;
  gap: 4px;
  margin-left: 12px;
}
.badge-summary small {
  color: #aaa;
  font-size: 12px;
}
.badge-summary > img {
  width: 18px;
  margin-left: auto;
}
.menu-row {
  min-height: 60px;
  gap: 14px;
  border-bottom: 1px solid #eee;
  color: #333;
}
.menu-row:last-of-type {
  border-bottom: 0;
}
.menu-row b {
  font-size: 15px;
}
.menu-row small {
  margin-left: auto;
  color: #999;
}
.menu-icon {
  display: grid;
  width: 36px;
  height: 36px;
  flex: 0 0 36px;
  place-items: center;
  border-radius: 10px;
  background: #f5f5f5;
}
.menu-icon img {
  width: 22px;
  height: 22px;
}
.menu-icon.bank {
  background: #e9f5ff;
}
.menu-icon.goal {
  background: #f7edff;
}
.chevron {
  margin-left: auto;
  color: #aaa;
  font-size: 25px;
}
.logout {
  color: #ff4c4c;
}
.withdraw {
  padding: 17px 0 0;
  border: 0;
  background: transparent;
  color: #bbb;
}
.dialog-backdrop {
  position: fixed;
  z-index: 30;
  inset: 0;
  display: grid;
  padding: 16px;
  background: rgb(0 0 0 / 48%);
  place-items: center;
}
.dialog {
  position: relative;
  width: min(100%, 383px);
  padding: 31px 15px 30px;
  border-radius: 30px;
  background: #fff;
  text-align: center;
}
.dialog-close {
  position: absolute;
  top: 26px;
  right: 28px;
  border: 0;
  background: transparent;
  color: #444;
  font-size: 34px;
  line-height: 1;
}
.dialog h2 {
  margin: 0 0 20px;
  font-size: 27px;
}
.nickname-dialog {
  padding: 31px 11px 34px;
}
.nickname-dialog h2 {
  margin-bottom: 18px;
  font-size: 20px;
}
.nickname-row {
  display: flex;
  gap: 10px;
}
.nickname-row input {
  min-width: 0;
  height: 54px;
  flex: 1;
  padding: 0 20px;
  border: 1px solid #ddd;
  border-radius: 15px;
  outline: none;
}
.nickname-row input:focus {
  border-color: #35e780;
}
.nickname-row button {
  width: 111px;
  border: 0;
  border-radius: 15px;
  background: #58f49a;
  color: #333;
  font-weight: 700;
}
.nickname-row button:disabled {
  background: #ddd;
  color: #999;
}
.hint,
.success,
.error {
  margin: 9px 5px 0;
  text-align: left;
  font-size: 13px;
}
.hint {
  color: #aaa;
}
.success {
  color: #1fa25c;
}
.error {
  color: #ff4b4b;
}
.confirm-dialog h2 {
  margin-top: 2px;
  color: #ff4141;
  font-size: 32px;
}
.confirm-dialog .withdraw-title {
  text-decoration: underline;
  text-underline-offset: 3px;
}
.confirm-dialog > p:not(.error) {
  margin: 0 0 24px;
  font-size: 16px;
}
.dialog-primary,
.dialog-secondary {
  width: 100%;
  min-height: 56px;
  border: 0;
  border-radius: 29px;
  font-size: 16px;
  font-weight: 700;
}
.dialog-primary {
  background: #58f49a;
}
.dialog-secondary {
  margin-top: 14px;
  background: #e2fff0;
}
.dialog-primary.compact {
  margin-top: 22px;
}
@media (max-height: 760px) {
  .profile-section {
    padding-block: 10px 20px;
  }
  .settings-card {
    margin-bottom: 10px;
  }
}
</style>
