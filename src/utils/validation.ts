import { TFunction } from "@/types";
import { z } from "zod";

export const validationConfig = {
  logo: {
    maxSizeMB: 1,
    minSizeKB: 1,
    types: ["image/jpeg", "image/jpg", "image/png", "image/webp"],
  },
  document: {
    maxSizeMB: 5,
    types: [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ],
  },
  contentVideo: {
    maxSizeMB: 100,
    types: ["video/mp4", "video/webm"],
  },
  contentImage: {
    maxSizeMB: 10,
    types: ["image/jpeg", "image/jpg", "image/png", "image/webp"],
  },
} as const;

export const phonePatterns = {
  nl: /^(\+31[\s-]?|0)((6[\s-]?[\d\s-]{8,})|(([1-9]\d)[\s-]?[\d\s-]{6,}))$/,
  be: /^(\+32[\s-]?|0)([1-9]\d{1}[\s-]?[\d\s-]{6,})$/,
} as const;

export const createPhoneRegex = (
  countries: Array<keyof typeof phonePatterns>,
) => new RegExp(countries.map((c) => `(${phonePatterns[c].source})`).join("|"));

export const phoneRegex = createPhoneRegex(["nl", "be"]);

export const dutchPhoneRegex = phonePatterns.nl;
export const belgianPhoneRegex = phonePatterns.be;

export const createAllowedCharsRegex = (options?: {
  allowNumbers?: boolean;
  allowLatinOnly?: boolean;
  extraChars?: string;
}) => {
  if (options?.allowLatinOnly) {
    const letters = "A-Za-z";
    const numbers = options?.allowNumbers !== false ? "0-9" : "";
    const extras = options?.extraChars ?? "\\s\\-'.,&/()";
    return new RegExp(`^[${letters}${numbers}${extras}]+$`);
  }

  const letters = "\\p{L}";
  const numbers = options?.allowNumbers !== false ? "\\p{N}" : "";
  const extras = options?.extraChars ?? "\\s\\-'.,&/()";
  return new RegExp(`^[${letters}${numbers}${extras}]+$`, "u");
};

export const allowedCharsRegex = createAllowedCharsRegex();

export const nameRegex = createAllowedCharsRegex({ allowNumbers: false });
export const titleRegex = createAllowedCharsRegex({ allowNumbers: true });
export const codeRegex = createAllowedCharsRegex({
  allowLatinOnly: true,
  allowNumbers: true,
  extraChars: "-_",
});

export const domainPattern =
  /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

export const createFileSchema = (
  t: TFunction,
  options: {
    optional?: boolean;
    maxSizeMB: number;
    minSizeKB?: number;
    allowedTypes: readonly string[];
    requiredMessage: string;
    formatMessage: string;
  },
): z.ZodTypeAny => {
  const maxSizeBytes = options.maxSizeMB * 1024 * 1024;
  const minSizeBytes = (options.minSizeKB ?? 0) * 1024;

  const base = z.union([
    z.instanceof(File),
    z.string(),
    z.undefined(),
    z.null(),
  ]);

  let schema = base
    .refine(
      (file) =>
        options.optional ||
        file instanceof File ||
        (typeof file === "string" && file.length > 0),
      options.requiredMessage,
    )
    .refine(
      (file) => !file || !(file instanceof File) || file.size <= maxSizeBytes,
      t("validation.fileSizeMax", { max: options.maxSizeMB }),
    )
    .refine(
      (file) =>
        !file ||
        !(file instanceof File) ||
        (options.allowedTypes as readonly string[]).includes(file.type),
      options.formatMessage,
    );

  if (minSizeBytes > 0) {
    schema = schema.refine(
      (file) => !file || !(file instanceof File) || file.size >= minSizeBytes,
      t("validation.fileSizeMin"),
    ) as any;
  }

  return options.optional ? schema.optional() : schema;
};

export const createNumberSchema = (
  t: TFunction,
  options: {
    min?: number;
    max?: number;
    requiredMessage: string;
    optional?: boolean;
    nullable?: boolean;
  },
) => {
  let schema = z.number({
    required_error: options.requiredMessage,
    invalid_type_error: options.requiredMessage,
  });

  if (options.min !== undefined) {
    schema = schema.min(
      options.min,
      t("validation.minValue", { min: options.min }),
    );
  }

  if (options.max !== undefined) {
    schema = schema.max(
      options.max,
      t("validation.maxValue", { max: options.max }),
    );
  }

  if (options.optional) {
    schema = schema.optional() as any;
  }

  if (options.nullable) {
    schema = schema.nullable() as any;
  }

  return schema;
};

export const requireIf = <T extends Record<string, any>>(
  condition: (data: T) => boolean,
  field: keyof T,
  message: string,
) => ({
  refine: (data: T) => !condition(data) || Boolean(data[field]),
  message,
  path: [field as string],
});

export const requireIfArray = <T extends Record<string, any>>(
  condition: (data: T) => boolean,
  field: keyof T,
  message: string,
) => ({
  refine: (data: T) =>
    !condition(data) ||
    (Array.isArray(data[field]) && (data[field] as unknown[]).length > 0),
  message,
  path: [field as string],
});

const createLogoFileSchema = (t: TFunction, isOptional: boolean = false) =>
  createFileSchema(t, {
    optional: isOptional,
    maxSizeMB: validationConfig.logo.maxSizeMB,
    minSizeKB: validationConfig.logo.minSizeKB,
    allowedTypes: validationConfig.logo.types,
    requiredMessage: t("validation.imageRequired"),
    formatMessage: t("validation.imageFormatsAllowed"),
  });

const createDocumentFileSchema = (
  t: TFunction,
  isOptional: boolean = false,
  customOptions?: {
    allowedTypes?: readonly string[];
    maxSizeMB?: number;
  },
) =>
  createFileSchema(t, {
    optional: isOptional,
    maxSizeMB: customOptions?.maxSizeMB ?? validationConfig.document.maxSizeMB,
    allowedTypes:
      customOptions?.allowedTypes ?? validationConfig.document.types,
    requiredMessage: t("validation.fileRequired"),
    formatMessage: t("validation.documentFormatsAllowed"),
  });

export const loginSchema = (t: TFunction) =>
  z.object({
    email: z
      .string()
      .min(1, t("validation.emailRequired"))
      .email(t("validation.invalidEmail"))
      .max(254, t("validation.maxLength", { max: 254 })),
    password: z.string().min(1, t("validation.passwordRequired")),
  });

export const resetPasswordSchema = (t: TFunction) =>
  z.object({
    email: z
      .string()
      .min(1, t("validation.emailRequired"))
      .email(t("validation.invalidEmail"))
      .max(254, t("validation.maxLength", { max: 254 })),
  });

const createPhoneNumberSchema = (
  t: TFunction,
  isOptional: boolean = false,
  countries: Array<keyof typeof phonePatterns> = ["nl", "be"],
) => {
  const regex = createPhoneRegex(countries);
  const baseSchema = z.string().regex(regex, {
    message: t("validation.phoneFormat"),
  });

  if (isOptional) {
    return z.union([baseSchema, z.literal(""), z.undefined()]).refine(
      (value) => {
        if (!value || value === "") return true;
        return regex.test(value);
      },
      {
        message: t("validation.phoneFormat"),
      },
    );
  }

  return baseSchema;
};

export const createClubRoleSchema = (t: TFunction) =>
  z.object({
    clubId: z.number().min(1, t("validation.clubRequired")),
    ageGroupId: z.number().min(1, t("validation.userAgeRequired")),
    teamId: z.number().min(1, t("validation.teamRequired")),
    roleIds: z.array(z.number()).min(1, t("validation.atLeastOneRoleRequired")),
  });

export const createUserSchema = (t: TFunction) =>
  z.object({
    logoFile: createLogoFileSchema(t, true),
    fullName: z
      .string()
      .min(1, t("validation.nameRequired"))
      .max(100, t("validation.maxLength", { max: 100 }))
      .refine(
        (value) => allowedCharsRegex.test(value),
        t("validation.invalidCharacters"),
      ),
    email: z
      .string()
      .min(1, "Email is required")
      .email(t("validation.invalidEmail"))
      .max(254, t("validation.maxLength", { max: 254 })),
    phone: createPhoneNumberSchema(t),
    gender: z.string().optional(),
    clubRoles: z.array(createClubRoleSchema(t)),
  });

export const passwordFormSchema = (t: TFunction) => {
  return z
    .object({
      newPassword: z.string(),
      confirmPassword: z.string(),
    })
    .superRefine((data, ctx) => {
      const { newPassword, confirmPassword } = data;

      const isNewEmpty = !newPassword || newPassword.trim() === "";
      const isConfirmEmpty = !confirmPassword || confirmPassword.trim() === "";

      if (isNewEmpty && isConfirmEmpty) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: t("validation.passwordRequired"),
          path: ["newPassword"],
        });
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: t("validation.confirmPasswordRequired"),
          path: ["confirmPassword"],
        });
        return;
      }

      const hasMinLength = (newPassword || "").length >= 8;
      const hasUppercase = /[A-Z]/.test(newPassword || "");
      const hasSpecial = /[^A-Za-z0-9]/.test(newPassword || "");

      if (!isNewEmpty && (!hasMinLength || !hasUppercase || !hasSpecial)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: t("validation.passwordDoesNotMeetRequirements"),
          path: ["newPassword"],
        });
      }

      if (!isConfirmEmpty && newPassword !== confirmPassword) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: t("validation.passwordsDoNotMatch"),
          path: ["confirmPassword"],
        });
      }
    });
};

export const createFederationSchema = (t: TFunction) =>
  z.object({
    name: z
      .string()
      .min(1, t("validation.nameRequired"))
      .max(100, t("validation.maxLength", { max: 100 }))
      .refine(
        (value) => allowedCharsRegex.test(value),
        t("validation.invalidCharacters"),
      ),
    code: z
      .string()
      .min(1, t("validation.codeRequired"))
      .max(100, t("validation.maxLength", { max: 100 }))
      .refine(
        (value) => allowedCharsRegex.test(value),
        t("validation.invalidCharacters"),
      ),
    country: z.string().min(1, t("validation.countryRequired")),
  });

function preprocessDate(value: unknown): unknown {
  if (value === null || value === "") return undefined;
  if (typeof value === "string" && value.trim() === "") return undefined;
  if (value instanceof Date) return value;
  if (typeof value === "string") {
    const d = new Date(value.trim());
    return Number.isNaN(d.getTime()) ? value : d;
  }
  return value;
}

const validateDateField = (t: TFunction, kind: "start" | "end") => {
  const message =
    kind === "start"
      ? t("validation.startDateRequired")
      : t("validation.endDateRequired");
  return z.preprocess(
    preprocessDate,
    z.date({
      required_error: message,
      invalid_type_error: message,
    }),
  );
};

export const createLearningLineStep1Schema = (t: TFunction) =>
  z.object({
    name: z
      .string()
      .min(1, t("validation.nameRequired"))
      .max(200, t("validation.maxLength", { max: 200 }))
      .refine(
        (value) => allowedCharsRegex.test(value),
        t("validation.invalidCharacters"),
      ),
    targetGroupIds: z
      .array(z.number())
      .min(1, t("validation.targetGroupRequired")),
    clubIds: z.array(z.number()).min(1, t("validation.clubRequired")),
    ageCategoryIds: z
      .array(z.number())
      .min(1, t("validation.ageCategoryRequired")),
    seasonId: z.union([z.string(), z.number()]).optional(),
    seasonName: z.string().optional(),
    startDate: validateDateField(t, "start"),
    endDate: validateDateField(t, "end"),
    description: z
      .string()
      .max(500, t("validation.maxLength", { max: 500 }))
      .optional()
      .or(z.literal("")),
    isRecurring: z.boolean().optional(),
  });

export const createLearningLineSchema = (t: TFunction) =>
  z.object({
    name: z
      .string()
      .min(1, t("validation.nameRequired"))
      .max(200, t("validation.maxLength", { max: 200 }))
      .refine(
        (value) => allowedCharsRegex.test(value),
        t("validation.invalidCharacters"),
      ),
    code: z
      .string()
      .max(50, t("validation.maxLength", { max: 50 }))
      .optional(),
    description: z
      .string()
      .max(500, t("validation.maxLength", { max: 500 }))
      .optional(),
  });

export const createSupplierSchema = (t: TFunction) =>
  z.object({
    name: z
      .string()
      .min(1, t("validation.nameRequired"))
      .max(100, t("validation.maxLength", { max: 100 }))
      .refine(
        (value) => allowedCharsRegex.test(value),
        t("validation.invalidCharacters"),
      ),
    federationId: z
      .number({
        required_error: t("validation.federationRequired"),
        invalid_type_error: t("validation.federationRequired"),
      })
      .min(1, t("validation.federationRequired")),
  });

export const createAgeCategorySchema = (t: TFunction) => {
  return z.object({
    name: z
      .string()
      .min(1, t("validation.nameRequired"))
      .max(100, t("validation.maxLength", { max: 100 }))
      .refine(
        (value) => allowedCharsRegex.test(value),
        t("validation.invalidCharacters"),
      ),
  });
};

export const createTeamSchema = (t: TFunction) =>
  z.object({
    clubId: z.number().min(1, t("validation.clubRequired")),
    ageCategoryId: z.number().min(1, t("validation.ageCategoryRequired")),
    teams: z.array(
      z.object({
        id: z.number().optional(),
        name: z
          .string()
          .min(1, t("validation.nameRequired"))
          .max(100, t("validation.maxLength", { max: 100 }))
          .refine(
            (value) => allowedCharsRegex.test(value),
            t("validation.invalidCharacters"),
          ),
      }),
    ),
  });

export const createClubDetailsSchema = (t: TFunction) =>
  z.object({
    imageFile: createLogoFileSchema(t, true),
    name: z
      .string()
      .min(1, t("validation.nameRequired"))
      .max(100, t("validation.maxLength", { max: 100 }))
      .refine(
        (value) => allowedCharsRegex.test(value),
        t("validation.invalidCharacters"),
      ),
    country: z.string().min(1, t("validation.countryRequired")),
    federationId: z.number().min(1, t("validation.federationRequired")),
    email: z
      .string()
      .min(1, t("validation.emailRequired"))
      .email(t("validation.invalidEmail"))
      .max(254, t("validation.maxLength", { max: 254 })),
    supplierId: z.number().min(1, t("validation.supplierRequired")),
    labelId: z.number().optional(),
  });

export const createClubContactSchema = (t: TFunction) =>
  z.object({
    name: z
      .string()
      .min(1, t("validation.nameRequired"))
      .max(100, t("validation.maxLength", { max: 100 }))
      .refine(
        (value) => allowedCharsRegex.test(value),
        t("validation.invalidCharacters"),
      ),
    roleTypeId: z.number().min(1, t("validation.roleRequired")),
    email: z
      .string()
      .min(1, t("validation.emailRequired"))
      .email(t("validation.invalidEmail"))
      .max(254, t("validation.maxLength", { max: 254 })),
    phone: createPhoneNumberSchema(t, true),
    hasAdminAccess: z.boolean().default(false),
    isPrimary: z.boolean().default(false),
  });

export const createClubContactsArraySchema = (t: TFunction) =>
  z.array(createClubContactSchema(t)).refine(
    (contacts) => {
      const emailSet = new Set<string>();

      for (const contact of contacts) {
        const email = contact.email?.trim().toLowerCase();
        if (email) {
          if (emailSet.has(email)) {
            return false;
          }
          emailSet.add(email);
        }
      }

      return true;
    },
    {
      message: t("validation.duplicateEmail"),
    },
  );

export const validateContactsDuplicateEmails = (
  contacts: any[],
  t: TFunction,
): Map<number, string> => {
  const duplicateErrors = new Map<number, string>();
  const emailMap = new Map<string, number[]>();

  contacts.forEach((contact, index) => {
    const email = contact.email?.trim().toLowerCase();
    if (email) {
      if (!emailMap.has(email)) {
        emailMap.set(email, []);
      }
      emailMap.get(email)!.push(index);
    }
  });

  emailMap.forEach((indices) => {
    if (indices.length > 1) {
      indices.forEach((index) => {
        duplicateErrors.set(index, t("validation.duplicateEmail"));
      });
    }
  });

  return duplicateErrors;
};

export const createContractDocSchema = (t: TFunction) =>
  z
    .object({
      documentCategory: z
        .string({
          required_error: t("validation.categoryRequired"),
        })
        .min(1, t("validation.categoryRequired")),
      file: createDocumentFileSchema(t, true),
      documentUrl: z.string().optional(),
      documentName: z.string().optional(),
      startDate: z.date().nullable().optional(),
      endDate: z.date().nullable().optional(),
      autoRenewal: z.boolean().default(false),
      autoRenewalTill: z.number().optional().nullable(),
      numberOfMembers: z
        .number()
        .max(100000000, t("validation.maxValue", { max: 100000000 }))
        .optional()
        .nullable(),
      price: z.number().optional().nullable(),
    })
    .refine(
      (data) => {
        if (!data.documentUrl && (!data.file || data.file === null)) {
          return false;
        }
        return true;
      },
      {
        message: t("validation.fileRequired"),
        path: ["file"],
      },
    )
    .refine(
      (data) => {
        const requiresFields = ["Contract", "Agreements"].includes(
          data.documentCategory,
        );
        if (requiresFields && !data.startDate) {
          return false;
        }
        return true;
      },
      {
        message: t("validation.startDateRequired"),
        path: ["startDate"],
      },
    )
    .refine(
      (data) => {
        const requiresFields = ["Contract", "Agreements"].includes(
          data.documentCategory,
        );
        if (requiresFields && !data.endDate) {
          return false;
        }
        return true;
      },
      {
        message: t("validation.endDateRequired"),
        path: ["endDate"],
      },
    )
    .refine(
      (data) => {
        const requiresFields = ["Contract", "Agreements"].includes(
          data.documentCategory,
        );
        if (
          requiresFields &&
          (data.price === null || data.price === undefined)
        ) {
          return false;
        }
        if (data.price !== null && data.price !== undefined) {
          if (data.price < 0 || data.price > 99) {
            return false;
          }
        }
        return true;
      },
      {
        message: t("validation.priceRequired"),
        path: ["price"],
      },
    )
    .refine(
      (data) => {
        if (data.autoRenewal) {
          return (
            data.autoRenewalTill !== undefined &&
            data.autoRenewalTill !== null &&
            data.autoRenewalTill > 0
          );
        }
        return true;
      },
      {
        message: t("validation.autoRenewalTillRequired"),
        path: ["autoRenewalTill"],
      },
    )
    .refine(
      (data) => {
        if (data.startDate && data.endDate) {
          return data.endDate > data.startDate;
        }
        return true;
      },
      {
        message: t("validation.endDateAfterStartDate"),
        path: ["endDate"],
      },
    );

/** Coerce PrimeVue AutoComplete / chip values to plain strings for Zod + API. */
export const normalizeTagsInput = (val: unknown): string[] => {
  if (!Array.isArray(val)) return [];
  const out: string[] = [];
  for (const item of val) {
    if (typeof item === "string") {
      const s = item.trim();
      if (s) out.push(s);
    } else if (item != null && typeof item === "object") {
      const o = item as Record<string, unknown>;
      const raw = o.value ?? o.label ?? o.name;
      if (raw != null) {
        const s = String(raw).trim();
        if (s) out.push(s);
      }
    }
  }
  return out;
};

export const createContentSchema = (t: TFunction) =>
  z
    .object({
      contentType: createNumberSchema(t, {
        min: 1,
        requiredMessage: t("validation.contentTypeRequired"),
      }),
      title: z
        .string()
        .min(1, t("validation.titleRequired"))
        .max(200, t("validation.maxLength", { max: 200 })),
      description: z.string().optional(),
      easierExercise: z.string().optional(),
      difficultExercise: z.string().optional(),
      categoryId: z.number().optional(),
      themeIds: z
        .array(z.number())
        .max(3, t("validation.maxThemesAllowed"))
        .optional()
        .default([]),
      levelId: z.number().optional(),
      ageGroupIds: z.preprocess((val) => {
        if (Array.isArray(val)) {
          return val
            .map((x) => Number(x))
            .filter((n) => typeof n === "number" && !Number.isNaN(n));
        }
        if (typeof val === "string" && val.trim()) {
          return val
            .split(/[,\s]+/)
            .map((s) => Number(s.trim()))
            .filter((n) => !Number.isNaN(n));
        }
        return [];
      }, z.array(z.number()).optional().default([])),
      tags: z.preprocess(
        (val) => normalizeTagsInput(val),
        z.array(z.string()).optional().default([]),
      ),
      linkedSkillIds: z.array(z.number()).optional().default([]),
      labels: z.array(z.number()).optional().default([]),
    })
    .superRefine((data, ctx) => {
      if ([1, 2, 3, 5].includes(data.contentType) && !data.categoryId) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: t("validation.mainCategoryRequired"),
          path: ["categoryId"],
        });
      }

      if (
        data.contentType === 4 &&
        (!data.linkedSkillIds || data.linkedSkillIds.length === 0)
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: t("validation.skillRequired"),
          path: ["linkedSkillIds"],
        });
      }
    })
    .refine(
      (data) => {
        if (data.contentType === 4 && !data.levelId) {
          return false;
        }
        return true;
      },
      {
        message: t("validation.levelRequired"),
        path: ["levelId"],
      },
    );

export const createContentFileSchema = (
  t: TFunction,
  maxSizeMB: number,
  allowedMimeTypes: string[],
  hasExistingFile?: boolean,
) => {
  return z
    .object({
      title: z.string().min(1, { message: t("validation.titleRequired") }),
      description: z.string().optional(),
      files: z
        .array(
          z
            .instanceof(File)
            .refine(
              (file) => file.size <= maxSizeMB * 1024 * 1024,
              t("validation.fileSizeMax", { max: maxSizeMB }),
            )
            .refine(
              (file) => allowedMimeTypes.includes(file.type),
              t("validation.documentFormatsAllowed"),
            ),
        )
        .optional(),
      exerciseId: z.number().optional(),
    })
    .refine(
      (data) => {
        if (hasExistingFile) {
          return true;
        }
        if (!data.exerciseId && (!data.files || data.files.length === 0)) {
          return false;
        }
        return true;
      },
      {
        message: t("validation.fileRequired"),
        path: ["files"],
      },
    );
};

export const createModuleSchema = (t: TFunction) => {
  return z.object({
    title: z
      .string()
      .min(1, t("validation.titleRequired"))
      .max(200, t("validation.maxLength", { max: 200 })),
    description: z.string().optional(),
  });
};

export const createLessonSchema = (t: TFunction) => {
  return z.object({
    title: z
      .string()
      .min(1, t("validation.titleRequired"))
      .max(200, t("validation.maxLength", { max: 200 })),
    description: z.string().optional(),
    fileType: z.number().default(1),
    files: z.array(z.instanceof(File)).optional().default([]),
  });
};

export const createWeekContentItemSchema = (t: TFunction) =>
  z
    .object({
      id: z.number().optional(),
      contentType: z.number({
        required_error: t("Academy.LearningLines.contentTypeRequired"),
        invalid_type_error: t("Academy.LearningLines.contentTypeRequired"),
      }),
      contentId: z.number({
        required_error: t("Academy.LearningLines.contentIdRequired"),
        invalid_type_error: t("Academy.LearningLines.contentIdRequired"),
      }),
      name: z.string().optional(),
      tags: z.union([z.string(), z.array(z.string())]).optional(),
      skillIds: z.array(z.number()).optional(),
      durationWeeks: z.number().nullable().optional(),
    })
    .superRefine((data, ctx) => {
      if (data.contentType === 4) {
        if (!data.skillIds || data.skillIds.length === 0) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: t("Academy.LearningLines.skillsRequired"),
            path: ["skillIds"],
          });
        }
      }

      if (data.contentType === 5) {
        if (!data.durationWeeks || data.durationWeeks <= 0) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: t("Academy.LearningLines.durationRequired"),
            path: ["durationWeeks"],
          });
        }
      }
    });

export const createWeekContentSchema = (t: TFunction) =>
  z.object({
    weekName: z
      .string()
      .min(1, t("Academy.LearningLines.weekNameRequired"))
      .refine(
        (value) => value.trim().length > 0,
        t("Academy.LearningLines.weekNameRequired"),
      ),
    weekSummary: z.string().optional().or(z.literal("")),
    weekNotes: z.string().optional().or(z.literal("")),
    items: z.array(createWeekContentItemSchema(t)),
    removeContentIds: z.array(z.number()).optional(),
  });
