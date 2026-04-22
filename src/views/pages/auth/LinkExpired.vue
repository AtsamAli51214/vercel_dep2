<template>
  <div class="max-w-164! mx-auto">
    <div class="text-center flex flex-col items-center gap-6">
      <h1 class="text-5xl font-bold text-primary!">
        {{ t("auth.linkExpired.title") }}
      </h1>

      <div class="w-50 flex items-center justify-center">
        <img
          :src="Illustration1"
          alt="Link Expired"
          class="w-full h-full object-contain"
        />
      </div>

      <p class="text-sm text-secondary-color">
        {{ t("auth.linkExpired.subtitle") }}
      </p>
    </div>

    <form class="form max-w-100" @submit.prevent="onSubmit">
      <div class="">
        <div class="font-medium mb-2.5">
          {{ t("auth.linkExpired.formEmail") }}
        </div>
        <InputText
          v-model="email"
          type="email"
          fluid
          :placeholder="t('auth.resetPassword.formEmail')"
          :invalid="!!emailError"
          disabled
        />
        <small class="p-invalid" v-if="emailError">
          {{ emailError }}
        </small>
      </div>

      <div class="flex items-center justify-center gap-4">
        <Button
          :label="t('auth.linkExpired.goToLogin')"
          outlined
          @click="router.push('/auth/login')"
          fluid
          severity="secondary"
        />
        <Button
          type="submit"
          :label="t('auth.linkExpired.requestNewLink')"
          :disabled="loading || isSubmitting"
          fluid
        />
      </div>
    </form>

    <Message v-if="formError" severity="error">{{ formError }}</Message>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import { authService } from "@/services";
import { Illustration1 } from "@/assets/images";
import { useGlobalDialog } from "@/composables/useGlobalDialog";
import { resetPasswordSchema } from "@/utils/validation";

const emit = defineEmits<{
  "update:loading": [value: boolean];
}>();

const loading = ref<boolean>(false);
const formError = ref<string>("");
const router = useRouter();
const route = useRoute();
const { t } = useI18n();
const dialog = useGlobalDialog();

const {
  handleSubmit,
  isSubmitting,
  defineField,
  errors,
  setFieldError,
  setFieldValue,
} = useForm({
  validationSchema: toTypedSchema(resetPasswordSchema(t)),
  initialValues: {
    email: "",
  },
  validateOnMount: false,
});

const [email] = defineField("email");
const emailError = computed(() => errors.value.email as string | undefined);

onMounted(() => {
  const emailFromQuery = route.query.email as string | undefined;
  if (emailFromQuery) {
    setFieldValue("email", emailFromQuery);
  }
});

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
      isCreatePassword: true,
    });
    if (response.success) {
      dialog.showSuccess(
        t("auth.success.resetEmailSent"),
        t("auth.success.resetEmailSentMessage"),
        t("auth.goToLogin"),
        () => {
          router.push("/auth/login");
        },
      );
    } else {
      setFieldError("email", response.error || t("error.resetPasswordError"));
    }
  } catch (err: any) {
    setFieldError("email", t("auth.errors.invalidCredentialsRetry"));
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
@import "@/assets/styles/components/login.css";
</style>
