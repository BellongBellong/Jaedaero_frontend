<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import glideJet from '@/assets/ai-coach/glide-jet.svg'
import { getMyPageProfile } from '@/features/my-page/api/myPage.api'
import {
  applyRebalancing,
  getInvestmentGuidanceDetail,
  getRebalancingRecommendation,
} from '@/features/rebalancing/api/rebalancing.api'

const route = useRoute()
const router = useRouter()

const detail = ref(null)
const profile = ref(null)
const loadError = ref('')
const isApplying = ref(false)
const applyError = ref('')

// 가이드 응답은 recommendation/currentPlan/assetStatus 로 감싸 오거나 평탄하게 올 수 있어 모두 받아준다.
const recommendation = computed(() => detail.value?.recommendation || detail.value || {})
const plan = computed(() => detail.value?.currentPlan || {})
const asset = computed(() => detail.value?.assetStatus || {})

// 복무 단계 곡선. 계급 4단계가 각 지점에 대응한다.
const SERVICE_STAGES = [
  { rank: 'PRIVATE', label: '이병', level: 1, x: 34, y: 62 },
  { rank: 'PRIVATE_FIRST_CLASS', label: '일병', level: 2, x: 118, y: 22 },
  { rank: 'CORPORAL', label: '상병', level: 3, x: 210, y: 52 },
  { rank: 'SERGEANT', label: '병장', level: 4, x: 278, y: 67 },
]

const STAGE_MESSAGES = {
  PRIVATE: '투자를 막 시작한 시기에요.',
  PRIVATE_FIRST_CLASS: '꾸준히 투자 습관을 만들어가는 시기에요.',
  CORPORAL: '자산이 눈에 띄게 쌓이는 시기에요.',
  SERGEANT: '전역 자산을 마무리하는 시기에요.',
}

const ACTION_LABELS = {
  CONTINUE: '현재 투자 유지',
  START: '투자 시작',
  PAUSE: '잠시 멈춤',
  REDUCE: '금액 줄이기',
  REVIEW: '계획 점검',
  SAFE_FOCUS: '안전자산 집중',
}

const currentStage = computed(() => {
  const rank = profile.value?.rank || recommendation.value?.rank
  return SERVICE_STAGES.find((stage) => stage.rank === rank) || SERVICE_STAGES[0]
})

const stageMessage = computed(() => STAGE_MESSAGES[currentStage.value.rank] || '')

const actionLabel = computed(
  () => ACTION_LABELS[recommendation.value?.actionType] || '현재 투자 유지',
)

const evaluationProfit = computed(() => {
  if (asset.value?.evaluationProfit !== undefined && asset.value?.evaluationProfit !== null) {
    return Number(asset.value.evaluationProfit)
  }
  return Number(asset.value?.marketValue || 0) - Number(asset.value?.investmentPrincipal || 0)
})

const baseAtLabel = computed(() => {
  const raw = asset.value?.baseAt || asset.value?.syncedAt || asset.value?.lastSyncedAt
  if (!raw) return ''
  const date = new Date(raw)
  if (Number.isNaN(date.getTime())) return ''
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hour = date.getHours()
  const meridiem = hour < 12 ? '오전' : '오후'
  const hour12 = hour % 12 || 12
  const minute = String(date.getMinutes()).padStart(2, '0')
  return `${year}.${month}.${day} ${meridiem} ${hour12}:${minute}`
})

const nextReviewLabel = computed(() => {
  const raw = recommendation.value?.nextReviewAt || recommendation.value?.nextContributionAt
  if (!raw) return '-'
  const [, month, day] = String(raw).slice(0, 10).split('-')
  if (!month || !day) return '-'
  return `${Number(month)}월 ${Number(day)}일`
})

function formatWon(value) {
  return `${Number(value || 0).toLocaleString('ko-KR')}원`
}

function formatManwon(value) {
  const number = Number(value || 0)
  if (!number) return '-'
  return `${Math.round(number / 10000).toLocaleString('ko-KR')}만원`
}

function formatRate(value) {
  return `${Number(value || 0).toFixed(value && Number(value) % 1 !== 0 ? 2 : 0)}%`
}

async function keepCurrentPlan() {
  if (isApplying.value) return
  isApplying.value = true
  applyError.value = ''

  try {
    const guidanceId =
      recommendation.value?.guidanceId || recommendation.value?.id || route.params.guidanceId
    await applyRebalancing(guidanceId)
    router.push({ name: 'investment-guide' })
  } catch (error) {
    applyError.value =
      error?.response?.data?.message || '계획을 적용하지 못했어요. 잠시 후 다시 시도해주세요.'
  } finally {
    isApplying.value = false
  }
}

async function loadDetail() {
  const [detailResult, profileResult] = await Promise.allSettled([
    route.params.guidanceId && route.params.guidanceId !== 'latest'
      ? getInvestmentGuidanceDetail(route.params.guidanceId)
      : getRebalancingRecommendation(),
    getMyPageProfile(),
  ])

  if (detailResult.status === 'fulfilled') {
    detail.value = detailResult.value
  } else {
    loadError.value =
      detailResult.reason?.response?.data?.message || '가이드 상세 정보를 불러오지 못했어요.'
  }

  if (profileResult.status === 'fulfilled') profile.value = profileResult.value
}

onMounted(loadDetail)
</script>

<template>
  <section class="guide-detail screen app-page">
    <template v-if="detail">
      <article class="detail-card">
        <h2>현재 투자 성과</h2>
        <div class="performance-grid">
          <div>
            <small>투자원금</small>
            <strong>{{ formatWon(asset.investmentPrincipal) }}</strong>
          </div>
          <div>
            <small>평가금액</small>
            <strong>{{ formatWon(asset.marketValue) }}</strong>
          </div>
          <div>
            <small>평가 손익</small>
            <strong>{{ formatWon(evaluationProfit) }}</strong>
          </div>
          <div>
            <small>수익률</small>
            <strong>{{ formatRate(asset.returnRate) }}</strong>
          </div>
        </div>
        <p
          v-if="baseAtLabel"
          class="detail-card__note"
        >
          증권 데이터 기준 · {{ baseAtLabel }}
        </p>
      </article>

      <article class="detail-card">
        <h2>현재 복무 단계</h2>
        <div class="service-stage">
          <svg
            aria-hidden="true"
            viewBox="0 -18 300 118"
          >
            <defs>
              <linearGradient
                id="serviceStageArea"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="0%"
                  stop-color="#9fb5a7"
                  stop-opacity="0.3"
                />
                <stop
                  offset="100%"
                  stop-color="#9fb5a7"
                  stop-opacity="0"
                />
              </linearGradient>
            </defs>

            <path
              class="service-stage__area"
              d="M8 72 C 46 72 66 22 118 22 C 170 22 190 48 212 54 C 242 62 268 68 292 70 L292 100 L8 100 Z"
            />
            <path
              class="service-stage__track"
              d="M8 72 C 46 72 66 22 118 22 C 170 22 190 48 212 54 C 242 62 268 68 292 70"
            />
            <g
              v-for="stage in SERVICE_STAGES"
              :key="stage.rank"
            >
              <circle
                class="service-stage__halo"
                :class="{ 'is-current': stage.rank === currentStage.rank }"
                :cx="stage.x"
                :cy="stage.y"
                r="7"
              />
              <circle
                class="service-stage__dot"
                :class="{ 'is-current': stage.rank === currentStage.rank }"
                :cx="stage.x"
                :cy="stage.y"
                r="4"
              />
            </g>
            <image
              class="service-stage__marker"
              :href="glideJet"
              :x="currentStage.x - 21"
              :y="currentStage.y - 32"
              width="42"
              height="23"
            />
          </svg>
        </div>
        <div class="service-stage__caption">
          <div class="service-stage__rank">
            <span
              class="rank-insignia"
              aria-hidden="true"
            >
              <i
                v-for="bar in currentStage.level"
                :key="bar"
              />
            </span>
            <strong>{{ currentStage.label }}</strong>
          </div>
          <p>{{ stageMessage }}</p>
        </div>
      </article>

      <article class="detail-card">
        <h2>이번달 추천</h2>
        <div class="recommend-box">
          <strong>✅ {{ actionLabel }}</strong>
          <p>
            {{ recommendation.reason || '현재 계획을 유지하며 꾸준히 투자하는 것을 추천해요.' }}
          </p>
        </div>
        <dl>
          <div>
            <dt>💰 월 투자금</dt>
            <dd>{{ formatManwon(plan.contributionAmount) }}</dd>
          </div>
          <div>
            <dt>🛡️ 안전 여유자금</dt>
            <dd>{{ formatManwon(plan.maximumMonthlyAmount) }}</dd>
          </div>
          <div>
            <dt>📅 다음 검토일</dt>
            <dd>{{ nextReviewLabel }}</dd>
          </div>
        </dl>
      </article>

      <p
        v-if="applyError"
        class="detail-error"
        role="alert"
      >
        {{ applyError }}
      </p>

      <button
        class="keep-plan-button"
        type="button"
        :disabled="isApplying"
        @click="keepCurrentPlan"
      >
        {{ isApplying ? '적용 중...' : '현재 계획대로 유지하기' }}
      </button>
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
/* MainLayout 의 .app-page 규칙과 명시도가 같아 밀리므로 클래스를 겹쳐 올린다. */
.guide-detail.app-page {
  display: grid;
  gap: 14px;
  padding: 12px 20px calc(var(--page-bottom-navigation-space) + 30px);

  background: var(--ui-background);
  align-content: start;
}

.detail-card {
  padding: 18px;
  border: 1px solid rgb(255 255 255 / 70%);
  border-radius: 22px;
  background: rgb(255 255 255 / 62%);
  backdrop-filter: blur(14px);
  box-shadow: 0 6px 20px rgb(31 82 51 / 5%);
}

.detail-card h2 {
  margin: 0 0 14px;
  color: #757575;
  font-size: 14px;
  font-weight: 700;
  word-break: keep-all;
}

.detail-card__note {
  margin: 14px 0 0;
  color: #b0b0b0;
  font-size: 11px;
  word-break: keep-all;
}

.performance-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

/* 첨부된 블록 이미지를 CSS 로 재현한다. 이미지가 아니라 크기가 변해도 깨지지 않는다. */
.performance-grid > div {
  padding: 14px 16px;
  border-radius: 18px;
  background: linear-gradient(
    145deg,
    rgb(255 255 255 / 96%) 0%,
    rgb(250 251 252 / 88%) 52%,
    rgb(242 244 247 / 92%) 100%
  );
  box-shadow:
    inset 1px 1px 0 rgb(255 255 255 / 92%),
    inset -1px -1px 0 rgb(31 41 55 / 3%),
    0 2px 10px rgb(31 41 55 / 4%);
}

.performance-grid small {
  display: block;
  color: #8c8c8c;
  font-size: 11px;
  word-break: keep-all;
}

.performance-grid strong {
  display: block;
  margin-top: 6px;
  color: #333;
  font-size: 15px;
  font-weight: 700;
  letter-spacing: -0.3px;
}

.service-stage svg {
  display: block;
  width: 100%;
  height: auto;
}

.service-stage__area {
  fill: url(#serviceStageArea);
  stroke: none;
}

.service-stage__track {
  fill: none;
  stroke: #e6e6e6;
  stroke-linecap: round;
  stroke-width: 2;
}

.service-stage__halo {
  fill: rgb(170 180 174 / 22%);
}

.service-stage__halo.is-current {
  fill: rgb(34 197 94 / 25%);
}

.service-stage__dot {
  fill: #757575;
}

.service-stage__dot.is-current {
  fill: #22c55e;
}

.service-stage__marker {
  overflow: visible;
}

.service-stage__caption {
  padding: 14px 16px;
  border-radius: 20px;
  background: linear-gradient(90deg, rgb(166 255 199 / 20%) 0%, rgb(255 255 255 / 20%) 100%);
}

.service-stage__rank {
  display: flex;
  align-items: center;
  gap: 7px;
}

/* 계급장. 이병 1줄 ~ 병장 4줄. */
.rank-insignia {
  display: inline-flex;
  flex-direction: column;
  gap: 2px;
}

.rank-insignia i {
  display: block;
  width: 13px;
  height: 2px;
  border-radius: 1px;
  background: #aebba7;
}

.service-stage__caption strong {
  color: #333;
  font-size: 14px;
  font-weight: 700;
  word-break: keep-all;
}

.service-stage__caption p {
  margin: 4px 0 0;
  color: #8c8c8c;
  font-size: 12px;
  word-break: keep-all;
}

.recommend-box {
  padding: 14px 16px;
  border-radius: 16px;
  background: #fff7f3;
}

.recommend-box strong {
  display: block;
  color: #ff9b7a;
  font-size: 13px;
  font-weight: 700;
  word-break: keep-all;
}

.recommend-box p {
  margin: 6px 0 0;
  color: #757575;
  font-size: 12px;
  line-height: 1.55;
  word-break: keep-all;
}

.detail-card dl {
  margin: 6px 0 0;
}

.detail-card dl div {
  display: flex;
  min-height: 44px;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  border-bottom: 1px solid #f0f0f0;
}

.detail-card dl div:last-child {
  border-bottom: 0;
}

.detail-card dt {
  color: #757575;
  font-size: 13px;
  font-weight: 600;
  word-break: keep-all;
}

.detail-card dd {
  margin: 0;
  color: #757575;
  font-size: 13px;
  font-weight: 700;
  white-space: nowrap;
}

.keep-plan-button {
  width: 100%;
  height: 52px;
  border: 0;
  border-radius: var(--radius-full, 999px);
  margin-top: 4px;
  background: #62ff9c;
  color: #333;
  cursor: pointer;
  font-size: 15px;
  font-weight: 700;
  word-break: keep-all;
}

.keep-plan-button:disabled {
  background: #ececec;
  color: #bdbdbd;
  cursor: default;
}

.detail-error {
  margin: 40px 0;
  color: #757575;
  text-align: center;
  word-break: keep-all;
}
</style>
