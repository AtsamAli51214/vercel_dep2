<template>
  <div v-if="dashboardData" class="flex flex-col gap-6">
    <div
      class="bg-white rounded-2xl p-6"
      :class="{ 'bg-table-header-bg! border border-stroke': isDashboard }"
    >
      <div
        class="grid grid-cols-1 md:grid-cols-3 gap-4 py- bg-table-header-bg rounded-2xl w-full"
      >
        <LearningLineSummaryStat
          v-for="stat in summaryStats"
          :key="stat.label"
          :label="stat.label"
          :value="stat.value"
          :multiline="stat.multiline"
          class="py-6"
        />
      </div>
    </div>

    <div
      class="grid w-full min-h-0 grid-cols-1 gap-4 lg:grid-cols-10 lg:grid-rows-[auto_1fr]"
      v-if="isDashboard"
    >
      <LearningLineSkillsOverview
        v-model:genre-id="graphGenreId"
        :segment-id="graphSegmentId"
        :skills-overview="skillsOverview"
        :dashboard-graphs-loading="graphsLoading"
        :segment-week-bounds-by-segment="seasonWeekBoundsBySegment"
        @update:segment-id="onGraphSegmentIdUpdate"
      />
      <LearningLineFocusDistribution
        :category-distribution="categoryDistribution"
      />
    </div>

    <div class="bg-white rounded-2xl p-6">
      <LearningLineWeeklyPlan
        :learning-line-id="dashboardData?.id"
        :isViewOnly="isDashboard"
        :segments="dashboardData.segments ?? []"
        :week-count="dashboardData.weekCount ?? 0"
        :total-weeks="dashboardData.totalWeeks ?? 0"
        @week-action="onWeekAction"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, inject, ref, type Ref } from "vue";
import { useI18n } from "vue-i18n";
import type { TableDataRef } from "@/types";
import type {
  LearningLineWeekActionPayload,
  LearningLineWithPlan,
} from "@/types/learningLine";
import { formatDate } from "@/utils/helpers";
import { useLearningLineDashboardGraphs } from "@/composables/useLearningLineDashboardGraphs";
import { DEFAULT_LEARNING_LINE_CATEGORY_DISTRIBUTION } from "@/constants/learningLineCategoryDistribution";
import LearningLineFocusDistribution from "@/components/LearningLine/LearningLineFocusDistribution.vue";
import LearningLineSkillsOverview from "@/components/LearningLine/LearningLineSkillsOverview.vue";
import LearningLineSummaryStat from "./LearningLineSummaryStat.vue";
import LearningLineWeeklyPlan from "./LearningLineWeeklyPlan.vue";

const props = withDefaults(
  defineProps<{
    dashboardData: LearningLineWithPlan | null;
    isDashboard?: boolean;
  }>(),
  {
    isDashboard: false,
  },
);

const emit = defineEmits<{
  back: [];
  cancel: [];
  complete: [];
  "week-action": [payload: LearningLineWeekActionPayload];
}>();

const { t } = useI18n();

const learningLineId = computed(() => props.dashboardData?.id);

const initialDashboardGraphsPayload = inject<
  Ref<Record<string, unknown> | null> | null
>("initialDashboardGraphsPayload", null);

const {
  graphGenreId,
  graphSegmentId,
  skillsOverview,
  categoryDistribution,
  seasonWeekBoundsBySegment,
  graphsLoading,
  onGraphSegmentIdUpdate,
} = props.isDashboard
  ? useLearningLineDashboardGraphs(learningLineId, {
      initialPayload: initialDashboardGraphsPayload,
    })
  : {
      graphGenreId: ref(0),
      graphSegmentId: ref<number | undefined>(undefined),
      skillsOverview: ref(null),
      categoryDistribution: ref(DEFAULT_LEARNING_LINE_CATEGORY_DISTRIBUTION),
      seasonWeekBoundsBySegment: ref(null),
      graphsLoading: ref(false),
      onGraphSegmentIdUpdate: () => {},
    };

const summaryStats = computed(() => {
  return [
    {
      label: t("Academy.LearningLines.seasonStart"),
      value: formatDate(props.dashboardData?.startDate, t, "Do MMM, YYYY"),
    },
    {
      label: t("Academy.LearningLines.seasonEnd"),
      value: formatDate(props.dashboardData?.endDate, t, "Do MMM, YYYY"),
    },
    {
      label: t("Academy.LearningLines.totalWeeks"),
      value: props.dashboardData?.totalWeeks ?? 0,
    },
    {
      label: t("Academy.LearningLines.targetGroups"),
      value: targetGroupsDisplay.value,
      multiline: targetGroupsDisplay.value.length > 20,
    },
    {
      label: t("Academy.LearningLines.clubs"),
      value: clubsDisplay.value,
      multiline: clubsDisplay.value.length > 20,
    },
    {
      label: t("Academy.LearningLines.ageCategories"),
      value: ageCategoriesDisplay.value,
      multiline: ageCategoriesDisplay.value.length > 20,
    },
  ];
});

const targetGroupsDisplay = computed(() => {
  if (!props.dashboardData?.targetGroups?.length) return "—";
  return props.dashboardData.targetGroups.map((tg: TableDataRef) => tg.name);
});

const clubsDisplay = computed(() => {
  if (!props.dashboardData?.clubs?.length) return "—";
  return props.dashboardData.clubs.map((c: TableDataRef) => c.name);
});

const ageCategoriesDisplay = computed(() => {
  if (!props.dashboardData?.ageGroups?.length) return "—";
  return props.dashboardData.ageGroups.map((ag: TableDataRef) => ag.name);
});

const deletedWeeksIds = ref<number[]>([]);

const onWeekAction = (payload: LearningLineWeekActionPayload) => {
  if (payload.action === "delete") {
    deletedWeeksIds.value.push(payload.weekId);
    if (props.dashboardData?.segments?.[payload.segmentIndex]) {
      const weeks = props.dashboardData.segments[payload.segmentIndex].weeks;
      const weekToDelete = weeks.find((w) => w.id === payload.weekId);
      if (weekToDelete) {
        const index = weeks.indexOf(weekToDelete);
        if (index > -1) {
          weeks.splice(index, 1);
        }
      }
    }
  }
  if (payload.action === "addContent") {
    emit("week-action", payload);
  }
  if (payload.action === "edit") {
    emit("week-action", payload);
  }
  if (payload.action === "view") {
    emit("week-action", payload);
  }
  if (payload.action === "drag") {
    emit("week-action", payload);
  }
};
</script>
