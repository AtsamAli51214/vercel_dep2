import { DEFAULT_LEARNING_LINE_CATEGORY_DISTRIBUTION } from "@/constants/learningLineCategoryDistribution";
import type {
  LearningLineCategoryDistribution,
  LearningLineSkillsOverview,
  LearningLineSkillsOverviewPhase,
  LearningLineSkillsOverviewSkillRef,
  LearningLineSkillsOverviewWeek,
} from "@/types/learningLine";

export function parseCategoryDistribution(
  raw: unknown,
): LearningLineCategoryDistribution | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const categories = o.categories;
  if (!Array.isArray(categories) || categories.length === 0) return null;
  const phasesRaw = o.phases;
  const phases = Array.isArray(phasesRaw)
    ? phasesRaw.filter(
        (p): p is { segmentId: number; name: string; position: number } =>
          p != null &&
          typeof p === "object" &&
          typeof (p as { segmentId?: unknown }).segmentId === "number",
      )
    : [];
  const sel = o.selectedPhase;
  const selectedPhase =
    sel != null &&
    typeof sel === "object" &&
    typeof (sel as { segmentId?: unknown }).segmentId === "number"
      ? (sel as LearningLineCategoryDistribution["selectedPhase"])
      : (phases[0] ??
        DEFAULT_LEARNING_LINE_CATEGORY_DISTRIBUTION.selectedPhase);
  const mappedCategories = categories
    .filter(
      (c): c is Record<string, unknown> =>
        c != null &&
        typeof c === "object" &&
        ("categoryId" in c || "CategoryId" in c),
    )
    .map((c) => ({
      categoryId: Number(
        c.categoryId ?? (c as { CategoryId?: unknown }).CategoryId,
      ),
      name: String(c.name ?? (c as { Name?: unknown }).Name ?? ""),
      percentage:
        Number(
          c.percentage ??
            (c as { Percentage?: unknown }).Percentage ??
            (c as { percent?: unknown }).percent,
        ) || 0,
    }));
  if (!mappedCategories.length) return null;
  return {
    phases: phases.length
      ? phases
      : DEFAULT_LEARNING_LINE_CATEGORY_DISTRIBUTION.phases,
    selectedPhase,
    categories: mappedCategories,
  };
}

export function parseSkillsOverview(
  raw: unknown,
): LearningLineSkillsOverview | null {
  if (!raw || typeof raw !== "object") return null;
  const phasesRaw = (raw as Record<string, unknown>).phases;
  if (!Array.isArray(phasesRaw) || phasesRaw.length === 0) return null;
  const phases: LearningLineSkillsOverviewPhase[] = [];
  for (const p of phasesRaw) {
    if (!p || typeof p !== "object") continue;
    const o = p as Record<string, unknown>;
    const segmentId = Number(o.segmentId);
    if (!Number.isFinite(segmentId)) continue;
    const segmentName = String(o.segmentName ?? o.name ?? "");
    const position = Number(o.position) || 0;
    const weeksRaw = o.weeks;
    const weeks: LearningLineSkillsOverviewWeek[] = [];
    if (Array.isArray(weeksRaw)) {
      for (const w of weeksRaw) {
        if (!w || typeof w !== "object") continue;
        const wo = w as Record<string, unknown>;
        const skillsRaw = wo.skills;
        const skills: LearningLineSkillsOverviewSkillRef[] = [];
        if (Array.isArray(skillsRaw)) {
          for (const s of skillsRaw) {
            if (!s || typeof s !== "object") continue;
            const so = s as Record<string, unknown>;
            const sid = Number(so.skillId ?? so.SkillId);
            if (!Number.isFinite(sid)) continue;
            skills.push({
              skillId: sid,
              name: String(so.name ?? so.Name ?? ""),
            });
          }
        }
        weeks.push({
          weekId: Number(wo.weekId ?? wo.WeekId) || 0,
          weekNumber: Number(wo.weekNumber) || 0,
          name: String(wo.name ?? ""),
          skills,
        });
      }
    }
    phases.push({ segmentId, segmentName, position, weeks });
  }
  return phases.length ? { phases } : null;
}

/** Calendar bounds for one week within a segment (from dashboard `seasonPlan`). */
export type SegmentWeekBounds = {
  weekNumber: number;
  startMs: number;
  endMs: number;
};

/**
 * Parses `seasonPlan.segments[].weeks` so skills timeline range bars match real season dates.
 */
export function parseSeasonPlanWeekBounds(
  raw: unknown,
): Map<number, SegmentWeekBounds[]> | null {
  if (!raw || typeof raw !== "object") return null;
  const segments = (raw as Record<string, unknown>).segments;
  if (!Array.isArray(segments)) return null;
  const map = new Map<number, SegmentWeekBounds[]>();
  for (const seg of segments) {
    if (!seg || typeof seg !== "object") continue;
    const so = seg as Record<string, unknown>;
    const segmentId = Number(so.segmentId);
    if (!Number.isFinite(segmentId)) continue;
    const weeksRaw = so.weeks;
    if (!Array.isArray(weeksRaw)) continue;
    const bounds: SegmentWeekBounds[] = [];
    for (const w of weeksRaw) {
      if (!w || typeof w !== "object") continue;
      const wo = w as Record<string, unknown>;
      const wn = Math.round(Number(wo.weekNumber));
      const sd = String(wo.startDate ?? "");
      const ed = String(wo.endDate ?? "");
      if (!Number.isFinite(wn) || wn < 1 || !sd || !ed) continue;
      const startMs = Date.parse(
        sd.includes("T") ? sd : `${sd}T00:00:00.000Z`,
      );
      const endMs = Date.parse(
        ed.includes("T") ? ed : `${ed}T23:59:59.999Z`,
      );
      if (!Number.isFinite(startMs) || !Number.isFinite(endMs)) continue;
      const idx = bounds.findIndex((b) => b.weekNumber === wn);
      if (idx >= 0) bounds[idx] = { weekNumber: wn, startMs, endMs };
      else bounds.push({ weekNumber: wn, startMs, endMs });
    }
    bounds.sort((a, b) => a.weekNumber - b.weekNumber);
    map.set(segmentId, bounds);
  }
  return map.size ? map : null;
}
