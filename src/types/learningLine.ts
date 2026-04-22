import { LearningLine } from "./common";

export interface LearningLineWeek {
  id: number;
  name: string;
  weekNumber: number;
  startDate: string;
  endDate: string;
  position: number;
  notes: string | null;
  description?: string;
  contentCount: number;
  contentCountByType: Record<string, number>;
  totalWeeks: number;
}

export interface LearningLineWeekContentItem {
  id?: number;
  contentType: number | null;
  contentCountByType?: {
    exercise?: number;
    skill?: number;
    article?: number;
    course?: number;
    ebook?: number;
  } | null;
  contentId: number | null;
  tags?: string | string[];
  durationWeeks?: number | null;
  skillIds?: number[];
  linkedSkills?: {
    id: number;
    title: string;
  }[];
  name?: string;
  title?: string;
  thumbnailUrl?: string | null;
}

export interface LearningLineWeekSection {
  id?: number;
  weeks: LearningLineWeek[];
}

export interface LearningLineWithPlan extends LearningLine {
  segments: LearningLineWeekSection[];
  source?: string;
}

export type LearningLineWeekActionPayload =
  | {
      action: "edit" | "view" | "addContent" | "delete";
      weekId: number;
      segmentIndex: number;
      weekNumber: number;
    }
  | {
      action: "drag";
      fromSectionId: number;
      toSectionId: number;
      weekId: number;
      position: number;
    };

export type LearningLineDetailApi = Record<string, unknown>;

export interface PracticeScheduleProps {
  code?: string;
  description?: string;
}

export interface LearningLineDetailsData {
  name: string;
  targetGroupIds?: number[];
  clubIds?: number[];
  ageCategoryIds?: number[];
  seasonId?: string | number;
  seasonName?: string;
  startDate?: Date | string | null;
  endDate?: Date | string | null;
  description?: string;
  isRecurring?: boolean;
}

export interface UseLearningLineFormProps {
  learningLineData?: LearningLine | null;
  isViewOnly?: boolean;
}

export type UseLearningLineFormEmit = (
  event: "close" | "learningLineCreatedUpdated",
  ...args: unknown[]
) => void;

export interface LearningLineDetailsProps {
  initialData?: Partial<LearningLineDetailsData>;
  isEditMode?: boolean;
  lineStatus?: number;
}

export interface LearningLineCategoryDistributionPhase {
  segmentId: number;
  name: string;
  position: number;
}

export interface LearningLineCategoryDistributionCategory {
  categoryId: number;
  name: string;
  percentage: number;
}

export interface LearningLineCategoryDistribution {
  phases: LearningLineCategoryDistributionPhase[];
  selectedPhase: {
    segmentId: number;
    name: string;
    position: number;
  };
  categories: LearningLineCategoryDistributionCategory[];
}

export interface LearningLineSkillsOverviewSkillRef {
  skillId: number;
  name: string;
}

export interface LearningLineSkillsOverviewWeek {
  weekId: number;
  weekNumber: number;
  name: string;
  skills: LearningLineSkillsOverviewSkillRef[];
}

export interface LearningLineSkillsOverviewPhase {
  segmentId: number;
  segmentName: string;
  position: number;
  weeks: LearningLineSkillsOverviewWeek[];
}

export interface LearningLineSkillsOverview {
  phases: LearningLineSkillsOverviewPhase[];
}
