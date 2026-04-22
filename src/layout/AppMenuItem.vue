<script setup>
import { useLayout } from "@/layout/composables/layout";
import { computed, onBeforeMount, ref, watch } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();

const { layoutState, setActiveMenuItem, toggleMenu } = useLayout();

const props = defineProps({
  item: {
    type: Object,
    default: () => ({}),
  },
  index: {
    type: Number,
    default: 0,
  },
  parentItemKey: {
    type: String,
    default: null,
  },
});

const isActiveMenu = ref(false); // Controls if submenu is open
const isExactActive = ref(false); // Only true when this exact item is active (not parent of active)
const itemKey = ref(null);
const isActiveRoute = ref(false);
const hasActiveChildRoute = ref(false); // True if any child route is active

// Check if any child is active
function hasActiveChild(items) {
  if (!items) return false;
  return items.some((child) => {
    if (child.to) {
      return checkActiveRoute(child);
    }
    return false;
  });
}

// Find and set active menu item based on current route
function findAndSetActiveMenuItem() {
  // Check if this item's route is active (exact match - highest priority, always set)
  if (props.item.to && !props.item.items && checkActiveRoute(props.item)) {
    setActiveMenuItem(itemKey.value);
    return;
  }

  // Check if any child is active (parent match - set if no exact match exists yet)
  if (props.item.items && hasActiveChild(props.item.items)) {
    // Only set parent if no activeMenuItem is set yet (exact matches will set first)
    if (!layoutState.activeMenuItem) {
      setActiveMenuItem(itemKey.value);
    }
  }
}

onBeforeMount(() => {
  itemKey.value = props.parentItemKey
    ? props.parentItemKey + "-" + props.index
    : String(props.index);

  const activeItem = layoutState.activeMenuItem;
  isActiveRoute.value = props.item.to ? checkActiveRoute(props.item) : false;

  // Check if any child has an active route
  hasActiveChildRoute.value = props.item.items
    ? hasActiveChild(props.item.items)
    : false;

  // Find and set active menu item on mount if route matches
  findAndSetActiveMenuItem();

  // isActiveMenu: true if this item or any child is active (for keeping submenu open)
  isActiveMenu.value =
    activeItem === itemKey.value ||
    (activeItem ? activeItem.startsWith(itemKey.value + "-") : false);
  // isExactActive: true only if this exact item is active (for showing indicator)
  isExactActive.value = activeItem === itemKey.value;
});

watch(
  () => layoutState.activeMenuItem,
  (newVal) => {
    if (!newVal) {
      isActiveMenu.value = false;
      isExactActive.value = false;
    } else {
      isActiveMenu.value =
        newVal === itemKey.value || newVal.startsWith(itemKey.value + "-");
      isExactActive.value = newVal === itemKey.value;
    }
  }
);

watch(
  () => route.path,
  () => {
    isActiveRoute.value = props.item.to ? checkActiveRoute(props.item) : false;

    // Check if any child has an active route
    hasActiveChildRoute.value = props.item.items
      ? hasActiveChild(props.item.items)
      : false;

    // Recalculate active menu item on route change
    // Reset first to allow all items to check, then set the appropriate one
    const currentActive = layoutState.activeMenuItem;
    setActiveMenuItem(null);

    // Use setTimeout to allow all menu items to check their routes first
    setTimeout(() => {
      findAndSetActiveMenuItem();
      // Update isActiveMenu based on new route
      const activeItem = layoutState.activeMenuItem;
      isActiveMenu.value =
        activeItem === itemKey.value ||
        (activeItem ? activeItem.startsWith(itemKey.value + "-") : false);
      isExactActive.value = activeItem === itemKey.value;
    }, 10);
  }
);

function itemClick(event, item) {
  if (item.disabled) {
    event.preventDefault();
    return;
  }

  if (
    (item.to || item.url) &&
    (layoutState.staticMenuMobileActive || layoutState.overlayMenuActive)
  ) {
    toggleMenu();
  }

  if (item.command) {
    item.command({ originalEvent: event, item: item });
  }

  if (item.items) {
    // Toggle submenu: if active, close it; if not active, open it
    const newActiveKey = isActiveMenu.value
      ? props.parentItemKey || null
      : itemKey.value;
    setActiveMenuItem(newActiveKey);
  } else {
    // For items without submenu, just set active
    setActiveMenuItem(itemKey.value);
  }
}

function checkActiveRoute(item) {
  return new RegExp(`^${item.to}(/|$)`).test(route.path);
}

// Determine if item should show active icon
const isItemActive = computed(() => {
  // For items with children, show active when a child route is active
  if (props.item.items) {
    return hasActiveChildRoute.value;
  }
  // For regular items, show active when exact match or route matches
  return isExactActive.value || isActiveRoute.value;
});

// Get the icon component to display
const iconComponent = computed(() => {
  if (props.item.activeIcon && isItemActive.value) {
    return props.item.activeIcon;
  }
  if (props.item.inactiveIcon && !isItemActive.value) {
    return props.item.inactiveIcon;
  }
  return null;
});
</script>

<template>
  <li
    :class="{
      'active-menuitem': isActiveMenu,
      'has-active-child': hasActiveChildRoute,
    }"
  >
    <!-- User Profile Menu Item -->
    <a
      v-if="item.isUserProfile && item.visible !== false"
      @click="itemClick($event, item, index)"
      :class="[item.class, 'user-profile-item']"
      tabindex="0"
    >
      <div class="flex items-center gap-3 flex-1">
        <Avatar
          :image="item.avatar"
          :label="item.avatar ? undefined : item.initials"
          shape="circle"
          :pt="{
            root: {
              class: `${!item.avatar ? '!bg-primary' : ''} !text-white`,
            },
          }"
        />
        <div class="flex-1 min-w-0">
          <div class="font-semibold text-sm truncate">
            {{ item.label }}
          </div>
          <div class="text-xs text-surface-500 truncate">
            {{ item.role }}
          </div>
        </div>
      </div>
      <i
        class="pi pi-fw pi-angle-down layout-submenu-toggler"
        v-if="item.items"
      />
    </a>

    <!-- Regular Menu Item -->
    <a
      v-else-if="(!item.to || item.items) && item.visible !== false"
      :href="item.url"
      @click="itemClick($event, item, index)"
      :class="[item.class, { 'active-parent': hasActiveChildRoute }]"
      :target="item.target"
      tabindex="0"
    >
      <img
        v-if="iconComponent"
        :src="iconComponent"
        class="layout-menuitem-icon w-5 h-5"
      />
      <i v-else :class="item.icon" class="layout-menuitem-icon" />
      <span>{{ item.label }}</span>
      <i
        class="pi pi-fw pi-angle-down layout-submenu-toggler"
        v-if="item.items"
      />
    </a>
    <router-link
      v-if="item.to && !item.items && item.visible !== false"
      @click="itemClick($event, item, index)"
      :class="[
        item.class,
        {
          'active-route': checkActiveRoute(item),
          'active-indicator': isExactActive || isActiveRoute,
        },
      ]"
      tabindex="0"
      :to="item.to"
    >
      <img
        v-if="iconComponent"
        :src="iconComponent"
        class="layout-menuitem-icon w-5 h-5"
      />
      <i v-else :class="item.icon" class="layout-menuitem-icon" />
      <span>{{ item.label }}</span>
      <i
        class="pi pi-fw pi-angle-down layout-submenu-toggler"
        v-if="item.items"
      />
    </router-link>
    <Transition
      v-if="item.items && item.visible !== false"
      name="layout-submenu"
    >
      <ul v-show="isActiveMenu" class="layout-submenu">
        <AppMenuItem
          v-for="(child, i) in item.items"
          :key="child"
          :index="i"
          :item="child"
          :parentItemKey="itemKey"
        />
      </ul>
    </Transition>
  </li>
</template>

<style scoped></style>
