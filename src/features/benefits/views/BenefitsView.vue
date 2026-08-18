<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'

import arrowIcon from '@/assets/icons/arrow.svg'
import CommonTabs from '../../../common/components/navigation/CommonTabs.vue'
import BenefitCategoryLabel from '@/features/benefits/components/BenefitCategoryLabel.vue'
import { benefitExamples } from '@/features/benefits/mocks/benefits.mock'
import {
  normalizeBenefitCategory,
  normalizeBenefits,
} from '@/features/benefits/utils/benefitMapper'

const route = useRoute()

const categoryNames = ['전체', '카드', '교통', '여가', '자기계발', '숙박', '기타']
const categoryOptions = categoryNames.map((category) => ({ label: category, value: category }))
const benefits = ref([])
const loading = ref(true)
const activeCategory = ref('전체')
const expandedId = ref(null)

const filteredBenefits = computed(() =>
  activeCategory.value === '전체'
    ? benefits.value
    : benefits.value.filter((benefit) => benefit.category === activeCategory.value),
)

const groupedBenefits = computed(() => {
  const groups = new Map()
  filteredBenefits.value.forEach((benefit) => {
    const category = normalizeBenefitCategory(benefit.category)
    if (!groups.has(category)) groups.set(category, [])
    groups.get(category).push(benefit)
  })
  return categoryNames
    .filter((category) => category !== '전체' && groups.has(category))
    .map((category) => ({
      category,
      items:
        activeCategory.value === '전체' ? groups.get(category).slice(0, 4) : groups.get(category),
    }))
})

function formatDate(value) {
  if (!value) return '-'
  const matched = String(value).match(/^(\d{4})-(\d{2})-(\d{2})/)
  return matched ? `${matched[1].slice(2)}.${matched[2]}.${matched[3]}` : value
}

function formatPeriod(benefit) {
  if (!benefit.validFrom && !benefit.validTo) return '-'
  return `${formatDate(benefit.validFrom)} ~ ${formatDate(benefit.validTo || benefit.validFrom)}`
}

function toggleBenefit(id) {
  expandedId.value = expandedId.value === id ? null : id
}

function showCategory(category) {
  expandedId.value = null
  activeCategory.value = category
  document.querySelector('.benefits-view')?.scrollIntoView({ block: 'start' })
}

function loadBenefits() {
  benefits.value = normalizeBenefits(benefitExamples)

  const selectedId = Array.isArray(route.query.benefitId)
    ? route.query.benefitId[0]
    : route.query.benefitId
  const selectedBenefit = benefits.value.find(
    (benefit) => String(benefit.id) === String(selectedId),
  )
  if (selectedBenefit) {
    activeCategory.value = selectedBenefit.category
    expandedId.value = selectedBenefit.id
  }

  loading.value = false
}

onMounted(loadBenefits)
</script>

<template>
  <main class="benefits-view screen content-screen app-page">
    <CommonTabs
      v-model="activeCategory"
      class="benefits-view__tabs"
      :items="categoryOptions"
      aria-label="혜택 카테고리"
      @update:model-value="expandedId = null"
    />

    <p
      v-if="loading"
      class="benefits-view__state"
    >
      군인 혜택을 불러오고 있어요.
    </p>

    <section
      v-for="group in groupedBenefits"
      :key="group.category"
      class="benefits-view__section"
    >
      <h2>{{ group.category }}</h2>
      <div class="benefits-view__grid">
        <article
          v-for="benefit in group.items"
          :key="benefit.id"
          class="benefits-view__item"
          :class="{ 'benefits-view__item--expanded': expandedId === benefit.id }"
        >
          <button
            type="button"
            class="benefits-view__summary"
            :aria-expanded="expandedId === benefit.id"
            @click="toggleBenefit(benefit.id)"
          >
            <BenefitCategoryLabel :category="benefit.category" />
            <span class="benefits-view__provider">{{ benefit.title }}</span>
            <strong>{{ benefit.discountSummary }}</strong>
          </button>

          <div
            v-if="expandedId === benefit.id"
            class="benefits-view__details"
          >
            <dl>
              <div>
                <dt>기간</dt>
                <dd>{{ formatPeriod(benefit) }}</dd>
              </div>
              <div>
                <dt>대상</dt>
                <dd>{{ benefit.target || '-' }}</dd>
              </div>
              <div>
                <dt>내용</dt>
                <dd>{{ benefit.content || '-' }}</dd>
              </div>
              <div class="benefits-view__details-stack">
                <dt>방법</dt>
                <dd>{{ benefit.method || '-' }}</dd>
              </div>
              <div class="benefits-view__details-stack benefits-view__details-last">
                <dt>유의사항</dt>
                <dd>{{ benefit.precautions || '-' }}</dd>
              </div>
            </dl>
          </div>
        </article>
      </div>
      <button
        v-if="activeCategory === '전체'"
        type="button"
        class="benefits-view__more"
        @click="showCategory(group.category)"
      >
        <span>{{ group.category }} 혜택 전체 보기</span>
        <img
          :src="arrowIcon"
          alt=""
        >
      </button>
    </section>

    <p
      v-if="!loading && !groupedBenefits.length"
      class="benefits-view__state"
    >
      해당 카테고리에 등록된 혜택이 없습니다.
    </p>
  </main>
</template>

<style scoped>
.benefits-view {
  display: flex;
  flex-direction: column;
  gap: var(--space-16);
  background: linear-gradient(180deg, var(--category-transport-100) 0%, var(--ui-background) 45%);
}
.benefits-view__tabs {
  margin-inline: calc(var(--layout-page-padding) * -1);
  width: calc(100% + var(--layout-page-padding) * 2);
  padding-inline: var(--layout-page-padding);
}
.benefits-view__section {
  display: flex;
  flex-direction: column;
  gap: var(--space-10);
}
.benefits-view__section h2 {
  margin: 0;
  color: var(--ui-sub-title);
  font-family: var(--body-body-small-bold-font-family);
  font-size: var(--body-body-small-bold-font-size);
  font-weight: var(--body-body-small-bold-font-weight);
  line-height: var(--body-body-small-bold-line-height);
}
.benefits-view__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  align-items: start;
  gap: var(--space-10);
}
.benefits-view__item {
  min-width: 0;
  min-height: 110px;
  overflow: hidden;
  border: 1px solid rgb(255 255 255 / 65%);
  border-radius: var(--radius-xl);
  background: var(--white);
  backdrop-filter: blur(18px);
}
.benefits-view__item--expanded {
  grid-column: 1 / -1;
}
.benefits-view__summary {
  display: flex;
  width: 100%;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--space-4);
  min-height: 110px;
  justify-content: center;
  padding: var(--space-20) var(--space-16);
  border: 0;
  background: transparent;
  text-align: left;
  cursor: pointer;
}
.benefits-view__provider {
  padding-top: var(--space-4);
  color: var(--ui-sub-title-light);
  font-family: var(--body-body-small-regular-font-family);
  font-size: var(--body-body-small-regular-font-size);
  font-weight: var(--body-body-small-regular-font-weight);
  line-height: var(--body-body-small-regular-line-height);
}
.benefits-view__summary > strong {
  color: var(--ui-sub-title);
  font-family: var(--body-body-small-bold-font-family);
  font-size: var(--body-body-small-bold-font-size);
  font-weight: var(--body-body-small-bold-font-weight);
  line-height: var(--body-body-small-bold-line-height);
}
.benefits-view__details {
  padding: 0 var(--space-16) var(--space-20);
}
.benefits-view__details dl {
  margin: 0;
}
.benefits-view__details dl > div {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 10px 0;
  border-bottom: 1px solid var(--ui-light-gray);
}
.benefits-view__details dt {
  flex: 0 0 auto;
  color: var(--gray-900);
  font-family: var(--body-body-xsmall-bold-font-family);
  font-size: var(--body-body-xsmall-bold-font-size);
  font-weight: var(--body-body-xsmall-bold-font-weight);
  line-height: var(--body-body-xsmall-bold-line-height);
}
.benefits-view__details dd {
  margin: 0;
  color: var(--gray-600);
  font-family: var(--body-body-small-regular-font-family);
  font-size: var(--body-body-small-regular-font-size);
  font-weight: var(--body-body-small-regular-font-weight);
  line-height: var(--body-body-small-regular-line-height);
  text-align: right;
  white-space: pre-line;
}
.benefits-view__details .benefits-view__details-stack {
  flex-direction: column;
  align-items: flex-start;
  gap: 6px;
}
.benefits-view__details .benefits-view__details-stack dd {
  text-align: left;
}
.benefits-view__details .benefits-view__details-last {
  border-bottom: 0;
  padding-bottom: 0;
}
.benefits-view__more {
  display: inline-flex;
  align-items: center;
  align-self: flex-end;
  gap: 2px;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--ui-sub-title);
  font-family: var(--body-body-small-regular-font-family);
  font-size: var(--body-body-small-regular-font-size);
  font-weight: var(--body-body-small-regular-font-weight);
  line-height: var(--body-body-small-regular-line-height);
  cursor: pointer;
}
.benefits-view__more img {
  width: 6px;
  height: 12px;
}
.benefits-view__state {
  margin: 0;
  padding: 48px 20px;
  color: var(--ui-sub-title);
  font-family: var(--body-body-small-regular-font-family);
  font-size: var(--body-body-small-regular-font-size);
  font-weight: var(--body-body-small-regular-font-weight);
  line-height: var(--body-body-small-regular-line-height);
  text-align: center;
}
</style>
