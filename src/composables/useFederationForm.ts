import { ref, computed, watch } from "vue";
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import { useI18n } from "vue-i18n";
import { createFederationSchema } from "@/utils/validation";
import { federationService } from "@/services";

interface FederationData {
  id?: number;
  name?: string;
  code?: string;
  country?: string;
}

interface UseFederationFormProps {
  federationData?: FederationData;
  isViewOnly?: boolean;
}

type UseFederationFormEmit = (
  event: "close" | "federationCreatedUpdated",
  ...args: unknown[]
) => void;

export const useFederationForm = (
  props: UseFederationFormProps,
  emit: UseFederationFormEmit
) => {
  // Translation function
  const { t } = useI18n();

  // Reactive state
  const loading = ref(false);
  const formError = ref("");

  // Computed property to check if the federation data is in edit mode
  const isEditMode = computed(() => {
    return props.federationData?.id ? true : false;
  });

  // Form setup
  const schema = toTypedSchema(createFederationSchema(t));

  const defaultInitialValues = {
    name: "",
    code: "",
    country: "",
  };

  const getInitialValues = () => {
    if (!props.federationData || !isEditMode.value) {
      return defaultInitialValues;
    }

    return {
      name: props.federationData.name || "",
      code: props.federationData.code || "",
      country: props.federationData.country || "",
    };
  };

  const { handleSubmit, isSubmitting, defineField, errors, resetForm } =
    useForm({
      validationSchema: schema,
      initialValues: getInitialValues(),
      validateOnMount: false,
    });

  const [name] = defineField("name");
  const [code] = defineField("code");
  const [country] = defineField("country");

  // Computed properties
  const pageTitle = computed(() => {
    if (props.isViewOnly)
      return props.federationData?.name || t("forms.viewFederation");
    if (isEditMode.value)
      return ` ${props.federationData?.name || t("forms.federationTitle")} `;
    return t("forms.federationInformation");
  });

  const actionButtonText = computed(() => {
    return isEditMode.value ? t("app.update") : t("app.create");
  });

  const actionLoadingText = computed(() => {
    return isEditMode.value ? t("forms.updating") : t("forms.creating");
  });

  // Field errors computed
  const fieldErrors = computed(() => {
    return errors.value;
  });

  // Watch for changes in props.federationData
  watch(
    [
      () => props.federationData,
      () => props.isViewOnly,
      () => isEditMode.value,
    ],
    ([newData, isViewOnly, isEditMode]) => {
      // Clear any form errors when switching modes
      formError.value = "";
      // Get initial values
      const initialValues = getInitialValues();
      // Reset form when switching to edit/view mode with data
      if (newData && (isViewOnly || isEditMode) && initialValues) {
        resetForm({ values: initialValues });
      } else if (!newData && !isEditMode) {
        // Reset to default values for create mode
        resetForm({ values: defaultInitialValues });
      }
    },
    { immediate: true }
  );

  // Methods
  const clearFormError = () => {
    formError.value = "";
  };

  const handleModalClose = () => {
    // Reset form only when success modal is closed
    if (!isEditMode.value) {
      // For create mode, reset to initial values
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
          code: values.code,
          country: values.country,
        };

        let result;
        if (isEditMode.value) {
          result = await federationService.updateFederation(
            props.federationData?.id!,
            requestData
          );
        } else {
          result = await federationService.createFederation(requestData);
        }

        if (result.success) {
          const { data } = result;
          handleModalClose();
          emit("federationCreatedUpdated", values.name, isEditMode.value, data);
        } else {
          formError.value = result.error || t("forms.failedToSaveFederation");
          console.error(
            "❌ Error:",
            result.error || t("forms.failedToSaveFederation")
          );
        }
      } catch (error) {
        formError.value =
          error instanceof Error
            ? error.message
            : isEditMode.value
              ? t("forms.errorUpdatingFederation")
              : t("forms.errorCreatingFederation");
        console.error("Form submission error:", formError.value);
      } finally {
        loading.value = false;
      }
    },
    (errors) => {
      // This callback runs when validation fails
      console.error("❌ Form validation failed!");
      console.error("Validation errors:", errors);
    }
  );

  return {
    // State
    loading,
    formError,
    isSubmitting,
    // Form fields
    name,
    code,
    country,
    // Computed properties
    pageTitle,
    actionButtonText,
    actionLoadingText,
    fieldErrors,
    // Methods
    onSubmit,
    clearFormError,
    handleModalClose,
  };
};
