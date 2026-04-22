import type {
  LearningLineDetailApi,
  LearningLineWeek,
  LearningLineWeekContentItem,
} from "@/types";

export type ActiveLearningLineWeekPayload = {
  week: LearningLineWeek;
  contentItems: LearningLineWeekContentItem[];
};

function weekFromApiRow(row: Record<string, unknown>): LearningLineWeek {
  return {
    id: (row.id ?? row.Id) as number,
    name: (row.name ?? row.Name ?? "") as string,
    weekNumber: (row.weekNumber ?? row.WeekNumber) as number,
    startDate: (row.startDate ?? row.StartDate) as string,
    endDate: (row.endDate ?? row.EndDate) as string,
    position: (row.position ?? row.Position ?? 0) as number,
    notes: (row.notes ?? row.Notes ?? null) as string | null,
    description: (row.description ?? row.Description ?? "") as string,
    contentCount: (row.contentCount ?? row.ContentCount ?? 0) as number,
    contentCountByType: (row.contentCountByType ??
      row.ContentCountByType ??
      {}) as Record<string, number>,
    totalWeeks: (row.totalWeeks ?? row.TotalWeeks ?? 0) as number,
  };
}

function contentItemsFromWeekRow(
  row: Record<string, unknown>,
): LearningLineWeekContentItem[] {
  const raw = (row.contentItems ?? row.ContentItems ?? []) as unknown[];
  return raw.map((item) => {
    const c = item as Record<string, unknown>;

    let tags: string | string[] | undefined = (c.tags ?? c.Tags) as
      | string
      | string[]
      | undefined;
    if (tags === "") tags = undefined;

    const rawLinked = (c.linkedSkills ?? c.LinkedSkills ?? []) as
      | { id?: number; Id?: number }[]
      | undefined;
    const idsFromLinked =
      Array.isArray(rawLinked) && rawLinked.length > 0
        ? rawLinked
            .map((s) => (s.id ?? s.Id) as number | undefined)
            .filter((id): id is number => id != null && Number.isFinite(id))
        : [];

    const rawSkillIds = (c.skillIds ??
      c.SkillIds ??
      c.selectedSkillIds ??
      c.SelectedSkillIds) as number[] | undefined;
    const fromExplicit =
      rawSkillIds && Array.isArray(rawSkillIds) && rawSkillIds.length > 0
        ? rawSkillIds
        : [];
    const resolvedSkillIds =
      fromExplicit.length > 0 ? fromExplicit : idsFromLinked;

    const contentId = (c.contentId ?? null) as number | null;

    const durationRaw = (c.duration ??
      c.Duration ??
      c.durationWeeks ??
      c.DurationWeeks ??
      null) as number | null;

    return {
      id: (c.id ?? c.Id) as number | undefined,
      contentType: (c.contentType ?? c.ContentType ?? null) as number | null,
      contentId,
      tags,
      name: (c.title ?? c.name) as string | undefined,
      title: (c.title ?? c.Title) as string | undefined,
      thumbnailUrl: (c.thumbnailUrl ?? c.ThumbnailUrl ?? null) as
        | string
        | null
        | undefined,
      durationWeeks: durationRaw,
      skillIds: resolvedSkillIds,
    };
  });
}

/** Walk segments/weeks and return the first week whose id matches. */
export function findWeekInCachedDetail(
  detail: LearningLineDetailApi,
  weekId: number,
): ActiveLearningLineWeekPayload | null {
  const segments = (detail.segments ??
    (detail as { Segments?: unknown[] }).Segments ??
    []) as unknown[];

  for (const seg of segments) {
    const s = seg as Record<string, unknown>;
    const weeks = (s.weeks ?? s.Weeks ?? []) as unknown[];
    for (const w of weeks) {
      const row = w as Record<string, unknown>;
      const id = (row.id ?? row.Id) as number;
      if (id === weekId) {
        return {
          week: weekFromApiRow(row),
          contentItems: contentItemsFromWeekRow(row),
        };
      }
    }
  }
  return null;
}

/** True if this object looks like a full learning-line GET payload. */
function hasSegmentsPayload(o: Record<string, unknown>): boolean {
  return (
    Array.isArray(o.segments) || ("Segments" in o && Array.isArray(o.Segments))
  );
}

/**
 * Mutation APIs sometimes return `{ data: { ... } }` or a bare body.
 * Returns the inner object if it includes `segments`, else null.
 */
export function extractDetailFromMutationResponse(
  body: unknown,
): LearningLineDetailApi | null {
  let node: unknown = body;
  for (let i = 0; i < 5 && node && typeof node === "object"; i++) {
    const o = node as Record<string, unknown>;
    if (hasSegmentsPayload(o)) {
      return node as LearningLineDetailApi;
    }
    const inner = o.data;
    if (inner !== undefined && inner !== null && typeof inner === "object") {
      node = inner;
    } else {
      break;
    }
  }
  return null;
}
