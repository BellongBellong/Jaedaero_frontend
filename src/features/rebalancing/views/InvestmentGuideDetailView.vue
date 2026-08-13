<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'

import {
  getInvestmentGuidanceDetail,
  getRebalancingRecommendation,
} from '@/features/rebalancing/api/rebalancing.api'

const route = useRoute()
const detail = ref(null)
const loadError = ref('')

const recommendation = computed(() => detail.value?.recommendation || detail.value || {})
const plan = computed(() => detail.value?.currentPlan || {})
const asset = computed(() => detail.value?.assetStatus || {})
const progress = computed(() => detail.value?.goalProgress || {})

function formatWon(value) {
  return `${Number(value || 0).toLocaleString('ko-KR')}원`
}

function frequencyLabel(value) {
  return value === 'WEEKLY' ? '주간 적립' : '월간 적립'
}

async function loadDetail() {
  try {
    if (route.params.guidanceId && route.params.guidanceId !== 'latest') {
      detail.value = await getInvestmentGuidanceDetail(route.params.guidanceId)
    } else {
      detail.value = await getRebalancingRecommendation()
    }
  } catch (error) {
    loadError.value = error?.response?.data?.message || '가이드 상세 정보를 불러오지 못했어요.'
  }
}

onMounted(loadDetail)
</script>

<template>
  <section class="guide-detail screen app-page">
    <template v-if="detail">
      <header class="detail-summary">
        <small>이번 투자 가이드</small>
        <h2>{{ recommendation.reason || '현재 계획을 유지하며 꾸준히 투자해보세요.' }}</h2>
        <p>
          다음 점검일
          {{
            String(recommendation.nextReviewAt || '-')
              .slice(0, 10)
              .replaceAll('-', '.')
          }}
        </p>
      </header>

      <article class="detail-card highlight-card">
        <span>추천 회차별 투자금</span>
        <strong>{{ formatWon(recommendation.recommendedContributionAmount) }}</strong>
        <small>현재 {{ formatWon(recommendation.currentContributionAmount) }}</small>
      </article>

      <article class="detail-card">
        <h3>현재 적립 계획</h3>
        <dl>
          <div>
            <dt>투자 주기</dt>
            <dd>{{ frequencyLabel(plan.frequency) }}</dd>
          </div>
          <div>
            <dt>회차별 투자금</dt>
            <dd>{{ formatWon(plan.contributionAmount) }}</dd>
          </div>
          <div>
            <dt>월 최대 한도</dt>
            <dd>{{ formatWon(plan.maximumMonthlyAmount) }}</dd>
          </div>
          <div>
            <dt>투자 상품</dt>
            <dd>{{ plan.investmentProductName || '-' }}</dd>
          </div>
        </dl>
      </article>

      <article class="detail-card">
        <h3>자산 현황</h3>
        <dl>
          <div>
            <dt>투자 원금</dt>
            <dd>{{ formatWon(asset.investmentPrincipal) }}</dd>
          </div>
          <div>
            <dt>현재 평가금액</dt>
            <dd>{{ formatWon(asset.marketValue) }}</dd>
          </div>
          <div>
            <dt>수익률</dt>
            <dd>{{ Number(asset.returnRate || 0).toFixed(2) }}%</dd>
          </div>
          <div>
            <dt>목표까지</dt>
            <dd>{{ formatWon(progress.goalMarginAmount) }}</dd>
          </div>
        </dl>
      </article>

      <p class="no-order-notice">
        {{ detail.noOrderNotice || '이 가이드는 투자 주문을 자동으로 실행하지 않아요.' }}
      </p>
    </template>
    <p
      v-else
      class="detail-error"
    >
      {{ loadError || '가이드 상세 정보를 불러오고 있어요.' }}
    </p>
  </section>
</template>

<style scoped>
.guide-detail {
  display: grid;
  gap: 14px;
  padding: 20px 20px calc(var(--page-bottom-navigation-space) + 30px);
  background: var(--ui-background);
}
.detail-summary {
  padding: 8px 2px 14px;
}
.detail-summary small {
  color: #16c966;
  font-size: 12px;
  font-weight: 700;
}
.detail-summary h2 {
  margin: 8px 0;
  color: #333;
  font-size: 23px;
  line-height: 1.45;
  letter-spacing: -0.6px;
}
.detail-summary p {
  margin: 0;
  color: #9e9e9e;
  font-size: 12px;
}
.detail-card {
  padding: 22px 20px;
  border-radius: 26px;
  background: #fff;
  box-shadow: 0 8px 24px rgb(51 51 51 / 4%);
}
.highlight-card {
  background: linear-gradient(135deg, #edfff4, #fff);
}
.highlight-card span {
  color: #757575;
  font-size: 13px;
  font-weight: 600;
}
.highlight-card strong {
  display: block;
  margin: 10px 0 3px;
  color: #16c966;
  font-size: 29px;
}
.highlight-card small {
  color: #9e9e9e;
  font-size: 12px;
}
.detail-card h3 {
  margin: 0 0 10px;
  color: #333;
  font-size: 17px;
}
.detail-card dl {
  margin: 0;
}
.detail-card dl div {
  display: flex;
  min-height: 44px;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #ececec;
}
.detail-card dl div:last-child {
  border-bottom: 0;
}
.detail-card dt {
  color: #757575;
  font-size: 13px;
}
.detail-card dd {
  margin: 0;
  color: #333;
  font-size: 13px;
  font-weight: 700;
}
.no-order-notice,
.detail-error {
  color: #9e9e9e;
  font-size: 12px;
  line-height: 1.55;
  text-align: center;
}
.detail-error {
  margin-top: 100px;
}
</style>
