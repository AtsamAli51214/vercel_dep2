<script setup>
import { ref, computed } from "vue";
import { useI18n } from "vue-i18n";
import AppMenuItem from "./AppMenuItem.vue";
import {
  UserIcon,
  UserIconActive,
  ClubIcon,
  ClubIconActive,
  ManagementIconActive,
  ManagementIcon,
  DashboardIcon,
  DashboardActiveIcon,
  AcademyIcon,
  AcademyIconActive,
} from "@/assets/images";
import { ROLES } from "@/constants/roles";

const { t } = useI18n();
const props = defineProps({
  userSession: {
    type: Object,
    required: true,
  },
});
const clubId = props.userSession?.clubId;
const userRole = props.userSession?.roles?.[0];

const menuItems = ref([
  {
    label: t("Dashboard"),
    activeIcon: DashboardActiveIcon,
    inactiveIcon: DashboardIcon,
    to:
      userRole === ROLES.SUPER_ADMIN ? "/" : `/pages/club/dashboard/${clubId}`,
    roles: [ROLES.SUPER_ADMIN, ROLES.CLUB_ADMIN],
  },
  {
    label: t("Clubs.title"),
    activeIcon: ClubIconActive,
    inactiveIcon: ClubIcon,
    to: "/pages/club",
    roles: [ROLES.SUPER_ADMIN],
  },
  {
    label: t("Users.title"),
    activeIcon: UserIconActive,
    inactiveIcon: UserIcon,
    to: "/pages/users",
    roles: [ROLES.SUPER_ADMIN, ROLES.CLUB_ADMIN],
  },
  {
    label: t("Management.title"),
    activeIcon: ManagementIconActive,
    inactiveIcon: ManagementIcon,
    items: [
      {
        label: t("Management.federations.title"),
        to: "/pages/federation",
        roles: [ROLES.SUPER_ADMIN],
      },
      {
        label: t("Management.suppliers.title"),
        to: "/pages/supplier",
        roles: [ROLES.SUPER_ADMIN],
      },
      {
        label: t("Management.ageCategories.title"),
        to: "/pages/ageCategory",
        roles: [ROLES.SUPER_ADMIN, ROLES.CLUB_ADMIN],
      },
      {
        label: t("Management.teams.title"),
        to: "/pages/team",
        roles: [ROLES.SUPER_ADMIN, ROLES.CLUB_ADMIN],
      },
    ],
  },
  {
    label: t("Academy.title"),
    activeIcon: AcademyIconActive,
    inactiveIcon: AcademyIcon,
    items: [
      {
        label: t("Academy.LearningLines.title"),
        to: "/pages/learningLines",
        roles: [ROLES.SUPER_ADMIN, ROLES.CLUB_ADMIN],
      },
      {
        label: t("Academy.library.title"),
        to: "/pages/library",
        roles: [ROLES.SUPER_ADMIN, ROLES.CLUB_ADMIN],
      },
    ],
  },
]);

const model = computed(() => {
  if (!userRole) return [];

  return menuItems.value
    .filter((item) => !item.roles || item.roles.includes(userRole))
    .map((item) => {
      if (item.items) {
        return {
          ...item,
          items: item.items.filter(
            (subItem) => !subItem.roles || subItem.roles.includes(userRole),
          ),
        };
      }
      return item;
    })
    .filter((item) => !item.items || item.items.length > 0);
});
</script>

<template>
  <ul class="layout-menu">
    <template v-for="(item, i) in model" :key="item">
      <AppMenuItem v-if="!item.separator" :item="item" :index="i" />
      <li v-if="item.separator" class="menu-separator"></li>
    </template>
  </ul>
</template>

<style lang="scss" scoped></style>
