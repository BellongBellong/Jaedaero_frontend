<script setup>
defineProps({
  amount: {
    type: [Number, String],
    default: 0,
  },

  direction: {
    type: String,
    default: 'bottom',
    validator: (value) =>
      ['bottom', 'left', 'right', 'diagonal-left', 'diagonal-right'].includes(value),
  },

  mode: {
    type: String,
    default: 'default',
    validator: (value) => ['default', 'vacation'].includes(value),
  },
})
</script>

<template>
  <div
    class="asset-bubble"
    :class="[`asset-bubble--${direction}`, `asset-bubble--${mode}`]"
  >
    <span
      class="asset-bubble__tail"
      aria-hidden="true"
    />

    <div class="asset-bubble__content">
      <strong class="asset-bubble__amount">
        {{ amount }}
      </strong>

      <span class="asset-bubble__unit"> 만원 </span>
    </div>
  </div>
</template>

<style scoped>
.asset-bubble,
.asset-bubble * {
  box-sizing: border-box;
}

.asset-bubble {
  /* 기본 생활관 모드 */
  --asset-bubble-bg: var(--green-100);
  --asset-bubble-shadow: rgb(32 186 92 / 10%);
  --asset-bubble-highlight: rgb(98 255 156 / 30%);
  --asset-bubble-inner-light: rgb(255 255 255 / 100%);
  --asset-bubble-amount-color: var(--brand-deep-green);

  position: relative;
  display: flex;
  width: max-content;
  align-items: center;
  justify-content: flex-start;
  gap: 0;
  border-radius: 8px;
  filter: drop-shadow(0 7px 3px var(--asset-bubble-shadow));
}

/* =========================
   Vacation Mode
   ========================= */

.asset-bubble--vacation {
  --asset-bubble-bg: var(--brand-light-blue);
  --asset-bubble-shadow: rgb(0 157 255 / 18%);
  --asset-bubble-highlight: rgb(0 157 255 / 50%);
  --asset-bubble-inner-light: rgb(255 255 255 / 80%);
  --asset-bubble-amount-color: var(--brand-deep-blue);
}

.asset-bubble--vacation .asset-bubble__content {
  background: linear-gradient(
    180deg,
    color-mix(in srgb, var(--brand-deep-blue) 14%, var(--brand-light-blue)) 0%,
    var(--brand-light-blue) 100%
  );
}

/* =========================
   말풍선 본문
   ========================= */

.asset-bubble__content {
  position: relative;
  z-index: 1;
  display: flex;

  /* 금액 길이에 맞춰 자동으로 가로 증가 */
  width: max-content;
  flex: 0 0 auto;

  align-items: flex-start;
  justify-content: flex-start;
  gap: 2px;
  padding: 8px 12px;
  border-radius: 10px;
  background: var(--asset-bubble-bg);

  /*
   * Figma Inner Shadow
   *
   * 1. 컬러 Inner Shadow
   *    X: 0
   *    Y: 2
   *    Blur: 4
   *    Spread: 0
   *
   * 2. White Inner Shadow
   *    X: 0
   *    Y: -2
   *    Blur: 4
   *    Spread: 0
   */
  box-shadow:
    inset 0 -2px 4px 0 var(--asset-bubble-inner-light),
    inset 0 2px 4px 0 var(--asset-bubble-highlight);

  white-space: nowrap;
}

/* =========================
   금액
   ========================= */

.asset-bubble__amount {
  color: var(--asset-bubble-amount-color);
  font-family: var(--body-label-small-font-family, 'Pretendard', sans-serif);
  font-size: var(--body-label-small-font-size, 12px);
  font-weight: 700;
  line-height: var(--body-label-small-line-height, 150%);
}

/* =========================
   단위
   ========================= */

.asset-bubble__unit {
  color: var(--gray-800);
  font-family: var(--body-label-small-font-family, 'Pretendard', sans-serif);
  font-size: var(--body-label-small-font-size, 12px);
  font-weight: 400;
  line-height: var(--body-label-small-line-height, 150%);
}

/* =========================
   Bottom

   [ 금액 ]
      ▼
   ========================= */

.asset-bubble--bottom {
  flex-direction: column;
}

.asset-bubble--bottom .asset-bubble__content {
  order: 1;
}

.asset-bubble--bottom .asset-bubble__tail {
  order: 2;
  display: block;
  z-index: 0;
  width: 18px;
  height: 9px;
  margin-top: -3px;
  background: var(--asset-bubble-bg);
  clip-path: polygon(0 0, 100% 0, 50% 100%);
}

/* 휴가모드에서는 본문의 끝 색이 꼬리까지 자연스럽게 이어지도록 한다. */
.asset-bubble--vacation.asset-bubble--bottom .asset-bubble__tail {
  width: 20px;
  height: 11px;
  margin-top: -1px;
  background: var(--brand-light-blue);
}

/* =========================
   Left

   ◀ [ 금액 ]
   ========================= */

.asset-bubble--left {
  flex-direction: row;
}

.asset-bubble--left .asset-bubble__tail {
  order: 1;
  display: block;
  z-index: 0;
  width: 9px;
  height: 18px;
  margin-right: -3px;
  background: var(--asset-bubble-bg);
  clip-path: polygon(100% 0, 100% 100%, 0 50%);
}

.asset-bubble--left .asset-bubble__content {
  order: 2;
}

/* =========================
   Right

   [ 금액 ] ▶
   ========================= */

.asset-bubble--right {
  flex-direction: row;
}

.asset-bubble--right .asset-bubble__content {
  order: 1;
}

.asset-bubble--right .asset-bubble__tail {
  order: 2;
  display: block;
  z-index: 0;
  width: 9px;
  height: 18px;
  margin-left: -3px;
  background: var(--asset-bubble-bg);
  clip-path: polygon(0 0, 100% 50%, 0 100%);
}

/* =========================
   Diagonal Left

   왼쪽 아래 모서리만 0
   꼬리 없음
   ========================= */

.asset-bubble--diagonal-left {
  flex-direction: row;
  border-radius: 8px 8px 8px 0;
}

.asset-bubble--diagonal-left .asset-bubble__tail {
  display: none;
}

.asset-bubble--diagonal-left .asset-bubble__content {
  border-radius: 10px 10px 10px 0;
}

/* =========================
   Diagonal Right

   오른쪽 아래 모서리만 0
   꼬리 없음
   ========================= */

.asset-bubble--diagonal-right {
  flex-direction: row;
  border-radius: 8px 8px 0 8px;
}

.asset-bubble--diagonal-right .asset-bubble__tail {
  display: none;
}

.asset-bubble--diagonal-right .asset-bubble__content {
  border-radius: 10px 10px 0 10px;
}
</style>
