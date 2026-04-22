import { computed, reactive } from "vue";

interface LayoutConfig {
  darkTheme: boolean;
}

interface LayoutState {
  staticMenuDesktopInactive: boolean;
  profileSidebarVisible: boolean;
  configSidebarVisible: boolean;
  staticMenuMobileActive: boolean;
  menuHoverActive: boolean;
  activeMenuItem: string | null;
}

const layoutConfig = reactive<LayoutConfig>({
  darkTheme: false,
});

const layoutState = reactive<LayoutState>({
  staticMenuDesktopInactive: false,
  profileSidebarVisible: false,
  configSidebarVisible: false,
  staticMenuMobileActive: false,
  menuHoverActive: false,
  activeMenuItem: null,
});

export function useLayout() {
  const setActiveMenuItem = (item: { value?: string } | string | null) => {
    if (item === null) {
      layoutState.activeMenuItem = null;
    } else if (typeof item === "object" && item !== null && item.value) {
      layoutState.activeMenuItem = item.value;
    } else {
      layoutState.activeMenuItem = item as string;
    }
  };

  const toggleDarkMode = () => {
    if (!(document as any).startViewTransition) {
      executeDarkModeToggle();

      return;
    }

    (document as any).startViewTransition(() => executeDarkModeToggle());
  };

  const executeDarkModeToggle = () => {
    layoutConfig.darkTheme = !layoutConfig.darkTheme;
    document.documentElement.classList.toggle("app-dark");
  };

  const toggleMenu = () => {
    if (window.innerWidth > 991) {
      layoutState.staticMenuDesktopInactive =
        !layoutState.staticMenuDesktopInactive;
    } else {
      layoutState.staticMenuMobileActive = !layoutState.staticMenuMobileActive;
    }
  };

  const isSidebarActive = computed(() => layoutState.staticMenuMobileActive);

  const isDarkTheme = computed(() => layoutConfig.darkTheme);

  return {
    layoutConfig,
    layoutState,
    toggleMenu,
    isSidebarActive,
    isDarkTheme,
    setActiveMenuItem,
    toggleDarkMode,
  };
}
