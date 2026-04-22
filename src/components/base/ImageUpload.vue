<template>
  <div class="image-upload-container">
    <div class="image-wrapper" @click="handleImageClick">
      <img
        :src="displayImage"
        :alt="altText"
        :class="[
          'profile-image',
          disabled && displayImage !== defaultImage ? 'cursor-pointer' : '',
        ]"
        @error="handleImageError"
      />
      <img
        v-if="!disabled"
        :src="UploadFileIcon"
        alt="camera"
        class="camera-overlay"
      />

      <small v-if="optional && !hasImage" class="text-primary">
        ({{ t("app.optional") }})
      </small>
      <small v-if="error" class="p-invalid">
        {{ error }}
      </small>
      <small
        v-if="hasImage && !disabled"
        class="text-red-500 cursor-pointer"
        @click.stop="resetPreview"
      >
        {{ t("app.remove") }}
      </small>
    </div>

    <input
      ref="fileInputRef"
      type="file"
      :accept="acceptAttribute"
      class="hidden-input"
      :disabled="disabled"
      @change="handleFileChange"
    />

    <PreviewModal
      :is-open="showImageModal"
      :image-src="selectedImage"
      :alt="selectedImageAlt"
      @close="closeImageModal"
      @image-error="handleImageError"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { UploadFileIcon, UploadCircle } from "@/assets/images";
import PreviewModal from "./PreviewModal.vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const props = defineProps({
  defaultImage: {
    type: String,
    default: UploadCircle,
  },
  altText: {
    type: String,
    default: "Upload image",
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  optional: {
    type: Boolean,
    default: false,
  },
  error: {
    type: String,
    default: "",
  },
  allowedTypes: {
    type: Array,
    default: () => ["image/jpeg", "image/jpg", "image/png", "image/webp"],
  },
  modelValue: {
    type: [File, null],
    default: null,
  },
});

const emit = defineEmits(["update:modelValue", "preview"]);

const fileInputRef = ref<HTMLInputElement | null>(null);
const imagePreview = ref<string | null>(null);
const isDefaultImageRemoved = ref(false);

const showImageModal = ref(false);
const selectedImage = ref("");
const selectedImageAlt = ref("");

const displayImage = computed(() => {
  if (isDefaultImageRemoved.value) {
    return imagePreview.value || UploadCircle;
  }
  return imagePreview.value || props.defaultImage || UploadCircle;
});

const hasImage = computed(() => {
  if (isDefaultImageRemoved.value) {
    return imagePreview.value !== null;
  }
  return (
    imagePreview.value !== null ||
    (props.defaultImage && props.defaultImage !== UploadCircle)
  );
});
const acceptAttribute = computed(() => {
  return props.allowedTypes.join(",");
});

watch(
  () => props.defaultImage,
  () => {
    isDefaultImageRemoved.value = false;
    imagePreview.value = null;
  },
);

const triggerFileInput = () => {
  if (!props.disabled && fileInputRef.value) {
    fileInputRef.value.click();
  }
};

const openImageModal = (imageSrc: string, alt = "Image") => {
  selectedImage.value = imageSrc;
  selectedImageAlt.value = alt;
  showImageModal.value = true;
};

const closeImageModal = () => {
  showImageModal.value = false;
  selectedImage.value = "";
  selectedImageAlt.value = "";
};

const handleImageClick = () => {
  if (props.disabled && displayImage.value !== UploadCircle) {
    openImageModal(displayImage.value, props.altText);
  } else {
    triggerFileInput();
  }
};

const handleImageError = (event: Event) => {
  const target = event.target as HTMLImageElement;
  if (target.src !== UploadCircle) {
    target.src = UploadCircle;
  }
};

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const files = target.files;

  if (!files || files.length === 0) return;

  const file = files[0];
  const reader = new FileReader();

  reader.onloadend = () => {
    const result = reader.result;
    if (typeof result === "string") {
      imagePreview.value = result;
      emit("preview", result);
    }
  };

  reader.readAsDataURL(file);
  isDefaultImageRemoved.value = false;
  emit("update:modelValue", file);
};

const resetPreview = () => {
  imagePreview.value = null;
  if (props.defaultImage && props.defaultImage !== UploadCircle) {
    isDefaultImageRemoved.value = true;
  }
  emit("update:modelValue", null);
  emit("preview", null);
  if (fileInputRef.value) {
    fileInputRef.value.value = "";
  }
};

defineExpose({ reset: resetPreview });
</script>

<style scoped>
@import "@/assets/styles/components/image-upload.css";
</style>
