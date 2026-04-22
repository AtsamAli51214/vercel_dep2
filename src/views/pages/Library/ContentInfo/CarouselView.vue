<template>
  <Carousel
    v-if="files && files.length > 0"
    :value="files"
    :numVisible="1"
    :numScroll="1"
    circular
    :showNavigators="files.length > 1"
    :showIndicators="files.length > 1"
  >
    <template #item="slotProps">
      <div class="mb-4">
        <div class="relative mx-auto">
          <img
            v-if="isImage(slotProps.data)"
            :key="`img-${slotProps.data.id}`"
            :src="
              (slotProps.data.thumbnail || slotProps.data.url) +
              ((slotProps.data.thumbnail || slotProps.data.url)?.includes(
                'imgix.net',
              )
                ? '?auto=format'
                : '')
            "
            :alt="slotProps.data.fileName"
            class="w-full rounded-xl object-contain max-h-[600px]"
          />

          <VimeoPlayer
            v-else-if="isVideo(slotProps.data)"
            :key="`video-${slotProps.data.id}`"
            :video-id="slotProps.data.url"
            class="w-full rounded-xl"
          />

          <PdfViewer
            v-else-if="isPdf(slotProps.data)"
            :key="`pdf-${slotProps.data.id}`"
            :pdfUrl="slotProps.data.url"
          />
        </div>
      </div>
    </template>
  </Carousel>
</template>

<script setup lang="ts">
import VimeoPlayer from "@/components/base/VimeoPlayer.vue";
import PdfViewer from "@/components/base/PdfViewer.vue";

interface FileItem {
  id: number;
  url: string;
  publicId: string;
  thumbnail: string;
  fileName: string;
  size: number;
  duration: number | null;
  width: number;
  height: number;
}

defineProps<{
  files?: FileItem[];
  fileType?: number;
}>();

const isImage = (file: FileItem) => {
  if (!file.fileName) return false;
  const imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp"];
  return imageExtensions.some((ext) =>
    file.fileName.toLowerCase().endsWith(ext),
  );
};

const isVideo = (file: FileItem) => {
  if (!file.fileName && !file.url) return false;
  const videoExtensions = [".mp4", ".mov", ".avi", ".webm"];
  return (
    (file.fileName &&
      videoExtensions.some((ext) =>
        file.fileName.toLowerCase().endsWith(ext),
      )) ||
    (file.url && file.url.includes("vimeo.com"))
  );
};

const isPdf = (file: FileItem) => {
  if (!file.fileName) return false;
  return file.fileName.toLowerCase().endsWith(".pdf");
};
</script>

<style scoped>
:deep(.p-carousel-indicators) {
  padding: 1rem;
}

:deep(.p-carousel-indicator button) {
  width: 2rem;
  height: 0.5rem;
  border-radius: 0.25rem;
}
</style>
