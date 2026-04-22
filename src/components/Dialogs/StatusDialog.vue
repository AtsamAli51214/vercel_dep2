<template>
  <Dialog
    v-model:visible="isVisible"
    modal
    :closable="false"
    :draggable="false"
    :showHeader="false"
    :showFooter="false"
    :pt="{
      root: { class: 'max-w-2xl w-md m-2 rounded-2xl!' },
      content: { class: 'p-0!' },
    }"
  >
    <div class="flex flex-col gap-2 p-8">
      <div class="flex items-start justify-between">
        <img :src="statusConfig" :alt="props.type" class="w-8" />
        <img
          :src="CloseIcon"
          alt="close"
          class="cursor-pointer w-3"
          @click="
            emit('close');
            isVisible = false;
          "
        />
      </div>

      <span class="text-lg font-semibold text-primary!">
        {{ title }}
      </span>

      <p v-if="message" class="text-gray-600 text-sm">
        {{ message }}
      </p>

      <div v-if="showConfirmButton || showCancelButton" class="flex gap-4">
        <Button
          v-if="showCancelButton"
          :label="cancelButtonText"
          outlined
          @click="
            emit('cancel');
            isVisible = false;
          "
          fluid
          severity="secondary"
        />
        <Button
          v-if="showConfirmButton"
          :label="confirmButtonText"
          @click="
            emit('confirm');
            isVisible = false;
          "
          fluid
          :severity="props.type == 'danger' ? props.type : ''"
        />
      </div>
    </div>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import Dialog from "primevue/dialog";
import Button from "primevue/button";
import {
  CloseIcon,
  ErrorIcon,
  SuccessIcon,
  WarningIcon,
  InfoIcon,
} from "@/assets/images";

type StatusType = "success" | "danger" | "warn" | "info";

interface Props {
  visible: boolean;
  type?: StatusType;
  title: string;
  message?: string;
  confirmButtonText?: string;
  cancelButtonText?: string;
  showConfirmButton?: boolean;
  showCancelButton?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  type: "success",
  confirmButtonText: "Go to Login",
  cancelButtonText: "Cancel",
  showConfirmButton: false,
  showCancelButton: false,
});

const emit = defineEmits<{
  "update:visible": [value: boolean];
  confirm: [];
  cancel: [];
  close: [];
}>();

const isVisible = ref(props.visible);

watch(
  () => props.visible,
  (newVal) => {
    isVisible.value = newVal;
  },
);

watch(isVisible, (newVal) => {
  emit("update:visible", newVal);
});

const statusConfig = computed(() => {
  const configs = {
    success: SuccessIcon,
    danger: ErrorIcon,
    warn: WarningIcon,
    info: InfoIcon,
  };
  return configs[props.type];
});
</script>

<style scoped></style>
