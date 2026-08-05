<script setup>
import greenArrowIcon from '@/assets/icons/greenArrowIcon.svg'
import checkedIcon from '@/assets/icons/smallCheckbox.svg'
import uncheckedIcon from '@/assets/icons/smallCheckboxfalse.svg'

defineProps({
  missions: {
    type: Array,
    default: () => [],
  },
  remainingCount: {
    type: Number,
    default: 0,
  },
})

defineEmits(['mission-click', 'show-more'])
</script>

<template>
  <section class="today-mission-card">
    <h2>오늘의 미션</h2>

    <ul v-if="missions.length">
      <li
        v-for="mission in missions.slice(0, 2)"
        :key="mission.id"
      >
        <button
          type="button"
          @click="$emit('mission-click', mission)"
        >
          <span class="today-mission-card__mission">
            <img
              :src="mission.completed ? checkedIcon : uncheckedIcon"
              alt=""
              aria-hidden="true"
            >
            <strong>{{ mission.title }}</strong>
          </span>
          <img
            class="today-mission-card__arrow"
            :src="greenArrowIcon"
            alt=""
            aria-hidden="true"
          >
        </button>
      </li>
    </ul>

    <p
      v-else
      class="today-mission-card__empty"
    >
      오늘의 미션이 없어요.
    </p>

    <button
      v-if="remainingCount > 0"
      class="today-mission-card__more"
      type="button"
      @click="$emit('show-more')"
    >
      {{ remainingCount }}개 더 보기
    </button>
  </section>
</template>

<style scoped>
.today-mission-card {
  display: flex;
  width: 100%;
  min-width: 0;
  min-height: var(--dashboard-card-min-height);
  flex-direction: column;
  gap: var(--dashboard-gap);
  padding: var(--dashboard-card-padding) var(--space-16);
  border-radius: var(--dashboard-card-radius);
  background: var(--dashboard-success-soft);
}

.today-mission-card h2 {
  margin: 0;
  color: var(--green-700);
  font-size: 14px;
  font-weight: var(--weight-bold);
  line-height: 1.5;
}

.today-mission-card ul {
  display: flex;
  flex-direction: column;
  gap: 5px;
  padding: 0;
  margin: 0;
  list-style: none;
}

.today-mission-card li {
  min-width: 0;
}

.today-mission-card li > button {
  display: flex;
  width: 100%;
  min-height: 32px;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  padding: 5px 10px;
  border: 0;
  border-radius: 10px;
  background: var(--white);
  cursor: pointer;
  text-align: left;
}

.today-mission-card__mission {
  display: flex;
  min-width: 0;
  flex: 1;
  align-items: center;
  gap: 4px;
}

.today-mission-card__mission img {
  flex: 0 0 auto;
  width: 10px;
  height: 10px;
  object-fit: contain;
}

.today-mission-card__mission strong {
  overflow: hidden;
  color: var(--gray-900);
  font-size: 12px;
  line-height: 1.35;
  text-overflow: ellipsis;
  white-space: pre-line;
}

.today-mission-card__arrow {
  flex: 0 0 auto;
  width: 7px;
  height: 11px;
  object-fit: contain;
}

.today-mission-card__more {
  align-self: center;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--dashboard-muted-text);
  cursor: pointer;
  font-size: 11px;
  line-height: 1.5;
}

.today-mission-card__empty {
  display: grid;
  flex: 1;
  place-items: center;
  margin: 0;
  color: var(--gray-500);
  font-size: 12px;
}
</style>
