<template>
  <div class="content-container">
    <div class="text-center">
      <h1 class="title">{{ pageTitle }}</h1>
      <p class="subtitle">{{ pageSubtitle }}</p>
    </div>
    <form class="form" @submit.prevent="onSubmit">
      <div class="">
        <div class="font-medium mb-2.5">
          {{ t("auth.createPassword.newPassword") }}
        </div>
        <Password
          v-model="newPassword"
          :placeholder="t('auth.createPassword.newPassword')"
          :invalid="!!newPasswordError || !!formError"
          :feedback="false"
          toggleMask
          fluid
        />
      </div>
      <div class="">
        <div class="font-medium mb-2.5">
          {{ t("auth.createPassword.confirmPassword") }}
        </div>
        <Password
          v-model="confirmPassword"
          :placeholder="t('auth.createPassword.confirmPassword')"
          :invalid="!!confirmPasswordError || !!formError"
          :feedback="false"
          toggleMask
          fluid
        />
        <small class="p-invalid" v-if="displayError">
          {{ displayError }}
        </small>

        <div class="flex flex-col gap-2 mt-4">
          <div class="flex flex-col gap-3">
            <div class="flex items-center gap-2">
              <RadioButton
                v-model="minLengthMet"
                inputId="minLength"
                size="small"
                binary
                readonly
              />
              <label
                for="minLength"
                class="text-xs cursor-pointer"
                :class="minLengthMet ? 'text-primary' : 'text-stroke'"
              >
                {{ t("auth.errors.passwordReqMinLength") }}
              </label>
            </div>
            <div class="flex items-center gap-2">
              <RadioButton
                v-model="uppercaseMet"
                readonly
                binary
                inputId="uppercase"
                size="small"
              />
              <label
                for="uppercase"
                class="text-xs cursor-pointer"
                :class="uppercaseMet ? 'text-primary' : 'text-stroke'"
              >
                {{ t("auth.errors.passwordReqUppercase") }}
              </label>
            </div>
            <div class="flex items-center gap-2">
              <RadioButton
                v-model="specialMet"
                inputId="special"
                size="small"
                binary
                readonly
              />
              <label
                for="special"
                class="text-xs cursor-pointer"
                :class="specialMet ? 'text-primary' : 'text-stroke'"
              >
                {{ t("auth.errors.passwordReqSpecial") }}
              </label>
            </div>
          </div>
        </div>
      </div>
      <Button
        class="mt-4"
        type="submit"
        :label="buttonLabel"
        :disabled="!isFormValid || loading || isSubmitting"
      />
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import { passwordFormSchema } from "@/utils/validation";
import { authService, userService } from "@/services";
import { useGlobalDialog } from "@/composables/useGlobalDialog";

const emit = defineEmits<{
  "update:loading": [value: boolean];
}>();

const loading = ref<boolean>(false);
const formError = ref<string>("");
const route = useRoute();
const router = useRouter();
const { t } = useI18n();
const dialog = useGlobalDialog();

const token = ref("");
const isResetPassword = computed(() => route.name === "resetPassword");

const pageTitle = computed(() =>
  isResetPassword.value
    ? t("auth.resetPassword.title")
    : t("auth.createPassword.title"),
);

const pageSubtitle = computed(() =>
  isResetPassword.value
    ? t("auth.resetPassword.subtitle")
    : t("auth.createPassword.subtitle"),
);

const buttonLabel = computed(() =>
  isResetPassword.value ? t("app.resetPassword") : t("app.createPassword"),
);

onMounted(() => {
  const routeToken = (route.query.token as string)?.replace(/ /g, "+");
  token.value = routeToken;
});

const { handleSubmit, isSubmitting, defineField, errors, setFieldError } =
  useForm({
    validationSchema: toTypedSchema(passwordFormSchema(t)),
    initialValues: {
      newPassword: "",
      confirmPassword: "",
    },
    validateOnMount: false,
  });

const [newPassword] = defineField("newPassword");
const [confirmPassword] = defineField("confirmPassword");
const newPasswordError = computed(() => errors.value.newPassword);
const confirmPasswordError = computed(() => errors.value.confirmPassword);

const displayError = computed(() => {
  return (
    formError.value ||
    newPasswordError.value ||
    confirmPasswordError.value ||
    ""
  );
});

watch([newPassword, confirmPassword], () => {
  if (formError.value) formError.value = "";
});

const minLengthMet = computed(() => (newPassword.value || "").length >= 8);
const uppercaseMet = computed(() => /[A-Z]/.test(newPassword.value || ""));
const specialMet = computed(() => /[^A-Za-z0-9]/.test(newPassword.value || ""));
const requirementsMet = computed(
  () => minLengthMet.value && uppercaseMet.value && specialMet.value,
);
const isFormValid = computed(() => {
  const np = (newPassword.value || "").trim();
  const cp = (confirmPassword.value || "").trim();
  if (!np || !cp) return false;
  if (!requirementsMet.value) return false;
  return np === cp;
});

watch(loading, (newValue) => {
  emit("update:loading", newValue);
});

const onSubmit = handleSubmit(async (values) => {
  loading.value = true;
  formError.value = "";

  try {
    const payload = {
      token: token.value,
      password: values.newPassword,
      confirmPassword: values.confirmPassword,
    };
    const response = await userService.createPassword(payload);

    if (response.success) {
      dialog.showSuccess(
        t("auth.success.passwordCreatedTitle"),
        t("auth.success.passwordCreatedMessage"),
        t("auth.goToLogin"),
        () => {
          authService.logout();
          router.push("/auth/login");
        },
      );
    } else {
      setFieldError("newPassword", response.error || t("error.loginError"));
    }
  } catch (err: any) {
    setFieldError("newPassword", t("auth.errors.invalidCredentialsRetry"));
  } finally {
    loading.value = false;
  }
});
</script>
<style scoped>
@import "@/assets/styles/components/login.css";
</style>
