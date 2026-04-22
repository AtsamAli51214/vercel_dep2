<script setup lang="ts">
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import ContractDocForm from "@/components/ContractDocForm.vue";
import type { ContractDocument } from "@/types/common";
import { clubService } from "@/services";
import { useAppLoader } from "@/composables";
import { showError, showSuccess } from "@/utils/toast";

interface Props {
  club?: { id: number };
}

const props = defineProps<Props>();

const model = defineModel<boolean>();
const emit = defineEmits<{
  (e: "refresh"): void;
}>();

const { t } = useI18n();
const loader = useAppLoader();

const contractDocFormRef = ref<InstanceType<typeof ContractDocForm> | null>(
  null,
);
const documentData = ref<ContractDocument>({
  documentCategory: "",
  file: null,
  startDate: null,
  endDate: null,
  autoRenewal: false,
  autoRenewalTill: undefined,
  numberOfMembers: 0,
  price: 3,
});

const updateDocument = (doc: ContractDocument) => {
  documentData.value = doc;
};

const handleSave = async () => {
  const result = await contractDocFormRef.value?.validate();
  if (!result?.valid) {
    showError(t("validation.pleaseFillAllRequiredFields"), t);
    return;
  }

  if (!documentData.value.file) {
    showError(t("validation.pleaseUploadFile"), t);
    return;
  }

  if (!props.club?.id) {
    showError(t("Clubs.noClubSelected"), t);
    return;
  }

  loader.setLoading(true);
  try {
    const formData = new FormData();
    formData.append("DocumentCategory", documentData.value.documentCategory);
    formData.append("ContractFile", documentData.value.file);
    formData.append(
      "StartDate",
      documentData.value.startDate?.toISOString() || "",
    );
    formData.append("EndDate", documentData.value.endDate?.toISOString() || "");
    formData.append("PricingModel", documentData.value.price.toString());

    if (documentData.value.autoRenewalTill) {
      formData.append(
        "AutoRenewalPeriod",
        documentData.value.autoRenewalTill.toString(),
      );
    }

    if (documentData.value.numberOfMembers) {
      formData.append(
        "NumberOfMembers",
        documentData.value.numberOfMembers.toString(),
      );
    }

    const response = await clubService.uploadContract(props.club.id, formData);

    if (response.success) {
      showSuccess(t("Clubs.contractUploadedSuccessfully"), t);
      emit("refresh");
      model.value = false;
    } else {
      showError(response.error || t("Clubs.errorUploadingContract"), t);
    }
  } catch (error) {
    console.error("Error uploading contract:", error);
    showError(t("Clubs.errorUploadingContract"), t);
  } finally {
    loader.setLoading(false);
  }
};
</script>

<template>
  <Dialog
    v-model:visible="model"
    :style="{ width: '650px' }"
    :header="t('Clubs.uploadContract')"
    :closable="false"
    modal
    class="p-fluid"
  >
    <ContractDocForm
      ref="contractDocFormRef"
      :show-delete="false"
      @save="updateDocument"
    />

    <template #footer>
      <Button
        :label="t('app.cancel')"
        severity="secondary"
        @click="model = false"
      />
      <Button :label="t('app.upload')" @click="handleSave" />
    </template>
  </Dialog>
</template>

<style scoped></style>
