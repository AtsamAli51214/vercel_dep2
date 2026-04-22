import { ref, computed, watch } from "vue";
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import { useI18n } from "vue-i18n";
import { createSupplierSchema } from "@/utils/validation";
import { supplierService } from "@/services";

interface SupplierData {
  id?: number;
  name?: string;
  federationId?: number;
  federation?: string | number;
}

interface UseSupplierFormProps {
  supplierData?: SupplierData;
  isViewOnly?: boolean;
}

type UseSupplierFormEmit = (
  event: "close" | "supplierCreatedUpdated",
  ...args: unknown[]
) => void;

export const useSupplierForm = (
  props: UseSupplierFormProps,
  emit: UseSupplierFormEmit
) => {
  // Translation function
  const { t } = useI18n();

  // Reactive state
  const loading = ref(false);
  const formError = ref("");

  // Computed property to check if the supplier data is in edit mode
  const isEditMode = computed(() => {
    return props.supplierData?.id ? true : false;
  });

  // Form setup
  const schema = toTypedSchema(createSupplierSchema(t));

  const defaultInitialValues = {
    name: "",
    federationId: undefined as number | undefined,
  };

  const getInitialValues = () => {
    if (!props.supplierData || !isEditMode.value) {
      return defaultInitialValues;
    }

    return {
      name: props.supplierData.name || "",
      federationId:
        props.supplierData.federationId ||
        (typeof props.supplierData.federation === "number"
          ? props.supplierData.federation
          : undefined),
    };
  };

  const { handleSubmit, isSubmitting, defineField, errors, resetForm } =
    useForm({
      validationSchema: schema,
      initialValues: getInitialValues(),
      validateOnMount: false,
    });

  const [name] = defineField("name");
  const [federationId] = defineField("federationId");

  // Computed properties
  const pageTitle = computed(() => {
    if (props.isViewOnly)
      return props.supplierData?.name || t("forms.viewSupplier");
    if (isEditMode.value)
      return ` ${props.supplierData?.name || t("forms.supplierTitle")} `;
    return t("forms.supplierInformation");
  });

  const actionButtonText = computed(() => {
    return isEditMode.value ? t("app.update") : t("app.create");
  });

  const actionLoadingText = computed(() => {
    return isEditMode.value
      ? t("loading.updatingSupplier")
      : t("loading.creatingSupplier");
  });

  // Field errors computed
  const fieldErrors = computed(() => {
    return errors.value;
  });

  // Watch for changes in props.supplierData
  watch(
    [() => props.supplierData, () => props.isViewOnly, () => isEditMode.value],
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
          federationId: values.federationId,
        };

        let result;
        if (isEditMode.value) {
          result = await supplierService.updateSupplier(
            props.supplierData?.id!,
            requestData
          );
        } else {
          result = await supplierService.createSupplier(requestData);
        }

        if (result.success) {
          const { data } = result;
          handleModalClose();
          emit("supplierCreatedUpdated", values.name, isEditMode.value, data);
        } else {
          formError.value = result.error || t("forms.failedToSaveSupplier");
          console.error(
            "❌ Error:",
            result.error || t("forms.failedToSaveSupplier")
          );
        }
      } catch (error) {
        formError.value =
          error instanceof Error
            ? error.message
            : isEditMode.value
              ? t("Management.suppliers.errorUpdatingSupplier")
              : t("Management.suppliers.errorCreatingSupplier");
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
    federationId,
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
