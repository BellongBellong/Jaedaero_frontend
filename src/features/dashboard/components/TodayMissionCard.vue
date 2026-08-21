<script setup>
import checkboxFalseIcon from '@/assets/icons/CheckboxFalse.svg'
import missionCheckIconGreen from '@/assets/icons/MissionCheckIconGreen.svg'

defineProps({
  missions: {
    type: Array,
    default: () => [],
  },
})

defineEmits(['mission-click', 'show-all'])
</script>

<template>
  <section class="today-mission-card">
    <header class="today-mission-card__header">
      <h2>오늘의 미션</h2>

      <button
        class="today-mission-card__more"
        type="button"
        @click="$emit('show-all')"
      >
        미션 전체
      </button>
    </header>

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
              class="today-mission-card__check"
              :src="mission.completed ? missionCheckIconGreen : checkboxFalseIcon"
              alt=""
              aria-hidden="true"
            >
            <strong>{{ mission.title }}</strong>
          </span>
        </button>
      </li>
    </ul>

    <p
      v-else
      class="today-mission-card__empty"
    >
      오늘의 미션이 없어요.
    </p>
  </section>
</template>

<style scoped>
.today-mission-card {
  display: flex;
  width: 100%;
  min-width: 0;
  min-height: 0;
  aspect-ratio: 1;
  flex-direction: column;
  justify-content: space-between;
  gap: var(--space-8);
  padding: var(--space-20);
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

.today-mission-card__header {
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-8);
}

.today-mission-card ul {
  display: flex;
  flex-direction: column;
  gap: 0;
  padding: 0;
  margin: 0;
  list-style: none;
}

.today-mission-card li {
  min-width: 0;
  border-bottom: 1px dashed var(--ui-sub-title-light, #bdbdbd);
}

.today-mission-card li:last-child {
  border-bottom-color: transparent;
}

.today-mission-card li > button {
  display: flex;
  width: 100%;
  min-height: 0;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  padding: 10px 0;
  border: 0;
  background: transparent;
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

.today-mission-card__check {
  flex: 0 0 auto;
  width: 10px;
  height: 10px;
  object-fit: contain;
}

.today-mission-card__mission strong {
  display: block;
  min-width: 0;
  overflow: hidden;
  color: var(--ui-sub-title);
  font-size: 12px;
  line-height: 1.35;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.today-mission-card__more {
  flex: 0 0 auto;
  padding: 0 4px;
  border: 0;
  background: transparent;
  color: #666666;
  cursor: pointer;
  font-size: 11px;
  line-height: 16.5px;
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
