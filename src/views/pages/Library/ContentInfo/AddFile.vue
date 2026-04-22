<template>
  <div class="flex flex-col gap-6">
    <div class="flex flex-col">
      <span class="font-bold text-2xl text-primary">{{
        props.contentData?.title
      }}</span>
      <span class="font-medium text-secondary-color text-xs">
        {{ t("Academy.library.fileUpload.description") }}
      </span>
    </div>

    <div class="flex flex-col gap-4">
      <span class="font-bold text-xl">{{
        t("Academy.library.fileUpload.infoTitle")
      }}</span>
      <form @submit.prevent="onSubmit" class="flex flex-col gap-4">
        <div class="">
          <div class="font-medium mb-2.5">
            {{ t("Academy.library.fileUpload.formName") }}<span>*</span>
          </div>
          <InputText
            v-model="title"
            fluid
            :placeholder="t('Academy.library.formTitle')"
            :invalid="!!fieldErrors.title"
          />
          <small class="p-invalid" v-if="fieldErrors.title">
            {{ fieldErrors.title }}
          </small>
        </div>

        <FileForm
          v-if="isCourseFile"
          v-model:description="description"
          v-model:file="singleFile"
          :multiple="false"
          :file-error="fieldErrors.files || ''"
          :existingFiles="existingFiles"
          @existingFileRemoved="handleExistingFileRemoved"
          @miscSelected="handleMiscSelected"
        />
        <FileForm
          v-else
          v-model:description="description"
          v-model:files="files"
          :multiple="true"
          :file-error="fieldErrors.files || ''"
          :existingFiles="existingFiles"
          @existingFileRemoved="handleExistingFileRemoved"
          @miscSelected="handleMiscSelected"
        />

        <div class="flex gap-2 w-1/2">
          <Button
            v-if="
              !isEditMode &&
              !contentData?.isPublished &&
              !contentData?.isDraft &&
              contentData?.contentType !== 5
            "
            :label="t('app.saveAsDraft')"
            outlined
            @click="handleSaveAsDraft"
            fluid
          />
          <Button
            v-if="
              isEditMode &&
              props.contentData?.isDraft &&
              props.contentData?.contentType !== 5
            "
            @click="updateDraft"
            :label="t('app.updateDraft')"
            fluid
          />
          <Button
            type="submit"
            :label="
              isEditMode
                ? t(props.contentData?.isDraft ? 'app.publish' : 'app.update')
                : t('app.save')
            "
            fluid
          />
        </div>
      </form>

      <Message v-if="formError" severity="error">{{ formError }}</Message>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import FileForm from "./FileForm.vue";
import { useFileForm, useAppLoader, useContentCache } from "@/composables";
import { libraryService } from "@/services";
import { ContentData, FileData } from "@/types";

interface Props {
  contentData?: ContentData;
  fileData?: FileData;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  refresh: [];
  cancel: [];
  existingFileRemoved: [index: number];
}>();

const handleExistingFileRemoved = (index: number) => {
  removeExistingFile(index);
  emit("existingFileRemoved", index);
};

const { t } = useI18n();
const loader = useAppLoader();
const { invalidateContent } = useContentCache();

const isCourseFile = computed(() => props.contentData?.contentType === 5);

const {
  title,
  description,
  files,
  formError,
  fieldErrors,
  onSubmit,
  submitWithDraftFlag,
  isEditMode,
  setFieldValue,
  existingFiles,
  removeExistingFile,
} = useFileForm(
  { fileData: props.fileData },
  (event: string, ...args: unknown[]) => {
    if (event === "success") {
      const formData = args[0] as FormData;
      handleFilesUploaded(formData);
    }
  },
);

const singleFile = computed({
  get: () => (files.value && files.value.length > 0 ? files.value[0] : null),
  set: (value: File | null) => {
    setFieldValue("files", value ? [value] : []);
  },
});

const handleMiscSelected = (items: any[]) => {
  if (items.length > 0) {
    setFieldValue("exerciseId", items[0].id);
  } else {
    setFieldValue("exerciseId", undefined);
  }
};

const handleFilesUploaded = async (formData: FormData) => {
  try {
    loader.setLoading(true, t("loading.savingFile"));
    formError.value = "";
    const response = await libraryService.createUpdateContentFile(
      props.contentData?.id as number,
      props.contentData?.contentType as number,
      formData,
    );

    if (response.success) {
      invalidateContent(props.contentData?.id as number);
      emit("refresh");
    } else {
      formError.value = response.error || t("Academy.library.errorSavingFile");
    }
  } finally {
    loader.setLoading(false);
  }
};

const handleSaveAsDraft = async () => {
  await submitWithDraftFlag(
    !props.contentData?.isDraft,
    props.contentData?.isDraft,
  );
};

const updateDraft = async () => {
  await submitWithDraftFlag(
    props.contentData?.isDraft,
    !props.contentData?.isDraft,
  );
};
</script>

<style scoped></style>
