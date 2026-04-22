<template>
  <div class="flex flex-col gap-3">
    <div class="flex flex-wrap items-center justify-between">
      <span class="text-lg font-semibold">
        {{ t("Academy.LearningLines.weeklyPlan") }}
      </span>
      <div v-if="!isViewOnly" class="flex items-center gap-2">
        <BaseTooltip
          :value="t('Academy.LearningLines.clickToDrag')"
          position="top"
          as="span"
        >
          <Button
            icon="pi pi-th-large"
            rounded
            outlined
            :severity="canDrag ? 'primary' : 'secondary'"
            @click="canDrag = !canDrag"
          />
        </BaseTooltip>

        <Button
          :label="t('Academy.LearningLines.importPrevious')"
          icon="pi pi-file-import"
          rounded
          outlined
          severity="secondary"
          @click="emit('import-previous')"
        />
      </div>
    </div>

    <p
      v-if="!segmentsList.length"
      class="text-sm text-secondary-color m-0 py-4 text-center"
    >
      {{ t("Academy.LearningLines.weeklyPlanEmpty") }}
    </p>

    <Accordion
      v-else
      v-model:value="openPanels"
      multiple
      class="flex flex-col gap-2 border-0 [&_.p-accordionpanel]:mb-0"
      :pt="{
        root: { class: 'flex flex-col gap-2 border-0' },
        panel: {
          class:
            '!mb-0 !border border-stroke rounded-xl overflow-hidden bg-white',
        },
        header: { class: '!bg-table-header-bg !border-0' },
        content: { class: '!border-0 !pt-0 !pb-4 !px-4' },
      }"
    >
      <AccordionPanel
        v-for="(section, idx) in segmentsList"
        :key="idx"
        :value="String(idx)"
      >
        <AccordionHeader>
          <span class="font-semibold text-primary">
            {{
              idx === 0
                ? t("Academy.LearningLines.firstHalf")
                : idx === 1
                  ? t("Academy.LearningLines.indoorPeriod")
                  : idx === 2
                    ? t("Academy.LearningLines.secondHalf")
                    : ""
            }}
            <span class="text-secondary-color font-medium">
              ({{ section.weeks.length }})
            </span>
          </span>
        </AccordionHeader>
        <AccordionContent>
          <div
            class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 pt-2"
          >
            <draggable
              v-model="props.segments[idx].weeks"
              :disabled="!canDrag"
              group="learningLineWeeks"
              :item-key="getWeekKey"
              :component-data="{
                'data-segment-index': String(idx),
              }"
              @end="handleDragEnd"
              class="contents"
            >
              <template #item="{ element: week, index }">
                <div
                  :class="[
                    'flex flex-col rounded-2xl border border-stroke bg-white p-4 min-h-42',
                    canDrag ? 'cursor-move' : 'cursor-pointer',
                  ]"
                  @click="
                    onWeekCardClick(
                      week,
                      idx,
                      getCumulativeWeekNumber(idx, index),
                    )
                  "
                >
                  <div class="flex items-start justify-between gap-2">
                    <div class="flex items-center gap-2">
                      <span
                        class="inline-flex items-center rounded-md px-1 py-0.5 text-[.625rem] font-semibold bg-primary text-bg-light shrink-0"
                      >
                        {{
                          t("Academy.LearningLines.weekLabel", {
                            n: getCumulativeWeekNumber(idx, index),
                          })
                        }}
                      </span>
                    </div>
                    <Button
                      v-if="!isViewOnly"
                      icon="pi pi-ellipsis-v"
                      severity="secondary"
                      text
                      rounded
                      size="small"
                      class="shrink-0 -mt-1 -mr-1"
                      :aria-label="t('Academy.LearningLines.weekActions')"
                      @click.stop="
                        openWeekMenu(
                          $event,
                          week.id,
                          idx,
                          getCumulativeWeekNumber(idx, index),
                        )
                      "
                    />
                  </div>
                  <div class="flex flex-col gap-1 flex-1 min-h-0 mt-2">
                    <span
                      :class="[
                        'text-sm font-medium line-clamp-2',
                        displayWeekTitle(week) ? 'text-primary' : 'text-stroke',
                      ]"
                    >
                      {{
                        displayWeekTitle(week) ||
                        t("Academy.LearningLines.untitled")
                      }}
                    </span>
                    <span class="text-xs text-secondary-color">
                      {{ weekDateRange(week) }}
                    </span>
                  </div>

                  <div
                    class="flex flex-wrap items-center justify-center gap-2"
                    v-if="Object.keys(week.contentCountByType).length > 0"
                  >
                    <span
                      class="text-[.625rem] text-secondary-color"
                      v-for="type in Object.keys(week.contentCountByType)"
                      :key="type"
                    >
                      {{ week.contentCountByType[type] }}
                      {{
                        t(
                          `Academy.LearningLines.contentTypes.${type.toLowerCase()}`,
                        )
                      }}
                    </span>
                  </div>
                  <Button
                    v-else-if="!isViewOnly"
                    :label="t('Academy.LearningLines.addContent')"
                    icon="pi pi-plus-circle"
                    severity="primary"
                    rounded
                    text
                    class="text-primary font-medium text-xs! justify-center mt-auto"
                    @click.stop="
                      emit('week-action', {
                        action: 'addContent',
                        weekId: week.id,
                        segmentIndex: idx,
                        weekNumber: getCumulativeWeekNumber(idx, index),
                      })
                    "
                  />
                </div>
              </template>
            </draggable>

            <div
              v-if="!isViewOnly"
              class="flex min-h-42 flex-col items-center justify-center rounded-2xl border border-dashed border-primary bg-transparent px-4 py-6 text-center transition-colors hover:bg-light-primary/30 cursor-pointer"
              @click="addWeek(idx)"
            >
              <span class="text-sm font-semibold text-primary">
                {{ t("Academy.LearningLines.addWeek") }}
              </span>
            </div>
          </div>
        </AccordionContent>
      </AccordionPanel>
    </Accordion>

    <Menu ref="weekMenuRef" :model="weekMenuItems" popup />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import type {
  LearningLineWeek,
  LearningLineWeekActionPayload,
  LearningLineWeekSection,
} from "@/types";
import { formatDate } from "@/utils/helpers";
import Menu from "primevue/menu";
import { useGlobalDialog } from "@/composables";
import draggable from "vuedraggable";
import { learningLineService } from "@/services";
import { useActiveLearningLineStore } from "@/stores/activeLearningLine";

const props = withDefaults(
  defineProps<{
    segments: LearningLineWeekSection[];
    weekCount: number;
    totalWeeks: number;
    learningLineId: number;
    isViewOnly?: boolean;
  }>(),
  {
    isViewOnly: false,
  },
);

const emit = defineEmits<{
  "import-previous": [];
  "week-action": [payload: LearningLineWeekActionPayload];
}>();

const { t } = useI18n();
const dialog = useGlobalDialog();
const activeLearningLine = useActiveLearningLineStore();

const canDrag = ref(false);
const openPanels = ref<string[]>(["0"]);
const weekMenuRef = ref<InstanceType<typeof Menu> | null>(null);
const weekMenuContext = ref<{
  weekId: number;
  segmentIndex: number;
  weekNumber: number;
} | null>(null);

const segmentsList = computed(() => [...props.segments]);

const sectionIdAt = (segmentIndex: number): number => {
  const id = props.segments[segmentIndex]?.id;
  if (typeof id === "number" && !Number.isNaN(id)) {
    return id;
  }
  return segmentIndex;
};

const displayWeekTitle = (week: LearningLineWeek): string => {
  const n = week.name?.trim();
  return n || "";
};

const weekDateRange = (week: LearningLineWeek): string => {
  const a = formatDate(week.startDate, t, "MMM D");
  const b = formatDate(week.endDate, t, "MMM D");
  return `${a} - ${b}`;
};

const getCumulativeWeekNumber = (
  sectionIndex: number,
  weekIndex: number,
): number => {
  let cumulativeWeeks = 0;

  for (let i = 0; i < sectionIndex; i++) {
    cumulativeWeeks += props.segments[i]?.weeks.length ?? 0;
  }

  return cumulativeWeeks + weekIndex + 1;
};

const openWeekMenu = (
  event: Event,
  weekId: number,
  segmentIndex: number,
  weekNumber: number,
) => {
  weekMenuContext.value = { weekId, segmentIndex, weekNumber };
  weekMenuRef.value?.toggle(event);
};

const addedWeeks = computed(() => {
  return props.segments.reduce((acc, segment) => acc + segment.weeks.length, 0);
});

const validateAddWeek = () => {
  if (props.totalWeeks <= addedWeeks.value) {
    dialog.showInfo(
      t("Academy.LearningLines.weekLimitReached"),
      t("Academy.LearningLines.limitMessage"),
      t("app.close"),
    );
    return false;
  }
  return true;
};

const addWeek = (segmentIndex: number) => {
  if (validateAddWeek()) {
    manageLearningLineWeeks({
      action: "add",
      sectionId: sectionIdAt(segmentIndex),
    });
  }
};

const handleDragEnd = (evt: {
  from: HTMLElement;
  to: HTMLElement;
  oldIndex: number;
  newIndex: number;
}) => {
  if (!canDrag.value) return;
  if (evt.from === evt.to && evt.oldIndex === evt.newIndex) return;
  if (evt.newIndex < 0) return;

  const fromSegmentIndex = Number(evt.from.dataset.segmentIndex);
  const toSegmentIndex = Number(evt.to.dataset.segmentIndex);
  if (fromSegmentIndex < 0 || toSegmentIndex < 0) return;

  const week = props.segments[toSegmentIndex]?.weeks[evt.newIndex];
  if (!week) return;

  const payload: Extract<LearningLineWeekActionPayload, { action: "drag" }> = {
    action: "drag",
    fromSectionId: sectionIdAt(fromSegmentIndex),
    toSectionId: sectionIdAt(toSegmentIndex),
    weekId: week.id,
    position: evt.newIndex,
  };
  manageLearningLineWeeks(payload);
};

const getWeekKey = (week: LearningLineWeek): string | number => {
  return week.id;
};

const onWeekCardClick = (
  week: LearningLineWeek,
  segmentIndex: number,
  weekIndex: number,
) => {
  if (canDrag.value) return;
  emit("week-action", {
    action: "view",
    weekId: week.id,
    segmentIndex,
    weekNumber: weekIndex,
  });
};

const menuTargetWeek = computed((): LearningLineWeek | null => {
  const ctx = weekMenuContext.value;
  if (!ctx) return null;
  const section = props.segments[ctx.segmentIndex];
  return section?.weeks.find((w) => w.id === ctx.weekId) ?? null;
});

function weekHasContent(week: LearningLineWeek): boolean {
  if ((week.contentCount ?? 0) > 0) return true;
  const byType = week.contentCountByType ?? {};
  return Object.keys(byType).length > 0;
}

const weekMenuItems = computed(() => {
  const hasContent = menuTargetWeek.value
    ? weekHasContent(menuTargetWeek.value)
    : false;

  return [
    {
      label: t("app.edit"),
      icon: "pi pi-pencil",
      visible: hasContent,
      command: () => {
        const ctx = weekMenuContext.value;
        if (ctx) emit("week-action", { action: "edit", ...ctx });
      },
    },
    {
      label: t("app.duplicate"),
      icon: "pi pi-clone",
      command: () => {
        const ctx = weekMenuContext.value;
        if (ctx && validateAddWeek())
          duplicateLearningLineWeek(ctx?.weekId ?? 0);
      },
    },
    {
      label: t("app.delete"),
      icon: "pi pi-trash",
      command: () => {
        const ctx = weekMenuContext.value;
        if (ctx)
          manageLearningLineWeeks({
            action: "delete",
            sectionId: sectionIdAt(ctx.segmentIndex),
            weekId: ctx.weekId,
          });
      },
    },
    {
      label: t("Academy.LearningLines.deleteContent"),
      icon: "pi pi-trash",
      visible: hasContent,
      command: () => {
        const ctx = weekMenuContext.value;
        if (ctx)
          manageLearningLineWeeks({
            action: "deleteContent",
            sectionId: sectionIdAt(ctx.segmentIndex),
            weekId: ctx.weekId,
          });
      },
    },
  ];
});

const duplicateLearningLineWeek = async (weekId: number) => {
  const response = await learningLineService.duplicateLearningLineWeek(
    props.learningLineId,
    weekId,
  );
  if (response.success) {
    await activeLearningLine.syncAfterMutation(
      response.data,
      props.learningLineId,
    );
  }
};

const manageLearningLineWeeks = async (data: Record<string, unknown>) => {
  const response = await learningLineService.manageLearningLineWeeks(
    props.learningLineId,
    data,
  );
  if (response.success) {
    await activeLearningLine.syncAfterMutation(
      response.data,
      props.learningLineId,
    );
  } else {
    dialog.showError(
      t("app.error"),
      response.error ?? t("Academy.LearningLines.errorLoading"),
      t("app.ok"),
    );
  }
};
</script>
