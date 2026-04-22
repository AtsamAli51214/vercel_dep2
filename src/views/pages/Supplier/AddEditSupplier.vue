<template>
  <div class="flex justify-center gap-6">
    <div class="bg-white rounded-2xl p-15 w-232 relative">
      <div
        @click="goBack"
        class="absolute mt-1 transition-opacity cursor-pointer left-10 hover:opacity-80"
      >
        <img :src="BackArrow" alt="back" />
      </div>
      <div class="flex flex-col gap-6">
        <div class="flex flex-col">
          <span class="font-bold text-[1.75rem] text-primary">{{
            !isEditMode
              ? t("Management.suppliers.createSupplier")
              : t("Management.suppliers.editSupplier")
          }}</span>
          <span class="text-xs font-semibold text-secondary-color">
            {{
              !isEditMode
                ? t("Management.suppliers.createSupplierDescription")
                : t("Management.suppliers.editSupplierDescription")
            }}
          </span>
        </div>
        <div class="flex flex-col gap-2">
          <span class="font-bold text-[1.25rem]">{{
            t("Management.suppliers.formTitle")
          }}</span>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="">
              <div class="font-medium mb-2.5">
                {{ t("Management.suppliers.formName") }}
              </div>
              <InputText
                v-model="name"
                fluid
                :placeholder="t('Management.suppliers.formName')"
                :invalid="!!nameError"
              />
              <small class="p-invalid" v-if="nameError">
                {{ nameError }}
              </small>
            </div>
            <div class="">
              <div class="font-medium mb-2.5">
                {{ t("Management.suppliers.formFederation") }}
              </div>
              <Select
                v-model="federationId"
                :options="referenceStore.federationOptions"
                optionLabel="name"
                optionValue="value"
                fluid
                :placeholder="t('Management.suppliers.formFederation')"
                :invalid="!!federationError"
                :loading="referenceStore.federationsLoading"
              />
              <small class="p-invalid" v-if="federationError">
                {{ federationError }}
              </small>
            </div>
            <Button
              :label="!isEditMode ? t('app.create') : t('app.update')"
              fluid
              @click="onSubmit"
              :loading="loading || isSubmitting"
              :disabled="loading || isSubmitting"
              class="mt-6"
            />
            <div class="col-span-2 w-48"></div>
          </div>
          <Message v-if="formError" severity="error">{{ formError }}</Message>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
import { BackArrow } from "@/assets/images";
import type { Supplier } from "@/types";
import { useSupplierForm, useAppLoader } from "@/composables";
import { supplierService } from "@/services";
import { useReferenceDataStore } from "@/stores/referenceData";

const { t } = useI18n();
const router = useRouter();
const route = useRoute();
const loader = useAppLoader();
const referenceStore = useReferenceDataStore();
const isEditMode = computed(() => !!route.params.id);
const userId = computed(() => route.params.id as string | undefined);

const supplierData = ref<Supplier | null>(null);
const fetchingSupplier = ref(false);
const fetchError = ref<string | null>(null);

const props = reactive({
  supplierData: {} as Supplier | undefined,
  isViewOnly: false,
});

const emit = (event: "close" | "supplierCreatedUpdated"): void => {
  if (event === "close") {
    router.push({ name: "supplier" });
  } else if (event === "supplierCreatedUpdated") {
    router.push({ name: "supplier" });
  }
};

const fetchSupplierData = async () => {
  if (!userId.value) {
    return;
  }

  fetchingSupplier.value = true;
  fetchError.value = null;

  try {
    const result = await supplierService.getSupplierById(userId.value);

    if (result.success && result.data) {
      const apiData = result.data.data || result.data;
      const mappedSupplierData: Supplier = {
        id: apiData.id || apiData.Id,
        name: apiData.name || apiData.Name,
        federationId:
          apiData.federationId ||
          apiData.FederationId ||
          (typeof apiData.federation === "number"
            ? apiData.federation
            : undefined) ||
          0,
        federation: apiData.federation || apiData.Federation || "",
        federationName: apiData.federationName || apiData.FederationName || "",
      };
      supplierData.value = mappedSupplierData;
      props.supplierData = mappedSupplierData;
    } else {
      fetchError.value = result.error || "Failed to fetch supplier data";
      router.back();
    }
  } catch (error) {
    fetchError.value =
      error instanceof Error ? error.message : "Failed to fetch supplier data";
    console.error("Error fetching supplier:", error);
  } finally {
    fetchingSupplier.value = false;
  }
};

onMounted(async () => {
  if (route.params.id) {
    await fetchSupplierData();
  }
  await referenceStore.fetchFederations(true);
});

const {
  loading,
  isSubmitting,
  name,
  federationId,
  fieldErrors,
  formError,
  onSubmit: originalOnSubmit,
} = useSupplierForm(props, emit);

const onSubmit = async (event?: Event) => {
  const loadingMessage = isEditMode.value
    ? t("loading.updatingSupplier")
    : t("loading.creatingSupplier");

  loader.setLoading(true, loadingMessage);

  try {
    if (event) {
      await originalOnSubmit(event);
    } else {
      await originalOnSubmit();
    }
  } finally {
    loader.setLoading(false);
  }
};

const goBack = (): void => {
  router.back();
};

const nameError = computed(() => fieldErrors.value.name as string | undefined);
const federationError = computed(
  () => fieldErrors.value.federationId as string | undefined,
);
</script>

<style scoped></style>
