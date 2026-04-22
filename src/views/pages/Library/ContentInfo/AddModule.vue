<template>
  <div class="flex flex-col gap-6">
    <form @submit.prevent="onSubmit" class="flex flex-col gap-4">
      <div>
        <div class="font-medium mb-2.5">
          {{ t("Academy.library.moduleForm.formTitle") }}<span>*</span>
        </div>
        <InputText
          v-model="title"
          fluid
          :placeholder="t('Academy.library.moduleForm.formTitle')"
          :invalid="!!errors.title"
        />
        <small class="p-invalid" v-if="errors.title">
          {{ errors.title }}
        </small>
      </div>

      <div>
        <div class="font-medium mb-2.5">
          {{ t("Academy.library.moduleForm.formDescription") }}
        </div>
        <Textarea
          v-model="description"
          autoResize
          rows="3"
          fluid
          :placeholder="t('Academy.library.moduleForm.formDescription')"
          :invalid="!!errors.description"
        />
        <small class="p-invalid" v-if="errors.description">
          {{ errors.description }}
        </small>
      </div>

      <div class="flex gap-4 w-1/2">
        <Button
          :label="t('app.cancel')"
          @click="handleCancel"
          outlined
          :size="isEditMode ? undefined : 'small'"
          severity="secondary"
          fluid
        />
        <Button
          :label="
            (isEditMode ? t('app.update') : t('app.save')) +
            ' ' +
            t('Academy.library.courseContent.module')
          "
          type="submit"
          :loading="loading"
          :disabled="loading"
          fluid
          :size="isEditMode ? undefined : 'small'"
        />
      </div>

      <Message v-if="formError" severity="error">{{ formError }}</Message>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import { createModuleSchema } from "@/utils/validation";
import type { ModuleData } from "./types";

interface Props {
  moduleData?: ModuleData;
  courseId?: number;
}

const props = withDefaults(defineProps<Props>(), {
  moduleData: undefined,
  courseId: undefined,
});

const emit = defineEmits<{
  moduleSaved: [module: ModuleData];
  cancel: [];
  formChanged: [hasChanges: boolean];
}>();

const { t } = useI18n();

const loading = ref(false);
const formError = ref("");

const isEditMode = computed(() => !!props.moduleData?.id);

const defaultInitialValues = {
  title: "",
  description: "",
};

const getInitialValues = () => {
  if (!props.moduleData) {
    return defaultInitialValues;
  }

  return {
    title: props.moduleData.title || "",
    description: props.moduleData.description || "",
  };
};

const { defineField, handleSubmit, errors, resetForm, values } = useForm({
  validationSchema: toTypedSchema(createModuleSchema(t)),
  initialValues: getInitialValues(),
  validateOnMount: false,
});

const [title] = defineField("title");
const [description] = defineField("description");

watch(
  () => props.moduleData,
  () => {
    resetForm({
      values: getInitialValues() as any,
    });
  },
  { deep: true },
);

const hasUnsavedChanges = computed(() => {
  const titleChanged = values.title !== (props.moduleData?.title || "");
  const descriptionChanged =
    values.description !== (props.moduleData?.description || "");
  return titleChanged || descriptionChanged;
});

watch(
  hasUnsavedChanges,
  (hasChanges) => {
    emit("formChanged", hasChanges);
  },
  { immediate: true },
);

const handleCancel = () => {
  emit("cancel");
};

const onSubmit = handleSubmit(
  async (formValues) => {
    try {
      loading.value = true;
      formError.value = "";

      const moduleData: ModuleData = {
        id: props.moduleData?.id,
        uniqueId: props.moduleData?.uniqueId,
        title: formValues.title,
        description: formValues.description || "",
      };

      emit("moduleSaved", moduleData);

      if (!isEditMode.value) {
        resetForm();
      }
    } catch (error) {
      formError.value =
        error instanceof Error
          ? error.message
          : t("Academy.library.moduleForm.errorSavingModule");
      console.error("Module save error:", error);
    } finally {
      loading.value = false;
    }
  },
  (validationErrors) => {
    console.error("❌ Module form validation failed!");
    console.error("Validation errors:", validationErrors);
  },
);
</script>

<style scoped></style>
