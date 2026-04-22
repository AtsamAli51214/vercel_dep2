<template>
  <div class="content-container">
    <div class="text-center">
      <h1 class="title">{{ t("auth.resetPassword.title") }}</h1>
      <p class="subtitle">{{ t("auth.resetPassword.subtitle") }}</p>
    </div>
    <form class="form" @submit.prevent="onSubmit">
      <div class="">
        <div class="font-medium mb-2.5">
          {{ t("auth.resetPassword.formEmail") }}
        </div>
        <InputText
          v-model="email"
          type="email"
          fluid
          :placeholder="t('auth.resetPassword.formEmail')"
          :invalid="!!emailError"
        />
        <small class="p-invalid" v-if="emailError">
          {{ emailError }}
        </small>
      </div>
      <div class="flex items-center justify-center gap-2 mt-4">
        <Button
          :label="t('auth.back')"
          outlined
          @click="router.push('/auth/login')"
          fluid
        />
        <Button
          type="submit"
          :label="t('auth.send')"
          :disabled="loading || isSubmitting"
          fluid
        />
      </div>
    </form>

    <Message v-if="formError" severity="error">{{ formError }}</Message>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import { authService } from "@/services";
import { useGlobalDialog } from "@/composables/useGlobalDialog";
import { resetPasswordSchema } from "@/utils/validation";

const emit = defineEmits<{
  "update:loading": [value: boolean];
}>();

const loading = ref<boolean>(false);
const formError = ref<string>("");
const router = useRouter();
const { t } = useI18n();
const dialog = useGlobalDialog();

const { handleSubmit, isSubmitting, defineField, errors, setFieldError } =
  useForm({
    validationSchema: toTypedSchema(resetPasswordSchema(t)),
    initialValues: {
      email: "",
    },
    validateOnMount: false,
  });

const [email] = defineField("email");
const emailError = computed(() => errors.value.email as string | undefined);

watch(email, () => {
  if (formError.value) formError.value = "";
});

watch(loading, (newValue) => {
  emit("update:loading", newValue);
});

const onSubmit = handleSubmit(async (values) => {
  loading.value = true;
  formError.value = "";

  try {
    const response = await authService.forgotPassword({
      email: values.email,
      isCreatePassword: false,
    });
    if (response.success) {
      dialog.showSuccess(
        t("auth.resetPassword.successTitle"),
        t("auth.resetPassword.successMessage"),
        t("auth.goToLogin"),
        () => {
          router.push("/auth/login");
        },
      );
    } else {
      setFieldError("email", response.error || t("error.resetPasswordError"));
    }
  } catch (err: any) {
    let errorMessage = t("error.resetPasswordError");
    if (err.response?.status === 404) {
      errorMessage = t("error.emailNotFound");
    }
    setFieldError("email", errorMessage);
  } finally {
    loading.value = false;
  }
});
</script>
<style scoped>
@import "@/assets/styles/components/login.css";
</style>
