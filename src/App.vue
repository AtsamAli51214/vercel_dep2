<script setup>
import { ref, onMounted } from "vue";
import { useToast } from "primevue/usetoast";
import { StatusDialog } from "@/components/Dialogs";
import { provideGlobalDialog } from "@/composables/useGlobalDialog";
import { setToastInstance } from "@/utils/toast";

const dialog = provideGlobalDialog();
const toast = useToast();

onMounted(() => {
  setToastInstance(toast);
});
</script>

<template>
  <ConfirmDialog />
  <Toast />
  <RouterView />
  <StatusDialog
    v-model:visible="dialog.visible.value"
    :type="dialog.config.value.type"
    :title="dialog.config.value.title"
    :message="dialog.config.value.message"
    :confirm-button-text="dialog.config.value.confirmButtonText"
    :cancel-button-text="dialog.config.value.cancelButtonText"
    :show-confirm-button="dialog.config.value.showConfirmButton"
    :show-cancel-button="dialog.config.value.showCancelButton"
    @confirm="dialog.handleConfirm"
    @cancel="dialog.handleCancel"
  />
</template>

<style scoped></style>
