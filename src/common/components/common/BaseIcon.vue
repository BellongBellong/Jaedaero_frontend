<script setup>
import { computed, useId } from 'vue'

defineOptions({
  name: 'AppIcon',
})

const homeIcon = {
  paths: [{ d: 'M3 10.5 12 3l9 7.5' }, { d: 'M5 9.5V21h14V9.5' }, { d: 'M9 21v-7h6v7' }],
}
const chartIcon = {
  polylines: [{ points: '3 17 9 11 13 15 21 7' }],
  lines: [
    { x1: 14, y1: 7, x2: 21, y2: 7 },
    { x1: 21, y1: 7, x2: 21, y2: 14 },
  ],
}
const walletIcon = {
  paths: [{ d: 'M4 5h14a2 2 0 0 1 2 2v12H4a2 2 0 0 1-2-2V5.5A2.5 2.5 0 0 1 4.5 3H18' }],
  rects: [{ x: 14, y: 10, width: 8, height: 5, rx: 2 }],
}
const targetIcon = {
  circles: [
    { cx: 12, cy: 12, r: 8 },
    { cx: 12, cy: 12, r: 3 },
  ],
  lines: [{ x1: 14, y1: 10, x2: 21, y2: 3 }],
  polylines: [{ points: '17 3 21 3 21 7' }],
}
const userIcon = {
  circles: [{ cx: 12, cy: 8, r: 4 }],
  paths: [{ d: 'M4 21a8 8 0 0 1 16 0' }],
}
const arrowLeftIcon = {
  lines: [{ x1: 20, y1: 12, x2: 4, y2: 12 }],
  polylines: [{ points: '10 18 4 12 10 6' }],
}
const arrowRightIcon = {
  lines: [{ x1: 4, y1: 12, x2: 20, y2: 12 }],
  polylines: [{ points: '14 6 20 12 14 18' }],
}
const checkIcon = {
  polylines: [{ points: '4 12 9 17 20 6' }],
}
const infoIcon = {
  circles: [{ cx: 12, cy: 12, r: 9 }],
  lines: [
    { x1: 12, y1: 11, x2: 12, y2: 17 },
    { x1: 12, y1: 7, x2: 12.01, y2: 7 },
  ],
}
const alertIcon = {
  paths: [{ d: 'M10.3 3.6 2.4 18a2 2 0 0 0 1.8 3h15.6a2 2 0 0 0 1.8-3L13.7 3.6a2 2 0 0 0-3.4 0Z' }],
  lines: [
    { x1: 12, y1: 9, x2: 12, y2: 13 },
    { x1: 12, y1: 17, x2: 12.01, y2: 17 },
  ],
}
const searchIcon = {
  circles: [{ cx: 11, cy: 11, r: 7 }],
  lines: [{ x1: 16, y1: 16, x2: 21, y2: 21 }],
}
const eyeIcon = {
  paths: [{ d: 'M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z' }],
  circles: [{ cx: 12, cy: 12, r: 2.5 }],
}
const eyeOffIcon = {
  paths: [
    { d: 'M3 3l18 18' },
    { d: 'M10.6 6.2A10.4 10.4 0 0 1 12 6c6.5 0 10 6 10 6a16 16 0 0 1-2.2 2.9' },
    { d: 'M6.5 6.5C3.5 8.3 2 12 2 12s3.5 6 10 6a10 10 0 0 0 3.5-.6' },
  ],
}
const lockIcon = {
  rects: [{ x: 4, y: 10, width: 16, height: 11, rx: 2 }],
  paths: [{ d: 'M8 10V7a4 4 0 0 1 8 0v3' }],
}
const calendarIcon = {
  rects: [{ x: 3, y: 5, width: 18, height: 16, rx: 2 }],
  lines: [
    { x1: 8, y1: 3, x2: 8, y2: 7 },
    { x1: 16, y1: 3, x2: 16, y2: 7 },
    { x1: 3, y1: 10, x2: 21, y2: 10 },
  ],
}
const clockIcon = {
  circles: [{ cx: 12, cy: 12, r: 9 }],
  polylines: [{ points: '12 7 12 12 16 14' }],
}
const bankIcon = {
  polylines: [{ points: '3 9 12 3 21 9' }],
  lines: [
    { x1: 5, y1: 10, x2: 5, y2: 19 },
    { x1: 9.5, y1: 10, x2: 9.5, y2: 19 },
    { x1: 14.5, y1: 10, x2: 14.5, y2: 19 },
    { x1: 19, y1: 10, x2: 19, y2: 19 },
    { x1: 3, y1: 21, x2: 21, y2: 21 },
  ],
}
const creditCardIcon = {
  rects: [{ x: 2, y: 5, width: 20, height: 14, rx: 2 }],
  lines: [{ x1: 2, y1: 10, x2: 22, y2: 10 }],
}
const giftIcon = {
  rects: [
    { x: 3, y: 9, width: 18, height: 12, rx: 1 },
    { x: 2, y: 6, width: 20, height: 4, rx: 1 },
  ],
  lines: [{ x1: 12, y1: 6, x2: 12, y2: 21 }],
  paths: [{ d: 'M12 6H8.5A2.5 2.5 0 1 1 11 3.5Z' }, { d: 'M12 6h3.5A2.5 2.5 0 1 0 13 3.5Z' }],
}
const shieldIcon = {
  paths: [{ d: 'M12 3 20 6v5c0 5.2-3.3 8.6-8 10-4.7-1.4-8-4.8-8-10V6Z' }],
  polylines: [{ points: '8.5 12 11 14.5 16 9.5' }],
}
const starIcon = {
  paths: [{ d: 'm12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9Z' }],
}
const sparklesIcon = {
  paths: [
    { d: 'M12 3c.7 4.1 2.9 6.3 7 7-4.1.7-6.3 2.9-7 7-.7-4.1-2.9-6.3-7-7 4.1-.7 6.3-2.9 7-7Z' },
    { d: 'M19 16c.3 1.8 1.2 2.7 3 3-1.8.3-2.7 1.2-3 3-.3-1.8-1.2-2.7-3-3 1.8-.3 2.7-1.2 3-3Z' },
  ],
}
const linkIcon = {
  paths: [
    { d: 'M10 13a5 5 0 0 0 7.1.1l2-2A5 5 0 0 0 12 4l-1.1 1.1' },
    { d: 'M14 11a5 5 0 0 0-7.1-.1l-2 2A5 5 0 0 0 12 20l1.1-1.1' },
  ],
}
const bellIcon = {
  paths: [{ d: 'M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9Z' }, { d: 'M10 21h4' }],
}
const settingsIcon = {
  circles: [{ cx: 12, cy: 12, r: 3 }],
  paths: [
    {
      d: 'M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5V21h-4v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H3v-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.5V3h4v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.5 1h.1v4h-.1a1.7 1.7 0 0 0-1.5 1Z',
    },
  ],
}
const calculatorIcon = {
  rects: [{ x: 4, y: 2.5, width: 16, height: 19, rx: 2 }],
  paths: [{ d: 'M7.5 6h9v3h-9Z' }],
  circles: [
    { cx: 8, cy: 13, r: 0.7, fill: 'currentColor', stroke: 'none' },
    { cx: 12, cy: 13, r: 0.7, fill: 'currentColor', stroke: 'none' },
    { cx: 16, cy: 13, r: 0.7, fill: 'currentColor', stroke: 'none' },
    { cx: 8, cy: 17, r: 0.7, fill: 'currentColor', stroke: 'none' },
    { cx: 12, cy: 17, r: 0.7, fill: 'currentColor', stroke: 'none' },
    { cx: 16, cy: 17, r: 0.7, fill: 'currentColor', stroke: 'none' },
  ],
}
const piggyBankIcon = {
  paths: [
    {
      d: 'M5 10.5A7 7 0 0 1 17.7 7H21v5l-2.2 1.1A7 7 0 0 1 16 16.8V20h-3v-2H8v2H5v-3.2A6.5 6.5 0 0 1 3 12H1.5',
    },
    { d: 'M8 7.5A5.5 5.5 0 0 1 12 6' },
  ],
  circles: [{ cx: 16.5, cy: 10, r: 0.8, fill: 'currentColor', stroke: 'none' }],
  lines: [{ x1: 10, y1: 4, x2: 14, y2: 4 }],
}

const ICON_REGISTRY = Object.freeze({
  home: homeIcon,
  dashboard: homeIcon,
  chart: chartIcon,
  analysis: chartIcon,
  wallet: walletIcon,
  asset: walletIcon,
  target: targetIcon,
  goal: targetIcon,
  user: userIcon,
  profile: userIcon,
  menu: {
    lines: [
      { x1: 4, y1: 6, x2: 20, y2: 6 },
      { x1: 4, y1: 12, x2: 20, y2: 12 },
      { x1: 4, y1: 18, x2: 20, y2: 18 },
    ],
  },
  'chevron-left': { polylines: [{ points: '15 18 9 12 15 6' }] },
  'chevron-right': { polylines: [{ points: '9 18 15 12 9 6' }] },
  'chevron-up': { polylines: [{ points: '6 15 12 9 18 15' }] },
  'chevron-down': { polylines: [{ points: '6 9 12 15 18 9' }] },
  'arrow-left': arrowLeftIcon,
  back: arrowLeftIcon,
  'arrow-right': arrowRightIcon,
  forward: arrowRightIcon,
  plus: {
    lines: [
      { x1: 12, y1: 5, x2: 12, y2: 19 },
      { x1: 5, y1: 12, x2: 19, y2: 12 },
    ],
  },
  close: {
    lines: [
      { x1: 5, y1: 5, x2: 19, y2: 19 },
      { x1: 19, y1: 5, x2: 5, y2: 19 },
    ],
  },
  check: checkIcon,
  info: infoIcon,
  alert: alertIcon,
  warning: alertIcon,
  search: searchIcon,
  eye: eyeIcon,
  'eye-off': eyeOffIcon,
  lock: lockIcon,
  calendar: calendarIcon,
  clock: clockIcon,
  bank: bankIcon,
  account: bankIcon,
  'credit-card': creditCardIcon,
  card: creditCardIcon,
  gift: giftIcon,
  benefit: giftIcon,
  shield: shieldIcon,
  military: shieldIcon,
  star: starIcon,
  sparkles: sparklesIcon,
  recommendation: sparklesIcon,
  'trend-up': {
    polylines: [{ points: '3 17 9 11 13 15 21 7' }],
    lines: [
      { x1: 15, y1: 7, x2: 21, y2: 7 },
      { x1: 21, y1: 7, x2: 21, y2: 13 },
    ],
  },
  'trend-down': {
    polylines: [{ points: '3 7 9 13 13 9 21 17' }],
    lines: [
      { x1: 15, y1: 17, x2: 21, y2: 17 },
      { x1: 21, y1: 11, x2: 21, y2: 17 },
    ],
  },
  link: linkIcon,
  bell: bellIcon,
  settings: settingsIcon,
  calculator: calculatorIcon,
  'piggy-bank': piggyBankIcon,
  savings: piggyBankIcon,
  'more-horizontal': {
    circles: [
      { cx: 5, cy: 12, r: 1, fill: 'currentColor', stroke: 'none' },
      { cx: 12, cy: 12, r: 1, fill: 'currentColor', stroke: 'none' },
      { cx: 19, cy: 12, r: 1, fill: 'currentColor', stroke: 'none' },
    ],
  },
  help: {
    circles: [{ cx: 12, cy: 12, r: 9 }],
    paths: [{ d: 'M9.7 9a2.5 2.5 0 1 1 3.4 2.3c-.8.4-1.1.9-1.1 1.7' }],
    lines: [{ x1: 12, y1: 17, x2: 12.01, y2: 17 }],
  },
})

const props = defineProps({
  name: {
    type: String,
    required: true,
  },
  size: {
    type: [Number, String],
    default: 24,
  },
  strokeWidth: {
    type: [Number, String],
    default: 2,
  },
  label: {
    type: String,
    default: '',
  },
  decorative: {
    type: Boolean,
    default: false,
  },
})

const generatedId = useId()
const titleId = `icon-title-${generatedId}`
const isKnownIcon = computed(() => Object.prototype.hasOwnProperty.call(ICON_REGISTRY, props.name))
const icon = computed(() => ICON_REGISTRY[props.name] || ICON_REGISTRY.help)
const normalizedSize = computed(() => {
  if (typeof props.size === 'number') {
    return `${Math.max(0, props.size)}px`
  }

  return props.size
})
const isDecorative = computed(() => props.decorative || !props.label)
</script>

<template>
  <svg
    class="base-icon"
    :width="normalizedSize"
    :height="normalizedSize"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    :stroke-width="strokeWidth"
    stroke-linecap="round"
    stroke-linejoin="round"
    :role="isDecorative ? undefined : 'img'"
    :aria-hidden="isDecorative ? 'true' : undefined"
    :aria-labelledby="isDecorative ? undefined : titleId"
    :data-icon="name"
    :data-icon-missing="isKnownIcon ? undefined : 'true'"
    focusable="false"
  >
    <title
      v-if="!isDecorative"
      :id="titleId"
    >
      {{ label }}
    </title>
    <path
      v-for="(shape, index) in icon.paths || []"
      :key="`path-${index}`"
      v-bind="shape"
    />
    <polyline
      v-for="(shape, index) in icon.polylines || []"
      :key="`polyline-${index}`"
      v-bind="shape"
    />
    <line
      v-for="(shape, index) in icon.lines || []"
      :key="`line-${index}`"
      v-bind="shape"
    />
    <circle
      v-for="(shape, index) in icon.circles || []"
      :key="`circle-${index}`"
      v-bind="shape"
    />
    <rect
      v-for="(shape, index) in icon.rects || []"
      :key="`rect-${index}`"
      v-bind="shape"
    />
  </svg>
</template>

<style scoped>
.base-icon {
  display: inline-block;
  flex: 0 0 auto;
  vertical-align: middle;
}
</style>
