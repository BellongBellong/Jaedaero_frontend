<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'

const emit = defineEmits(['close', 'save'])

const title = ref('')
const startDate = ref('')
const endDate = ref('')
const calendarOpen = ref(false)
const sheet = ref(null)
const dragOffset = ref(0)
const dragging = ref(false)
const closing = ref(false)

const today = new Date()
const visibleYear = ref(today.getFullYear())
const visibleMonth = ref(today.getMonth())

const calendarDays = computed(() => {
  const firstDay = new Date(visibleYear.value, visibleMonth.value, 1).getDay()
  const lastDate = new Date(visibleYear.value, visibleMonth.value + 1, 0).getDate()

  return [
    ...Array.from({ length: firstDay }, (_, index) => ({ key: `blank-${index}` })),
    ...Array.from({ length: lastDate }, (_, index) => {
      const day = index + 1
      const value = toDateString(new Date(visibleYear.value, visibleMonth.value, day))

      return { key: value, day, value }
    }),
  ]
})

const durationDays = computed(() => {
  if (!startDate.value) return 0

  const start = parseDate(startDate.value)
  const end = parseDate(endDate.value || startDate.value)
  return Math.floor((end - start) / 86_400_000) + 1
})

const formattedSchedule = computed(() => {
  if (!startDate.value) return '날짜를 선택해 주세요'

  const start = formatFullDate(startDate.value)
  if (!endDate.value || endDate.value === startDate.value) return `${start} (1일)`

  return `${start} ~ ${formatFullDate(endDate.value)} (${durationDays.value}일)`
})

const canSave = computed(() => title.value.trim().length > 0 && Boolean(startDate.value))

function parseDate(value) {
  const [year, month, day] = value.split('-').map(Number)
  return new Date(year, month - 1, day)
}

function toDateString(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function formatFullDate(value) {
  return value.replaceAll('-', '. ')
}

function selectDate(value) {
  if (!startDate.value || endDate.value) {
    startDate.value = value
    endDate.value = ''
    return
  }

  if (value < startDate.value) {
    endDate.value = startDate.value
    startDate.value = value
  } else {
    endDate.value = value
  }
}

function isRangeStart(value) {
  return value === startDate.value
}

function isRangeEnd(value) {
  return value === (endDate.value || startDate.value)
}

function isInRange(value) {
  return Boolean(
    startDate.value && endDate.value && value > startDate.value && value < endDate.value,
  )
}

function changeMonth(offset) {
  const nextMonth = new Date(visibleYear.value, visibleMonth.value + offset, 1)
  visibleYear.value = nextMonth.getFullYear()
  visibleMonth.value = nextMonth.getMonth()
}

function save() {
  if (!canSave.value) return

  emit('save', {
    title: title.value.trim(),
    date: startDate.value,
    startDate: startDate.value,
    endDate: endDate.value || startDate.value,
    durationDays: durationDays.value,
  })
}

function closeSheet() {
  if (closing.value) return

  closing.value = true
  dragOffset.value = sheet.value?.offsetHeight || 520
  window.setTimeout(() => emit('close'), 220)
}

function handleKeydown(event) {
  if (event.key === 'Escape') closeSheet()
}

function startDrag(event) {
  dragging.value = true
  event.currentTarget.setPointerCapture(event.pointerId)
  event.currentTarget.dataset.startY = String(event.clientY)
}

function moveDrag(event) {
  if (!dragging.value) return

  const startY = Number(event.currentTarget.dataset.startY)
  dragOffset.value = Math.max(0, event.clientY - startY)
}

function endDrag(event) {
  if (!dragging.value) return

  dragging.value = false
  event.currentTarget.releasePointerCapture(event.pointerId)

  if (dragOffset.value >= 90) {
    closeSheet()
  } else {
    dragOffset.value = 0
  }
}

onMounted(async () => {
  document.body.style.overflow = 'hidden'
  window.addEventListener('keydown', handleKeydown)
  await nextTick()
})

onBeforeUnmount(() => {
  document.body.style.overflow = ''
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <div
    class="event-sheet-backdrop"
    :class="{ 'event-sheet-backdrop--closing': closing }"
    @click.self="closeSheet"
  >
    <section
      ref="sheet"
      class="event-sheet"
      :class="{ 'event-sheet--dragging': dragging }"
      :style="{ transform: `translateY(${dragOffset}px)` }"
      role="dialog"
      aria-modal="true"
      aria-labelledby="event-sheet-title"
    >
      <div
        class="event-sheet__drag-area"
        aria-label="아래로 밀어 이벤트 추가 닫기"
        @pointerdown="startDrag"
        @pointermove="moveDrag"
        @pointerup="endDrag"
        @pointercancel="endDrag"
      >
        <span />
      </div>

      <div class="event-sheet__body">
        <h2 id="event-sheet-title">
          이벤트 추가하기
        </h2>

        <div class="event-sheet__fields">
          <label>
            <span>이벤트 명</span>
            <input
              v-model="title"
              type="text"
              maxlength="20"
              placeholder="예: 외박"
            >
          </label>

          <div class="event-sheet__schedule">
            <span>일정</span>
            <button
              class="event-sheet__date-button"
              :class="{ 'event-sheet__date-button--selected': startDate }"
              type="button"
              :aria-expanded="calendarOpen"
              aria-controls="event-range-calendar"
              @click="calendarOpen = !calendarOpen"
            >
              <span>{{ formattedSchedule }}</span>
              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  d="M7 2v3M17 2v3M3.5 9h17M5.5 4h13a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z"
                />
                <path d="M8 13h3v3H8z" />
              </svg>
            </button>

            <div
              v-if="calendarOpen"
              id="event-range-calendar"
              class="event-calendar"
            >
              <header>
                <button
                  type="button"
                  aria-label="이전 달"
                  @click="changeMonth(-1)"
                >
                  ‹
                </button>
                <strong>{{ visibleYear }}년 {{ visibleMonth + 1 }}월</strong>
                <button
                  type="button"
                  aria-label="다음 달"
                  @click="changeMonth(1)"
                >
                  ›
                </button>
              </header>

              <div class="event-calendar__weekdays">
                <span
                  v-for="weekday in ['일', '월', '화', '수', '목', '금', '토']"
                  :key="weekday"
                >{{ weekday }}</span>
              </div>

              <div class="event-calendar__days">
                <template
                  v-for="day in calendarDays"
                  :key="day.key"
                >
                  <span v-if="!day.value" />
                  <button
                    v-else
                    type="button"
                    :class="{
                      'event-calendar__day--range': isInRange(day.value),
                      'event-calendar__day--start': isRangeStart(day.value),
                      'event-calendar__day--end': isRangeEnd(day.value),
                    }"
                    :aria-label="`${day.value} 선택`"
                    @click="selectDate(day.value)"
                  >
                    {{ day.day }}
                  </button>
                </template>
              </div>

              <p>
                {{
                  endDate
                    ? `${formatFullDate(startDate)} ~ ${formatFullDate(endDate)} · 총 ${durationDays}일`
                    : startDate
                      ? '종료 날짜를 선택해 주세요.'
                      : '시작 날짜를 선택해 주세요.'
                }}
              </p>
              <button
                v-if="startDate"
                class="event-calendar__confirm"
                type="button"
                @click="calendarOpen = false"
              >
                선택 완료
              </button>
            </div>
          </div>
        </div>

        <button
          class="event-sheet__save"
          type="button"
          :disabled="!canSave"
          @click="save"
        >
          추가하기
        </button>
      </div>
    </section>
  </div>
</template>

<style scoped>
.event-sheet-backdrop {
  position: fixed;
  z-index: 60;
  inset: 0 max(0px, calc((100vw - var(--mobile-width)) / 2));
  display: flex;
  align-items: flex-end;
  justify-content: center;
  background: rgb(0 0 0 / 45%);
  opacity: 1;
  transition: opacity 220ms ease;
}

.event-sheet-backdrop--closing {
  opacity: 0;
}

.event-sheet {
  width: 100%;
  max-height: min(88dvh, 720px);
  overflow-y: auto;
  border-radius: 50px 50px 0 0;
  background: var(--white);
  box-shadow: 0 -16px 40px rgb(0 0 0 / 15%);
  transition: transform 220ms ease;
  animation: event-sheet-enter 260ms ease-out;
  overscroll-behavior: contain;
}

.event-sheet--dragging {
  transition: none;
}

.event-sheet__drag-area {
  display: grid;
  height: 30px;
  cursor: grab;
  place-items: center;
  touch-action: none;
}

.event-sheet__drag-area:active {
  cursor: grabbing;
}

.event-sheet__drag-area span {
  width: 36px;
  height: 5px;
  border-radius: 100px;
  background: var(--gray-200);
}

.event-sheet__body {
  display: flex;
  min-height: 433px;
  flex-direction: column;
  padding: 5px 30px max(24px, env(safe-area-inset-bottom));
}

.event-sheet h2 {
  margin: 0 0 28px;
  color: var(--gray-900);
  font-size: 20px;
  text-align: center;
}

.event-sheet__fields {
  display: grid;
  gap: 25px;
}

.event-sheet label,
.event-sheet__schedule {
  display: grid;
  gap: 10px;
}

.event-sheet label > span,
.event-sheet__schedule > span {
  padding: 0 10px;
  color: var(--olive-400);
  font-size: 16px;
  font-weight: var(--weight-bold);
}

.event-sheet input,
.event-sheet__date-button {
  width: 100%;
  min-height: 56px;
  padding: 0 20px;
  border: 2px solid transparent;
  border-radius: 20px;
  outline: none;
  background: var(--gray-100);
  color: var(--gray-900);
  font: inherit;
  font-size: 14px;
  font-weight: var(--weight-bold);
}

.event-sheet input::placeholder {
  color: var(--gray-400);
}

.event-sheet input:focus,
.event-sheet__date-button:focus-visible,
.event-sheet__date-button--selected {
  border-color: var(--green-500);
  background: var(--white);
}

.event-sheet__date-button {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  color: var(--gray-400);
  cursor: pointer;
  text-align: left;
}

.event-sheet__date-button--selected {
  color: var(--gray-900);
}

.event-sheet__date-button > span {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.event-sheet__date-button svg {
  width: 24px;
  height: 24px;
  flex: 0 0 auto;
  fill: none;
  stroke: var(--gray-600);
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 2;
}

.event-calendar {
  padding: 14px;
  border: 1px solid var(--gray-200);
  border-radius: 20px;
  background: var(--white);
  box-shadow: 0 12px 30px rgb(51 51 51 / 9%);
}

.event-calendar header {
  display: grid;
  grid-template-columns: 32px 1fr 32px;
  align-items: center;
  margin-bottom: 10px;
  text-align: center;
}

.event-calendar header button {
  border: 0;
  background: transparent;
  color: var(--gray-700);
  cursor: pointer;
  font-size: 24px;
}

.event-calendar header strong {
  color: var(--gray-900);
  font-size: 14px;
}

.event-calendar__weekdays,
.event-calendar__days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  text-align: center;
}

.event-calendar__weekdays {
  margin-bottom: 5px;
  color: var(--gray-400);
  font-size: 11px;
}

.event-calendar__days > span,
.event-calendar__days > button {
  aspect-ratio: 1;
}

.event-calendar__days > button {
  border: 0;
  border-radius: 50%;
  background: transparent;
  color: var(--gray-700);
  cursor: pointer;
  font-size: 12px;
}

.event-calendar__days > .event-calendar__day--range {
  border-radius: 0;
  background: var(--green-100);
  color: var(--green-700);
}

.event-calendar__days > .event-calendar__day--start,
.event-calendar__days > .event-calendar__day--end {
  border-radius: 50%;
  background: var(--green-500);
  color: var(--gray-900);
  font-weight: var(--weight-bold);
}

.event-calendar p {
  margin: 10px 0 0;
  color: var(--green-700);
  font-size: 11px;
  text-align: center;
}

.event-calendar__confirm {
  display: block;
  padding: 7px 14px;
  margin: 10px auto 0;
  border: 0;
  border-radius: 999px;
  background: var(--green-100);
  color: var(--green-700);
  cursor: pointer;
  font-size: 12px;
  font-weight: var(--weight-bold);
}

.event-sheet__save {
  width: 100%;
  min-height: 56px;
  margin-top: auto;
  border: 0;
  border-radius: 28px;
  background: var(--green-500);
  color: var(--gray-900);
  cursor: pointer;
  font-size: 18px;
  font-weight: var(--weight-bold);
}

.event-sheet__save:disabled {
  background: var(--gray-200);
  color: var(--gray-400);
  cursor: default;
}

@keyframes event-sheet-enter {
  from {
    transform: translateY(100%);
  }

  to {
    transform: translateY(0);
  }
}
</style>
