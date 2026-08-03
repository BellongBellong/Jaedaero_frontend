<script setup>
import { computed, onMounted, ref } from 'vue'

import { getInvestmentBadges } from '@/features/challenges/api/challenges.api'

const badges = ref([])
const loading = ref(true)
const loadFailed = ref(false)
const totalBadgeCount = 3

const badgeDetails = {
  TIER_SAFE: { icon: '🛡️', title: '안정형 투자자', description: '투자 성향 배지' },
  TIER_BALANCED: { icon: '⚖️', title: '균형형 투자자', description: '투자 성향 배지' },
  TIER_AGGRESSIVE: { icon: '🚀', title: '공격형 투자자', description: '투자 성향 배지' },
}

const earnedBadges = computed(() =>
  badges.value.map((badge) => {
    const [category, grade] = badge.badgeCode.split('_')
    const detail =
      category === 'TIER'
        ? badgeDetails[badge.badgeCode]
        : {
            icon: category === 'SAFE' ? '🛡️' : '🚀',
            title: `${category === 'SAFE' ? '안정형' : '공격형'} ${grade} 등급`,
            description: '미션 완료 배지',
          }
    return { ...badge, ...detail }
  }),
)

function formatDate(value) {
  if (!value) return '획득일 정보 없음'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '획득일 정보 없음' : date.toLocaleDateString('ko-KR')
}

onMounted(async () => {
  try {
    badges.value = await getInvestmentBadges({ page: 0, size: 20 })
  } catch {
    loadFailed.value = true
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <main class="badge-history screen">
    <section class="badge-progress">
      <div>
        <span>뱃지 수집</span><b>{{ earnedBadges.length }} / {{ totalBadgeCount }}</b>
      </div>
      <progress
        :value="earnedBadges.length"
        :max="totalBadgeCount"
      >
        {{ earnedBadges.length }} / {{ totalBadgeCount }}
      </progress>
    </section>

    <section class="badge-section">
      <h2>획득한 뱃지</h2>
      <p
        v-if="loading || loadFailed"
        class="status-message"
      >
        {{ loading ? '뱃지 내역을 불러오는 중이에요.' : '뱃지 내역을 불러오지 못했어요.' }}
      </p>
      <p
        v-else-if="earnedBadges.length === 0"
        class="status-message"
      >
        아직 획득한 뱃지가 없어요.
      </p>
      <div
        v-else
        class="earned-grid"
      >
        <article
          v-for="badge in earnedBadges"
          :key="badge.badgeCode"
        >
          <span>{{ badge.icon }}</span><b>{{ badge.title }}</b><small>{{ formatDate(badge.acquiredAt) }}</small>
        </article>
      </div>
    </section>
  </main>
</template>

<style scoped>
.badge-history {
  padding: 30px 20px 24px;
  background: #fafafa;
}
.badge-progress {
  padding: 17px 16px;
  border-radius: 24px;
  background: linear-gradient(105deg, #e1ffeb, #fff9df);
}
.badge-progress div {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  font-size: 14px;
}
.badge-progress b {
  color: #08772f;
  font-size: 17px;
}
progress {
  display: block;
  width: 100%;
  height: 9px;
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
  margin-top: 16px;
}
.badge-section h2 {
  margin: 0 0 14px;
  color: #555;
  font-size: 14px;
  font-weight: 500;
}
.status-message {
  padding: 24px 0;
  margin: 0;
  color: #999;
  font-size: 14px;
  text-align: center;
}
.earned-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}
.earned-grid article {
  display: flex;
  min-height: 109px;
  align-items: center;
  flex-direction: column;
  justify-content: center;
  border: 1px solid #70efa5;
  border-radius: 17px;
  background: #fff;
  box-shadow: 0 6px 15px rgb(43 224 120 / 8%);
}
article span {
  font-size: 25px;
}
article b {
  margin-top: 8px;
  color: #555;
  font-size: 12px;
  text-align: center;
}
article small {
  margin-top: 7px;
  color: #bbb;
  font-size: 9px;
  text-align: center;
}
@media (max-height: 760px) {
  .badge-history {
    padding-top: 20px;
  }
  .earned-grid article {
    min-height: 96px;
  }
}
</style>
