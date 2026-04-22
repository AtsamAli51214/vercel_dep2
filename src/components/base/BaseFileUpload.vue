<template>
  <div class="flex flex-col gap-2.5">
    <div v-if="label" class="font-medium">
      {{ label }}<span v-if="required">*</span>
    </div>

    <div
      v-if="
        (!modelValue ||
          (Array.isArray(modelValue) && modelValue.length === 0)) &&
        !existingFileUrl &&
        (!existingFiles || existingFiles.length === 0) &&
        (!selectedMiscItems || selectedMiscItems.length === 0)
      "
      class="border border-stroke bg-bg-light rounded-lg p-8 flex flex-col items-center justify-center gap-4 transition-colors cursor-pointer h-64"
      :class="{
        'border-primary! bg-bg-light-white': isDragging,
        'border-red-500!': !!error,
      }"
      @click="triggerFileUpload"
      @dragover.prevent="handleDragOver"
      @dragleave.prevent="handleDragLeave"
      @drop.prevent="handleDrop"
    >
      <img :src="UploadIcon" alt="Upload Icon" class="w-9 h-9" />
      <div class="flex flex-col gap-3 text-center items-center">
        <span class="font-medium text-secondary-color">
          {{
            dragDropText || multiple
              ? t("Clubs.contractDocs.dragFilesHere")
              : t("Clubs.contractDocs.dragFileHere")
          }}
          <span class="text-primary cursor-pointer">
            {{ clickToUploadText || t("Clubs.contractDocs.clickToUpload") }}
          </span>
        </span>
        <span v-if="maxSizeMB" class="text-sm text-secondary-color">
          {{ t("validation.maxFileSize", { max: maxSizeMB }) }}
        </span>
        <template v-if="isMiscSelect">
          <Divider align="center" type="solid">
            <span class="text-secondary-color text-sm">{{
              t("validation.or")
            }}</span>
          </Divider>
          <div
            class="flex items-center gap-2 text-primary font-medium text-sm cursor-pointer"
            @click.stop="handleMiscSelect"
          >
            <img :src="BrowseIcon" alt="Browse Icon" class="w-4" />
            {{ t("Academy.library.browseFromMisc") }}
          </div>
        </template>
      </div>
    </div>

    <div
      v-else-if="
        multiple &&
        ((Array.isArray(modelValue) && modelValue.length > 0) ||
          selectedMiscItems.length > 0 ||
          (existingFiles && existingFiles.length > 0))
      "
      class="border border-dashed border-stroke bg-bg-light rounded-lg p-6 flex flex-col items-center justify-center gap-4 transition-colors cursor-pointer h-64"
      :class="{
        'border-primary! bg-bg-light-white': isDragging,
        'border-red-500!': !!error,
      }"
      @click="triggerFileUpload"
      @dragover.prevent="handleDragOver"
      @dragleave.prevent="handleDragLeave"
      @drop.prevent="handleDrop"
    >
      <img :src="UploadIcon" alt="Upload Icon" class="w-7 h-7" />
      <div class="flex flex-col gap-3 text-center">
        <span class="font-medium text-secondary-color text-sm">
          {{ dragDropText || t("Clubs.contractDocs.dragFilesHere") }}
          <span class="text-primary cursor-pointer">
            {{ clickToUploadText || t("Clubs.contractDocs.clickToUpload") }}
          </span>
        </span>
        <span v-if="maxSizeMB" class="text-xs text-secondary-color">
          {{ t("validation.maxFileSize", { max: maxSizeMB }) }}
        </span>
        <template v-if="isMiscSelect">
          <Divider align="center" type="solid">
            <span class="text-secondary-color text-sm bg-bg-light! p-2!">{{
              t("validation.or")
            }}</span>
          </Divider>
          <div
            class="flex items-center gap-2 text-primary font-medium"
            @click.stop="handleMiscSelect"
          >
            <img :src="BrowseIcon" alt="Browse Icon" class="w-4!" />
            {{ t("Academy.library.browseFromMisc") }}
          </div>
        </template>
      </div>
    </div>

    <span
      v-if="
        !error &&
        (multiple
          ? (!modelValue ||
              (Array.isArray(modelValue) && modelValue.length === 0)) &&
            selectedMiscItems.length === 0 &&
            (!existingFiles || existingFiles.length === 0)
          : !modelValue &&
            !existingFileUrl &&
            (!existingFiles || existingFiles.length === 0) &&
            selectedMiscItems.length === 0)
      "
      class="text-xs text-secondary-color"
    >
      {{ t("validation.supportedFormats", { formats: supportedFormats }) }}
    </span>

    <small class="p-invalid" v-if="error">
      {{ error }}
    </small>

    <div
      v-if="
        modelValue &&
        !Array.isArray(modelValue) &&
        typeof modelValue !== 'string'
      "
      class="p-4 border border-stroke bg-bg-light rounded-xl flex items-center justify-between"
    >
      <div class="flex items-center gap-4">
        <img :src="getFileIcon(modelValue.type)" alt="File Icon" class="w-6" />
        <div class="flex flex-col font-medium text-xs leading-5">
          <a
            v-if="canPreviewLocalFile(modelValue)"
            href="#"
            class="text-primary font-medium hover:underline"
            @click.prevent="previewLocalFile(modelValue)"
          >
            {{ modelValue.name }}
          </a>
          <span v-else class="text-primary font-medium">
            {{ modelValue.name }}
          </span>
          <span class="text-secondary-color">
            {{ formatFileSize(modelValue.size) }}
          </span>
        </div>
      </div>
      <img
        :src="CrossIcon"
        class="w-4 h-4 cursor-pointer"
        alt="Remove file"
        @click="removeFile"
      />
    </div>

    <div
      v-if="Array.isArray(modelValue) && modelValue.length > 0"
      class="flex flex-col gap-2"
    >
      <div
        v-for="(file, index) in modelValue"
        :key="index"
        class="p-4 border border-stroke bg-bg-light rounded-xl flex items-center justify-between"
      >
        <div class="flex items-center gap-4">
          <img :src="getFileIcon(file.type)" alt="File Icon" class="w-6" />
          <div class="flex flex-col font-medium text-xs leading-5">
            <a
              v-if="canPreviewLocalFile(file)"
              href="#"
              class="text-primary font-medium hover:underline"
              @click.prevent="previewLocalFile(file)"
            >
              {{ file.name }}
            </a>
            <span v-else class="text-primary font-medium">
              {{ file.name }}
            </span>
            <span class="text-secondary-color">
              {{ formatFileSize(file.size) }}
            </span>
          </div>
        </div>
        <img
          :src="CrossIcon"
          class="w-4 h-4 cursor-pointer"
          alt="Remove file"
          @click="removeFileAtIndex(index)"
        />
      </div>
    </div>

    <div
      v-if="existingFileUrl && !modelValue"
      class="p-4 border border-stroke bg-bg-light rounded-xl flex items-center justify-between"
    >
      <div class="flex items-center gap-4">
        <img
          :src="getFileIconByName(existingFileName)"
          alt="File Icon"
          class="w-6"
        />
        <div class="flex flex-col font-medium text-xs leading-5">
          <a
            :href="withImgixFormat(existingFileUrl)"
            target="_blank"
            rel="noopener noreferrer"
            class="text-primary font-medium hover:underline"
          >
            {{ existingFileName || "View File" }}
          </a>
        </div>
      </div>
      <img
        :src="CrossIcon"
        class="w-4 h-4 cursor-pointer"
        alt="Remove file"
        @click="removeExistingFile"
      />
    </div>

    <div
      v-if="existingFiles && existingFiles.length > 0"
      class="flex flex-col gap-2"
    >
      <div
        v-for="(file, index) in existingFiles"
        :key="file.id || index"
        class="p-4 border border-stroke bg-bg-light rounded-xl flex items-center justify-between"
      >
        <div class="flex items-center gap-4">
          <img
            :src="getFileIconForExisting(file)"
            alt="File Icon"
            class="w-6"
          />
          <div class="flex flex-col font-medium text-xs leading-5">
            <a
              v-if="existingFileViewHref(file)"
              :href="existingFileViewHref(file) as string"
              target="_blank"
              rel="noopener noreferrer"
              class="text-primary font-medium hover:underline"
            >
              {{ file.name }}
            </a>
            <span v-else class="text-primary font-medium">
              {{ file.name }}
            </span>
            <span class="text-secondary-color">
              {{ formatFileSize(file.size) }}
            </span>
          </div>
        </div>
        <img
          :src="CrossIcon"
          class="w-4 h-4 cursor-pointer"
          alt="Remove file"
          @click="removeExistingFileAtIndex(index)"
        />
      </div>
    </div>

    <div
      v-if="selectedMiscItems && selectedMiscItems.length > 0"
      class="flex flex-col gap-2"
    >
      <div
        v-for="(item, index) in selectedMiscItems"
        :key="item.id || index"
        class="p-4 border border-stroke bg-bg-light rounded-xl flex items-center justify-between"
      >
        <div class="flex items-center gap-4">
          <img :src="MiscIcon" alt="Misc Icon" class="w-6" />
          <div class="flex flex-col font-medium text-xs leading-5">
            <span class="text-primary font-medium">
              {{ item.title }}
            </span>
          </div>
        </div>
        <img
          :src="CrossIcon"
          class="w-4 h-4 cursor-pointer"
          alt="Remove item"
          @click="removeMiscItem(item)"
        />
      </div>
    </div>

    <input
      ref="fileInputRef"
      type="file"
      class="hidden"
      :accept="accept"
      :multiple="multiple"
      @change="handleFileUpload"
    />

    <SelectFromMisc
      v-if="isMiscSelectDialogOpen"
      v-model="isMiscSelectDialogOpen"
      :multiple="multiple"
      @selectedItems="handleSelectedItems"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useI18n } from "vue-i18n";
import {
  BrowseIcon,
  CameraIcon,
  CrossIcon,
  FilePrimaryIcon,
  UploadIcon,
  VideoIcon,
  MiscIcon,
} from "@/assets/images";
import { formatFileSize } from "@/utils/helpers";

interface ExistingFile {
  id?: number;
  name: string;
  size: number;
  type: string;
  url?: string;
}

interface Props {
  modelValue?: File | File[] | string | null;
  label?: string;
  required?: boolean;
  accept?: string;
  maxSizeMB?: number;
  allowedTypes?: string[];
  multiple?: boolean;
  error?: string;
  existingFileUrl?: string;
  existingFileName?: string;
  existingFiles?: ExistingFile[];
  dragDropText?: string;
  clickToUploadText?: string;
  isMiscSelect?: boolean;
  helperText?: string;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: null,
  label: "",
  required: false,
  accept: ".pdf,.doc,.docx,.xlsx",
  maxSizeMB: 5,
  allowedTypes: undefined,
  multiple: false,
  error: "",
  existingFileUrl: "",
  existingFileName: "",
  existingFiles: () => [],
  helperText: "",
  isMiscSelect: false,
});

const emit = defineEmits<{
  "update:modelValue": [value: File | File[] | null];
  fileRemoved: [];
  existingFileRemoved: [index?: number];
  miscSelected: [items: any[]];
}>();

const supportedFormats = computed(() => {
  const list = props.accept?.split(",") || [];
  if (list.length <= 2)
    return list.join(` ${t("validation.unableToDelete.and")} `);
  return `${list.slice(0, -1).join(", ")} ${t("validation.unableToDelete.and")} ${list[list.length - 1]}`;
});

const { t } = useI18n();
const fileInputRef = ref<HTMLInputElement>();
const isDragging = ref(false);
const isMiscSelectDialogOpen = ref(false);
const selectedMiscItems = ref<any[]>([]);

const triggerFileUpload = () => {
  fileInputRef.value?.click();
};

const handleMiscSelect = () => {
  isMiscSelectDialogOpen.value = true;
};

const handleSelectedItems = (items: any[]) => {
  selectedMiscItems.value = items;
  emit("miscSelected", items);
  isMiscSelectDialogOpen.value = false;
};

const removeMiscItem = (item: any) => {
  const index = selectedMiscItems.value.findIndex((i) => i.id === item.id);
  if (index > -1) {
    selectedMiscItems.value.splice(index, 1);
    emit("miscSelected", selectedMiscItems.value);
  }
};

const handleFileUpload = (event: Event) => {
  const target = event.target as HTMLInputElement;

  if (props.multiple) {
    const newFiles = target.files ? Array.from(target.files) : [];
    if (newFiles.length > 0) {
      const existingFiles = Array.isArray(props.modelValue)
        ? props.modelValue
        : [];
      emit("update:modelValue", [...existingFiles, ...newFiles]);
    }
  } else {
    const file = target.files?.[0];
    if (file) {
      emit("update:modelValue", file);
    }
  }

  if (target) {
    target.value = "";
  }
};

const handleDragOver = () => {
  isDragging.value = true;
};

const withImgixFormat = (url: string): string => {
  if (!url || !url.includes("imgix.net")) return url;
  if (url.includes("auto=format")) return url;
  return `${url}${url.includes("?") ? "&" : "?"}auto=format`;
};

const existingFileViewHref = (file: ExistingFile): string | undefined => {
  if (!file.url) return undefined;
  return withImgixFormat(file.url);
};

const getFileIconForExisting = (file: ExistingFile) => {
  if (file.type?.includes("/")) {
    return getFileIcon(file.type);
  }
  return getFileIconByName(file.name) ?? FilePrimaryIcon;
};

const canPreviewLocalFile = (file: File) => {
  const mime = file.type;
  return (
    mime.startsWith("image/") ||
    mime.startsWith("video/") ||
    mime === "application/pdf"
  );
};

const previewLocalFile = (file: File) => {
  if (!canPreviewLocalFile(file)) return;
  const url = URL.createObjectURL(file);
  const opened = window.open(url, "_blank", "noopener,noreferrer");
  if (opened) {
    setTimeout(() => URL.revokeObjectURL(url), 120_000);
  } else {
    URL.revokeObjectURL(url);
  }
};

const getFileIcon = (fileType: string) => {
  if (fileType.startsWith("image/")) return CameraIcon;
  if (fileType.startsWith("video/")) return VideoIcon;
  if (fileType.includes("pdf")) return FilePrimaryIcon;
  return FilePrimaryIcon;
};

const getFileIconByName = (fileName: string) => {
  if (fileName) {
    const extension = fileName.split(".").pop()?.toLowerCase();

    if (
      ["jpg", "jpeg", "png", "gif", "webp", "svg", "bmp"].includes(
        extension || "",
      )
    ) {
      return CameraIcon;
    }

    if (
      ["mp4", "avi", "mov", "wmv", "flv", "webm", "mkv"].includes(
        extension || "",
      )
    ) {
      return VideoIcon;
    }

    if (extension === "pdf") {
      return FilePrimaryIcon;
    }
  }
};

const handleDragLeave = () => {
  isDragging.value = false;
};

const handleDrop = (event: DragEvent) => {
  isDragging.value = false;

  if (props.multiple) {
    const newFiles = event.dataTransfer?.files
      ? Array.from(event.dataTransfer.files)
      : [];
    if (newFiles.length > 0) {
      const existingFiles = Array.isArray(props.modelValue)
        ? props.modelValue
        : [];
      emit("update:modelValue", [...existingFiles, ...newFiles]);
    }
  } else {
    const file = event.dataTransfer?.files[0];
    if (file) {
      emit("update:modelValue", file);
    }
  }
};

const removeFile = () => {
  emit("update:modelValue", null);
  emit("fileRemoved");
};

const removeFileAtIndex = (index: number) => {
  if (Array.isArray(props.modelValue)) {
    const updatedFiles = props.modelValue.filter((_, i) => i !== index);
    emit("update:modelValue", updatedFiles.length > 0 ? updatedFiles : null);
    if (updatedFiles.length === 0) {
      emit("fileRemoved");
    }
  }
};

const removeExistingFile = () => {
  emit("existingFileRemoved");
};

const removeExistingFileAtIndex = (index: number) => {
  emit("existingFileRemoved", index);
};
</script>

<style>
.p-divider-content {
  background: var(--color-bg-light) !important;
}
</style>
