<template>
  <div class="w-70 md:w-232 mx-auto">
    <div class="text-center flex flex-col items-center gap-6">
      <h1 class="text-5xl font-bold text-primary!">
        {{ t("auth.alreadyCreated.title") }}
      </h1>

      <div class="flex items-center justify-center">
        <img :src="Illustration2" alt="Link Expired" />
      </div>

      <p class="text-sm text-secondary-color">
        {{ t("auth.alreadyCreated.subtitle") }}
      </p>
    </div>

    <div class="flex items-center justify-center gap-4 md:w-100">
      <Button
        :label="t('auth.login.forgotPassword')"
        outlined
        @click="router.push('/auth/forgot-password')"
        fluid
      />
      <Button
        :label="t('auth.linkExpired.goToLogin')"
        @click="router.push('/auth/login')"
        fluid
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { Illustration2 } from "@/assets/images";

const router = useRouter();
const { t } = useI18n();
</script>

<style scoped>
@import "@/assets/styles/components/login.css";
</style>
