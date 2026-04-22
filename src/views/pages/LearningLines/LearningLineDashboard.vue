<template>
  <div>
    <div v-if="dashboardData" class="flex flex-col gap-6">
      <div class="flex justify-between">
        <div class="flex flex-col">
          <span class="font-bold text-3xl text-primary">{{
            dashboardData?.name ?? ""
          }}</span>
          <span class="font-medium text-secondary-color text-xs">
            {{ seasonRangeLabel }}
          </span>
        </div>

        <div class="flex gap-2">
          <Button
            icon="pi pi-upload"
            severity="secondary"
            rounded
            :disabled="!dashboardData?.id"
            :aria-label="t('Academy.LearningLines.export')"
            @click="toggleExportMenu"
          />
          <Menu ref="exportMenu" :model="exportMenuItems" :popup="true" />
          <router-link :to="`/pages/learningLines/edit/${dashboardData?.id}`">
            <Button icon="pi pi-pencil" severity="secondary" rounded />
          </router-link>
          <router-link to="/pages/learningLines">
            <Button
              icon="pi pi-arrow-left"
              severity="secondary"
              rounded
              outlined
            />
          </router-link>
        </div>
      </div>

      <LearningLineDetailsForm
        :isDashboard="true"
        :dashboardData="dashboardData"
        @cancel="router.push({ name: 'learningLines' })"
        @complete="handleDetailsComplete"
        @week-action="handleWeekAction"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, provide, ref } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
import { useAppLoader, useGlobalDialog } from "@/composables";
import {
  learningLineService,
  mapApiResponseToLearningLineWithPlan,
} from "@/services";
import type { LearningLineDetailApi } from "@/types";
import type {
  LearningLineWithPlan,
  LearningLineWeekActionPayload,
} from "@/types/learningLine";
import { LearningLineDetailsForm } from "./Steps";
import { downloadFileFromUrl, formatDate } from "@/utils/helpers";
import Menu from "primevue/menu";

/** Matches BaseLoader fade leave (~200ms) so the overlay finishes before dashboard mounts. */
const LOADER_LEAVE_MS = 220;

const { t } = useI18n();
const router = useRouter();
const route = useRoute();
const loader = useAppLoader();
const dialog = useGlobalDialog();

const learningLineId = ref<string | number | undefined>(
  route.params.id as string | undefined,
);

const dashboardData = ref<LearningLineWithPlan | null>(null);

/** One-shot dashboard graphs payload from Promise.all; consumed by useLearningLineDashboardGraphs. */
const initialDashboardGraphsPayload = ref<Record<string, unknown> | null>(null);
provide("initialDashboardGraphsPayload", initialDashboardGraphsPayload);

const exportMenu = ref<InstanceType<typeof Menu>>();

function toggleExportMenu(event: Event) {
  exportMenu.value?.toggle(event);
}

const exportMenuItems = computed(() => [
  {
    label: t("Academy.LearningLines.exportXlsx"),
    icon: "pi pi-file-excel",
    command: () => {
      const id = dashboardData.value?.id ?? learningLineId.value;
      if (id != null) exportLearningLine(Number(id), 1);
    },
  },
  {
    label: t("Academy.LearningLines.exportCsv"),
    icon: "pi pi-table",
    command: () => {
      const id = dashboardData.value?.id ?? learningLineId.value;
      if (id != null) exportLearningLine(Number(id), 2);
    },
  },
]);

const exportLearningLine = async (
  learningLineId: number,
  exportFormat: 1 | 2,
) => {
  try {
    const result = await learningLineService.exportLearningLine(
      learningLineId,
      exportFormat,
    );
    if (result.success && result.data) {
      const { downloadUrl, fileName } = result.data;
      if (downloadUrl && fileName) {
        await downloadFileFromUrl(downloadUrl, fileName);
      }
    }
  } catch (error) {
    console.error("Failed to export learning line:", error);
  }
};

const seasonRangeLabel = computed(() => {
  const start = dashboardData.value?.startDate;
  const end = dashboardData.value?.endDate;
  if (!start && !end) return "";
  const monthYear = "MMMM YYYY";
  if (start && end) {
    return `${formatDate(start, t, monthYear)}/${formatDate(end, t, monthYear)}`;
  }
  if (start) return formatDate(start, t, monthYear);
  return formatDate(end, t, monthYear);
});

const fetchLearningLineData = async () => {
  if (!learningLineId.value) {
    router.push({ name: "learningLines" });
    return;
  }

  loader.setLoading(true, t("Academy.LearningLines.loading"));
  try {
    const id = learningLineId.value;
    const [lineResult, dashboardResult] = await Promise.all([
      learningLineService.getLearningLineById(id!),
      learningLineService.getLearningLineDashboard(id!),
    ]);

    if (lineResult.success && lineResult.data) {
      const apiData = lineResult.data?.data ?? lineResult.data;
      const raw = apiData as LearningLineDetailApi;
      const mapped = mapApiResponseToLearningLineWithPlan(raw);

      const prefetch: Record<string, unknown> | null =
        dashboardResult.success && dashboardResult.data
          ? (dashboardResult.data as Record<string, unknown>)
          : null;

      loader.setLoading(false);
      await nextTick();
      await new Promise<void>((resolve) => setTimeout(resolve, LOADER_LEAVE_MS));

      initialDashboardGraphsPayload.value = prefetch;
      dashboardData.value = mapped;
    } else {
      dialog.showError(
        t("app.error"),
        lineResult.error ?? t("Academy.LearningLines.errorLoading"),
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

onMounted(() => {
  void fetchLearningLineData();
});

const handleDetailsComplete = () => {
  router.push({ name: "learningLines" });
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
</script>
