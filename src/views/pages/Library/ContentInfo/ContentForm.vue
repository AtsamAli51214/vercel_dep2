<template>
  <div class="flex flex-col gap-6">
    <div class="flex flex-col gap-2">
      <span class="font-bold text-3xl text-primary">{{
        !isEditMode
          ? t("Academy.library.createContent.title")
          : t("Academy.library.editContent.title")
      }}</span>
      <span class="font-medium text-secondary-color">
        {{
          !isEditMode
            ? t("Academy.library.createContent.description")
            : t("Academy.library.editContent.description")
        }}
      </span>
    </div>
    <div class="flex flex-col gap-2">
      <form
        @submit.prevent="
          async () => {
            await onSubmit();
          }
        "
        class="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        <div class="">
          <div class="font-medium mb-2.5">
            {{ t("Academy.library.formContentType") }}<span>*</span>
          </div>
          <Select
            v-model="contentType"
            :options="getContentTypes(t)"
            optionLabel="label"
            optionValue="value"
            fluid
            :placeholder="t('Academy.library.formContentType')"
            :invalid="!!contentTypeError"
          />
          <small class="p-invalid" v-if="contentTypeError">
            {{ contentTypeError }}
          </small>
        </div>
        <div class="md:col-span-2">
          <div class="font-medium mb-2.5">
            {{ t("Academy.library.formTitle") }}<span>*</span>
          </div>
          <InputText
            v-model="title"
            fluid
            :placeholder="t('Academy.library.formTitle')"
            :invalid="!!titleError"
          />
          <small class="p-invalid" v-if="titleError">
            {{ titleError }}
          </small>
        </div>

        <template v-if="contentType === 4">
          <div class="md:col-span-2">
            <div class="font-medium mb-2.5">
              {{ t("Academy.library.formDescription") }}
            </div>
            <Tabs v-model:value="exerciseDescTab">
              <TabList>
                <Tab
                  value="easy"
                  :pt="{
                    root: { class: 'flex-1!' },
                  }"
                >
                  {{ t("Academy.library.exerciseEasy") }}
                </Tab>
                <Tab
                  value="difficult"
                  :pt="{
                    root: { class: 'flex-1!' },
                  }"
                >
                  {{ t("Academy.library.exerciseDifficult") }}
                </Tab>
              </TabList>
              <TabPanels
                :pt="{
                  root: {
                    class: 'pt-3! p-0!',
                  },
                }"
              >
                <TabPanel value="easy">
                  <BaseEditor
                    v-model="easierExercise"
                    :placeholder="t('Academy.library.formDescription')"
                  />
                </TabPanel>
                <TabPanel value="difficult">
                  <BaseEditor
                    v-model="difficultExercise"
                    :placeholder="t('Academy.library.formDescription')"
                  />
                </TabPanel>
              </TabPanels>
            </Tabs>
            <small class="p-invalid" v-if="descriptionError">
              {{ descriptionError }}
            </small>
          </div>
        </template>

        <div v-else class="md:col-span-2">
          <div class="font-medium mb-2.5">
            {{ t("Academy.library.formDescription") }}
          </div>
          <BaseEditor
            v-model="description"
            :placeholder="t('Academy.library.formDescription')"
          />
          <small class="p-invalid" v-if="descriptionError">
            {{ descriptionError }}
          </small>
        </div>

        <div class="md:col-span-2">
          <BaseFileUpload
            v-model="mediaFiles"
            :label="t('Academy.library.fileUpload.formUploadMedia')"
            accept=".mp4,.mov,.jpg,.jpeg,.png,.pdf"
            :maxSizeMB="100"
            :allowedTypes="[
              'video/mp4',
              'video/quicktime',
              'image/jpeg',
              'image/png',
              'application/pdf',
            ]"
            multiple
            :existingFiles="existingFilesForUpload"
            @existingFileRemoved="onExistingMediaRemoved"
          />
        </div>

        <template v-if="contentType === 4">
          <BaseMultiSelect
            v-model="linkedSkillIds"
            :options="skillOptions"
            :label="t('Academy.library.formSkills') + '*'"
            :placeholder="t('Academy.library.formSkills')"
            :error="linkedSkillIdsError"
            :invalid="!!linkedSkillIdsError"
          />
          <div>
            <div class="font-medium mb-2.5">
              {{ t("Academy.library.formLevel") }}<span>*</span>
            </div>
            <Select
              v-model="levelId"
              :options="getLevelOptions(t)"
              optionLabel="label"
              optionValue="value"
              fluid
              :placeholder="t('Academy.library.formLevel')"
              :invalid="!!levelError"
            />
            <small class="p-invalid" v-if="levelError">
              {{ levelError }}
            </small>
          </div>
        </template>

        <div v-if="contentType !== 4">
          <div class="font-medium mb-2.5">
            {{ t("Academy.library.formMainCategory") }}<span>*</span>
          </div>
          <Select
            v-model="categoryId"
            :options="getMainCategoryOptions(t)"
            optionLabel="label"
            optionValue="value"
            fluid
            :placeholder="t('Academy.library.formMainCategory')"
            :invalid="!!categoryError"
          />
          <small class="p-invalid" v-if="categoryError">
            {{ categoryError }}
          </small>
        </div>

        <BaseMultiSelect
          v-model="themeIds"
          :options="getThemeOptions(t)"
          :label="t('Academy.library.formThemes')"
          optionLabel="label"
          optionValue="value"
          :placeholder="t('Academy.library.formThemes')"
          :error="themeIdsError"
          :invalid="!!themeIdsError"
        />
        <div>
          <div class="font-medium mb-2.5">
            {{ t("Academy.library.formTagsKeywords") }}
          </div>
          <InputChips
            v-model="tagsModel"
            :addOnBlur="true"
            separator=","
            :placeholder="t('Academy.library.formTagsKeywords')"
            :invalid="!!tagsError"
            chipIcon="pi pi-times"
            class="w-full"
          />
          <small class="p-invalid" v-if="tagsError">
            {{ tagsError }}
          </small>
        </div>

        <BaseMultiSelect
          v-model="ageGroupIds"
          :options="ageCategoryOptions"
          optionLabel="label"
          optionValue="value"
          :label="t('Academy.library.formAgeCategories')"
          :placeholder="t('Academy.library.formAgeCategories')"
          :error="ageGroupIdsError"
          :invalid="!!ageGroupIdsError"
        >
          <template #beforeInput>
            <SelectButton
              v-model="ageCategorySegment"
              :options="ageCategorySegmentOptions"
              optionLabel="label"
              optionValue="value"
              size="small"
              :allow-empty="false"
              class="mb-2 small-toggeles w-full"
            />
          </template>
        </BaseMultiSelect>

        <div class="">
          <div class="font-medium mb-2.5">
            {{ t("Academy.library.formContext") }}
          </div>
          <BaseGroupedSelect
            v-model="labels"
            :groups="getLabelGroups(t)"
            :invalid="!!labelsError"
            :emitAsArray="true"
          />
          <small class="p-invalid" v-if="labelsError">
            {{ labelsError }}
          </small>
        </div>

        <div class="md:col-span-2">
          <div class="flex gap-2 items-center md:w-1/2 mt-2">
            <Button
              v-if="!isEditMode || (isEditMode && contentData?.isDraft)"
              :label="isEditMode ? t('app.updateDraft') : t('app.saveAsDraft')"
              outlined
              @click.prevent="handleSaveAsDraft"
              :loading="loading || isSubmitting"
              :disabled="loading || isSubmitting"
              fluid
            />

            <Button
              v-if="isEditMode && contentData?.isDraft"
              :label="t('app.publish')"
              @click.prevent="
                async () => {
                  await onSubmit();
                }
              "
              :loading="loading || isSubmitting"
              :disabled="loading || isSubmitting"
              fluid
            />

            <Button
              v-if="!isEditMode || !contentData?.isDraft"
              :label="!isEditMode ? t('app.create') : t('app.update')"
              type="submit"
              :loading="loading || isSubmitting"
              :disabled="loading || isSubmitting"
              fluid
            />
          </div>
        </div>
      </form>
      <Message v-if="formError" severity="error">{{ formError }}</Message>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useContentForm } from "@/composables";
import { useReferenceDataStore } from "@/stores/referenceData";
import BaseGroupedSelect from "@/components/base/BaseGroupedSelect.vue";
import BaseFileUpload from "@/components/base/BaseFileUpload.vue";
import {
  getContentTypes,
  getLevelOptions,
  getMainCategoryOptions,
  getThemeOptions,
  getLabelGroups,
} from "@/constants";
import { useRouter } from "vue-router";
import InputChips from "primevue/inputchips";

interface Props {
  contentData?: any;
  isEditMode?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  contentData: undefined,
  isEditMode: false,
});

const emit = defineEmits<{
  contentCreated: [data: any];
  cancel: [];
}>();

const { t } = useI18n();
const referenceDataStore = useReferenceDataStore();

type AgeCategorySegment = "youngest" | "team" | "both";

const ageCategorySegment = ref<AgeCategorySegment | null>(null);
const exerciseDescTab = ref<"easy" | "difficult">("easy");

const ageCategorySegmentOptions: {
  label: string;
  value: AgeCategorySegment;
}[] = [
  { label: "Youngest Youth", value: "youngest" },
  { label: "Team Hockey", value: "team" },
  { label: "Both", value: "both" },
];

const ageCategoryOptions = computed(
  () => referenceDataStore.ageCategoryOptions,
);

const skillOptions = computed(() => referenceDataStore.skillOptions);

const router = useRouter();
const {
  loading,
  formError,
  isSubmitting,
  contentType,
  title,
  description,
  easierExercise,
  difficultExercise,
  categoryId,
  themeIds,
  levelId,
  ageGroupIds,
  tags,
  linkedSkillIds,
  labels,
  mediaFiles,
  existingFilesForUpload,
  onExistingMediaRemoved,
  fieldErrors,
  onSubmit,
  onSaveAsDraft,
} = useContentForm(
  { contentData: props.contentData },
  (event: string, ...args: any[]) => {
    if (event === "close") {
      emit("cancel");
    } else if (event === "contentCreatedUpdated") {
      if (props.isEditMode) {
        const contentType = props.contentData?.contentType?.toString() || "0";
        router.push({
          name: "library",
          query: { tab: contentType },
        });
      } else {
        emit("contentCreated", args[2]);
      }
    }
  },
);

const handleSaveAsDraft = async () => {
  await onSaveAsDraft();
};

const tagsModel = computed({
  get: (): string[] =>
    Array.isArray(tags.value) ? (tags.value as string[]) : [],
  set: (v: string[]) => {
    tags.value = v;
  },
});

watch(ageCategorySegment, (opt) => {
  switch (opt) {
    case "youngest":
      ageGroupIds.value = ageCategoryOptions.value
        .filter((c) => c.isYoungestYouth === true)
        .map((o) => Number(o.value));
      break;
    case "team":
      ageGroupIds.value = ageCategoryOptions.value
        .filter((c) => c.isYoungestYouth === false)
        .map((o) => Number(o.value));
      return;
    case "both":
      ageGroupIds.value = ageCategoryOptions.value.map((o) => Number(o.value));
      return;
    default:
      return [];
  }
});

watch(ageGroupIds, () => {
  const currentAgeGroupIds = Array.isArray(ageGroupIds.value)
    ? ageGroupIds.value
    : [];

  const isYoungestYouths = ageCategoryOptions.value
    .filter((c) => c.isYoungestYouth === true)
    .map((o) => Number(o.value));
  const isTeamHockey = ageCategoryOptions.value
    .filter((c) => c.isYoungestYouth === false)
    .map((o) => Number(o.value));
  const isBoth = ageCategoryOptions.value.map((o) => Number(o.value));
  const arraysEqual = (a: number[], b: number[]) =>
    a.length === b.length && a.every((val, idx) => val === b[idx]);

  ageCategorySegment.value = arraysEqual(currentAgeGroupIds, isYoungestYouths)
    ? "youngest"
    : arraysEqual(currentAgeGroupIds, isTeamHockey)
      ? "team"
      : arraysEqual(currentAgeGroupIds, isBoth)
        ? "both"
        : null;
});

onMounted(async () => {
  await Promise.all([
    referenceDataStore.fetchAgeCategories(),
    referenceDataStore.fetchSkills(),
  ]);
});

const contentTypeError = computed(() => fieldErrors.value.contentType);
const titleError = computed(() => fieldErrors.value.title);
const descriptionError = computed(() => fieldErrors.value.description);
const categoryError = computed(() => fieldErrors.value.categoryId);
const themeIdsError = computed(() => fieldErrors.value.themeIds);
const linkedSkillIdsError = computed(() => fieldErrors.value.linkedSkillIds);
const ageGroupIdsError = computed(() => fieldErrors.value.ageGroupIds);
const levelError = computed(() => fieldErrors.value.levelId);
const tagsError = computed(() => fieldErrors.value.tags);
const labelsError = computed(() => fieldErrors.value.labels);
</script>

<style>
@reference "@/assets/tailwind.css";

.p-tab-active {
  @apply bg-primary-50! text-primary!;
}
</style>
