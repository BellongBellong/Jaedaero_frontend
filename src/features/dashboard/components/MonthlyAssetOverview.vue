<script setup>
import { computed } from 'vue'

import assetBlock from '@/assets/icons/account/assetBlock.png'
import consumptionBlock from '@/assets/icons/account/consumptionBlock.png'
import investBlock from '@/assets/icons/account/investBlock.png'
import DetailLinkButton from '../../../common/components/navigation/DetailLinkButton.vue'

const props = defineProps({
  data: {
    type: Object,
    default: null,
  },
  showReportLink: {
    type: Boolean,
    default: true,
  },
})

const emit = defineEmits(['view-report', 'view-income', 'view-investment', 'view-spending'])

const spendingRate = computed(() => {
  const amount = props.data?.spending?.amount ?? 0
  const target = props.data?.spending?.targetAmount ?? 0

  return target > 0 ? (amount / target) * 100 : 0
})

const spendingState = computed(() => {
  const target = Number(props.data?.spending?.targetAmount || 0)
  if (target <= 0) return 'no-target'

  return Number(props.data?.spending?.amount || 0) > target ? 'over' : 'safe'
})

const spendingDifference = computed(
  () => Number(props.data?.spending?.amount || 0) - Number(props.data?.spending?.targetAmount || 0),
)

const spendingRingStyle = computed(() => ({
  '--spending-progress': `${Math.min(spendingRate.value, 100) * 3.6}deg`,
  '--spending-over-progress': `${Math.min(Math.max(spendingRate.value - 100, 0), 100) * 3.6}deg`,
}))

const investmentState = computed(() => {
  if (!props.data?.investment?.hasSecuritiesAccount) return 'disconnected'

  const changeAmount = Number(props.data.investment.changeAmount || 0)
  if (changeAmount > 0) return 'profit'
  if (changeAmount < 0) return 'loss'
  return 'steady'
})

function formatWon(value) {
  return `${Number(value || 0).toLocaleString('ko-KR')}원`
}

function formatSignedWon(value) {
  const amount = Number(value || 0)
  const sign = amount > 0 ? '+' : ''
  return `${sign}${amount.toLocaleString('ko-KR')}원`
}

function formatSignedRate(value) {
  const rate = Number(value || 0)
  const sign = rate > 0 ? '+' : ''
  return `${sign}${rate}%`
}

function openInvestmentTransactions() {
  if (investmentState.value !== 'disconnected') emit('view-investment')
}
</script>

<template>
  <div
    v-if="data"
    class="monthly-assets"
  >
    <button
      type="button"
      class="monthly-assets__income"
      aria-label="이번 달 수입 거래 내역 보기"
      @click="$emit('view-income')"
    >
      <div class="monthly-assets__income-heading">
        <img
          :src="assetBlock"
          alt=""
          aria-hidden="true"
        >
        <span>수입</span>
      </div>
      <div class="monthly-assets__income-value">
        <div class="monthly-assets__income-total">
          <strong>{{ formatWon(data.income.amount) }}</strong>
          <span
            v-if="data.income.hasAdditionalIncome"
            class="monthly-assets__badge app-label label--safe"
          >
            +{{ data.income.changeRate }}%
          </span>
        </div>
        <div class="monthly-assets__income-details">
          <small> {{ data.income.salaryLabel }} {{ formatWon(data.income.salaryAmount) }} </small>
          <small
            v-if="data.income.otherIncomeAmount > 0"
            class="monthly-assets__other-income"
          >
            기타 수익 {{ formatWon(data.income.otherIncomeAmount) }}
          </small>
        </div>
      </div>
    </button>

    <div class="monthly-assets__lower">
      <article
        class="monthly-assets__tile monthly-assets__tile--investment"
        :class="`monthly-assets__tile--investment-${investmentState}`"
        :role="investmentState === 'disconnected' ? undefined : 'button'"
        :tabindex="investmentState === 'disconnected' ? undefined : 0"
        @click="openInvestmentTransactions"
        @keydown.enter.prevent="openInvestmentTransactions"
        @keydown.space.prevent="openInvestmentTransactions"
      >
        <div class="monthly-assets__investment-content">
          <div class="monthly-assets__investment-heading">
            <img
              :src="investBlock"
              alt=""
              aria-hidden="true"
            >
            <span>투자</span>
          </div>

          <div class="monthly-assets__investment-value">
            <div class="monthly-assets__investment-total">
              <strong>{{ formatWon(data.investment.amount) }}</strong>
              <span
                v-if="investmentState !== 'disconnected' && investmentState !== 'steady'"
                class="monthly-assets__investment-badge app-label"
                :class="investmentState === 'loss' ? 'label--notification' : 'label--invest'"
              >
                {{ formatSignedRate(data.investment.changeRate) }}
              </span>
            </div>
            <small
              v-if="investmentState === 'disconnected'"
              class="monthly-assets__investment-connect-copy"
            >
              증권계좌를 연결해주세요
            </small>
            <small
              v-else
              class="monthly-assets__investment-change"
            >
              수익
              <b>{{ formatSignedWon(data.investment.changeAmount) }}</b>
            </small>
          </div>
        </div>

        <RouterLink
          v-if="investmentState === 'disconnected'"
          class="monthly-assets__investment-action"
          :to="{
            name: 'connect-codef-bank',
            params: { assetType: 'securities' },
            query: { source: 'dashboard', mode: 'additional' },
          }"
          @click.stop
        >
          증권계좌연결
        </RouterLink>
        <span
          v-else
          class="monthly-assets__investment-action"
        >
          목표 {{ formatWon(data.investment.monthlyPaymentTarget) }}
        </span>
      </article>

      <button
        type="button"
        class="monthly-assets__tile monthly-assets__tile--spending"
        :class="`monthly-assets__tile--spending-${spendingState}`"
        aria-label="이번 달 지출 내역 보기"
        @click="$emit('view-spending')"
      >
        <div class="monthly-assets__spending-content">
          <div class="monthly-assets__spending-heading">
            <img
              :src="consumptionBlock"
              alt=""
              aria-hidden="true"
            >
            <span>지출</span>
          </div>

          <div class="monthly-assets__spending-value">
            <div class="monthly-assets__spending-total">
              <strong>{{ formatWon(data.spending.amount) }}</strong>
              <span
                v-if="spendingState !== 'no-target'"
                class="monthly-assets__spending-status app-label"
                :class="spendingState === 'over' ? 'label--notification' : 'label--safe'"
              >
                {{ spendingState === 'over' ? '초과 ▲' : '여유' }}
              </span>
            </div>

            <small v-if="spendingState === 'no-target'"> 지출목표를 아직 설정하지 않았어요 </small>
            <small
              v-else
              class="monthly-assets__spending-comparison"
            >
              목표 보다
              <b>{{ formatSignedWon(spendingDifference) }}</b>
              {{ spendingState === 'over' ? '더 썼어요' : '덜 썼어요' }}
            </small>
          </div>
        </div>

        <div class="monthly-assets__spending-goal">
          <small>목표 {{ formatWon(data.spending.targetAmount) }}</small>
          <span
            class="monthly-assets__spending-ring"
            :class="`monthly-assets__spending-ring--${spendingState}`"
            :style="spendingRingStyle"
            role="img"
            :aria-label="
              spendingState === 'no-target'
                ? '지출 목표 미설정'
                : `지출 목표 대비 ${Math.round(spendingRate)}퍼센트`
            "
          >
            <span class="monthly-assets__spending-ring-base" />
            <span
              v-if="spendingState !== 'no-target'"
              class="monthly-assets__spending-ring-progress"
            />
            <span
              v-if="spendingState === 'over'"
              class="monthly-assets__spending-ring-over"
            />
          </span>
        </div>
      </button>
    </div>

    <DetailLinkButton
      v-if="showReportLink"
      class="monthly-assets__report"
      @click="$emit('view-report')"
    >
      이번 달 거래 내역 보기
    </DetailLinkButton>
  </div>

  <p
    v-else
    class="monthly-assets__empty"
  >
    이번 달 자산 현황이 없어요.
  </p>
</template>

<style scoped>
.monthly-assets {
  display: flex;
  width: 100%;
  flex-direction: column;
  gap: var(--dashboard-card-gap);
}

.monthly-assets__income,
.monthly-assets__tile {
  position: relative;
  isolation: isolate;
  overflow: hidden;
  border: 1px solid rgb(255 255 255 / 58%);
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / 76%),
    inset 0 -1px 0 rgb(255 255 255 / 18%),
    0 8px 24px rgb(51 51 51 / 5%);
  backdrop-filter: blur(18px) saturate(125%);
  -webkit-backdrop-filter: blur(18px) saturate(125%);
  color: var(--gray-900);
}

.monthly-assets__income::before,
.monthly-assets__tile::before {
  position: absolute;
  z-index: -1;
  inset: 0;
  border-radius: inherit;
  background:
    radial-gradient(circle at 8% 0%, rgb(255 255 255 / 48%), transparent 42%),
    linear-gradient(135deg, rgb(255 255 255 / 18%), transparent 62%);
  content: '';
  pointer-events: none;
}

.monthly-assets__income {
  display: flex;
  min-height: 76px;
  align-items: flex-start;
  justify-content: flex-start;
  gap: 14px;
  padding: 10px var(--space-20);
  border-radius: 20px;
  background:
    linear-gradient(90deg, rgb(166 255 199 / 22%), rgb(255 255 255 / 12%)), rgb(255 255 255 / 16%);
  border: 1px solid rgb(255 255 255 / 58%);
  color: inherit;
  cursor: pointer;
  font: inherit;
  text-align: left;
}

.monthly-assets__income:focus-visible,
.monthly-assets__tile--investment[role='button']:focus-visible {
  outline: 2px solid var(--green-700);
  outline-offset: 2px;
}

.monthly-assets__tile--investment[role='button'] {
  cursor: pointer;
}

.monthly-assets__income-heading {
  display: flex;
  flex: 0 0 30px;
  flex-direction: column;
  align-items: center;
  color: var(--green-700);
  font-size: 12px;
  line-height: 1.5;
}

.monthly-assets__income-heading img {
  width: 30px;
  height: 30px;
  object-fit: contain;
}

.monthly-assets__heading {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 8px;
  color: var(--gray-600);
  font-size: 14px;
  font-weight: var(--weight-bold);
}

.monthly-assets__heading img {
  width: 30px;
  height: 30px;
  object-fit: contain;
}

.monthly-assets__income-value {
  display: grid;
  min-width: 0;
  align-self: stretch;
  align-content: start;
  gap: 4px;
  padding: 2px 0;
}

.monthly-assets__income-total {
  display: flex;
  align-items: center;
  gap: 4px;
}

.monthly-assets__income-details {
  display: grid;
  gap: 0;
}

.monthly-assets__income-details .monthly-assets__other-income {
  color: var(--dashboard-success);
}

.monthly-assets strong {
  font-size: 14px;
  line-height: 1.5;
  white-space: nowrap;
}

.monthly-assets small {
  color: var(--gray-400);
  font-size: 11px;
  line-height: 1.3;
}

.monthly-assets__lower {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--dashboard-card-gap);
}

.monthly-assets__tile {
  display: flex;
  min-width: 0;
  min-height: 98px;
  flex-direction: column;
  gap: 3px;
  padding: 10px 12px;
  border-radius: 20px;
}

.monthly-assets__tile--investment {
  grid-column: 1 / -1;
  min-height: 68px;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px var(--space-20);
  background:
    linear-gradient(117.93deg, rgb(86 103 82 / 17%), rgb(255 255 255 / 8%)), rgb(255 255 255 / 12%);
}

.monthly-assets__investment-content {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 14px;
}

.monthly-assets__investment-heading {
  display: flex;
  flex: 0 0 30px;
  flex-direction: column;
  align-items: center;
  color: var(--olive-500);
  font-size: 12px;
  line-height: 1.5;
}

.monthly-assets__investment-heading img {
  width: 30px;
  height: 30px;
  object-fit: contain;
}

.monthly-assets__investment-value {
  display: grid;
  min-width: 0;
  gap: 2px;
}

.monthly-assets__investment-total {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 5px;
}

.monthly-assets__investment-badge {
  flex: 0 0 auto;
}

.monthly-assets__investment-change {
  color: var(--dashboard-success);
}

.monthly-assets__tile--investment-loss .monthly-assets__investment-change {
  color: var(--orange-600);
}

.monthly-assets__investment-change b {
  margin-left: 3px;
}

.monthly-assets__investment-connect-copy {
  color: var(--gray-500);
  white-space: nowrap;
}

.monthly-assets__investment-action {
  flex: 0 0 auto;
  padding: 6px 10px;
  border-radius: 12px;
  background: rgb(236 236 236 / 70%);
  color: var(--gray-400);
  font-size: 11px;
  text-decoration: none;
  white-space: nowrap;
}

.monthly-assets__tile--investment-disconnected .monthly-assets__investment-action {
  color: var(--olive-500);
  cursor: pointer;
}

.monthly-assets__tile--spending {
  grid-column: 1 / -1;
  min-height: 68px;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px var(--space-20);
  border: 1px solid rgb(255 255 255 / 58%);
  background:
    linear-gradient(270deg, rgb(255 255 255 / 8%), rgb(255 163 131 / 13%)), rgb(255 255 255 / 12%);
  color: var(--gray-900);
  cursor: pointer;
  font: inherit;
  text-align: left;
  text-decoration: none;
  transition:
    transform 160ms ease,
    box-shadow 160ms ease;
}

.monthly-assets__tile--spending:active {
  transform: scale(0.98);
}

.monthly-assets__tile--spending:focus-visible {
  outline: 3px solid var(--orange-200);
  outline-offset: 2px;
}

.monthly-assets__spending-content {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 14px;
}

.monthly-assets__spending-heading {
  display: flex;
  flex: 0 0 30px;
  flex-direction: column;
  align-items: center;
  color: var(--orange-500);
  font-size: 12px;
  line-height: 1.5;
}

.monthly-assets__tile--spending-no-target .monthly-assets__spending-heading {
  color: var(--gray-600);
}

.monthly-assets__spending-heading img {
  width: 30px;
  height: 30px;
  object-fit: contain;
}

.monthly-assets__spending-value {
  display: grid;
  min-width: 0;
  gap: 2px;
}

.monthly-assets__spending-total {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 5px;
}

.monthly-assets__spending-status {
  flex: 0 0 auto;
}

.monthly-assets__spending-comparison {
  white-space: nowrap;
}

.monthly-assets__spending-comparison b {
  margin: 0 2px;
  color: var(--orange-500);
  font-size: 12px;
}

.monthly-assets__tile--spending-safe .monthly-assets__spending-comparison b {
  color: var(--dashboard-success);
}

.monthly-assets__spending-goal {
  display: grid;
  flex: 0 0 auto;
  justify-items: center;
  gap: 4px;
}

.monthly-assets__spending-goal > small {
  font-size: 10px;
  white-space: nowrap;
}

.monthly-assets__spending-ring {
  position: relative;
  display: block;
  width: 22px;
  height: 22px;
}

.monthly-assets__spending-ring > span {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  mask: radial-gradient(farthest-side, transparent calc(100% - 4px), #000 0);
  -webkit-mask: radial-gradient(farthest-side, transparent calc(100% - 4px), #000 0);
}

.monthly-assets__spending-ring-base {
  background: var(--gray-200);
}

.monthly-assets__spending-ring-progress {
  background: conic-gradient(
    from -90deg,
    rgb(255 211 197 / 80%) 0deg,
    rgb(227 114 85 / 80%) var(--spending-progress),
    transparent var(--spending-progress)
  );
}

.monthly-assets__spending-ring-over {
  background: conic-gradient(
    from -90deg,
    rgb(227 114 85 / 90%) 0deg,
    rgb(255 155 122 / 82%) var(--spending-over-progress),
    transparent var(--spending-over-progress)
  );
}

.monthly-assets__report {
  align-self: flex-end;
}

.monthly-assets__empty {
  display: grid;
  min-height: 190px;
  place-items: center;
  margin: 0;
  color: var(--gray-500);
  font-size: 13px;
}

@media (max-width: 350px) {
  .monthly-assets__income {
    padding-right: var(--space-12);
    padding-left: var(--space-12);
  }

  .monthly-assets__lower {
    grid-template-columns: 1fr;
  }

  .monthly-assets__tile--investment {
    padding-right: var(--space-12);
    padding-left: var(--space-12);
  }

  .monthly-assets__investment-content {
    gap: 8px;
  }

  .monthly-assets__investment-action {
    padding-right: 7px;
    padding-left: 7px;
  }

  .monthly-assets__tile--spending {
    padding-right: var(--space-12);
    padding-left: var(--space-12);
  }

  .monthly-assets__spending-content {
    gap: 8px;
  }

  .monthly-assets__spending-comparison {
    white-space: normal;
  }
}

@media (prefers-reduced-motion: reduce) {
  .monthly-assets__tile--spending {
    transition: none;
  }
}
</style>
