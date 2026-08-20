<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'

import armyCharacter from '../../../assets/character/army.png'
import starGradient from '@/assets/icons/starGradient.png'
import DetailLinkButton from '@/common/components/navigation/DetailLinkButton.vue'
import AssetBubble from './AssetProgressMarker.vue'

const router = useRouter()

const props = defineProps({
  financialDday: {
    type: Number,
    default: null,
  },
  actualDday: {
    type: Number,
    default: null,
  },
  actualDischargeDate: {
    type: [String, Date, Array],
    default: '2026-09-26',
  },
  financialDischargeDate: {
    type: [String, Date, Array],
    default: null,
  },
  expectedAsset: {
    type: Number,
    default: 800,
  },
  currentAsset: {
    type: Number,
    default: 0,
  },
  targetAmount: {
    type: Number,
    default: 1700,
  },
  differenceDays: {
    type: Number,
    default: null,
  },
  characterImage: {
    type: String,
    default: '',
  },

  /*
   * AssetBubble 휴가모드 연결용
   * 추후 상위 컴포넌트에서 vacation을 넘겨주면 됨.
   */
  mode: {
    type: String,
    default: 'default',
    validator: (value) => ['default', 'vacation'].includes(value),
  },
})

const calculatedAchievementRate = computed(() => {
  const expectedAsset = Number(props.expectedAsset)
  const targetAmount = Number(props.targetAmount)

  if (!Number.isFinite(expectedAsset) || !Number.isFinite(targetAmount) || targetAmount <= 0) {
    return 0
  }

  return (expectedAsset / targetAmount) * 100
})

const normalizedRate = computed(() => Math.min(Math.max(calculatedAchievementRate.value, 0), 100))

/*
 * 휴가모드 진행 바는 전체 트랙을 하나의 블루 그라데이션으로 본다.
 * 채워진 구간 안에 그라데이션 전체가 압축되지 않도록 배경 크기를
 * 달성률의 역비율로 확장해, 진행될수록 자연스럽게 Deep Blue에 가까워진다.
 */
const progressStyle = computed(() => {
  const rate = normalizedRate.value

  return {
    width: `${rate}%`,
    '--progress-rate': `${rate}%`,
    '--progress-gradient-size': `${10000 / Math.max(rate, 0.01)}% 100%`,
  }
})

/*
 * 캐릭터 위치
 *
 * 달성률 위치를 따라가되 카드 양 끝에서 캐릭터가
 * 잘리지 않도록 최소 39px / 최대 39px 여백을 둔다.
 */
const markerPosition = computed(() => `clamp(39px, ${normalizedRate.value}%, calc(100% - 39px))`)

/*
 * 현재 자산 말풍선 방향
 *
 * 기본:
 *   bottom
 *
 * 45 ~ 55%:
 *   달성률 정보가 오른쪽에 있기 때문에
 *   말풍선을 캐릭터 오른쪽 방향으로 펼침.
 *   → diagonal-left
 *
 * 56 ~ 65%:
 *   달성률 정보가 왼쪽에 있기 때문에
 *   말풍선을 캐릭터 왼쪽 방향으로 펼침.
 *   → diagonal-right
 *
 * 실제 화면 확인 후 45 / 55 / 65 값만 조정하면 됨.
 */
const assetBubbleDirection = computed(() => {
  const rate = normalizedRate.value

  if (rate >= 45 && rate <= 55) {
    return 'diagonal-left'
  }

  if (rate > 55 && rate <= 65) {
    return 'diagonal-right'
  }

  return 'bottom'
})

/*
 * 기존 레이아웃:
 * 달성률이 낮을 경우 달성률 텍스트를 오른쪽으로 이동.
 */
const isLowProgress = computed(() => normalizedRate.value < 45)

const hasFinancialDischargeDate = computed(() => Boolean(props.financialDischargeDate))

const formattedActualDate = computed(() => {
  if (!props.actualDischargeDate) return '-'

  if (Array.isArray(props.actualDischargeDate)) {
    const [year, month, day] = props.actualDischargeDate.map(Number)

    if (!year || !month || !day) return '-'

    return `${year}.${String(month).padStart(2, '0')}.${String(day).padStart(2, '0')}`
  }

  if (props.actualDischargeDate instanceof Date) {
    if (Number.isNaN(props.actualDischargeDate.getTime())) return '-'

    const year = props.actualDischargeDate.getFullYear()
    const month = String(props.actualDischargeDate.getMonth() + 1).padStart(2, '0')
    const day = String(props.actualDischargeDate.getDate()).padStart(2, '0')

    return `${year}.${month}.${day}`
  }

  const match = String(props.actualDischargeDate)
    .trim()
    .match(/^(\d{4})[-./](\d{1,2})[-./](\d{1,2})/)

  if (!match) return '-'

  return `${match[1]}.${match[2].padStart(2, '0')}.${match[3].padStart(2, '0')}`
})

function toUtcDate(date) {
  if (Array.isArray(date)) {
    const [year, month, day] = date.map(Number)

    return year && month && day ? Date.UTC(year, month - 1, day) : null
  }

  if (date instanceof Date) {
    if (Number.isNaN(date.getTime())) return null

    return Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
  }

  const match = String(date ?? '')
    .trim()
    .match(/^(\d{4})[-./](\d{1,2})[-./](\d{1,2})/)

  if (!match) return null

  const [, year, month, day] = match.map(Number)

  if (!year || !month || !day) return null

  return Date.UTC(year, month - 1, day)
}

const dischargeDifferenceDays = computed(() => {
  if (props.differenceDays !== null && Number.isFinite(props.differenceDays)) {
    return props.differenceDays
  }

  const financialDate = toUtcDate(props.financialDischargeDate)
  const actualDate = toUtcDate(props.actualDischargeDate)

  if (financialDate === null || actualDate === null) {
    return props.actualDday - props.financialDday
  }

  return Math.round((actualDate - financialDate) / 86400000)
})

function formatDday(value) {
  return Number.isFinite(value) ? `D-${value}` : '-'
}

const dischargeMessage = computed(() => {
  if (dischargeDifferenceDays.value > 0) {
    return `실제 전역일보다 ${dischargeDifferenceDays.value}일 더 빨라요!`
  }

  if (dischargeDifferenceDays.value < 0) {
    return `실제 전역일보다 ${Math.abs(dischargeDifferenceDays.value)}일 느려요!`
  }

  return '전역일에 맞춰 목표 자산을 달성할 것으로 예상돼요!'
})

function goToWhatIfSimulation() {
  router.push({ name: 'what-if-simulation' })
}

function formatAmount(value) {
  return Number(value || 0).toLocaleString('ko-KR')
}

function formatExpectedAsset(value) {
  return Number(value || 0).toLocaleString('ko-KR', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })
}

const formattedTargetAmount = computed(() => formatAmount(Math.round(props.targetAmount || 0)))

const formattedCurrentAsset = computed(() => formatAmount(Math.round(props.currentAsset || 0)))

const formattedAchievementRate = computed(() => {
  const rate = calculatedAchievementRate.value

  if (rate === 0) return '0'
  if (rate < 0.1) return rate.toFixed(2)

  return rate.toFixed(1).replace(/\.0$/, '')
})
</script>

<template>
  <section
    class="financial-dday-card"
    :class="`financial-dday-card--${mode}`"
  >
    <img
      v-if="mode === 'vacation'"
      class="financial-dday-card__vacation-star"
      :src="starGradient"
      alt=""
      aria-hidden="true"
    >

    <div class="financial-dday-card__dates">
      <div class="financial-dday-card__financial-date">
        <p class="financial-dday-card__label">
          재정적 전역일
        </p>

        <template v-if="hasFinancialDischargeDate">
          <strong class="financial-dday-card__main-dday">
            {{ formatDday(financialDday) }}
          </strong>

          <p class="financial-dday-card__message">
            {{ dischargeMessage }}
          </p>
        </template>

        <div
          v-else
          class="financial-dday-card__what-if-guide"
        >
          <p>
            What-if 시뮬레이션으로<br>
            자산 분배 목표를 설정하고<br>
            나의 재정적 전역일을 계산해보세요
          </p>

          <DetailLinkButton
            class="financial-dday-card__what-if-link app-label label--safe"
            aria-label="What-if 시뮬레이션 하러가기"
            @click="goToWhatIfSimulation"
          >
            What-if 시뮬레이션 하러가기
          </DetailLinkButton>
        </div>
      </div>

      <div class="financial-dday-card__actual-date">
        <span>실제 전역일</span>
        <strong>{{ formatDday(actualDday) }}</strong>
        <time :datetime="actualDischargeDate">
          {{ formattedActualDate }}
        </time>
      </div>
    </div>

    <div
      class="financial-dday-card__progress-section"
      :class="{
        'financial-dday-card__progress-section--low': isLowProgress,
      }"
    >
      <div class="financial-dday-card__achievement">
        <p>전역 목표 금액 달성률</p>

        <strong> {{ formattedAchievementRate }}% </strong>

        <span>
          전역 예상 자산
          {{ formatExpectedAsset(expectedAsset) }}만원
        </span>
      </div>

      <div
        class="financial-dday-card__marker"
        :class="`financial-dday-card__marker--${assetBubbleDirection}`"
        :style="{ left: markerPosition }"
      >
        <AssetBubble
          class="financial-dday-card__asset-bubble"
          :amount="formattedCurrentAsset"
          :direction="assetBubbleDirection"
          :mode="mode"
        />

        <div class="financial-dday-card__character-wrap">
          <span class="financial-dday-card__character-shadow" />

          <span
            v-if="mode === 'vacation'"
            class="financial-dday-card__sunglasses"
            aria-hidden="true"
          >
            🕶️
          </span>

          <img
            :src="characterImage || armyCharacter"
            alt=""
            aria-hidden="true"
          >
        </div>
      </div>

      <div class="financial-dday-card__goal">
        <div
          class="financial-dday-card__track"
          role="progressbar"
          aria-label="전역 목표 금액 달성률"
          aria-valuemin="0"
          aria-valuemax="100"
          :aria-valuenow="normalizedRate"
        >
          <span :style="progressStyle" />
        </div>

        <p>목표 {{ formattedTargetAmount }}만원</p>
      </div>
    </div>
  </section>
</template>

<style scoped>
.financial-dday-card {
  position: relative;
  isolation: isolate;
  width: 100%;
  min-height: clamp(340px, 92vw, 362px);
  padding: clamp(28px, 8vw, 37px) clamp(14px, 4.6vw, 18px) var(--space-20);
  overflow: hidden;
  border: 1px solid rgb(255 255 255 / 72%);
  border-radius: var(--dashboard-card-radius);
  background:
    linear-gradient(145deg, rgb(255 255 255 / 34%), rgb(255 255 255 / 12%)), rgb(255 255 255 / 20%);
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / 85%),
    inset 0 -1px 0 rgb(255 255 255 / 24%),
    0 12px 32px rgb(51 51 51 / 7%);
  backdrop-filter: blur(22px) saturate(135%);
  -webkit-backdrop-filter: blur(22px) saturate(135%);
  color: var(--gray-900);
}

.financial-dday-card::before {
  position: absolute;
  z-index: -1;
  inset: 0;
  border-radius: inherit;
  background:
    radial-gradient(circle at 10% 0%, rgb(255 255 255 / 55%), transparent 42%),
    radial-gradient(circle at 90% 100%, rgb(98 255 156 / 8%), transparent 38%);
  content: '';
  pointer-events: none;
}

.financial-dday-card--vacation {
  /*
   * 진행률이 양 끝에 가까울 때 AssetProgressMarker의 꼬리와
   * drop-shadow가 카드 경계에서 잘리지 않도록 허용한다.
   * 카드 배경과 ::before 레이어는 각각 border-radius를 유지한다.
   */
  overflow: visible;
  background:
    radial-gradient(
      circle at -8% 108%,
      color-mix(in srgb, var(--yellow-400) 12%, transparent) 0%,
      transparent 44%
    ),
    radial-gradient(
      circle at 108% -8%,
      color-mix(in srgb, var(--brand-deep-blue) 10%, transparent) 0%,
      transparent 46%
    ),
    linear-gradient(145deg, rgb(255 255 255 / 30%), rgb(255 255 255 / 10%)),
    color-mix(in srgb, var(--brand-light-blue) 7%, transparent);
  box-shadow:
    inset 0 0 4px rgb(0 0 0 / 10%),
    inset 0 1px 0 rgb(255 255 255 / 70%);
}

.financial-dday-card--vacation::before {
  background:
    radial-gradient(circle at 8% 4%, rgb(255 255 255 / 36%), transparent 34%),
    radial-gradient(
      circle at 96% 94%,
      color-mix(in srgb, var(--brand-light-blue) 12%, transparent),
      transparent 36%
    );
}

.financial-dday-card__vacation-star {
  position: absolute;
  z-index: 0;
  top: 138px;
  right: 12px;
  width: 49px;
  height: 49px;
  object-fit: contain;
  pointer-events: none;
}

.financial-dday-card p {
  margin: 0;
}

.financial-dday-card__dates {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  gap: var(--dashboard-gap);
  padding: 0 2px;
}

.financial-dday-card__financial-date {
  min-width: 0;
}

.financial-dday-card__what-if-guide {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
  margin-top: 8px;
}

.financial-dday-card__what-if-guide > p {
  color: var(--gray-600);
  font-family: var(--body-body-small-regular-font-family);
  font-size: var(--body-body-small-regular-font-size);
  font-weight: var(--body-body-small-regular-font-weight);
  line-height: var(--body-body-small-regular-line-height);
}

.financial-dday-card__what-if-link {
  max-width: 100%;
  color: var(--green-700);
}

.financial-dday-card__label {
  color: var(--gray-600);
  font-size: 14px;
  font-weight: var(--weight-bold);
  line-height: 1.5;
}

.financial-dday-card__main-dday {
  display: block;
  font-family: var(--font-display);
  font-size: clamp(34px, 10vw, 40px);
  font-weight: 400;
  letter-spacing: -0.02em;
  line-height: 1.4;
}

.financial-dday-card__message {
  display: inline-flex;
  max-width: 100%;
  padding: 2px 10px;
  overflow: hidden;
  border-radius: 20px;
  background: var(--dashboard-success-soft);
  color: var(--dashboard-success);
  font-size: 12px;
  line-height: 1.5;
  white-space: normal;
}

.financial-dday-card--vacation .financial-dday-card__message {
  background: var(--brand-light-blue);
  color: var(--brand-deep-blue);
  font-family: var(--font-body);
  font-size: var(--body-label-small-font-size);
  font-weight: var(--weight-regular);
  line-height: var(--body-label-small-line-height);
}

.financial-dday-card__actual-date {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 10px 12px;
  border-radius: 20px;
  background: var(--olive-200);
}

.financial-dday-card__actual-date span {
  color: var(--white);
  font-family: var(--font-display);
  font-size: 12px;
  line-height: 1.5;
}

.financial-dday-card__actual-date strong {
  color: var(--olive-500);
  font-family: var(--font-display);
  font-size: 24px;
  font-weight: 400;
  letter-spacing: -0.05em;
  line-height: 1.5;
}

.financial-dday-card__actual-date time {
  color: var(--gray-600);
  font-size: 12px;
  line-height: 1.3;
}

.financial-dday-card--vacation .financial-dday-card__actual-date {
  background: var(--brand-light-blue);
}

.financial-dday-card--vacation .financial-dday-card__actual-date strong {
  color: color-mix(in srgb, var(--brand-deep-blue) 55%, var(--olive-500));
}

.financial-dday-card--vacation .financial-dday-card__what-if-link {
  --detail-link-icon-filter: brightness(0) saturate(100%) invert(48%) sepia(99%) saturate(3482%)
    hue-rotate(176deg) brightness(102%) contrast(105%);

  width: min(202px, 100%);
  min-height: 22px;
  justify-content: flex-start;
  gap: 2px;
  padding: 2px 10px;
  background: var(--brand-light-blue);
  color: var(--brand-deep-blue);
  font-family: var(--body-body-small-regular-font-family);
  font-size: var(--body-body-small-regular-font-size);
  font-weight: var(--body-body-small-regular-font-weight);
  line-height: var(--body-body-small-regular-line-height);
}

.financial-dday-card__progress-section {
  position: relative;
  min-height: 177px;
  margin-top: clamp(20px, 7vw, 29px);
  padding: 10px 8px 0;
}

.financial-dday-card__achievement {
  display: flex;
  width: fit-content;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
}

.financial-dday-card__progress-section--low .financial-dday-card__achievement {
  margin-left: auto;
  padding-right: 2px;
}

.financial-dday-card__achievement p {
  color: var(--gray-500);
  font-size: 14px;
  font-weight: var(--weight-bold);
  line-height: 1.5;
}

.financial-dday-card__achievement strong {
  color: var(--green-700);
  font-family: var(--font-display);
  font-size: 24px;
  font-weight: 400;
  letter-spacing: -0.05em;
  line-height: 1.5;
}

.financial-dday-card__achievement span {
  color: var(--dashboard-muted-text);
  font-size: 14px;
  line-height: 1.5;
}

.financial-dday-card--vacation .financial-dday-card__achievement strong {
  color: var(--brand-deep-blue);
}

/* =========================
   Marker
   ========================= */

.financial-dday-card__marker {
  position: absolute;
  top: 28px;
  z-index: 2;
  display: flex;
  width: max-content;
  flex-direction: column;
  align-items: center;
  transform: translateX(-50%);
}

/*
 * 기본 상태
 *
 * 말풍선 중앙과 캐릭터 중앙을 맞춤.
 */
.financial-dday-card__marker--bottom {
  align-items: center;
}

.financial-dday-card__asset-bubble {
  position: relative;
  top: -5px;
}

/*
 * 45 ~ 55%
 *
 * 캐릭터는 진행률 위치에 그대로 있고
 * 말풍선만 오른쪽으로 펼쳐진다
 *
 * diagonal-left:
 * 말풍선 왼쪽 아래 모서리가 캐릭터 방향
 */
.financial-dday-card__marker--diagonal-left .financial-dday-card__asset-bubble {
  align-self: flex-start;
  margin-left: 28px;
}

/*
 * 56 ~ 65%
 *
 * 캐릭터는 진행률 위치에 그대로 있고
 * 말풍선만 왼쪽으로 펼쳐진다
 *
 * diagonal-right:
 * 말풍선 오른쪽 아래 모서리가 캐릭터 방향
 */
.financial-dday-card__marker--diagonal-right .financial-dday-card__asset-bubble {
  align-self: flex-end;
  margin-right: 28px;
}

/* =========================
   Character
   ========================= */

.financial-dday-card__character-wrap {
  position: relative;
  width: 55px;
  height: 55px;
  margin: -1px auto 0;
}

.financial-dday-card__character-wrap img {
  position: relative;
  z-index: 1;
  display: block;
  width: 55px;
  height: 55px;
  object-fit: contain;
}

.financial-dday-card__sunglasses {
  position: absolute;
  z-index: 3;
  top: -11px;
  left: 50%;
  width: 60px;
  font-size: 38px;
  line-height: 1;
  text-align: center;
  transform: translateX(-50%);
  pointer-events: none;
}

.financial-dday-card__character-shadow {
  position: absolute;
  bottom: 1px;
  left: 8px;
  width: 39px;
  height: 12px;
  border-radius: 50%;
  background: var(--green-900);
  filter: blur(7px);
}

.financial-dday-card--vacation .financial-dday-card__character-shadow {
  background: var(--brand-deep-blue);
}

/* =========================
   Goal Progress
   ========================= */

.financial-dday-card__goal {
  position: absolute;
  right: 8px;
  bottom: 0;
  left: 8px;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 9px;
}

.financial-dday-card__track {
  position: relative;
  width: 100%;
  height: 7px;
  border-radius: 999px;
  background: var(--dashboard-track);
}

.financial-dday-card__track span {
  position: relative;
  display: block;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, var(--green-500), var(--green-800));
}

.financial-dday-card__track span::after {
  position: absolute;
  top: 50%;
  right: 0;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: var(--green-800);
  content: '';
  transform: translate(50%, -50%);
}

.financial-dday-card--vacation .financial-dday-card__track span {
  background: linear-gradient(90deg, var(--blue-200), var(--brand-deep-blue));
  background-repeat: no-repeat;
  background-size: var(--progress-gradient-size);
}

.financial-dday-card--vacation .financial-dday-card__track span::after {
  /* 선의 현재 지점 색을 원에도 사용해 하나의 union처럼 연결한다. */
  background: color-mix(
    in srgb,
    var(--blue-200) calc(100% - var(--progress-rate)),
    var(--brand-deep-blue) var(--progress-rate)
  );
}

.financial-dday-card__goal p {
  color: var(--dashboard-muted-text);
  font-size: 14px;
  line-height: 1.5;
}

@media (max-width: 360px) {
  .financial-dday-card {
    padding-right: 14px;
    padding-left: 14px;
  }

  .financial-dday-card__message {
    max-width: 190px;
  }

  /*
   * 작은 화면에서는 대각선 말풍선 이동량을 살짝 줄임!
   */
  .financial-dday-card__marker--diagonal-left .financial-dday-card__asset-bubble {
    margin-left: 22px;
  }

  .financial-dday-card__marker--diagonal-right .financial-dday-card__asset-bubble {
    margin-right: 22px;
  }
}
</style>
