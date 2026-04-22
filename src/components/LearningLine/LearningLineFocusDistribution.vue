<template>
  <section
    class="col-start-1 row-start-3 flex min-h-0 flex-col gap-2 lg:col-start-8 lg:col-span-3 lg:row-start-1 lg:row-span-2 lg:gap-3 lg:items-start"
  >
    <h2
      class="shrink-0 !m-0 !font-sans !font-semibold !text-[18px] !leading-[26px] !tracking-normal !text-text-dark"
    >
      {{ t("Academy.LearningLines.focusDistributionTitle") }}
    </h2>
    <div
      class="box-border flex lg:w-[401px] max-w-full shrink-0 flex-col overflow-hidden rounded-2xl border border-stroke bg-white p-4 shadow-sm md:p-6"
      :style="{
        height: `${LEARNING_LINE_DASHBOARD_CHART_CARD_HEIGHT_PX}px`,
      }"
    >
      <template v-if="hasRenderableFocusData">
        <div class="flex min-h-0 min-w-0 flex-1 items-center justify-center">
          <VueApexCharts
            :key="chartRenderKey"
            type="donut"
            height="240"
            width="240"
            :options="chartOptions"
            :series="series"
          />
        </div>
        <ul class="mt-6 flex shrink-0 flex-col gap-6" role="list">
          <li v-for="row in rows" :key="row.key">
            <div
              class="flex items-center justify-between gap-3 text-sm text-text-dark"
            >
              <span class="flex min-w-0 items-center gap-2 font-medium">
                <span
                  class="size-1.5 shrink-0 rounded-full"
                  :style="{ backgroundColor: row.color }"
                  aria-hidden="true"
                />
                <span
                  class="truncate font-medium text-[12px] leading-[20px] tracking-normal"
                  >{{ row.label }}</span
                >
              </span>
              <span
                class="shrink-0 tabular-nums font-medium text-[12px] leading-[20px] tracking-normal"
              >
                ({{ row.percent }}%)
              </span>
            </div>
            <div
              class="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-neutral-100"
              role="progressbar"
              :aria-valuenow="row.percent"
              aria-valuemin="0"
              aria-valuemax="100"
              :aria-label="`${row.label} ${row.percent}%`"
            >
              <div
                class="h-full rounded-full transition-[width]"
                :style="{
                  width: `${row.percent}%`,
                  backgroundColor: row.color,
                }"
              />
            </div>
          </li>
        </ul>
      </template>
      <p
        v-else
        class="m-0 flex flex-1 items-center justify-center px-2 text-center text-sm text-secondary-color"
      >
        {{ t("Academy.LearningLines.focusDistributionEmpty") }}
      </p>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import VueApexCharts from "vue3-apexcharts";
import type { ApexOptions } from "apexcharts";
import { DEFAULT_LEARNING_LINE_CATEGORY_DISTRIBUTION } from "@/constants/learningLineCategoryDistribution";
import {
  FOCUS_COLORS,
  LEARNING_LINE_DASHBOARD_CHART_CARD_HEIGHT_PX,
} from "@/constants/chartTheme";
import type { LearningLineCategoryDistribution } from "@/types/learningLine";

const props = defineProps<{
  categoryDistribution?: LearningLineCategoryDistribution | null;
}>();

const { t } = useI18n();

const hasRenderableFocusData = computed(() => {
  const cats = props.categoryDistribution?.categories;
  if (!cats?.length) return false;
  const sum = cats.reduce(
    (s, c) => s + Math.max(0, Number(c.percentage) || 0),
    0,
  );
  return sum > 0;
});

const resolvedDistribution = computed((): LearningLineCategoryDistribution => {
  const cats = props.categoryDistribution?.categories;
  if (cats?.length) {
    return props.categoryDistribution as LearningLineCategoryDistribution;
  }
  return DEFAULT_LEARNING_LINE_CATEGORY_DISTRIBUTION;
});

const rows = computed(() => {
  const cats = resolvedDistribution.value.categories;
  return cats.map((cat, i) => ({
    key: `category-${cat.categoryId}`,
    label: cat.name,
    color: FOCUS_COLORS[i % FOCUS_COLORS.length]!,
    percent: Math.max(
      0,
      Math.min(100, Math.round(Number(cat.percentage) || 0)),
    ),
  }));
});

const series = computed(() => rows.value.map((r) => r.percent));

/** Forces donut remount when API data replaces placeholder so Apex does not keep stale arcs. */
const chartRenderKey = computed(() =>
  rows.value.map((r) => `${r.key}:${r.percent}`).join("|"),
);

const chartOptions = computed<ApexOptions>(() => ({
  chart: {
    type: "donut",
    toolbar: { show: false },
    fontFamily: "inherit",
    background: "transparent",
  },
  labels: rows.value.map((r) => r.label),
  colors: rows.value.map((r) => r.color),
  plotOptions: {
    pie: {
      donut: {
        size: "60%",
      },
    },
  },
  stroke: {
    width: 0,
  },
  dataLabels: {
    enabled: false,
  },
  legend: {
    show: false,
  },
  tooltip: {
    y: {
      formatter: (val: number) => `${val}%`,
    },
  },
  states: {
    hover: {
      filter: { type: "none" },
    },
    active: {
      filter: { type: "none" },
    },
  },
}));
</script>
