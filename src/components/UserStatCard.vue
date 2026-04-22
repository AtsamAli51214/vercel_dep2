<template>
  <div class="flex items-center gap-4 p-6 bg-white rounded-3xl">
    <div class="flex items-baseline gap-1">
      <span class="text-[2.5rem] font-bold font-inter">{{ activeCount }}</span>
      <span v-if="percentage !== undefined" class="text-sm">
        ({{ percentage }}%)
      </span>
    </div>
    <div class="flex flex-col justify-start text-secondary-color">
      <img v-if="icon" :src="icon" class="w-4 h-4 mb-3" :alt="label" />
      <span class="font-medium">{{ label }}</span>
      <slot></slot>
      <span
        v-if="inactiveCount !== undefined && totalCount !== undefined"
        class="text-xs"
      >
        {{ t("Users.inactive") }}: {{ inactiveCount }} • {{ t("Users.total") }}:
        {{ totalCount }}
      </span>
      <div
        v-if="weeklyChange !== undefined"
        class="flex items-start gap-2 text-sm"
        :class="getChartColor(weeklyChange)"
      >
        <div class="flex items-center gap-1">
          <img :src="getChartIcon(weeklyChange)" class="w-3" alt="chart" />
          <span class="font-semibold">{{
            weeklyChange > 0 ? "+" + weeklyChange : weeklyChange
          }}</span>
        </div>
        <span>{{ t("Users.thisWeek") }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { ChartUp, ChartDown, ChartNormal } from "@/assets/images";

interface Props {
  icon?: string;
  label: string;
  activeCount: number;
  inactiveCount?: number;
  totalCount?: number;
  weeklyChange?: number;
  percentage?: number;
}

defineProps<Props>();

const { t } = useI18n();

const getChartIcon = (value: number) => {
  if (value > 0) return ChartUp;
  else if (value < 0) return ChartDown;
  else return ChartNormal;
};

const getChartColor = (value: number) => {
  if (value > 0) return "text-green-500";
  else if (value < 0) return "text-red-500";
  else return "";
};
</script>
