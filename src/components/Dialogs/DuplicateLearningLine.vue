<script setup lang="ts">
import { computed, onMounted, ref, watch, type Ref } from "vue";
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import { useI18n } from "vue-i18n";
import { createLearningLineStep1Schema } from "@/utils/validation";
import { useReferenceDataStore } from "@/stores/referenceData";
import { getTargetGroupOptions } from "@/constants/formOptions";
import { formatIsoDate } from "@/utils/helpers";
import { usePrimeVueDatePickerSync } from "@/composables/usePrimeVueDatePickerSync";
import { learningLineService } from "@/services";
import { useAppLoader, useGlobalDialog } from "@/composables";
import type { LearningLineDetailsData } from "@/types/learningLine";
import { LearningLine, TableDataRef } from "@/types";

const props = defineProps<{
  initialData?: LearningLine;
}>();

const model = defineModel<boolean>({ required: true });

const emit = defineEmits<{
  refresh: [];
  duplicated: [payload: { id?: number }];
}>();

const { t } = useI18n();
const loader = useAppLoader();
const dialog = useGlobalDialog();
const referenceStore = useReferenceDataStore();

const saving = ref(false);

const schema = toTypedSchema(createLearningLineStep1Schema(t));

const { handleSubmit, defineField, errors, setValues } = useForm({
  validationSchema: schema,
  initialValues: {
    name: "",
    targetGroupIds: [] as number[],
    clubIds: [] as number[],
    ageCategoryIds: [] as number[],
    seasonId: undefined as string | number | undefined,
    seasonName: "",
    startDate: undefined as Date | string | undefined,
    endDate: undefined as Date | string | undefined,
    description: "",
    isRecurring: true,
  },
  validateOnMount: false,
});

const name = defineField("name")[0] as Ref<string>;
const targetGroupIds = defineField("targetGroupIds")[0] as Ref<number[]>;
const clubIds = defineField("clubIds")[0] as Ref<number[]>;
const ageCategoryIds = defineField("ageCategoryIds")[0] as Ref<number[]>;
const seasonName = defineField("seasonName")[0] as Ref<string | undefined>;
const startDate = defineField("startDate")[0] as Ref<
  Date | string | null | undefined
>;
const endDate = defineField("endDate")[0] as Ref<
  Date | string | null | undefined
>;
const isRecurring = defineField("isRecurring")[0] as Ref<boolean>;

const nameError = computed(() => errors.value?.name as string | undefined);
const targetGroupError = computed(
  () => errors.value?.targetGroupIds as string | undefined,
);
const clubError = computed(() => errors.value?.clubIds as string | undefined);
const ageCategoryError = computed(
  () => errors.value?.ageCategoryIds as string | undefined,
);

const targetGroupOptions = computed(() => getTargetGroupOptions(t));
const clubSelectOptions = computed(() => [...referenceStore.clubOptions]);
const ageCategoryOptions = computed(() => referenceStore.ageCategoryOptions);
const clubsLoading = computed(() => referenceStore.clubsLoading);
const ageCategoriesLoading = computed(
  () => referenceStore.ageCategoriesLoading,
);

const showSeasonNameOnly = computed(() => props.initialData?.status === 1);

const seasonNameDisplay = computed(() => seasonName.value?.trim() ?? "");

const seasonYearRangeDisplay = computed(() => {
  const s = startDate.value;
  const e = endDate.value;
  if (!s || !e) return seasonNameDisplay.value;
  const ds = typeof s === "string" ? new Date(s) : s;
  const de = typeof e === "string" ? new Date(e) : e;
  if (Number.isNaN(ds.getTime()) || Number.isNaN(de.getTime())) {
    return seasonNameDisplay.value;
  }
  return `${ds.getFullYear()}-${de.getFullYear()}`;
});

const startDateForPicker = usePrimeVueDatePickerSync(startDate);
const endDateForPicker = usePrimeVueDatePickerSync(endDate);

function applyInitialFromProps(): void {
  const d = props.initialData;
  if (!d) return;
  setValues({
    name: d.name ?? "",
    targetGroupIds: d.targetGroups?.map((tg: TableDataRef) => tg.id) ?? [],
    clubIds: d.clubs?.map((c: TableDataRef) => c.id) ?? [],
    ageCategoryIds: d.ageGroups?.map((ag: TableDataRef) => ag.id) ?? [],
    seasonId: d.seasonId,
    seasonName: d.seasonName ?? "",
    startDate: d.startDate ?? undefined,
    endDate: d.endDate ?? undefined,
    description: d.description ?? "",
    isRecurring: d.isRecurring ?? true,
  } as Record<string, unknown>);
}

watch(
  () => model.value,
  (open) => {
    if (open) {
      applyInitialFromProps();
    }
  },
);

watch(
  () => props.initialData,
  () => {
    if (model.value) {
      applyInitialFromProps();
    }
  },
  { deep: true },
);

function buildDuplicatePayload(values: LearningLineDetailsData) {
  return {
    newName: values.name ?? "",
    targetGroups: values.targetGroupIds ?? [],
    clubIds: values.clubIds ?? [],
    ageGroupIds: values.ageCategoryIds ?? [],
    seasonName: values.seasonName ?? "",
    startDate: formatIsoDate(values.startDate) ?? "",
    endDate: formatIsoDate(values.endDate) ?? "",
    isRecurring: values.isRecurring ?? false,
  };
}

const submit = handleSubmit(async (values) => {
  saving.value = true;
  loader.setLoading(true, t("Academy.LearningLines.creating"));
  try {
    const payload = buildDuplicatePayload(values as LearningLineDetailsData);
    const result = await learningLineService.duplicateLearningLine(
      props.initialData?.id ?? "",
      payload,
    );
    if (result.success) {
      const body = result.data as Record<string, unknown> | undefined;
      const rawId = body?.id ?? body?.Id;
      const newId =
        typeof rawId === "number"
          ? rawId
          : rawId != null
            ? Number(rawId)
            : undefined;
      dialog.showSuccess(
        t("app.success"),
        t("Academy.LearningLines.duplicateSuccess"),
        t("app.ok"),
      );
      model.value = false;
      emit("duplicated", { id: Number.isFinite(newId) ? newId : undefined });
      emit("refresh");
    } else {
      dialog.showError(
        t("app.error"),
        result.error ?? t("Academy.LearningLines.errorDuplicating"),
        t("app.ok"),
      );
    }
  } catch {
    dialog.showError(
      t("app.error"),
      t("Academy.LearningLines.errorDuplicating"),
      t("app.ok"),
    );
  } finally {
    saving.value = false;
    loader.setLoading(false);
  }
});

onMounted(async () => {
  await Promise.all([
    referenceStore.fetchClubs(),
    referenceStore.fetchAgeCategories(),
  ]);
});
</script>

<template>
  <Dialog
    v-model:visible="model"
    :style="{ width: '650px' }"
    :header="t('Academy.LearningLines.duplicateLearningLine')"
    :closable="true"
    modal
    class="p-fluid"
  >
    <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
      <div class="">
        <div class="font-medium mb-2.5">
          {{ t("Academy.LearningLines.learningLineNameLabel") }}
        </div>
        <InputText
          v-model="name"
          fluid
          :placeholder="t('Academy.LearningLines.formName')"
          :invalid="!!nameError"
        />
        <small v-if="nameError" class="p-invalid">{{ nameError }}</small>
      </div>

      <div class="">
        <div class="font-medium mb-2.5">
          {{ t("Academy.LearningLines.targetGroups") }}
        </div>
        <BaseMultiSelect
          v-model="targetGroupIds"
          :options="targetGroupOptions"
          optionLabel="label"
          optionValue="value"
          :placeholder="t('Academy.LearningLines.targetGroups')"
          :invalid="!!targetGroupError"
          :error="targetGroupError"
        />
      </div>

      <div class="">
        <div class="font-medium mb-2.5">
          {{ t("Academy.LearningLines.clubs") }}
        </div>
        <BaseMultiSelect
          v-model="clubIds"
          :options="clubSelectOptions"
          optionLabel="label"
          optionValue="value"
          :placeholder="t('Academy.LearningLines.clubs')"
          :loading="clubsLoading"
          :invalid="!!clubError"
          :error="clubError"
        />
      </div>

      <div class="">
        <div class="font-medium mb-2.5">
          {{ t("Academy.LearningLines.ageCategories") }}
        </div>
        <BaseMultiSelect
          v-model="ageCategoryIds"
          :options="ageCategoryOptions"
          optionLabel="label"
          optionValue="value"
          :placeholder="t('Academy.LearningLines.ageCategories')"
          :loading="ageCategoriesLoading"
          :invalid="!!ageCategoryError"
          :error="ageCategoryError"
        />
      </div>

      <div class="md:col-span-2">
        <div class="font-medium mb-2.5">
          {{ t("Academy.LearningLines.season") }}
        </div>
        <InputText
          :model-value="
            showSeasonNameOnly ? seasonNameDisplay : seasonYearRangeDisplay
          "
          fluid
          disabled
        />
      </div>

      <div class="">
        <div class="font-medium mb-2.5">
          {{ t("Academy.LearningLines.startDate") }}
        </div>
        <DatePicker
          v-model="startDateForPicker"
          fluid
          date-format="dd/mm/yy"
          disabled
        />
      </div>

      <div class="">
        <div class="font-medium mb-2.5">
          {{ t("Academy.LearningLines.endDate") }}
        </div>
        <DatePicker
          v-model="endDateForPicker"
          fluid
          date-format="dd/mm/yy"
          disabled
        />
      </div>

      <div class="md:col-span-2 flex flex-col gap-1">
        <div class="flex items-start gap-2">
          <Checkbox
            v-model="isRecurring"
            :binary="true"
            input-id="dup-isRecurring"
          />
          <label for="dup-isRecurring" class="flex flex-col gap-1">
            <span class="text-sm">{{
              t("Academy.LearningLines.keepOngoing")
            }}</span>
            <span class="text-[.625rem] text-secondary-color">
              {{ t("Academy.LearningLines.keepOngoingDescription") }}
            </span>
          </label>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="flex justify-center items-center gap-2 w-full">
        <Button
          :label="t('app.cancel')"
          severity="secondary"
          outlined
          :disabled="saving"
          fluid
          @click="model = false"
        />
        <Button
          :label="t('app.create')"
          :loading="saving"
          @click="submit"
          fluid
        />
      </div>
    </template>
  </Dialog>
</template>

<style scoped></style>
