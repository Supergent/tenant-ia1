/**
 * Application Constants
 *
 * Shared constants used across the application.
 */

// Task status options
export const TASK_STATUSES = ["todo", "in_progress", "completed"] as const;
export type TaskStatus = (typeof TASK_STATUSES)[number];

// Task priority options
export const TASK_PRIORITIES = ["low", "medium", "high"] as const;
export type TaskPriority = (typeof TASK_PRIORITIES)[number];

// Theme options
export const THEMES = ["light", "dark", "system"] as const;
export type Theme = (typeof THEMES)[number];

// View options
export const VIEW_MODES = ["list", "board", "calendar"] as const;
export type ViewMode = (typeof VIEW_MODES)[number];

// Default tag colors
export const DEFAULT_TAG_COLORS = [
  "#ef4444", // red
  "#f97316", // orange
  "#facc15", // yellow
  "#16a34a", // green
  "#0ea5e9", // blue
  "#6366f1", // indigo
  "#a855f7", // purple
  "#ec4899", // pink
] as const;

// Pagination
export const DEFAULT_PAGE_SIZE = 50;
export const MAX_PAGE_SIZE = 100;

// Rate limits
export const RATE_LIMITS = {
  CREATE_TASK: 30, // 30 tasks per minute
  UPDATE_TASK: 60, // 60 updates per minute
  DELETE_TASK: 20, // 20 deletes per minute
  CREATE_TAG: 20, // 20 tags per minute
} as const;
