import { computed } from "vue";
import { useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
import type { BreadcrumbItem } from "@/types/app";

export const useRouteBreadcrumbs = () => {
  const route = useRoute();
  const { t } = useI18n();

  // Extract title from current route meta (use pageTitle if available, fallback to breadcrumbTitle, then title)
  const title = computed(() => {
    const meta = route.meta;
    if (meta?.pageTitle) {
      const key = meta.pageTitle as string;
      // Try to translate, fallback to key if translation doesn't exist
      try {
        const translated = t(key);
        // If translation returns the key itself, it means the key doesn't exist
        return translated !== key
          ? translated
          : (meta?.breadcrumbTitle as string) || (meta?.title as string) || "";
      } catch {
        return (
          (meta?.breadcrumbTitle as string) || (meta?.title as string) || ""
        );
      }
    }
    if (meta?.breadcrumbTitle) {
      const key = meta.breadcrumbTitle as string;
      // Try to translate, fallback to key if translation doesn't exist
      try {
        const translated = t(key);
        // If translation returns the key itself, it means the key doesn't exist
        return translated !== key ? translated : (meta?.title as string) || "";
      } catch {
        return (meta?.title as string) || "";
      }
    }
    return (meta?.title as string) || "";
  });

  // Build breadcrumbs from matched routes
  const breadcrumbs = computed<BreadcrumbItem[]>(() => {
    const items: BreadcrumbItem[] = [];

    // Skip the root AppLayout route and auth routes
    const matchedRoutes = route.matched.filter(
      (r) =>
        r.meta &&
        r.meta.title &&
        r.meta.breadcrumbTitle &&
        r.path !== "/" &&
        !r.path.startsWith("/auth")
    );

    matchedRoutes.forEach((matchedRoute, index) => {
      const meta = matchedRoute.meta;
      const breadcrumbTitle = meta?.breadcrumbTitle as string | undefined;
      const routeTitle = meta?.title as string | undefined;

      if (breadcrumbTitle || routeTitle) {
        // Only add link if it's not the last item
        const isLast = index === matchedRoutes.length - 1;
        let displayName = "";

        if (breadcrumbTitle) {
          try {
            const translated = t(breadcrumbTitle);
            // If translation returns the key itself, it means the key doesn't exist
            displayName =
              translated !== breadcrumbTitle ? translated : routeTitle || "";
          } catch {
            displayName = routeTitle || "";
          }
        } else {
          displayName = routeTitle || "";
        }

        items.push({
          name: displayName,
          url: isLast ? undefined : matchedRoute.path,
          title: displayName,
        });
      }
    });

    return items;
  });

  return {
    title,
    breadcrumbs,
  };
};
