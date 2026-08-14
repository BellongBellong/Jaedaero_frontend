<script setup>
import { useRouter } from 'vue-router'

import DetailLinkButton from '@/common/components/common/DetailLinkButton.vue'
import { useAnalysisHistory } from '@/features/ai-analysis/composables/useAnalysisHistory'
import { ANALYSIS_RECORD_TYPES } from '@/features/ai-analysis/mappers/analysisHistory.mapper'

const { filteredRecords, summary, activeTab, tabs, loading, error, reload } = useAnalysisHistory()
const router = useRouter()

function recordTypeLabel(record) {
  return record.type === ANALYSIS_RECORD_TYPES.WHAT_IF ? 'What-if' : 'AI 소비 분석'
}

function detailRoute(record) {
  return record.type === ANALYSIS_RECORD_TYPES.WHAT_IF
    ? { name: 'what-if-detail', params: { simulationId: record.sourceId ?? record.id } }
    : { name: 'ai-asset-analysis-result', params: { analysisId: record.sourceId } }
}

function openDetail(record) {
  router.push(detailRoute(record))
}
</script>

<template>
  <section class="analysis-history screen">
    <article class="summary-card">
      <p class="summary-card__label">
        {{ summary.label }}
      </p>
      <p class="summary-card__count">
        {{ summary.count }}건
      </p>
      <div class="summary-card__stats">
        <div class="summary-card__stat">
          <span>최근 분석일</span>
          <strong>{{ summary.latestDate }}</strong>
        </div>
        <span
          class="summary-card__divider"
          aria-hidden="true"
        />
        <div class="summary-card__stat">
          <span>최근 예상 자산</span>
          <strong>{{ summary.latestProjectedAsset }}</strong>
        </div>
      </div>
    </article>

    <div
      class="history-tabs"
      role="tablist"
      aria-label="분석 기록 유형"
    >
      <button
        v-for="tab in tabs"
        :key="tab.value"
        type="button"
        role="tab"
        :aria-selected="activeTab === tab.value"
        :class="{ 'history-tabs__tab--active': activeTab === tab.value }"
        @click="activeTab = tab.value"
      >
        {{ tab.label }}
      </button>
    </div>

    <p
      v-if="loading"
      class="record-list__empty"
    >
      분석 기록을 불러오는 중이에요.
    </p>
    <div
      v-else-if="error"
      class="record-list__empty record-list__error"
    >
      <p>분석 기록을 불러오지 못했어요.</p>
      <button
        type="button"
        @click="reload"
      >
        다시 불러오기
      </button>
    </div>
    <ul
      v-else-if="filteredRecords.length"
      class="record-list"
    >
      <li
        v-for="record in filteredRecords"
        :key="record.id"
      >
        <article
          class="record-card"
          :class="{ 'record-card--applied': record.applied }"
        >
          <header class="record-card__header">
            <div class="record-card__heading">
              <strong>{{ record.title }}</strong>
              <p v-if="record.date">
                {{ record.date }}
              </p>
            </div>
            <div class="record-card__badges">
              <span
                class="pill"
                :class="
                  record.type === ANALYSIS_RECORD_TYPES.WHAT_IF ? 'pill--olive' : 'pill--gray'
                "
              >
                {{ recordTypeLabel(record) }}
              </span>
              <span
                v-if="record.applied"
                class="pill pill--green"
              >
                적용중
              </span>
              <span
                v-if="record.generationSource === 'FALLBACK'"
                class="pill pill--olive"
              >
                기본 가이드
              </span>
            </div>
          </header>

          <p class="record-card__summary">
            {{ record.summary }}
          </p>

          <div
            v-if="record.type === ANALYSIS_RECORD_TYPES.AI_ANALYSIS"
            class="record-card__metrics"
          >
            <div
              v-for="metric in record.metrics"
              :key="metric.label"
              class="metric-box"
            >
              <div class="metric-box__content">
                <span>{{ metric.label }}</span>
                <strong>{{ metric.value }}</strong>
              </div>
              <span
                v-if="metric.change"
                class="pill"
                :class="`pill--${metric.change.tone}`"
              >
                {{ metric.change.label }}
              </span>
            </div>
          </div>

          <div
            v-else
            class="record-card__metrics"
          >
            <div class="metric-box metric-box--soft">
              <div class="metric-box__content">
                <span>월 저축/투자/소비</span>
                <span class="metric-box__ratios">
                  <span
                    v-for="ratio in record.allocationRatios"
                    :key="ratio.tone"
                    class="pill"
                    :class="`pill--${ratio.tone}`"
                  >
                    {{ ratio.label }}
                  </span>
                </span>
              </div>
            </div>
            <div class="metric-box metric-box--soft">
              <div class="metric-box__content">
                <span>전역 예상 자산</span>
                <strong>{{ record.projectedAsset }}</strong>
              </div>
            </div>
          </div>

          <footer class="record-card__footer">
            <DetailLinkButton
              class="record-card__link"
              @click="openDetail(record)"
            >
              상세보기
            </DetailLinkButton>
          </footer>
        </article>
      </li>
    </ul>
    <p
      v-else
      class="record-list__empty"
    >
      표시할 분석 기록이 없어요.
    </p>
  </section>
</template>

<style scoped>
.analysis-history {
  display: flex;
  flex-direction: column;
  gap: 20px;
  min-height: 100%;
  padding: 10px 20px calc(var(--page-bottom-navigation-space) + var(--safe-area-bottom) + 20px);
  background: var(--ui-background);
}

.summary-card {
  display: flex;
  flex-direction: column;
  padding: 20px 20px 16px;
  border-radius: 28px;
  background:
    linear-gradient(
      212deg,
      rgb(130 255 175 / 50%) 0%,
      rgb(255 241 186 / 50%) 79%,
      rgb(255 231 222 / 50%) 119%
    ),
    var(--white);
}

.summary-card__label {
  color: var(--gray-600);
  font-size: 14px;
  font-weight: var(--weight-bold);
  line-height: 1.5;
}

.summary-card__count {
  color: var(--ui-text);
  font-size: 32px;
  font-weight: var(--weight-bold);
  letter-spacing: -0.32px;
  line-height: 1.4;
}

.summary-card__stats {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 60px;
  padding: 10px 0;
  border-radius: 14px;
  background: var(--white);
}

.summary-card__stat {
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: center;
  color: var(--ui-sub-title);
}

.summary-card__stat span {
  font-size: 12px;
  line-height: 1.5;
}

.summary-card__stat strong {
  font-size: 14px;
  font-weight: var(--weight-bold);
  line-height: 1.5;
}

.summary-card__divider {
  width: 1px;
  height: 24px;
  flex: 0 0 auto;
  background: var(--ui-sub-title-light);
}

.history-tabs {
  display: flex;
  gap: 14px;
  padding: 0 20px;
}

.history-tabs button {
  flex: 1;
  padding: 10px 0;
  border: 0;
  border-bottom: 2px solid transparent;
  border-radius: 14px 14px 0 0;
  background: transparent;
  color: var(--ui-sub-title-light);
  cursor: pointer;
  font: inherit;
  font-size: 14px;
  font-weight: var(--weight-bold);
  line-height: 1.5;
}

.history-tabs .history-tabs__tab--active {
  border-bottom-color: var(--green-700);
  background: rgb(243 255 248 / 20%);
  color: var(--green-700);
}

.record-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 0;
  margin: 0;
  list-style: none;
}

.record-card {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 20px 16px;
  border-radius: 20px;
  background: var(--white);
}

.record-card--applied {
  padding: 22px 18px;
  border: 2px solid var(--green-500);
}

.record-card__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}

.record-card__heading strong {
  color: var(--ui-sub-title);
  font-size: 14px;
  font-weight: var(--weight-bold);
  line-height: 1.5;
}

.record-card__heading p {
  padding-top: 4px;
  color: #888;
  font-size: 12px;
  line-height: 1.3;
}

.record-card__badges {
  display: flex;
  align-items: center;
  gap: 4px;
}

.pill {
  padding: 2px 10px;
  border-radius: var(--radius-full);
  font-size: 12px;
  font-weight: var(--weight-bold);
  line-height: 1.5;
  white-space: nowrap;
}

.pill--gray {
  background: var(--gray-200);
  color: var(--gray-600);
}

.pill--olive {
  background: var(--olive-100);
  color: var(--olive-500);
}

.pill--green {
  background: var(--green-100);
  color: #22c55e;
}

.pill--orange {
  background: var(--orange-50);
  color: var(--orange-600);
}

.record-card__summary {
  color: #888;
  font-size: 12px;
  line-height: 1.3;
}

.record-card__metrics {
  display: flex;
  gap: 4px;
}

.metric-box {
  display: flex;
  flex: 1;
  min-width: 0;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: 4px;
  padding: 10px 8px;
  border-radius: 10px;
  background: var(--ui-light-gray);
}

.metric-box .pill {
  padding: 2px 8px;
}

.metric-box--soft {
  background: rgb(236 236 236 / 20%);
}

.metric-box__content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.metric-box__content > span {
  color: #888;
  font-size: 14px;
  line-height: 1.5;
  white-space: nowrap;
}

.metric-box__content strong {
  color: var(--ui-sub-title);
  font-size: 14px;
  font-weight: var(--weight-bold);
  line-height: 1.5;
  white-space: nowrap;
}

.metric-box__ratios {
  display: flex;
  flex-wrap: wrap;
}

.record-card__footer {
  display: flex;
  justify-content: flex-end;
}

.record-card__link {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: #7a7a7a;
  font-size: 14px;
  font-weight: var(--weight-bold);
  line-height: 1.5;
}

.record-card__link img {
  width: 7px;
  height: 11px;
}

.record-list__empty {
  display: grid;
  min-height: 240px;
  place-items: center;
  color: var(--ui-sub-title);
  font-size: 14px;
}

.record-list__error {
  align-content: center;
  gap: 12px;
}

.record-list__error button {
  padding: 9px 18px;
  border: 0;
  border-radius: var(--radius-full);
  background: var(--green-100);
  color: var(--green-800);
  cursor: pointer;
  font: inherit;
  font-weight: var(--weight-bold);
}

@media (prefers-reduced-motion: no-preference) {
  .record-card__link {
    transition: transform var(--duration-fast) var(--ease-default);
  }

  .record-card__link:active {
    transform: scale(0.98);
  }
}
</style>
