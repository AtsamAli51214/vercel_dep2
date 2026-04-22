import { ref, watch, type ComputedRef, type Ref } from "vue";
import { learningLineService } from "@/services";
import { DEFAULT_LEARNING_LINE_CATEGORY_DISTRIBUTION } from "@/constants/learningLineCategoryDistribution";
import type {
  LearningLineCategoryDistribution,
  LearningLineSkillsOverview,
} from "@/types/learningLine";
import type { SegmentWeekBounds } from "@/utils/learningLineDashboardGraphs";
import {
  parseCategoryDistribution,
  parseSeasonPlanWeekBounds,
  parseSkillsOverview,
} from "@/utils/learningLineDashboardGraphs";

export type UseLearningLineDashboardGraphsOptions = {
  initialPayload?: Ref<Record<string, unknown> | null> | null;
};

export function useLearningLineDashboardGraphs(
  learningLineId: Ref<number | undefined> | ComputedRef<number | undefined>,
  options?: UseLearningLineDashboardGraphsOptions,
) {
  const graphGenreId = ref(0);
  const graphSegmentId = ref<number | undefined>(undefined);
  const skillsOverview = ref<LearningLineSkillsOverview | null>(null);
  const categoryDistribution = ref<LearningLineCategoryDistribution>(
    DEFAULT_LEARNING_LINE_CATEGORY_DISTRIBUTION,
  );

  const seasonWeekBoundsBySegment = ref<Map<number, SegmentWeekBounds[]> | null>(
    null,
  );

  const graphsLoading = ref(false);

  function applyDashboardPayload(apiData: Record<string, unknown>) {
    const so = parseSkillsOverview(apiData.skillsOverview);
    const cd = parseCategoryDistribution(apiData.categoryDistribution);
    seasonWeekBoundsBySegment.value = parseSeasonPlanWeekBounds(
      apiData.seasonPlan,
    );

    skillsOverview.value = so;
    categoryDistribution.value =
      cd ?? DEFAULT_LEARNING_LINE_CATEGORY_DISTRIBUTION;

    if (graphSegmentId.value == null) {
      if (cd?.selectedPhase?.segmentId != null) {
        graphSegmentId.value = cd.selectedPhase.segmentId;
      } else if (so?.phases?.length) {
        const sorted = [...so.phases].sort((a, b) => a.position - b.position);
        graphSegmentId.value = sorted[0]!.segmentId;
      }
    }
  }

  async function fetchDashboardGraphs() {
    const id = learningLineId.value;
    if (id == null) {
      graphsLoading.value = false;
      return;
    }

    graphsLoading.value = true;
    try {
      const params: { genreId?: number; segmentId?: number } = {};
      if (graphGenreId.value > 0) {
        params.genreId = graphGenreId.value;
      }
      if (graphSegmentId.value != null) {
        params.segmentId = graphSegmentId.value;
      }

      const result = await learningLineService.getLearningLineDashboard(
        id,
        params,
      );
      if (!result.success || !result.data) {
        return;
      }

      const apiData = (result.data ?? {}) as Record<string, unknown>;
      applyDashboardPayload(apiData);
    } finally {
      graphsLoading.value = false;
    }
  }

  function onGraphSegmentIdUpdate(segmentId: number) {
    if (graphSegmentId.value === segmentId) return;
    graphSegmentId.value = segmentId;
    void fetchDashboardGraphs();
  }

  watch(graphGenreId, () => {
    void fetchDashboardGraphs();
  });

  watch(
    learningLineId,
    (id, prev) => {
      if (id !== prev) {
        graphSegmentId.value = undefined;
        skillsOverview.value = null;
        seasonWeekBoundsBySegment.value = null;
      }
      if (id == null) {
        return;
      }
      const initialRef = options?.initialPayload;
      const initial = initialRef?.value;
      if (
        initialRef != null &&
        initial != null &&
        Object.keys(initial).length > 0
      ) {
        applyDashboardPayload(initial);
        initialRef.value = null;
        return;
      }
      void fetchDashboardGraphs();
    },
    { immediate: true },
  );

  return {
    graphGenreId,
    graphSegmentId,
    skillsOverview,
    categoryDistribution,
    seasonWeekBoundsBySegment,
    graphsLoading,
    fetchDashboardGraphs,
    onGraphSegmentIdUpdate,
  };
}
