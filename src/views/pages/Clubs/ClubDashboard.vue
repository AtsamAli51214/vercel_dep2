<template>
  <div v-if="dashboardData">
    <div class="p-4 bg-table-header-bg rounded-3xl flex flex-col gap-6">
      <div class="flex items-start justify-between">
        <div class="flex items-start gap-2">
          <Avatar
            :image="dashboardData.logoUrl || undefined"
            :label="clubInitials"
            shape="circle"
            :pt="{
              root: {
                class: `${!dashboardData.logoUrl ? '!bg-primary' : ''} !text-white !text-xl w-10! h-10!`,
              },
            }"
          />
          <div class="flex flex-col items-start gap-1">
            <span class="text-3xl! font-bold text-primary!">
              {{ dashboardData.name }}
            </span>
            <span class="text-sm text-gray-500">{{ dashboardData.code }}</span>
          </div>
          <Tag :value="dashboardData.labelType" severity="secondary" rounded />
        </div>
        <!-- <Button
          v-if="isSuperAdmin"
          label="Login as Admin"
          icon="pi pi-sign-in"
          outlined
          severity="secondary"
        /> -->
      </div>

      <div class="flex items-center justify-around">
        <div class="flex flex-col items-center text-secondary-color gap-2">
          <span class="text-xs">{{ t("Clubs.dashboard.expiring") }}</span>
          <span class="text-lg font-semibold text-black">
            {{
              contractDetails.expiryDate
                ? formatDate(contractDetails.expiryDate, t, "DD MMM")
                : t("app.notAvailable")
            }}
          </span>
          <span
            v-if="contractDetails.expiryDate"
            class="text-xs text-secondary-color"
          >
            {{ formatDate(contractDetails.expiryDate, t, "YYYY") }}
          </span>
        </div>
        <Divider layout="vertical" class="h-12" />
        <div class="flex flex-col items-center gap-2">
          <span class="text-lg font-semibold">
            {{
              contractDetails.autoRenewal
                ? t("app.yes")
                : contractDetails.autoRenewal !== null
                  ? t("app.no")
                  : t("app.notAvailable")
            }}
          </span>
          <span class="text-xs text-secondary-color">
            {{ t("Clubs.dashboard.autoRenewal") }}
          </span>
        </div>
        <Divider layout="vertical" class="h-12" />
        <div class="flex flex-col items-center gap-2">
          <span class="text-lg font-semibold">
            {{ formatCurrency(contractDetails.annualPrice || 0) }}
          </span>
          <span class="text-xs text-secondary-color">
            {{ t("Clubs.dashboard.annually") }}
          </span>
        </div>
      </div>
    </div>

    <div v-if="statusData" class="grid grid-cols-1 gap-4 md:grid-cols-3 py-4">
      <UserStatCard v-for="stat in userStats" :key="stat.label" v-bind="stat" />
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="order-2 lg:order-1 flex flex-col gap-6 lg:col-span-2">
        <div class="flex items-center justify-between">
          <span class="text-lg font-semibold">
            {{ t("Clubs.dashboard.recentActivities") }}
          </span>
          <!-- <Button
            v-if="hasActivities"
            :label="t('app.viewAll')"
            rounded
            severity="secondary"
          /> -->
        </div>

        <div
          v-if="hasActivities"
          class="rounded-2xl bg-white shadow-sm border border-gray-100 max-h-[500px] overflow-y-auto"
        >
          <ul class="divide-y divide-gray-100">
            <li
              v-for="(activity, index) in dashboardData.recentActivities"
              :key="index"
              class="flex gap-4 px-6 py-4 cursor-pointer hover:bg-gray-50 transition"
            >
              <i class="pi pi-bell text-secondary-color text-2xl" />
              <div class="flex flex-col gap-1 w-full">
                <div class="flex items-center gap-2 justify-between">
                  <span>{{ activity.type }}</span>
                  <span class="text-xs">{{
                    getActivityTimeString(index)
                  }}</span>
                </div>
                <span class="text-xs font-medium text-primary">{{
                  activity.description
                }}</span>
              </div>
            </li>
          </ul>
        </div>
        <div v-else class="empty-state">
          <p>{{ t("Clubs.noActivities") }}</p>
        </div>
      </div>

      <div class="order-1 lg:order-2 flex flex-col gap-4">
        <div class="flex items-center justify-between">
          <span class="text-lg font-semibold">
            {{ t("Clubs.dashboard.contactPerson") }}
          </span>
          <Button
            v-if="canAddContact"
            :label="t('app.addNew')"
            rounded
            @click="addNewContact"
          />
        </div>

        <div v-if="hasContacts" class="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div
            v-for="(contact, index) in dashboardData.contactPersons"
            :key="index"
            class="bg-white rounded-2xl p-4"
          >
            <div class="flex flex-col gap-2">
              <div
                class="flex items-center"
                :class="contact.isPrimary ? 'justify-between' : 'justify-end'"
              >
                <img
                  v-if="contact.isPrimary"
                  :src="StarIcon"
                  alt="Primary contact"
                />
                <Button
                  icon="pi pi-pencil"
                  severity="secondary"
                  size="small"
                  text
                  rounded
                  @click="editContact(contact)"
                />
              </div>
              <div class="font-semibold text-primary">{{ contact.name }}</div>
              <div class="flex flex-col gap-1 text-xs">
                <span>{{ getRoleLabel(contact.roleId || 0) }}</span>
                <span class="text-secondary-text">{{ contact.phone }}</span>
                <span class="text-secondary-text truncate">{{
                  contact.email
                }}</span>
              </div>
            </div>
          </div>
        </div>
        <div v-else class="empty-state">
          <span>{{ t("Clubs.noContactPersons") }}</span>
        </div>

        <div class="flex items-center justify-between">
          <span class="text-lg font-semibold">
            {{ t("Clubs.dashboard.documentsContracts") }}
          </span>
          <Button
            :label="t('app.upload')"
            rounded
            severity="secondary"
            @click="uploadDocument"
          />
        </div>

        <div v-if="hasDocuments" class="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div
            v-for="(doc, index) in dashboardData.documents"
            :key="index"
            class="bg-white rounded-2xl p-4"
          >
            <div class="flex flex-col gap-2">
              <div class="flex items-center justify-end">
                <Button
                  icon="pi pi-download"
                  severity="secondary"
                  size="small"
                  text
                  rounded
                  @click="downloadDocument(doc)"
                />
              </div>
              <div
                class="font-semibold text-primary leading-tight line-clamp-2 wrap-break-word"
              >
                {{ getDocumentName(doc.name) }}
              </div>
              <div class="flex flex-col gap-1 text-xs text-secondary-text">
                <span>
                  {{ t("Clubs.dashboard.uploaded") }}:
                  {{ formatDate(doc.uploadedDate, t, "DD-MM-YYYY") }}
                </span>
                <span>{{ doc.size }}</span>
              </div>
            </div>
          </div>
        </div>
        <div v-else class="empty-state">
          <p>{{ t("Clubs.noDocuments") }}</p>
        </div>
        <span class="text-lg font-semibold">
          {{ t("Clubs.dashboard.usageSummary") }}
        </span>
        <div class="bg-white rounded-2xl p-4">
          <div class="flex flex-col gap-6">
            <div
              v-for="item in usageSummaryItems"
              :key="item.label"
              class="flex items-center justify-between text-sm"
            >
              <span class="text-secondary-color">{{ item.label }}</span>
              <span class="font-medium">{{ item.value }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <UploadContractDialog
      v-if="uploadDialogVisible"
      v-model="uploadDialogVisible"
      :club="dashboardData"
      @refresh="fetchClubData"
    />

    <AddEditContactDialog
      v-if="contactDialogVisible"
      v-model="contactDialogVisible"
      :club="dashboardData"
      :contact="selectedContact"
      @refresh="fetchClubData"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
import { clubService } from "@/services";
import { formatCurrency, formatDate, startTimeAgo } from "@/utils/helpers";
import { StarIcon } from "@/assets/images";
import UploadContractDialog from "@/components/Dialogs/UploadContractDialog.vue";
import AddEditContactDialog from "@/components/Dialogs/AddEditContactDialog.vue";
import { DashboardData } from "@/types";
// import { getUserInfo } from "@/utils/helpers";
import { getContactRoleOptions, getLabelByValue } from "@/constants";

const route = useRoute();
const { t } = useI18n();
// const userSession = getUserInfo();
// const isSuperAdmin = userSession?.isSuperAdmin;

const loading = ref(false);
const dashboardData = ref<DashboardData | null>(null);
const statusData = ref<DashboardData["kpis"] | null>(null);
const uploadDialogVisible = ref(false);
const contactDialogVisible = ref(false);
const selectedContact = ref<DashboardData["contactPersons"][0] | null>(null);
const activityTimeStrings = ref<Map<number, string>>(new Map());
const timeAgoCleanups = ref<Array<() => void>>([]);

const roleOptions = computed(() => getContactRoleOptions(t));

const getRoleLabel = (roleId: number) =>
  getLabelByValue(roleOptions.value, roleId);

const clubInitials = computed(() => {
  if (!dashboardData.value?.name || dashboardData.value.logoUrl) return "";
  return dashboardData.value.name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
});

const contractDetails = computed(
  () =>
    dashboardData.value?.contractDetails || {
      expiryDate: "",
      expiryText: "",
      autoRenewal: false,
      autoRenewalPeriod: "",
      pricingModel: "",
      annualPrice: 0,
      daysUntilExpiry: 0,
      status: "",
    },
);

const hasActivities = computed(
  () =>
    dashboardData.value?.recentActivities &&
    dashboardData.value.recentActivities.length > 0,
);

const hasContacts = computed(
  () =>
    dashboardData.value?.contactPersons &&
    dashboardData.value.contactPersons.length > 0,
);

const canAddContact = computed(
  () => dashboardData.value && dashboardData.value.contactPersons.length < 5,
);

const hasDocuments = computed(
  () =>
    dashboardData.value?.documents && dashboardData.value.documents.length > 0,
);

const userStats = computed(() => {
  if (!statusData.value) return [];

  return [
    {
      label: t("Users.activeTrainers"),
      activeCount: statusData.value.activeTrainers,
      inactiveCount: statusData.value.inactiveTrainers || 0,
      totalCount: statusData.value.totalTrainers || 0,
      percentage: statusData.value.trainersPercentage || 0,
      weeklyChange: statusData.value.trainersWeeklyAdditions,
    },
    {
      label: t("Users.activeCoaches"),
      activeCount: statusData.value.activeCoaches,
      inactiveCount: statusData.value.inactiveCoaches || 0,
      totalCount: statusData.value.totalCoaches || 0,
      percentage: statusData.value.coachesPercentage || 0,
      weeklyChange: statusData.value.coachesWeeklyAdditions,
    },
    {
      label: t("Users.activePlayers"),
      activeCount: statusData.value.activePlayers,
      inactiveCount: statusData.value.inactivePlayers || 0,
      totalCount: statusData.value.totalPlayers || 0,
      percentage: statusData.value.playersPercentage || 0,
      weeklyChange: statusData.value.playersWeeklyAdditions,
    },
  ];
});

const usageSummaryItems = computed(() => {
  if (!dashboardData.value?.usageSummary) return [];

  const summary = dashboardData.value.usageSummary;
  return [
    {
      label: t("Clubs.dashboard.lastAdminLogin"),
      value: summary.lastAdminLoginText,
    },
    {
      label: t("Clubs.dashboard.activeUsers"),
      value: summary.activeUsersText,
    },
    {
      label: t("Clubs.dashboard.peakUsage"),
      value: summary.peakUsageDay,
    },
    // {
    //   label: t("Clubs.dashboard.mostUsedModule"),
    //   value: summary.mostUsedModule,
    // },
    {
      label: t("Clubs.dashboard.teamsConfigured"),
      value: summary.teamsConfigured,
    },
  ];
});

onMounted(async () => {
  if (route.params.id) {
    await fetchClubData();
  }
});

onUnmounted(() => {
  timeAgoCleanups.value.forEach((cleanup) => cleanup());
  timeAgoCleanups.value = [];
});

const fetchClubData = async () => {
  loading.value = true;
  try {
    const response = await clubService.getClubDashboard(
      route.params.id as string,
    );
    if (response.success) {
      dashboardData.value = response.data;
      statusData.value = response.data.kpis;

      initializeActivityTimeUpdates();
    }
  } catch (error) {
    console.error("Failed to fetch dashboard data:", error);
  } finally {
    loading.value = false;
  }
};

const initializeActivityTimeUpdates = () => {
  timeAgoCleanups.value.forEach((cleanup) => cleanup());
  timeAgoCleanups.value = [];
  activityTimeStrings.value.clear();

  if (dashboardData.value?.recentActivities) {
    dashboardData.value.recentActivities.forEach((activity, index) => {
      const cleanup = startTimeAgo(
        activity.timestamp + "Z",
        (timeString) => {
          activityTimeStrings.value.set(index, timeString);
        },
        t,
      );
      timeAgoCleanups.value.push(cleanup);
    });
  }
};

const getActivityTimeString = (index: number): string => {
  return activityTimeStrings.value.get(index) || "";
};

const getDocumentName = (fileName: string): string => fileName.split(".")[0];

const addNewContact = () => {
  selectedContact.value = null;
  contactDialogVisible.value = true;
};

const editContact = (contact: DashboardData["contactPersons"][0]) => {
  selectedContact.value = contact;
  contactDialogVisible.value = true;
};

const uploadDocument = () => {
  uploadDialogVisible.value = true;
};

// const viewDocument = (doc: any) => {
//   if (doc.url) openDocument(doc.url);
// };

const downloadDocument = async (doc: any) => {
  if (!doc.url) return;

  try {
    const response = await fetch(doc.url);
    if (!response.ok) throw new Error("Failed to fetch file");

    const blob = await response.blob();

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Error downloading document:", error);
  }
};
</script>

<style scoped>
.empty-state {
  border: 1px solid #e5e7eb;
  height: 9rem;
  border-radius: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  color: #6b7280;
}
</style>
