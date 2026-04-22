<template>
  <div
    v-if="showDelete"
    class="absolute top-0 right-0 cursor-pointer"
    @click="$emit('remove')"
  >
    <img :src="MinusIcon" alt="Remove contact" />
  </div>

  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div class="">
      <div class="font-medium mb-2.5">
        {{ t("Clubs.contractDocs.formDocumentCategory") }}
      </div>
      <Select
        v-model="documentCategory"
        :options="categoryOptions"
        option-label="label"
        option-value="value"
        fluid
        :placeholder="t('Clubs.contractDocs.formDocumentCategory')"
        :invalid="!!errors.documentCategory"
      />
      <small class="p-invalid" v-if="errors.documentCategory">
        {{ errors.documentCategory }}
      </small>
    </div>

    <div class="md:col-span-2">
      <BaseFileUpload
        :model-value="file as File | null"
        @update:model-value="(val) => (file = val)"
        :label="t('Clubs.contractDocs.formUploadFile')"
        accept=".pdf,.doc,.docx,.xlsx"
        :error="errors.file"
        :existing-file-url="documentUrl"
        :existing-file-name="documentName"
        :helper-text="
          t('validation.supportedFormats', { formats: '.pdf,.doc,.docx,.xlsx' })
        "
        @existing-file-removed="removeExistingDocument"
      />
    </div>

    <template
      v-if="
        documentCategory === 'Contract' || documentCategory === 'Agreements'
      "
    >
      <div>
        <div class="font-medium mb-2.5">
          {{ t("Clubs.contractDocs.formStartDate") }}
        </div>
        <DatePicker
          v-model="startDatePickerModel"
          fluid
          :placeholder="t('Clubs.contractDocs.formStartDate')"
          dateFormat="dd/mm/yy"
          iconDisplay="input"
          :invalid="!!errors.startDate"
          showIcon
        />
        <small class="p-invalid" v-if="errors.startDate">
          {{ errors.startDate }}
        </small>
      </div>

      <div>
        <div class="font-medium mb-2.5">
          {{ t("Clubs.contractDocs.formEndDate") }}
        </div>
        <DatePicker
          v-model="endDatePickerModel"
          fluid
          :placeholder="t('Clubs.contractDocs.formEndDate')"
          dateFormat="dd/mm/yy"
          iconDisplay="input"
          showIcon
          :invalid="!!errors.endDate"
        />
        <small class="p-invalid" v-if="errors.endDate">
          {{ errors.endDate }}
        </small>
      </div>

      <div class="flex flex-col gap-2.5">
        <div class="font-medium">
          {{ t("Clubs.contractDocs.formtDuration") }}
        </div>
        <InputText
          :model-value="calculatedDuration"
          fluid
          :placeholder="t('Clubs.contractDocs.formtDuration')"
          disabled
        />
        <div class="flex items-center gap-2">
          <Checkbox
            v-model="autoRenewal"
            :binary="true"
            size="small"
            inputId="autoRenewal"
          />
          <label for="autoRenewal" class="text-sm">
            {{ t("Clubs.contractDocs.formAutoRenewal") }}
          </label>
        </div>
      </div>

      <div>
        <div class="font-medium mb-2.5">
          {{ t("Clubs.contractDocs.formAutoRenewallTill") }}
        </div>
        <Select
          v-model="autoRenewalTill"
          :options="autoRenewalOptions"
          option-label="label"
          option-value="value"
          :disabled="!autoRenewal"
          fluid
          :placeholder="t('Clubs.contractDocs.formAutoRenewallTill')"
          :invalid="!!errors.autoRenewalTill"
        />
        <small class="p-invalid" v-if="errors.autoRenewalTill">
          {{ errors.autoRenewalTill }}
        </small>
      </div>

      <div>
        <div class="font-medium mb-2.5">
          {{ t("Clubs.contractDocs.formNumberOfMembers") }}
          <small>({{ t("app.optional") }})</small>
        </div>
        <InputNumber
          v-model="numberOfMembers"
          :min="1"
          :max="100000000"
          fluid
          :placeholder="t('Clubs.contractDocs.formNumberOfMembers')"
          :invalid="!!errors.numberOfMembers"
        />
        <small class="p-invalid" v-if="errors.numberOfMembers">
          {{ errors.numberOfMembers }}
        </small>
      </div>

      <div>
        <div class="font-medium mb-2.5">
          {{ t("Clubs.contractDocs.formPrice") }}
        </div>
        <InputNumber
          v-model="price"
          :min="1"
          :max="99"
          suffix=" €"
          fluid
          :placeholder="t('Clubs.contractDocs.formPrice')"
          :invalid="!!errors.price"
        />
        <small class="p-invalid" v-if="errors.price">
          {{ errors.price }}
        </small>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { computed, watch, ref } from "vue";
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import { MinusIcon } from "@/assets/images";
import BaseFileUpload from "@/components/base/BaseFileUpload.vue";
import { createContractDocSchema } from "@/utils/validation";
import type { ContractDocument } from "@/types/common";
import {
  getDocumentCategoryOptions,
  getAutoRenewalOptions,
} from "@/constants/formOptions";
import { usePrimeVueDatePickerSync } from "@/composables/usePrimeVueDatePickerSync";

interface Props {
  initialDocument?: ContractDocument;
  showDelete?: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: "save", document: ContractDocument): void;
  (e: "remove"): void;
}>();

const { t } = useI18n();

const documentUrl = ref<string | undefined>(props.initialDocument?.documentUrl);
const documentName = ref<string | undefined>(
  props.initialDocument?.documentName,
);

const defaultDocument: ContractDocument = {
  documentCategory: "",
  file: null,
  startDate: null,
  endDate: null,
  autoRenewal: false,
  autoRenewalTill: undefined,
  numberOfMembers: 0,
  price: 0,
};

const { defineField, errors, validate } = useForm({
  validationSchema: toTypedSchema(createContractDocSchema(t)),
  initialValues: props.initialDocument
    ? {
        ...defaultDocument,
        ...props.initialDocument,
        price: props.initialDocument.price ?? 0,
      }
    : defaultDocument,
  validateOnMount: false,
});

const [documentCategory] = defineField("documentCategory");
const [file] = defineField("file");
const [startDate] = defineField("startDate");
const [endDate] = defineField("endDate");

const startDatePickerModel = usePrimeVueDatePickerSync(startDate);
const endDatePickerModel = usePrimeVueDatePickerSync(endDate);
const [autoRenewal] = defineField("autoRenewal");
const [autoRenewalTill] = defineField("autoRenewalTill");
const [numberOfMembers] = defineField("numberOfMembers");
const [price] = defineField("price");

const document = computed((): ContractDocument => {
  return {
    ...(props.initialDocument?.id && { id: props.initialDocument.id }),
    ...(props.initialDocument?.uniqueId && {
      uniqueId: props.initialDocument.uniqueId,
    }),
    ...(props.initialDocument?.fileIndex !== undefined && {
      fileIndex: props.initialDocument.fileIndex,
    }),
    documentCategory: documentCategory.value ?? "",
    file: file.value as File | null,
    documentUrl: documentUrl.value,
    documentName: documentName.value,
    startDate: startDate.value ?? null,
    endDate: endDate.value ?? null,
    autoRenewal: autoRenewal.value ?? false,
    autoRenewalTill: autoRenewalTill.value ?? undefined,
    numberOfMembers: numberOfMembers.value ?? 0,
    price: price.value ?? 0,
  };
});

const calculatedDuration = computed(() => {
  const start = startDate.value;
  const end = endDate.value;

  if (!start || !end) {
    return "";
  }

  const startDateObj = new Date(start);
  const endDateObj = new Date(end);

  if (isNaN(startDateObj.getTime()) || isNaN(endDateObj.getTime())) {
    return "";
  }

  if (endDateObj < startDateObj) {
    return "";
  }

  const diffTime = endDateObj.getTime() - startDateObj.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  const years = Math.floor(diffDays / 365);
  const months = Math.floor((diffDays % 365) / 30);
  const days = diffDays % 30;

  const parts: string[] = [];
  if (years > 0) {
    parts.push(`${years} ${years === 1 ? "year" : "years"}`);
  }
  if (months > 0) {
    parts.push(`${months} ${months === 1 ? "month" : "months"}`);
  }
  if (days > 0 && years === 0) {
    parts.push(`${days} ${days === 1 ? "day" : "days"}`);
  }

  return parts.length > 0 ? parts.join(", ") : "0 days";
});

watch(documentCategory, (newCategory, oldCategory) => {
  const requiresFields = ["Contract", "Offers"].includes(newCategory || "");
  const wasRequired = ["Contract", "Offers"].includes(oldCategory || "");

  if (
    requiresFields &&
    !wasRequired &&
    (price.value === 0 || price.value === null)
  ) {
    price.value = 3;
  }

  if (!requiresFields && wasRequired) {
    price.value = 0;
  }
});

watch(
  [
    documentCategory,
    file,
    startDate,
    endDate,
    autoRenewal,
    autoRenewalTill,
    numberOfMembers,
    price,
    documentUrl,
    documentName,
  ],
  () => {
    emit("save", document.value);
  },
);

defineExpose({
  validate,
});

const removeExistingDocument = () => {
  documentUrl.value = undefined;
  documentName.value = undefined;
};

const categoryOptions = computed(() => getDocumentCategoryOptions(t));

const autoRenewalOptions = computed(() => getAutoRenewalOptions(t));
</script>
