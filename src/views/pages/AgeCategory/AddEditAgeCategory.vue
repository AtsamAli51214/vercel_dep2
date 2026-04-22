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
              ? t("Management.ageCategories.createAgeCategoryTitle")
              : t("Management.ageCategories.editAgeCategoryTitle")
          }}</span>
          <span class="text-xs font-semibold text-secondary-color">
            {{
              !isEditMode
                ? t("Management.ageCategories.createAgeCategoryDescription")
                : t("Management.ageCategories.editAgeCategoryDescription")
            }}
          </span>
        </div>
        <div class="flex flex-col gap-2">
          <span class="font-bold text-[1.25rem]">{{
            t("Management.ageCategories.formTitle")
          }}</span>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="">
              <div class="font-medium mb-2.5">
                {{ t("Management.ageCategories.formName") }}
              </div>
              <InputText
                v-model="name"
                fluid
                :placeholder="t('Management.ageCategories.formName')"
                :invalid="!!nameError"
              />
              <small class="p-invalid" v-if="nameError">
                {{ nameError }}
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
import type { AgeCategory } from "@/types";
import { ageCategoryService } from "@/services";
import { useAppLoader, useAgeCategoryForm } from "@/composables";

const { t } = useI18n();
const router = useRouter();
const route = useRoute();
const loader = useAppLoader();
const isEditMode = computed(() => !!route.params.id);
const userId = computed(() => route.params.id as string | undefined);

const ageCategoryData = ref<AgeCategory | null>(null);
const fetchingAgeCategory = ref(false);
const fetchError = ref<string | null>(null);

const props = reactive({
  ageCategoryData: {} as AgeCategory | undefined,
  isViewOnly: false,
});

const emit = (event: "close" | "ageCategoryCreatedUpdated"): void => {
  if (event === "close") {
    router.push({ name: "ageCategory" });
  } else if (event === "ageCategoryCreatedUpdated") {
    router.push({ name: "ageCategory" });
  }
};

const fetchAgeCategoryData = async () => {
  if (!userId.value) {
    return;
  }

  fetchingAgeCategory.value = true;
  fetchError.value = null;

  try {
    const result = await ageCategoryService.getAgeCategoryById(userId.value);

    if (result.success && result.data) {
      const apiData = result.data.data || result.data;
      const mappedAgeCategoryData: AgeCategory = {
        ageGroupId: apiData.ageGroupId || apiData.AgeGroupId,
        name: apiData.name || apiData.Name,
      };
      ageCategoryData.value = mappedAgeCategoryData;
      props.ageCategoryData = mappedAgeCategoryData;
    } else {
      fetchError.value = result.error || "Failed to fetch age category data";
      router.back();
    }
  } catch (error) {
    fetchError.value =
      error instanceof Error
        ? error.message
        : "Failed to fetch age category data";
    console.error("Error fetching age category:", error);
  } finally {
    fetchingAgeCategory.value = false;
  }
};

onMounted(async () => {
  if (route.params.id) {
    await fetchAgeCategoryData();
  }
});

const {
  loading,
  isSubmitting,
  name,
  fieldErrors,
  formError,
  onSubmit: originalOnSubmit,
} = useAgeCategoryForm(props, emit);

const onSubmit = async (event?: Event) => {
  const loadingMessage = isEditMode.value
    ? t("loading.updatingAgeCategory")
    : t("loading.creatingAgeCategory");

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
</script>

<style scoped></style>
