<template>
  <form
    @submit.prevent="handleFormSubmit"
    class="grid grid-cols-1 md:grid-cols-2 gap-4"
  >
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
      <small class="p-invalid" v-if="nameError">
        {{ nameError }}
      </small>
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

    <div class="">
      <div class="font-medium mb-2.5">
        {{ t("Academy.LearningLines.season") }}
      </div>
      <InputText
        :model-value="
          isEditOngoing ? seasonNameDisplay : seasonYearRangeDisplay
        "
        fluid
        disabled
      />
      <small class="p-invalid" v-if="seasonError">
        {{ seasonError }}
      </small>
    </div>

    <div class="">
      <div class="font-medium mb-2.5">
        {{ t("Academy.LearningLines.startDate") }}
      </div>
      <DatePicker
        v-model="startDateForPicker"
        fluid
        :placeholder="t('Academy.LearningLines.startDate')"
        dateFormat="dd/mm/yy"
        iconDisplay="input"
        showIcon
        :invalid="!!startDateError"
        :minDate="datePickerMinDate"
        :maxDate="datePickerMaxDate"
      />
      <small class="p-invalid" v-if="startDateError">
        {{ startDateError }}
      </small>
    </div>

    <div class="">
      <div class="font-medium mb-2.5">
        {{ t("Academy.LearningLines.endDate") }}
      </div>
      <DatePicker
        v-model="endDateForPicker"
        fluid
        :placeholder="t('Academy.LearningLines.endDate')"
        dateFormat="dd/mm/yy"
        iconDisplay="input"
        showIcon
        :invalid="!!endDateError"
        :minDate="datePickerMinDate"
        :maxDate="datePickerMaxDate"
      />
      <small class="p-invalid" v-if="endDateError">
        {{ endDateError }}
      </small>
    </div>

    <div class="">
      <div class="font-medium mb-2.5">
        {{ t("Academy.LearningLines.weeks") }}
      </div>
      <InputText :value="weeksDisplay" fluid disabled class="opacity-90" />
      <span class="text-xs text-secondary-color mt-1 block">
        {{ t("Academy.LearningLines.weeksAutoCalculatedFromSeason") }}
      </span>
    </div>

    <div class="md:col-span-2">
      <div class="font-medium mb-2.5">
        {{ t("Academy.LearningLines.formDescription") }}
      </div>
      <Textarea
        v-model="description"
        :placeholder="t('Academy.LearningLines.formDescription')"
        rows="3"
        class="w-full"
        :invalid="!!descriptionError"
      />
      <small class="p-invalid" v-if="descriptionError">
        {{ descriptionError }}
      </small>
    </div>

    <div class="md:col-span-2 flex flex-col gap-1">
      <div class="flex items-start gap-2">
        <Checkbox v-model="isRecurring" :binary="true" inputId="isRecurring" />
        <label for="isRecurring" class="flex flex-col gap-1">
          <span class="text-sm">{{
            t("Academy.LearningLines.keepOngoing")
          }}</span>
          <span class="text-[.625rem] text-secondary-color">
            {{ t("Academy.LearningLines.keepOngoingDescription") }}
          </span>
        </label>
      </div>
    </div>

    <Button
      :label="isEditMode ? t('app.update') : t('app.create')"
      fluid
      type="submit"
      class="mt-4"
    />
  </form>
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted, type Ref } from "vue";
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import { useI18n } from "vue-i18n";
import moment from "moment";
import { createLearningLineStep1Schema } from "@/utils/validation";
import { useReferenceDataStore } from "@/stores/referenceData";
import { getTargetGroupOptions } from "@/constants/formOptions";
import { formatIsoDate } from "@/utils/helpers";
import { usePrimeVueDatePickerSync } from "@/composables/usePrimeVueDatePickerSync";
import type {
  LearningLineDetailsData,
  LearningLineDetailsProps,
} from "@/types/learningLine";

const props = defineProps<LearningLineDetailsProps>();

const emit = defineEmits<{
  (e: "validated", data: LearningLineDetailsData): void;
  (e: "submit", data: LearningLineDetailsData): void;
}>();

const { t } = useI18n();
const referenceStore = useReferenceDataStore();

const schema = toTypedSchema(createLearningLineStep1Schema(t));

const defaultValues: Record<string, unknown> = {
  name: props.initialData?.name ?? "",
  targetGroupIds: props.initialData?.targetGroupIds ?? [],
  clubIds: props.initialData?.clubIds ?? [],
  ageCategoryIds: props.initialData?.ageCategoryIds ?? [],
  seasonId: props.initialData?.seasonId ?? undefined,
  seasonName: props.initialData?.seasonName ?? "",
  startDate: props.initialData?.startDate ?? undefined,
  endDate: props.initialData?.endDate ?? undefined,
  description: props.initialData?.description ?? "",
  isRecurring: props.initialData?.isRecurring ?? true,
};

const { handleSubmit, defineField, errors, setValues } = useForm({
  validationSchema: schema,
  initialValues: defaultValues,
  validateOnMount: false,
});

const name = defineField("name")[0] as Ref<string>;
const targetGroupIds = defineField("targetGroupIds")[0] as Ref<number[]>;
const clubIds = defineField("clubIds")[0] as Ref<number[]>;
const ageCategoryIds = defineField("ageCategoryIds")[0] as Ref<number[]>;
const seasonId = defineField("seasonId")[0] as Ref<string | number | undefined>;
const seasonName = defineField("seasonName")[0] as Ref<string | undefined>;
const startDate = defineField("startDate")[0] as Ref<
  Date | string | null | undefined
>;
const endDate = defineField("endDate")[0] as Ref<
  Date | string | null | undefined
>;
const description = defineField("description")[0] as Ref<string>;
const isRecurring = defineField("isRecurring")[0] as Ref<boolean>;

const nameError = computed(() => errors.value?.name as string | undefined);
const targetGroupError = computed(
  () => errors.value?.targetGroupIds as string | undefined,
);
const clubError = computed(() => errors.value?.clubIds as string | undefined);
const ageCategoryError = computed(
  () => errors.value?.ageCategoryIds as string | undefined,
);
const seasonError = computed(
  () => errors.value?.seasonId as string | undefined,
);
const startDateError = computed(
  () => errors.value?.startDate as string | undefined,
);
const endDateError = computed(
  () => errors.value?.endDate as string | undefined,
);
const descriptionError = computed(
  () => errors.value?.description as string | undefined,
);

function getSeasonYearBoundsFromForm(): {
  minYear: number;
  maxYear: number;
} | null {
  const s = startDate.value;
  const e = endDate.value;
  if (!s || !e) return null;
  const ds = typeof s === "string" ? new Date(s) : s;
  const de = typeof e === "string" ? new Date(e) : e;
  if (Number.isNaN(ds.getTime()) || Number.isNaN(de.getTime())) return null;
  const y1 = ds.getFullYear();
  const y2 = de.getFullYear();
  return { minYear: Math.min(y1, y2), maxYear: Math.max(y1, y2) };
}

function getYearBoundsFromSeasonName(): {
  minYear: number;
  maxYear: number;
} | null {
  const raw = (seasonName.value ?? "").trim();
  const m = raw.match(/^(\d{4})\s*-\s*(\d{4})$/);
  if (!m) return null;
  const a = parseInt(m[1], 10);
  const b = parseInt(m[2], 10);
  if (Number.isNaN(a) || Number.isNaN(b)) return null;
  return { minYear: Math.min(a, b), maxYear: Math.max(a, b) };
}

const seasonNameDisplay = computed(() => (seasonName.value ?? "").trim());

const seasonYearRangeDisplay = computed(() => {
  const bounds = getSeasonYearBoundsFromForm();
  if (bounds) return `${bounds.minYear}-${bounds.minYear + 1}`;
  return seasonNameDisplay.value;
});

const targetGroupOptions = computed(() => getTargetGroupOptions(t));

const isEditOngoing = computed(
  () => props.isEditMode && props.lineStatus === 1,
);

const clubSelectOptions = computed(() => [...referenceStore.clubOptions]);
const ageCategoryOptions = computed(() => referenceStore.ageCategoryOptions);
const clubsLoading = computed(() => referenceStore.clubsLoading);
const ageCategoriesLoading = computed(
  () => referenceStore.ageCategoriesLoading,
);

const datePickerMinDate = computed(() => {
  const bounds = getSeasonYearBoundsFromForm();
  if (bounds) return new Date(bounds.minYear, 0, 1);
  const nameBounds = getYearBoundsFromSeasonName();
  if (nameBounds) return new Date(nameBounds.minYear, 0, 1);
  const currentYear = new Date().getFullYear();
  return new Date(currentYear, 0, 1);
});

const datePickerMaxDate = computed(() => {
  const bounds = getSeasonYearBoundsFromForm();
  if (bounds) return new Date(bounds.maxYear, 11, 31);
  const nameBounds = getYearBoundsFromSeasonName();
  if (nameBounds) return new Date(nameBounds.maxYear, 11, 31);
  const currentYear = new Date().getFullYear();
  return new Date(currentYear + 1, 11, 31);
});

function parseToMoment(
  value: Date | string | null | undefined,
): moment.Moment | null {
  if (value == null) return null;
  const m = moment(value);
  return m.isValid() ? m : null;
}

function formatWeeksDuration(weeks: number) {
  const rounded = Math.ceil((weeks * 10) / 10);
  return rounded;
}

const weeksDisplay = computed(() => {
  const formStart = parseToMoment(startDate.value);
  const formEnd = parseToMoment(endDate.value);

  if (!formStart || !formEnd) return "";

  if (formEnd.isBefore(formStart)) return "";

  const weeks = formEnd.diff(formStart, "weeks", true);
  return formatWeeksDuration(weeks);
});

const startDateForPicker = usePrimeVueDatePickerSync(startDate);
const endDateForPicker = usePrimeVueDatePickerSync(endDate);

const validResult = ref<LearningLineDetailsData | null>(null);

const submitFn = handleSubmit(
  (values) => {
    const data: LearningLineDetailsData = {
      name: values.name,
      targetGroupIds: values.targetGroupIds,
      clubIds: values.clubIds,
      ageCategoryIds: values.ageCategoryIds,
      seasonId: values.seasonId,
      seasonName: values.seasonName,
      startDate: formatIsoDate(values.startDate),
      endDate: formatIsoDate(values.endDate),
      description: values.description ?? "",
      isRecurring: values.isRecurring ?? true,
    };
    validResult.value = data;
    emit("validated", data);
    emit("submit", data);
  },
  () => {
    validResult.value = null;
  },
);

const handleFormSubmit = async () => {
  await submitFn();
};

const validate = async () => {
  validResult.value = null;
  await submitFn();
  return validResult.value !== null;
};

onMounted(async () => {
  await Promise.all([
    referenceStore.fetchClubs(),
    referenceStore.fetchAgeCategories(),
  ]);

  if (!isEditOngoing.value && !(seasonName.value ?? "").trim()) {
    const currentYear = new Date().getFullYear();
    const nextYear = currentYear + 1;
    seasonName.value = `${currentYear}-${nextYear}`;
    seasonId.value = 0;
  }
});

watch(
  () => props.initialData,
  (val) => {
    if (val) {
      setValues({
        name: val.name ?? "",
        targetGroupIds: val.targetGroupIds ?? [],
        clubIds: val.clubIds ?? [],
        ageCategoryIds: val.ageCategoryIds ?? [],
        seasonId: val.seasonId,
        seasonName: val.seasonName ?? "",
        startDate: val.startDate ?? undefined,
        endDate: val.endDate ?? undefined,
        description: val.description ?? "",
        isRecurring: val.isRecurring ?? true,
      } as Record<string, unknown>);
    }
  },
  { immediate: true, deep: true },
);

defineExpose({
  validate,
});
</script>
