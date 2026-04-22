<template>
  <form
    @submit.prevent="
      validate();
      emit('next');
    "
    class="grid grid-cols-1 md:grid-cols-2 gap-4"
  >
    <div class="flex flex-col items-center md:items-start md:col-span-2 mb-10">
      <ImageUpload
        :model-value="imageFile as File | null"
        @update:model-value="imageFile = $event"
        :default-image="currentImageUrl || UploadCircle"
        alt-text="Club Logo"
        :disabled="loading || isSubmitting"
        optional
        size="md"
        :max-size="FORM_CONFIG.image.maxSize"
        :min-size="FORM_CONFIG.image.minSize"
        :validate-dimensions="FORM_CONFIG.image.validateDimensions"
        :allowed-types="[...FORM_CONFIG.image.allowedTypes]"
      />
      <small class="p-invalid" v-if="imageFileError">
        {{ imageFileError }}
      </small>
    </div>
    <div class="">
      <div class="font-medium mb-2.5">
        {{ t("Clubs.clubDetails.formName") }}
      </div>
      <InputText
        v-model="name"
        fluid
        :placeholder="t('Clubs.clubDetails.formName')"
        :invalid="!!nameError"
      />
      <small class="p-invalid" v-if="nameError">
        {{ nameError }}
      </small>
    </div>
    <div class="">
      <div class="font-medium mb-2.5">
        {{ t("Clubs.clubDetails.formCountry") }}
      </div>
      <CountrySelect
        v-model="country"
        :placeholder="t('Clubs.clubDetails.formCountry')"
        :invalid="!!countryError"
        @change="onCountryChange"
      />
      <small class="p-invalid" v-if="countryError">
        {{ countryError }}
      </small>
    </div>
    <div class="">
      <div class="font-medium mb-2.5">
        {{ t("Clubs.clubDetails.formFederation") }}
      </div>
      <Select
        v-model="federationId"
        :options="federationOptions"
        option-label="label"
        option-value="value"
        fluid
        :placeholder="t('Clubs.clubDetails.formFederation')"
        :invalid="!!federationIdError"
        :loading="federationsLoading"
        @change="onFederationChange"
        :disabled="!country || federationsLoading"
      />
      <small class="p-invalid" v-if="federationIdError">
        {{ federationIdError }}
      </small>
    </div>
    <div class="">
      <div class="font-medium mb-2.5">
        {{ t("Users.emailMemberId") }}
      </div>
      <InputText
        v-model="email"
        type="email"
        fluid
        :placeholder="t('Users.emailMemberId')"
        :invalid="!!emailError"
      />
      <small class="p-invalid" v-if="emailError">
        {{ emailError }}
      </small>
    </div>
    <div class="">
      <div class="font-medium mb-2.5">
        {{ t("Clubs.clubDetails.formSupplier") }}
      </div>
      <Select
        v-model="supplierId"
        :options="suppliersOptions"
        option-label="label"
        option-value="value"
        fluid
        :placeholder="t('Clubs.clubDetails.formSupplier')"
        :invalid="!!supplierIdError"
        :loading="suppliersLoading"
        :disabled="!federationId || suppliersLoading"
      />
      <small class="p-invalid" v-if="supplierIdError">
        {{ supplierIdError }}
      </small>
    </div>
    <div class="">
      <div class="font-medium mb-2.5">
        {{ t("Clubs.clubDetails.formLabel") }}
        <small class="text-gray-500">({{ t("app.optional") }})</small>
      </div>
      <Select
        v-model="labelId"
        :options="labelOptions"
        option-label="label"
        option-value="value"
        fluid
        :placeholder="t('Clubs.clubDetails.formLabel')"
        :invalid="!!labelIdError"
      />
      <small class="p-invalid" v-if="labelIdError">
        {{ labelIdError }}
      </small>
    </div>
    <Button
      v-if="!isEditMode"
      :label="t('app.next')"
      fluid
      type="submit"
      class="mt-8"
    />
  </form>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { UploadCircle } from "@/assets/images";
import { useClubDetailsStep } from "@/composables";
import CountrySelect from "@/components/CountrySelect.vue";
import ImageUpload from "@/components/base/ImageUpload.vue";
import { FORM_CONFIG } from "@/constants/common";
import { getClubLabelOptions } from "@/constants/formOptions";
import { computed, ref, watch } from "vue";
import type { ClubDetailsFormData, Federation, Supplier } from "@/types";
import { federationService, supplierService } from "@/services";

const { t } = useI18n();

interface Props {
  initialData?: Partial<ClubDetailsFormData>;
  isEditMode?: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: "validated", data: ClubDetailsFormData): void;
  (e: "next"): void;
}>();

const {
  imageFile,
  name,
  country,
  federationId,
  email,
  supplierId,
  labelId,
  currentImageUrl,
  loading,
  isSubmitting,
  isEditMode,
  imageFileError,
  nameError,
  countryError,
  federationIdError,
  emailError,
  supplierIdError,
  labelIdError,
  validateAndGetData,
} = useClubDetailsStep(props);

const federationOptions = ref<Federation[]>([]);
const federationsLoading = ref(false);
const suppliersOptions = ref<Supplier[]>([]);
const suppliersLoading = ref(false);

const labelOptions = computed(() => getClubLabelOptions(t));

const validate = async () => {
  const result = await validateAndGetData();
  if (result && result.success && result.data) {
    emit("validated", result.data as ClubDetailsFormData);
    return true;
  }
  return false;
};

const loadFederations = async (countryCode: string) => {
  if (!countryCode) return;

  federationsLoading.value = true;
  try {
    const result = await federationService.getFederationsByCountry(countryCode);
    federationOptions.value = result.data.map((federation: Federation) => ({
      label: federation.name,
      value: federation.id,
    }));
  } catch (error) {
    console.error("Error loading federations:", error);
  } finally {
    federationsLoading.value = false;
  }
};

const loadSuppliers = async (fedId: number) => {
  if (!fedId) return;
  suppliersLoading.value = true;
  try {
    const result = await supplierService.getSuppliersByFederation(
      fedId.toString(),
    );
    suppliersOptions.value = result.data.map((supplier: Supplier) => ({
      label: supplier.name,
      value: supplier.id,
    }));
  } catch (error) {
    console.error("Error loading suppliers:", error);
  } finally {
    suppliersLoading.value = false;
  }
};

const onCountryChange = async () => {
  federationId.value = 0;
  supplierId.value = 0;
  federationOptions.value = [];
  suppliersOptions.value = [];

  await loadFederations(country.value || "");
};

const onFederationChange = async () => {
  supplierId.value = 0;
  suppliersOptions.value = [];

  await loadSuppliers(federationId.value || 0);
};

watch(
  () => props.initialData,
  async (newData) => {
    if (props.isEditMode && newData) {
      if (newData.Country && federationOptions.value.length === 0) {
        await loadFederations(newData.Country);
      }

      if (newData.FederationId && suppliersOptions.value.length === 0) {
        await loadSuppliers(newData.FederationId);
      }
    }
  },
  { immediate: true, deep: true },
);

defineExpose({
  validate,
});
</script>
