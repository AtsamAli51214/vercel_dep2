<template>
  <div class="flex justify-center gap-6">
    <div class="bg-white rounded-2xl p-6 md:p-15 w-232 relative">
      <div
        @click="goBack"
        class="absolute mt-2 transition-opacity cursor-pointer left-2 md:left-10 hover:opacity-80"
      >
        <img :src="BackArrow" alt="back" />
      </div>
      <div class="flex flex-col gap-6">
        <div class="flex flex-col">
          <span class="font-bold text-3xl text-primary">{{
            phase === "form"
              ? isEditMode
                ? t("Academy.LearningLines.editTitle")
                : t("Academy.LearningLines.createTitle")
              : (dashboardData?.name ?? "")
          }}</span>
          <span class="font-medium text-secondary-color text-xs">
            {{
              phase === "form"
                ? isEditMode
                  ? t("Academy.LearningLines.editDescription")
                  : t("Academy.LearningLines.createDescription")
                : t("Academy.LearningLines.updateManageSharedContent")
            }}
          </span>
        </div>

        <LearningLineForm
          v-if="phase === 'form'"
          :initialData="initialData"
          :isEditMode="isEditMode"
          :lineStatus="dashboardData?.status"
          @submit="handleFormSubmit"
        />

        <LearningLineDetailsForm
          v-else-if="phase === 'details'"
          :dashboardData="dashboardData"
          @back="handleBackToForm"
          @week-action="handleWeekAction"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
import { BackArrow } from "@/assets/images";
import { useAppLoader, useGlobalDialog } from "@/composables";
import { learningLineService } from "@/services";
import { useActiveLearningLineStore } from "@/stores/activeLearningLine";
import type { LearningLineDetailApi, TableDataRef } from "@/types";
import type {
  LearningLineDetailsData,
  LearningLineWeekActionPayload,
  LearningLineWithPlan,
} from "@/types/learningLine";
import { LearningLineForm, LearningLineDetailsForm } from "./Steps";

const { t } = useI18n();
const router = useRouter();
const route = useRoute();
const loader = useAppLoader();
const dialog = useGlobalDialog();

const learningLineId = ref<string | number | undefined>(
  route.params.id as string | undefined,
);
const isEditMode = computed(() => Boolean(learningLineId.value));

const phase = ref<"form" | "details">(
  route.name === "learningLineWeeklyPlan" ? "details" : "form",
);

const savedFormData = ref<LearningLineDetailsData | null>(null);
const dashboardData = ref<LearningLineWithPlan | null>(null);
const activeLearningLine = useActiveLearningLineStore();

watch(
  () => activeLearningLine.plan,
  (p) => {
    if (phase.value === "details") {
      dashboardData.value = p;
    }
  },
);

const initialData = computed(() => {
  if (!dashboardData.value) return undefined;

  const data = dashboardData.value;
  return {
    name: data.name,
    targetGroupIds: data.targetGroups?.map((tg: TableDataRef) => tg.id) ?? [],
    clubIds: data.clubs?.map((c: TableDataRef) => c.id) ?? [],
    ageCategoryIds: data.ageGroups?.map((ag: TableDataRef) => ag.id) ?? [],
    seasonId: data.seasonId,
    seasonName: data.seasonName,
    startDate: data.startDate,
    endDate: data.endDate,
    description: data.description,
    isRecurring: data.isRecurring,
  };
});

const fetchLearningLineData = async () => {
  if (!learningLineId.value) return;

  loader.setLoading(true, t("Academy.LearningLines.loading"));
  try {
    const result = await activeLearningLine.ensureLoaded(learningLineId.value);
    if (result.success && activeLearningLine.plan) {
      dashboardData.value = activeLearningLine.plan;
    } else {
      dialog.showError(
        t("app.error"),
        result.error ?? t("Academy.LearningLines.errorLoading"),
        t("app.ok"),
      );
      router.push({ name: "learningLines" });
    }
  } catch (error) {
    dialog.showError(
      t("app.error"),
      error instanceof Error
        ? error.message
        : t("Academy.LearningLines.errorLoading"),
      t("app.ok"),
    );
    router.push({ name: "learningLines" });
  } finally {
    loader.setLoading(false);
  }
};

onMounted(async () => {
  if (isEditMode.value) {
    await fetchLearningLineData();
  }
});

const buildPayload = (formData: LearningLineDetailsData) => {
  return {
    name: formData.name ?? "",
    description: formData.description || undefined,
    targetGroups: formData.targetGroupIds ?? [],
    seasonName: formData.seasonName ?? "",
    startDate: formData.startDate ?? "",
    endDate: formData.endDate ?? "",
    isRecurring: formData.isRecurring ?? false,
    clubIds: formData.clubIds ?? [],
    ageGroupIds: formData.ageCategoryIds ?? [],
  };
};

const handleFormSubmit = async (formData: LearningLineDetailsData) => {
  savedFormData.value = formData;
  const loadingMessage = isEditMode.value
    ? t("Academy.LearningLines.updating")
    : t("Academy.LearningLines.creating");
  loader.setLoading(true, loadingMessage);

  try {
    const payload = buildPayload(formData);

    const result =
      isEditMode.value && learningLineId.value
        ? await learningLineService.updateLearningLine(
            learningLineId.value,
            payload,
          )
        : await learningLineService.createLearningLine(payload);

    if (result.success) {
      const responseBody = result.data?.data ?? result.data;
      if (responseBody && typeof responseBody === "object") {
        activeLearningLine.applyFromApiBody(responseBody);
        dashboardData.value = activeLearningLine.plan;
      }
      const body = responseBody as LearningLineDetailApi | undefined;
      const createdId = body?.id ?? body?.Id;
      if (createdId != null) {
        learningLineId.value = createdId as string | number;
        router.replace({
          name: "learningLineWeeklyPlan",
          params: { id: createdId as string },
        });
      }
      phase.value = "details";
    } else {
      const errorMessage = isEditMode.value
        ? t("Academy.LearningLines.errorUpdating")
        : t("Academy.LearningLines.errorCreating");
      dialog.showError(
        t("app.error"),
        result.error ?? errorMessage,
        t("app.ok"),
      );
    }
  } finally {
    loader.setLoading(false);
  }
};

const handleBackToForm = () => {
  phase.value = "form";
};

const handleWeekAction = (payload: LearningLineWeekActionPayload) => {
  if (payload.action === "addContent") {
    router.push({
      name: "learningLineWeekContent",
      params: {
        learningLineId: learningLineId.value ?? route.params.id,
        weekId: payload.weekId,
      },
      query: {
        segmentIndex: String(payload.segmentIndex),
        weekNumber: String(payload.weekNumber),
        action: 1,
      },
    });
  }
  if (payload.action === "edit") {
    router.push({
      name: "learningLineWeekContent",
      params: {
        learningLineId: learningLineId.value ?? route.params.id,
        weekId: payload.weekId,
      },
      query: {
        segmentIndex: String(payload.segmentIndex),
        weekNumber: String(payload.weekNumber),
        action: 2,
      },
    });
  }
  if (payload.action === "view") {
    router.push({
      name: "learningLineWeekContent",
      params: {
        learningLineId: learningLineId.value ?? route.params.id,
        weekId: payload.weekId,
      },
      query: {
        segmentIndex: String(payload.segmentIndex),
        weekNumber: String(payload.weekNumber),
        action: 3,
      },
    });
  }
};

const goBack = () => {
  if (phase.value === "details") {
    phase.value = "form";
    router.replace({
      name: "editLearningLine",
      params: { id: dashboardData.value?.id },
    });
  } else {
    router.back();
  }
};
</script>
