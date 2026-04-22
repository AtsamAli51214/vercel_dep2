<template>
  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
    <ClubSelect
      v-model="clubId"
      :club-options="clubOptions"
      :label="t('Users.club')"
      :placeholder="t('Users.club')"
      :error="errors?.clubId"
      @change="onClubChange($event as number)"
      :disabled="!isSuperAdmin"
    />
    <div class="">
      <div class="font-medium mb-2.5">{{ t("Users.age") }}</div>
      <Select
        v-model="ageGroupId"
        :options="ageGroupOptions"
        optionLabel="name"
        optionValue="value"
        fluid
        :placeholder="t('Users.age')"
        :invalid="!!errors?.ageGroupId"
        @change="onAgeGroupChange($event.value as number)"
        :disabled="!clubId || loadingAgeGroups"
        :loading="loadingAgeGroups"
      />
      <small class="p-invalid" v-if="errors?.ageGroupId">
        {{ errors.ageGroupId }}
      </small>
    </div>
    <div class="">
      <div class="font-medium mb-2.5">{{ t("Users.team") }}</div>
      <Select
        v-model="teamId"
        :options="computedTeamOptions"
        optionLabel="name"
        optionValue="value"
        fluid
        :placeholder="t('Users.team')"
        :invalid="!!errors?.teamId"
        :disabled="!clubId || !ageGroupId || loadingTeams"
        :loading="loadingTeams"
      />
      <small class="p-invalid" v-if="errors?.teamId">
        {{ errors.teamId }}
      </small>
    </div>
    <BaseMultiSelect
      v-model="roleIds"
      :options="roleOptions"
      :label="t('Users.role')"
      :placeholder="t('Users.role')"
      :error="errors?.roleIds"
      :invalid="!!errors?.roleIds"
      chip-image
      option-image
      :get-chip-image-fn="(value: number) => getRoleIcon(value, true)"
      :get-option-image-fn="(option: any) => getRoleIcon(option.name, false)"
    />
  </div>
</template>

<script setup lang="ts">
import type { GroupedClubOption, Option } from "@/types";
import {
  CoachIcon,
  CoachIconActive,
  PlayerIcon,
  PlayerIconActive,
  TrainerIcon,
  TrainerIconActive,
} from "@/assets/images";
import { useI18n } from "vue-i18n";
import ClubSelect from "./ClubSelect.vue";

const { t } = useI18n();

interface ClubRole {
  clubId: number;
  ageGroupId: number;
  teamId: number;
  roleIds: number[];
}

interface Props {
  modelValue: ClubRole;
  clubOptions: GroupedClubOption[];
  roleOptions: Option[];
  ageGroupOptions: Option[];
  loadingAgeGroups: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  "update:modelValue": [value: ClubRole];
}>();

import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import { createClubRoleSchema } from "@/utils/validation";
import { watch, ref, computed, onMounted } from "vue";
import { teamService } from "@/services";
import { getUserInfo } from "@/utils/helpers";

const { defineField, errors, validate } = useForm({
  validationSchema: toTypedSchema(createClubRoleSchema(t)),
  initialValues: props.modelValue,
  validateOnMount: false,
});

const [clubId] = defineField("clubId");
const [ageGroupId] = defineField("ageGroupId");
const [teamId] = defineField("teamId");
const [roleIds] = defineField("roleIds");

const userSession = getUserInfo();
const isSuperAdmin = computed(() => userSession?.isSuperAdmin);

const fetchedTeams = ref<Option[]>([]);
const loadingTeams = ref(false);

const computedTeamOptions = computed(() => {
  return fetchedTeams.value;
});

const fetchTeams = async (clubIdValue: number, ageGroupIdValue: number) => {
  if (!clubIdValue || !ageGroupIdValue) {
    fetchedTeams.value = [];
    return;
  }

  try {
    loadingTeams.value = true;
    const response = await teamService.getTeamsByClubAndAgeGroup(
      clubIdValue,
      ageGroupIdValue,
    );

    if (response && Array.isArray(response)) {
      fetchedTeams.value = response.map((team: any) => ({
        name: team.teamName || team.name,
        value: team.teamId || team.id,
      }));
    }
  } catch (error) {
    console.error("Error fetching teams:", error);
    fetchedTeams.value = [];
  } finally {
    loadingTeams.value = false;
  }
};

const onClubChange = async (_newClubId: number) => {
  ageGroupId.value = 0;
  teamId.value = 0;
  fetchedTeams.value = [];

  emitModelValue();
};

const onAgeGroupChange = async (newAgeGroupId: number) => {
  teamId.value = 0;
  fetchedTeams.value = [];

  if (clubId.value && newAgeGroupId) {
    await fetchTeams(clubId.value, newAgeGroupId);
  }
};

const emitModelValue = () => {
  const updated: ClubRole = {
    clubId: clubId.value ?? 0,
    ageGroupId: ageGroupId.value ?? 0,
    teamId: teamId.value ?? 0,
    roleIds: roleIds.value ?? [],
  };
  emit("update:modelValue", updated);
};

onMounted(async () => {
  if (!isSuperAdmin.value && userSession?.clubId && !clubId.value) {
    clubId.value = userSession.clubId;
  }

  if (clubId.value && ageGroupId.value) {
    await fetchTeams(clubId.value, ageGroupId.value);
  }
});

watch(
  [ageGroupId, teamId, roleIds],
  () => {
    emitModelValue();
  },
  { deep: true },
);

defineExpose({
  validate,
});

const getRoleIcon = (value: string | number, active: boolean) => {
  if (!active)
    return value === "Trainer" || value == 2
      ? TrainerIcon
      : value === "Coach" || value == 3
        ? CoachIcon
        : value === "Player" || value == 4
          ? PlayerIcon
          : "";
  return value === "Trainer" || value == 2
    ? TrainerIconActive
    : value === "Coach" || value == 3
      ? CoachIconActive
      : value === "Player" || value == 4
        ? PlayerIconActive
        : "";
};
</script>

<style scoped></style>
