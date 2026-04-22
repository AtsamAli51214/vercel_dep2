<script setup lang="ts">
import type { FileData } from "@/types/common";
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { VimeoPlayer } from "@/components/base";
import { FilePrimaryIcon } from "@/assets/images";
import {
  base64ToArrayBuffer,
  formatFileSize,
  saveByteArray,
} from "@/utils/helpers";

interface Props {
  fileData?: FileData;
}

const props = defineProps<Props>();
const { t } = useI18n();
const model = defineModel<boolean>();
const emit = defineEmits<{
  close: [];
}>();

const firstFile = computed(() => {
  if (props.fileData?.files && props.fileData.files.length > 0) {
    return props.fileData.files[0];
  }
  return undefined;
});

const downloadFile = () => {
  if (!firstFile.value?.url) return;
  let bytes = base64ToArrayBuffer(firstFile.value.url);
  let reportName = `${firstFile.value.fileName ?? "file"}_${new Date().toLocaleDateString()}.pdf`;
  saveByteArray(reportName, bytes);
};
</script>

<template>
  <Dialog
    v-model:visible="model"
    :style="{ width: '650px' }"
    :header="fileData?.title"
    :closable="false"
    modal
    class="p-fluid"
    :pt="{
      header: { class: 'pb-4!' },
      title: { class: 'text-primary font-Bold text-[1.75rem]!' },
    }"
  >
    <div class="flex flex-col gap-6">
      <img
        v-if="fileData?.type === 1 && firstFile"
        :src="
          (firstFile.thumbnail || firstFile.url) +
          (firstFile.thumbnail?.includes('imgix.net') ? '?auto=format' : '')
        "
        alt="File Preview"
        class="w-full rounded-xl"
      />
      <div class="flex flex-col gap-2" v-if="fileData?.description">
        <span class="text-xl font-medium">{{
          t("Academy.library.description")
        }}</span>
        <div
          class="text-sm text-text-1 description-context"
          v-html="fileData?.description"
        />
      </div>
      <VimeoPlayer
        v-if="fileData?.type === 2 && firstFile"
        :video-id="firstFile.url ?? ''"
      />
      <div
        v-if="fileData?.type === 3 && firstFile"
        class="p-4 border border-stroke bg-bg-light rounded-xl flex items-center justify-between"
      >
        <div class="flex items-center gap-4">
          <img :src="FilePrimaryIcon" alt="File Icon" class="w-6" />
          <div class="flex flex-col font-medium text-xs leading-5">
            <span class="text-primary font-medium">
              {{ firstFile.fileName }}
            </span>
            <span class="text-secondary-color">
              {{ formatFileSize(firstFile.size ?? 0) }}
            </span>
          </div>
        </div>
        <i
          class="pi pi-download cursor-pointer text-secondary-color"
          @click="downloadFile"
        />
      </div>
      <div class="flex py-2 w-72">
        <Button
          :label="t('app.close')"
          fluid
          @click="
            model = false;
            emit('close');
          "
        />
      </div>
    </div>
  </Dialog>
</template>

<style>
@import "@/assets/styles/components/base-editor.css";
</style>
