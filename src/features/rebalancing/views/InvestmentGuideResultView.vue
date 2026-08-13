<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { getRebalancingRecommendation } from '@/features/rebalancing/api/rebalancing.api'

const route = useRoute()
const router = useRouter()
const guidance = ref(null)
const loadError = ref('')

const actionCopy = computed(() => {
  const action = guidance.value?.actionType
  if (action === 'REDUCE') return '이번 회차는 투자금을 조금 줄여보세요'
  if (action === 'PAUSE') return '이번 회차는 잠시 쉬어가도 좋아요'
  if (action === 'SAFE_FOCUS') return '안전자산 중심으로 투자해보세요'
  if (action === 'REVIEW') return '현재 계획을 한 번 점검해보세요'
  return '지금 계획대로 꾸준히 투자해보세요'
})

const actionLabel = computed(() => {
  const labels = {
    CONTINUE: '계속 투자',
    PAUSE: '잠시 멈춤',
    REDUCE: '금액 줄이기',
    REVIEW: '계획 점검',
    SAFE_FOCUS: '안전자산 집중',
    START: '투자 시작',
  }
  return labels[guidance.value?.actionType] || '투자 시작'
})

function formatWon(value) {
  return `${Number(value || 0).toLocaleString('ko-KR')}원`
}

function openDetail() {
  const guidanceId = guidance.value?.guidanceId || guidance.value?.id || route.query.guidanceId
  router.push({
    name: 'investment-guide-detail',
    params: { guidanceId: guidanceId || 'latest' },
  })
}

async function loadGuidance() {
  try {
    guidance.value = await getRebalancingRecommendation()
  } catch {
    try {
      guidance.value = JSON.parse(sessionStorage.getItem('latestInvestmentGuidance') || 'null')
    } catch {
      guidance.value = null
    }
    if (!guidance.value) loadError.value = '가이드를 불러오지 못했어요.'
  }
}

onMounted(loadGuidance)
</script>

<template>
  <section class="guide-result screen app-page">
    <header class="result-heading">
      <span>맞춤 가이드가 완성됐어요</span>
      <h2>{{ actionCopy }}</h2>
      <p>현재 자산과 적립 계획을 기준으로 분석했어요</p>
    </header>

    <article
      v-if="guidance"
      class="recommendation-card"
    >
      <div class="recommendation-card__top">
        <span class="action-badge">{{ actionLabel }}</span>
        <small>이번 투자 가이드</small>
      </div>
      <strong>{{ formatWon(guidance.recommendedContributionAmount) }}</strong>
      <p>{{ guidance.reason || '현재 계획을 유지하며 꾸준히 투자하는 것을 추천해요.' }}</p>
      <dl>
        <div>
          <dt>현재 회차별 투자금</dt>
          <dd>{{ formatWon(guidance.currentContributionAmount) }}</dd>
        </div>
        <div>
          <dt>예상 전역 자산</dt>
          <dd>{{ formatWon(guidance.recommendedExpectedAsset) }}</dd>
        </div>
        <div>
          <dt>다음 점검일</dt>
          <dd>
            {{
              String(guidance.nextReviewAt || '-')
                .slice(0, 10)
                .replaceAll('-', '.')
            }}
          </dd>
        </div>
      </dl>
    </article>

    <p
      v-else
      class="result-error"
    >
      {{ loadError || '가이드를 불러오고 있어요.' }}
    </p>

    <button
      class="detail-button"
      type="button"
      :disabled="!guidance"
      @click="openDetail"
    >
      가이드 상세보기 <span aria-hidden="true">›</span>
    </button>
    <button
      class="home-button"
      type="button"
      @click="router.push({ name: 'investment-guide' })"
    >
      가이드 홈으로
    </button>
  </section>
</template>

<style scoped>
.guide-result {
  padding: 28px 20px calc(var(--page-bottom-navigation-space) + 32px);
  background: var(--ui-background);
}
.result-heading span {
  color: #16c966;
  font-size: 13px;
  font-weight: 700;
}
.result-heading h2 {
  margin: 8px 0 6px;
  color: #333;
  font-size: 24px;
  line-height: 1.35;
  letter-spacing: -0.7px;
}
.result-heading p {
  margin: 0 0 28px;
  color: #757575;
  font-size: 14px;
}
.recommendation-card {
  padding: 24px 20px;
  border-radius: 30px;
  background: linear-gradient(145deg, #fff 50%, #effff5);
  box-shadow: 0 10px 30px rgb(51 51 51 / 6%);
}
.recommendation-card__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.recommendation-card__top small {
  color: #9e9e9e;
  font-size: 12px;
}
.action-badge {
  padding: 6px 10px;
  border-radius: 16px;
  background: #dffff0;
  color: #0ebf59;
  font-size: 12px;
  font-weight: 700;
}
.recommendation-card > strong {
  display: block;
  margin: 24px 0 10px;
  color: #16c966;
  font-size: 30px;
  letter-spacing: -1px;
}
.recommendation-card > p {
  margin: 0 0 22px;
  color: #575757;
  font-size: 14px;
  line-height: 1.65;
}
.recommendation-card dl {
  margin: 0;
  padding: 6px 16px;
  border-radius: 20px;
  background: #fff;
}
.recommendation-card dl div {
  display: flex;
  min-height: 44px;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #ececec;
}
.recommendation-card dl div:last-child {
  border-bottom: 0;
}
.recommendation-card dt {
  color: #757575;
  font-size: 12px;
  font-weight: 600;
}
.recommendation-card dd {
  margin: 0;
  color: #333;
  font-size: 13px;
  font-weight: 700;
}
.detail-button,
.home-button {
  width: 100%;
  height: 50px;
  margin-top: 18px;
  border: 0;
  border-radius: 28px;
  font-size: 14px;
  font-weight: 700;
}
.detail-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  background: #62ff9c;
  color: #333;
}
.detail-button span {
  font-size: 22px;
  line-height: 1;
}
.detail-button:disabled {
  background: #ececec;
  color: #bdbdbd;
}
.home-button {
  margin-top: 4px;
  background: transparent;
  color: #9e9e9e;
}
.result-error {
  margin: 80px 0;
  color: #757575;
  text-align: center;
}
</style>
