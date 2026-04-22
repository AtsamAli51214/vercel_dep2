import { ref, inject, provide } from "vue";
import type { AppLoader } from "@/types";

const LOADER_KEY = Symbol("app-loader");

export const useAppLoader = () => {
  const loader = inject<AppLoader | undefined>(LOADER_KEY);

  if (!loader) {
    throw new Error(
      "useAppLoader must be used within a component that provides AppLoader"
    );
  }

  return loader;
};

export const provideAppLoader = (): AppLoader => {
  const loading = ref<boolean>(false);
  const message = ref<string>("");

  const setLoading = (value: boolean, msg?: string) => {
    loading.value = value;
    message.value = msg || "";
  };

  const loader: AppLoader = {
    loading,
    setLoading,
    message,
  };

  provide(LOADER_KEY, loader);

  return loader;
};
