import { ref, computed, watch } from "vue";
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import { useI18n } from "vue-i18n";
import { createAgeCategorySchema } from "@/utils/validation";
import { ageCategoryService } from "@/services";
import { getUserInfo } from "@/utils/helpers";

interface AgeCategoryData {
  ageGroupId?: number;
  name?: string;
}

interface UseAgeCategoryFormProps {
  ageCategoryData?: AgeCategoryData;
  isViewOnly?: boolean;
}

type UseAgeCategoryFormEmit = (
  event: "close" | "ageCategoryCreatedUpdated",
  ...args: unknown[]
) => void;

export const useAgeCategoryForm = (
  props: UseAgeCategoryFormProps,
  emit: UseAgeCategoryFormEmit,
) => {
  const { t } = useI18n();

  const userSession = getUserInfo();

  const loading = ref(false);
  const formError = ref("");

  const isEditMode = computed(() => {
    return props.ageCategoryData?.ageGroupId ? true : false;
  });

  const schema = toTypedSchema(createAgeCategorySchema(t));

  const defaultInitialValues = {
    name: "",
  };

  const getInitialValues = () => {
    if (!props.ageCategoryData || !isEditMode.value) {
      return defaultInitialValues;
    }

    return {
      name: props.ageCategoryData.name || "",
    };
  };

  const { handleSubmit, isSubmitting, defineField, errors, resetForm } =
    useForm({
      validationSchema: schema,
      initialValues: getInitialValues(),
      validateOnMount: false,
    });

  const [name] = defineField("name");

  const pageTitle = computed(() => {
    if (props.isViewOnly)
      return props.ageCategoryData?.name || t("forms.viewAgeCategory");
    if (isEditMode.value)
      return ` ${props.ageCategoryData?.name || t("forms.ageCategoryTitle")} `;
    return t("forms.ageCategoryInformation");
  });

  const actionButtonText = computed(() => {
    return isEditMode.value ? t("app.update") : t("app.create");
  });

  const actionLoadingText = computed(() => {
    return isEditMode.value
      ? t("loading.updatingAgeCategory")
      : t("loading.creatingAgeCategory");
  });

  const fieldErrors = computed(() => {
    return errors.value;
  });

  watch(
    [
      () => props.ageCategoryData,
      () => props.isViewOnly,
      () => isEditMode.value,
    ],
    ([newData, isViewOnly, isEditMode]) => {
      formError.value = "";
      const initialValues = getInitialValues();
      if (newData && (isViewOnly || isEditMode) && initialValues) {
        resetForm({ values: initialValues });
      } else if (!newData && !isEditMode) {
        resetForm({ values: defaultInitialValues });
      }
    },
    { immediate: true, deep: true },
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
          name: values.name,
          ...(userSession?.clubId && { id: userSession.clubId }),
        };

        let result;
        if (isEditMode.value) {
          result = await ageCategoryService.updateAgeCategory(
            props.ageCategoryData?.ageGroupId!,
            requestData,
          );
        } else {
          result = await ageCategoryService.createAgeCategory(requestData);
        }

        if (result.success) {
          const { data } = result;
          handleModalClose();
          emit(
            "ageCategoryCreatedUpdated",
            values.name,
            isEditMode.value,
            data,
          );
        } else {
          formError.value = result.error || t("forms.failedToSaveAgeCategory");
          console.error(
            "❌ Error:",
            result.error || t("forms.failedToSaveAgeCategory"),
          );
        }
      } catch (error) {
        formError.value =
          error instanceof Error
            ? error.message
            : isEditMode.value
              ? t("Management.ageCategories.errorUpdatingAgeCategory")
              : t("Management.ageCategories.errorCreatingAgeCategory");
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

  return {
    loading,
    formError,
    isSubmitting,
    name,
    pageTitle,
    actionButtonText,
    actionLoadingText,
    fieldErrors,
    onSubmit,
    clearFormError,
    handleModalClose,
  };
};
