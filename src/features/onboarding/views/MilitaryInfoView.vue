<script setup>
import { nextTick, ref, watch } from 'vue'
import { useRouter } from 'vue-router'

import calendarIcon from '@/assets/icons/CalenderIcon.svg'
import BaseButton from '@/common/components/buttons/BaseButton.vue'
import { getApiErrorMessage } from '@/common/api/errorMessage'
import MiniEventCalendar from '@/features/dashboard/components/MiniEventCalendar.vue'
import OnboardingStepIntro from '@/common/components/layout/OnboardingStepIntro.vue'
import RankInsignia from '@/features/onboarding/components/RankInsignia.vue'
import { useOnboardingStore } from '@/features/onboarding/stores/onboarding.store'

const router = useRouter()
const onboarding = useOnboardingStore()
const loading = ref(false)
const calendarOpen = ref(false)
const militaryContentRef = ref(null)
const enlistmentDateSectionRef = ref(null)
const previousContentScrollTop = ref(0)
const errorMessage = ref('')
const militaryTypes = [
  { value: 'ARMY', icon: '🪖', label: '육군', duration: '18개월' },
  { value: 'NAVY', icon: '⚓', label: '해군', duration: '20개월' },
  { value: 'AIR_FORCE', icon: '✈️', label: '공군', duration: '21개월' },
  { value: 'MARINE', icon: '🦅', label: '해병대', duration: '18개월' },
]
const soldierTypeCodes = {
  ARMY: 'ARMY',
  NAVY: 'NAVY',
  AIR_FORCE: 'AIRFORCE',
  MARINE: 'MARINE',
}
const ranks = [
  { value: 'PRIVATE', level: 1, label: '이병' },
  { value: 'PRIVATE_FIRST_CLASS', level: 2, label: '일병' },
  { value: 'CORPORAL', level: 3, label: '상병' },
  { value: 'SERGEANT', level: 4, label: '병장' },
]
const serviceMonthsByMilitaryType = {
  ARMY: 18,
  NAVY: 20,
  AIR_FORCE: 21,
  MARINE: 18,
}
const promotionMonthsByMilitaryType = {
  ARMY: { PRIVATE_FIRST_CLASS: 2, CORPORAL: 8, SERGEANT: 14 },
  NAVY: { PRIVATE_FIRST_CLASS: 2, CORPORAL: 8, SERGEANT: 14 },
  AIR_FORCE: { PRIVATE_FIRST_CLASS: 3, CORPORAL: 9, SERGEANT: 15 },
  MARINE: { PRIVATE_FIRST_CLASS: 2, CORPORAL: 8, SERGEANT: 14 },
}

const todayValue = toDateString(new Date())
const contentTopOffset = 20

function toDateString(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function formatDate(value) {
  if (!value) return '입대일을 선택해 주세요'
  return value.replaceAll('-', '. ')
}

async function selectEnlistmentDate(value) {
  onboarding.updateForm({ enlistmentDate: value })
  errorMessage.value = ''
  await closeCalendar()
}

function getEnlistmentScrollTop() {
  const content = militaryContentRef.value
  const section = enlistmentDateSectionRef.value
  if (!content || !section) return 0

  return Math.max(
    0,
    section.getBoundingClientRect().top - content.getBoundingClientRect().top + content.scrollTop,
  )
}

async function openCalendar() {
  const content = militaryContentRef.value
  previousContentScrollTop.value = content?.scrollTop || 0
  calendarOpen.value = true

  await nextTick()
  content?.scrollTo({
    top: Math.max(0, getEnlistmentScrollTop() - contentTopOffset),
    behavior: 'smooth',
  })
}

async function closeCalendar() {
  calendarOpen.value = false

  await nextTick()
  militaryContentRef.value?.scrollTo({
    top: previousContentScrollTop.value,
    behavior: 'smooth',
  })
}

function toggleCalendar() {
  if (calendarOpen.value) {
    closeCalendar()
    return
  }

  openCalendar()
}

function parseDateOnly(value) {
  const dateValue = String(value || '').trim()
  const dateParts = dateValue.split('-').map(Number)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateValue) || dateParts.length !== 3) return null

  const [year, month, day] = dateParts
  const date = new Date(year, month - 1, day)
  if (
    date.getFullYear() !== year ||
    date.getMonth() + 1 !== month ||
    date.getDate() !== day ||
    date > new Date()
  ) {
    return null
  }

  return date
}

function completedMonthsSince(date) {
  const today = new Date()
  let months = (today.getFullYear() - date.getFullYear()) * 12 + today.getMonth() - date.getMonth()

  if (today.getDate() < date.getDate()) months -= 1
  return Math.max(months, 0)
}

function rankByEnlistmentDate(value, militaryType) {
  const enlistmentDate = parseDateOnly(value)
  const promotionMonths = promotionMonthsByMilitaryType[militaryType]
  if (!enlistmentDate || !promotionMonths) return null

  const serviceMonths = serviceMonthsByMilitaryType[militaryType]
  const months = Math.min(completedMonthsSince(enlistmentDate), serviceMonths)
  if (months >= promotionMonths.SERGEANT) return 'SERGEANT'
  if (months >= promotionMonths.CORPORAL) return 'CORPORAL'
  if (months >= promotionMonths.PRIVATE_FIRST_CLASS) return 'PRIVATE_FIRST_CLASS'
  return 'PRIVATE'
}

watch(
  () => [onboarding.form.enlistmentDate, onboarding.form.militaryType],
  ([enlistmentDate, militaryType]) => {
    const rank = rankByEnlistmentDate(enlistmentDate, militaryType)
    if (rank && onboarding.form.rank !== rank) onboarding.updateForm({ rank })
  },
  { immediate: true },
)

async function next() {
  if (!onboarding.form.militaryType) {
    errorMessage.value = '군종을 선택해 주세요.'
    return
  }
  if (!onboarding.form.enlistmentDate) {
    errorMessage.value = '입대일을 입력해 주세요.'
    return
  }
  const enlistmentDate = String(onboarding.form.enlistmentDate).trim()
  const dateParts = enlistmentDate.split('-').map(Number)
  const parsedDate = new Date(`${enlistmentDate}T00:00:00`)
  const isValidDate =
    /^\d{4}-\d{2}-\d{2}$/.test(enlistmentDate) &&
    dateParts.length === 3 &&
    parsedDate.getFullYear() === dateParts[0] &&
    parsedDate.getMonth() + 1 === dateParts[1] &&
    parsedDate.getDate() === dateParts[2]

  if (!isValidDate) {
    errorMessage.value = '입대일이 올바르지 않습니다. 실제 입대한 날짜를 선택해 주세요.'
    return
  }
  if (parsedDate > new Date()) {
    errorMessage.value = '입대일은 오늘 이후 날짜로 입력할 수 없습니다.'
    return
  }

  loading.value = true
  errorMessage.value = ''
  try {
    await onboarding.saveMilitaryInfo({
      soldierType: soldierTypeCodes[onboarding.form.militaryType],
      rankName: ranks.find((rank) => rank.value === onboarding.form.rank)?.label,
      enlistmentDate: onboarding.form.enlistmentDate,
    })
    router.push({ name: 'preference-goal' })
  } catch (error) {
    errorMessage.value = getApiErrorMessage(
      error,
      '군 정보를 저장하지 못했어요. 입력 내용을 확인하고 다시 시도해 주세요.',
      'military',
    )
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <main class="step-page screen">
    <OnboardingStepIntro
      :step="3"
      title="군 정보 입력"
      description="전역 예정일과 자산 분석에 사용됩니다"
    />
    <section
      ref="militaryContentRef"
      class="military-content"
      :class="{ 'military-content--calendar-open': calendarOpen }"
    >
      <h2>군 종류</h2>
      <div class="military-grid">
        <button
          v-for="type in militaryTypes"
          :key="type.value"
          type="button"
          :class="{ selected: onboarding.form.militaryType === type.value }"
          @click="onboarding.form.militaryType = type.value"
        >
          <strong>
            <span class="military-type-icon">{{ type.icon }}</span>
            <span class="military-type-label">{{ type.label }}</span>
          </strong>
          <span class="military-duration">{{ type.duration }}</span>
        </button>
      </div>
      <h2>현재 계급</h2>
      <div class="rank-grid">
        <button
          v-for="rank in ranks"
          :key="rank.value"
          type="button"
          :class="{ selected: onboarding.form.rank === rank.value }"
          @click="onboarding.form.rank = rank.value"
        >
          <RankInsignia :level="rank.level" />
          <span class="rank-label">{{ rank.label }}</span>
        </button>
      </div>
      <p class="rank-help">
        군종과 입대일을 기준으로 자동 선택되며, 필요하면 직접 변경할 수 있습니다.
      </p>
      <div
        ref="enlistmentDateSectionRef"
        class="enlistment-date-section"
      >
        <h2>입대일</h2>
        <div class="date-picker">
          <button
            class="date-input"
            type="button"
            :aria-expanded="calendarOpen"
            aria-haspopup="dialog"
            @click="toggleCalendar"
          >
            <span :class="{ 'date-input-placeholder': !onboarding.form.enlistmentDate }">
              {{ formatDate(onboarding.form.enlistmentDate) }}
            </span>
            <img
              class="date-input-icon"
              :src="calendarIcon"
              alt=""
              aria-hidden="true"
            >
          </button>
          <MiniEventCalendar
            v-if="calendarOpen"
            class="date-picker-calendar"
            :events="[]"
            :max-date="todayValue"
            :selected-date="onboarding.form.enlistmentDate"
            aria-label="입대일 선택"
            @select="selectEnlistmentDate"
          />
        </div>
      </div>
      <p
        v-if="errorMessage"
        class="form-error"
      >
        {{ errorMessage }}
      </p>
    </section>
    <BaseButton
      class="military-next-button"
      variant="primary"
      size="lg"
      block
      :loading="loading"
      @click="next"
    >
      다음으로
    </BaseButton>
  </main>
</template>

<style scoped>
.military-content {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding-top: var(--space-20);
  padding-bottom: calc(56px + 40px + var(--safe-area-bottom, 0px));
  scroll-behavior: smooth;
}
.military-content--calendar-open {
  padding-bottom: 100dvh;
}
.step-page.screen {
  height: 100dvh;
  max-height: 100dvh;
  overflow: hidden;
}
.step-page > .onboarding-step-intro,
.step-page > .military-next-button {
  flex: 0 0 auto;
}
.military-next-button {
  position: fixed;
  z-index: var(--z-fab, 500);
  bottom: calc(20px + var(--safe-area-bottom, 0px));
  left: 50%;
  width: min(calc(100vw - 40px), calc(var(--design-mobile-width, 393px) - 40px));
  margin: 0;
  transform: translateX(-50%);
}
h2 {
  margin: 0 0 12px 9px;
  color: var(--olive-500);
  font-size: 15px;
}
h2:not(:first-child) {
  margin-top: var(--space-24);
}
.military-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-10);
}
.military-grid button {
  appearance: none;
  display: flex;
  width: 100%;
  max-width: 159px;
  flex-direction: column;
  align-items: center;
  justify-self: center;
  gap: var(--space-4);
  padding: 10px 15px;
  border: 1px solid transparent;
  border-radius: var(--radius-sm);
  background: var(--white, #fff);
  color: var(--gray-700, #616161);
}
.military-grid strong {
  display: flex;
  align-items: flex-start;
  gap: 2px;
  color: var(--gray-700, #616161);
  font-family: var(--body-body-small-bold-font-family, 'Pretendard-Bold', sans-serif);
  font-size: var(--body-body-small-bold-font-size, 14px);
  font-weight: var(--body-body-small-bold-font-weight, 700);
  line-height: var(--body-body-small-bold-line-height, 150%);
}
.military-grid button.selected,
.rank-grid button.selected {
  border-color: var(--green-600);
  background: var(--green-200);
}
.military-duration {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 2px 10px;
  border-radius: var(--radius-lg);
  background: var(--olive-50, #f6f7f5);
  color: var(--olive-300, #aebba7);
  font-family: var(--body-label-small-font-family, 'Pretendard', sans-serif);
  font-size: var(--body-label-small-font-size, 12px);
  font-weight: var(--body-label-small-font-weight, 400);
  line-height: var(--body-label-small-line-height, 150%);
}
.military-grid button.selected .military-duration {
  background: var(--green-50, #f3fff8);
  color: var(--green-700, #20ba5c);
}
.rank-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--space-8);
}
.rank-grid button {
  display: flex;
  min-width: 0;
  flex: 1;
  align-items: center;
  justify-content: center;
  gap: var(--space-4);
  padding: 10px 20px;
  overflow: hidden;
  border: 1px solid transparent;
  border-radius: 15px;
  background: var(--white, #fff);
  color: var(--gray-500, #9e9e9e);
  font-family: var(--body-body-small-bold-font-family, 'Pretendard-Bold', sans-serif);
  font-size: var(--body-body-small-bold-font-size, 14px);
  font-weight: var(--body-body-small-bold-font-weight, 700);
  line-height: var(--body-body-small-bold-line-height, 150%);
}
.rank-label {
  display: inline-flex;
  height: 14px;
  align-items: center;
  line-height: 14px;
  white-space: nowrap;
}
.rank-help {
  margin: 8px 9px 0;
  color: var(--gray-600);
  font-size: var(--text-xs);
}
.enlistment-date-section {
  margin-top: var(--space-24);
}
.date-picker {
  position: relative;
  width: calc(100% - 8px);
  margin-left: var(--space-4);
}
.date-input {
  position: relative;
  display: flex;
  width: 100%;
  min-height: 58px;
  align-items: center;
  justify-content: space-between;
  padding: 0 52px 0 16px;
  border: 0;
  border-radius: 18px;
  background: var(--white);
  color: var(--gray-800);
  cursor: pointer;
  font-size: var(--text-md);
  font-weight: 700;
  text-align: left;
}
.date-input-placeholder {
  color: var(--gray-400, #bdbdbd);
}
.date-input-icon {
  position: absolute;
  top: 50%;
  right: 20px;
  width: 18px;
  height: 20px;
  pointer-events: none;
  transform: translateY(-50%);
}
.date-picker-calendar {
  position: relative;
  z-index: 10;
  width: 100%;
  margin-top: var(--space-8);
}
.date-picker-calendar :deep(.mini-event-calendar) {
  border: 1px solid var(--gray-100, #f1f1f1);
}
</style>
