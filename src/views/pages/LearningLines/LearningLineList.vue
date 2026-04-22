<template>
  <div class="flex flex-col gap-6">
    <div class="flex items-center justify-end gap-3">
      <Button icon="pi pi-search" severity="secondary" rounded />
      <Button icon="pi pi-filter" severity="secondary" rounded />
      <router-link to="/pages/learningLines/add">
        <Button
          :label="t('Academy.LearningLines.addLearningLine')"
          icon="pi pi-plus-circle"
          severity="primary"
          rounded
        />
      </router-link>
    </div>

    <DataTable
      :value="learningLinesData"
      @rowClick="onRowClick"
      :pt="{
        tableContainer: {
          class: 'rounded-2xl',
        },
        column: {
          root: { class: '!border-0' },
          headerCell: {
            class: 'font-medium !bg-table-header-bg !border-0',
          },
        },
      }"
    >
      <Column
        field="name"
        :header="t('Academy.LearningLines.learningLineName')"
        style="min-width: 16rem"
      >
        <template #body="{ data }">
          <div class="flex flex-col items-start">
            <div class="flex items-center gap-1">
              <span>{{ data.name }}</span>
              <Tag
                :value="data.isClubAdmin ? t('app.club') : t('app.hf')"
                severity="secondary"
                rounded
                :pt="{
                  label: { class: 'text-xs font-medium' },
                  root: { class: 'border' },
                }"
              />
            </div>
            <span
              v-if="data.startDate && data.endDate"
              class="text-primary text-xs"
              >{{ formatDate(data.startDate, t, "MMMM YYYY") }}/
              {{ formatDate(data.endDate, t, "MMMM YYYY") }}</span
            >
          </div>
        </template>
      </Column>
      <Column
        :header="t('Academy.LearningLines.targetGroups')"
        style="min-width: 8rem"
      >
        <template #body="{ data }">
          <div
            v-if="data.targetGroups?.length > 0"
            class="flex flex-wrap gap-2"
          >
            <BaseTooltip
              v-for="tg in data.targetGroups"
              :key="tg.id"
              :value="tg.name"
              position="top"
              as="span"
            >
              <Tag
                severity="secondary"
                rounded
                :pt="{
                  root: {
                    class: 'w-[26px] h-[26px] !p-1',
                  },
                }"
              >
                <img :src="getTargetGroupIcon(tg.name, tg.id)" :alt="tg.name" />
              </Tag>
            </BaseTooltip>
          </div>
          <span v-else class="text-secondary-color text-sm">—</span>
        </template>
      </Column>
      <Column
        :header="t('Academy.LearningLines.clubs')"
        style="min-width: 12rem"
      >
        <template #body="{ data }">
          <div v-if="data.clubs?.length" class="flex flex-wrap gap-2">
            <BaseExtras :items="data.clubs" :visible-count="3" item-key="id">
              <template #item="{ item }">
                <Tag
                  :value="item.name"
                  severity="secondary"
                  rounded
                  :pt="{
                    label: { class: 'text-xs font-medium' },
                    root: { class: 'border' },
                  }"
                />
              </template>
            </BaseExtras>
          </div>
          <span v-else class="text-secondary-color text-sm">—</span>
        </template>
      </Column>
      <Column
        field="weekCount"
        :header="t('Academy.LearningLines.weeks')"
        style="min-width: 7rem"
      >
        <template #body="{ data }">
          <div class="flex">
            <Tag
              v-if="data.weekCount != null"
              :value="String(data.weekCount)"
              severity="secondary"
              rounded
              :pt="{
                label: { class: 'text-xs font-medium' },
                root: { class: 'border' },
              }"
            />
            <span v-else class="text-secondary-color text-sm">—</span>
          </div>
        </template>
      </Column>
      <Column
        field="totalContent"
        :header="t('Academy.LearningLines.content')"
        style="min-width: 7rem"
      >
        <template #body="{ data }">
          <div class="flex">
            <Tag
              v-if="data.totalContent != null"
              :value="String(data.totalContent)"
              severity="secondary"
              rounded
              :pt="{
                label: { class: 'text-xs font-medium' },
                root: { class: 'border' },
              }"
            />
            <span v-else class="text-secondary-color text-sm">—</span>
          </div>
        </template>
      </Column>
      <Column
        field="status"
        :header="t('Academy.LearningLines.status')"
        style="width: 8rem"
      >
        <template #body="{ data }">
          <Tag
            v-if="data.status != null"
            :value="getStatusValue(data.status)"
            rounded
            :severity="getStatusValue(data.status, true)"
          />
          <div v-if="data.status" class="fl"></div>
        </template>
      </Column>
      <Column :header="t('Academy.LearningLines.actions')" style="width: 7rem">
        <template #body="{ data }">
          <div class="flex gap-1">
            <Button
              icon="pi pi-eye"
              severity="secondary"
              size="small"
              text
              rounded
              @click="onRowClick({ data })"
            />
            <Button
              icon="pi pi-upload"
              severity="secondary"
              size="small"
              text
              rounded
              @click="toggleExportMenu($event, data)"
            />
            <Button
              v-if="
                (isAdmin && !data.isClubAdmin) || (!isAdmin && data.isClubAdmin)
              "
              @click="confirmDeleteData(data, $event)"
              icon="pi pi-trash"
              severity="secondary"
              size="small"
              text
              rounded
              :disabled="deleting"
            />
            <Button
              icon="pi pi-clone"
              severity="secondary"
              size="small"
              text
              rounded
              @click="duplicateLearningLine(data)"
            />
            <router-link
              v-if="
                (isAdmin && !data.isClubAdmin) || (!isAdmin && data.isClubAdmin)
              "
              :to="`/pages/learningLines/edit/${data.id}`"
            >
              <Button
                icon="pi pi-pencil"
                severity="secondary"
                size="small"
                text
                rounded
              />
            </router-link>
          </div>
        </template>
      </Column>

      <template #empty>
        <div class="h-120 flex flex-col gap-9 items-center justify-center">
          <div class="flex flex-col items-center gap-2">
            <span class="text-2xl font-semibold">{{
              t("Academy.LearningLines.noLearningLinesAdded")
            }}</span>
            <span class="text-primary">
              {{ t("Academy.LearningLines.pleaseAddLearningLine") }}
            </span>
          </div>
          <router-link to="/pages/learningLines/add">
            <Button
              :label="t('Academy.LearningLines.createNewLearningLine')"
              variant="outlined"
              icon="pi pi-plus-circle"
              severity="primary"
              rounded
            />
          </router-link>
        </div>
      </template>
    </DataTable>

    <Menu ref="exportMenu" :model="exportMenuItems" :popup="true" />

    <div v-if="learningLinesData?.length !== 0" class="flex justify-end">
      <Paginator
        :rows="pagination.count"
        :totalRecords="pagination.totalRecords"
        :rowsPerPageOptions="[10, 25, 50, 100]"
        template="RowsPerPageDropdown FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink"
        :pageLinkSize="3"
        @page="onPaginate"
        size="small"
        :pt="{
          root: {
            class: '!bg-transparent !p-0 ',
          },
          pcRowPerPageDropdown: {
            class: '!text-xs',
          },
        }"
      />
    </div>

    <DuplicateLearningLine
      v-model="duplicateVisible"
      :initial-data="learninglineData"
      @refresh="getLearningLinesData"
    />

    <ConfirmDeleteDialog
      ref="deleteRef"
      group="deleteLearningLine"
      @accept="handleDeleteLearningLine"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import type { LearningLine } from "@/types";
import { learningLineService } from "@/services";
import { useActiveLearningLineStore } from "@/stores/activeLearningLine";
import { useAppLoader, useGlobalDialog } from "@/composables";
import { useI18n } from "vue-i18n";
import ConfirmDeleteDialog from "@/components/Dialogs/ConfirmDeleteDialog.vue";
import { CoachIcon, PlayerIcon, TrainerIcon } from "@/assets/images";
import { formatDate, downloadFileFromUrl, getUserInfo } from "@/utils/helpers";
import Menu from "primevue/menu";

const { t } = useI18n();
const dialog = useGlobalDialog();
const router = useRouter();
const userSession = getUserInfo();
const isAdmin = userSession?.isSuperAdmin;

const learningLinesData = ref<LearningLine[]>([]);
const learninglineData = ref<LearningLine | null>(null);
const duplicateVisible = ref<boolean>(false);
const deleteRef = ref<InstanceType<typeof ConfirmDeleteDialog> | null>(null);
const deleteId = ref<number | null>(null);

const pagination = ref({
  page: 1,
  count: 10,
  totalRecords: 0,
});

const loader = useAppLoader();
const deleting = ref(false);
const exportMenu = ref<InstanceType<typeof Menu>>();

onMounted(() => {
  useActiveLearningLineStore().clear();
  getLearningLinesData();
});

const getTargetGroupIcon = (name: string, id?: number) => {
  const role = name.trim().toLowerCase();
  if (role === "trainer" || id === 1) return TrainerIcon;
  if (role === "coach" || id === 2) return CoachIcon;
  if (role === "player" || id === 3) return PlayerIcon;
  return PlayerIcon;
};

const getLearningLinesData = async () => {
  loader.setLoading(true, t("Academy.LearningLines.loading"));
  try {
    const response = await learningLineService.getLearningLinesData({
      page: pagination.value.page,
      count: pagination.value.count,
    });
    if (response.success) {
      learningLinesData.value = response.data ?? [];
      pagination.value.totalRecords =
        response.pagination?.totalRecords ?? learningLinesData.value.length;
    }
  } catch (error) {
    console.error(t("Academy.LearningLines.errorLoading"), error);
  } finally {
    loader.setLoading(false);
  }
};

const onPaginate = async (event: { page: number; rows: number }) => {
  pagination.value.page = event.page + 1;
  pagination.value.count = event.rows;
  await getLearningLinesData();
};

const confirmDeleteData = (data: LearningLine, event: Event) => {
  deleteId.value = data.id;
  deleteRef.value?.showConfirm({
    target: event.currentTarget ?? (event.target as HTMLElement),
    message: `${t("Academy.LearningLines.deleteConfirmation")} ${data.name}?`,
    rejectLabel: t("app.cancel"),
    acceptLabel: t("app.delete"),
    severity: "danger",
  });
};

const handleDeleteLearningLine = async () => {
  if (deleteId.value == null) return;
  deleting.value = true;
  loader.setLoading(true, t("Academy.LearningLines.deleting"));
  try {
    const result = await learningLineService.deleteLearningLine(deleteId.value);
    if (result.success) {
      useActiveLearningLineStore().clearIfMatches(deleteId.value);
      await getLearningLinesData();
    } else {
      const errorMessage =
        result.error ?? t("Academy.LearningLines.errorDeleting");
      dialog.showError(t("app.error"), errorMessage, t("app.ok"));
    }
  } finally {
    deleting.value = false;
    loader.setLoading(false);
  }
};

const onRowClick = (event: { data: LearningLine }) => {
  const { data } = event;
  router.push(`/pages/learningLines/dashboard/${data.id}`);
};

function toggleExportMenu(event: Event, data: LearningLine) {
  learninglineData.value = data;
  exportMenu.value?.toggle(event);
}

const exportMenuItems = ref([
  {
    label: t("Academy.LearningLines.exportXlsx"),
    icon: "pi pi-file-excel",
    command: () => {
      void exportLearningLine(learninglineData.value?.id ?? 0, 1);
    },
  },
  {
    label: t("Academy.LearningLines.exportCsv"),
    icon: "pi pi-table",
    command: () => {
      void exportLearningLine(learninglineData.value?.id ?? 0, 2);
    },
  },
]);

const exportLearningLine = async (learningLineId: number, format: 1 | 2) => {
  try {
    const result = await learningLineService.exportLearningLine(
      learningLineId,
      format,
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

const duplicateLearningLine = async (data: LearningLine) => {
  learninglineData.value = data;
  duplicateVisible.value = true;
};

const getStatusValue = (status: number, severity: boolean = false) => {
  if (severity) {
    if (status === 0) return "contrast";
    if (status === 1) return "success";
    if (status === 2) return "info";
    return "secondary";
  }
  if (status === 0) return t("status.completed");
  if (status === 1) return t("status.ongoing");
  if (status === 2) return t("status.upcoming");
  return "-";
};
</script>
