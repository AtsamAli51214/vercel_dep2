<template>
  <div v-if="isCenteredLayout" class="centered-layout bg-hockey-food">
    <img :src="LogoIcon" class="mb-16 h-11" alt="logo" />
    <div class="w-full max-w-5xl">
      <LanguageSwitcher :authMode="true" class="mb-6" />
      <div class="bg-white rounded-2xl shadow-sm p-8 md:p-15">
        <RouterView
          class="content-container"
          @update:loading="handleLoadingUpdate"
        />
      </div>
      <BaseLoader :loading="loading" scoped />
    </div>
  </div>

  <div v-else class="auth-layout">
    <div class="">
      <div class="modal-container">
        <LanguageSwitcher :authMode="true" />
        <div class="modal">
          <div class="logo-container">
            <img :src="FaviconIcon" :alt="'HockeyFood'" />
          </div>
          <RouterView
            class="content-container"
            @update:loading="handleLoadingUpdate"
          />
        </div>
        <BaseLoader :loading="loading" scoped />
      </div>
    </div>
    <div class="login-visual">
      <img class="login-image" :src="LoginPageSide" alt="HockeyFood login" />
      <div class="gradient-overlay"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useRoute } from "vue-router";
import { BaseLoader } from "@/components/base";
import { FaviconIcon, LoginPageSide, LogoIcon } from "@/assets/images";
import LanguageSwitcher from "@/components/LanguageSwitcher.vue";

const loading = ref<boolean>(false);
const route = useRoute();

const centeredLayoutRoutes = ["linkExpired", "notfound", "alreadyCreated"];

const isCenteredLayout = computed(() => {
  return centeredLayoutRoutes.includes(route.name as string);
});

const handleLoadingUpdate = (value: boolean) => {
  loading.value = value;
};
</script>
<style scoped>
@import "@/assets/styles/components/login.css";
</style>
