import { ref, computed } from "vue";
import { useI18n } from "vue-i18n";
import { createWeekContentItemSchema } from "@/utils/validation";
import type { LearningLineWeekContentItem } from "@/types";

type FieldErrors = Partial<
  Record<
    "contentType" | "contentId" | "skillIds" | "durationWeeks" | "tags",
    string
  >
>;

export const useLearningLineWeekContentItemDraft = () => {
  const { t } = useI18n();

  const draft = ref<LearningLineWeekContentItem | null>(null);
  const fieldErrors = ref<FieldErrors>({});

  const setDraftFromItem = (item: LearningLineWeekContentItem | null) => {
    if (!item) {
      draft.value = null;
      fieldErrors.value = {};
      return;
    }
    const fromLinked =
      item.linkedSkills?.map(
        (skill: { id: number; title: string }) => skill.id,
      ) ?? [];
    const explicit = item.skillIds;
    const hasExplicitSkillIds =
      explicit !== undefined && explicit !== null && Array.isArray(explicit);
    draft.value = {
      ...item,
      skillIds: hasExplicitSkillIds ? explicit : fromLinked,
    };
    fieldErrors.value = {};
  };

  const clearDraft = () => {
    draft.value = null;
    fieldErrors.value = {};
  };

  const createEmptyDraft = () => {
    draft.value = {
      contentType: null,
      contentId: null,
      tags: undefined,
      name: undefined,
      skillIds: [],
    };
    fieldErrors.value = {};
  };

  const updateDraftName = (
    getContentItemById: (type: number | null, id: number | null) => any,
  ) => {
    if (!draft.value || !draft.value.contentType || !draft.value.contentId) {
      return;
    }
    const contentItem = getContentItemById(
      draft.value.contentType,
      draft.value.contentId,
    );
    if (contentItem?.title) {
      draft.value.name = contentItem.title;
    }
  };

  const validateDraft = (): { valid: boolean; fieldErrors: FieldErrors } => {
    if (!draft.value) {
      return { valid: false, fieldErrors: {} };
    }

    try {
      const schema = createWeekContentItemSchema(t);
      schema.parse(draft.value);
      fieldErrors.value = {};
      return { valid: true, fieldErrors: {} };
    } catch (error: any) {
      const errors: FieldErrors = {};

      if (error.errors && Array.isArray(error.errors)) {
        for (const err of error.errors) {
          const path = err.path?.[0];
          if (path && typeof path === "string") {
            errors[path as keyof FieldErrors] = err.message;
          }
        }
      }

      fieldErrors.value = errors;
      return { valid: false, fieldErrors: errors };
    }
  };

  const hasErrors = computed(() => Object.keys(fieldErrors.value).length > 0);

  return {
    draft,
    fieldErrors,
    hasErrors,
    setDraftFromItem,
    clearDraft,
    createEmptyDraft,
    updateDraftName,
    validateDraft,
  };
};
