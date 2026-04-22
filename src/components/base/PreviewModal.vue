<template>
  <Teleport to="body">
    <div
      v-if="isOpen"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      @click.self="closeModal"
      role="dialog"
      aria-modal="true"
      :aria-label="alt || 'Image viewer'"
    >
      <div
        class="relative bg-white rounded-lg w-[690px] h-[444px] border-2 border-[#D9E0E4] overflow-hidden"
      >
        <img
          v-if="!isVideo"
          :src="imageSrc"
          :alt="alt"
          class="w-[690px] h-[440px] object-contain"
          @error="handleImageError"
        />

        <div v-else class="relative w-full h-full">
          <video
            ref="videoRef"
            :src="imageSrc"
            class="w-[690px] h-[390px] object-contain"
            @loadedmetadata="onLoadedMetadata"
            @timeupdate="onTimeUpdate"
            @ended="onVideoEnded"
            @click="togglePlayPause"
          >
            Your browser does not support the video tag.
          </video>

          <div
            class="absolute bottom-0 left-0 right-0 p-3 text-white bg-black bg-opacity-75"
          >
            <div class="flex items-center gap-3">
              <button
                @click="togglePlayPause"
                class="flex items-center justify-center w-8 h-8 transition-colors rounded hover:bg-white hover:bg-opacity-20"
                type="button"
                :aria-label="isPlaying ? 'Pause video' : 'Play video'"
              >
                <img
                  :src="isPlaying ? Pause : Play"
                  :alt="isPlaying ? 'Pause' : 'Play'"
                  class="w-4 h-4"
                />
              </button>

              <div class="flex items-center flex-1 gap-2">
                <span class="text-xs">{{ formatTime(currentTime) }}</span>
                <div
                  class="flex-1 h-2 bg-gray-600 rounded cursor-pointer"
                  @click="seekTo"
                >
                  <div
                    class="h-full transition-all duration-150 bg-white rounded"
                    :style="{ width: `${progress}%` }"
                  ></div>
                </div>
                <span class="text-xs">{{ formatTime(duration) }}</span>
              </div>
            </div>
          </div>
        </div>

        <button
          @click="closeModal"
          class="absolute top-6 right-6 hover:opacity-80 transition-opacity z-10"
          type="button"
          :aria-label="`Close ${isVideo ? 'video player' : 'image viewer'}`"
        >
          <img :src="CloseIconGeneric" alt="Close" class="h-[27px] w-[27px]" />
        </button>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { watch, ref, computed } from "vue";
import { CloseIconGeneric, Play, Pause } from "@/assets/images";

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
  imageSrc: {
    type: String,
    required: true,
  },
  alt: {
    type: String,
    default: "Image",
  },
  mediaType: {
    type: String,
    default: "image",
    validator: (value: string) => ["image", "video"].includes(value),
  },
});

const emit = defineEmits(["close", "image-error"]);

const videoRef = ref<HTMLVideoElement | null>(null);
const isPlaying = ref(false);
const currentTime = ref(0);
const duration = ref(0);
const progress = ref(0);

const isVideo = computed(() => props.mediaType === "video");

const closeModal = () => {
  if (isVideo.value && videoRef.value) {
    videoRef.value.pause();
    isPlaying.value = false;
  }
  emit("close");
};

const handleImageError = (event: Event) => {
  emit("image-error", event);
};

const togglePlayPause = () => {
  if (!videoRef.value) return;

  if (isPlaying.value) {
    videoRef.value.pause();
  } else {
    videoRef.value.play();
  }
  isPlaying.value = !isPlaying.value;
};

const onLoadedMetadata = () => {
  if (videoRef.value) {
    duration.value = videoRef.value.duration;
  }
};

const onTimeUpdate = () => {
  if (videoRef.value) {
    currentTime.value = videoRef.value.currentTime;
    progress.value = (currentTime.value / duration.value) * 100;
  }
};

const onVideoEnded = () => {
  isPlaying.value = false;
  progress.value = 0;
  currentTime.value = 0;
};

const seekTo = (event: MouseEvent) => {
  if (!videoRef.value) return;

  const rect = (event.target as HTMLElement).getBoundingClientRect();
  const clickX = event.clientX - rect.left;
  const percentage = clickX / rect.width;
  const seekTime = percentage * duration.value;

  videoRef.value.currentTime = seekTime;
  currentTime.value = seekTime;
  progress.value = percentage * 100;
};

const formatTime = (time: number) => {
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

const handleKeydown = (event: KeyboardEvent) => {
  if (!props.isOpen) return;

  if (event.key === "Escape") {
    closeModal();
  } else if (isVideo.value && event.key === " ") {
    event.preventDefault();
    togglePlayPause();
  }
};

watch(
  () => props.isOpen,
  (newValue) => {
    if (newValue) {
      document.addEventListener("keydown", handleKeydown);
      document.body.style.overflow = "hidden";
    } else {
      document.removeEventListener("keydown", handleKeydown);
      document.body.style.overflow = "";

      if (isVideo.value) {
        isPlaying.value = false;
        currentTime.value = 0;
        progress.value = 0;
      }
    }
  },
);
</script>
