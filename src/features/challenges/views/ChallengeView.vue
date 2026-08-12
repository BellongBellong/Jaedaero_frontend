<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

import aggressiveGold from '@/assets/badges/aggressive/gold.svg'
import aggressivePlatinum from '@/assets/badges/aggressive/platinum.svg'
import emptyBadgeState from '@/assets/badges/empty-badge-state.svg'
import safeGold from '@/assets/badges/safe/gold.svg'
import crown from '@/assets/icons/crown.svg'
import armyCharacter from '@/assets/onboarding/characters/character-army.png'
import airForceCharacter from '@/assets/onboarding/characters/character-airforce.png'
import marineCharacter from '@/assets/onboarding/characters/character-marine.png'
import navyCharacter from '@/assets/onboarding/characters/character-navy.png'
import { getMyPageProfile } from '@/features/my-page/api/myPage.api'
import { findMissionRoute } from '@/features/missions/constants/missionActionRoutes'

import { getChallengeGroup, getInvestmentBadges, getTodayMissions } from '../api/challenges.api'

const activeTab = ref('missions')
const router = useRouter()
const loading = ref(true)
const challenge = ref(null)
const badges = ref([])
const profile = ref(null)
const apiMissions = ref([])
const rankingPeriod = ref('CUMULATIVE')
const errorMessage = ref('')

const characterImages = {
  ARMY: armyCharacter,
  AIRFORCE: airForceCharacter,
  AIR_FORCE: airForceCharacter,
  NAVY: navyCharacter,
  MARINE: marineCharacter,
  MARINE_CORPS: marineCharacter,
}

const missions = [
  {
    id: 1,
    group: '오늘의 미션',
    title: '예금상품 살펴보기',
    type: '안정형',
    description: '나에게 맞는 예금 상품을 확인해보세요',
  },
  {
    id: 2,
    group: '오늘의 미션',
    title: '리밸런싱 제안 확인하기',
    type: '공격형',
    description: '오늘의 AI 시장현황 리포트를 확인해보세요',
  },
  {
    id: 3,
    group: '데일리 미션',
    title: '오늘의 AI 시장리포트',
    type: '공통',
    description: '오늘의 AI 시장리포트를 확인해보세요',
  },
  {
    id: 4,
    group: '데일리 미션',
    title: '오늘의 AI 시장리포트',
    type: '공통',
    description: '오늘의 AI 시장현황 리포트를 확인해보세요',
  },
  {
    id: 5,
    group: '이벤트 미션',
    title: '첫 what-if 시뮬레이션 하기',
    type: '안정형',
    description: 'what-if 시뮬레이션으로 자산 분배 목표를 설정해보세요',
  },
  {
    id: 6,
    group: '이벤트 미션',
    title: '적립식 투자 목표설정',
    type: '공격형',
    description: '구체적인 투자 목표를 설정해보세요',
  },
]

const groupedMissions = computed(() => {
  if (apiMissions.value.length) {
    const groups = [
      { name: '오늘의 미션', categories: ['RECOMMENDED', 'TODAY'] },
      { name: '데일리 미션', categories: ['DAILY'] },
      { name: '한 번 미션', categories: ['ONE_TIME'] },
      { name: '이벤트 미션', categories: ['EVENT', 'CONDITIONAL'] },
    ]

    return groups
      .map((group) => ({
        name: group.name,
        items: apiMissions.value
          .filter((mission) => group.categories.includes(mission.missionCategory))
          .map((mission) => ({
            ...mission,
            id: mission.missionId,
            group: group.name,
            type:
              mission.missionType === 'AGGRESSIVE'
                ? '공격형'
                : ['SAFE', 'BALANCED'].includes(mission.missionType)
                  ? '안정형'
                  : '공통',
          })),
      }))
      .filter((group) => group.items.length)
  }

  return ['오늘의 미션', '데일리 미션', '이벤트 미션'].map((name) => ({
    name,
    items: missions.filter((mission) => mission.group === name),
  }))
})

const aggressiveCount = computed(() =>
  Number(profile.value?.investmentBadgeStatus?.aggressiveMissionCount ?? 0),
)
const safeCount = computed(() =>
  Number(profile.value?.investmentBadgeStatus?.safeMissionCount ?? 0),
)
const hasBadge = computed(() => badges.value.length > 0)
const myCharacter = computed(() => {
  const branch = profile.value?.militaryBranch || profile.value?.branch || 'ARMY'
  return characterImages[branch] || armyCharacter
})

const ranking = computed(() => {
  const supplied = challenge.value?.topRankers || []
  if (supplied.length) {
    return supplied.slice(0, 3).map((member) => ({
      ...member,
      rank: member.rankingNo,
      missionCount: member.missionCompletionCount,
      character: characterImages[member.profileImage] || characterImages[member.soldierType],
    }))
  }

  return [
    { rank: 1, nickname: '째대로', missionCount: 60, character: armyCharacter },
    { rank: 2, nickname: '박병장', missionCount: 57, character: navyCharacter },
    { rank: 3, nickname: '성훈병', missionCount: 55, character: airForceCharacter },
  ]
})

function unwrap(value) {
  return value?.data ?? value ?? null
}

async function loadChallenge() {
  loading.value = true
  errorMessage.value = ''
  const [challengeResult, missionResult, badgeResult, profileResult] = await Promise.allSettled([
    getChallengeGroup({ period: rankingPeriod.value }),
    getTodayMissions(),
    getInvestmentBadges(),
    getMyPageProfile(),
  ])

  if (challengeResult.status === 'fulfilled') challenge.value = unwrap(challengeResult.value)
  if (missionResult.status === 'fulfilled') {
    const value = unwrap(missionResult.value)
    apiMissions.value = Array.isArray(value) ? value : value?.missions || []
  }
  if (badgeResult.status === 'fulfilled') {
    const value = unwrap(badgeResult.value)
    badges.value = Array.isArray(value) ? value : value?.badges || []
  }
  if (profileResult.status === 'fulfilled') profile.value = profileResult.value
  if (challengeResult.status === 'rejected' && missionResult.status === 'rejected') {
    errorMessage.value = '챌린지 정보를 불러오지 못했어요.'
  }
  loading.value = false
}

async function changeRankingPeriod() {
  try {
    challenge.value = unwrap(await getChallengeGroup({ period: rankingPeriod.value }))
  } catch {
    errorMessage.value = '랭킹 정보를 불러오지 못했어요.'
  }
}

async function openMission(mission) {
  if (mission.completed) return

  const routeName = findMissionRoute(mission.actionType)
  if (!routeName) {
    errorMessage.value = '이 미션의 연결 화면은 준비 중이에요.'
    return
  }

  await router.push({
    name: routeName,
    query: { missionId: mission.missionId },
  })
}

onMounted(loadChallenge)
</script>

<template>
  <section class="challenge-page">
    <div
      class="challenge-tabs"
      role="tablist"
      aria-label="챌린지 메뉴"
    >
      <button
        :class="{ active: activeTab === 'missions' }"
        type="button"
        @click="activeTab = 'missions'"
      >
        미션
      </button>
      <button
        :class="{ active: activeTab === 'ranking' }"
        type="button"
        @click="activeTab = 'ranking'"
      >
        랭킹
      </button>
    </div>

    <p
      v-if="errorMessage"
      class="challenge-error"
      role="status"
    >
      {{ errorMessage }}
    </p>

    <div
      v-if="loading"
      class="challenge-skeleton"
      aria-label="챌린지 정보를 불러오는 중"
    >
      <i class="skeleton-title" />
      <i class="skeleton-hero" />
      <i
        v-for="index in 4"
        :key="index"
        class="skeleton-card"
      />
    </div>

    <template v-else-if="activeTab === 'missions'">
      <section class="achievement-section">
        <h2>나의 <strong>미션 달성 현황</strong></h2>

        <div
          v-if="!hasBadge"
          class="empty-badge"
        >
          <img
            :src="emptyBadgeState"
            alt="아직 획득한 뱃지가 없어요"
          >
        </div>

        <template v-else>
          <div class="badge-summary">
            <article>
              <img
                :src="aggressivePlatinum"
                alt="공격형 Platinum 뱃지"
              >
              <span>공격형</span><b>Platinum</b><small>미션 달성 {{ aggressiveCount }}개</small>
            </article>
            <article>
              <img
                :src="safeGold"
                alt="안정형 Gold 뱃지"
              >
              <span>안정형</span><b>Gold</b><small>미션 달성 {{ safeCount }}개</small>
            </article>
            <aside>
              달성한 총 미션<br><strong>{{ aggressiveCount + safeCount }}개</strong>
            </aside>
          </div>

          <div class="progress-row">
            <img
              :src="aggressiveGold"
              alt=""
            ><span>공격형</span>
            <div>
              <b>Platinum</b><progress
                :value="aggressiveCount"
                max="300"
              /><small>현재 {{ aggressiveCount }}개 <em>300개</em></small>
            </div>
          </div>
          <div class="progress-row">
            <img
              :src="safeGold"
              alt=""
            ><span>안정형</span>
            <div>
              <b class="gold">Gold</b><progress
                class="gold-progress"
                :value="safeCount"
                max="100"
              /><small>현재 {{ safeCount }}개 <em>100개</em></small>
            </div>
          </div>
        </template>
      </section>

      <section
        v-for="group in groupedMissions"
        :key="group.name"
        class="mission-group"
        :class="{ event: group.name === '이벤트 미션' }"
      >
        <header>
          <h3>{{ group.name }}</h3>
          <span v-if="group.name !== '이벤트 미션'">초기화까지 00:55:39</span>
        </header>
        <article
          v-for="mission in group.items"
          :key="mission.id"
          class="mission-card"
          :class="{ 'mission-card--completed': mission.completed }"
          role="button"
          tabindex="0"
          @click="openMission(mission)"
          @keydown.enter="openMission(mission)"
        >
          <span
            class="mission-check"
            :class="{ completed: mission.completed }"
          />
          <div>
            <strong>{{ mission.title }}</strong><span :class="`type-${mission.type}`">{{ mission.type }}</span><small>{{ mission.description }}</small>
          </div>
          <b class="chevron">›</b>
        </article>
      </section>
    </template>

    <template v-else>
      <section class="ranking-section">
        <select
          v-model="rankingPeriod"
          aria-label="랭킹 범위"
          @change="changeRankingPeriod"
        >
          <option value="CUMULATIVE">
            전체 랭킹
          </option>
          <option value="MONTHLY">
            월별 랭킹
          </option>
        </select>
        <h2>{{ challenge?.cohortName || '입대 동기 랭킹' }}</h2>
        <strong>
          {{ challenge?.soldierType || profile?.militaryBranch || 'ARMY' }} ·
          {{ challenge?.enlistmentYear }}년 {{ challenge?.enlistmentMonth }}월 입대
        </strong>
        <small>
          집계 기준 : {{ challenge?.periodStartDate || '입대일' }} ~
          {{ challenge?.periodEndDate || '오늘' }}
        </small>

        <div class="podium">
          <article
            v-for="member in ranking"
            :key="member.rank"
            :class="`rank-${member.rank}`"
          >
            <div class="member-label">
              {{ member.nickname }}<small>미션 {{ member.missionCount }}개 달성</small>
            </div>
            <img
              v-if="member.rank === 1"
              class="crown"
              :src="crown"
              alt="1위 왕관"
            >
            <img
              class="character"
              :src="
                member.nickname === profile?.nickname
                  ? myCharacter
                  : member.character || armyCharacter
              "
              alt=""
            >
            <div class="podium-block">
              {{ member.rank }}
            </div>
          </article>
        </div>
      </section>

      <section class="my-rank-card">
        <h3>나의 순위</h3>
        <div>
          <strong>{{ challenge?.myRankingNo || '-' }}위</strong>
          <span>
            전체 {{ challenge?.memberCount || 0 }}명 중 상위 {{ challenge?.myPercentile || 0 }}%
          </span>
        </div>
        <div class="rank-stats">
          <span>나<b>{{ challenge?.myMissionCompletionCount || 0 }}개</b></span>
          <span>평균<b>{{ challenge?.groupAverageMissionCompletionCount || 0 }}개</b></span>
          <span>상위 10%<b>{{ challenge?.topTenPercentThreshold || 0 }}개</b></span>
        </div>
        <div class="chart">
          <i style="height: 45%" /><i
            class="me"
            style="height: 82%"
          /><i style="height: 76%" />
        </div>
        <div class="chart-labels">
          <span>하위 25%</span><span>나</span><span>상위 10%</span>
        </div>
      </section>
    </template>
  </section>
</template>

<style scoped>
.challenge-page {
  min-height: 100%;
  padding: 0 20px 112px;
  color: #333;
  background: #fafafa;
}
.challenge-tabs {
  display: grid;
  grid-template-columns: 1fr 1fr;
  height: 43px;
  margin-bottom: 12px;
}
.challenge-tabs button {
  border: 0;
  border-bottom: 2px solid transparent;
  color: #b7b7b7;
  background: transparent;
  font-weight: 700;
}
.challenge-tabs button.active {
  border-color: #18bd63;
  color: #18bd63;
  background: linear-gradient(110deg, #fff, #f4fff8);
  border-radius: 14px 14px 0 0;
}
.challenge-error {
  padding: 9px 12px;
  margin: 8px 0;
  border-radius: 12px;
  color: #d85d4e;
  background: #fff0ed;
  font-size: 12px;
  text-align: center;
}
.achievement-section {
  padding: 0 0 14px;
  background:
    radial-gradient(circle at 45% 35%, #ceffd8 0, transparent 36%),
    radial-gradient(circle at 75% 55%, #efffae 0, transparent 42%);
}
.achievement-section h2 {
  margin: 12px 0 20px;
  font-size: 15px;
}
.achievement-section h2 strong {
  color: #17b95f;
}
.badge-summary {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 18px;
  min-height: 145px;
}
.badge-summary article {
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 12px;
}
.badge-summary article img {
  width: 58px;
  height: 58px;
  object-fit: contain;
}
.badge-summary article b {
  margin-top: 5px;
  color: #999;
  font-size: 15px;
}
.badge-summary article small {
  margin-top: 8px;
  color: #888;
  font-weight: 700;
}
.badge-summary aside {
  padding: 15px 10px;
  border: 1px solid #fff;
  border-radius: 11px;
  background: #ffffff80;
  color: #777;
  font-size: 11px;
  line-height: 1.7;
}
.badge-summary aside strong {
  color: #999;
}
.empty-badge {
  display: grid;
  place-items: center;
  min-height: 230px;
}
.empty-badge img {
  width: min(100%, 290px);
  max-height: 220px;
}
.progress-row {
  display: grid;
  grid-template-columns: 38px 52px 1fr;
  align-items: center;
  gap: 6px;
  margin: 12px 0;
}
.progress-row > img {
  width: 32px;
  height: 32px;
  object-fit: contain;
}
.progress-row > span {
  font-size: 11px;
  font-weight: 700;
}
.progress-row > div {
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.progress-row b {
  align-self: flex-start;
  padding: 4px 10px;
  border-radius: 12px;
  color: #65a4da;
  background: #eef8ff;
  font-size: 11px;
}
.progress-row b.gold {
  color: #d8aa18;
  background: #fff7d3;
}
.progress-row progress {
  width: 100%;
  height: 9px;
  accent-color: #76a9d5;
}
.progress-row progress.gold-progress {
  accent-color: #d2b120;
}
.progress-row small {
  color: #888;
}
.progress-row em {
  float: right;
  font-style: normal;
}
.mission-group {
  padding: 20px 18px;
  margin: 10px 0;
  border-radius: 28px;
  background: #fff;
  box-shadow: 0 10px 24px #dff9e855;
}
.mission-group.event {
  background: linear-gradient(145deg, #f4ffea, #fff4b6);
}
.mission-group header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}
.mission-group h3 {
  margin: 0;
  color: #747474;
  font-size: 14px;
}
.mission-group header span {
  color: #c4c4c4;
  font-size: 12px;
}
.mission-card {
  display: grid;
  grid-template-columns: 26px 1fr 12px;
  align-items: center;
  gap: 10px;
  min-height: 62px;
  padding: 10px 12px;
  margin: 10px 0;
  border-radius: 20px;
  background: #fff;
  cursor: pointer;
}
.mission-card--completed {
  cursor: default;
}
.mission-check {
  width: 24px;
  height: 24px;
  border: 2px solid #b5c8b2;
  border-radius: 50%;
  background: #fff;
}
.mission-check.completed {
  border-color: #22c66b;
  background: #22c66b;
  box-shadow: inset 0 0 0 5px #fff;
}
.mission-card div {
  min-width: 0;
}
.mission-card strong {
  color: #777;
  font-size: 13px;
}
.mission-card div > span {
  padding: 4px 9px;
  margin-left: 8px;
  border-radius: 12px;
  font-size: 10px;
}
.type-안정형 {
  color: #20b964;
  background: #e5fff0;
}
.type-공격형 {
  color: #f07a65;
  background: #fff0ed;
}
.type-공통 {
  color: #777;
  background: #eee;
}
.mission-card small {
  display: block;
  margin-top: 5px;
  overflow: hidden;
  color: #999;
  font-size: 11px;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.chevron {
  color: #bbb;
  font-size: 24px;
}
.ranking-section {
  text-align: center;
}
.ranking-section select {
  display: block;
  padding: 7px 30px 7px 15px;
  margin: 4px 0 15px auto;
  border: 0;
  border-radius: 18px;
  color: #777;
  background: #eafaf1;
}
.ranking-section h2 {
  margin: 0 0 5px;
  font-size: 23px;
}
.ranking-section > strong {
  display: block;
  color: #777;
  font-size: 15px;
}
.ranking-section > small {
  color: #999;
}
.podium {
  display: flex;
  align-items: flex-end;
  justify-content: center;
  height: 245px;
  margin-top: 15px;
}
.podium article {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  width: 31%;
}
.podium .rank-1 {
  order: 2;
}
.podium .rank-2 {
  order: 1;
}
.podium .rank-3 {
  order: 3;
}
.member-label {
  min-height: 42px;
  padding: 5px;
  font-size: 11px;
}
.member-label small {
  display: block;
  margin-top: 5px;
  color: #aaa;
}
.character {
  z-index: 1;
  width: 86px;
  height: 80px;
  margin: 0 auto -8px;
  object-fit: contain;
}
.crown {
  position: absolute;
  z-index: 2;
  top: 30px;
  left: 50%;
  width: 34px;
  transform: translateX(-50%);
}
.podium-block {
  display: grid;
  place-items: center;
  height: 70px;
  color: #aaa;
  background: #e5eee4;
  font-size: 32px;
  font-weight: 800;
}
.rank-1 .podium-block {
  height: 98px;
  background: #dbeed9;
}
.my-rank-card {
  padding: 20px;
  margin-top: -2px;
  border-radius: 28px;
  background: #fff;
  box-shadow: 0 10px 25px #0000000a;
}
.my-rank-card h3 {
  margin: 0 0 8px;
  font-size: 14px;
}
.my-rank-card > div:nth-child(2) {
  display: flex;
  align-items: baseline;
  gap: 10px;
}
.my-rank-card > div > strong {
  font-size: 26px;
}
.my-rank-card > div > span {
  color: #999;
  font-size: 12px;
}
.rank-stats {
  display: grid !important;
  grid-template-columns: repeat(3, 1fr);
  gap: 7px;
  margin: 14px 0;
}
.rank-stats span {
  padding: 8px;
  border-radius: 10px;
  text-align: center;
  background: #fff7dc;
}
.rank-stats b {
  display: block;
  margin-top: 3px;
  color: #444;
}
.chart {
  display: flex !important;
  align-items: flex-end !important;
  justify-content: space-around;
  height: 130px;
  border-bottom: 1px solid #ddd;
  background: repeating-linear-gradient(#fff 0 32px, #e8e8e8 33px);
}
.chart i {
  width: 40px;
  border-radius: 10px 10px 0 0;
  background: #bbb;
}
.chart i.me {
  background: #55ee94;
}
.chart-labels {
  display: flex;
  justify-content: space-around;
  margin-top: 6px;
  color: #78849c;
  font-size: 10px;
}
.challenge-skeleton {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding-top: 20px;
}
.challenge-skeleton i {
  display: block;
  border-radius: 20px;
  background: #ececec;
  animation: pulse 1.2s ease-in-out infinite;
}
.skeleton-title {
  width: 45%;
  height: 22px;
}
.skeleton-hero {
  height: 210px;
}
.skeleton-card {
  height: 96px;
}
@keyframes pulse {
  50% {
    opacity: 0.45;
  }
}
</style>
