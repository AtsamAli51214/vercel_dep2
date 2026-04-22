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
        <div class="flex justify-between items-center">
          <div class="flex flex-col">
            <span class="font-bold text-3xl text-primary">
              {{
                isViewMode
                  ? weekData?.name
                  : t("Academy.LearningLines.weekTitle", {
                      n: weekNumber,
                    })
              }}
            </span>
            <div class="font-medium text-secondary-color text-xs">
              <span class="" v-if="!isViewMode">
                {{ t("Academy.LearningLines.weekContentDescription") }}
              </span>
              <div class="flex gap-2 items-center" v-else>
                <span class="pi pi-calendar" />
                <span
                  >{{ formatDate(weekData?.startDate, t, "MMM D") }} -
                  {{ formatDate(weekData?.endDate, t, "MMM D") }}</span
                >
              </div>
            </div>
          </div>
          <Button
            v-if="isViewMode"
            icon="pi pi-pencil"
            text
            @click="handleEdit"
          />
        </div>

        <div class="flex flex-col gap-6">
          <div class="flex flex-col gap-4">
            <span class="text-lg font-semibold" v-if="!isViewMode">
              {{ t("Academy.LearningLines.trainingInfo") }}
            </span>

            <template v-if="isViewMode">
              <div
                class="flex flex-col gap-2"
                v-for="(view, index) in viewContents"
                :key="index"
              >
                <span class="font-semibold">
                  {{ view.title }}
                </span>
                <span class="text-xs text-text-1">
                  {{ view.value || "—" }}
                </span>
              </div>
            </template>

            <template v-else>
              <div class="">
                <div class="font-medium mb-2.5">
                  {{ t("Academy.LearningLines.weekName") }}
                </div>
                <InputText
                  v-model="weekName"
                  :placeholder="t('Academy.LearningLines.weekNamePlaceholder')"
                  :invalid="!!weekNameError"
                  fluid
                />
                <small class="p-invalid" v-if="weekNameError">
                  {{ weekNameError }}
                </small>
              </div>

              <div class="">
                <div class="font-medium mb-2.5">
                  {{ t("Academy.LearningLines.description") }}
                </div>
                <Textarea
                  v-model="weekSummary"
                  :placeholder="
                    t('Academy.LearningLines.descriptionPlaceholder')
                  "
                  rows="4"
                  fluid
                />
              </div>

              <div class="">
                <div class="font-medium mb-2.5">
                  {{ t("Academy.LearningLines.note") }}
                </div>
                <InputText
                  v-model="weekNotes"
                  :placeholder="t('Academy.LearningLines.notePlaceholder')"
                  fluid
                />
              </div>
            </template>
          </div>

          <div class="flex flex-col gap-4">
            <div class="flex items-center justify-between">
              <span class="text-lg font-semibold">
                {{ t("Academy.LearningLines.content") }}
              </span>
              <Button
                v-if="contentItems && contentItems.length > 0"
                :label="t('Academy.LearningLines.addContent')"
                icon="pi pi-plus-circle"
                rounded
                @click="confirmDiscardChanges($event, () => handleAddContent())"
              />
            </div>

            <LearningLineContentItem
              v-if="activeContent !== null && editingContentData"
              :key="`${activeContent === 'add' ? 'add' : `edit-${activeContent}`}-${formKey}`"
              :contentItem="editingContentData"
              :weekNumber="weekNumber"
              :totalWeeks="weekData?.totalWeeks ?? 0"
              :isEditMode="activeContent !== 'add'"
              :fieldErrors="contentItemDraft.fieldErrors.value"
              @formChanged="hasUnsavedChanges = $event"
              @done="handleContentDone"
              @cancel="handleContentCancel"
            />

            <div
              v-if="
                contentItems &&
                contentItems.length === 0 &&
                activeContent !== 'add'
              "
              class="flex flex-col items-center justify-center gap-2 py-6"
            >
              <span class="text-sm text-secondary-color text-center">{{
                t("Academy.LearningLines.noContentAdded")
              }}</span>
              <Button
                :label="t('Academy.LearningLines.addContent')"
                icon="pi pi-plus-circle"
                variant="outlined"
                severity="primary"
                size="small"
                rounded
                @click="confirmDiscardChanges($event, () => handleAddContent())"
              />
            </div>

            <div
              class="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
            >
              <ContentCard
                v-if="displayableContentItems.length > 0"
                :contents="displayableContentItems"
                :menuItems="getContentMenuItems"
                :onCardClick="handleContentCardClick"
              />
            </div>
          </div>
        </div>

        <div class="flex gap-4 w-1/2">
          <Button
            :label="t('app.back')"
            severity="secondary"
            outlined
            @click="confirmDiscardBaselineChanges($event, () => goBack())"
            fluid
          />
          <Button
            v-if="isDirty"
            :label="t('app.save')"
            @click="confirmDiscardChanges($event, () => handleSave())"
            :loading="isSaving"
            fluid
          />
        </div>
      </div>
    </div>

    <ConfirmPopover
      ref="confirmPopoverRef"
      group="weekContentDiscard"
      @accept="handleConfirmAccept"
      @reject="handleConfirmReject"
    />

    <Dialog
      v-model:visible="contentDetailVisible"
      modal
      :header="detailLibraryContent?.name"
      dismissableMask
      class="learning-line-content-detail-dialog w-[min(100vw-2rem,56rem)]"
      :pt="{
        content: { class: 'p-0! overflow-y-auto max-h-[min(90vh,48rem)]' },
        header: { class: 'pb-4!' },
        title: { class: 'text-primary font-Bold text-[1.75rem]!' },
      }"
      @hide="onContentDetailDialogHide"
    >
      <ContentDetail
        v-if="contentDetailVisible && detailLibraryContent != null"
        :content-id="detailLibraryContent?.contentId ?? 0"
        :content-type="detailLibraryContent?.contentType ?? 0"
        embedded
        @close="closeContentDetail"
      />
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
import Dialog from "primevue/dialog";
import { BackArrow, WarningIcon } from "@/assets/images";
import {
  useAppLoader,
  useGlobalDialog,
  useLearningLineWeekMetaForm,
  useLearningLineWeekContentItemDraft,
} from "@/composables";
import { useLearningLineLibraryContent } from "@/composables/useLearningLineLibraryContent";
import { learningLineService } from "@/services";
import { useActiveLearningLineStore } from "@/stores/activeLearningLine";
import type {
  LearningLineWeek,
  LearningLineWeekContentItem,
  Content,
} from "@/types";
import ConfirmPopover from "@/components/Dialogs/ConfirmPopover.vue";
import LearningLineContentItem from "@/components/LearningLine/LearningLineContentItem.vue";
import ContentCard from "@/components/library/contentCard.vue";
import ContentDetail from "@/views/pages/Library/ContentDetail.vue";
import { formatDate } from "@/utils/helpers";
import {
  mapContentItemsToSavePayload,
  mapWeekContentRowsToContentCards,
} from "@/utils/learningLineWeekPayload";

function normalizeTagsKey(tags: string | string[] | undefined): string {
  if (tags == null) return "[]";
  const arr = Array.isArray(tags) ? tags : [tags];
  return JSON.stringify([...arr].map(String).sort());
}

function contentItemsSignature(items: LearningLineWeekContentItem[]): string {
  return JSON.stringify(
    items.map((i) => ({
      id: i.id ?? null,
      contentType: i.contentType,
      contentId: i.contentId,
      tags: normalizeTagsKey(i.tags),
      durationWeeks: i.durationWeeks ?? null,
      skillIds: [...(i.skillIds ?? [])].sort((a, b) => a - b),
    })),
  );
}

function weekMetaSignature(v: {
  weekName?: string;
  weekSummary?: string;
  weekNotes?: string;
}): string {
  return JSON.stringify({
    weekName: (v.weekName ?? "").trim(),
    weekSummary: v.weekSummary ?? "",
    weekNotes: v.weekNotes ?? "",
  });
}

const { t } = useI18n();
const router = useRouter();
const route = useRoute();
const loader = useAppLoader();
const dialog = useGlobalDialog();
const activeLearningLine = useActiveLearningLineStore();
const libraryContent = useLearningLineLibraryContent();

const learningLineId = ref<string | number>(
  route.params.learningLineId as string,
);
const weekNumber = ref<number>(Number(route.query.weekNumber));
const weekId = ref<number>(Number(route.params.weekId));
const weekData = ref<LearningLineWeek | null>(null);
const isSaving = ref(false);

const isAddMode = computed(() => Number(route.query.action) === 1);
const isViewMode = computed(() => Number(route.query.action) === 3);

const weekMetaForm = useLearningLineWeekMetaForm();
const contentItemDraft = useLearningLineWeekContentItemDraft();

const { weekName, weekSummary, weekNotes, weekNameError, validate } =
  weekMetaForm;

const contentItems = ref<LearningLineWeekContentItem[]>([]);
const activeContent = ref<"add" | number | null>(null);
const hasUnsavedChanges = ref(false);
const formKey = ref(0);
const pendingAction = ref<(() => void) | null>(null);
const baselineWeekSignature = ref("");
const baselineContentSignature = ref("");
const removeContentIds = ref<number[]>([]);
const confirmPopoverRef = ref();

const contentDetailVisible = ref(false);
const detailLibraryContent = ref<LearningLineWeekContentItem | null>(null);

const viewContents = computed(() => [
  {
    title: t("Academy.LearningLines.description"),
    value: weekSummary.value,
  },
  {
    title: t("Academy.LearningLines.note"),
    value: weekNotes.value,
  },
]);

const editingContentData = computed(() => {
  if (activeContent.value === "add" || isAddMode.value) {
    return contentItemDraft.draft.value;
  }
  if (typeof activeContent.value === "number") {
    return contentItemDraft.draft.value;
  }
  return null;
});

const displayableContentItems = computed(() => {
  return mapWeekContentRowsToContentCards(
    contentItems.value,
    libraryContent.getContentItemById.bind(libraryContent),
    { activeIndex: activeContent.value, isViewMode: isViewMode.value },
  );
});

const isDirty = computed(() => {
  if (hasUnsavedChanges.value) return true;
  const weekSig = weekMetaSignature(weekMetaForm.getFormValues());
  const contentSig = contentItemsSignature(contentItems.value);
  return (
    weekSig !== baselineWeekSignature.value ||
    contentSig !== baselineContentSignature.value ||
    removeContentIds.value.length > 0
  );
});

function captureEditBaseline() {
  baselineWeekSignature.value = weekMetaSignature(weekMetaForm.getFormValues());
  baselineContentSignature.value = contentItemsSignature(contentItems.value);
}

const handleEdit = () => {
  router.push({
    name: "learningLineWeekContent",
    params: { learningLineId: learningLineId.value, weekId: weekId.value },
    query: {
      segmentIndex: route.query.segmentIndex,
      weekNumber: route.query.weekNumber,
      action: 2,
    },
  });
};

const popupulateWeekData = (data: any) => {
  weekData.value = data;
  contentItems.value = data.items || [];
  weekMetaForm.resetFromWeek(data);
  removeContentIds.value = [];

  if (isAddMode.value && contentItems.value.length === 0) {
    activeContent.value = "add";
    contentItemDraft.createEmptyDraft();
  }

  captureEditBaseline();
};

async function loadWeekData() {
  loader.setLoading(true, t("Academy.LearningLines.loading"));
  try {
    const result = await learningLineService.getLearningLineWeekById(
      learningLineId.value,
      weekId.value,
    );

    if (!result.success) {
      dialog.showError(
        t("app.error"),
        result.error ?? t("Academy.LearningLines.errorLoading"),
        t("app.ok"),
      );
      router.back();
      return;
    }

    if (result.data) {
      popupulateWeekData(result.data);
    }

    if (!weekData.value) {
      dialog.showError(
        t("app.error"),
        t("Academy.LearningLines.weekNotFound"),
        t("app.ok"),
      );
      router.back();
    }
  } catch (error) {
    dialog.showError(
      t("app.error"),
      error instanceof Error
        ? error.message
        : t("Academy.LearningLines.errorLoading"),
      t("app.ok"),
    );
    router.back();
  } finally {
    loader.setLoading(false);
  }
}

const confirmDiscardChanges = (event: Event, onAccept: () => void) => {
  if (!hasUnsavedChanges.value) {
    onAccept();
    return;
  }
  showConfirmPopover(event, onAccept);
};

const confirmDiscardBaselineChanges = (event: Event, onAccept: () => void) => {
  if (!isDirty.value) {
    onAccept();
    return;
  }
  showConfirmPopover(event, onAccept);
};

const showConfirmPopover = (event: Event, onAccept: () => void) => {
  pendingAction.value = onAccept;

  confirmPopoverRef.value?.showConfirm({
    target: event.currentTarget as HTMLElement,
    message: t("validation.confirmDiscardChanges"),
    customIcon: WarningIcon,
    acceptLabel: t("app.yes"),
    rejectLabel: t("app.no"),
    severity: "primary",
  });
};

const handleConfirmAccept = () => {
  if (pendingAction.value) {
    hasUnsavedChanges.value = false;
    formKey.value++;
    pendingAction.value();
    pendingAction.value = null;
  }
};

const handleConfirmReject = () => {
  pendingAction.value = null;
};

const handleAddContent = () => {
  activeContent.value = "add";
  contentItemDraft.createEmptyDraft();
  formKey.value++;
};

const handleEditContent = (index: number) => {
  const item = contentItems.value[index];
  contentItemDraft.setDraftFromItem(item);
  activeContent.value = index;
  formKey.value++;
};

const handleContentDone = () => {
  if (!contentItemDraft.draft.value) return;

  const validation = contentItemDraft.validateDraft();
  if (!validation.valid) {
    const firstError = Object.values(validation.fieldErrors)[0];
    if (firstError) {
      dialog.showError(t("app.error"), firstError, t("app.ok"));
    }
    return;
  }
  if (activeContent.value === "add") {
    contentItems.value.push({ ...contentItemDraft.draft.value });
  } else if (typeof activeContent.value === "number") {
    contentItems.value[activeContent.value] = {
      ...contentItemDraft.draft.value,
    };
  }

  hasUnsavedChanges.value = false;
  activeContent.value = null;
  contentItemDraft.clearDraft();
  formKey.value++;
};

const handleContentCancel = () => {
  hasUnsavedChanges.value = false;
  activeContent.value = null;
  contentItemDraft.clearDraft();
  formKey.value++;
};

const handleDeleteContent = (index: number) => {
  const item = contentItems.value[index];
  if (item.id) {
    removeContentIds.value.push(item.id);
  }

  contentItems.value.splice(index, 1);

  if (activeContent.value === index) {
    activeContent.value = null;
    contentItemDraft.clearDraft();
    formKey.value++;
  } else if (
    typeof activeContent.value === "number" &&
    activeContent.value > index
  ) {
    activeContent.value--;
  }
};

const getContentMenuItems: (
  item: Content & { _originalIndex: number },
) => any[] = (item: Content & { _originalIndex: number }) => {
  const index = item._originalIndex;
  return [
    {
      label: t("app.edit"),
      icon: "pi pi-pencil",
      command: (event: any) => {
        confirmDiscardChanges(event.originalEvent, () =>
          handleEditContent(index),
        );
      },
    },
    {
      label: t("app.delete"),
      icon: "pi pi-trash",
      command: (event: any) => {
        confirmDiscardChanges(event.originalEvent, () =>
          handleDeleteContent(index),
        );
      },
    },
  ];
};

function openContentDetailFromIndex(index: number) {
  const row = contentItems.value[index];
  if (
    row?.contentId == null ||
    row?.contentType == null ||
    !Number.isFinite(Number(row.contentId)) ||
    !Number.isFinite(Number(row.contentType))
  ) {
    return;
  }
  detailLibraryContent.value = row;
  contentDetailVisible.value = true;
}

function closeContentDetail() {
  contentDetailVisible.value = false;
  onContentDetailDialogHide();
}

function onContentDetailDialogHide() {
  detailLibraryContent.value = null;
}

const handleContentCardClick = (item: Content & { _originalIndex: number }) => {
  openContentDetailFromIndex(item._originalIndex);
};

async function handleSave() {
  const weekValidationResult = await validate();
  if (!weekValidationResult.valid) {
    const firstError = Object.values(weekValidationResult.errors)[0];
    if (firstError) {
      dialog.showError(t("app.error"), firstError[0], t("app.ok"));
    }
    return;
  }

  for (const item of contentItems.value) {
    contentItemDraft.setDraftFromItem(item);
    const validation = contentItemDraft.validateDraft();
    if (!validation.valid) {
      const firstError = Object.values(validation.fieldErrors)[0];
      if (firstError) {
        dialog.showError(t("app.error"), firstError, t("app.ok"));
      }
      return;
    }
  }

  isSaving.value = true;
  try {
    const items = mapContentItemsToSavePayload(
      contentItems.value,
      libraryContent.getContentItemById.bind(libraryContent),
    );

    const formValues = weekMetaForm.getFormValues();
    const payload = {
      weekName: formValues.weekName,
      weekSummary: formValues.weekSummary,
      weekNotes: formValues.weekNotes,
      items,
      removeContentIds: removeContentIds.value,
    };

    const result = await learningLineService.updateLearningLineWeek(
      learningLineId.value,
      weekId.value,
      payload,
    );

    if (result.success) {
      popupulateWeekData(result.data);
      await activeLearningLine.syncAfterMutation(
        result.data,
        learningLineId.value,
      );
      dialog.showSuccess(
        t("app.success"),
        t("Academy.LearningLines.weekUpdatedSuccess"),
        t("app.ok"),
      );
      router.back();
    } else {
      dialog.showError(
        t("app.error"),
        result.error ?? t("Academy.LearningLines.errorUpdating"),
        t("app.ok"),
      );
    }
  } catch (error) {
    dialog.showError(
      t("app.error"),
      error instanceof Error
        ? error.message
        : t("Academy.LearningLines.errorUpdating"),
      t("app.ok"),
    );
  } finally {
    isSaving.value = false;
  }
}

function goBack() {
  router.back();
}

onMounted(loadWeekData);
</script>
