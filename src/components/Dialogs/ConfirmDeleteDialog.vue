<script setup>
import { ref, computed } from "vue";
import { useConfirm } from "primevue/useconfirm";
import { ErrorIcon } from "@/assets/images";
import { showWarning } from "@/utils/toast";

const props = defineProps({
  group: { type: String, required: true },
  requireReason: { type: Boolean, default: false },
  minReasonLength: { type: Number, default: 20 },
});

const emit = defineEmits(["accept", "reject"]);

const confirm = useConfirm();

const reason = ref("");
const isReasonValid = computed(
  () => reason.value.trim().length >= props.minReasonLength,
);

const showConfirm = ({
  message,
  icon = "pi pi-question-circle",
  acceptLabel = "Delete",
  rejectLabel = "Cancel",
  severity = "danger",
  target = null,
}) => {
  confirm.require({
    target,
    group: props.group,
    message,
    icon,
    acceptProps: { label: acceptLabel, icon: "pi pi-check", severity },
    rejectProps: {
      label: rejectLabel,
      icon: "pi pi-times",
      severity: "secondary",
      outlined: true,
    },
    accept: async () => {
      if (props.requireReason && !isReasonValid.value) {
        showWarning(
          `Please enter at least ${props.minReasonLength} characters`,
          t,
        );
        return;
      }
      emit("accept", reason.value || true);
      reason.value = "";
    },
    reject: () => {
      emit("reject");
      reason.value = "";
    },
  });
};

defineExpose({ showConfirm });
</script>
<template>
  <ConfirmPopup :group="group">
    <template #message="slotProps">
      <div class="p-4">
        <slot name="message" v-bind="slotProps">
          <div class="flex flex-col gap-2 mb-2 align-items-center">
            <img :src="ErrorIcon" alt="error" class="w-6" />
            <p class="font-medium text-primary!">
              {{ slotProps.message.message }}
            </p>
          </div>
        </slot>

        <div v-if="requireReason">
          <label for="reason"
            >Reason (at least {{ minReasonLength }} characters):</label
          >
          <Textarea
            id="reason"
            v-model="reason"
            autoResize
            rows="3"
            fluid
            placeholder="Enter reason..."
          />
          <small v-if="!isReasonValid" class="p-invalid">
            Please enter at least {{ minReasonLength }} characters.
          </small>
        </div>
      </div>
    </template>
  </ConfirmPopup>
</template>
