import { ref, computed, watch } from "vue";
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import { useI18n } from "vue-i18n";
import { createUserSchema } from "@/utils/validation";
import { convertUrlToFile, deepEqual } from "@/utils/helpers";
import { userService } from "@/services";

interface ClubRole {
  clubId: number;
  ageGroupId: number;
  teamId: number;
  roleIds: number[];
}

interface UserData {
  id?: number;
  fullName?: string;
  email?: string;
  phone?: string;
  gender?: string;
  clubRoles?: ClubRole[];
  profileImageUrl?: string;
  name?: string;
}

interface UseUserFormProps {
  userData?: UserData;
  isViewOnly?: boolean;
}

type UseUserFormEmit = (
  event: "close" | "userCreatedUpdated",
  ...args: unknown[]
) => void;

export const useUserForm = (props: UseUserFormProps, emit: UseUserFormEmit) => {
  const { t } = useI18n();

  const loading = ref(false);
  const formError = ref("");
  const initialLogoFileRef = ref<File | null>(null);
  const isLogoUpdatedRef = ref(false);
  const initialFormValuesRef = ref<{
    logoFile?: File | undefined;
    fullName?: string;
    email?: string;
    phone?: string;
    gender?: string;
    clubRoles?: ClubRole[];
  } | null>(null);

  const isEditMode = computed(() => {
    return props.userData?.id ? true : false;
  });

  const schema = toTypedSchema(createUserSchema(t));

  const transformClubRoles = (
    clubRoles?: Array<{
      clubId: number;
      ageGroupId?: number;
      teamId: number;
      roleIds?: number[];
    }>,
  ): ClubRole[] | undefined => {
    if (!clubRoles) return undefined;
    return clubRoles.map((role) => ({
      clubId: role.clubId,
      ageGroupId: role.ageGroupId ?? 0,
      teamId: role.teamId,
      roleIds: role.roleIds ?? [],
    }));
  };

  const getInitialValues = ():
    | {
        logoFile?: File | undefined;
        fullName?: string;
        email?: string;
        phone?: string;
        gender?: string;
        clubRoles?: ClubRole[];
      }
    | undefined => {
    if (props.userData && (props.isViewOnly || isEditMode.value)) {
      return {
        logoFile: undefined,
        fullName: props.userData.fullName,
        email: props.userData.email,
        phone: props.userData.phone,
        gender: props.userData.gender,
        clubRoles: transformClubRoles(props.userData.clubRoles),
      };
    }
    return undefined;
  };

  const defaultInitialValues = {
    logoFile: undefined,
    fullName: "",
    email: "",
    phone: "",
    gender: "",
    clubRoles: [
      {
        clubId: 0,
        ageGroupId: 0,
        teamId: 0,
        roleIds: [],
      },
    ],
  };

  const {
    handleSubmit,
    isSubmitting,
    defineField,
    errors,
    resetForm,
    setFieldValue,
  } = useForm({
    validationSchema: schema,
    initialValues: getInitialValues() || defaultInitialValues,
    validateOnMount: false,
  });

  const [logoFile] = defineField("logoFile");
  const [email] = defineField<"email">("email");
  const [fullName] = defineField<"fullName">("fullName");
  const [phone] = defineField<"phone">("phone");
  const [gender] = defineField<"gender">("gender");
  const [clubRoles] = defineField<"clubRoles">("clubRoles");

  const currentImageUrl = computed(() => props.userData?.profileImageUrl || "");

  const pageTitle = computed(() => {
    if (props.isViewOnly) return props.userData?.name || t("forms.viewUser");
    if (isEditMode.value)
      return ` ${props.userData?.name || t("forms.userTitle")} `;
    return t("forms.userInformation");
  });

  const actionButtonText = computed(() => {
    return isEditMode.value ? t("app.update") : t("app.create");
  });

  const actionLoadingText = computed(() => {
    return isEditMode.value ? t("forms.updating") : t("forms.creating");
  });

  const imageFile = computed<File | null>({
    get: () => {
      const value = logoFile.value;
      return value instanceof File ? value : null;
    },
    set: (file) => {
      logoFile.value = file === null ? undefined : file;
    },
  });

  const fieldErrors = computed(() => {
    return { ...errors.value };
  });

  const hasUnsavedChanges = computed(() => {
    if (!isEditMode.value || !initialFormValuesRef.value) {
      return false;
    }

    const currentValues = {
      fullName: fullName.value,
      email: email.value,
      phone: phone.value,
      gender: gender.value,
      clubRoles: clubRoles.value,
    };

    for (const [key, currentValue] of Object.entries(currentValues)) {
      const initialValue = (
        initialFormValuesRef.value as Record<string, unknown>
      )[key] as unknown[];

      if (Array.isArray(currentValue) && Array.isArray(initialValue)) {
        if (currentValue.length !== initialValue.length) {
          return true;
        }
        for (let i = 0; i < currentValue.length; i++) {
          if (!deepEqual(currentValue[i], initialValue[i])) {
            return true;
          }
        }
      } else if (currentValue !== initialValue) {
        return true;
      }
    }

    if (isLogoUpdatedRef.value) {
      return true;
    }

    return false;
  });

  watch(
    [() => props.userData, () => props.isViewOnly, () => isEditMode.value],
    async ([newData, isViewOnly, isEditMode]) => {
      formError.value = "";
      const initialValues = getInitialValues();
      if (newData && (isViewOnly || isEditMode) && initialValues) {
        if (
          newData.profileImageUrl &&
          typeof newData.profileImageUrl === "string"
        ) {
          try {
            const logoFile = await convertUrlToFile(
              newData.profileImageUrl,
              "existing-logo.jpg",
            );
            if (logoFile) {
              initialValues.logoFile = logoFile;
            }
          } catch (error) {
            console.error("Error converting image URL to File:", error);
          }
        }

        resetForm({ values: initialValues });
        initialLogoFileRef.value = initialValues.logoFile || null;
        isLogoUpdatedRef.value = false;
        initialFormValuesRef.value =
          initialValues as typeof initialFormValuesRef.value;
      } else if (!newData && !isViewOnly && !isEditMode) {
        resetForm({ values: defaultInitialValues });
        initialLogoFileRef.value = null;
        isLogoUpdatedRef.value = false;
        initialFormValuesRef.value =
          defaultInitialValues as typeof initialFormValuesRef.value;
      }
    },
    { deep: true, immediate: true },
  );

  watch(
    () => logoFile.value,
    (newFile) => {
      if (!isEditMode.value) {
        isLogoUpdatedRef.value = false;
        return;
      }
      if (newFile instanceof File) {
        isLogoUpdatedRef.value = initialLogoFileRef.value
          ? newFile !== initialLogoFileRef.value
          : true;
      } else {
        isLogoUpdatedRef.value = initialLogoFileRef.value !== null;
      }
    },
  );

  const clearFormError = () => {
    formError.value = "";
  };

  const handleModalClose = () => {
    if (!isEditMode.value) {
      resetForm({ values: defaultInitialValues });
    }
    emit("close");
  };

  const onSubmit = handleSubmit(
    async (values) => {
      try {
        loading.value = true;
        formError.value = "";

        const requestData = {
          FullName: values.fullName?.trim(),
          Email: values.email?.trim(),
          PhoneNumber: values.phone?.replace(/\s+/g, "") || "",
          Gender: values.gender,
          ClubRoles: values.clubRoles,
          Logo: values.logoFile instanceof File ? values.logoFile : null,
          IsLogoUpdate: isLogoUpdatedRef.value,
        };

        let result;
        if (isEditMode.value) {
          result = await userService.updateUser(
            props.userData?.id!,
            requestData,
          );
        } else {
          result = await userService.createUser(requestData);
        }

        if (result.success) {
          const { data } = result.data;
          console.info(
            "✅ User",
            isEditMode.value ? "updated" : "created",
            "successfully:",
            data,
          );
          handleModalClose();
          emit("userCreatedUpdated", values.email, isEditMode.value, data);
        } else {
          formError.value = result.error || t("forms.failedToSaveUser");
          console.error(
            "❌ Error:",
            result.error || t("forms.failedToSaveUser"),
          );
        }
      } catch (error) {
        formError.value =
          error instanceof Error
            ? error.message
            : isEditMode.value
              ? t("forms.errorUpdatingUser")
              : t("forms.errorCreatingUser");
        console.error("Form submission error:", formError.value);
      } finally {
        loading.value = false;
      }
    },
    (errors) => {
      console.error("❌ Form validation failed!");
      console.error("Validation errors:", errors);
    },
  );

  const formFields = {
    logoFile,
    imageFile,
    fullName,
    email,
    phone,
    gender,
    clubRoles,
  };

  const computedProps = {
    currentImageUrl,
    pageTitle,
    actionButtonText,
    actionLoadingText,
    fieldErrors,
    hasUnsavedChanges,
  };

  const methods = {
    onSubmit,
    clearFormError,
    handleModalClose,
    setFieldValue,
  };

  return {
    loading,
    formError,
    isSubmitting,
    ...formFields,
    ...computedProps,
    ...methods,
  };
};
