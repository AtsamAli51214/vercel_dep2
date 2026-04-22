<template>
  <div class="flex flex-col gap-4">
    <div>
      <div class="font-medium mb-2.5">
        {{ t("Academy.library.fileUpload.formContent") }}
      </div>
      <BaseEditor
        v-model="description"
        :showImage="true"
        :placeholder="t('Academy.library.fileUpload.formDescription')"
      />
    </div>

    <BaseFileUpload
      v-model="fileValue"
      :label="t('Academy.library.fileUpload.formUploadMedia')"
      accept=".mp4,.mov,.jpg,.jpeg,.png,.pdf"
      :maxSizeMB="100"
      :allowedTypes="['video/mp4', 'video/quicktime', 'image/jpeg', 'image/png', 'application/pdf']"
      :multiple="multiple"
      :error="fileError"
      :existingFiles="existingFiles"
      @existingFileRemoved="handleExistingFileRemoved"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import BaseEditor from "@/components/base/BaseEditor.vue";
import BaseFileUpload from "@/components/base/BaseFileUpload.vue";
import type { ModuleFile } from "./types";

interface Props {
  description?: string;
  file?: File | null;
  files?: File[];
  existingFiles?: ModuleFile[];
  fileError?: string;
  multiple?: boolean;
}

const description = defineModel<string>("description", { required: true });

const props = withDefaults(defineProps<Props>(), {
  description: "",
  files: () => [],
  existingFiles: () => [],
  fileError: "",
  multiple: false,
});

const emit = defineEmits<{
  "update:file": [value: File | null];
  "update:files": [value: File[]];
  existingFileRemoved: [index: number];
  miscSelected: [items: any[]];
}>();

const handleExistingFileRemoved = (index?: number) => {
  emit("existingFileRemoved", index ?? 0);
};

const { t } = useI18n();

const fileValue = computed({
  get: () => (props.multiple ? props.files : (props.file ?? null)),
  set: (value) => {
    if (props.multiple) {
      emit("update:files", value as File[]);
    } else {
      emit("update:file", value as File | null);
    }
  },
});
</script>

<style scoped></style>
