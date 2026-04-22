<template>
  <section class="contents">
    <div
      class="col-start-1 row-start-1 flex flex-col gap-4 lg:col-span-7 lg:col-start-1 lg:row-start-1"
    >
      <h2
        class="col-start-1 row-start-3 !m-0 !font-sans !font-semibold !text-[18px] !leading-[26px] !tracking-normal !text-neutral-400 lg:col-span-4 lg:col-start-7 lg:row-start-1 !text-text-dark"
      >
        {{ t("Academy.LearningLines.skillsOverviewTitle") }}
      </h2>
      <div
        v-if="segmentTabs.length"
        class="flex w-full max-w-2xl rounded-2xl border border-stroke bg-white p-1 shadow-sm"
        role="tablist"
      >
        <button
          v-for="tab in segmentTabs"
          :key="String(tab.value)"
          type="button"
          role="tab"
          :aria-selected="isTabSelected(tab.value)"
          class="min-h-[48px] flex-1 !rounded-2xl px-3 py-2.5 text-sm font-medium transition-colors"
          :class="
            isTabSelected(tab.value)
              ? 'bg-primary text-white shadow-sm'
              : 'text-text-dark hover:bg-neutral-50'
          "
          @click="selectTab(tab.value)"
        >
          {{ tab.label }}
        </button>
      </div>
      <Select
        v-if="hasApiPhases"
        v-model="genreId"
        :options="filterOptions"
        option-label="label"
        option-value="value"
        class="max-w-xs"
        fluid
      />
    </div>

    <div
      class="col-start-1 row-start-2 flex min-h-0 max-h-[478px] min-w-0 shrink-0 flex-col overflow-hidden rounded-2xl border border-stroke bg-white py-4 shadow-sm lg:col-span-7 lg:col-start-1 lg:row-start-2"
      :class="
        showApiSkillsEmpty || showNoSkillsOverviewData
          ? 'items-center justify-center'
          : ''
      "
    >
      <p
        v-if="showApiSkillsEmpty"
        class="m-0 max-w-md px-4 text-center text-sm text-secondary-color"
      >
        {{ t("Academy.LearningLines.skillsOverviewNoSkills") }}
      </p>
      <p
        v-else-if="showNoSkillsOverviewData"
        class="m-0 max-w-md px-4 text-center text-sm text-secondary-color"
      >
        {{ t("Academy.LearningLines.skillsOverviewNoSkills") }}
      </p>
      <div
        v-else
        class="min-h-0 w-full flex-1 overflow-y-auto overflow-x-hidden overscroll-y-contain [scrollbar-gutter:stable]"
      >
        <div
          class="relative flex min-h-0 min-w-0 w-full items-stretch gap-0"
          :style="{ height: `${chartHeight}px` }"
        >
          <div
            class="pointer-events-none absolute inset-x-0 top-0 z-[3]"
            :style="{ height: `${chartHeight}px` }"
            aria-hidden="true"
          >
            <div
              v-for="j in skillRowBoundaryIndices"
              :key="`skill-grid-${j}`"
              class="absolute left-0 right-0 h-px"
              :style="{
                top: `${skillsAxisHeaderRowPx + j * skillRowHeightPx}px`,
                backgroundColor: GRID,
              }"
            />
          </div>
          <div
            class="relative z-[2] flex shrink-0 flex-col bg-white pl-2 pr-1"
            :style="{ width: `${SKILL_LABEL_COL_PX}px` }"
          >
            <div
              class="flex shrink-0 flex-col justify-end pb-3"
              :style="{ minHeight: `${skillsAxisHeaderRowPx}px` }"
            >
              <span
                class="text-left text-[11px] font-bold uppercase tracking-wide text-neutral-400"
              >
                {{ t("Academy.LearningLines.skillsAxisLabel") }}
              </span>
            </div>
            <div
              class="flex min-h-0 flex-1 flex-col"
              :style="{ height: `${skillLabelColumnBodyPx}px` }"
            >
              <div
                v-for="(name, idx) in skillRowLabels"
                :key="`${name}-${idx}`"
                class="flex shrink-0 items-center"
                :style="{ height: `${skillRowHeightPx}px` }"
              >
                <BaseTooltip :value="name" as="div" class="min-w-0 max-w-full">
                  <span
                    class="block max-w-full cursor-default truncate text-left text-xs font-bold text-primary"
                  >
                    {{ name }}
                  </span>
                </BaseTooltip>
              </div>
            </div>
          </div>
          <div
            class="relative z-[1] min-h-0 flex-1 overflow-x-auto overflow-y-hidden overscroll-x-contain bg-white"
          >
          <div
            class="min-h-0 w-full min-w-0 overflow-hidden"
            :style="{
              minWidth: `max(100%, ${chartMinContentWidthPx}px)`,
              '--wk-label-shift': `${weekAxisLabelShiftPx}px`,
            }"
          >
              <VueApexCharts
                :key="chartRenderKey"
                type="rangeBar"
                class="min-h-0 w-full shrink-0"
                :height="chartHeight"
                :options="chartOptions"
                :series="series"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import VueApexCharts from "vue3-apexcharts";
import type { ApexOptions } from "apexcharts";
import type ApexCharts from "apexcharts";
import { BaseTooltip } from "@/components/base";
import { GRID, MUTED, PRIMARY } from "@/constants/chartTheme";
import type {
  LearningLineSkillsOverview as LearningLineSkillsOverviewPayload,
  LearningLineSkillsOverviewPhase,
} from "@/types/learningLine";
import type { SegmentWeekBounds } from "@/utils/learningLineDashboardGraphs";

const props = withDefaults(
  defineProps<{
    skillsOverview?: LearningLineSkillsOverviewPayload | null;
    segmentId?: number;
    /** When true, hide demo/placeholder chart until dashboard API data is ready. */
    dashboardGraphsLoading?: boolean;
    /** From dashboard API `seasonPlan`: real week start/end per segment (ms). */
    segmentWeekBoundsBySegment?: Map<number, SegmentWeekBounds[]> | null;
  }>(),
  {
    dashboardGraphsLoading: false,
    segmentWeekBoundsBySegment: null,
  },
);

const emit = defineEmits<{
  (e: "update:segmentId", id: number): void;
}>();

const genreId = defineModel<number>("genreId", { default: 0 });

const { t } = useI18n();

const hasApiPhases = computed(
  () => (props.skillsOverview?.phases?.length ?? 0) > 0,
);

const apiPhasesSorted = computed(() =>
  [...(props.skillsOverview?.phases ?? [])].sort(
    (a, b) => a.position - b.position,
  ),
);

const effectiveSegmentId = computed(() => {
  if (!hasApiPhases.value) return null;
  const phases = apiPhasesSorted.value;
  if (!phases.length) return null;
  const sid = props.segmentId;
  if (sid != null && phases.some((p) => p.segmentId === sid)) {
    return sid;
  }
  return phases[0]!.segmentId;
});

const activeSegmentWeekBounds = computed((): SegmentWeekBounds[] | null => {
  const sid = effectiveSegmentId.value;
  if (sid == null) return null;
  return props.segmentWeekBoundsBySegment?.get(sid) ?? null;
});

type TabValue = number;

const segmentTabs = computed(() => {
  /* Only hide tabs before the first skills payload (initial page load), not during genre/segment refetch. */
  if (props.dashboardGraphsLoading && !hasApiPhases.value) return [];
  if (hasApiPhases.value) {
    return apiPhasesSorted.value.map((p) => ({
      label: p.segmentName,
      value: p.segmentId as TabValue,
    }));
  }
  return [];
});

function isTabSelected(value: TabValue): boolean {
  return effectiveSegmentId.value === value;
}

function selectTab(value: TabValue) {
  emit("update:segmentId", value as number);
}

const filterOptions = computed(() => [
  { label: t("Academy.LearningLines.skillsFilterAll"), value: 0 },
  { label: t("Academy.LearningLines.skillsFilterAttacking"), value: 1 },
  { label: t("Academy.LearningLines.skillsFilterDefending"), value: 2 },
  { label: t("Academy.LearningLines.skillsFilterTransition"), value: 3 },
  { label: t("Academy.LearningLines.skillsFilterGameSystems"), value: 4 },
  { label: t("Academy.LearningLines.skillsFilterGamePrinciples"), value: 5 },
  { label: t("Academy.LearningLines.skillsFilterSetPieces"), value: 6 },
  { label: t("Academy.LearningLines.skillsFilterPenaltyCorner"), value: 7 },
  { label: t("Academy.LearningLines.skillsFilterTraining"), value: 8 },
  { label: t("Academy.LearningLines.skillsFilterCoaching"), value: 9 },
  { label: t("Academy.LearningLines.skillsFilterPlayerGuidance"), value: 10 },
  {
    label: t("Academy.LearningLines.skillsFilterParentsEnvironment"),
    value: 11,
  },
  { label: t("Academy.LearningLines.skillsFilterClubOrganization"), value: 12 },
]);

const SKILL_LABEL_COL_PX = 200;
const SKILLS_HEADER_ROW_PX = 52;
const MIN_SKILL_ROW_PX = 40;
const RANGE_BAR_HEIGHT_PX = 26;
/** Vertical gap between stacked range bars in the same skill row (Apex stacks multiple `data` entries). */
const SKILL_ROW_STACK_GAP_PX = 2;
const CHART_TOP_PADDING_PX = 0;
const CHART_PX_PER_WEEK = 40;
const CHART_GRID_HORIZONTAL_PADDING_PX = 8;

/**
 * Inclusive week span → half-open [axisStart, axisEnd) on the numeric x-axis (one unit per week).
 * Keeps grid lines, labels, and range bars aligned (datetime + tickAmount was placing multiple ticks in one week).
 */
function weekRangeOnAxis(startWeek: number, endWeek: number): [number, number] {
  const lo = Math.min(startWeek, endWeek);
  const hi = Math.max(startWeek, endWeek);
  return [lo, hi + 1];
}

function mergeConsecutiveWeeks(sorted: number[]): [number, number][] {
  if (!sorted.length) return [];
  const ranges: [number, number][] = [];
  let start = sorted[0]!;
  let prev = sorted[0]!;
  for (let i = 1; i < sorted.length; i++) {
    const w = sorted[i]!;
    if (w === prev + 1) {
      prev = w;
      continue;
    }
    ranges.push([start, prev]);
    start = w;
    prev = w;
  }
  ranges.push([start, prev]);
  return ranges;
}

type SkillsRangeSeries = {
  name: string;
  data: { x: string; y: [number, number] }[];
};

function timelineDataForPhase(phase: LearningLineSkillsOverviewPhase): {
  series: SkillsRangeSeries[];
  maxWeek: number;
} {
  const skillWeeks = new Map<number, { name: string; weeks: Set<number> }>();
  let maxWeek = 1;
  for (const week of phase.weeks) {
    const wn = week.weekNumber;
    if (wn > maxWeek) maxWeek = wn;
    for (const sk of week.skills) {
      const id = sk.skillId;
      let entry = skillWeeks.get(id);
      if (!entry) {
        entry = { name: sk.name || `Skill ${id}`, weeks: new Set() };
        skillWeeks.set(id, entry);
      }
      entry.weeks.add(wn);
    }
  }
  const sortedSkills = [...skillWeeks.entries()].sort((a, b) => {
    const minA = Math.min(...a[1].weeks);
    const minB = Math.min(...b[1].weeks);
    if (minA !== minB) return minA - minB;
    return a[1].name.localeCompare(b[1].name);
  });
  const series: SkillsRangeSeries[] = [];
  for (const [, { name, weeks }] of sortedSkills) {
    const sorted = [...weeks].sort((x, y) => x - y);
    const ranges = mergeConsecutiveWeeks(sorted);
    const label = (name || "Skill").trim() || "Skill";
    const data = ranges.map(([start, end]) => ({
      // Same `x` as series name and `labels` / y-axis categories so Apex `detectOverlappingBars` rowIndex matches.
      // Multiple intervals per skill stack via `rangeBarGroupRows` + overlap handling.
      x: label,
      y: weekRangeOnAxis(start, end),
    }));
    series.push({
      name: label,
      data,
    });
  }
  return { series, maxWeek: Math.max(1, maxWeek) };
}

const activeApiPhase = computed((): LearningLineSkillsOverviewPhase | null => {
  if (!hasApiPhases.value) return null;
  const phases = apiPhasesSorted.value;
  if (!phases.length) return null;
  const id = effectiveSegmentId.value;
  if (id == null) return phases[0] ?? null;
  return phases.find((p) => p.segmentId === id) ?? phases[0] ?? null;
});

const apiTimeline = computed(() => {
  const phase = activeApiPhase.value;
  if (!phase) {
    return { series: [] as SkillsRangeSeries[], maxWeek: 1 };
  }
  return timelineDataForPhase(phase);
});

const showApiSkillsEmpty = computed(
  () => hasApiPhases.value && apiTimeline.value.series.length === 0,
);

/** API responded but there is no skills overview data (no phases). */
const showNoSkillsOverviewData = computed(
  () => !props.dashboardGraphsLoading && !hasApiPhases.value,
);

const chartMaxWeek = computed(() =>
  hasApiPhases.value ? apiTimeline.value.maxWeek : 1,
);

const series = computed((): SkillsRangeSeries[] => {
  if (!hasApiPhases.value) {
    return [];
  }
  const rows = JSON.parse(
    JSON.stringify(apiTimeline.value.series),
  ) as SkillsRangeSeries[];
  return [...rows].reverse();
});

/** Max number of separate week-range bars in any single skill row (multiple non-contiguous ranges stack in Apex). */
const maxRangeBarsPerSkillRow = computed(() => {
  if (!series.value.length) return 1;
  return Math.max(
    1,
    ...series.value.map((s) => Math.max(1, s.data?.length ?? 0)),
  );
});

/** Row height tall enough for stacked bars + gaps so bars stay inside grid lines. */
const pixelsPerSkillRow = computed(() => {
  const stacks = maxRangeBarsPerSkillRow.value;
  const minForStacks =
    stacks * RANGE_BAR_HEIGHT_PX +
    Math.max(0, stacks - 1) * SKILL_ROW_STACK_GAP_PX;
  return Math.max(MIN_SKILL_ROW_PX, minForStacks);
});

/** Bar thickness: split row among stacked bars so total height never exceeds the row band. */
const rangeBarHeightPx = computed(() => {
  const stacks = maxRangeBarsPerSkillRow.value;
  const rowPx = pixelsPerSkillRow.value;
  const inner = rowPx - Math.max(0, stacks - 1) * SKILL_ROW_STACK_GAP_PX;
  return Math.max(
    6,
    Math.min(RANGE_BAR_HEIGHT_PX, Math.floor(inner / stacks)),
  );
});

const chartRenderKey = computed(() => {
  const n = apiTimeline.value.series.length;
  const seg = effectiveSegmentId.value ?? 0;
  const b = activeSegmentWeekBounds.value;
  const calKey = b?.length
    ? `${b[0]!.startMs}-${b[b.length - 1]!.endMs}`
    : "syn";
  return `${seg}-${genreId.value}-${n}-s${maxRangeBarsPerSkillRow.value}-bh${rangeBarHeightPx.value}-${calKey}`;
});

const chartHeight = computed(() => {
  const rows = Math.max(series.value.length, 1);
  const fromRows =
    SKILLS_HEADER_ROW_PX + rows * pixelsPerSkillRow.value + CHART_TOP_PADDING_PX;
  return Math.max(420, fromRows);
});

const skillRowLabels = computed(() => series.value.map((s) => s.name));

const measuredPlotHeightPx = ref<number | null>(null);
const measuredTopBandPx = ref<number | null>(null);
const measuredTranslateY = ref<number | null>(null);
const measuredGridWidthPx = ref<number | null>(null);

watch(chartRenderKey, () => {
  measuredPlotHeightPx.value = null;
  measuredTopBandPx.value = null;
  measuredTranslateY.value = null;
  measuredGridWidthPx.value = null;
});

type ApexChartStateW = {
  layout?: { gridHeight?: number; translateY?: number; gridWidth?: number };
  globals?: { svgHeight?: number; gridWidth?: number };
};

const skillRowBoundaryIndices = computed(() => {
  const n = Math.max(skillRowLabels.value.length, 1);
  return Array.from({ length: n + 1 }, (_, j) => j);
});

function onApexChartLayout(chart: ApexCharts) {
  const w = (chart as unknown as { w?: ApexChartStateW }).w;
  nextTick(() => {
    requestAnimationFrame(() => {
      const gh = w?.layout?.gridHeight;
      const svgH = w?.globals?.svgHeight;
      const ty = w?.layout?.translateY;
      if (typeof gh === "number" && gh > 0) {
        measuredPlotHeightPx.value = gh;
      }
      if (typeof svgH === "number" && typeof gh === "number") {
        measuredTopBandPx.value = Math.max(0, svgH - gh);
      }
      if (typeof ty === "number" && ty >= 0) {
        measuredTranslateY.value = ty;
      }
      const gw = w?.globals?.gridWidth ?? w?.layout?.gridWidth;
      if (typeof gw === "number" && gw > 0) {
        measuredGridWidthPx.value = gw;
      }
    });
  });
}

/**
 * Half of one week column in px. Labels sit on integer tick positions; nudge so
 * "WK n" reads centered over that week’s band.
 */
const weekAxisLabelShiftPx = computed(() => {
  const wk = chartMaxWeek.value;
  if (wk <= 0) return 0;
  const gw = measuredGridWidthPx.value;
  if (gw != null && gw > 0) return gw / (2 * wk);
  const bandPx = Math.max(
    0,
    chartMinContentWidthPx.value - CHART_GRID_HORIZONTAL_PADDING_PX,
  );
  if (bandPx <= 0) return 0;
  return bandPx / (2 * wk);
});

const skillsAxisHeaderRowPx = computed(
  () =>
    measuredTranslateY.value ?? measuredTopBandPx.value ?? SKILLS_HEADER_ROW_PX,
);

const skillLabelColumnBodyPx = computed(() => {
  const m = measuredPlotHeightPx.value;
  if (m != null && m > 0) return m;
  return Math.max(0, chartHeight.value - SKILLS_HEADER_ROW_PX);
});

const skillRowHeightPx = computed(() => {
  const n = Math.max(skillRowLabels.value.length, 1);
  return skillLabelColumnBodyPx.value / n;
});

const chartMinContentWidthPx = computed(() => {
  const weeks = chartMaxWeek.value;
  return CHART_GRID_HORIZONTAL_PADDING_PX + weeks * CHART_PX_PER_WEEK;
});

const chartOptions = computed<ApexOptions>(() => {
  const maxW = chartMaxWeek.value;
  const rowCount = Math.max(series.value.length, 1);
  const colors = Array.from({ length: rowCount }, () => PRIMARY);
  const barH = rangeBarHeightPx.value;
  const barRadius = Math.min(8, Math.max(2, Math.floor(barH / 2)));
  return {
    labels: skillRowLabels.value,
    chart: {
      type: "rangeBar",
      toolbar: { show: false },
      zoom: { enabled: false },
      fontFamily: "inherit",
      background: "transparent",
      events: {
        mounted: onApexChartLayout,
        updated: onApexChartLayout,
      },
    },
    plotOptions: {
      bar: {
        horizontal: true,
        barHeight: barH,
        borderRadius: barRadius,
        rangeBarGroupRows: true,
        borderRadiusApplication: "end",
      },
    },
    colors,
    fill: {
      type: "solid",
      opacity: 1,
    },
    dataLabels: {
      enabled: false,
    },
    xaxis: {
      type: "numeric",
      position: "top",
      min: 1,
      max: maxW + 1,
      tickAmount: maxW,
      stepSize: 1,
      axisBorder: { show: true, color: GRID },
      axisTicks: { show: false },
      labels: {
        minHeight: 36,
        offsetX: 0,
        style: {
          colors: MUTED,
          fontSize: "11px",
          fontWeight: 600,
          cssClass: "learning-line-wk-axis",
        },
        formatter: (val: string | number) => {
          const n = Math.round(Number(val));
          if (!Number.isFinite(n) || n < 1 || n > maxW) return "";
          return `WK ${n}`;
        },
      },
    },
    yaxis: {
      show: true,
      categories: series.value.map((s) => s.name),
      labels: {
        show: false,
      },
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
    },
    grid: {
      borderColor: GRID,
      strokeDashArray: 0,
      xaxis: { lines: { show: true } },
      yaxis: { lines: { show: false } },
      padding: { top: 0, right: 0, bottom: 0, left: 0 },
    },
    tooltip: {
      enabled: false,
    },
    legend: {
      show: false,
    },
  };
});
</script>

<style scoped>
:deep(.learning-line-wk-axis) {
  transform: translateX(var(--wk-label-shift, 0px));
  fill: var(--color-text-dark);
  font-size: 12px;
  font-weight: 700;
}
</style>
