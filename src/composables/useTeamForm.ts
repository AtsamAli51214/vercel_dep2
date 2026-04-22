import { ref, computed, watch } from "vue";
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import { useI18n } from "vue-i18n";
import { createTeamSchema } from "@/utils/validation";
import { teamService } from "@/services";
import type { TeamFormItem, TeamData } from "@/types";

interface UseTeamFormProps {
  teamData?: TeamData;
  isViewOnly?: boolean;
}

type UseTeamFormEmit = (
  event: "close" | "teamCreatedUpdated",
  ...args: unknown[]
) => void;

export const useTeamForm = (props: UseTeamFormProps, emit: UseTeamFormEmit) => {
  const { t } = useI18n();

  const loading = ref(false);
  const formError = ref("");

  const isEditMode = computed(() => {
    return props.teamData?.teams && props.teamData.teams.length > 0;
  });

  const schema = toTypedSchema(createTeamSchema(t));

  const defaultInitialValues = {
    clubId: undefined as number | undefined,
    ageCategoryId: undefined as number | undefined,
    teams: [{ name: "" }] as TeamFormItem[],
  };

  const getInitialValues = () => {
    if (!props.teamData || !isEditMode.value) {
      return defaultInitialValues;
    }

    return {
      clubId: props.teamData.clubId,
      ageCategoryId: props.teamData.ageGroupId,
      teams: props.teamData.teams?.map((t) => ({ ...t })) || [],
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
    initialValues: getInitialValues(),
    validateOnMount: false,
  });

  const [clubId] = defineField("clubId");
  const [ageCategoryId] = defineField("ageCategoryId");
  const [teams] = defineField("teams");

  watch(
    [() => props.teamData, () => props.isViewOnly],
    () => {
      formError.value = "";
      const initialValues = getInitialValues();
      resetForm({ values: initialValues });
    },
    { immediate: true, deep: true },
  );

  const clearFormError = () => {
    formError.value = "";
  };

  const addTeam = () => {
    if (!clubId.value || !ageCategoryId.value) {
      formError.value = t("validation.clubAndAgeCategoryRequired");
      return;
    }
    const currentTeams = teams.value || [];
    teams.value = [...currentTeams, { name: "" }];
    formError.value = "";
  };

  const removeTeam = (index: number) => {
    const currentTeams = teams.value || [];
    currentTeams.splice(index, 1);
    teams.value = [...currentTeams];
  };

  const updateTeamName = (index: number, name: string | undefined) => {
    if (name === undefined) return;
    const currentTeams = teams.value || [];
    currentTeams[index] = { ...currentTeams[index], name };
    teams.value = [...currentTeams];
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
          clubId: values.clubId,
          ageGroupId: values.ageCategoryId,
          teams: values.teams.map(
            (team: { name: string; id?: number | undefined }) => ({
              ...(team.id && { id: team.id }),
              name: team.name,
            }),
          ),
        };

        let result;
        const isEdit = isEditMode.value && props.teamData?.teams?.[0]?.id;
        result = isEdit
          ? await teamService.updateTeam(requestData)
          : await teamService.createTeam(requestData);

        if (result.success) {
          const { data } = result;
          handleModalClose();
          emit("teamCreatedUpdated", values.teams, isEditMode.value, data);
        } else {
          formError.value = result.error || t("forms.failedToSaveTeam");
          console.error(
            "❌ Error:",
            result.error || t("forms.failedToSaveTeam"),
          );
        }
      } catch (error) {
        formError.value =
          error instanceof Error
            ? error.message
            : isEditMode.value
              ? t("Management.teams.errorUpdatingTeam")
              : t("Management.teams.errorCreatingTeam");
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

  const fieldErrors = computed(() => {
    return errors.value;
  });

  const areAllTeamsValid = computed(() => {
    if (!teams.value || teams.value.length === 0) {
      return true;
    }
    const allNamesValid = teams.value.every(
      (team) => team.name && team.name.trim().length > 0,
    );
    const teamsError = errors.value.teams;
    const noValidationErrors =
      !teamsError ||
      (Array.isArray(teamsError) && teamsError.every((err) => !err));
    return allNamesValid && noValidationErrors;
  });

  return {
    loading,
    formError,
    isSubmitting,
    clubId,
    ageCategoryId,
    teams,
    isEditMode,
    fieldErrors,
    areAllTeamsValid,
    onSubmit,
    addTeam,
    removeTeam,
    updateTeamName,
    clearFormError,
    handleModalClose,
    setFieldValue,
  };
};
