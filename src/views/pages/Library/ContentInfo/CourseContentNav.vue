<template>
  <div class="flex flex-col gap-4 bg-white rounded-2xl p-4 h-fit">
    <span class="font-semibold text-primary">{{
      t("Academy.library.courseContent.content")
    }}</span>

    <div class="flex flex-col gap-2">
      <div
        v-for="(file, index) in files"
        :key="`file-${file.id || index}`"
        @click="handleSelect('file', file, `file-${file.id || index}`)"
        :class="[
          'flex items-center gap-2 py-2 px-3 rounded-xl cursor-pointer transition-colors',
          selectedKey === `file-${file.id || index}`
            ? 'bg-primary text-white!'
            : 'hover:bg-gray-100',
        ]"
      >
        <span
          class="text-sm font-medium font-inter"
          :class="[
            selectedKey === `file-${file.id || index}`
              ? 'text-white!'
              : 'text-text-2',
          ]"
          >{{ file.title || (file.files?.[0]?.fileName ?? "") }}</span
        >
      </div>

      <div
        v-for="(module, moduleIndex) in modules"
        :key="`module-${module.id || moduleIndex}`"
        class="flex flex-col gap-1"
      >
        <div
          @click="handleModuleClick(module, moduleIndex)"
          :class="[
            'flex items-center gap-2 py-2 px-3 rounded-xl cursor-pointer transition-colors',
            activeModuleIndex === moduleIndex
              ? 'bg-primary text-white'
              : 'hover:bg-gray-100',
          ]"
        >
          <div class="flex flex-col flex-1">
            <span
              class="text-sm font-medium font-inter"
              :class="[
                activeModuleIndex === moduleIndex
                  ? 'text-white!'
                  : 'text-text-2',
              ]"
              >{{ module.title }}</span
            >
          </div>
        </div>

        <div
          v-if="module.lessons && module.lessons.length > 0"
          class="flex flex-col gap-1 ml-4"
        >
          <div
            v-for="(lesson, lessonIndex) in module.lessons"
            :key="`lesson-${lesson.id || lessonIndex}`"
            @click="
              handleSelect(
                'lesson',
                lesson,
                `lesson-${moduleIndex}-${lessonIndex}`,
              )
            "
            :class="[
              'relative flex items-center gap-1 py-2 px-3 rounded-xl cursor-pointer transition-colors',
              selectedKey === `lesson-${moduleIndex}-${lessonIndex}`
                ? 'active-lesson'
                : 'hover:bg-gray-100',
            ]"
          >
            <div class="flex flex-col flex-1">
              <span class="text-sm font-inter font-medium text-text-2">{{
                lesson.title
              }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import type { ModuleData, LessonData } from "./types";
import type { FileData } from "@/types/common";

const { t } = useI18n();

const props = withDefaults(
  defineProps<{
    modules?: ModuleData[];
    files?: FileData[];
    selectedKey?: string;
  }>(),
  {
    modules: () => [],
    files: () => [],
    selectedKey: "",
  },
);

const emit = defineEmits<{
  select: [
    payload: {
      type: "file" | "module" | "lesson";
      data: FileData | ModuleData | LessonData;
      key: string;
    },
  ];
}>();

const selectedKey = computed(() => props.selectedKey);

const activeModuleIndex = computed(() => {
  if (props.selectedKey.startsWith("lesson-")) {
    const match = props.selectedKey.match(/^lesson-(\d+)-\d+$/);
    return match ? parseInt(match[1], 10) : null;
  }

  if (props.selectedKey.startsWith("module-")) {
    const moduleIdOrIndex = props.selectedKey.replace("module-", "");
    return props.modules.findIndex(
      (m, idx) => String(m.id ?? idx) === moduleIdOrIndex,
    );
  }

  return null;
});

const handleSelect = (
  type: "file" | "module" | "lesson",
  data: FileData | ModuleData | LessonData,
  key: string,
) => {
  emit("select", { type, data, key });
};

const handleModuleClick = (module: ModuleData, moduleIndex: number) => {
  if (module.lessons && module.lessons.length > 0) {
    const firstLesson = module.lessons[0];
    emit("select", {
      type: "lesson",
      data: firstLesson,
      key: `lesson-${moduleIndex}-0`,
    });
  } else {
    emit("select", {
      type: "module",
      data: module,
      key: `module-${module.id ?? moduleIndex}`,
    });
  }
};
</script>

<style scoped>
.active-lesson::before {
  content: "";
  position: absolute;
  left: 0;
  top: 2;
  width: 3px;
  height: 2rem;
  background-color: var(--primary-color);
  border-radius: 0 10px 10px 0;
  z-index: 1;
}
</style>
