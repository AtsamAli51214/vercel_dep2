<template>
  <div class="flex flex-col gap-6">
    <div class="flex items-center justify-end gap-3">
      <Button icon="pi pi-search" severity="secondary" rounded />
      <Button icon="pi pi-filter" severity="secondary" rounded />
      <router-link to="/pages/library/add">
        <Button
          :label="t('Academy.library.addContent')"
          icon="pi pi-plus-circle"
          severity="primary"
          rounded
        />
      </router-link>
    </div>

    <div class="">
      <Tabs v-model:value="isClubAdmin" v-if="!isAdmin" class="main-tabs">
        <TabList>
          <Tab :value="0">{{ t("Academy.library.superAdmin") }}</Tab>
          <Tab :value="1">{{ t("Academy.library.clubAdmin") }}</Tab>
        </TabList>
      </Tabs>
      <Tabs v-model:value="selectedTab" class="child-tabs">
        <TabList>
          <Tab value="0">{{ t("Academy.library.all") }}</Tab>
          <Tab value="4">{{ t("Academy.library.exercises") }}</Tab>
          <Tab value="1">{{ t("Academy.library.skills") }}</Tab>
          <Tab value="2">{{ t("Academy.library.articles") }}</Tab>
          <Tab value="3">{{ t("Academy.library.guides") }}</Tab>
          <Tab value="5">{{ t("Academy.library.courses") }}</Tab>
          <Tab value="6">{{ t("Academy.library.misc") }}</Tab>
        </TabList>
      </Tabs>

      <div class="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 my-4">
        <ContentCard :contents="contents" :menuItems="getMenuItems" />
      </div>

      <div
        v-if="contents?.length === 0"
        class="h-120 flex flex-col gap-9 items-center justify-center"
      >
        <div class="flex flex-col items-center gap-2">
          <span class="text-2xl font-semibold">{{
            t("Academy.library.noContentAdded")
          }}</span>
          <span class="text-primary">
            {{ t("Academy.library.pleaseAddContent") }}
          </span>
        </div>
        <router-link to="/pages/library/add">
          <Button
            :label="t('Academy.library.createNewContent')"
            variant="outlined"
            icon="pi pi-plus-circle"
            severity="primary"
            rounded
          />
        </router-link>
      </div>
      <div v-else class="flex justify-end">
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
    </div>

    <ConfirmDeleteDialog
      ref="deleteRef"
      group="deleteLibrary"
      @accept="handleDeleteLibrary"
      @reject="handleConfirmClose"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import type { Content } from "@/types/common";
import { libraryService } from "@/services";
import { useReferenceDataStore } from "@/stores/referenceData";
import { useAppLoader, useGlobalDialog } from "@/composables";
import { useI18n } from "vue-i18n";
import ConfirmDeleteDialog from "@/components/Dialogs/ConfirmDeleteDialog.vue";
import ContentCard from "@/components/library/contentCard.vue";
import { getUserInfo } from "@/utils/helpers";
import { Tab } from "primevue";
import { useRouter, useRoute } from "vue-router";

const { t } = useI18n();
const referenceDataStore = useReferenceDataStore();
const dialog = useGlobalDialog();
const router = useRouter();
const route = useRoute();
const userSession = getUserInfo();
const isAdmin = userSession?.isSuperAdmin;

const isClubAdmin = ref<number>(route.query.isClubAdmin ? 1 : 0);
const contents = ref<Content[]>([]);
const deleteRef = ref<InstanceType<typeof ConfirmDeleteDialog> | null>(null);
const deleteContentData = ref<Content | null>(null);
const selectedTab = ref<string>((route.query.tab as string) || "0");

const pagination = ref({
  page: 1,
  count: 10,
  totalRecords: 2,
});
const getMenuItems = (data: Content) => [
  {
    label: t("Academy.library.menuItems.editInfo"),
    command: () => {
      router.push(`/pages/library/edit/${data.id}/${data.contentType}`);
    },
  },
  {
    label: t("Academy.library.menuItems.manageCourse"),
    visible: data.contentType === 5,
    command: () => {
      router.push(`/pages/library/editCourse/${data.id}/${data.contentType}`);
    },
  },
  {
    label:
      data.files.length > 0
        ? t("Academy.library.menuItems.updateFile")
        : t("Academy.library.courseContent.addFile"),
    visible: data.contentType !== 5,
    command: () => {
      router.push(
        `/pages/library/${data.files.length > 0 ? "editFile" : "addFile"}/${data.id}/${data.contentType}`,
      );
    },
  },
  {
    label: t("app.delete"),
    command: (event: any) => {
      confirmDeleteData(data, event);
      event?.stopPropagation();
    },
  },
];

const loader = useAppLoader();

onMounted(async () => {
  getLibraryData();
});

watch(selectedTab, async (newTab) => {
  pagination.value.page = 1;
  pagination.value.count = 10;
  pagination.value.totalRecords = 0;
  contents.value = [];

  router.push({
    query: { ...route.query, tab: newTab },
  });

  await getLibraryData();
});

watch(isClubAdmin, async () => {
  pagination.value.page = 1;
  pagination.value.count = 10;
  pagination.value.totalRecords = 0;
  contents.value = [];

  router.push({
    query: {
      ...route.query,
      tab: selectedTab.value,
      ...(!isAdmin ? { isClubAdmin: isClubAdmin.value.toString() } : {}),
    },
  });

  await getLibraryData();
});

const getLibraryData = async () => {
  loader.setLoading(true, t("loading.loadingLibrary"));
  try {
    const response = await libraryService.getLibraryData({
      ...pagination.value,
      contentType: selectedTab.value,
      ...(!isAdmin ? { isClubAdmin: !!isClubAdmin.value } : {}),
    });
    if (response.success) {
      const { data, pagination: paginationData } = response;
      contents.value = data || [];
      pagination.value.totalRecords = paginationData.totalRecords;
    }
  } catch (error) {
    console.error(t("Academy.library.errorLoadingLibrary"), error);
  } finally {
    loader.setLoading(false);
  }
};

const onPaginate = async (event: any) => {
  pagination.value.page = event.page + 1;
  pagination.value.count = event.rows;
  await getLibraryData();
};
const deleting = ref(false);

const confirmDeleteData = (data: Content, event: any) => {
  if (data.contentType === 1 && data.isLinked === true) {
    dialog.showInfo(
      t("Academy.library.skillCannotDeleteTitle"),
      t("Academy.library.skillCannotDeleteMessage"),
      t("Academy.library.skillCannotDeleteGotIt"),
    );
    return;
  }
  deleteContentData.value = data;
  deleteRef.value?.showConfirm({
    target: event.currentTarget || event.target,
    message: `${t("Academy.library.deleteLibraryConfirmation")} ${data.title}?`,
    rejectLabel: t("app.cancel"),
    acceptLabel: t("app.delete"),
    severity: "danger",
  });
};

const handleConfirmClose = () => {
  // Menu state is now handled by ContentCard component
};

const handleDeleteLibrary = async () => {
  deleting.value = true;
  loader.setLoading(true, t("loading.deletingLibrary"));
  try {
    const result = await libraryService.deleteLibrary(
      deleteContentData.value?.id as number,
      deleteContentData.value?.contentType as number,
    );
    if (result.success) {
      await getLibraryData();
      referenceDataStore.clearSkillsCache();
    } else {
      const errorMessage =
        result.error || t("Academy.library.errorDeletingLibrary");
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
