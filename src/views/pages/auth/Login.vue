<template>
  <div class="content-container">
    <h1 class="title">{{ t("auth.login.title") }}</h1>
    <form class="form" @submit="onSubmit">
      <div class="">
        <IconField>
          <InputIcon
            class="pi pi-envelope"
            :class="{
              'p-invalid': emailError,
            }"
          />
          <InputText
            v-model="email"
            type="email"
            fluid
            :placeholder="t('auth.login.email')"
            :invalid="!!emailError"
          />
        </IconField>
        <small class="p-invalid" v-if="emailError">
          {{ emailError }}
        </small>
      </div>
      <div class="">
        <IconField>
          <InputIcon
            class="pi pi-lock"
            :class="{
              'p-invalid': passwordError,
            }"
          />
          <Password
            v-model="password"
            :placeholder="t('auth.login.password')"
            :invalid="!!passwordError"
            :feedback="false"
            toggleMask
            fluid
          />
        </IconField>
        <small class="p-invalid" v-if="passwordError">
          {{ passwordError }}
        </small>
      </div>
      <div class="flex items-center gap-2">
        <Checkbox v-model="rememberMe" :value="true" size="small" />
        <span class="text-sm"> {{ t("auth.login.rememberMe") }} </span>
      </div>
      <Button
        type="submit"
        :label="
          loading || isSubmitting ? t('loading.signingIn') : t('app.signIn')
        "
      />

      <div class="forgot-password">
        <router-link to="/auth/forgot-password" class="forgot-link">
          {{ t("auth.login.forgotPassword") }}
        </router-link>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import { loginSchema } from "@/utils/validation";
import { authService } from "@/services";

const emit = defineEmits<{
  "update:loading": [value: boolean];
}>();

const loading = ref<boolean>(false);
const rememberMe = ref<boolean>(false);
const loginError = ref<string>("");
const router = useRouter();
const { t } = useI18n();

const validationSchema = computed(() => toTypedSchema(loginSchema(t)));

const { handleSubmit, isSubmitting, defineField, errors, setFieldError } =
  useForm({
    validationSchema,
    initialValues: {
      email: "",
      password: "",
    },
    validateOnMount: false,
  });

const [email] = defineField<"email">("email");
const [password] = defineField<"password">("password");
const emailError = computed(() => errors.value.email as string | undefined);
const passwordError = computed(
  () => errors.value.password as string | undefined,
);

const clearError = (): void => {
  loginError.value = "";
  setFieldError("email", undefined);
  setFieldError("password", undefined);
};

watch([email, password], () => {
  if (loginError.value) {
    clearError();
  }
});

watch(loading, (newValue) => {
  emit("update:loading", newValue);
});

const onSubmit = handleSubmit(async (values) => {
  loading.value = true;
  clearError();

  try {
    const response = await authService.login({
      email: values.email,
      password: values.password,
    });

    if (response.success) {
      router.push("/");
    } else {
      loginError.value = response.error || "";
    }
  } catch (err: any) {
    console.error(err, "Login error");
    setFieldError("email", " ");
    setFieldError("password", t("auth.errors.invalidCredentials"));
  } finally {
    loading.value = false;
  }
});
</script>
<style scoped>
@import "@/assets/styles/components/login.css";
</style>
