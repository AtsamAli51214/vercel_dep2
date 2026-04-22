<template>
  <div class="p-4 h-[50vh] flex flex-col items-center justify-center">
    <div class="mb-3 text-center">
      <h1 class="mb-3 text-5xl font-bold text-primary!">
        {{ t("auth.notFound.title") }}
      </h1>
      <img :src="Illustration3" alt="Not Found" />
    </div>

    <div class="flex items-center justify-center gap-4 w-70 md:w-100">
      <Button :label="t('auth.back')" outlined @click="router.back()" fluid />
      <Button
        :label="t('auth.notFound.goToHome')"
        @click="router.push('/')"
        fluid
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { Illustration3 } from "@/assets/images";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";

const router = useRouter();
const { t } = useI18n();
</script>

<style scoped></style>
