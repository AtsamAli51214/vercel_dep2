<template>
  <div class="sidebar">
    <div class="sidebar-content">
      <!-- Logo Section -->
      <div class="logo-section">
        <router-link to="/" class="logo-link">
          <img
            src="@/assets/images/logo.svg"
            :alt="t('app.name')"
            class="logo"
          />
        </router-link>
      </div>

      <!-- Navigation -->
      <nav class="navigation">
        <div class="nav-items">
          <div>
            <template v-for="(item, id) in sidebarItems" :key="id">
              <!-- Parent menu item with children -->
              <div v-if="item.children && item.children.length > 0">
                <div
                  class="nav-item nav-item-parent"
                  :class="{
                    expanded: expandedItems[id],
                  }"
                  @click="toggleExpand(id)"
                >
                  <div class="nav-item-content">
                    <img
                      v-if="item.icon"
                      :src="item.icon"
                      :alt="t(item.title)"
                      width="20"
                      height="20"
                      class="nav-icon"
                    />
                    <span class="nav-title">{{ t(item.title) }}</span>
                    <i
                      class="pi nav-chevron"
                      :class="
                        expandedItems[id] ? 'pi-chevron-up' : 'pi-chevron-down'
                      "
                    ></i>
                  </div>
                </div>
                <!-- Children menu items -->
                <div
                  v-show="expandedItems[id]"
                  class="nav-children"
                  :class="{ expanded: expandedItems[id] }"
                >
                  <router-link
                    v-for="(child, childId) in item.children"
                    :key="childId"
                    class="nav-item nav-item-child"
                    :class="{ active: isActiveRoute(child.path) }"
                    :to="child.path"
                    @click.stop
                  >
                    <div class="nav-item-content">
                      <span class="nav-title">{{ t(child.title) }}</span>
                    </div>
                  </router-link>
                </div>
              </div>
              <!-- Regular menu item without children -->
              <router-link
                v-else
                class="nav-item"
                :class="{ active: isActiveRoute(item.path) }"
                :to="item.path"
              >
                <div class="nav-item-content">
                  <img
                    v-if="item.icon"
                    :src="
                      isActiveRoute(item.path) && item.activeIcon
                        ? item.activeIcon
                        : item.icon
                    "
                    :alt="t(item.title)"
                    width="20"
                    height="20"
                    class="nav-icon"
                  />
                  <span class="nav-title">{{ t(item.title) }}</span>
                </div>
              </router-link>
            </template>
          </div>
        </div>
      </nav>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { getSidebarForRole, type SidebarItem } from "@/config/menu";
// import { authService } from "@/services";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
const route = useRoute();

// const userInfo = computed(() => authService.getUserInfo());

const sidebarItems = computed((): SidebarItem[] => {
  const userSession = localStorage.getItem("userSession");
  if (!userSession) return [];

  try {
    const session = JSON.parse(userSession) as { roles: string[] };
    return getSidebarForRole(session.roles[0] as any);
  } catch (e) {
    return [];
  }
});

// Track expanded state for parent menu items
const expandedItems = ref<Record<number, boolean>>({});

// Helper function to check if a route is active
const isActiveRoute = (itemPath: string) => {
  if (itemPath === "#") return false;
  if (route.path === itemPath) {
    return true;
  }
  if (itemPath !== "/" && route.path.startsWith(itemPath)) {
    return true;
  }

  return false;
};

// Helper function to check if any child is active
const hasActiveChild = (item: SidebarItem): boolean => {
  if (!item.children) return false;
  return item.children.some((child) => isActiveRoute(child.path));
};

// Toggle expand/collapse for parent menu items
const toggleExpand = (index: number) => {
  expandedItems.value[index] = !expandedItems.value[index];
};

// Auto-expand parent if any child is active
watch(
  () => route.path,
  () => {
    sidebarItems.value.forEach((item, index) => {
      if (item.children && hasActiveChild(item)) {
        expandedItems.value[index] = true;
      }
    });
  },
  { immediate: true }
);
</script>

<style lang="css" scoped>
@import "@/assets/styles/components/sidebar.css";
</style>
