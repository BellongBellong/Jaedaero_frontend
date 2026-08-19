<script setup>
import { computed, onMounted, ref } from 'vue'

import emptyBadgeState from '@/assets/badges/empty-badge-state.svg'
import { useMyPageStore } from '@/features/my-page/stores/my-page.store'
import {
  BADGE_LEVELS,
  BADGE_SELECTION_STORAGE_KEY,
  getBadgeProgress,
  getBadgeTarget,
  getBadgeTier,
  getEarnedBadges,
  getBadgeImage,
  getSelectedBadge,
} from '@/features/my-page/composables/investmentBadges'

const badges = ref([])
const myPageStore = useMyPageStore()
const badgeStatus = ref(null)
const loading = ref(true)
const loadFailed = ref(false)
const selectedBadgeId = ref(localStorage.getItem(BADGE_SELECTION_STORAGE_KEY) || '')
const activeBadgeType = ref('')

const badgeProgresses = computed(() => getBadgeProgress(badges.value, badgeStatus.value))
const earnedBadges = computed(() => getEarnedBadges(badgeProgresses.value))
const activeEarnedBadges = computed(() =>
  activeBadgeType.value
    ? earnedBadges.value.filter((badge) => badge.type === activeBadgeType.value)
    : earnedBadges.value,
)
const selectedBadge = computed(() =>
  getSelectedBadge(activeEarnedBadges.value, selectedBadgeId.value),
)
const historyBadgeType = computed(
  () => selectedBadge.value?.type || activeBadgeType.value || 'AGGRESSIVE',
)
const historyBadgeTypeInfo = computed(() => ({
  label: historyBadgeType.value === 'SAFE' ? '안정형' : '공격형',
}))
const historyBadges = computed(() =>
  earnedBadges.value.filter((badge) => badge.type === historyBadgeType.value),
)
function findAcquiredAt(type, grade) {
  return badges.value.find(
    (badge) =>
      String(badge.missionType).toUpperCase() === type &&
      String(badge.grade).toUpperCase() === grade,
  )?.acquiredAt
}

const badgeHistoryList = computed(() =>
  BADGE_LEVELS.map((levelInfo) => {
    const earnedBadge = historyBadges.value.find((badge) => badge.levelInfo.key === levelInfo.key)

    return (
      (earnedBadge && {
        ...earnedBadge,
        acquiredAt:
          earnedBadge.acquiredAt || findAcquiredAt(earnedBadge.type, earnedBadge.levelInfo.key),
      }) || {
        id: `${historyBadgeType.value}-${levelInfo.key}`,
        type: historyBadgeType.value,
        typeInfo: historyBadgeTypeInfo.value,
        levelInfo,
        image: getBadgeImage(historyBadgeType.value, levelInfo.key),
        locked: true,
      }
    )
  }),
)
const safeBadge = computed(() =>
  getSelectedBadge(
    earnedBadges.value.filter((badge) => ['SAFE', 'BALANCED'].includes(badge.type)),
    selectedBadgeId.value,
  ),
)
const aggressiveBadge = computed(() =>
  getSelectedBadge(
    earnedBadges.value.filter((badge) => badge.type === 'AGGRESSIVE'),
    selectedBadgeId.value,
  ),
)
const nextLevel = computed(() => {
  if (!selectedBadge.value) return null
  return BADGE_LEVELS.find(({ level }) => level === selectedBadge.value.levelInfo.level + 1) || null
})
const remainingMissions = computed(() =>
  nextLevel.value
    ? Math.max(0, nextLevel.value.missionCount - selectedBadge.value.missionCount)
    : 0,
)
const selectedBadgeTier = computed(() => getBadgeTier(selectedBadge.value?.missionCount))
const selectedBadgeTarget = computed(() => getBadgeTarget(selectedBadge.value?.missionCount))

function formatDate(value) {
  if (!value) return '획득일 정보 없음'
  const date = Array.isArray(value)
    ? new Date(value[0], value[1] - 1, value[2], value[3] || 0, value[4] || 0, value[5] || 0)
    : new Date(value)
  return Number.isNaN(date.getTime()) ? '획득일 정보 없음' : date.toLocaleDateString('ko-KR')
}

function selectBadge(badge) {
  activeBadgeType.value = badge.type
  selectedBadgeId.value = badge.id
  localStorage.setItem(BADGE_SELECTION_STORAGE_KEY, badge.id)
}

onMounted(async () => {
  try {
    await myPageStore.load()
    badges.value = myPageStore.investmentBadges
    badgeStatus.value = myPageStore.profile?.investmentBadgeStatus || null
    activeBadgeType.value = getSelectedBadge(earnedBadges.value, selectedBadgeId.value)?.type || ''
  } catch {
    loadFailed.value = true
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <main class="badge-history screen">
    <section
      v-if="selectedBadge"
      :class="['badge-hero', `tier-${selectedBadgeTier.key.toLowerCase()}`]"
    >
      <div class="badge-showcase">
        <button
          v-if="safeBadge"
          type="button"
          class="badge-showcase__option"
          :class="{ 'is-active': selectedBadge.type === safeBadge.type }"
          :aria-label="`${safeBadge.typeInfo.label} ${safeBadge.levelInfo.koreanLabel} 뱃지 선택`"
          @click="selectBadge(safeBadge)"
        >
          <img
            :src="safeBadge.image"
            alt=""
          >
          <span>{{ safeBadge.typeInfo.label }}</span>
          <b>{{ safeBadge.levelInfo.label }}</b>
        </button>
        <button
          v-if="aggressiveBadge"
          type="button"
          class="badge-showcase__option"
          :class="{ 'is-active': selectedBadge.type === aggressiveBadge.type }"
          :aria-label="`${aggressiveBadge.typeInfo.label} ${aggressiveBadge.levelInfo.koreanLabel} 뱃지 선택`"
          @click="selectBadge(aggressiveBadge)"
        >
          <img
            :src="aggressiveBadge.image"
            alt=""
          >
          <span>{{ aggressiveBadge.typeInfo.label }}</span>
          <b>{{ aggressiveBadge.levelInfo.label }}</b>
        </button>
      </div>
      <p>미션 달성 {{ selectedBadge.missionCount }}회</p>

      <progress
        :value="Math.min(selectedBadge.missionCount, selectedBadgeTarget)"
        :max="selectedBadgeTarget"
      />
      <div class="mission-count">
        <span>현재 {{ selectedBadge.missionCount }}회</span>
        <span>{{ selectedBadgeTarget }}회</span>
      </div>
      <p
        v-if="nextLevel"
        class="next-level-copy"
      >
        다음 레벨까지 미션 {{ remainingMissions }}개 남음<br>
        다음 레벨 : {{ nextLevel.koreanLabel }}
      </p>
      <p
        v-else
        class="next-level-copy"
      >
        최고 등급을 달성했어요!
      </p>
    </section>

    <section class="badge-section">
      <p
        v-if="loading || loadFailed"
        class="status-message"
      >
        {{ loading ? '뱃지 내역을 불러오는 중이에요.' : '뱃지 내역을 불러오지 못했어요.' }}
      </p>
      <div v-else>
        <div
          v-if="!selectedBadge"
          class="empty-badge-state"
        >
          <img
            :src="emptyBadgeState"
            alt="뱃지가 아직 없어요"
          >
        </div>
        <h2>뱃지 획득 정보</h2>
        <div class="earned-grid">
          <article
            v-for="badge in badgeHistoryList"
            :key="badge.id"
            :class="{ locked: badge.locked }"
          >
            <img
              :src="badge.image"
              alt=""
            >
            <span>
              <b>{{ badge.levelInfo.koreanLabel }}</b>
              <small>미션 {{ badge.levelInfo.missionCount }}회 달성</small>
              <i v-if="!badge.locked">{{ formatDate(badge.acquiredAt) }}</i>
              <i v-else>아직 획득하지 않았어요</i>
            </span>
          </article>
        </div>
      </div>
    </section>
  </main>
</template>

<style scoped>
.badge-history {
  min-height: 100%;
  padding: 4px 28px calc(var(--page-bottom-navigation-space) + var(--safe-area-bottom));
  background: #fff;
}
.badge-hero {
  display: flex;
  align-items: center;
  flex-direction: column;
  padding: 0 4px;
  text-align: center;
}
.badge-showcase {
  display: flex;
  min-height: 118px;
  align-items: flex-start;
  justify-content: center;
  gap: 4px;
}
.badge-showcase__option {
  display: grid;
  width: 82px;
  justify-items: center;
  align-content: start;
  padding: 14px 0 0;
  border: 0;
  background: transparent;
  color: #999;
  cursor: pointer;
  font-size: 8px;
  line-height: 1.45;
  text-align: center;
}
.badge-showcase__option img {
  width: 31px;
  height: 31px;
  aspect-ratio: 1;
  object-fit: contain;
}
.badge-showcase__option.is-active {
  padding-top: 0;
}
.badge-showcase__option.is-active img {
  width: 82px;
  height: 82px;
}
.badge-showcase__option span {
  padding: 2px 6px;
  border-radius: 8px;
  background: #e7f5e7;
  color: #66856a;
  font-size: 9px;
  font-weight: 700;
}
.badge-showcase__option b {
  color: #999;
  font-size: 10px;
  font-weight: 500;
}
.badge-hero > span {
  padding: 4px 10px;
  border-radius: 12px;
  margin-top: 2px;
  background: #e7f5e7;
  color: #66856a;
  font-size: 11px;
  font-weight: 700;
}
.badge-type-switch {
  display: flex;
  gap: 4px;
  margin-top: 1px;
}
.badge-type-switch button {
  padding: 4px 9px;
  border: 0;
  border-radius: 12px;
  background: #f0f1ef;
  color: #aaa;
  cursor: pointer;
  font-size: 10px;
  font-weight: 700;
}
.badge-type-switch button.active {
  background: #e7f5e7;
  color: #66856a;
}
.badge-hero > strong {
  margin-top: 3px;
  color: #6c6c6c;
  font-size: 16px;
}
.badge-hero > p {
  margin: 3px 0 18px;
  color: #777;
  font-size: 13px;
}
progress {
  display: block;
  width: min(100%, 220px);
  height: 10px;
  margin: 0 auto;
  border: 0;
  border-radius: 9px;
  overflow: hidden;
  appearance: none;
}
progress::-webkit-progress-bar {
  border-radius: 9px;
  background: rgb(224 235 218 / 70%);
}
progress::-webkit-progress-value {
  border-radius: 9px;
  background: linear-gradient(90deg, #55ef94, #ffe066);
}
.badge-section {
  margin-top: 14px;
}
.badge-section h2 {
  margin: 0 0 15px;
  color: #555;
  font-size: 16px;
  font-weight: 700;
}
.badge-section h2 small {
  margin-left: 5px;
  color: #999;
  font-size: 11px;
  font-weight: 400;
}
.status-message {
  padding: 24px 0;
  margin: 0;
  color: #999;
  font-size: 14px;
  text-align: center;
}
.empty-badge-state {
  display: grid;
  justify-items: center;
  margin-bottom: 12px;
}
.empty-badge-state img {
  width: min(100%, 313px);
  height: 173px;
  object-fit: contain;
}
.earned-grid {
  display: grid;
  gap: 2px;
}
.earned-grid article {
  display: flex;
  min-height: 43px;
  align-items: center;
  gap: 10px;
  padding: 2px 0;
  border: 1px solid transparent;
  border-radius: 15px;
  background: transparent;
  text-align: left;
}
.earned-grid img {
  width: 38px;
  height: 38px;
  flex: 0 0 38px;
  object-fit: contain;
}
.earned-grid article > span {
  display: grid;
  gap: 4px;
}
.earned-grid b {
  color: #555;
  font-size: 12px;
}
.earned-grid small,
.earned-grid i {
  color: #bbb;
  font-size: 10px;
  font-style: normal;
}
.earned-grid article.locked {
  opacity: 1;
}
.mission-count {
  display: flex;
  width: min(100%, 220px);
  justify-content: space-between;
  margin: 5px auto 0;
  color: #8a8a8a;
  font-size: 9px;
}
.badge-hero .next-level-copy {
  margin: 15px 0 0;
  color: #777;
  font-size: 10px;
  line-height: 1.65;
}
.badge-hero.tier-bronze {
  --tier-color: #a86f45;
}
.badge-hero.tier-silver {
  --tier-color: #7d8b96;
}
.badge-hero.tier-gold {
  --tier-color: #d3a50d;
}
.badge-hero.tier-platinum {
  --tier-color: #65a4da;
}
.badge-hero.tier-diamond {
  --tier-color: #8b6bd1;
}
.badge-hero progress {
  accent-color: var(--tier-color);
}
.badge-hero progress::-webkit-progress-bar {
  background: #e7ebed;
}
.badge-hero progress::-webkit-progress-value {
  background: var(--tier-color);
}
.badge-hero progress::-moz-progress-bar {
  background: var(--tier-color);
}
@media (max-height: 760px) {
  .badge-history {
    padding-top: 2px;
  }
  .badge-showcase {
    min-height: 106px;
  }
  .badge-showcase__option.is-active img {
    width: 74px;
    height: 74px;
  }
}
</style>
