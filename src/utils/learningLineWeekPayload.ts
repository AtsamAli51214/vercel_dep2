import type { LearningLineWeekContentItem, Content } from "@/types";

function thumbnailFromLibraryRecord(contentItem: unknown): string {
  if (!contentItem || typeof contentItem !== "object") return "";
  const o = contentItem as Record<string, unknown>;
  const u = o.thumbnailUrl ?? o.thumbnail ?? o.ThumbnailUrl ?? o.Thumbnail;
  return typeof u === "string" && u.trim() ? u.trim() : "";
}

export interface WeekSavePayload {
  weekName: string;
  weekSummary: string;
  weekNotes: string;
  items: Array<{
    id?: number;
    contentId: number;
    contentType: number;
    name: string;
    tags: string[];
    durationWeeks?: number;
    skillIds?: number[];
  }>;
  removeContentIds: number[];
}

export function mapContentItemsToSavePayload(
  contentItems: LearningLineWeekContentItem[],
  getContentItemById: (type: number | null, id: number | null) => any,
): WeekSavePayload["items"] {
  return contentItems
    .filter((item) => item.contentType && item.contentId)
    .map((item) => {
      const contentItem = getContentItemById(item.contentType, item.contentId);

      const tags: string[] = item.tags
        ? Array.isArray(item.tags)
          ? item.tags
          : [item.tags]
        : [];

      return {
        ...(item.id != null && { id: item.id }),
        contentId: item.contentId!,
        contentType: item.contentType!,
        name: item.name || contentItem?.title || "",
        tags,
        ...(item.contentType === 5 && {
          durationWeeks: item.durationWeeks ?? undefined,
        }),
        ...(item.contentType === 4 &&
          item.skillIds &&
          item.skillIds.length > 0 && { skillIds: item.skillIds }),
      };
    });
}

export function mapWeekContentRowsToContentCards(
  contentItems: LearningLineWeekContentItem[],
  getContentItemById: (type: number | null, id: number | null) => any,
  options: { activeIndex: "add" | number | null; isViewMode: boolean },
): Array<Content & { _originalIndex: number }> {
  return contentItems
    .map((item, index) => {
      if (!options.isViewMode && options.activeIndex === index) {
        return null;
      }
      const contentItem = getContentItemById(item.contentType, item.contentId);
      const fromItem =
        typeof item.thumbnailUrl === "string" && item.thumbnailUrl.trim()
          ? item.thumbnailUrl.trim()
          : "";
      const thumbnailUrl =
        fromItem || thumbnailFromLibraryRecord(contentItem) || "";
      return {
        id: item.id ?? index,
        contentType: item.contentType ?? 0,
        title: item.name || item.title || "—",
        description: "",
        clubId: 0,
        clubName: "",
        thumbnailUrl,
        fileUrl: "",
        mediaCount: 0,
        tagNames: Array.isArray(item.tags)
          ? item.tags
          : item.tags
            ? [item.tags]
            : [],
        federationNames: [],
        isLinked: false,
        internalTitle: null,
        text: null,
        organisation: null,
        rules: null,
        easierExercise: null,
        difficultExercise: null,
        moduleCount: null,
        lessonCount: null,
        courseName: null,
        moduleName: null,
        modules: null,
        files: (contentItem as any)?.files || [],
        isDraft: false,
        isPublished: true,
        _originalIndex: index,
      } as Content & { _originalIndex: number };
    })
    .filter(
      (item): item is Content & { _originalIndex: number } => item !== null,
    );
}
