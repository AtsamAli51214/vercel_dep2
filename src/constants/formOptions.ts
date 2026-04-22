import type { TFunction } from "@/types";

export const getContactRoleOptions = (t: TFunction) => [
  { label: t("Clubs.contactInfo.formRoles.chairmain"), value: 1 },
  { label: t("Clubs.contactInfo.formRoles.treasurer"), value: 2 },
  { label: t("Clubs.contactInfo.formRoles.secretary"), value: 3 },
  { label: t("Clubs.contactInfo.formRoles.technicalBoardmember"), value: 4 },
  { label: t("Clubs.contactInfo.formRoles.generalBoardmember"), value: 5 },
  { label: t("Clubs.contactInfo.formRoles.technicalManager"), value: 6 },
  { label: t("Clubs.contactInfo.formRoles.youthCoordinator"), value: 7 },
];

export const getDocumentCategoryOptions = (t: TFunction) => [
  {
    label: t("Clubs.contractDocs.formDocumentCategories.contract"),
    value: "Contract",
  },
  {
    label: t("Clubs.contractDocs.formDocumentCategories.offers"),
    value: "Offers",
  },
  {
    label: t("Clubs.contractDocs.formDocumentCategories.agreements"),
    value: "Agreements",
  },
  {
    label: t("Clubs.contractDocs.formDocumentCategories.registrationDocuments"),
    value: "Registration",
  },
  {
    label: t("Clubs.contractDocs.formDocumentCategories.otherSupportingFiles"),
    value: "Others",
  },
];

export const getAutoRenewalOptions = (t: TFunction) => [
  { label: t("Clubs.contractDocs.autoRenewalOptions.monthly"), value: 1 },
  { label: t("Clubs.contractDocs.autoRenewalOptions.quaterly"), value: 2 },
  { label: t("Clubs.contractDocs.autoRenewalOptions.halfYearly"), value: 3 },
  { label: t("Clubs.contractDocs.autoRenewalOptions.yearly"), value: 4 },
  { label: t("Clubs.contractDocs.autoRenewalOptions.lifetime"), value: 5 },
];

export const getClubLabelOptions = (t: TFunction) => [
  { label: t("Clubs.clubDetails.formLabels.formerClient"), value: 0 },
  { label: t("Clubs.clubDetails.formLabels.Client"), value: 1 },
  { label: t("Clubs.clubDetails.formLabels.Prospect"), value: 2 },
];

export const getLabelByValue = <T extends { label: string; value: any }>(
  options: T[],
  value: any,
): string => {
  return options.find((option) => option.value === value)?.label || "-";
};

export const getContentTypes = (t: TFunction) => [
  { label: t("Academy.library.contentTypes.skill"), value: 1 },
  { label: t("Academy.library.contentTypes.article"), value: 2 },
  { label: t("Academy.library.contentTypes.guide"), value: 3 },
  { label: t("Academy.library.contentTypes.exercise"), value: 4 },
  { label: t("Academy.library.contentTypes.course"), value: 5 },
];

export const getThemeOptions = (t: TFunction) => [
  { label: t("Academy.library.themeOptions.attacking"), value: 1 },
  { label: t("Academy.library.themeOptions.defending"), value: 2 },
  { label: t("Academy.library.themeOptions.transition"), value: 3 },
  { label: t("Academy.library.themeOptions.gameSystems"), value: 4 },
  { label: t("Academy.library.themeOptions.gamePrinciples"), value: 5 },
  { label: t("Academy.library.themeOptions.setPieces"), value: 6 },
  { label: t("Academy.library.themeOptions.penaltyCorner"), value: 7 },
  { label: t("Academy.library.themeOptions.training"), value: 8 },
  { label: t("Academy.library.themeOptions.coaching"), value: 9 },
  { label: t("Academy.library.themeOptions.playerGuidance"), value: 10 },
  { label: t("Academy.library.themeOptions.parentsEnvironment"), value: 11 },
  { label: t("Academy.library.themeOptions.clubOrganization"), value: 12 },
];

export const getLevelOptions = (t: TFunction) => [
  { label: t("Academy.library.levelOptions.basic"), value: 1 },
  { label: t("Academy.library.levelOptions.advanced"), value: 2 },
  { label: t("Academy.library.levelOptions.expert"), value: 3 },
];

export const getMainCategoryOptions = (t: TFunction) => [
  {
    label: t("Academy.library.mainCategoryOptions.techniques"),
    value: 25,
  },
  { label: t("Academy.library.mainCategoryOptions.tactics"), value: 26 },
  {
    label: t("Academy.library.mainCategoryOptions.physical"),
    value: 27,
  },
  { label: t("Academy.library.mainCategoryOptions.mental"), value: 28 },
];

export const getFieldTypeOptions = (t: TFunction) => [
  { label: t("Academy.library.playingEnvironmentOptions.outdoor"), value: 1 },
  { label: t("Academy.library.playingEnvironmentOptions.indoor"), value: 2 },
  { label: t("Academy.library.playingEnvironmentOptions.both"), value: 3 },
];

export const getPlayerTypeOptions = (t: TFunction) => [
  { label: t("Academy.library.roleOptions.fieldPlayer"), value: 4 },
  { label: t("Academy.library.roleOptions.goalkeeper"), value: 5 },
  { label: t("Academy.library.roleOptions.both"), value: 6 },
];

export const getTargetGroupOptions = (t: TFunction) => [
  { label: t("Academy.LearningLines.targetGroup.player"), value: 5 },
  { label: t("Academy.LearningLines.targetGroup.trainer"), value: 6 },
  { label: t("Academy.LearningLines.targetGroup.coach"), value: 7 },
];

export const getLabelGroups = (t: TFunction) => [
  {
    id: "fieldType",
    label: t("Academy.library.formPlayingEnvironment"),
    options: getFieldTypeOptions(t).map((opt) => ({
      name: opt.label,
      value: opt.value,
    })),
  },
  {
    id: "playerType",
    label: t("Academy.library.formRole"),
    options: getPlayerTypeOptions(t).map((opt) => ({
      name: opt.label,
      value: opt.value,
    })),
  },
];

export interface ContentFileConfig {
  accept: string;
  maxSize: number;
  allowedMimeTypes: string[];
}

export const CONTENT_FILE_CONFIG: Record<number, ContentFileConfig> = {
  1: {
    accept: ".mp4,.mov,.jpg,.jpeg,.png",
    maxSize: 100,
    allowedMimeTypes: [
      "video/mp4",
      "video/quicktime",
      "image/jpeg",
      "image/png",
    ],
  },
  2: {
    accept: ".pdf",
    maxSize: 50,
    allowedMimeTypes: ["application/pdf"],
  },
};

export const getContentFileConfig = (fileType: number): ContentFileConfig => {
  return fileType === 1 ? CONTENT_FILE_CONFIG[1] : CONTENT_FILE_CONFIG[2];
};

export const getThemeName = (t: TFunction, themeId: number) => {
  return (
    getThemeOptions(t).find((theme) => theme.value === themeId)?.label || "-"
  );
};

export const getLevelName = (t: TFunction, levelId: number) => {
  return (
    getLevelOptions(t).find((level) => level.value === levelId)?.label || "-"
  );
};

export const getMainCategoryName = (t: TFunction, mainCategoryId: number) => {
  return (
    getMainCategoryOptions(t).find(
      (mainCategory) => mainCategory.value === mainCategoryId,
    )?.label || "-"
  );
};

export const getLabelName = (t: TFunction, labelId: number): string => {
  const group = getLabelGroups(t).find((group) =>
    group.options.find((option) => option.value === labelId),
  );

  if (group) {
    const option = group.options.find((opt) => opt.value === labelId);
    return option?.name || "-";
  }

  return "-";
};

export const getExpandedLabelNames = (
  t: TFunction,
  labelId: number,
): string[] => {
  if (labelId === 3) {
    return getFieldTypeOptions(t)
      .filter((opt) => opt.value === 1 || opt.value === 2)
      .map((opt) => opt.label);
  }

  if (labelId === 6) {
    return getPlayerTypeOptions(t)
      .filter((opt) => opt.value === 4 || opt.value === 5)
      .map((opt) => opt.label);
  }

  return [getLabelName(t, labelId)];
};
