<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { useTodayMarketReport } from '@/features/market-report/composables/useTodayMarketReport'
import { useTodayMarketIndicators } from '@/features/market-report/composables/useTodayMarketIndicators'
import {
  formatReportDate,
  formatValidUntil,
  mapMarketIndicators,
  mapMarketSources,
} from '@/features/market-report/mappers/marketReport.mapper'
import { useMissionCompletion } from '@/features/missions/composables/useMissionCompletion'

const route = useRoute()
const router = useRouter()
const { completeMissionAfterLoad } = useMissionCompletion(route, router, 'VIEW_MARKET_REPORT')
const sourcesExpanded = ref(false)

const fallbackMarketRows = [
  { label: '코스피', value: '6,299.66', change: '▲ 40.89 · 0.65%', tone: 'positive' },
  { label: '코스닥', value: '854.47', change: '▲ 55.66 · 6.97%', tone: 'positive' },
  { label: '미국채 10년', value: '4.650%', change: '▼ 0.04% · 0.85%', tone: 'negative' },
  { label: '원/달러', value: '1,415.3원', change: '등락 정보 없음', tone: 'neutral' },
]

const fallbackSourceLinks = [
  {
    title: 'Oil and gold stay near highs - InvestingLive',
    url: 'https://investinglive.com/news/investinglive-asia-pacific-financial-market-news-oil-and-gold-stay-near-highs/',
  },
  {
    title: 'Gold rises for third straight session - Reuters',
    url: 'https://news.google.com/rss/articles/CBMipwFBVV95cUxOQ3pfajk5NldmMDliSlhNU3ZYd1J6UGt3cWM4ZHBzTkxnYTVGbnVWU0ZOVFFqLUk2eFYyQnhxdUxiUFp5Y0lXTnpEOGIwMHBveTR5bzBvZmxjWTA4TmR6OUt0U1ZSd2V0dDhkMlg4TkpFdlFCSEtJN3BXYXJQMFZLZDgyZjR6UTRXeU5fRFZ1MHM1WXpCMEtTOF9CNmptQTJmNzBQN1JyMA?oc=5',
  },
  {
    title: 'Oil prices rise, Asia stocks drift - Reuters',
    url: 'https://news.google.com/rss/articles/CBMigwFBVV95cUxPRnpVTlc5WDU3ZUFOMTJjSFRLNGFCWUItblV4clc0UnVXUi05VVBaRkFleHpsdWtmcl9YZDRtN3BkaDhqUy1PTWx1aDhjalNDc09RNGh5eDFYN2FnTGxraUlhRWtFUnl0UTJrbV82Yi1CaFEyNmNwaHlvQVdobElUNEZVaw?oc=5',
  },
  {
    title: 'What to watch in the week ahead - CNBC',
    url: 'https://www.cnbc.com/2026/08/09/here-are-the-2-big-things-were-watching-in-the-stock-market-in-the-week-ahead.html',
  },
]

const fallbackSummary =
  '코스피와 코스닥이 상승세를 보인 가운데 원자재 가격 강세와 7월 인플레이션 지표에 시장의 관심이 집중되고 있습니다.'
const fallbackContent =
  '국내 증시에서는 삼성전자가 약 3.6% 상승하면서 코스피가 2일 연속 상승세를 나타냈습니다. 유가와 금 가격은 높은 수준을 유지하고 있으며, 시장은 향후 발표될 7월 인플레이션 데이터와 연준의 9월 통화정책 회의에 주목하고 있습니다.'

const { report, load } = useTodayMarketReport()
const { report: indicatorReport, load: loadIndicators } = useTodayMarketIndicators()
const marketRows = computed(() =>
  mapMarketIndicators(indicatorReport.value?.indicators, fallbackMarketRows),
)
const sourceLinks = computed(() => mapMarketSources(report.value?.sources, fallbackSourceLinks))
const reportDate = computed(() => formatReportDate(report.value) || '2026. 08. 11 18시 기준')
const marketSummary = computed(() => report.value?.summary || fallbackSummary)
const marketContent = computed(() => report.value?.content || fallbackContent)
const validUntilNotice = computed(
  () => formatValidUntil(report.value) || '8월 12일 17시까지 볼 수 있어요.',
)

function openSource(url) {
  const sourceWindow = window.open(url, '_blank')
  if (sourceWindow) sourceWindow.opener = null
}

onMounted(() => {
  completeMissionAfterLoad()
  load()
  loadIndicators()
})
</script>

<template>
  <section class="financial-report-screen">
    <article class="market-panel report-panel">
      <header class="report-panel__header">
        <div class="report-title-row">
          <h2>주요 시장 지표</h2>
          <span class="beta-badge">BETA</span>
        </div>
        <p>{{ reportDate }}</p>
      </header>

      <dl class="market-grid">
        <div
          v-for="row in marketRows"
          :key="row.label"
          class="market-grid__item"
        >
          <dt>{{ row.label }}</dt>
          <dd>{{ row.value }}</dd>
          <span :class="`market-grid__change--${row.tone}`">{{ row.change }}</span>
        </div>
      </dl>

      <p class="market-summary">
        <span
          class="market-summary__icon"
          aria-hidden="true"
        >💡</span>
        <span>{{ marketSummary }}</span>
      </p>

      <div class="explanation-block">
        <h2>AI 시장 해설</h2>
        <p>
          {{ marketContent }}
        </p>
      </div>
    </article>

    <section class="sources-section report-panel">
      <button
        class="sources-toggle"
        type="button"
        :aria-expanded="sourcesExpanded"
        @click="sourcesExpanded = !sourcesExpanded"
      >
        <span
          class="sources-toggle__chevron"
          :class="{ 'sources-toggle__chevron--expanded': sourcesExpanded }"
          aria-hidden="true"
        />
        참고한 기사 및 데이터 출처
      </button>

      <div
        v-if="sourcesExpanded"
        class="sources-card"
      >
        <a
          v-for="source in sourceLinks"
          :key="source.url"
          :href="source.url"
          target="_blank"
          rel="noopener noreferrer"
          @click.prevent="openSource(source.url)"
        >
          {{ source.title }}
        </a>
      </div>
    </section>

    <p
      v-if="sourcesExpanded"
      class="sources-notice"
    >
      해당 정보들은 AI가 생성한 정보들이에요.<br>{{ validUntilNotice }}
    </p>
  </section>
</template>

<style scoped>
.financial-report-screen {
  display: flex;
  min-height: 100%;
  flex-direction: column;
  gap: 10px;
  padding: 10px 20px calc(var(--page-bottom-navigation-space) + var(--safe-area-bottom) + 40px);
  color: var(--gray-900);
}

.report-panel {
  border: 1px solid rgb(255 255 255 / 90%);
  border-radius: 24px;
  background: rgb(255 255 255 / 78%);
}

.market-panel {
  padding: 21px;
  box-shadow: 0 8px 18px rgb(100 151 120 / 7%);
}

.report-panel__header h2,
.explanation-block h2 {
  color: var(--gray-600);
  font-family: var(--font-body);
  font-size: 13px;
  font-weight: var(--weight-bold);
  line-height: 1.5;
}

.report-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.report-panel__header p {
  padding-top: 4px;
  color: #888;
  font-size: 12px;
  line-height: 1.5;
}

.beta-badge {
  padding: 2px 9px;
  border-radius: var(--radius-full);
  background: var(--olive-100);
  color: var(--olive-500);
  font-size: 10px;
  font-weight: var(--weight-bold);
}

.market-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 17px 16px;
  padding: 16px 4px 12px;
}

.market-grid__item {
  min-width: 0;
}

.market-grid dt {
  color: var(--gray-600);
  font-size: 12px;
  font-weight: var(--weight-bold);
  line-height: 1.4;
}

.market-grid dd {
  padding-top: 4px;
  color: var(--gray-900);
  font-size: 14px;
  font-weight: var(--weight-bold);
  line-height: 1.35;
}

.market-grid__item > span {
  display: block;
  padding-top: 2px;
  font-size: 11px;
  font-weight: var(--weight-regular);
  line-height: 1.35;
}

.market-grid__change--positive {
  color: var(--green-600);
}

.market-grid__change--negative {
  color: var(--orange-500);
}

.market-grid__change--neutral {
  color: var(--gray-500);
}

.market-summary {
  display: flex;
  align-items: flex-start;
  gap: 5px;
  padding: 11px 12px;
  border-radius: 14px;
  background: var(--green-100);
  color: var(--gray-600);
  font-size: 11px;
  line-height: 1.6;
}

.market-summary__icon {
  flex: 0 0 auto;
  font-size: 12px;
  line-height: 1.6;
}

.market-summary > span:last-child {
  font-weight: var(--weight-semibold);
}

.explanation-block {
  padding-top: 16px;
}

.explanation-block h2 {
  font-size: 12px;
}

.explanation-block p {
  padding-top: 8px;
  color: var(--gray-600);
  font-size: 12px;
  line-height: 1.65;
}

.sources-section {
  display: grid;
  gap: 0;
  overflow: hidden;
  padding: 0;
}

.sources-toggle {
  display: flex;
  width: 100%;
  min-height: 50px;
  align-items: center;
  gap: 9px;
  padding: 0 16px;
  border: 0;
  border-radius: 24px;
  background: transparent;
  color: var(--gray-500);
  font-size: 12px;
  font-weight: var(--weight-semibold);
  line-height: 1;
  text-align: left;
}

.sources-toggle__chevron {
  width: 0;
  height: 0;
  flex: 0 0 auto;
  border-top: 4px solid transparent;
  border-bottom: 4px solid transparent;
  border-left: 6px solid currentColor;
  transform-origin: 45% 50%;
  transition: transform 160ms ease;
}

.sources-toggle__chevron--expanded {
  transform: rotate(90deg);
}

.sources-card {
  display: grid;
  padding: 2px 21px 26px;
}

.sources-card a {
  display: block;
  padding: 10px 0;
  color: var(--green-600);
  font-size: 11px;
  font-weight: var(--weight-semibold);
  line-height: 1.45;
  text-decoration: underline;
  text-underline-offset: 2px;
}

.sources-card a + a {
  border-top: 1px solid var(--gray-200);
}

.sources-notice {
  padding: 0 16px;
  color: var(--gray-500);
  font-size: 11px;
  line-height: 1.5;
  text-align: center;
}

@media (prefers-reduced-motion: no-preference) {
  .sources-toggle {
    transition: transform var(--duration-fast) var(--ease-default);
  }

  .sources-toggle:active {
    transform: scale(0.985);
  }
}
</style>
