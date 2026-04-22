import { ref, computed, watch } from "vue";
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import { useI18n } from "vue-i18n";
import { getContentFileConfig } from "@/constants/formOptions";
import { createLessonSchema } from "@/utils/validation";
import type {
  LessonData,
  ModuleFile,
  MediaFile,
} from "@/views/pages/Library/ContentInfo/types";

const convertMediaToModuleFile = (media: MediaFile): ModuleFile => {
  return {
    id: media.id,
    name: media.fileName || media.title || "Unknown",
    size: media.size || 0,
    type: getMediaMimeType(media.type),
    url: media.url,
  };
};

const getMediaMimeType = (type?: number): string => {
  switch (type) {
    case 1:
      return "image/jpeg";
    case 2:
      return "video/mp4";
    case 3:
      return "application/pdf";
    default:
      return "application/octet-stream";
  }
};

interface UseLessonFormProps {
  lessonData?: LessonData;
}

type UseLessonFormEmit = (
  event: "close" | "lessonSaved" | "formChanged",
  ...args: unknown[]
) => void;

export const useLessonForm = (
  props: UseLessonFormProps = {},
  emit?: UseLessonFormEmit,
) => {
  const { t } = useI18n();

  const loading = ref(false);
  const formError = ref("");
  const existingFiles = ref<ModuleFile[]>([]);
  const deletedFileIds = ref<number[]>([]);

  const isEditMode = computed(() => {
    return !!(props.lessonData?.id || props.lessonData?.uniqueId);
  });

  const defaultInitialValues = {
    title: "",
    description: "",
    fileType: 1,
    files: [] as File[],
  };

  const getInitialValues = () => {
    if (!props.lessonData) {
      existingFiles.value = [];
      return defaultInitialValues;
    }

    const filesFromApi: ModuleFile[] = [];

    if (props.lessonData.media && Array.isArray(props.lessonData.media)) {
      props.lessonData.media.forEach((media) => {
        filesFromApi.push(convertMediaToModuleFile(media));
      });
    }

    existingFiles.value =
      filesFromApi.length > 0 ? filesFromApi : props.lessonData.files || [];

    return {
      title: props.lessonData.title || "",
      description: props.lessonData.description || "",
      fileType: props.lessonData.fileType || props.lessonData.type || 1,
      files: [] as File[],
    };
  };

  const {
    handleSubmit,
    defineField,
    errors,
    resetForm,
    setFieldValue,
    values,
  } = useForm({
    validationSchema: toTypedSchema(createLessonSchema(t)),
    initialValues: getInitialValues() as any,
    validateOnMount: false,
  });

  const [title] = defineField("title");
  const [description] = defineField("description");
  const [fileType] = defineField("fileType");
  const [files] = defineField("files");

  const fileConfig = computed(() => getContentFileConfig(fileType.value || 1));

  const acceptedFileTypes = computed(() => fileConfig.value.accept);
  const maxFileSizeMB = computed(() => fileConfig.value.maxSize);
  const allowedMimeTypes = computed(() => fileConfig.value.allowedMimeTypes);

  const fieldErrors = computed(() => {
    return errors.value;
  });

  watch(
    () => props.lessonData,
    () => {
      formError.value = "";
      deletedFileIds.value = [];
      const initialValues = getInitialValues();
      resetForm({ values: initialValues as any });
    },
    { deep: true },
  );

  const hasUnsavedChanges = computed(() => {
    const titleChanged = values.title !== (props.lessonData?.title || "");
    const descriptionChanged =
      values.description !== (props.lessonData?.description || "");
    const fileTypeChanged =
      values.fileType !==
      (props.lessonData?.fileType || props.lessonData?.type || 1);
    const newFilesAdded = (values.files?.length || 0) > 0;

    const originalFilesCount =
      (props.lessonData?.media?.length || 0) +
      (props.lessonData?.files?.length || 0);

    const existingFilesChanged =
      existingFiles.value.length !== originalFilesCount;

    return (
      titleChanged ||
      descriptionChanged ||
      fileTypeChanged ||
      newFilesAdded ||
      existingFilesChanged
    );
  });

  watch(
    hasUnsavedChanges,
    (hasChanges) => {
      if (emit) {
        emit("formChanged" as any, hasChanges);
      }
    },
    { immediate: true },
  );

  const removeExistingFile = (index: number) => {
    const fileToRemove = existingFiles.value[index];
    if (fileToRemove && fileToRemove.id) {
      deletedFileIds.value.push(fileToRemove.id);
    }
    existingFiles.value.splice(index, 1);
    if (emit) {
      emit("formChanged" as any, true);
    }
  };

  const onSubmit = handleSubmit(
    async (formValues) => {
      try {
        loading.value = true;
        formError.value = "";

        const newModuleFiles: ModuleFile[] = (formValues.files || []).map(
          (file: File) => ({
            name: file.name,
            size: file.size,
            type: file.type,
            file: file,
          }),
        );

        const allFiles: ModuleFile[] = [
          ...existingFiles.value,
          ...newModuleFiles,
        ];

        if (allFiles.length === 0) {
          formError.value = t("validation.atLeastOneFileRequired");
          fieldErrors.value.files = t("validation.atLeastOneFileRequired");
          loading.value = false;
          return { success: false, error: formError.value };
        }

        const lessonData: LessonData = {
          id: props.lessonData?.id,
          uniqueId: props.lessonData?.uniqueId,
          title: formValues.title,
          description: formValues.description || "",
          fileType: formValues.fileType,
          files: allFiles,
          position: props.lessonData?.position,
        };

        if (emit) {
          emit("lessonSaved", lessonData);
        }

        return { success: true, data: lessonData };
      } catch (error) {
        formError.value =
          error instanceof Error
            ? error.message
            : t("Academy.library.lessonForm.errorSavingLesson");
        console.error("Lesson form submission error:", formError.value);
        return { success: false, error: formError.value };
      } finally {
        loading.value = false;
      }
    },
    (validationErrors) => {
      console.error("❌ Lesson form validation failed!");
      console.error("Validation errors:", validationErrors);
      return { success: false, error: "Validation failed" };
    },
  );

  const reset = () => {
    resetForm({ values: defaultInitialValues as any });
    formError.value = "";
  };

  const handleModalClose = () => {
    reset();
    if (emit) {
      emit("close");
    }
  };

  return {
    title,
    description,
    fileType,
    files,
    existingFiles,
    deletedFileIds,
    loading,
    formError,
    errors,
    fieldErrors,
    acceptedFileTypes,
    maxFileSizeMB,
    allowedMimeTypes,
    fileConfig,
    onSubmit,
    reset,
    setFieldValue,
    handleModalClose,
    isEditMode,
    hasUnsavedChanges,
    removeExistingFile,
  };
};
