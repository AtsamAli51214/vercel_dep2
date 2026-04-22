<template>
  <div class="flex flex-col gap-6">
    <div class="flex items-center justify-end gap-3">
      <Button icon="pi pi-search" severity="secondary" rounded />
      <Button icon="pi pi-filter" severity="secondary" rounded />
      <router-link to="/pages/club/add">
        <Button
          :label="t('Clubs.addClub')"
          icon="pi pi-plus-circle"
          severity="primary"
          rounded
        />
      </router-link>
    </div>

    <DataTable
      :value="clubs"
      :pt="{
        tableContainer: {
          class: 'rounded-2xl',
        },
        headerRow: {
          class: '!border-1',
        },
        bodyRow: {
          class: '!border-1 !border-red-500 ',
        },
        column: {
          headerCell: {
            class: 'font-medium !bg-table-header-bg !border-0',
          },
          bodyCell: {
            class: '!border-1 !border-red-500 ',
          },
        },
      }"
    >
      <Column
        field="name"
        :header="t('Clubs.clubName')"
        style="min-width: 20rem"
      >
        <template #body="{ data }">
          <div class="flex items-center gap-2">
            <Avatar
              :image="data.logoUrl || undefined"
              :label="data.logoUrl ? undefined : data.name[0]"
              shape="circle"
              :pt="{
                root: {
                  class: `${!data.logoUrl ? '!bg-primary' : ''} !text-white !text-xl`,
                },
              }"
            />
            <div class="flex flex-col gap-1">
              <div class="flex gap-1 items-center">
                <router-link :to="`/pages/club/dashboard/${data.id}`">
                  <span class="cursor-pointer">
                    {{ data.name }}
                  </span>
                </router-link>
                <Tag
                  v-if="data.supplierName"
                  :value="data.supplierName"
                  severity="secondary"
                  rounded
                  :pt="{
                    label: { class: 'text-xs font-medium' },
                    root: { class: 'border' },
                  }"
                />
              </div>
              <span v-if="data.emailOrMemberId" class="text-xs text-primary">{{
                data.emailOrMemberId
              }}</span>
            </div>
          </div>
        </template>
      </Column>
      <Column
        field="contractStatusName"
        :header="t('Clubs.contractType')"
        style="min-width: 10rem"
      >
        <template #body="{ data }">
          <div class="flex items-center gap-3">
            <Tag
              :value="
                data.contractStatus == 0
                  ? t('status.active')
                  : data.contractStatus == 1
                    ? t('status.expiring')
                    : data.contractStatus == 2
                      ? t('status.expired')
                      : data.contractStatus == 3
                        ? t('status.na')
                        : ''
              "
              :severity="getStatusSeverity(data.contractStatus)"
              rounded
            />
            <span
              v-if="data.contractStatus !== 3"
              class="pi pi-download text-secondary-text cursor-pointer hover:text-primary"
              @click="downloadDocument(data)"
            />
            <img
              v-else
              :src="FileIcon"
              alt="Upload Icon"
              class="w-5 h-5 cursor-pointer hover:opacity-80"
              @click="openUploadDialog(data)"
            />
          </div>
          <span
            v-if="data.contractExpiry"
            class="text-xs text-secondary-text"
            >{{
              `${t("Clubs.expires")} ${formatDate(data.contractExpiry, t, "DD-MM-YYYY")}`
            }}</span
          >
        </template>
      </Column>
      <Column
        field="activeModules"
        :header="t('Clubs.modules')"
        style="min-width: 10rem"
      >
        <template #body="{ data }">
          <div class="flex items-center gap-4">
            <img
              :src="
                data.activeModules.includes('SMS')
                  ? SMSIconActive
                  : SMSModuleIcon
              "
              alt="SMS"
            />
            <img
              :src="
                data.activeModules.includes('WhatsApp')
                  ? WhatsAppIconActive
                  : WhatsAppIcon
              "
              alt="WhatsApp"
            />
          </div>
        </template>
      </Column>
      <Column
        field="labelTypeName"
        :header="t('Clubs.labels')"
        style="min-width: 10rem"
      >
        <template #body="{ data }">
          <Tag
            v-if="data.labelTypeName"
            :value="data.labelTypeName"
            severity="secondary"
            rounded
            :pt="{
              label: { class: 'text-xs font-medium' },
              root: { class: 'border' },
            }"
          />
        </template>
      </Column>
      <Column :header="t('Clubs.actions')" style="width: 7rem">
        <template #body="{ data }">
          <div class="flex gap-1">
            <router-link :to="`/pages/club/dashboard/${data.id}`">
              <Button
                icon="pi pi-eye"
                severity="secondary"
                size="small"
                text
                rounded
              />
            </router-link>
            <Button
              @click="confirmDeleteData(data, $event)"
              icon="pi pi-trash"
              severity="secondary"
              size="small"
              text
              rounded
              :disabled="deleting"
            />
            <router-link :to="`/pages/club/edit/${data.id}`">
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
              t("Clubs.noClubAdded")
            }}</span>
            <span class="text-primary">
              {{ t("Clubs.pleaseAddClubToProceedFurther") }}
            </span>
          </div>
          <router-link to="/pages/club/add">
            <Button
              :label="t('Clubs.createNewClub')"
              variant="outlined"
              icon="pi pi-plus-circle"
              severity="primary"
              rounded
            />
          </router-link>
        </div>
      </template>
    </DataTable>
    <div v-if="clubs?.length !== 0" class="flex justify-end">
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
      group="deleteClub"
      @accept="handleDeleteClub"
    />

    <UploadContractDialog
      v-if="uploadDialogVisible"
      v-model="uploadDialogVisible"
      :club="selectedClub"
      @refresh="getClubsData"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import type { Club } from "@/types";
import { clubService } from "@/services";
import { useAppLoader } from "@/composables";
import { useI18n } from "vue-i18n";
import ConfirmDeleteDialog from "@/components/Dialogs/ConfirmDeleteDialog.vue";
import UploadContractDialog from "@/components/Dialogs/UploadContractDialog.vue";
import {
  FileIcon,
  SMSIconActive,
  SMSModuleIcon,
  WhatsAppIcon,
  WhatsAppIconActive,
} from "@/assets/images";
import { formatDate } from "@/utils/helpers";

const { t } = useI18n();
const loader = useAppLoader();

const clubs = ref<Club[]>([]);
const deleteRef = ref<InstanceType<typeof ConfirmDeleteDialog> | null>(null);
const deleteData = ref<Club | null>(null);
const deleting = ref(false);

const uploadDialogVisible = ref(false);
const selectedClub = ref<Club | undefined>(undefined);

const pagination = ref({
  page: 1,
  count: 10,
  totalRecords: 0,
});

onMounted(async () => {
  getClubsData();
});

const getClubsData = async () => {
  loader.setLoading(true, t("loading.loadingClubs"));
  try {
    const response = await clubService.getClubsData({
      ...pagination.value,
    });
    if (response.success) {
      const { data, pagination: paginationData } = response;
      clubs.value = data || [];
      pagination.value.totalRecords = paginationData.totalCount;
    }
  } catch (error) {
    console.error(t("Clubs.errorLoadingClubs"), error);
  } finally {
    loader.setLoading(false);
  }
};

const getStatusSeverity = (status: number): string => {
  return status === 0
    ? "success"
    : status === 1
      ? "warn"
      : status === 2
        ? "danger"
        : "secondary";
};

// const viewDocument = (club: Club) => {
//   if (club.documentUrl) {
//     openDocument(club.documentUrl);
//   } else {
//     console.error("No document URL available for this club");
//   }
// };

const downloadDocument = (club: Club) => {
  if (!club.documentUrl) return;

  const link = document.createElement("a");
  link.href = club.documentUrl;
  link.download = club.documentName || "";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const openUploadDialog = (club: Club) => {
  selectedClub.value = club;
  uploadDialogVisible.value = true;
};

const onPaginate = async (event: any) => {
  pagination.value.page = event.page + 1;
  pagination.value.count = event.rows;
  await getClubsData();
};

const confirmDeleteData = (data: Club, event: any) => {
  deleteData.value = data;
  deleteRef.value?.showConfirm({
    target: event.currentTarget || event.target,
    message: `${t("Clubs.deleteClubConfirmation")} ${data.name}?`,
    rejectLabel: t("app.cancel"),
    acceptLabel: t("app.delete"),
    severity: "danger",
  });
};

const handleDeleteClub = async () => {
  deleting.value = true;
  loader.setLoading(true, t("loading.deletingClub"));
  try {
    const result = await clubService.deleteClub(
      deleteData.value?.id as number,
      { isActive: !deleteData.value?.isActive },
    );
    if (result.success) {
      await getClubsData();
    }
  } catch (error) {
    console.error(t("Clubs.errorDeletingClub") + ": " + error);
  } finally {
    deleting.value = false;
    loader.setLoading(false);
  }
};
</script>

<style></style>
