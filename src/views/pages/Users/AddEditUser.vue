<template>
  <div class="flex justify-center gap-6">
    <div class="bg-white rounded-2xl p-15 w-232 relative">
      <div
        @click="goBack"
        class="absolute mt-1 transition-opacity cursor-pointer left-10 hover:opacity-80"
      >
        <img :src="BackArrow" alt="back" />
      </div>
      <div class="flex flex-col gap-4">
        <div class="flex flex-col">
          <span class="font-bold text-3xl text-primary">{{
            isEditMode ? t("Users.editUserTitle") : t("Users.addUserTitle")
          }}</span>
          <span class="font-medium text-secondary-color text-xs">
            {{
              isEditMode
                ? t("Users.editUserDescription")
                : t("Users.addUserDescription")
            }}
          </span>
        </div>
        <div class="flex flex-col gap-2">
          <span class="font-semibold text-lg">{{ t("Users.userInfo") }}</span>
          <div class="p-6 bg-white border rounded-2xl">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="flex justify-start md:col-span-2 mb-10">
                <ImageUpload
                  v-model="imageFile"
                  :default-image="currentImageUrl || UploadCircle"
                  alt-text="User Logo"
                  :disabled="loading || isSubmitting"
                  optional
                  size="md"
                  :max-size="FORM_CONFIG.image.maxSize"
                  :min-size="FORM_CONFIG.image.minSize"
                  :validate-dimensions="FORM_CONFIG.image.validateDimensions"
                  :allowed-types="[...FORM_CONFIG.image.allowedTypes]"
                />
              </div>
              <div class="">
                <div class="font-medium mb-2.5">{{ t("Users.name") }}</div>
                <InputText
                  v-model="fullName"
                  fluid
                  :placeholder="t('Users.name')"
                  :invalid="!!fullNameError"
                />
                <small class="p-invalid" v-if="fullNameError">
                  {{ fullNameError }}
                </small>
              </div>
              <div class="">
                <div class="font-medium mb-2.5">
                  {{ t("Users.emailMemberId") }}
                </div>
                <InputText
                  v-model="email"
                  type="email"
                  fluid
                  :placeholder="t('Users.emailMemberId')"
                  :invalid="!!emailError"
                  :disabled="isEditMode"
                />
                <small class="p-invalid" v-if="emailError">
                  {{ emailError }}
                </small>
              </div>
              <div class="">
                <BasePhoneInput
                  v-model="phone"
                  :label="t('Users.phoneNumber')"
                  :error="phoneError"
                />
              </div>
              <div class="">
                <div class="font-medium mb-2.5">
                  {{ t("Users.gender") }}
                  <small>({{ t("app.optional") }})</small>
                </div>
                <Select
                  v-model="gender"
                  :options="genderOptions"
                  optionLabel="name"
                  optionValue="value"
                  fluid
                  :placeholder="t('Users.gender')"
                />
              </div>
              <div class="md:col-span-2">
                <ClubRolesManager
                  v-if="clubRoles"
                  ref="clubRolesManagerRef"
                  v-model="clubRoles"
                  :club-options="clubOptions"
                  :role-options="roleOptions"
                />
              </div>
              <Button
                :label="t('Users.addRole')"
                variant="outlined"
                fluid
                icon="pi pi-plus-circle"
                @click="clubRolesManagerRef?.addRole"
                :disabled="loading || isSubmitting"
              />
            </div>
          </div>
          <Button
            :label="t('app.save')"
            fluid
            @click="onSubmit"
            :loading="loading || isSubmitting"
            class="mt-6 w-1/2!"
          />

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
import { BackArrow, UploadCircle } from "@/assets/images";
import type { Option, GroupedClubOption } from "@/types";
import { BasePhoneInput } from "@/components/base";
import ImageUpload from "@/components/base/ImageUpload.vue";
import ClubRolesManager from "@/components/ClubRolesManager.vue";
import { useUserForm, useAppLoader } from "@/composables";
import { FORM_CONFIG } from "@/constants/common";
import { userService } from "@/services";
import { useReferenceDataStore } from "@/stores/referenceData";
import { getUserInfo } from "@/utils/helpers";

const COUNTRY_NAMES: Record<string, string> = {
  NL: "Netherlands",
  BE: "Belgium",
};

const { t } = useI18n();
const router = useRouter();
const route = useRoute();
const loader = useAppLoader();
const referenceStore = useReferenceDataStore();

const isEditMode = computed(() => !!route.params.id);
const userId = computed(() => route.params.id as string | undefined);

const userData = ref<any>(null);
const fetchingUser = ref(false);
const fetchError = ref<string | null>(null);

const props = reactive({
  userData: {} as any,
  isViewOnly: false,
});

const emit = (event: "close" | "userCreatedUpdated"): void => {
  if (event === "close") {
    router.push({ name: "users" });
  } else if (event === "userCreatedUpdated") {
    router.push({ name: "users" });
  }
};

const fetchUserData = async () => {
  if (!userId.value) return;

  fetchingUser.value = true;
  fetchError.value = null;

  try {
    const result = await userService.getUserById(userId.value);

    if (result.success && result.data) {
      const apiData = result.data.data || result.data;
      const mappedUserData = {
        id: apiData.id,
        fullName: apiData.fullName,
        email: apiData.email,
        phone: apiData.phoneNumber,
        gender: apiData.gender,
        clubRoles: apiData.clubRoles || [],
        profileImageUrl: apiData.profileImageUrl,
      };

      userData.value = mappedUserData;
      props.userData = mappedUserData;
    } else {
      fetchError.value = result.error || t("Users.errorLoadingUsers");
      router.back();
    }
  } catch (error) {
    fetchError.value =
      error instanceof Error ? error.message : t("Users.errorLoadingUsers");
    console.error("Error fetching user:", error);
    router.back();
  } finally {
    fetchingUser.value = false;
  }
};

onMounted(async () => {
  const userSession = getUserInfo();
  const isSuperAdmin = userSession?.isSuperAdmin;

  if (isSuperAdmin) {
    referenceStore.fetchClubs(true);
  }

  if (route.params.id) {
    await fetchUserData();
  }
});

const {
  imageFile,
  currentImageUrl,
  loading,
  isSubmitting,
  fullName,
  email,
  phone,
  gender,
  clubRoles,
  fieldErrors,
  formError,
  onSubmit: originalOnSubmit,
} = useUserForm(props, emit);

const onSubmit = async () => {
  await clubRolesManagerRef.value?.validateAllRoles();

  const loadingMessage = isEditMode.value
    ? t("loading.updatingUser")
    : t("loading.creatingUser");

  loader.setLoading(true, loadingMessage);

  try {
    await originalOnSubmit();
  } finally {
    loader.setLoading(false);
  }
};

const clubRolesManagerRef = ref<{
  addRole: () => void;
  validateAllRoles: () => Promise<boolean>;
} | null>(null);

const goBack = (): void => {
  router.back();
};

const roleOptions: Option[] = [
  { name: "Trainer", value: 2 },
  { name: "Coach", value: 3 },
  { name: "Player", value: 4 },
];

const genderOptions: Option[] = [
  { name: "Male", value: "Male" },
  { name: "Female", value: "Female" },
  { name: "Others", value: "Others" },
];

const clubOptions = computed(() => {
  const userSession = getUserInfo();
  const isSuperAdmin = userSession?.isSuperAdmin;

  if (!isSuperAdmin && userSession?.clubId) {
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
    const countryName = COUNTRY_NAMES[countryCode] || "Other";

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

const fullNameError = computed(
  () => fieldErrors.value.fullName as string | undefined,
);
const emailError = computed(
  () => fieldErrors.value.email as string | undefined,
);
const phoneError = computed(
  () => fieldErrors.value.phone as string | undefined,
);
</script>

<style scoped></style>
