import { ref, computed, watch } from "vue";
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import { useI18n } from "vue-i18n";
import { createContentSchema, normalizeTagsInput } from "@/utils/validation";
import { libraryService } from "@/services";
import { ContentData } from "@/types/common";
import { useAppLoader } from "@/composables";
import { useContentCache } from "./useContentCache";
import { useReferenceDataStore } from "@/stores/referenceData";

interface UseContentFormProps {
  contentData?: ContentData;
}

type UseContentFormEmit = (
  event: "close" | "contentCreatedUpdated",
  ...args: unknown[]
) => void;

/** API still expects `description`; exercises use easier/difficult in UI — merge for payload. */
const mergeExerciseDescription = (easy: unknown, hard: unknown): string => {
  const parts = [easy, hard]
    .map((v) => (typeof v === "string" ? v : ""))
    .filter((s) => s.trim().length > 0);
  if (parts.length === 0) return "";
  if (parts.length === 1) return parts[0];
  return `${parts[0]}<hr />${parts[1]}`;
};

const normalizeIdArray = (v: unknown): number[] => {
  if (Array.isArray(v)) {
    return v
      .map((x) => Number(x))
      .filter((n) => typeof n === "number" && !Number.isNaN(n));
  }
  if (typeof v === "string" && v.trim()) {
    return v
      .split(/[,\s]+/)
      .map((s) => Number(s.trim()))
      .filter((n) => !Number.isNaN(n));
  }
  return [];
};

/** Create/Update responses may nest the entity under `.data` (same as getContentById). */
const unwrapLibraryEntity = (raw: unknown): Record<string, unknown> => {
  if (!raw || typeof raw !== "object") return {};
  const d = raw as Record<string, unknown>;
  if ("id" in d && d.id != null) {
    return d;
  }
  const inner = d.data;
  if (inner && typeof inner === "object" && !Array.isArray(inner)) {
    return inner as Record<string, unknown>;
  }
  return d;
};

export const useContentForm = (
  props: UseContentFormProps,
  emit: UseContentFormEmit,
) => {
  const { t } = useI18n();
  const loader = useAppLoader();
  const { invalidateContent } = useContentCache();
  const referenceDataStore = useReferenceDataStore();

  const loading = ref(false);
  const formError = ref("");
  const mediaFiles = ref<File[]>([]);
  const deletedMediaFileIds = ref<number[]>([]);

  const isEditMode = computed(() => {
    return props.contentData?.id ? true : false;
  });

  const schema = toTypedSchema(createContentSchema(t));

  const defaultInitialValues = {
    contentType: undefined,
    title: "",
    description: "",
    easierExercise: "",
    difficultExercise: "",
    categoryId: undefined,
    themeIds: [] as number[],
    levelId: undefined,
    ageGroupIds: [] as number[],
    tags: [] as string[],
    linkedSkillIds: [] as number[],
    labels: [] as number[],
  };

  const getInitialValues = () => {
    if (!props.contentData || !isEditMode.value) {
      return defaultInitialValues;
    }

    const tags = (props.contentData.tags ||
      props.contentData.tagNames ||
      []) as string[];

    const isExercise = props.contentData.contentType === 4;
    const raw = props.contentData as ContentData & {
      EasierExercise?: string | null;
      DifficultExercise?: string | null;
    };
    const easier =
      raw.easierExercise ??
      raw.EasierExercise ??
      (isExercise ? props.contentData.description || "" : "");
    const difficult = raw.difficultExercise ?? raw.DifficultExercise ?? "";

    return {
      contentType: props.contentData.contentType || undefined,
      title: props.contentData.title || "",
      description: isExercise ? "" : props.contentData.description || "",
      easierExercise: easier,
      difficultExercise: difficult,
      categoryId: props.contentData.categoryId || undefined,
      themeIds: (props.contentData.themeIds || []) as number[],
      levelId: props.contentData.levelId || undefined,
      ageGroupIds: normalizeIdArray(props.contentData.ageGroupIds),
      tags: tags,
      linkedSkillIds: (props.contentData.linkedSkillIds || []) as number[],
      labels: (props.contentData.labels || []) as number[],
    };
  };

  const { handleSubmit, isSubmitting, defineField, errors, resetForm } =
    useForm({
      validationSchema: schema,
      initialValues: getInitialValues(),
      validateOnMount: false,
    });

  const [contentType] = defineField("contentType");
  const [title] = defineField("title");
  const [description] = defineField("description");
  const [easierExercise] = defineField("easierExercise");
  const [difficultExercise] = defineField("difficultExercise");
  const [categoryId] = defineField("categoryId");
  const [themeIds] = defineField("themeIds");
  const [levelId] = defineField("levelId");
  const [ageGroupIds] = defineField("ageGroupIds");
  const [tags] = defineField("tags");
  const [linkedSkillIds] = defineField("linkedSkillIds");
  const [labels] = defineField("labels");

  const actionButtonText = computed(() => {
    return isEditMode.value ? t("app.update") : t("app.create");
  });

  const actionLoadingText = computed(() => {
    return isEditMode.value
      ? t("loading.updatingContent")
      : t("loading.creatingContent");
  });

  const fieldErrors = computed(() => {
    return errors.value;
  });

  watch(
    () => props.contentData,
    (newData) => {
      formError.value = "";
      mediaFiles.value = [];
      deletedMediaFileIds.value = [];
      if (newData && newData.id) {
        const initialValues = getInitialValues();
        resetForm({ values: initialValues });
      } else if (!newData || !newData.id) {
        resetForm({ values: defaultInitialValues });
      }
    },
    { immediate: true, deep: true },
  );

  const existingFilesForUpload = computed(() => {
    const files = props.contentData?.media?.[0]?.files || [];
    return files
      .filter((f) => !deletedMediaFileIds.value.includes(f.id))
      .map((file) => ({
        id: file.id,
        url: file.url,
        name: file.fileName,
        size: file.size,
        type: file.url.split(".").pop() || "",
      }));
  });

  const onExistingMediaRemoved = (index?: number) => {
    if (index === undefined) return;
    const list = existingFilesForUpload.value;
    const item = list[index];
    if (item?.id) {
      deletedMediaFileIds.value.push(item.id);
    }
  };

  const buildMediaFormData = (
    values: {
      contentType?: number;
      title: string;
      description?: string;
      easierExercise?: string;
      difficultExercise?: string;
      categoryId?: number;
    },
    files: File[],
    options: {
      isDraft: boolean;
      isPublished: boolean;
      mediaBundleId?: number;
    },
  ): FormData => {
    const formData = new FormData();
    const mediaId = options.mediaBundleId ?? props.contentData?.media?.[0]?.id;
    formData.append("MediaId", mediaId != null ? String(mediaId) : "");
    formData.append("Name", values.title);
    const isExercise = Number(values.contentType) === 4;
    const mediaDescription = isExercise
      ? mergeExerciseDescription(
          values.easierExercise,
          values.difficultExercise,
        )
      : values.description || "";
    formData.append("Description", mediaDescription);
    if (
      values.categoryId != null &&
      typeof values.categoryId === "number" &&
      Number.isFinite(values.categoryId)
    ) {
      formData.append("CategoryId", String(values.categoryId));
    }
    files.forEach((file) => {
      formData.append("Files", file);
    });
    formData.append("FileType", "1");
    formData.append("IsDraft", String(options.isDraft));
    formData.append("IsPublished", String(options.isPublished));
    if (
      typeof mediaId === "number" &&
      Number.isFinite(mediaId) &&
      mediaId > 0
    ) {
      formData.append("Id", String(mediaId));
    }
    deletedMediaFileIds.value.forEach((id) => {
      if (typeof id === "number" && !Number.isNaN(id)) {
        formData.append("DeleteFileIds", String(id));
      }
    });
    return formData;
  };

  const clearFormError = () => {
    formError.value = "";
  };

  const handleModalClose = () => {
    if (!isEditMode.value) {
      resetForm({ values: defaultInitialValues });
    }
    emit("close");
  };

  const submitContent = async (
    values: any,
    options: { isDraft?: boolean; isPublished?: boolean } = {},
  ) => {
    try {
      loading.value = true;
      formError.value = "";

      const isExercise = Number(values.contentType) === 4;
      const requestData: Record<string, unknown> = {
        contentType: values.contentType,
        title: values.title,
        categoryId: values.categoryId,
        themeIds: values.themeIds,
        ageGroupIds: values.ageGroupIds,
        tags: normalizeTagsInput(values.tags),
        linkedSkillIds: values.linkedSkillIds,
        labels: values.labels || [],
        isDraft: options.isDraft ?? false,
        isPublished: options.isPublished ?? true,
      };

      if (isExercise) {
        requestData.description = mergeExerciseDescription(
          values.easierExercise,
          values.difficultExercise,
        );
        requestData.easierExercise = values.easierExercise;
        requestData.difficultExercise = values.difficultExercise;
        requestData.levelId = values.levelId;
      } else {
        requestData.description = values.description || "";
      }

      let result;
      if (isEditMode.value) {
        loader.setLoading(true, t("loading.updatingContent"));
        result = await libraryService.updateContent(
          props.contentData?.id!,
          props.contentData?.contentType!,
          requestData,
        );
      } else {
        loader.setLoading(true, t("loading.creatingContent"));
        result = await libraryService.createContent(requestData);
      }

      if (result.success) {
        const { data } = result;
        const entity = unwrapLibraryEntity(data);
        const ct = Number(values.contentType);
        const needsMediaSync =
          mediaFiles.value.length > 0 || deletedMediaFileIds.value.length > 0;

        if (needsMediaSync) {
          const created = entity as {
            id?: number;
            isDraft?: boolean;
            isPublished?: boolean;
            media?: Array<{ id?: number }>;
          };
          const contentId = isEditMode.value
            ? props.contentData!.id!
            : Number(created.id);
          if (
            !isEditMode.value &&
            (!Number.isFinite(contentId) || contentId <= 0)
          ) {
            formError.value = t("Academy.library.errorSavingFile");
            return { success: false, error: formError.value };
          }
          const isDraft =
            options.isDraft ??
            (isEditMode.value
              ? props.contentData?.isDraft === true
              : created.isDraft === true);
          const isPublished =
            options.isPublished ??
            (isEditMode.value
              ? props.contentData?.isPublished === true
              : created.isPublished !== false);

          try {
            loader.setLoading(true, t("loading.savingFile"));
            const mediaFromApi = created.media?.[0]?.id;
            const fd = buildMediaFormData(values, mediaFiles.value, {
              isDraft,
              isPublished,
              mediaBundleId: isEditMode.value
                ? props.contentData?.media?.[0]?.id
                : mediaFromApi,
            });
            const fileResult = await libraryService.createUpdateContentFile(
              contentId,
              ct,
              fd,
            );
            if (!fileResult.success) {
              formError.value =
                fileResult.error || t("Academy.library.errorSavingFile");
              return fileResult;
            }
            invalidateContent(contentId);
          } finally {
            loader.setLoading(false);
          }
          mediaFiles.value = [];
          deletedMediaFileIds.value = [];
        }

        if (isEditMode.value && props.contentData?.id) {
          invalidateContent(props.contentData.id);
        }
        if (values.contentType && Number(values.contentType) === 1) {
          referenceDataStore.clearSkillsCache();
        }
        emit("contentCreatedUpdated", values.title, isEditMode.value, entity);
        return result;
      } else {
        formError.value = result.error || t("forms.failedToSaveContent");
        console.error(
          "❌ Error:",
          result.error || t("forms.failedToSaveContent"),
        );
        return result;
      }
    } catch (error) {
      formError.value =
        error instanceof Error
          ? error.message
          : isEditMode.value
            ? t("Academy.library.errorUpdatingContent")
            : t("Academy.library.errorCreatingContent");
      console.error("Form submission error:", formError.value);
      return { success: false, error: formError.value };
    } finally {
      loading.value = false;
      loader.setLoading(false);
    }
  };

  const onSubmit = handleSubmit(
    async (values) => {
      return await submitContent(
        values,
        values.contentType === 5 ? {} : { isDraft: false, isPublished: true },
      );
    },
    (errors) => {
      console.error("❌ Form validation failed!");
      console.error("Validation errors:", errors);
      return { success: false, error: "Validation failed" };
    },
  );

  const onSaveAsDraft = handleSubmit(
    async (values) => {
      return await submitContent(
        values,
        values.contentType === 5 ? {} : { isDraft: true, isPublished: false },
      );
    },
    (errors) => {
      console.error("❌ Form validation failed!");
      console.error("Validation errors:", errors);
      return { success: false, error: "Validation failed" };
    },
  );

  return {
    loading,
    formError,
    isSubmitting,
    contentType,
    title,
    description,
    easierExercise,
    difficultExercise,
    categoryId,
    themeIds,
    levelId,
    ageGroupIds,
    tags,
    linkedSkillIds,
    labels,
    mediaFiles,
    existingFilesForUpload,
    onExistingMediaRemoved,
    actionButtonText,
    actionLoadingText,
    fieldErrors,
    onSubmit,
    onSaveAsDraft,
    clearFormError,
    handleModalClose,
  };
};
