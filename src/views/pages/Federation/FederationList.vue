<template>
  <div class="flex flex-col gap-6">
    <div class="flex items-center justify-end gap-3">
      <Button icon="pi pi-search" severity="secondary" rounded />
      <Button icon="pi pi-filter" severity="secondary" rounded />
      <router-link to="/pages/federation/add">
        <Button
          :label="t('Management.federations.addFederation')"
          icon="pi pi-plus-circle"
          severity="primary"
          rounded
        />
      </router-link>
    </div>

    <DataTable
      :value="federations"
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
      <Column field="name" :header="t('Management.federations.name')" />
      <Column
        field="code"
        :header="t('Management.federations.code')"
        style="width: 7rem"
      >
        <template #body="{ data }">
          <Tag
            :value="data.code"
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
        field="country"
        :header="t('Management.federations.country')"
        style="width: 7rem"
      >
        <template #body="{ data }">
          {{ data.country === "NL" ? "🇳🇱" : "🇧🇪" }}
        </template>
      </Column>
      <Column :header="t('Management.federations.actions')" style="width: 7rem">
        <template #body="{ data }">
          <div class="flex gap-1">
            <Button
              @click="confirmDeleteData(data, $event)"
              icon="pi pi-trash"
              severity="secondary"
              size="small"
              text
              rounded
              :disabled="deleting"
            />
            <router-link :to="`/pages/federation/edit/${data.id}`">
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
              t("Management.federations.noFederationAdded")
            }}</span>
            <span class="text-primary">
              {{ t("Management.federations.pleaseAddFederation") }}
            </span>
          </div>
          <router-link to="/pages/federation/add">
            <Button
              :label="t('Management.federations.createNewFederation')"
              variant="outlined"
              icon="pi pi-plus-circle"
              severity="primary"
              rounded
            />
          </router-link>
        </div>
      </template>
    </DataTable>
    <div v-if="federations?.length !== 0" class="flex justify-end">
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
      group="deleteFederation"
      @accept="handleDeleteFederation"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import type { Federation } from "@/types/common";
import { federationService } from "@/services";
import { useAppLoader, useGlobalDialog } from "@/composables";
import { useI18n } from "vue-i18n";
import ConfirmDeleteDialog from "@/components/Dialogs/ConfirmDeleteDialog.vue";
import { useReferenceDataStore } from "@/stores/referenceData";
import { buildDeleteErrorMessage } from "@/utils/helpers";

const { t } = useI18n();
const referenceStore = useReferenceDataStore();
const dialog = useGlobalDialog();

const federations = ref<Federation[]>([]);
const deleteRef = ref<InstanceType<typeof ConfirmDeleteDialog> | null>(null);
const deleteId = ref<number | null>(null);

const pagination = ref({
  page: 1,
  count: 10,
  totalRecords: 2,
});

const loader = useAppLoader();

onMounted(async () => {
  getFederationsData();
});

const getFederationsData = async () => {
  loader.setLoading(true, t("loading.loadingFederations"));
  try {
    const response = await federationService.getFederationsData({
      ...pagination.value,
    });
    if (response.success) {
      const { data, pagination: paginationData } = response;
      federations.value = data || [];
      pagination.value.totalRecords = paginationData.totalRecords;
    }
  } catch (error) {
    console.error(t("Management.federations.errorLoadingFederations"), error);
  } finally {
    loader.setLoading(false);
  }
};

const onPaginate = async (event: any) => {
  pagination.value.page = event.page + 1;
  pagination.value.count = event.rows;
  await getFederationsData();
};
const deleting = ref(false);

const confirmDeleteData = (data: Federation, event: any) => {
  deleteId.value = data.id;
  deleteRef.value?.showConfirm({
    target: event.currentTarget || event.target,
    message: `${t("Management.federations.deleteFederationConfirmation")} ${data.name}?`,
    rejectLabel: t("app.cancel"),
    acceptLabel: t("app.delete"),
    severity: "danger",
  });
};

const handleDeleteFederation = async () => {
  deleting.value = true;
  loader.setLoading(true, t("loading.deletingFederation"));
  try {
    const result = await federationService.deleteFederation(
      deleteId.value as number,
    );
    if (result.success) {
      referenceStore.clearFederationsCache();
      await getFederationsData();
    } else {
      let errorMessage = "";
      if (result.errorData)
        errorMessage = buildDeleteErrorMessage(result.errorData, t);
      else
        errorMessage =
          result.error || t("Management.federations.errorDeletingFederation");
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
