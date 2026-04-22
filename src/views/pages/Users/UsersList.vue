<template>
  <div class="flex flex-col gap-6">
    <div class="grid grid-cols-1 gap-4 md:grid-cols-3 py-2">
      <UserStatCard
        :icon="TrainerIconActive"
        :label="t('Users.activeTrainers')"
        :activeCount="summary.activeTrainers || 0"
        :inactiveCount="summary.inactiveTrainers || 0"
        :totalCount="summary.totalTrainers || 0"
        :weeklyChange="summary.trainersThisWeek || 0"
      />
      <UserStatCard
        :icon="CoachIconActive"
        :label="t('Users.activeCoaches')"
        :activeCount="summary.activeCoaches || 0"
        :inactiveCount="summary.inactiveCoaches || 0"
        :totalCount="summary.totalCoaches || 0"
        :weeklyChange="summary.coachesThisWeek || 0"
      />
      <UserStatCard
        :icon="PlayerIconActive"
        :label="t('Users.activePlayers')"
        :activeCount="summary.activePlayers || 0"
        :inactiveCount="summary.inactivePlayers || 0"
        :totalCount="summary.totalPlayers || 0"
        :weeklyChange="summary.playersThisWeek || 0"
      />
    </div>

    <div class="flex items-center justify-end gap-3">
      <Button icon="pi pi-search" severity="secondary" rounded />
      <Button icon="pi pi-filter" severity="secondary" rounded />
      <Button
        :label="t('Users.import')"
        severity="secondary"
        icon="pi pi-file-import"
        rounded
      />
      <router-link to="/pages/users/add">
        <Button
          :label="t('Users.addUser')"
          icon="pi pi-plus-circle"
          severity="primary"
          rounded
        />
      </router-link>
    </div>

    <DataTable
      :value="users"
      @rowClick="showUserDetails"
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
      <Column field="name" :header="t('Users.name')">
        <template #body="{ data }">
          <div
            class="flex md:flex-row flex-col items-start md:items-center gap-2"
          >
            <Avatar
              :image="data.profileImageUrl || undefined"
              :label="data.profileImageUrl ? undefined : data.name[0]"
              shape="circle"
              :pt="{
                root: {
                  class: `${!data.profileImageUrl ? '!bg-primary' : ''} !text-white !text-xl !w-8 !h-8`,
                },
              }"
            />
            <span>{{ data.name }}</span>
          </div>
        </template>
      </Column>
      <Column field="club" :header="t('Users.club')">
        <template #body="{ data }">
          <div
            class="flex flex-col items-start gap-1"
            v-if="data.clubRoles.length > 0"
          >
            <Tag
              :value="data.clubRoles[0].clubName"
              class=""
              severity="secondary"
              rounded
              :pt="{
                label: { class: 'text-xs font-medium' },
                root: { class: 'border' },
              }"
            />
          </div>
        </template>
      </Column>
      <Column field="age" :header="t('Users.age')">
        <template #body="{ data }">
          <div
            class="flex flex-col items-start gap-1"
            v-if="data.clubRoles.length > 0"
          >
            <template
              v-for="(clubRole, index) in data.clubRoles"
              :key="clubRole.ageGroupName + index"
            >
              <Tag
                v-if="clubRole.ageGroupName"
                :value="clubRole.ageGroupName"
                class=""
                severity="secondary"
                rounded
              />
            </template>
          </div>
        </template>
      </Column>
      <Column field="team" :header="t('Users.team')">
        <template #body="{ data }">
          <div
            class="flex flex-col items-start gap-1"
            v-if="data.clubRoles.length > 0"
          >
            <Tag
              v-for="(clubRole, index) in data.clubRoles"
              :key="clubRole.teamName + index"
              :value="clubRole.teamName"
              class=""
              severity="secondary"
              rounded
            />
          </div>
        </template>
      </Column>
      <Column field="roles" :header="t('Users.role')">
        <template #body="{ data }">
          <div
            class="flex flex-col items-start gap-1"
            v-if="data.clubRoles.length > 0"
          >
            <div
              v-for="(clubRole, index) in data.clubRoles"
              :key="clubRole.roles + index"
              class="flex items-center gap-1"
            >
              <template v-if="clubRole.roles.length > 0">
                <BaseTooltip
                  v-for="role in clubRole.roles"
                  :key="role"
                  :value="t(`Users.${role.toLowerCase()}`)"
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
                    <img :src="getRoleIcon(role)" :alt="role" />
                  </Tag>
                </BaseTooltip>
              </template>
            </div>
          </div>
        </template>
      </Column>
      <Column
        field="status"
        :header="t('Users.status')"
        style="min-width: 10rem"
      >
        <template #body="{ data }">
          <Tag
            :value="
              data.status == 0
                ? t('Users.pending')
                : data.status == 1
                  ? t('Users.active')
                  : t('Users.inactive')
            "
            :severity="getStatusSeverity(data.status)"
            rounded
          />
        </template>
      </Column>
      <Column :header="t('Users.actions')" style="width: 10rem">
        <template #body="{ data }">
          <div class="flex gap-1">
            <Button
              @click="confirmDeleteData(data, $event)"
              :icon="data.status === 2 ? 'pi pi-undo' : 'pi pi-trash'"
              severity="secondary"
              size="small"
              text
              rounded
              :disabled="deleting"
            />
            <router-link :to="`/pages/users/edit/${data.id}`">
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
              t("Users.noUserAdded")
            }}</span>
            <span class="text-primary">
              {{ t("Users.pleaseAddUserToProceedFurther") }}
            </span>
          </div>
          <router-link to="/pages/users/add">
            <Button
              :label="t('Users.createNewUser')"
              variant="outlined"
              icon="pi pi-plus-circle"
              severity="primary"
              rounded
            />
          </router-link>
        </div>
      </template>
    </DataTable>
    <div v-if="users?.length !== 0" class="flex justify-end">
      <Paginator
        :rows="pagination.count"
        :totalRecords="pagination.totalRecords"
        :rowsPerPageOptions="[10, 25, 50, 100]"
        template="RowsPerPageDropdown FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink"
        :pageLinkSize="3"
        @page="onPaginate"
        :pt="{
          root: {
            class: '!bg-transparent !p-0 ',
          },
        }"
      />
    </div>

    <Dialog
      v-model:visible="visible"
      modal
      :closable="false"
      :showHeader="false"
      :style="{ maxWidth: '58rem', width: '100%' }"
    >
      <div class="relative p-15">
        <div
          @click="visible = false"
          class="absolute mt-1 transition-opacity cursor-pointer left-10 hover:opacity-80"
        >
          <img :src="BackArrow" alt="back" />
        </div>
        <div class="flex flex-col gap-10">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-5">
              <Avatar
                :image="userData.profileImageUrl || undefined"
                :label="userData.profileImageUrl ? undefined : userData.name[0]"
                shape="circle"
                :pt="{
                  root: {
                    class: `${!userData.profileImageUrl ? '!bg-primary' : ''} !text-white !text-6xl !w-[5.875rem] !h-[5.875rem]`,
                  },
                }"
              />
              <div class="flex flex-col gap-2 font-medium">
                <span class="text-xl">{{ userData.name }}</span>
                <div class="">
                  <span class="text-[15px] text-primary">{{
                    userData.email
                  }}</span>
                  <br />
                  <span class="text-sm text-secondary-color">{{
                    userData.phoneNumber
                  }}</span>
                </div>
              </div>
            </div>
            <router-link :to="`/pages/users/edit/${userData.id}`">
              <Button
                icon="pi pi-pencil"
                severity="secondary"
                size="small"
                text
                rounded
              />
            </router-link>
          </div>
          <div class="flex flex-col gap-2">
            <span class="font-semibold">Teams</span>
            <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div
                class="flex flex-col gap-2 bg-[#F9FAFB] p-6 rounded-lg"
                v-for="(clubRole, index) in userData.clubRoles"
                :key="clubRole.clubName + index"
              >
                <span class="text-lg font-semibold text-primary">{{
                  clubRole.clubName
                }}</span>
                <div class="flex items-center justify-between">
                  <Tag
                    :value="clubRole.teamName"
                    class=""
                    severity="secondary"
                    :pt="{
                      label: { class: 'text-xs font-medium' },
                      root: { class: 'border' },
                    }"
                  />
                  <div class="flex gap-2">
                    <Tag
                      v-for="role in clubRole.roles"
                      :key="role"
                      severity="secondary"
                      :pt="{
                        label: { class: '' },
                        root: { class: 'border !p-1' },
                      }"
                    >
                      <img :src="getRoleIcon(role)" :alt="role" />
                      <span class="text-xs font-medium">{{ role }}</span>
                    </Tag>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Dialog>

    <ConfirmDeleteDialog
      ref="deleteRef"
      group="deleteUser"
      @accept="handleDeleteUser"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import {
  PlayerIcon,
  PlayerIconActive,
  TrainerIcon,
  TrainerIconActive,
  CoachIcon,
  CoachIconActive,
  BackArrow,
} from "@/assets/images";
import { BaseTooltip } from "@/components/base";
import UserStatCard from "@/components/UserStatCard.vue";
import type { UserWithDetails, UsersSummary } from "@/types/common";
import { userService } from "@/services";
import { useAppLoader } from "@/composables";
import { useI18n } from "vue-i18n";
import ConfirmDeleteDialog from "@/components/Dialogs/ConfirmDeleteDialog.vue";

const { t } = useI18n();
const users = ref<UserWithDetails[]>([]);
const summary = ref<UsersSummary>({});
const deleteRef = ref<InstanceType<typeof ConfirmDeleteDialog> | null>(null);
const deleteData = ref<UserWithDetails | null>(null);

const pagination = ref({
  page: 1,
  count: 10,
  totalRecords: 2,
});

const loader = useAppLoader();

onMounted(async () => {
  getUsersData();
});

const getUsersData = async () => {
  loader.setLoading(true, t("loading.loadingUsers"));
  try {
    const response = await userService.getUsersData({
      ...pagination.value,
    });
    if (response.success) {
      const { data, pagination: paginationData } = response;
      summary.value = data.summary || {};
      users.value = data.users || [];
      pagination.value.totalRecords = paginationData.totalRecords;
    }
  } catch (error) {
    console.error("Error fetching users:", error);
  } finally {
    loader.setLoading(false);
  }
};

const onPaginate = async (event: any) => {
  pagination.value.page = event.page + 1;
  pagination.value.count = event.rows;
  await getUsersData();
};

const visible = ref<boolean>(false);
const userData = ref<UserWithDetails>({
  id: 0,
  name: "",
  clubRoles: [],
  status: 0,
});

const getStatusSeverity = (status: number): "success" | "danger" => {
  return status === 1 ? "success" : "danger";
};

const getRoleIcon = (role: string) => {
  if (role === "Trainer") return TrainerIcon;
  else if (role === "Coach") return CoachIcon;
  else return PlayerIcon;
};

const showUserDetails = (event: any) => {
  visible.value = true;
  userData.value = event.data;
};

const deleting = ref(false);

const confirmDeleteData = (data: UserWithDetails, event: any) => {
  deleteData.value = data;
  deleteRef.value?.showConfirm({
    target: event.currentTarget || event.target,
    message: `${t(data.status === 2 ? "Users.activateUserConfirmation" : "Users.deleteUserConfirmation")} ${data.name}?`,
    rejectLabel: t("app.cancel"),
    acceptLabel: t("app.delete"),
    severity: "danger",
  });
};

const handleDeleteUser = async () => {
  if (!deleteData.value) return;

  deleting.value = true;
  loader.setLoading(
    true,
    deleteData.value.status === 2
      ? t("loading.activatingUser")
      : t("loading.deletingUser"),
  );
  try {
    const result = await userService.deleteUser(
      deleteData.value.id,
      deleteData.value.status === 2 ? "Activate" : "SoftDelete",
    );
    if (result.success) {
      await getUsersData();
    } else {
      console.error(t("Users.errorDeletingUser"), result.error);
    }
  } catch (error) {
    console.error(t("Users.errorDeletingUser"), error);
  } finally {
    deleting.value = false;
    loader.setLoading(false);
  }
};
</script>

<style></style>
