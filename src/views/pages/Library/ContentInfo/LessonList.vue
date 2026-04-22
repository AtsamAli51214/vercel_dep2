<template>
  <div class="flex flex-col gap-6">
    <div class="flex flex-col">
      <span class="font-bold text-2xl text-primary">{{
        isEditingSingleLesson || isEditMode
          ? moduleData?.title
          : t("Academy.library.lessonForm.addLessons")
      }}</span>
      <span class="font-medium text-secondary-color text-xs">
        {{
          isEditingSingleLesson || isEditMode
            ? t("Academy.library.lessonForm.editDescription")
            : t("Academy.library.lessonForm.description")
        }}
      </span>
    </div>

    <div class="flex flex-col gap-2">
      <div class="flex justify-between items-center">
        <span class="font-semibold text-lg">{{
          t("Academy.library.lessonForm.infoTitle")
        }}</span>

        <Button
          v-if="!isEditingSingleLesson && localLessons.length > 0"
          :label="t('Academy.library.lessonForm.addLesson')"
          @click="
            confirmDiscardChanges($event, () => {
              formKey++;
              activeLesson = 'add';
            })
          "
          icon="pi pi-plus-circle"
          severity="primary"
          rounded
        />
      </div>
    </div>

    <div class="flex flex-col gap-4">
      <LessonForm
        v-if="activeLesson !== null"
        :key="`${activeLesson === 'add' ? 'add' : `edit-${activeLesson}`}-${formKey}`"
        :class="isEditingSingleLesson ? '' : 'border rounded-xl p-4'"
        :lesson-data="editingLessonData"
        :module-data="moduleData"
        @lessonSaved="handleLessonSaved"
        @cancel="handleCancelForm"
        @formChanged="hasUnsavedChanges = $event"
      />

      <draggable
        v-if="localLessons.length > 0 && !isEditingSingleLesson"
        v-model="localLessons"
        item-key="uniqueId"
        handle=".drag-handle"
        @end="handleDragEnd"
        class="flex flex-col gap-2"
      >
        <template #item="{ element: lesson, index }">
          <div
            v-if="activeLesson !== index"
            class="flex items-center gap-3 border-b py-3"
          >
            <div class="drag-handle cursor-pointer">
              <img :src="DragIcon2" alt="Drag Icon" class="w-2" />
            </div>
            <div class="flex justify-between items-center flex-1">
              <div class="flex items-center gap-2">
                <img :src="PlayIcon" alt="Play Icon" class="w-4" />
                <span class="">
                  {{ lesson.title }}
                </span>
              </div>
              <div class="flex">
                <Button
                  @click="(e) => handleEditClick(index, e)"
                  icon="pi pi-pencil"
                  variant="text"
                  size="small"
                />
                <Button
                  icon="pi pi-trash"
                  @click="(e) => handleDeleteClick(index, e)"
                  severity="danger"
                  variant="text"
                  size="small"
                />
              </div>
            </div>
          </div>
        </template>
      </draggable>

      <div
        v-if="
          localLessons.length === 0 &&
          activeLesson !== 'add' &&
          !isEditingSingleLesson
        "
        class="text-center py-8 border border-dashed rounded-lg p-4"
      >
        <p class="text-lg font-semibold">
          {{ t("Academy.library.lessonForm.noLessonsAdded") }}
        </p>
        <Button
          :label="t('Academy.library.lessonForm.addLesson')"
          @click="
            confirmDiscardChanges($event, () => {
              formKey++;
              activeLesson = 'add';
            })
          "
          icon="pi pi-plus-circle"
          class="mt-2"
          outlined
          rounded
        />
      </div>
    </div>

    <div class="flex gap-2 w-1/2" v-if="!isEditingSingleLesson">
      <Button
        :label="t('Academy.library.courseContent.saveToModule')"
        :disabled="localLessons.length === 0 || activeLesson !== null"
        @click="handleSaveLessons"
        severity="primary"
        class="w-1/2"
      />
    </div>

    <Message v-if="formError" severity="error">{{ formError }}</Message>

    <ConfirmPopover
      ref="confirmPopoverRef"
      group="lessonDiscard"
      @accept="handleConfirmAccept"
      @reject="handleConfirmReject"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute, useRouter } from "vue-router";
import draggable from "vuedraggable";
import LessonForm from "./LessonForm.vue";
import ConfirmPopover from "@/components/Dialogs/ConfirmPopover.vue";
import type { LessonData, ModuleData } from "./types";
import { WarningIcon, DragIcon2, PlayIcon } from "@/assets/images";
import { generateUniqueId } from "@/utils/helpers";
import { libraryService } from "@/services";
import { useAppLoader, useContentCache } from "@/composables";

interface Props {
  lessonData?: LessonData;
  moduleData?: ModuleData;
  courseId?: number;
  isEditingLessons?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  lessonData: undefined,
  moduleData: undefined,
  courseId: undefined,
  isEditingLessons: false,
});

const emit = defineEmits<{
  refresh: [];
  lessonsSaved: [lessons: LessonData[]];
  cancelEdit: [];
}>();

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const loader = useAppLoader();
const { invalidateContent } = useContentCache();
const confirmPopoverRef = ref();

const localLessons = ref<LessonData[]>([...(props.moduleData?.lessons || [])]);
const activeLesson = ref<"add" | number | null>(null);
const formKey = ref(0);
const deletedLessonIds = ref<number[]>([]);
const formError = ref("");

const isEditingSingleLesson = computed(() => !!props.lessonData);
const isEditMode = computed(() => props.isEditingLessons);

const editingLessonData = computed(() => {
  if (isEditingSingleLesson.value) {
    return props.lessonData;
  }

  if (activeLesson.value === "add") {
    return undefined;
  }
  if (typeof activeLesson.value === "number") {
    return localLessons.value[activeLesson.value];
  }
  return undefined;
});

if (props.lessonData) {
  activeLesson.value = 0;
} else if (props.isEditingLessons) {
  activeLesson.value = null;
} else activeLesson.value = "add";
const hasUnsavedChanges = ref(false);

const pendingAction = ref<(() => void) | null>(null);

watch(
  () => props.moduleData?.id,
  (newId: number | undefined, oldId: number | undefined) => {
    if (newId !== oldId) {
      deletedLessonIds.value = [];
      localLessons.value = [...(props.moduleData?.lessons || [])];
    }
  },
);

const confirmDiscardChanges = (event: Event, onAccept: () => void) => {
  if (!hasUnsavedChanges.value) {
    onAccept();
    return;
  }

  pendingAction.value = onAccept;

  confirmPopoverRef.value?.showConfirm({
    target: event.currentTarget as HTMLElement,
    message: t("validation.confirmDiscardChanges"),
    customIcon: WarningIcon,
    acceptLabel: t("app.yes"),
    rejectLabel: t("app.no"),
    severity: "primary",
  });
};

const handleConfirmAccept = () => {
  if (pendingAction.value) {
    hasUnsavedChanges.value = false;

    formKey.value++;

    pendingAction.value();

    pendingAction.value = null;
  }
};

const handleConfirmReject = () => {
  pendingAction.value = null;
};

const handleEditClick = (index: number, event: Event) => {
  confirmDiscardChanges(event, () => {
    formKey.value++;
    activeLesson.value = index;
  });
};

const handleDeleteClick = (index: number, event: Event) => {
  confirmDiscardChanges(event, () => {
    handleDelete(index);
  });
};

const handleCancelForm = () => {
  formError.value = "";
  if (isEditingSingleLesson.value) {
    emit("cancelEdit");
    return;
  }
  formKey.value++;
  activeLesson.value = null;
  hasUnsavedChanges.value = false;
};

const handleLessonSaved = async (
  lesson: LessonData,
  deletedFileIds: number[] = [],
) => {
  if (isEditingSingleLesson.value) {
    try {
      loader.setLoading(true, t("loading.savingLessons"));
      formError.value = "";
      const formData = buildSingleLessonFormData(lesson, deletedFileIds);
      const response = await libraryService.createUpdateLesson(
        props.moduleData?.id ?? 0,
        formData,
      );

      if (response.success) {
        hasUnsavedChanges.value = false;
        activeLesson.value = null;
        deletedLessonIds.value = [];
        if (props.courseId) {
          invalidateContent(props.courseId);
        }

        if (
          route.name === "editcourselesson" &&
          route.params.id &&
          route.params.type
        ) {
          await router.push({
            name: "contentdetail",
            params: {
              id: route.params.id,
              type: route.params.type,
            },
          });
        } else {
          emit("refresh");
        }
      }
    } catch (error) {
      console.error("Error saving lesson:", error);
      formError.value =
        error instanceof Error
          ? error.message
          : t("Academy.library.lessonForm.errorSavingLesson");
    } finally {
      loader.setLoading(false);
    }
    return;
  }

  if (activeLesson.value === "add") {
    const newLesson = {
      ...lesson,
      uniqueId: generateUniqueId("lesson"),
      deletedFileIds:
        deletedFileIds.length > 0 ? [...deletedFileIds] : undefined,
    };
    localLessons.value.push(newLesson);
  } else if (typeof activeLesson.value === "number") {
    const index = activeLesson.value;
    localLessons.value[index] = {
      ...localLessons.value[index],
      ...lesson,
      deletedFileIds:
        deletedFileIds.length > 0 ? [...deletedFileIds] : undefined,
    };
  }

  hasUnsavedChanges.value = false;
  formKey.value++;
  activeLesson.value = null;
};

const handleDelete = (index: number) => {
  const lesson = localLessons.value[index];

  if (lesson?.id) {
    deletedLessonIds.value.push(lesson.id);
  }

  localLessons.value.splice(index, 1);
  if (activeLesson.value === index) {
    activeLesson.value = null;
  } else if (
    typeof activeLesson.value === "number" &&
    activeLesson.value > index
  ) {
    activeLesson.value--;
  }
};

const handleDragEnd = () => {
  localLessons.value.forEach((lesson, index) => {
    lesson.position = index;
  });
};

const buildSingleLessonFormData = (
  lesson: LessonData,
  deletedFileIds: number[],
): FormData => {
  const formData = new FormData();

  formData.append(`Title`, lesson.title);
  formData.append(`Description`, lesson.description || "");
  formData.append(`Type`, (lesson.fileType || 1).toString());
  formData.append(`Position`, (lesson.position || 0).toString());

  if (lesson.id) {
    formData.append(`LessonId`, lesson.id.toString());
  }

  if (lesson.files && lesson.files.length > 0) {
    lesson.files.forEach((file) => {
      if (file.file) {
        formData.append(`Files`, file.file);
      }
    });
  }

  if (deletedFileIds.length > 0) {
    deletedFileIds.forEach((id) => {
      formData.append(`DeletedFileIds`, id.toString());
    });
  }

  if (deletedLessonIds.value.length > 0) {
    deletedLessonIds.value.forEach((id) => {
      formData.append(`DeleteLessonIds`, id.toString());
    });
  }

  return formData;
};

const buildLessonsFormData = (): FormData => {
  const formData = new FormData();

  localLessons.value.forEach((lesson, index) => {
    formData.append(`Lessons[${index}].Title`, lesson.title);
    formData.append(`Lessons[${index}].Description`, lesson.description || "");
    formData.append(
      `Lessons[${index}].Type`,
      (lesson.fileType || 1).toString(),
    );
    formData.append(`Lessons[${index}].Position`, index.toString());

    if (lesson.id) {
      formData.append(`Lessons[${index}].LessonId`, lesson.id.toString());
    }

    if (lesson.files && lesson.files.length > 0) {
      lesson.files.forEach((file, fileIndex) => {
        if (file.file) {
          formData.append(`Lessons[${index}].Files`, file.file);
        } else if (file.name) {
          formData.append(
            `Lessons[${index}].existingFiles[${fileIndex}]`,
            file.name,
          );
        }
      });
    }

    if (lesson.deletedFileIds && lesson.deletedFileIds.length > 0) {
      lesson.deletedFileIds.forEach((id) => {
        formData.append(`Lessons[${index}].DeleteFileIds`, id.toString());
      });
    }
  });

  if (deletedLessonIds.value.length > 0) {
    deletedLessonIds.value.forEach((id) => {
      formData.append(`DeletedLessonIds`, id.toString());
    });
  }

  return formData;
};

const handleSaveLessons = async () => {
  try {
    loader.setLoading(true, t("loading.savingLessons"));
    formError.value = "";
    const formData = buildLessonsFormData();

    const response = await libraryService.createUpdateLesson(
      props.moduleData?.id ?? 0,
      formData,
    );
    if (response.success) {
      hasUnsavedChanges.value = false;
      activeLesson.value = null;
      deletedLessonIds.value = [];
      if (props.courseId) {
        invalidateContent(props.courseId);
      }

      if (route.name === "addlessons" && route.params.id && route.params.type) {
        await router.push({
          name: "contentdetail",
          params: {
            id: route.params.id,
            type: route.params.type,
          },
        });
      } else {
        emit("refresh");
      }
    }
  } catch (error) {
    console.error("Error saving lessons:", error);
    formError.value =
      error instanceof Error
        ? error.message
        : t("Academy.library.lessonForm.errorSavingLesson");
  } finally {
    loader.setLoading(false);
  }
};
</script>

<style scoped></style>
