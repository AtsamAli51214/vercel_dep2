<template>
  <div class="flex justify-center gap-6">
    <div class="bg-white rounded-2xl p-15 w-232 relative">
      <div
        @click="goBack"
        class="absolute mt-2 transition-opacity cursor-pointer left-10 hover:opacity-80"
      >
        <img :src="BackArrow" alt="back" />
      </div>
      <div class="flex flex-col gap-6">
        <div class="flex flex-col">
          <span class="font-bold text-3xl text-primary">{{
            !isEditMode
              ? t("Management.federations.createFederationTitle")
              : t("Management.federations.editFederationTitle")
          }}</span>
          <span class="font-medium text-secondary-color text-xs">
            {{
              !isEditMode
                ? t("Management.federations.createFederationDescription")
                : t("Management.federations.editFederationDescription")
            }}
          </span>
        </div>
        <div class="flex flex-col gap-2">
          <span class="font-semibold text-lg">{{
            t("Management.federations.formTitle")
          }}</span>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="">
              <div class="font-medium mb-2.5">
                {{ t("Management.federations.formName") }}
              </div>
              <InputText
                v-model="name"
                fluid
                :placeholder="t('Management.federations.formName')"
                :invalid="!!nameError"
              />
              <small class="p-invalid" v-if="nameError">
                {{ nameError }}
              </small>
            </div>
            <div class="">
              <div class="font-medium mb-2.5">
                {{ t("Management.federations.formCountry") }}
              </div>
              <CountrySelect
                v-model="country"
                :placeholder="t('Management.federations.formCountry')"
                :invalid="!!countryError"
              />
              <small class="p-invalid" v-if="countryError">
                {{ countryError }}
              </small>
            </div>
            <div class="">
              <div class="font-medium mb-2.5">
                {{ t("Management.federations.formCode") }}
              </div>
              <InputText
                v-model="uppercaseCode"
                fluid
                :placeholder="t('Management.federations.formCode')"
                :invalid="!!codeError"
              />
              <small class="p-invalid" v-if="codeError">
                {{ codeError }}
              </small>
              <Button
                :label="!isEditMode ? t('app.create') : t('app.update')"
                fluid
                @click="onSubmit"
                :loading="loading || isSubmitting"
                :disabled="loading || isSubmitting"
                class="mt-10"
              />
            </div>
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
import type { Federation } from "@/types";
import { useFederationForm, useAppLoader } from "@/composables";
import { federationService } from "@/services";
import CountrySelect from "@/components/CountrySelect.vue";
import { useReferenceDataStore } from "@/stores/referenceData";

const { t } = useI18n();
const router = useRouter();
const route = useRoute();
const loader = useAppLoader();
const referenceStore = useReferenceDataStore();
const isEditMode = computed(() => !!route.params.id);
const userId = computed(() => route.params.id as string | undefined);

const uppercaseCode = computed({
  get() {
    return code.value;
  },
  set(value: string) {
    code.value = value?.toUpperCase() ?? "";
  },
});

const federationData = ref<Federation | null>(null);
const fetchingFederation = ref(false);
const fetchError = ref<string | null>(null);

const props = reactive({
  federationData: {} as Federation | undefined,
  isViewOnly: false,
});

const emit = (event: "close" | "federationCreatedUpdated"): void => {
  if (event === "close") {
    router.push({ name: "federation" });
  } else if (event === "federationCreatedUpdated") {
    referenceStore.clearFederationsCache();
    router.push({ name: "federation" });
  }
};

const fetchFederationData = async () => {
  if (!userId.value) {
    return;
  }

  fetchingFederation.value = true;
  fetchError.value = null;

  try {
    const result = await federationService.getFederationById(userId.value);

    if (result.success && result.data) {
      const apiData = result.data.data || result.data;
      const mappedFederationData: Federation = {
        id: apiData.id || apiData.Id,
        name: apiData.name || apiData.Name,
        code: apiData.code || apiData.Code,
        country: apiData.country || apiData.Country,
      };
      federationData.value = mappedFederationData;
      props.federationData = mappedFederationData;
    } else {
      fetchError.value = result.error || "Failed to fetch federation data";
      router.back();
    }
  } catch (error) {
    fetchError.value =
      error instanceof Error
        ? error.message
        : "Failed to fetch federation data";
    console.error("Error fetching federation:", error);
  } finally {
    fetchingFederation.value = false;
  }
};

onMounted(async () => {
  if (route.params.id) {
    await fetchFederationData();
  }
});

const {
  loading,
  isSubmitting,
  name,
  code,
  country,
  fieldErrors,
  formError,
  onSubmit: originalOnSubmit,
} = useFederationForm(props, emit);

const onSubmit = async (event?: Event) => {
  const loadingMessage = isEditMode.value
    ? t("loading.updatingFederation")
    : t("loading.creatingFederation");

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
const codeError = computed(() => fieldErrors.value.code as string | undefined);
const countryError = computed(
  () => fieldErrors.value.country as string | undefined,
);
</script>

<style scoped></style>
