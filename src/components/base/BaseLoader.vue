<template>
  <Teleport v-if="!scoped" to="body">
    <Transition name="fade">
      <div v-if="loading" class="loader-backdrop" @click="handleBackdropClick">
        <div class="loader-container">
          <BounceLoader :loading="true" :color="color" :size="size" />
          <p v-if="message" class="loader-message">{{ message }}</p>
        </div>
      </div>
    </Transition>
  </Teleport>
  <Transition v-else name="fade">
    <div
      v-if="loading"
      class="loader-backdrop-scoped"
      @click="handleBackdropClick"
    >
      <div class="loader-container">
        <BounceLoader :loading="true" :color="color" :size="size" />
        <p v-if="message" class="loader-message-scoped">{{ message }}</p>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import BounceLoader from "vue-spinner/src/BounceLoader.vue";

interface Props {
  loading: boolean;
  message?: string;
  color?: string;
  size?: string;
  clickable?: boolean; // Allow clicking backdrop to dismiss (if needed)
  scoped?: boolean; // If true, loader is scoped to parent container instead of full screen
}

const props = withDefaults(defineProps<Props>(), {
  message: "",
  color: "#55417C",
  size: "50px",
  clickable: false,
  scoped: false,
});

const emit = defineEmits<{
  backdropClick: [];
}>();

const handleBackdropClick = () => {
  if (props.clickable) {
    emit("backdropClick");
  }
};
</script>

<style scoped>
@import "@/assets/styles/components/base-loader.css";
</style>
