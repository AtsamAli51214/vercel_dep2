<template>
  <div
    ref="videoContainer"
    class="w-full aspect-video rounded-xl overflow-hidden"
  />
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import Player from "@vimeo/player";

const props = defineProps<{ videoId: string }>();

const videoContainer = ref<HTMLElement | null>(null);
const error = ref<string | null>(null);

const extractedVideoId = computed(() => {
  const id = props.videoId;

  if (/^\d+$/.test(id)) {
    return id;
  }

  const playerMatch = id.match(/player\.vimeo\.com\/video\/(\d+)/);
  if (playerMatch) {
    return playerMatch[1];
  }

  const vimeoMatch = id.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) {
    return vimeoMatch[1];
  }

  return id;
});

onMounted(() => {
  if (!videoContainer.value) return;

  try {
    const player = new Player(videoContainer.value, {
      id: Number(extractedVideoId.value),
      responsive: true,
    });

    player.on("error", (e: any) => {
      console.error("Vimeo player error:", e);
      error.value =
        "Unable to load video. The video may be private or restricted.";
    });
  } catch (e) {
    console.error("Failed to initialize Vimeo player:", e);
    error.value = "Failed to initialize video player.";
  }
});
</script>
