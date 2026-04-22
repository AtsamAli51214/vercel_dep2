<template>
  <div class="flex justify-center gap-6 p-4">
    <div class="bg-white rounded-2xl p-15 w-232 relative">
      <div
        @click="goBack"
        class="absolute mt-1 transition-opacity cursor-pointer left-10 hover:opacity-80"
      >
        <img :src="BackArrow" alt="back" />
      </div>
      <div class="flex flex-col gap-6">
        <div class="flex flex-col">
          <span class="font-bold text-[1.75rem] text-primary">{{
            !isEditMode
              ? t("Management.teams.createTeamTitle")
              : t("Management.teams.editTeamTitle")
          }}</span>
          <span class="text-xs font-semibold text-secondary-colo">
            {{ t("Management.teams.createTeamDescription") }}
          </span>
        </div>
        <div class="flex flex-col gap-2">
          <span class="font-medium text-lg">{{
            t("Management.teams.formTitle")
          }}</span>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ClubSelect
              v-model="clubId"
              :club-options="clubOptions"
              :label="t('Management.teams.formClub')"
              :placeholder="t('Management.teams.formClub')"
              :error="clubError"
              :disabled="!isSuperAdmin"
              @change="fetchAgeCategories($event as number)"
            />
            <div class="">
              <div class="font-medium mb-2.5">
                {{ t("Management.teams.formAgeCategory") }}
              </div>
              <Select
                v-model="ageCategoryId"
                :options="ageCategoryOptions"
                optionLabel="name"
                optionValue="value"
                fluid
                :placeholder="t('Management.teams.formAgeCategory')"
                :invalid="!!ageCategoryError"
              />
              <small class="p-invalid" v-if="ageCategoryError">
                {{ ageCategoryError }}
              </small>
            </div>
            <div class="">
              <div class="font-medium mb-2.5">
                {{ t("Management.teams.formName") }}
              </div>
              <div class="flex flex-col gap-4">
                <div
                  v-for="(team, index) in teams"
                  :key="index"
                  class="flex gap-2 items-center relative"
                >
                  <div class="w-full">
                    <InputText
                      :model-value="team.name"
                      @keypress.enter="addTeam"
                      @update:model-value="
                        (value: string | undefined) =>
                          updateTeamName(index, value)
                      "
                      fluid
                      :placeholder="t('Management.teams.formName')"
                      :invalid="!!teamErrors && teamErrors[index]"
                    />
                    <small
                      class="p-invalid"
                      v-if="teamErrors && teamErrors[index]"
                    >
                      {{ teamErrors[index] }}
                    </small>
                  </div>
                  <div
                    v-if="teams && teams.length > 1"
                    class="absolute top-0 right-0 cursor-pointer"
                    @click="removeTeam(index)"
                  >
                    <img :src="MinusIcon" alt="" />
                  </div>
                </div>
              </div>
              <small class="p-invalid" v-if="teamsError">
                {{ teamsError }}
              </small>
              <div class="flex flex-col mt-4">
                <Button
                  v-if="!isEditMode"
                  :label="t('Management.teams.addTeam')"
                  icon="pi pi-plus-circle"
                  variant="text"
                  fluid
                  :disabled="loading || isSubmitting || !areAllTeamsValid"
                  @click="addTeam"
                />
                <Button
                  :label="!isEditMode ? t('app.create') : t('app.update')"
                  fluid
                  @click="onSubmit"
                  :loading="loading || isSubmitting"
                  :disabled="
                    loading || isSubmitting || !teams || teams.length === 0
                  "
                  class="mt-6"
                />
              </div>
            </div>
          </div>
          <Message v-if="formError" severity="error">{{ formError }}</Message>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
import { BackArrow, MinusIcon } from "@/assets/images";
import type { GroupedClubOption, Option, TeamData } from "@/types";
import { useTeamForm, useAppLoader } from "@/composables/index";
import { ageCategoryService, teamService } from "@/services";
import ClubSelect from "@/components/ClubSelect.vue";
import { useReferenceDataStore } from "@/stores/referenceData";
import { getUserInfo } from "@/utils/helpers";

const { t } = useI18n();
const router = useRouter();
const route = useRoute();
const loader = useAppLoader();
const referenceStore = useReferenceDataStore();
const isEditMode = computed(() => !!route.params.id);
const teamId = computed(() => route.params.id as string | undefined);
const isSuperAdmin = computed(() => getUserInfo()?.isSuperAdmin);
const teamData = ref<TeamData | null>(null);
const fetchingTeam = ref(false);
const fetchError = ref<string | null>(null);
const ageCategoryOptions = ref<Option[]>([]);
const loadingageCategories = ref(false);

const props = reactive({
  teamData: {} as TeamData | undefined,
  isViewOnly: false,
});

const emit = (event: "close" | "teamCreatedUpdated"): void => {
  if (event === "close") {
    router.push({ name: "team" });
  } else if (event === "teamCreatedUpdated") {
    router.push({ name: "team" });
  }
};

const fetchTeamData = async () => {
  if (!teamId.value) {
    return;
  }

  fetchingTeam.value = true;
  fetchError.value = null;

  try {
    const result = await teamService.getTeamById(teamId.value);

    if (result.success && result.data) {
      const apiData = result.data.data || result.data;
      const assignment =
        apiData.assignments?.[0] || apiData.Assignments?.[0] || {};

      const mappedTeamData = {
        clubId: assignment.clubId || assignment.ClubId,
        ageGroupId: assignment.ageGroupId || assignment.AgeGroupId,
        teams: [
          {
            id: apiData.id || apiData.Id,
            name: apiData.name || apiData.Name,
          },
        ],
      };

      teamData.value = mappedTeamData;
      props.teamData = mappedTeamData;
    } else {
      fetchError.value = result.error || "Failed to fetch team data";
      router.back();
    }
  } catch (error) {
    fetchError.value =
      error instanceof Error ? error.message : "Failed to fetch team data";
    console.error("Error fetching team:", error);
  } finally {
    fetchingTeam.value = false;
  }
};

onMounted(async () => {
  const userSession = getUserInfo();

  if (isSuperAdmin.value) {
    referenceStore.fetchClubs(true);
  }

  if (!isSuperAdmin.value && userSession?.clubId) {
    clubId.value = userSession.clubId;
    fetchAgeCategories(userSession.clubId);
  }

  if (route.params.id) {
    await fetchTeamData();
  }
  if (route.query.clubId) {
    clubId.value = parseInt(route.query.clubId as string);
    fetchAgeCategories(clubId.value);
  }
  if (route.query.ageGroupId) {
    ageCategoryId.value = parseInt(route.query.ageGroupId as string);
  }
});

const {
  loading,
  isSubmitting,
  clubId,
  ageCategoryId,
  teams,
  fieldErrors,
  formError,
  areAllTeamsValid,
  addTeam,
  removeTeam,
  updateTeamName,
  onSubmit: originalOnSubmit,
} = useTeamForm(props, emit);

const onSubmit = async () => {
  const loadingMessage = isEditMode.value
    ? t("loading.updatingTeam")
    : t("loading.creatingTeam");

  loader.setLoading(true, loadingMessage);

  try {
    await originalOnSubmit();
  } finally {
    loader.setLoading(false);
  }
};

const goBack = (): void => {
  router.back();
};

const COUNTRY_NAMES: Record<string, string> = {
  NL: "Netherlands",
  BE: "Belgium",
};

const clubOptions = computed(() => {
  const userSession = getUserInfo();

  if (!isSuperAdmin.value && userSession?.clubId) {
    return [
      {
        label: "My Club",
        code: "MY",
        items: [
          {
            name: userSession.fullName,
            value: userSession.clubId,
          },
        ],
      },
    ];
  }

  const grouped: Record<string, GroupedClubOption> = {};

  referenceStore.clubs.forEach((club) => {
    const countryCode = club.country || "OT";
    const countryName = COUNTRY_NAMES[countryCode] || countryCode || "Other";

    if (!grouped[countryCode]) {
      grouped[countryCode] = {
        label: countryName,
        code: countryCode,
        items: [],
      };
    }
    grouped[countryCode].items.push({
      name: club.name,
      value: club.id,
      code: club.code,
    });
  });

  return Object.values(grouped);
});

const fetchAgeCategories = async (clubId: number) => {
  if (!clubId) {
    ageCategoryOptions.value = [];
    return;
  }

  try {
    loadingageCategories.value = true;
    const response = await ageCategoryService.getAgeCategoriesByClub(clubId);
    if (response && Array.isArray(response)) {
      ageCategoryOptions.value = response.map((ageCategory) => ({
        name: ageCategory.name,
        value: ageCategory.ageGroupId,
      }));
    }
  } catch (error) {
    console.error("Error fetching age categories:", error);
    ageCategoryOptions.value = [];
  } finally {
    loadingageCategories.value = false;
  }
};

const teamsError = computed(() => {
  const error = fieldErrors.value.teams;
  if (typeof error === "string") return error;
  return undefined;
});
const teamErrors = computed(() => {
  const error = fieldErrors.value.teams;
  if (Array.isArray(error)) return error;
  return undefined;
});
const ageCategoryError = computed(
  () => fieldErrors.value.ageCategoryId as string | undefined,
);
const clubError = computed(
  () => fieldErrors.value.clubId as string | undefined,
);
</script>

<style scoped></style>
