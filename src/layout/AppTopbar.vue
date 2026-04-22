<script setup>
import { useI18n } from "vue-i18n";
import { useLayout } from "@/layout/composables/layout";
import { useRouteBreadcrumbs } from "@/composables/useRouteBreadcrumbs";
import BreadCrumbs from "@/components/BreadCrumbs.vue";
import CardTitle from "@/components/CardTitle.vue";
import LanguageSwitcher from "@/components/LanguageSwitcher.vue";

const { toggleMenu, toggleDarkMode, isDarkTheme } = useLayout();
const { t } = useI18n();
const { title, breadcrumbs } = useRouteBreadcrumbs();
</script>

<template>
  <div class="layout-topbar">
    <div class="layout-topbar-logo-container">
      <!-- <button
        class="layout-menu-button layout-topbar-action md:!hidden!"
        @click="toggleMenu"
      >
        <i class="pi pi-bars"></i>
      </button> -->
      <div class="flex flex-col">
        <BreadCrumbs :items="breadcrumbs" />
        <CardTitle :title="title" />
      </div>
    </div>

    <div class="layout-topbar-actions">
      <button
        class="layout-topbar-menu-button layout-topbar-action"
        v-styleclass="{
          selector: '@next',
          enterFromClass: 'hidden',
          enterActiveClass: 'animate-scalein',
          leaveToClass: 'hidden',
          leaveActiveClass: 'animate-fadeout',
          hideOnOutsideClick: true,
        }"
      >
        <i class="pi pi-ellipsis-v"></i>
      </button>

      <div class="layout-topbar-menu hidden lg:block">
        <div class="layout-topbar-menu-content">
          <LanguageSwitcher />
        </div>
      </div>
    </div>
  </div>
</template>

<strong></strong>

<style scoped></style>
