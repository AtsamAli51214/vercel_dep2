<template>
  <div class="flex flex-col gap-6">
    <div class="flex items-center justify-end gap-3">
      <Button icon="pi pi-search" severity="secondary" rounded />
      <Button icon="pi pi-filter" severity="secondary" rounded />
      <router-link to="/pages/team/add">
        <Button
          :label="t('Management.teams.addTeam')"
          icon="pi pi-plus-circle"
          severity="primary"
          rounded
        />
      </router-link>
    </div>

    <DataTable
      :value="teams"
      dataKey="clubId"
      size="small"
      v-model:expandedRows="clubExpanded"
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
      <Column expander style="width: 1rem" />
      <Column
        field="clubName"
        :header="t('Management.teams.name')"
        bodyClass="text-2xl font-semibold text-primary"
      />
      <Column :header="t('Management.teams.actions')" style="width: 12rem" />

      <template #expansion="{ data: club }">
        <DataTable
          :value="club.ageGroups"
          v-model:expandedRows="ageGroupExpanded"
          size="small"
          :showHeaders="false"
          dataKey="ageGroupId"
        >
          <Column expander style="width: 1rem" />
          <Column field="ageGroupName" class="text-xl font-medium" />
          <Column
            field="ageGroupId"
            class="text-2xl font-bold"
            style="width: 15rem"
          >
            <template #body="{ data }">
              <div class="flex items-center justify-end gap-2">
                <router-link
                  :to="`/pages/team/add?clubId=${club.clubId}&ageGroupId=${data.ageGroupId}`"
                >
                  <Button
                    :label="t('Management.teams.addClubTeams')"
                    icon="pi pi-plus-circle"
                    severity="primary"
                    variant="text"
                    size="small"
                    rounded
                  />
                </router-link>
              </div>
            </template>
          </Column>

          <template #expansion="{ data: ageGroup }">
            <DataTable
              :value="ageGroup.teams"
              size="small"
              class="ml-2"
              :showHeaders="false"
              dataKey="id"
            >
              <Column field="name" />
              <Column
                field="id"
                class="text-2xl font-bold"
                style="width: 12rem"
              >
                <template #body="{ data }">
                  <div class="flex items-center justify-end gap-2">
                    <Button
                      @click="confirmDeleteData(data, $event)"
                      icon="pi pi-trash"
                      severity="secondary"
                      size="small"
                      text
                      rounded
                      :disabled="deleting"
                    />
                    <router-link :to="`/pages/team/edit/${data.id}`">
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
            </DataTable>
          </template>
        </DataTable>
      </template>

      <template #empty>
        <div class="h-120 flex flex-col gap-9 items-center justify-center">
          <div class="flex flex-col items-center gap-2">
            <span class="text-2xl font-semibold">{{
              t("Management.teams.noTeamAdded")
            }}</span>
            <span class="text-primary">
              {{ t("Management.teams.pleaseAddTeam") }}
            </span>
          </div>
          <router-link to="/pages/team/add">
            <Button
              :label="t('Management.teams.createTeamTitle')"
              variant="outlined"
              icon="pi pi-plus-circle"
              severity="primary"
              rounded
            />
          </router-link>
        </div>
      </template>
    </DataTable>
    <div v-if="teams?.length !== 0" class="flex justify-end">
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

    <ConfirmDeleteDialog
      ref="deleteRef"
      group="deleteTeam"
      @accept="handleDeleteTeam"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { teamService } from "@/services";
import { useAppLoader, useGlobalDialog } from "@/composables";
import { useI18n } from "vue-i18n";
import ConfirmDeleteDialog from "@/components/Dialogs/ConfirmDeleteDialog.vue";
import type { Team } from "@/types/common";
import { buildDeleteErrorMessage } from "@/utils/helpers";

const { t } = useI18n();

const teams = ref<Club[]>([]);
const deleteRef = ref<InstanceType<typeof ConfirmDeleteDialog> | null>(null);
const deleteId = ref<number | null>(null);
const clubExpanded = ref<number[]>([]);
const ageGroupExpanded = ref<number[]>([]);
const pagination = ref({
  page: 1,
  count: 10,
  totalRecords: 2,
});

const loader = useAppLoader();
const dialog = useGlobalDialog();
onMounted(async () => {
  getTeamsData();
});

const getTeamsData = async () => {
  loader.setLoading(true, t("loading.loadingTeams"));
  try {
    const response = await teamService.getTeamsData({
      ...pagination.value,
    });
    if (response.success) {
      const { data, pagination: paginationData } = response;
      teams.value = data || [];
      pagination.value.totalRecords = paginationData.totalRecords;
    }
  } catch (error) {
    console.error(t("Management.teams.errorLoadingTeams"), error);
  } finally {
    loader.setLoading(false);
  }
};

interface TransformedTeam {
  id: number;
  name: string;
}

interface AgeGroup {
  ageGroupId: number;
  ageGroupName: string;
  teams: TransformedTeam[];
}

interface Club {
  clubId: number;
  clubName: string;
  ageGroups: AgeGroup[];
}

const onPaginate = async (event: any) => {
  pagination.value.page = event.page + 1;
  pagination.value.count = event.rows;
  await getTeamsData();
};

const deleting = ref(false);

const confirmDeleteData = (data: Team, event: any) => {
  deleteId.value = data.id;
  deleteRef.value?.showConfirm({
    target: event.currentTarget || event.target,
    message: `${t("Management.teams.deleteTeamConfirmation")} ${data.name}?`,
    rejectLabel: t("app.cancel"),
    acceptLabel: t("app.delete"),
    severity: "danger",
  });
};

const handleDeleteTeam = async () => {
  deleting.value = true;
  loader.setLoading(true, t("loading.deletingTeam"));
  try {
    const result = await teamService.deleteTeam(deleteId.value as number);
    if (result.success) {
      await getTeamsData();
    } else {
      let errorMessage = "";
      if (result.errorData)
        errorMessage = buildDeleteErrorMessage(result.errorData, t);
      else
        errorMessage = result.error || t("Management.teams.errorDeletingTeam");
      dialog.showError(
        t("validation.unableToDelete.title"),
        errorMessage + "\n" + t("validation.unableToDelete.description"),
        t("app.ok"),
      );
    }
  } finally {
    deleting.value = false;
    loader.setLoading(false);
  }
};
</script>

<style></style>
