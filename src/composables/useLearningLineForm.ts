import { ref, computed, watch } from "vue";
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import { useI18n } from "vue-i18n";
import { createLearningLineSchema } from "@/utils/validation";
import { learningLineService } from "@/services";
import {
  UseLearningLineFormEmit,
  UseLearningLineFormProps,
} from "@/types/learningLine";

export const useLearningLineForm = (
  props: UseLearningLineFormProps,
  emit: UseLearningLineFormEmit,
) => {
  const { t } = useI18n();

  const loading = ref(false);
  const formError = ref("");

  const isEditMode = computed(() => Boolean(props.learningLineData?.id));

  const schema = toTypedSchema(createLearningLineSchema(t));

  const defaultInitialValues = {
    name: "",
    code: "",
    description: "",
  };

  const getInitialValues = () => {
    if (!props.learningLineData || !isEditMode.value) {
      return defaultInitialValues;
    }
    return {
      name: props.learningLineData.name ?? "",
      code: props.learningLineData.code ?? "",
      description: props.learningLineData.description ?? "",
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
  const [description] = defineField("description");

  const pageTitle = computed(() => {
    if (props.isViewOnly) {
      return props.learningLineData?.name ?? t("LearningLines.title");
    }
    if (isEditMode.value) {
      return props.learningLineData?.name ?? t("LearningLines.editTitle");
    }
    return t("LearningLines.createTitle");
  });

  const actionButtonText = computed(() =>
    isEditMode.value ? t("app.update") : t("app.create"),
  );

  const actionLoadingText = computed(() =>
    isEditMode.value
      ? t("LearningLines.updating")
      : t("LearningLines.creating"),
  );

  const fieldErrors = computed(() => errors.value);

  watch(
    [
      () => props.learningLineData,
      () => props.isViewOnly,
      () => isEditMode.value,
    ],
    ([newData, isViewOnly, isEdit]) => {
      formError.value = "";
      const initialValues = getInitialValues();
      if (newData && (isViewOnly || isEdit) && initialValues) {
        resetForm({ values: initialValues });
      } else if (!newData && !isEdit) {
        resetForm({ values: defaultInitialValues });
      }
    },
    { immediate: true },
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
          code: values.code || undefined,
          description: values.description || undefined,
        };

        let result;
        if (isEditMode.value && props.learningLineData?.id) {
          result = await learningLineService.updateLearningLine(
            props.learningLineData.id,
            requestData,
          );
        } else {
          result = await learningLineService.createLearningLine(requestData);
        }

        if (result.success) {
          handleModalClose();
          emit(
            "learningLineCreatedUpdated",
            values.name,
            isEditMode.value,
            result.data,
          );
        } else {
          formError.value = result.error ?? t("LearningLines.errorSaving");
        }
      } catch (error) {
        formError.value =
          error instanceof Error
            ? error.message
            : isEditMode.value
              ? t("LearningLines.errorUpdating")
              : t("LearningLines.errorCreating");
      } finally {
        loading.value = false;
      }
    },
    (validationErrors) => {
      console.error("Learning line form validation failed:", validationErrors);
    },
  );

  return {
    loading,
    formError,
    isSubmitting,
    name,
    code,
    description,
    pageTitle,
    actionButtonText,
    actionLoadingText,
    fieldErrors,
    onSubmit,
    clearFormError,
    handleModalClose,
  };
};
