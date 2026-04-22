export const PRIMARY = "var(--color-primary)";
export const GRID = "var(--color-stroke)";
export const MUTED = "var(--color-text-gray)";

export const FOCUS_TACTICS = "#3AA0FF";
export const FOCUS_PHYSICAL = "#84CC15";
export const FOCUS_MENTAL = "#F97315";

/** Hex values for Apex donut + legend dots (CSS variables are unreliable in SVG charts). */
export const FOCUS_COLORS = [
  "#55417c",
  FOCUS_TACTICS,
  FOCUS_PHYSICAL,
  FOCUS_MENTAL,
] as const;

/** Shared white card height: skills timeline + focus donut (learning line dashboard). */
export const LEARNING_LINE_DASHBOARD_CHART_CARD_HEIGHT_PX = 608;
