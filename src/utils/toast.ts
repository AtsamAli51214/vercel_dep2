import { TFunction } from "@/types";

interface ToastMessage {
  severity?: "success" | "info" | "warn" | "error";
  summary?: string;
  detail?: string;
  life?: number;
  [key: string]: unknown;
}

interface ToastService {
  add: (message: ToastMessage) => void;
}

let toast: ToastService | null = null;

export const setToastInstance = (instance: ToastService): void => {
  toast = instance;
};

export const showWarning = (msg: string, t: TFunction): void => {
  if (toast) {
    toast.add({
      severity: "warn",
      summary: t("app.warning"),
      detail: msg,
      life: 3000,
    });
  }
};

export const showSuccess = (msg: string, t: TFunction): void => {
  if (toast) {
    toast.add({
      severity: "success",
      summary: t("app.success"),
      detail: msg,
      life: 3000,
    });
  }
};

export const showError = (msg: string, _: TFunction): void => {
  if (toast) {
    toast.add({
      severity: "error",
      // summary: t("app.error"),
      summary: "Error!",
      detail: msg,
      life: 3000,
    });
  }
};

export const showToast = (data: ToastMessage): void => {
  if (toast) {
    toast.add({
      ...data,
      life: 3000,
    });
  }
};
