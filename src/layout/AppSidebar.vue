<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import AppMenu from "./AppMenu.vue";
import AppMenuItem from "./AppMenuItem.vue";
import { authService } from "@/services";
import { getUserInfo } from "@/utils/helpers";
import { ROLES } from "@/constants/roles";

const { t } = useI18n();
const router = useRouter();

const userSession = getUserInfo();
const fullName = userSession?.fullName;
const userRole = userSession?.roles?.[0];
const user = ref({
  name: fullName,
  role:
    userRole === ROLES.SUPER_ADMIN
      ? t("navigation.superAdmin")
      : t("navigation.clubAdmin"),
  avatar: null,
  initials: fullName?.charAt(0),
});

const userMenuItem = ref({
  label: user.value.name,
  role: user.value.role,
  avatar: user.value.avatar,
  initials: user.value.initials,
  isUserProfile: true,
  items: [
    // {
    //   label: t("app.settings"),
    //   icon: "pi pi-cog",
    //   command: () => {
    //     router.push("/settings");
    //   },
    // },
    {
      label: t("app.logout"),
      icon: "pi pi-sign-out",
      command: () => {
        authService.logout();
      },
    },
  ],
});
</script>

<template>
  <div class="layout-sidebar">
    <router-link
      to="/"
      class="h-20 flex justify-center items-center cursor-pointer mb-3"
    >
      <img src="@/assets/images/logo.svg" class="py-4" alt="logo" />
    </router-link>
    <AppMenu :userSession="userSession" />
    <Divider
      :pt="{
        root: {
          class: 'my-6! mx-6! w-50!',
        },
      }"
    />

    <ul class="layout-menu px-6">
      <AppMenuItem :item="userMenuItem" :index="999" />
    </ul>
  </div>
</template>

<style lang="scss" scoped></style>
