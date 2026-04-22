<script setup lang="ts">
import { HomeIcon } from "@/assets/images";
import type { BreadcrumbItem } from "@/types/app";
import { useI18n } from "vue-i18n";

interface Props {
  items: BreadcrumbItem[];
}

const { t } = useI18n();

const home = {
  home: HomeIcon,
  title: t("Dashboard"),
  url: "/",
};

defineProps<Props>();
</script>

<template>
  <Breadcrumb
    :home="home"
    :model="items"
    class="p-0 breadcrumbs font-inter text-primary !text-xs"
  >
    <template #item="{ item }">
      <router-link
        v-if="item.url && item.home"
        :to="item.url"
        :title="item.title"
      >
        <img v-if="item.home" :src="item.home" />
        <span v-else :class="item.icon + ' !text-xs'">{{ item.name }}</span>
      </router-link>
      <span v-else class="!text-light-text" :title="item.title">{{
        item.name
      }}</span>
    </template>
    <template #separator> / </template>
  </Breadcrumb>
</template>

<style scoped></style>
