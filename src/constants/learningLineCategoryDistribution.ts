import type { LearningLineCategoryDistribution } from "@/types/learningLine";

export const DEFAULT_LEARNING_LINE_CATEGORY_DISTRIBUTION: LearningLineCategoryDistribution =
  {
    phases: [
      { segmentId: 30, name: "First half", position: 0 },
      { segmentId: 31, name: "Indoor", position: 1 },
      { segmentId: 32, name: "Second half", position: 2 },
    ],
    selectedPhase: {
      segmentId: 30,
      name: "First half",
      position: 0,
    },
    categories: [
      { categoryId: 25, name: "Techniques", percentage: 0 },
      { categoryId: 26, name: "Tactics", percentage: 0 },
      { categoryId: 27, name: "Physical", percentage: 0 },
      { categoryId: 28, name: "Mental", percentage: 0 },
    ],
  };
