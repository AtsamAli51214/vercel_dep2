<template>
  <div class="flex flex-col gap-6">
    <form @submit.prevent="onSubmit" class="flex flex-col gap-4">
      <div>
        <div class="font-medium mb-2.5">
          {{ t("Academy.library.lessonForm.formTitle") }}<span>*</span>
        </div>
        <InputText
          v-model="title"
          fluid
          :placeholder="t('Academy.library.lessonForm.formTitle')"
          :invalid="!!errors.title"
        />
        <small class="p-invalid" v-if="errors.title">
          {{ errors.title }}
        </small>
      </div>

      <FileForm
        v-model:fileType="fileType"
        v-model:description="description"
        v-model:files="files"
        :existing-files="existingFiles"
        :file-type-error="errors.fileType || ''"
        :file-error="errors.files || ''"
        :multiple="true"
        :radio-id-prefix="'lesson'"
        @existing-file-removed="handleExistingFileRemoved"
      />

      <div class="flex gap-4 w-1/2">
        <Button
          :label="t('app.cancel')"
          @click="handleCancel"
          outlined
          :size="isEditMode ? undefined : 'small'"
          severity="secondary"
          fluid
          type="button"
        />
        <Button
          :label="
            (isEditMode ? t('app.update') : t('app.save')) +
            ' ' +
            t('Academy.library.courseContent.lesson')
          "
          type="submit"
          :loading="loading"
          :disabled="loading"
          fluid
          :size="isEditMode ? undefined : 'small'"
        />
      </div>

      <Message v-if="formError" severity="error">{{ formError }}</Message>
    </form>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import FileForm from "./FileForm.vue";
import { useLessonForm } from "@/composables";
import type { LessonData } from "./types";

interface Props {
  lessonData?: LessonData;
  moduleId?: number;
}

const props = withDefaults(defineProps<Props>(), {
  lessonData: undefined,
  moduleId: undefined,
});

const emit = defineEmits<{
  lessonSaved: [lesson: LessonData, deletedFileIds: number[]];
  cancel: [];
  formChanged: [hasChanges: boolean];
}>();

const { t } = useI18n();

const {
  title,
  description,
  fileType,
  files,
  existingFiles,
  deletedFileIds,
  loading,
  formError,
  errors,
  isEditMode,
  onSubmit,
  removeExistingFile,
} = useLessonForm(
  { lessonData: props.lessonData },
  (event: string, payload?: any) => {
    if (event === "lessonSaved") {
      emit("lessonSaved", payload, deletedFileIds.value);
    } else if (event === "formChanged") {
      emit("formChanged", payload);
    }
  },
);

const handleCancel = () => {
  emit("cancel");
};

const handleExistingFileRemoved = (index: number) => {
  removeExistingFile(index);
};
</script>

<style scoped></style>
