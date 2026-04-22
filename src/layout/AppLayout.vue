<script setup>
import { useLayout } from "@/layout/composables/layout";
import { computed, ref, watch } from "vue";
import AppFooter from "./AppFooter.vue";
import AppSidebar from "./AppSidebar.vue";
import AppTopbar from "./AppTopbar.vue";
import { provideAppLoader } from "@/composables";
import { BaseLoader } from "@/components/base";

const { layoutConfig, layoutState, isSidebarActive } = useLayout();

const loader = provideAppLoader();

const isLoading = computed(() => loader.loading.value);
const loaderMessage = computed(() => loader.message.value);

const outsideClickListener = ref(null);

watch(isSidebarActive, (newVal) => {
  if (newVal) {
    bindOutsideClickListener();
  } else {
    unbindOutsideClickListener();
  }
});

const containerClass = computed(() => {
  return {
    "layout-static": true,
    "layout-static-inactive": layoutState.staticMenuDesktopInactive,
    "layout-mobile-active": layoutState.staticMenuMobileActive,
  };
});

function bindOutsideClickListener() {
  if (!outsideClickListener.value) {
    outsideClickListener.value = (event) => {
      if (isOutsideClicked(event)) {
        layoutState.overlayMenuActive = false;
        layoutState.staticMenuMobileActive = false;
        layoutState.menuHoverActive = false;
      }
    };
    document.addEventListener("click", outsideClickListener.value);
  }
}

function unbindOutsideClickListener() {
  if (outsideClickListener.value) {
    document.removeEventListener("click", outsideClickListener);
    outsideClickListener.value = null;
  }
}

function isOutsideClicked(event) {
  const sidebarEl = document.querySelector(".layout-sidebar");
  const topbarEl = document.querySelector(".layout-menu-button");

  return !(
    sidebarEl.isSameNode(event.target) ||
    sidebarEl.contains(event.target) ||
    topbarEl.isSameNode(event.target) ||
    topbarEl.contains(event.target)
  );
}
</script>

<template>
  <div class="layout-wrapper" :class="containerClass">
    <AppSidebar />
    <div class="layout-main-container relative">
      <AppTopbar />
      <div class="layout-main">
        <RouterView />
      </div>
      <BaseLoader :loading="isLoading" :message="loaderMessage" scoped />
    </div>
    <div class="layout-mask animate-fadein"></div>
  </div>
</template>
