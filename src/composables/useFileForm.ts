import { ref, computed, watch } from "vue";
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import { useI18n } from "vue-i18n";
import { createContentFileSchema } from "@/utils/validation";
import { FileData, FileFormData } from "@/types";

interface UseFileFormProps {
  fileData?: FileData;
}

type UseFileFormEmit = (event: "close" | "success", ...args: unknown[]) => void;

export const useFileForm = (
  props: UseFileFormProps = {},
  emit?: UseFileFormEmit,
) => {
  const { t } = useI18n();

  const loading = ref(false);
  const formError = ref("");
  const deletedFileIds = ref<number[]>([]);

  const isEditMode = computed(() => !!props.fileData?.id);

  const existingFilesData = ref<
    Array<{
      id: number;
      url: string;
      name: string;
      size: number;
      type: string;
    }>
  >([]);

  const initializeExistingFiles = () => {
    if (!props.fileData?.files) {
      existingFilesData.value = [];
      return;
    }

    existingFilesData.value = props.fileData.files.map((file) => ({
      id: file.id,
      url: file.url,
      name: file.fileName,
      size: file.size,
      type: file.url.split(".").pop() || "",
    }));
  };

  initializeExistingFiles();

  const hasExistingFile = computed(() => existingFilesData.value.length > 0);

  const existingFiles = computed(() => existingFilesData.value);

  const schema = computed(() =>
    toTypedSchema(
      createContentFileSchema(
        t,
        100,
        [
          "video/mp4",
          "video/quicktime",
          "image/jpeg",
          "image/png",
          "application/pdf",
        ],
        hasExistingFile.value,
      ),
    ),
  );

  const defaultInitialValues: {
    title: string;
    description: string;
    files: File[];
    exerciseId?: number;
  } = {
    title: "",
    description: "",
    files: [] as File[],
    exerciseId: undefined,
  };

  const getInitialValues = (): {
    title: string;
    description: string;
    files: File[];
    exerciseId?: number;
  } => {
    if (!props.fileData || !isEditMode.value) {
      return defaultInitialValues;
    }

    return {
      title: props.fileData.title || "",
      description: props.fileData.description || "",
      files: [] as File[],
      exerciseId: undefined,
    };
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
    initialValues: getInitialValues() as any,
    validateOnMount: false,
  });

  const [title] = defineField("title");
  const [description] = defineField("description");
  const [files] = defineField("files");
  const [exerciseId] = defineField("exerciseId");

  const actionButtonText = computed(() => {
    return isEditMode.value ? t("app.update") : t("app.save");
  });

  const actionLoadingText = computed(() => {
    return isEditMode.value
      ? t("loading.updatingFile")
      : t("loading.creatingFile");
  });

  const fieldErrors = computed(() => {
    return errors.value;
  });

  watch(
    () => props.fileData,
    (newData, oldData) => {
      formError.value = "";
      const isDifferentFile = newData?.id !== oldData?.id;
      if (isDifferentFile) {
        deletedFileIds.value = [];
      }

      initializeExistingFiles();

      const hasData =
        newData &&
        (newData.id ||
          newData.title ||
          newData.description ||
          (newData.files && newData.files.length > 0));

      if (hasData) {
        const initialValues = getInitialValues();
        resetForm({ values: initialValues as any });
      } else {
        resetForm({ values: defaultInitialValues as any });
      }
    },
    { immediate: true, deep: true },
  );

  const clearFormError = () => {
    formError.value = "";
  };

  const handleModalClose = () => {
    if (!isEditMode.value) {
      resetForm({ values: defaultInitialValues as any });
    }
    if (emit) {
      emit("close");
    }
  };

  const removeExistingFile = (index: number) => {
    const fileToRemove = existingFilesData.value[index];
    if (fileToRemove && fileToRemove.id) {
      deletedFileIds.value.push(fileToRemove.id);
    }
    existingFilesData.value.splice(index, 1);
  };

  const createFormData = (
    data: FileFormData,
    fileId?: number,
    isDraft: boolean = false,
    isPublished: boolean = false,
  ): FormData => {
    const formData = new FormData();
    formData.append("MediaId", data.id?.toString() || "");
    formData.append("Name", data.title);
    formData.append("Description", data.description || "");

    if (data.files && data.files.length > 0) {
      data.files.forEach((file) => {
        formData.append("Files", file);
      });
    }

    formData.append("FileType", "1");

    formData.append("IsDraft", isDraft.toString());
    formData.append("IsPublished", isPublished.toString());

    if (fileId) {
      formData.append("Id", fileId.toString());
    }
    if (data.exerciseId) {
      formData.append("ExerciseId", data.exerciseId.toString());
    }

    if (deletedFileIds.value.length > 0) {
      deletedFileIds.value.forEach((id) => {
        formData.append("DeleteFileIds", id.toString());
      });
    }

    return formData;
  };

  const submitWithDraftFlag = async (
    isDraft: boolean = false,
    isPublished: boolean = false,
  ) => {
    try {
      loading.value = true;
      formError.value = "";

      const hasNewFiles = files.value && files.value.length > 0;
      const hasExistingFiles = existingFilesData.value.length > 0;

      if (!hasNewFiles && !hasExistingFiles) {
        formError.value = t("validation.atLeastOneFileRequired");
        fieldErrors.value.files = t("validation.atLeastOneFileRequired");
        loading.value = false;
        return { success: false, error: formError.value };
      }

      const formData = createFormData(
        {
          id: props.fileData?.id,
          title: title.value,
          description: description.value || "",
          files: files.value || [],
          exerciseId: exerciseId.value,
        },
        undefined,
        isDraft,
        isPublished,
      );

      emit?.("success", formData, isEditMode.value);
    } catch (error) {
      formError.value =
        error instanceof Error
          ? error.message
          : t("Academy.library.fileUpload.uploadError");
      console.error("File form submission error:", formError.value);
      return { success: false, error: formError.value };
    } finally {
      loading.value = false;
    }
  };

  const onSubmit = handleSubmit(
    async () => {
      return submitWithDraftFlag(false, true);
    },
    (validationErrors) => {
      console.error("❌ File form validation failed!");
      console.error("Validation errors:", validationErrors);
      return { success: false, error: "Validation failed" };
    },
  );

  const reset = () => {
    resetForm({ values: defaultInitialValues as any });
    formError.value = "";
  };

  return {
    loading,
    formError,
    isSubmitting,
    isEditMode,
    title,
    description,
    files,
    exerciseId,
    existingFiles,
    deletedFileIds,
    actionButtonText,
    actionLoadingText,
    fieldErrors,
    onSubmit,
    submitWithDraftFlag,
    reset,
    clearFormError,
    handleModalClose,
    setFieldValue,
    createFormData,
    removeExistingFile,
  };
};
