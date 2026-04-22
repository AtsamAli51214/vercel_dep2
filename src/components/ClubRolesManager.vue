<template>
  <div class="flex flex-col gap-6">
    <div
      v-for="(role, index) in clubRoles"
      :key="`existing-${index}-${Date.now()}`"
      class="flex flex-col gap-2"
    >
      <template v-if="clubRoles.length > 1">
        <div class="font-medium text-stroke mb-2.5">
          {{ t("Users.club") }} {{ index + 1 }}
        </div>
        <div class="relative p-6 border rounded-2xl">
          <div
            v-if="clubRoles.length > 1"
            class="absolute top-0 right-0 cursor-pointer"
            @click="removeRole(index)"
          >
            <img :src="MinusIcon" alt="" />
          </div>
          <ClubRoleForm
            :ref="(el) => setClubRoleFormRef(el, index)"
            :model-value="role"
            :club-options="clubOptions"
            :role-options="roleOptions"
            :age-group-options="ageGroupOptions"
            :loading-age-groups="loadingAgeGroups"
            @update:model-value="(role) => updateRole(index, role)"
          />
        </div>
      </template>
      <template v-else>
        <ClubRoleForm
          :ref="(el) => setClubRoleFormRef(el, index)"
          :model-value="role"
          :club-options="clubOptions"
          :role-options="roleOptions"
          :age-group-options="ageGroupOptions"
          :loading-age-groups="loadingAgeGroups"
          @update:model-value="(role) => updateRole(index, role)"
        />
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted } from "vue";
import ClubRoleForm from "./ClubRoleForm.vue";
import type { GroupedClubOption, Option } from "@/types";
import { MinusIcon } from "@/assets/images";
import { useI18n } from "vue-i18n";
import { ageCategoryService } from "@/services";
import { getUserInfo } from "@/utils/helpers";

const { t } = useI18n();

interface ClubRole {
  clubId: number;
  ageGroupId: number;
  teamId: number;
  roleIds: number[];
}

interface Props {
  modelValue: ClubRole[];
  clubOptions: GroupedClubOption[];
  roleOptions: Option[];
}

const props = defineProps<Props>();

const emit = defineEmits<{
  "update:modelValue": [value: ClubRole[]];
  "add-role": [];
}>();

const clubRoles = computed({
  get: () => props.modelValue,
  set: (value) => emit("update:modelValue", value),
});

const clubRoleFormRefs = ref<any[]>([]);
const ageGroupOptions = ref<Option[]>([]);
const loadingAgeGroups = ref(false);
const currentClubId = ref<number>(0);

const setClubRoleFormRef = (el: any, index: number) => {
  if (el) {
    clubRoleFormRefs.value[index] = el;
  }
};

const ensureClubRoleExists = (): void => {
  if (!clubRoles.value || clubRoles.value.length === 0) {
    clubRoles.value = [
      {
        clubId: 0,
        ageGroupId: 0,
        teamId: 0,
        roleIds: [],
      },
    ];
  }
};

const addRole = (): void => {
  ensureClubRoleExists();
  if (clubRoles.value) {
    const newClubId = currentClubId.value || clubRoles.value[0]?.clubId || 0;

    clubRoles.value = [
      ...clubRoles.value,
      {
        clubId: newClubId,
        ageGroupId: 0,
        teamId: 0,
        roleIds: [],
      },
    ];
  }
  emit("add-role");
};

const removeRole = (index: number): void => {
  if (clubRoles.value && clubRoles.value.length > 1) {
    const updated = [...clubRoles.value];
    updated.splice(index, 1);
    clubRoles.value = updated;
    clubRoleFormRefs.value.splice(index, 1);
  }
};

const fetchAgeGroups = async (clubId: number) => {
  if (!clubId) {
    ageGroupOptions.value = [];
    return;
  }

  try {
    loadingAgeGroups.value = true;
    const response = await ageCategoryService.getAgeCategoriesByClub(clubId);
    if (response && Array.isArray(response)) {
      ageGroupOptions.value = response.map((ageCategory) => ({
        name: ageCategory.name,
        value: ageCategory.ageGroupId,
      }));
    }
  } catch (error) {
    console.error("Error fetching age groups:", error);
    ageGroupOptions.value = [];
  } finally {
    loadingAgeGroups.value = false;
  }
};

const updateRole = (index: number, updatedRole: ClubRole): void => {
  if (clubRoles.value && clubRoles.value[index]) {
    const updated = [...clubRoles.value];
    const oldRole = updated[index];
    updated[index] = updatedRole;

    if (oldRole.clubId !== updatedRole.clubId && updatedRole.clubId !== 0) {
      currentClubId.value = updatedRole.clubId;

      for (let i = 0; i < updated.length; i++) {
        updated[i] = {
          ...updated[i],
          clubId: updatedRole.clubId,
          ageGroupId: 0,
          teamId: 0,
        };
      }

      fetchAgeGroups(updatedRole.clubId);
    }

    clubRoles.value = updated;
  }
};

const validateAllRoles = async () => {
  const validationPromises = clubRoleFormRefs.value
    .filter((ref) => ref?.validate)
    .map((ref) => ref.validate());

  const results = await Promise.all(validationPromises);
  const allValid = results.every((result) => result.valid);

  if (!allValid) return false;

  const duplicateError = checkForDuplicates();
  if (duplicateError) {
    return false;
  }

  return true;
};

const checkForDuplicates = (): boolean => {
  if (!clubRoles.value || clubRoles.value.length <= 1) return false;

  const combinations = new Map<string, number[]>();

  clubRoles.value.forEach((role, index) => {
    if (role.ageGroupId && role.teamId) {
      const key = `${role.ageGroupId}-${role.teamId}`;
      if (!combinations.has(key)) {
        combinations.set(key, []);
      }
      combinations.get(key)!.push(index);
    }
  });

  for (const [, indices] of combinations.entries()) {
    if (indices.length > 1) {
      indices.forEach((idx) => {
        if (clubRoleFormRefs.value[idx]?.setDuplicateError) {
          clubRoleFormRefs.value[idx].setDuplicateError(
            t("validation.duplicateAgeTeamCombination"),
          );
        }
      });
      return true;
    }
  }

  return false;
};

watch(
  () => props.modelValue,
  (roles) => {
    if (roles && roles.length > 0 && roles[0].clubId) {
      if (
        roles[0].clubId !== currentClubId.value ||
        currentClubId.value === 0
      ) {
        currentClubId.value = roles[0].clubId;
        fetchAgeGroups(roles[0].clubId);
      }
    }
  },
  { immediate: true, deep: true },
);

onMounted(() => {
  const userSession = getUserInfo();
  const isSuperAdmin = userSession?.isSuperAdmin;

  if (!isSuperAdmin && userSession?.clubId) {
    currentClubId.value = userSession.clubId;
    fetchAgeGroups(userSession.clubId);

    if (
      clubRoles.value &&
      clubRoles.value.length > 0 &&
      clubRoles.value[0].clubId === 0
    ) {
      clubRoles.value = [
        {
          ...clubRoles.value[0],
          clubId: userSession.clubId,
        },
      ];
    }
  }
});

defineExpose({
  addRole,
  validateAllRoles,
});
</script>

<style scoped></style>
