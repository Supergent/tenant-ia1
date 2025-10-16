import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

/**
 * Database Schema for Todo App
 *
 * Architecture: Four-layer Convex pattern
 * - All tables are user-scoped with userId
 * - Includes proper indexes for common queries
 * - Uses status literals for type safety
 * - Timestamps for tracking creation and updates
 */
export default defineSchema({
  /**
   * Tasks Table
   * Core todo items with status tracking and priorities
   */
  tasks: defineTable({
    userId: v.string(),
    title: v.string(),
    description: v.optional(v.string()),
    status: v.union(
      v.literal("todo"),
      v.literal("in_progress"),
      v.literal("completed")
    ),
    priority: v.union(
      v.literal("low"),
      v.literal("medium"),
      v.literal("high")
    ),
    dueDate: v.optional(v.number()),
    completedAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_and_status", ["userId", "status"])
    .index("by_user_and_priority", ["userId", "priority"])
    .index("by_user_and_due_date", ["userId", "dueDate"]),

  /**
   * Task Tags Table
   * Allows users to categorize tasks with custom tags
   */
  taskTags: defineTable({
    userId: v.string(),
    taskId: v.id("tasks"),
    name: v.string(),
    color: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_task", ["taskId"])
    .index("by_user_and_name", ["userId", "name"]),

  /**
   * User Preferences Table
   * Store user-specific settings and preferences
   */
  userPreferences: defineTable({
    userId: v.string(),
    theme: v.union(v.literal("light"), v.literal("dark"), v.literal("system")),
    defaultView: v.union(v.literal("list"), v.literal("board"), v.literal("calendar")),
    notifications: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"]),
});
