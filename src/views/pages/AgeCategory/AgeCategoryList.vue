<template>
  <div class="flex flex-col gap-6">
    <div class="flex items-center justify-end gap-3">
      <Button icon="pi pi-search" severity="secondary" rounded />
      <Button icon="pi pi-filter" severity="secondary" rounded />
      <router-link to="/pages/ageCategory/add">
        <Button
          :label="t('Management.ageCategories.addAgeCategory')"
          icon="pi pi-plus-circle"
          severity="primary"
          rounded
        />
      </router-link>
    </div>

    <DataTable
      :value="ageCategories"
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
      <Column field="name" :header="t('Management.ageCategories.name')" />
      <Column
        field="clubName"
        :header="t('Management.ageCategories.user')"
        style="width: 10rem"
      >
        <template #body="{ data }">
          <Tag
            :value="data.clubName ? data.clubName : t('navigation.superAdmin')"
            severity="secondary"
            rounded
            :pt="{
              label: { class: 'text-xs font-medium' },
              root: { class: 'border' },
            }"
          />
        </template>
      </Column>
      <Column
        :header="t('Management.ageCategories.actions')"
        style="width: 7rem"
      >
        <template #body="{ data }">
          <div class="flex gap-1" v-if="isSuperAdmin || data.clubId">
            <Button
              @click="confirmDeleteData(data, $event)"
              icon="pi pi-trash"
              severity="secondary"
              size="small"
              text
              rounded
              :disabled="deleting"
            />
            <router-link :to="`/pages/ageCategory/edit/${data.ageGroupId}`">
              <Button
                icon="pi pi-pencil"
                severity="secondary"
                size="small"
                text
                rounded
              />
            </router-link>
          </div>
          <span v-else class="text-sm text-secondary-color">{{
            t("Management.ageCategories.noActions")
          }}</span>
        </template>
      </Column>

      <template #empty>
        <div class="h-120 flex flex-col gap-9 items-center justify-center">
          <div class="flex flex-col items-center gap-2">
            <span class="text-2xl font-semibold">{{
              t("Management.ageCategories.noAgeCategoryAdded")
            }}</span>
            <span class="text-primary">
              {{ t("Management.ageCategories.pleaseAddAgeCategory") }}
            </span>
          </div>
          <router-link to="/pages/ageCategory/add">
            <Button
              :label="t('Management.ageCategories.createNewAgeCategory')"
              variant="outlined"
              icon="pi pi-plus-circle"
              severity="primary"
              rounded
            />
          </router-link>
        </div>
      </template>
    </DataTable>
    <div v-if="ageCategories?.length !== 0" class="flex justify-end">
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
      group="deleteAgeCategory"
      @accept="handleDeleteAgeCategory"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from "vue";
import type { AgeCategory } from "@/types";
import { ageCategoryService } from "@/services";
import { useAppLoader, useGlobalDialog } from "@/composables";
import { useI18n } from "vue-i18n";
import ConfirmDeleteDialog from "@/components/Dialogs/ConfirmDeleteDialog.vue";
import { buildDeleteErrorMessage } from "@/utils/helpers";
import { getUserInfo } from "@/utils/helpers";

const { t } = useI18n();
const userSession = getUserInfo();
const isSuperAdmin = computed(() => userSession?.isSuperAdmin);

const ageCategories = ref<AgeCategory[]>([]);
const deleteRef = ref<InstanceType<typeof ConfirmDeleteDialog> | null>(null);
const deleteId = ref<number | null>(null);

const pagination = ref({
  page: 1,
  count: 10,
  totalRecords: 2,
});

const loader = useAppLoader();
const dialog = useGlobalDialog();

onMounted(async () => {
  getAgeCategoriesData();
});

const getAgeCategoriesData = async () => {
  loader.setLoading(true, t("loading.loadingAgeCategories"));
  try {
    const response = await ageCategoryService.getAgeCategoriesData({
      ...pagination.value,
    });
    if (response.success) {
      const { data, pagination: paginationData } = response;
      ageCategories.value = data || [];
      pagination.value.totalRecords = paginationData.totalRecords;
    }
  } catch (error) {
    console.error(
      t("Management.ageCategories.errorLoadingAgeCategories"),
      error,
    );
  } finally {
    loader.setLoading(false);
  }
};

const onPaginate = async (event: any) => {
  pagination.value.page = event.page + 1;
  pagination.value.count = event.rows;
  await getAgeCategoriesData();
};

const deleting = ref(false);

const confirmDeleteData = (data: AgeCategory, event: any) => {
  deleteId.value = data.ageGroupId;
  deleteRef.value?.showConfirm({
    target: event.currentTarget || event.target,
    message: `${t("Management.ageCategories.deleteAgeCategoryConfirmation")} ${data.name}?`,
    rejectLabel: t("app.cancel"),
    acceptLabel: t("app.delete"),
    severity: "danger",
  });
};

const handleDeleteAgeCategory = async () => {
  deleting.value = true;
  loader.setLoading(true, t("loading.deletingAgeCategory"));
  try {
    const result = await ageCategoryService.deleteAgeCategory(
      deleteId.value as number,
    );
    if (result.success) {
      await getAgeCategoriesData();
    } else {
      let errorMessage = "";
      if (result.errorData)
        errorMessage = buildDeleteErrorMessage(result.errorData, t);
      else
        errorMessage =
          result.error ||
          t("Management.ageCategories.errorDeletingAgeCategory");
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
