<template>
  <div class="flex flex-col gap-6">
    <template v-if="currentStep === STEP_COURSE_MAIN">
      <div class="flex flex-col">
        <span class="font-bold text-2xl text-primary">{{
          courseData?.title
        }}</span>
        <span class="font-medium text-secondary-color text-xs">
          {{ t("Academy.library.courseContent.description") }}
        </span>
      </div>

      <div class="flex flex-col gap-2">
        <div class="flex justify-between items-center">
          <span class="font-semibold text-lg">{{
            t("Academy.library.courseContent.infoTitle")
          }}</span>

          <div v-if="!isEmptyContent" class="flex gap-4">
            <Button
              :label="t('Academy.library.courseContent.addFile')"
              @click="handleAddFile"
              icon="pi pi-plus-circle"
              severity="primary"
              :disabled="selectionMode"
              outlined
              rounded
            />
            <Button
              :label="t('Academy.library.courseContent.addModule')"
              @click="handleAddModule"
              icon="pi pi-plus-circle"
              severity="primary"
              :disabled="selectionMode"
              rounded
            />
          </div>
        </div>

        <div v-if="selectionMode" class="flex justify-between items-center">
          <span class="font-medium text-secondary-color">
            {{ selectedKeys.size }}
            {{ t("Academy.library.courseContent.itemsSelected") }}
          </span>

          <div class="flex gap-4">
            <Button
              :label="
                allItemsSelected
                  ? t('Academy.library.courseContent.unselectAll')
                  : t('Academy.library.courseContent.selectAll')
              "
              @click="selectAll"
              severity="secondary"
              text
            />
            <Divider layout="vertical" />
            <Button
              :label="t('Academy.library.courseContent.deleteSelected')"
              @click="deleteSelected"
              :disabled="selectedKeys.size === 0"
              text
            />
          </div>
        </div>
      </div>

      <div class="flex flex-col gap-2">
        <Draggable
          v-if="courseItems && courseItems.length > 0"
          v-model="courseItems"
          item-key="key"
          handle=".drag-handle"
          @end="handleDragEnd"
          class="flex flex-col gap-2"
        >
          <template #item="{ element: item, index }">
            <div
              class="flex items-center justify-between p-4 border rounded-xl"
              :class="[
                item.type === 'file' && !selectionMode ? 'cursor-pointer' : '',
                selectionMode ? 'cursor-pointer' : '',
              ]"
              @click="
                selectionMode
                  ? toggleItemSelection(item.key)
                  : item.type === 'file'
                    ? handleFilePreview(item as CourseListItem)
                    : undefined
              "
            >
              <div class="flex items-start gap-2 w-full">
                <div v-if="selectionMode" class="mt-4" @click.stop>
                  <Checkbox
                    :modelValue="selectedKeys.has(item.key)"
                    @update:modelValue="toggleItemSelection(item.key)"
                    binary
                  />
                </div>
                <div v-else class="drag-handle cursor-move mt-4">
                  <img :src="DragIcon1" alt="Drag Icon" class="w-4" />
                </div>

                <div
                  v-if="item.type === 'file'"
                  class="flex flex-col gap-1 w-full"
                >
                  <div class="flex justify-between items-center">
                    <div
                      class="flex items-center gap-2 bg-primary rounded-xl py-1 px-2 w-fit"
                    >
                      <img :src="FileIcon" alt="File Icon" class="w-3!" />
                      <span class="text-white text-xs">
                        {{ t("Academy.library.courseContent.file") }}
                        {{ index + 1 }}
                      </span>
                    </div>
                    <Button
                      v-if="!selectionMode"
                      icon="pi pi-ellipsis-v"
                      @click.stop="(e) => toggleMenu(e, item.key)"
                      aria-haspopup="true"
                      :aria-controls="`menu-${item.key}`"
                      severity="secondary"
                      text
                      rounded
                      size="small"
                    />
                    <Menu
                      :ref="setMenuRef(item.key)"
                      :id="`menu-${item.key}`"
                      :model="getMenuItems('file', item.key, index, item.data)"
                      :popup="true"
                    />
                  </div>
                  <span class="font-semibold text-primary">{{
                    item.data.title
                  }}</span>
                </div>

                <div
                  v-else-if="item.type === 'module'"
                  class="flex flex-col w-full"
                >
                  <div class="flex justify-between items-center">
                    <div
                      class="flex items-center gap-2 bg-primary rounded-xl py-1 px-2 w-fit"
                    >
                      <img :src="ModuleIcon" alt="Module Icon" class="w-3!" />
                      <span class="text-white text-xs">
                        {{ t("Academy.library.courseContent.module") }}
                        {{ index + 1 }}
                      </span>
                    </div>
                    <Button
                      v-if="!selectionMode"
                      icon="pi pi-ellipsis-v"
                      @click.stop="(e) => toggleMenu(e, item.key)"
                      aria-haspopup="true"
                      :aria-controls="`menu-${item.key}`"
                      severity="secondary"
                      text
                      rounded
                      size="small"
                    />
                    <Menu
                      :ref="setMenuRef(item.key)"
                      :id="`menu-${item.key}`"
                      :model="
                        getMenuItems('module', item.key, index, item.data)
                      "
                      :popup="true"
                    />
                  </div>
                  <div
                    class="flex items-center justify-between"
                    :class="
                      item.data.lessons && item.data.lessons.length > 0
                        ? 'mb-4'
                        : ''
                    "
                  >
                    <span class="font-semibold text-primary">{{
                      item.data.title
                    }}</span>
                    <Button
                      v-if="!selectionMode"
                      :label="t('Academy.library.lessonForm.addLessons')"
                      @click.stop="
                        selectedModule = item.data;
                        currentStep = STEP_ADD_LESSONS;
                      "
                      icon="pi pi-plus-circle"
                      severity="primary"
                      text
                      size="small"
                    />
                  </div>
                  <div
                    class="flex justify-between items-center flex-1 border-b cursor-pointer"
                    v-for="(lesson, lindex) in item.data.lessons"
                    :key="`lesson-${lesson.id ?? lindex}`"
                    @click.stop="
                      handleFilePreview({
                        type: 'lesson',
                        data: lesson,
                        key: `lesson-${lesson.id ?? lindex}`,
                      })
                    "
                  >
                    <div class="flex items-center gap-2">
                      <img :src="PlayIcon" alt="Play Icon" class="w-4" />
                      <span class="text-xs">
                        {{ lesson.title }}
                      </span>
                    </div>
                    <Button
                      icon="pi pi-ellipsis-v"
                      @click.stop="
                        (e) => toggleMenu(e, `lesson-${lesson.id ?? lindex}`)
                      "
                      aria-haspopup="true"
                      :aria-controls="`menu-lesson-${lesson.id ?? lindex}`"
                      severity="secondary"
                      text
                      rounded
                      size="small"
                    />
                    <Menu
                      :ref="setMenuRef(`lesson-${lesson.id ?? lindex}`)"
                      :id="`menu-lesson-${lesson.id ?? lindex}`"
                      :model="
                        getMenuItems(
                          'lesson',
                          `lesson-${lesson.id ?? lindex}`,
                          lindex as number,
                          lesson,
                          item.data,
                        )
                      "
                      :popup="true"
                    />
                  </div>
                </div>
              </div>
            </div>
          </template>
        </Draggable>

        <div
          v-else
          class="flex flex-col gap-9 justify-center items-center h-80"
        >
          <div class="flex flex-col gap-2 justify-center items-center">
            <span class="text-2xl font-semibold">{{
              t("Academy.library.courseContent.noContentTitle")
            }}</span>
            <span class="text-primary">
              {{ t("Academy.library.courseContent.noContentDescription") }}
            </span>
          </div>
          <div class="flex gap-4">
            <Button
              :label="t('Academy.library.courseContent.addFile')"
              @click="handleAddFile"
              icon="pi pi-plus-circle"
              severity="primary"
              outlined
              rounded
            />
            <Button
              :label="t('Academy.library.courseContent.addModule')"
              @click="handleAddModule"
              icon="pi pi-plus-circle"
              severity="primary"
              rounded
            />
          </div>
        </div>
      </div>

      <div class="flex gap-2 mt-4" :class="isEmptyContent ? 'w-1/4' : 'w-1/2'">
        <Button
          v-if="!courseData?.isPublished && !courseData?.isDraft"
          :label="
            courseData?.isDraft ? t('app.saveAsDraft') : t('app.updateDraft')
          "
          @click="handleSaveAsDraft"
          outlined
          fluid
        />
        <Button
          v-if="
            !isEmptyContent ||
            deletedFileIds.length !== 0 ||
            deletedModuleIds.length !== 0
          "
          :label="
            courseData?.isDraft
              ? t('app.publish') +
                ' ' +
                t('Academy.library.courseContent.course')
              : t('Academy.library.courseContent.saveToCourse')
          "
          @click="handleSave"
          fluid
        />
      </div>

      <Message v-if="errorMessage" severity="error">{{ errorMessage }}</Message>
    </template>

    <AddFile
      v-else-if="currentStep === STEP_ADD_FILE"
      :content-data="courseData"
      :file-data="selectedFile"
      @existingFileRemoved="handleExistingFileRemoved"
      @refresh="handleRefresh"
    />

    <ModuleList
      v-else-if="currentStep === STEP_ADD_MODULE"
      :courseId="courseData?.id"
      :moduleData="selectedModule"
      @cancelEdit="handleCancelEdit"
      @refresh="handleRefresh"
    />

    <LessonList
      v-else-if="currentStep === STEP_ADD_LESSONS"
      :moduleData="selectedModule"
      :courseId="courseData?.id"
      :isEditingLessons="isEditingLessons"
      :lessonData="selectedLesson"
      @refresh="handleRefresh"
      @lessonsSaved="handleLessonsSaved"
      @cancelEdit="handleCancelEdit"
    />

    <FilePreviewDialog
      v-model="isFilePreviewDialogOpen"
      :fileData="selectedFile"
      @close="selectedFile = undefined"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute, useRouter } from "vue-router";
import AddFile from "./AddFile.vue";
import ModuleList from "./ModuleList.vue";
import LessonList from "./LessonList.vue";
import { libraryService } from "@/services";
import { useAppLoader, useContentCache } from "@/composables";
import {
  STEP_COURSE_MAIN,
  STEP_ADD_FILE,
  STEP_ADD_MODULE,
  STEP_ADD_LESSONS,
  type ModuleData,
  type LessonData,
  type CourseListItem,
} from "./types";
import { DragIcon1, ModuleIcon, FileIcon, PlayIcon } from "@/assets/images";
import { ContentData, FileData } from "@/types";
import { FilePreviewDialog } from "@/components/Dialogs";

interface Props {
  courseData?: ContentData;
  initialFiles?: FileData[];
  initialModules?: ModuleData[];
  initialLessons?: LessonData[];
}

const currentStep = defineModel<number>("currentStep", { required: true });
const props = withDefaults(defineProps<Props>(), {
  courseData: undefined,
  initialFiles: () => [],
  initialModules: () => [],
  initialLessons: () => [],
});

const emit = defineEmits<{
  refresh: [];
}>();

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const loader = useAppLoader();
const { getContentByIdCached, invalidateContent } = useContentCache();

const files = ref<FileData[]>([...props.initialFiles]);
const modules = ref<ModuleData[]>([...props.initialModules]);
const lessons = ref<LessonData[]>([...props.initialLessons]);
const courseItems = ref<CourseListItem[]>([]);
const errorMessage = ref("");
const menuRefs = ref<Record<string, any>>({});
const selectedModule = ref<ModuleData>();
const selectedFile = ref<FileData>();
const selectedLesson = ref<LessonData>();
const isEditingLessons = ref(false);
const isFilePreviewDialogOpen = ref(false);
const selectionMode = ref(false);
const selectedKeys = ref<Set<string>>(new Set());
const deletedFileIds = ref<number[]>([]);
const deletedModuleIds = ref<number[]>([]);

const allItemsSelected = computed(() => {
  return (
    courseItems.value.length > 0 &&
    selectedKeys.value.size === courseItems.value.length
  );
});

const setMenuRef = (key: string) => (el: any) => {
  if (el) {
    menuRefs.value[key] = el;
  }
};

watch(
  () => selectedKeys.value.size,
  (size) => {
    if (size > 0) {
      selectionMode.value = true;
    } else {
      selectedKeys.value.clear();
      selectionMode.value = false;
    }
  },
);

const toggleItemSelection = (key: string) => {
  if (selectedKeys.value.has(key)) {
    selectedKeys.value.delete(key);
  } else {
    selectedKeys.value.add(key);
  }
};

const selectAll = () => {
  if (allItemsSelected.value) {
    selectedKeys.value.clear();
  } else {
    courseItems.value.forEach((item) => {
      selectedKeys.value.add(item.key);
    });
  }
};

const deleteSelected = () => {
  selectedKeys.value.forEach((key) => {
    const item = courseItems.value.find((i) => i.key === key);
    if (item && item.data.id) {
      if (item.type === "file") {
        deletedFileIds.value.push(item.data.id);
      } else if (item.type === "module") {
        deletedModuleIds.value.push(item.data.id);
      }
    }
  });

  courseItems.value = courseItems.value.filter(
    (item) => !selectedKeys.value.has(item.key),
  );

  syncFromCourseItems();
  courseItems.value.forEach((item, idx) => {
    item.data.position = idx;
  });

  selectedKeys.value.clear();
};

const handleFilePreview = (item: CourseListItem) => {
  if (item.type === "file" || item.type === "lesson") {
    isFilePreviewDialogOpen.value = true;
    if (item.type === "file") {
      selectedFile.value = item.data as FileData;
    } else if (item.type === "lesson") {
      const firstMedia = item.data.media?.[0];
      selectedFile.value = {
        title: item.data.title,
        description: item.data.description ?? "",
        fileType: firstMedia?.type,
        url: firstMedia?.url,
        publicId: firstMedia?.publicId,
        thumbnail: firstMedia?.thumbnail,
        type: firstMedia?.type,
        fileName: firstMedia?.fileName,
        size: firstMedia?.size,
        duration: firstMedia?.duration,
        position: item.data.position,
      } as FileData;
    }
  }
};

const buildCourseItems = () => {
  const items: CourseListItem[] = [];

  files.value.forEach((file, index) => {
    items.push({
      type: "file",
      data: file,
      key: `file-${file.id ?? index}`,
    });
  });

  modules.value.forEach((module, index) => {
    items.push({
      type: "module",
      data: module,
      key: `module-${module.id ?? index}`,
    });
  });

  items.sort((a, b) => {
    const posA = a.data.position ?? 999999;
    const posB = b.data.position ?? 999999;
    return posA - posB;
  });

  courseItems.value = items;

  deletedFileIds.value = [];
  deletedModuleIds.value = [];
};

const syncFromCourseItems = () => {
  files.value = courseItems.value
    .filter((item) => item.type === "file")
    .map((item) => item.data as FileData);

  modules.value = courseItems.value
    .filter((item) => item.type === "module")
    .map((item) => item.data as ModuleData);
};

const handleDragEnd = () => {
  courseItems.value.forEach((item, index) => {
    item.data.position = index;
  });

  syncFromCourseItems();
};

const getMenuItems = (
  type: "file" | "module" | "lesson",
  key: string,
  index: number,
  data: FileData | ModuleData | LessonData,
  parentModule?: ModuleData,
) => [
  {
    label: t("app.select"),
    visible: type === "module" || type === "file",
    command: () => {
      selectionMode.value = true;
      toggleItemSelection(key);
    },
  },
  {
    label: t("Academy.library.courseContent.editModule"),
    visible: type === "module",
    command: () => {
      currentStep.value = STEP_ADD_MODULE;
      selectedModule.value = data as ModuleData;
    },
  },
  {
    label: t("Academy.library.lessonForm.editLessons"),
    visible: type === "module",
    command: () => {
      isEditingLessons.value = true;
      currentStep.value = STEP_ADD_LESSONS;
      selectedModule.value = data as ModuleData;
    },
  },
  {
    label: t("Academy.library.menuItems.updateFile"),
    visible: type === "file",
    command: () => {
      currentStep.value = STEP_ADD_FILE;
      selectedFile.value = data as FileData;
    },
  },
  {
    label: t("Academy.library.lessonForm.editLesson"),
    visible: type === "lesson",
    command: () => {
      isEditingLessons.value = false;
      currentStep.value = STEP_ADD_LESSONS;
      selectedLesson.value = data as LessonData;
      if (parentModule) {
        selectedModule.value = parentModule;
      }
    },
  },
  {
    label: t("app.delete"),
    visible: type !== "lesson",
    command: () => {
      removeCourseItem(index);
    },
  },
];

onMounted(() => {
  if (props.courseData?.id) {
    getContentData();
  } else {
    buildCourseItems();
  }

  handleRouteParameters();
});

watch(
  [() => props.initialFiles, () => props.initialModules],
  () => {
    files.value = [...props.initialFiles];
    modules.value = [...props.initialModules];
    buildCourseItems();
  },
  { deep: true },
);

const getContentData = async () => {
  try {
    loader.setLoading(true, t("loading.loadingContent"));
    const response = await getContentByIdCached(
      props.courseData?.id as number,
      props.courseData?.contentType as number,
    );
    if (response.success) {
      files.value = response.data.media || [];
      modules.value = response.data.modules || [];
      buildCourseItems();
      handleRouteParameters();
    }
  } finally {
    loader.setLoading(false);
  }
};

const handleRouteParameters = () => {
  if (route.name === "editcourselesson" && route.params.lessonId) {
    const lessonId = Number(route.params.lessonId);
    for (const module of modules.value) {
      const lesson = module.lessons?.find((l) => l.id === lessonId);
      if (lesson) {
        selectedModule.value = module;
        selectedLesson.value = lesson;
        isEditingLessons.value = false;
        currentStep.value = STEP_ADD_LESSONS;
        break;
      }
    }
  } else if (route.name === "editcoursemodule" && route.params.moduleId) {
    const moduleId = Number(route.params.moduleId);
    const module = modules.value.find((m) => m.id === moduleId);
    if (module) {
      selectedModule.value = module;
      currentStep.value = STEP_ADD_MODULE;
    }
  } else if (route.name === "editcoursefile" && route.params.fileId) {
    const fileId = Number(route.params.fileId);
    const file = files.value.find((f) => f.id === fileId);
    if (file) {
      selectedFile.value = file;
      currentStep.value = STEP_ADD_FILE;
    }
  } else if (route.name === "addlessons" && route.params.moduleId) {
    const moduleId = Number(route.params.moduleId);
    const module = modules.value.find((m) => m.id === moduleId);
    if (module) {
      selectedModule.value = module;
      isEditingLessons.value = true;
      currentStep.value = STEP_ADD_LESSONS;
    }
  }
};

const handleExistingFileRemoved = (index: number) => {
  if (selectedFile.value?.files && selectedFile.value.files[index]) {
    const fileId = selectedFile.value.files[index].id;
    if (fileId) {
      deletedFileIds.value.push(fileId);
    }
    selectedFile.value.files.splice(index, 1);
  }
};

const removeCourseItem = (index: number) => {
  courseItems.value.splice(index, 1);
  syncFromCourseItems();
  courseItems.value.forEach((item, idx) => {
    item.data.position = idx;
  });
};

const toggleMenu = (event: Event, key: string) => {
  const menu = menuRefs.value[key];
  if (menu && menu.toggle) {
    menu.toggle(event);
  }
};

const isEmptyContent = computed<boolean>(() => {
  return (
    files.value &&
    files.value.length === 0 &&
    modules.value &&
    modules.value.length === 0
  );
});

const handleLessonsSaved = (newLessons: LessonData[]) => {
  lessons.value = [...newLessons];
  currentStep.value = STEP_COURSE_MAIN;
};

const handleAddFile = () => {
  selectedFile.value = undefined;
  currentStep.value = STEP_ADD_FILE;
};

const handleAddModule = () => {
  selectedModule.value = undefined;
  currentStep.value = STEP_ADD_MODULE;
};

const handleRefresh = async () => {
  handleCancelEdit();
  if (props.courseData?.id) {
    await getContentData();
  }
};

const handleCancelEdit = () => {
  selectedLesson.value = undefined;
  selectedFile.value = undefined;
  selectedModule.value = undefined;
  currentStep.value = STEP_COURSE_MAIN;

  if (
    route.name === "editcourselesson" ||
    route.name === "editcoursemodule" ||
    route.name === "editcoursefile" ||
    route.name === "addlessons"
  ) {
    router.push({
      name: "contentdetail",
      params: {
        id: route.params.id,
        type: route.params.type,
      },
    });
  }
};

const saveCourse = async (isDraft: boolean = false) => {
  try {
    errorMessage.value = "";
    loader.setLoading(true, t("loading.savingCourse"));

    const filePositions: { id: number; position: number }[] = [];
    const modulePositions: { id: number; position: number }[] = [];

    let fileIndex = 0;
    let moduleIndex = 0;

    courseItems.value.forEach((item) => {
      if (item.type === "file" && item.data.id != null) {
        filePositions.push({
          id: item.data.id,
          position: fileIndex,
        });
        fileIndex++;
      } else if (item.type === "module" && item.data.id != null) {
        modulePositions.push({
          id: item.data.id,
          position: moduleIndex,
        });
        moduleIndex++;
      }
    });

    const payload = {
      modulePositions,
      filePositions,
      deleteModuleIds: [...deletedModuleIds.value],
      deleteFileIds: [...deletedFileIds.value],
      isDraft,
      isPublished: !isDraft,
    };
    const response = await libraryService.createUpdateCourse(
      props.courseData?.id as number,
      payload,
    );
    if (response.success) {
      invalidateContent(props.courseData?.id as number);
      emit("refresh");
    } else {
      errorMessage.value =
        response.error || t("Academy.library.course.errorSavingCourse");
    }
  } catch (error) {
    errorMessage.value =
      error instanceof Error
        ? error.message
        : t("Academy.library.course.errorSavingCourse");
    console.error("Course save error:", error);
  } finally {
    loader.setLoading(false);
  }
};

const handleSave = async () => {
  await saveCourse(false);
};

const handleSaveAsDraft = async () => {
  await saveCourse(true);
};
</script>

<style scoped></style>
