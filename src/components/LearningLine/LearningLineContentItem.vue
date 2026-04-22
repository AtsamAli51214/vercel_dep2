<template>
  <div class="flex flex-col gap-3 p-4 border border-stroke rounded-xl">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="">
        <div class="font-medium mb-2.5">
          {{ t("Academy.LearningLines.category") }}
        </div>
        <Select
          v-model="contentItem.contentType"
          :options="contentTypeOptions"
          optionLabel="label"
          optionValue="value"
          :placeholder="t('Academy.LearningLines.selectCategory')"
          :invalid="!!fieldErrors?.contentType"
          fluid
        />
        <small class="p-invalid" v-if="fieldErrors?.contentType">
          {{ fieldErrors.contentType }}
        </small>
      </div>

      <div class="">
        <div class="font-medium mb-2.5">
          {{ getContentTypeLabel(contentItem.contentType) }}
        </div>
        <Select
          v-model="contentItem.contentId"
          :options="libraryContent.getDropdownOptions(contentItem.contentType)"
          optionLabel="title"
          optionValue="id"
          :placeholder="t('Academy.LearningLines.selectContent')"
          :loading="libraryContent.isLoading(contentItem.contentType)"
          :disabled="!contentItem.contentType"
          :invalid="!!fieldErrors?.contentId"
          fluid
          filter
        />
        <small class="p-invalid" v-if="fieldErrors?.contentId">
          {{ fieldErrors.contentId }}
        </small>
      </div>

      <div
        class=""
        v-if="contentItem.contentType === 4 && contentItem.contentId"
      >
        <div class="font-medium mb-2.5">
          {{ t("Academy.LearningLines.skills") }}
        </div>
        <BaseMultiSelect
          v-model="contentItem.skillIds"
          :options="exerciseSkillOptions"
          optionLabel="label"
          optionValue="value"
          :placeholder="t('Academy.LearningLines.selectSkills')"
          :invalid="!!fieldErrors?.skillIds"
        />
        <small class="p-invalid" v-if="fieldErrors?.skillIds">
          {{ fieldErrors.skillIds }}
        </small>
      </div>

      <div class="" v-if="contentItem.contentType === 5">
        <div class="font-medium mb-2.5">
          {{ t("Academy.LearningLines.duration") }}
        </div>
        <InputNumber
          v-model="contentItem.durationWeeks"
          :suffix="' ' + t('Academy.LearningLines.weeks')"
          :max="totalWeeks - weekNumber"
          :min="1"
          mode="decimal"
          showButtons
          :placeholder="t('Academy.LearningLines.duration')"
          :invalid="!!fieldErrors?.durationWeeks"
          fluid
        />
        <small v-if="!fieldErrors?.durationWeeks">
          {{
            t("validation.assingedWeeksLimit", { max: totalWeeks - weekNumber })
          }}
        </small>
        <small class="p-invalid" v-else>
          {{ fieldErrors.durationWeeks }}
        </small>
      </div>

      <div class="">
        <div class="font-medium mb-2.5">
          {{ t("Academy.LearningLines.tagsKeyword") }}
        </div>
        <AutoComplete
          v-model="contentItem.tags"
          multiple
          :placeholder="t('Academy.library.formTagsKeywords')"
          chipIcon="pi pi-times"
          :typeahead="false"
          fluid
        />
      </div>
    </div>

    <div class="flex gap-2 mt-4">
      <Button
        :label="t('app.cancel')"
        @click="emit('cancel')"
        outlined
        severity="secondary"
        size="small"
      />
      <Button
        :label="props.isEditMode ? t('app.update') : t('app.add')"
        @click="emit('done')"
        size="small"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, watch, ref, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import type { LearningLineWeekContentItem } from "@/types";
import { getContentTypes } from "@/constants";
import { useLearningLineLibraryContent } from "@/composables/useLearningLineLibraryContent";

type FieldErrors = Partial<
  Record<
    "contentType" | "contentId" | "skillIds" | "durationWeeks" | "tags",
    string
  >
>;

interface Props {
  contentItem: LearningLineWeekContentItem;
  weekNumber: number;
  totalWeeks: number;
  isEditMode: boolean;
  fieldErrors?: FieldErrors;
}
const libraryContent = useLearningLineLibraryContent();

const props = defineProps<Props>();
const emit = defineEmits<{
  formChanged: [hasChanges: boolean];
  cancel: [];
  done: [];
}>();

const { t } = useI18n();

const contentTypeOptions = computed(() => getContentTypes(t));

const exerciseSkillOptions = computed(() => {
  if (props.contentItem.contentType !== 4 || !props.contentItem.contentId) {
    return [];
  }

  const selectedExercise = libraryContent.getContentItemById(
    4,
    props.contentItem.contentId,
  );

  const linkedSkillIds = (selectedExercise?.relatedSkills ?? []) as {
    id: number;
    title: string;
  }[];

  if (linkedSkillIds.length === 0) {
    return [];
  }

  return linkedSkillIds.map((skill) => ({
    value: skill.id,
    label: skill.title,
  }));
});

watch(
  () => props.contentItem.contentType,
  async (newType, oldType) => {
    if (!newType) return;
    await libraryContent.loadContentByType(newType);
    if (oldType != null && newType !== oldType) {
      props.contentItem.contentId = null;
      props.contentItem.name = undefined;
    }
  },
);

watch(
  () => props.contentItem.contentId,
  (newId, oldId) => {
    if (!newId || !props.contentItem.contentType) return;
    const contentItem = libraryContent.getContentItemById(
      props.contentItem.contentType,
      newId,
    );
    if (contentItem?.title) {
      props.contentItem.name = contentItem.title;
    }

    if (props.contentItem.contentType === 4 && newId !== oldId) {
      const linkedSkills = (contentItem?.relatedSkills ?? []) as {
        id: number;
        title: string;
      }[];
      if (linkedSkills.length > 0) {
        props.contentItem.skillIds = linkedSkills.map((skill) => skill.id);
      } else {
        props.contentItem.skillIds = [];
      }
    }
  },
);

function normalizeTagsForCompare(tags: string | string[] | undefined): string {
  if (tags == null) return "[]";
  const arr = Array.isArray(tags) ? tags : [tags];
  return JSON.stringify([...arr].map(String).sort());
}

function sortedSkillIdsKey(ids: number[] | undefined): string {
  return JSON.stringify([...(ids ?? [])].sort((a, b) => a - b));
}

const initialSnapshot = ref<{
  contentType: number | null;
  contentId: number | null;
  tagsKey: string;
  skillIdsKey: string;
  durationWeeks: number | null;
} | null>(null);

function captureContentFormSnapshot() {
  initialSnapshot.value = {
    contentType: props.contentItem.contentType,
    contentId: props.contentItem.contentId,
    tagsKey: normalizeTagsForCompare(props.contentItem.tags),
    skillIdsKey: sortedSkillIdsKey(props.contentItem.skillIds),
    durationWeeks: props.contentItem.durationWeeks ?? null,
  };
}

onMounted(async () => {
  if (props.contentItem.contentType) {
    await libraryContent.loadContentByType(props.contentItem.contentType);
  }
  captureContentFormSnapshot();
});

watch(
  () => [
    props.contentItem.contentType,
    props.contentItem.contentId,
    props.contentItem.tags,
    props.contentItem.skillIds,
    props.contentItem.durationWeeks,
  ],
  () => {
    if (!initialSnapshot.value) return;
    const s = initialSnapshot.value;
    const hasChanges =
      props.contentItem.contentType !== s.contentType ||
      props.contentItem.contentId !== s.contentId ||
      normalizeTagsForCompare(props.contentItem.tags) !== s.tagsKey ||
      sortedSkillIdsKey(props.contentItem.skillIds) !== s.skillIdsKey ||
      (props.contentItem.durationWeeks ?? null) !== s.durationWeeks;
    emit("formChanged", hasChanges);
  },
  { deep: true },
);

function getContentTypeLabel(contentType: number | null): string {
  if (!contentType) return t("Academy.LearningLines.selectContent");
  const found = contentTypeOptions.value.find(
    (opt) => opt.value === contentType,
  );
  return found?.label ?? t("Academy.LearningLines.selectContent");
}
</script>
