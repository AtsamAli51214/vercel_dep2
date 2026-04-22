<template>
  <LessonList
    :module-id="moduleId"
    :initial-lessons="initialLessons"
    :lesson-data="lessonData"
    @refresh="emit('refresh')"
    @lessonsSaved="emit('lessonsSaved', $event)"
  />
</template>

<script setup lang="ts">
import LessonList from "./LessonList.vue";
import type { LessonData } from "./types";

interface Props {
  moduleId?: number;
  initialLessons?: LessonData[];
  lessonData?: LessonData;
}

withDefaults(defineProps<Props>(), {
  moduleId: undefined,
  initialLessons: () => [],
  lessonData: undefined,
});

const emit = defineEmits<{
  lessonsSaved: [lessons: LessonData[]];
  refresh: [];
}>();
</script>

<style scoped></style>
