import { inject, provide, ref, type InjectionKey } from "vue";

type StatusType = "success" | "danger" | "warn" | "info";

interface DialogConfig {
  type: StatusType;
  title: string;
  message?: string;
  confirmButtonText?: string;
  cancelButtonText?: string;
  showConfirmButton?: boolean;
  showCancelButton?: boolean;
  onConfirm?: () => void;
  onCancel?: () => void;
}

const createDialogInstance = () => {
  const visible = ref(false);
  const config = ref<DialogConfig>({
    type: "success",
    title: "",
    showConfirmButton: false,
    showCancelButton: false,
  });

  const show = (dialogConfig: DialogConfig) => {
    config.value = {
      ...dialogConfig,
      confirmButtonText: dialogConfig.confirmButtonText || undefined,
      cancelButtonText: dialogConfig.cancelButtonText || undefined,
      showConfirmButton: dialogConfig.confirmButtonText ? true : false,
      showCancelButton: dialogConfig.cancelButtonText ? true : false,
    };
    visible.value = true;
  };

  const showSuccess = (
    title: string,
    message?: string,
    confirmButtonText?: string,
    onConfirm?: () => void
  ) => {
    show({
      type: "success",
      title,
      message,
      confirmButtonText,
      onConfirm,
    });
  };

  const showError = (
    title: string,
    message?: string,
    confirmButtonText?: string,
    cancelButtonText?: string,
    onConfirm?: () => void,
    onCancel?: () => void
  ) => {
    show({
      type: "danger",
      title,
      message,
      confirmButtonText,
      cancelButtonText,
      onConfirm,
      onCancel,
    });
  };

  const showWarning = (
    title: string,
    message?: string,
    cancelButtonText?: string,
    confirmButtonText?: string,
    onConfirm?: () => void,
    onCancel?: () => void
  ) => {
    show({
      type: "warn",
      title,
      message,
      confirmButtonText,
      cancelButtonText,
      onConfirm,
      onCancel,
    });
  };

  const showInfo = (
    title: string,
    message: string,
    confirmButtonText?: string,
    cancelButtonText?: string,
    onConfirm?: () => void
  ) => {
    show({
      type: "info",
      title,
      message,
      confirmButtonText,
      cancelButtonText,
      showCancelButton: false,
      onConfirm,
    });
  };

  const hide = () => {
    visible.value = false;
  };

  const handleConfirm = () => {
    if (config.value.onConfirm) {
      config.value.onConfirm();
    }
    hide();
  };

  const handleCancel = () => {
    if (config.value.onCancel) {
      config.value.onCancel();
    }
    hide();
  };

  return {
    visible,
    config,
    show,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    hide,
    handleConfirm,
    handleCancel,
  };
};

const GlobalDialogKey: InjectionKey<ReturnType<typeof createDialogInstance>> =
  Symbol("GlobalDialog");

export const provideGlobalDialog = () => {
  const dialog = createDialogInstance();
  provide(GlobalDialogKey, dialog);
  return dialog;
};

export const useGlobalDialog = () => {
  const dialog = inject(GlobalDialogKey);

  if (!dialog) {
    throw new Error(
      "useGlobalDialog must be used within a component that has provideGlobalDialog in its parent tree"
    );
  }

  return dialog;
};
