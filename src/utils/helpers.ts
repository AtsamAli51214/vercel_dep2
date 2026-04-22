import { TFunction } from "@/types";
import type { UserSession } from "@/types/services";
import moment from "moment";

export const deepEqual = (a: unknown, b: unknown): boolean => {
  if (a === b) return true;
  if (a == null || b == null) return false;

  if (typeof a !== typeof b) return false;

  if (typeof a !== "object") return a === b;

  if (Array.isArray(a) !== Array.isArray(b)) return false;
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (!deepEqual(a[i], b[i])) return false;
    }
    return true;
  }

  if (
    typeof a === "object" &&
    typeof b === "object" &&
    a !== null &&
    b !== null
  ) {
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);

    if (keysA.length !== keysB.length) return false;

    for (const key of keysA) {
      if (!keysB.includes(key)) return false;
      if (
        !deepEqual(
          (a as Record<string, unknown>)[key],
          (b as Record<string, unknown>)[key],
        )
      )
        return false;
    }
    return true;
  }

  return false;
};

export async function convertUrlToFile(
  imageUrl: string,
  filename = "image.jpg",
) {
  try {
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    return new File([blob], filename, { type: blob.type });
  } catch (error) {
    console.error("Error converting URL to File:", error);
    return null;
  }
}

export function formatDate(
  dateString: string | null | undefined,
  t: TFunction,
  formatString: string = "DD/MM/YYYY",
): string {
  if (!dateString) return t("app.notSpecified");
  const date = moment(dateString);
  return date.format(formatString);
}

export function formatMinutes(_minutes: number): string {
  const hours = Math.floor(_minutes / 60);
  const minutes = _minutes % 60;

  return `${hours} uur ${minutes} min`;
}

export function formatToISO(date: string, time: string): string {
  const dateTimeString = `${date}T${time}:00`;
  const dateObject = new Date(dateTimeString);
  return dateObject.toISOString();
}

export function timeAgo(timestamp: string, t: TFunction) {
  const past = new Date(timestamp).getTime();
  const now = Date.now();
  const diffMs = now - past;

  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;
  const week = 7 * day;

  if (diffMs < minute) {
    return t("app.justNow");
  }

  if (diffMs < hour) {
    const minutes = Math.floor(diffMs / minute);
    return `${minutes} ${t(`app.minute${minutes !== 1 ? "s" : ""}`)} ${t("app.ago")}`;
  }

  if (diffMs < day) {
    const hours = Math.floor(diffMs / hour);
    return `${hours} ${t(`app.hour${hours !== 1 ? "s" : ""}`)} ${t("app.ago")}`;
  }

  if (diffMs < day * 2) {
    return t("app.yesterday");
  }

  if (diffMs < week) {
    const days = Math.floor(diffMs / day);
    return `${days} ${t(`app.day${days !== 1 ? "s" : ""}`)} ${t("app.ago")}`;
  }

  const weeks = Math.floor(diffMs / week);
  return `${weeks} ${t(`app.week${weeks !== 1 ? "s" : ""}`)} ${t("app.ago")}`;
}
export function timeAgoMinutes(timestamp: string, t: TFunction) {
  const past = new Date(timestamp).getTime();
  const now = Date.now();

  let diffInMinutes = Math.floor((now - past) / 60000);

  if (diffInMinutes < 1) return t("app.justNow");

  const hours = Math.floor(diffInMinutes / 60);
  const minutes = diffInMinutes % 60;

  const parts = [];

  if (hours) {
    const hoursLabel = t(`app.hour${hours !== 1 ? "s" : ""}`);
    parts.push(`${hours} ${hoursLabel}`);
  }

  if (minutes) {
    const minutesLabel = t(`app.minute${minutes !== 1 ? "s" : ""}`);
    parts.push(`${minutes} ${minutesLabel}`);
  }

  return `${parts.join(" ")} ${t("app.ago")}`;
}

export function startTimeAgo(
  timestamp: string,
  callback: (timeString: string) => void,
  t: TFunction,
) {
  callback(timeAgo(timestamp, t));

  const interval = setInterval(() => {
    callback(timeAgo(timestamp, t));
  }, 60_000);

  return () => clearInterval(interval);
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "EUR",
  }).format(amount);
}

export const formatErrorsArray = (
  errorsArr: Record<string, unknown>,
): string => {
  const errorsStr = Object.values(errorsArr).join(", ").toLowerCase();
  return errorsStr.charAt(0).toUpperCase() + errorsStr.slice(1);
};

export function shortName(
  desc: string | null | undefined,
  size: number = 20,
): string {
  if (!desc) return "";
  return desc.length > size ? desc.substr(0, size) + " ..." : desc;
}

export function emailValid(email: string): boolean {
  const emailRegex = /^([A-Za-z0-9_\-.])+@([A-Za-z0-9_\-.])+\.([A-Za-z]{2,4})$/;
  return emailRegex.test(email);
}

export function passValid(pass: string): boolean {
  const passRegex =
    /^((?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])|(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[^a-zA-Z0-9])|(?=.*?[A-Z])(?=.*?[0-9])(?=.*?[^a-zA-Z0-9])|(?=.*?[a-z])(?=.*?[0-9])(?=.*?[^a-zA-Z0-9])).{6,}$/;
  return passRegex.test(pass);
}

export function urlify(text: string): string {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return text.replace(urlRegex, function (url: string) {
    return '<a href="' + url + '">' + url + "</a>";
  });
}

export const focusSelf = (e: Event): void => {
  const target = e.target as HTMLInputElement;
  if (target.value.trim() === "") {
    target.setSelectionRange(0, 0);
  } else {
    target.setSelectionRange(0, target.value.length);
  }
};

export const toBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      resolve((reader.result as string)?.split(",")[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const base64ToArrayBuffer = (base64: string): ArrayBuffer => {
  const binary_string = window.atob(base64);
  const len = binary_string.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary_string.charCodeAt(i);
  }
  return bytes.buffer;
};

export const formatFileSize = (size: number) => {
  if (size < 1024) {
    return `${size}b`;
  }
  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(2)}kb`;
  }
  return `${(size / 1024 / 1024).toFixed(2)}mb`;
};

export const openDocument = (url: string) => {
  window.open(
    `https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(url)}`,
    "_blank",
  );
};

interface NavigatorWithMsSaveBlob extends Navigator {
  msSaveBlob?: (blob: Blob, fileName: string) => boolean;
}

interface DocumentWithMode extends Document {
  documentMode?: number;
}

export const saveByteArray = (
  reportName: string,
  byte: ArrayBuffer | Uint8Array,
): void => {
  const blob = new Blob([byte as BlobPart], {
    type: "application/octetstream",
  });
  const doc = document as DocumentWithMode;
  const isIE = false || !!doc.documentMode;

  if (isIE) {
    const nav = window.navigator as NavigatorWithMsSaveBlob;
    if (nav.msSaveBlob) {
      nav.msSaveBlob(blob, reportName);
    }
  } else {
    const url = window.URL || window.webkitURL;
    const link = url.createObjectURL(blob);
    const a = document.createElement("a");
    a.download = reportName;
    a.href = link;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    url.revokeObjectURL(link);
  }
};

export const downloadFileFromUrl = async (
  url: string,
  fileName: string,
): Promise<void> => {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to download file: ${response.statusText}`);
    }
    const blob = await response.blob();
    const doc = document as DocumentWithMode;
    const isIE = false || !!doc.documentMode;

    if (isIE) {
      const nav = window.navigator as NavigatorWithMsSaveBlob;
      if (nav.msSaveBlob) {
        nav.msSaveBlob(blob, fileName);
      }
    } else {
      const objectUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(objectUrl);
    }
  } catch (error) {
    console.error("Error downloading file:", error);
    throw error;
  }
};

export const generateUniqueId = (name: string = "unique"): string => {
  return `${name}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

const referenceFlagMap: Record<string, string> = {
  isClub: "navigation.clubs",
  isSupplier: "navigation.suppliers",
  isTeam: "navigation.teams",
  isFederation: "navigation.federations",
  isAgeCategory: "navigation.ageCategories",
  isUser: "navigation.users",
};

const getActiveReferences = (response: any): string[] => {
  return Object.entries(referenceFlagMap)
    .filter(([flag]) => response[flag])
    .map(([, label]) => label);
};

const formatReferenceList = (references: string[], t: TFunction): string => {
  if (references.length === 0) return "";

  const translatedRefs = references.map((ref) => t(ref));

  if (translatedRefs.length === 1) return translatedRefs[0];

  if (translatedRefs.length === 2) {
    return `${translatedRefs[0]} ${t("validation.unableToDelete.and")} ${translatedRefs[1]}`;
  }

  const allButLast = translatedRefs.slice(0, -1).join(", ");
  const last = translatedRefs[translatedRefs.length - 1];

  return `${allButLast}, ${t("validation.unableToDelete.and")} ${last}`;
};

export const buildDeleteErrorMessage = (response: any, t: TFunction) => {
  const references = getActiveReferences(response);

  if (!references.length) {
    return response.message;
  }

  return t("validation.unableToDelete.message", {
    message: formatReferenceList(references, t),
  });
};

export const getUserInfo = (): UserSession | null => {
  const userSession = localStorage.getItem("userSession");

  if (!userSession) return null;
  try {
    return JSON.parse(userSession) as UserSession;
  } catch (error) {
    console.error("Error parsing user session:", error);
    return null;
  }
};

export const formatIsoDate = (
  date: Date | string | null | undefined,
): string | null => {
  if (!date) return null;
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return null;
  return moment(d).format("YYYY-MM-DD");
};

export function toLocalCalendarDate(
  value: Date | string | null | undefined,
): Date | undefined {
  if (value == null || value === "") return undefined;
  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) return undefined;
    return new Date(value.getFullYear(), value.getMonth(), value.getDate());
  }
  if (typeof value === "string") {
    const s = value.trim();
    if (!s) return undefined;
    const iso = /^(\d{4})-(\d{2})-(\d{2})/.exec(s);
    if (iso) {
      const y = Number(iso[1]);
      const m = Number(iso[2]) - 1;
      const day = Number(iso[3]);
      const d = new Date(y, m, day);
      return Number.isNaN(d.getTime()) ? undefined : d;
    }
    const t = Date.parse(s);
    if (!Number.isNaN(t)) {
      const parsed = new Date(t);
      return new Date(
        parsed.getFullYear(),
        parsed.getMonth(),
        parsed.getDate(),
      );
    }
  }
  return undefined;
}
