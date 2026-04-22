import { computed } from "vue";
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import { useI18n } from "vue-i18n";
import { z } from "zod";
import type { LearningLineWeek } from "@/types";

export const useLearningLineWeekMetaForm = () => {
  const { t } = useI18n();

  const schema = toTypedSchema(
    z.object({
      weekName: z
        .string()
        .min(1, t("Academy.LearningLines.weekNameRequired"))
        .refine(
          (value) => value.trim().length > 0,
          t("Academy.LearningLines.weekNameRequired"),
        ),
      weekSummary: z.string().optional().or(z.literal("")),
      weekNotes: z.string().optional().or(z.literal("")),
    }),
  );

  const { defineField, errors, validate, setFieldValue, resetForm } = useForm({
    validationSchema: schema,
    initialValues: {
      weekName: "",
      weekSummary: "",
      weekNotes: "",
    },
    validateOnMount: false,
  });

  const [weekName] = defineField("weekName");
  const [weekSummary] = defineField("weekSummary");
  const [weekNotes] = defineField("weekNotes");

  const weekNameError = computed(() => errors.value.weekName);
  const weekSummaryError = computed(() => errors.value.weekSummary);
  const weekNotesError = computed(() => errors.value.weekNotes);

  const resetFromWeek = (week: LearningLineWeek | null) => {
    if (!week) {
      resetForm({
        values: {
          weekName: "",
          weekSummary: "",
          weekNotes: "",
        },
      });
      return;
    }

    setFieldValue("weekName", week.name || "");
    setFieldValue("weekSummary", week.description || "");
    setFieldValue("weekNotes", week.notes || "");
  };

  const getFormValues = () => ({
    weekName: weekName.value,
    weekSummary: weekSummary.value,
    weekNotes: weekNotes.value,
  });

  return {
    weekName,
    weekSummary,
    weekNotes,
    weekNameError,
    weekSummaryError,
    weekNotesError,
    errors,
    validate,
    resetFromWeek,
    getFormValues,
  };
};
