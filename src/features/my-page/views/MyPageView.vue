<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

import badgeArrow from '@/assets/my-page/icon2.svg'
import bankIcon from '@/assets/my-page/icon3.svg'
import goalIcon from '@/assets/my-page/icon5.svg'
import notificationIcon from '@/assets/my-page/icon7.svg'
import logoutIcon from '@/assets/my-page/icon9.svg'
import defaultProfileImage from '@/assets/my-page/image-1860.png'
import profileAirforce from '@/assets/onboarding/profiles/profile-airforce.png'
import profileArmy from '@/assets/onboarding/profiles/profile-army.png'
import profileMarine from '@/assets/onboarding/profiles/profile-marine.png'
import profileNavy from '@/assets/onboarding/profiles/profile-navy.png'
import { getAccounts } from '@/features/accounts/api/accounts.api'
import { logout } from '@/features/auth/api/auth.api'
import { getMyPageProfile, withdrawUser } from '@/features/my-page/api/myPage.api'

const router = useRouter()
const connectedAccountCount = ref(0)
const loggingOut = ref(false)
const withdrawing = ref(false)
const profile = ref(null)

const profileImages = {
  ARMY: profileArmy,
  NAVY: profileNavy,
  AIRFORCE: profileAirforce,
  MARINE: profileMarine,
}
const profileBackgrounds = {
  GREEN: '#E5FFF4',
  OLIVE: '#EAF0D8',
  YELLOW: '#FFF6CC',
  ORANGE: '#FFF0E5',
  GRAY: '#F1F1F1',
  BLACK: '#333333',
}
const soldierLabels = { ARMY: '육군', NAVY: '해군', AIRFORCE: '공군', MARINE: '해병대' }
const nickname = computed(() => profile.value?.nickname || '사용자')
const militaryLabel = computed(() => {
  const soldierType = soldierLabels[profile.value?.soldierType || profile.value?.profileImage]
  const rank = profile.value?.militaryRank
  return [soldierType, rank].filter(Boolean).join(' · ') || '군 정보 미등록'
})
const badgeSummary = computed(
  () => profile.value?.badgeSummary ?? { earnedCount: 0, recentBadges: [] },
)
const recentBadgeIcons = computed(() =>
  badgeSummary.value.recentBadges.map((code) => {
    if (code.startsWith('TIER_')) return '🏅'
    if (code.startsWith('SAFE_')) return '🛡️'
    return '🚀'
  }),
)

async function handleLogout() {
  if (loggingOut.value) return
  loggingOut.value = true
  try {
    await logout()
  } finally {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('userId')
    await router.replace({ name: 'social-login' })
    loggingOut.value = false
  }
}

async function handleWithdraw() {
  if (withdrawing.value || !window.confirm('정말 탈퇴하시겠어요? 이 작업은 되돌릴 수 없습니다.'))
    return
  withdrawing.value = true
  try {
    await withdrawUser()
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('userId')
    await router.replace({ name: 'social-login' })
  } finally {
    withdrawing.value = false
  }
}

onMounted(async () => {
  const userId = Number(localStorage.getItem('userId'))
  const [profileResult, accountsResult] = await Promise.allSettled([
    getMyPageProfile(),
    userId ? getAccounts(userId) : Promise.resolve([]),
  ])
  if (profileResult.status === 'fulfilled') profile.value = profileResult.value
  if (accountsResult.status === 'fulfilled') {
    connectedAccountCount.value = new Set(
      accountsResult.value.map((account) => account.bankName),
    ).size
  }
})
</script>

<template>
  <main class="mypage screen">
    <section class="profile-section">
      <div class="profile-avatar">
        <img
          :src="profileImages[profile?.profileImage] || defaultProfileImage"
          alt=""
        >
        <span
          :style="{ backgroundColor: profileBackgrounds[profile?.profileSource] || '#35e780' }"
          aria-hidden="true"
        >✓</span>
      </div>
      <h2>{{ nickname }}</h2>
      <p>{{ militaryLabel }}</p>
      <button
        type="button"
        class="nickname-button"
        @click="router.push({ name: 'nickname' })"
      >
        닉네임 변경
      </button>
    </section>

    <section class="settings-card badge-card">
      <h3>획득 배지</h3>
      <button
        type="button"
        class="badge-summary"
        @click="router.push({ name: 'badge-history' })"
      >
        <span class="badge-icons"><i
          v-for="(icon, index) in recentBadgeIcons"
          :key="index"
        >{{ icon }}</i></span>
        <span class="badge-copy"><b>{{ badgeSummary.earnedCount }}개 획득</b><small>배지 내역 보기</small></span>
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
        @click="router.push({ name: 'connect-accounts' })"
      >
        <span class="menu-icon bank"><img
          :src="bankIcon"
          alt=""
        ></span><b>연결 계좌</b><small>{{ connectedAccountCount }}개 연결됨</small><span class="chevron">›</span>
      </button>
      <button
        type="button"
        class="menu-row"
        @click="router.push({ name: 'preference-goal' })"
      >
        <span class="menu-icon goal"><img
          :src="goalIcon"
          alt=""
        ></span><b>목표 금액 변경</b><span class="chevron">›</span>
      </button>
    </section>

    <section class="settings-card app-settings">
      <h3>앱 설정</h3>
      <button
        type="button"
        class="menu-row"
      >
        <span class="menu-icon notification"><img
          :src="notificationIcon"
          alt=""
        ></span><b>알림 설정</b><span class="chevron">›</span>
      </button>
      <button
        type="button"
        class="menu-row logout"
        :disabled="loggingOut"
        @click="handleLogout"
      >
        <span class="menu-icon logout-icon"><img
          :src="logoutIcon"
          alt=""
        ></span><b>{{ loggingOut ? '로그아웃 중' : '로그아웃' }}</b>
      </button>
      <button
        type="button"
        class="withdraw"
        :disabled="withdrawing"
        @click="handleWithdraw"
      >
        {{ withdrawing ? '탈퇴 처리 중' : '회원 탈퇴' }}
      </button>
    </section>
  </main>
</template>

<style scoped>
.mypage {
  padding: 30px 20px 14px;
  background: #fafafa;
}
.profile-section {
  display: flex;
  align-items: center;
  flex-direction: column;
  padding: 27px 0 34px;
}
.profile-avatar {
  position: relative;
  display: grid;
  width: 82px;
  height: 82px;
  place-items: center;
  border: 1.5px dashed #31e47c;
  border-radius: 50%;
}
.profile-avatar > img {
  width: 68px;
  height: 68px;
  object-fit: contain;
}
.profile-avatar span {
  position: absolute;
  right: -2px;
  bottom: 0;
  display: grid;
  width: 28px;
  height: 28px;
  place-items: center;
  border-radius: 50%;
  color: #fff;
}
.profile-section h2 {
  margin: 19px 0 5px;
  font-size: 21px;
  text-decoration: underline;
  text-decoration-color: #777;
  text-decoration-thickness: 2px;
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
  color: #999;
  font-size: 12px;
}
.settings-card {
  padding: 20px;
  margin-bottom: 18px;
  border-radius: 28px;
  background: #fff;
}
.settings-card h3 {
  margin: 0 0 9px;
  color: #999;
  font-size: 16px;
  font-weight: 500;
}
.badge-summary {
  display: flex;
  width: 100%;
  align-items: center;
  padding: 0;
  border: 0;
  background: transparent;
  text-align: left;
}
.badge-icons {
  display: flex;
  gap: 8px;
  min-width: 47px;
}
.badge-icons i {
  display: grid;
  width: 47px;
  height: 47px;
  place-items: center;
  border: 1px solid #7bf3ac;
  border-radius: 14px;
  background: #fff;
  box-shadow: 0 4px 10px rgb(52 231 128 / 10%);
  font-size: 22px;
  font-style: normal;
}
.badge-copy {
  display: grid;
  gap: 4px;
  margin-left: 12px;
}
.badge-copy b {
  font-size: 14px;
}
.badge-copy small {
  color: #aaa;
  font-size: 12px;
}
.badge-summary > img {
  width: 18px;
  margin-left: auto;
}
.menu-row {
  display: flex;
  width: 100%;
  min-height: 60px;
  align-items: center;
  gap: 14px;
  padding: 8px 0;
  border: 0;
  border-bottom: 1px solid #eee;
  background: transparent;
  color: #333;
  text-align: left;
}
.menu-row:last-child {
  border-bottom: 0;
}
.menu-row b {
  font-size: 15px;
}
.menu-row small {
  margin-left: auto;
  color: #999;
  font-size: 13px;
}
.menu-icon {
  display: grid;
  width: 36px;
  height: 36px;
  flex: 0 0 36px;
  place-items: center;
  border-radius: 10px;
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
.menu-icon.notification {
  background: #f5f5f5;
}
.menu-icon.logout-icon {
  background: #fff0f0;
}
.chevron {
  margin-left: 8px;
  color: #aaa;
  font-size: 25px;
}
.menu-row.logout {
  color: #ff4c4c;
}
.withdraw {
  width: 100%;
  padding: 18px 20px 0;
  border: 0;
  background: transparent;
  color: #c9c9c9;
  text-align: left;
}
@media (max-height: 760px) {
  .profile-section {
    padding-block: 18px 24px;
  }
  .settings-card {
    margin-bottom: 12px;
  }
  .mypage {
    padding-top: 20px;
  }
}
</style>
