/**
 * Endpoint Layer: Tasks
 *
 * Business logic for task management.
 * Composes database operations from the db layer.
 * Handles authentication and authorization.
 */

import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { authComponent } from "../auth";
import { rateLimiter } from "../rateLimiter";
import { Tasks, TaskTags } from "../db";
import { isValidTaskTitle, isValidTaskDescription } from "../helpers/validation";

/**
 * Create a new task
 */
export const create = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    status: v.optional(
      v.union(v.literal("todo"), v.literal("in_progress"), v.literal("completed"))
    ),
    priority: v.optional(
      v.union(v.literal("low"), v.literal("medium"), v.literal("high"))
    ),
    dueDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // 1. Authentication
    const authUser = await authComponent.getAuthUser(ctx);
    if (!authUser) {
      throw new Error("Not authenticated");
    }

    // 2. Rate limiting
    const rateLimitStatus = await rateLimiter.limit(ctx, "createTask", {
      key: authUser._id,
    });
    if (!rateLimitStatus.ok) {
      throw new Error(
        `Rate limit exceeded. Please try again in ${Math.ceil(
          rateLimitStatus.retryAfter / 1000
        )} seconds.`
      );
    }

    // 3. Validation
    if (!isValidTaskTitle(args.title)) {
      throw new Error("Invalid task title. Must be 1-200 characters.");
    }

    if (args.description && !isValidTaskDescription(args.description)) {
      throw new Error("Invalid task description. Must be less than 2000 characters.");
    }

    // 4. Create task
    return await Tasks.createTask(ctx, {
      userId: authUser._id,
      title: args.title.trim(),
      description: args.description?.trim(),
      status: args.status || "todo",
      priority: args.priority || "medium",
      dueDate: args.dueDate,
    });
  },
});

/**
 * List all tasks for the current user
 */
export const list = query({
  handler: async (ctx) => {
    const authUser = await authComponent.getAuthUser(ctx);
    if (!authUser) {
      throw new Error("Not authenticated");
    }

    return await Tasks.getTasksByUser(ctx, authUser._id);
  },
});

/**
 * List tasks by status
 */
export const listByStatus = query({
  args: {
    status: v.union(
      v.literal("todo"),
      v.literal("in_progress"),
      v.literal("completed")
    ),
  },
  handler: async (ctx, args) => {
    const authUser = await authComponent.getAuthUser(ctx);
    if (!authUser) {
      throw new Error("Not authenticated");
    }

    return await Tasks.getTasksByUserAndStatus(ctx, authUser._id, args.status);
  },
});

/**
 * List tasks by priority
 */
export const listByPriority = query({
  args: {
    priority: v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
  },
  handler: async (ctx, args) => {
    const authUser = await authComponent.getAuthUser(ctx);
    if (!authUser) {
      throw new Error("Not authenticated");
    }

    return await Tasks.getTasksByUserAndPriority(ctx, authUser._id, args.priority);
  },
});

/**
 * Get overdue tasks
 */
export const listOverdue = query({
  handler: async (ctx) => {
    const authUser = await authComponent.getAuthUser(ctx);
    if (!authUser) {
      throw new Error("Not authenticated");
    }

    return await Tasks.getOverdueTasksByUser(ctx, authUser._id);
  },
});

/**
 * Get a single task by ID
 */
export const get = query({
  args: {
    id: v.id("tasks"),
  },
  handler: async (ctx, args) => {
    const authUser = await authComponent.getAuthUser(ctx);
    if (!authUser) {
      throw new Error("Not authenticated");
    }

    const task = await Tasks.getTaskById(ctx, args.id);

    if (!task) {
      throw new Error("Task not found");
    }

    if (task.userId !== authUser._id) {
      throw new Error("Not authorized to view this task");
    }

    return task;
  },
});

/**
 * Update a task
 */
export const update = mutation({
  args: {
    id: v.id("tasks"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    status: v.optional(
      v.union(v.literal("todo"), v.literal("in_progress"), v.literal("completed"))
    ),
    priority: v.optional(
      v.union(v.literal("low"), v.literal("medium"), v.literal("high"))
    ),
    dueDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // 1. Authentication
    const authUser = await authComponent.getAuthUser(ctx);
    if (!authUser) {
      throw new Error("Not authenticated");
    }

    // 2. Rate limiting
    const rateLimitStatus = await rateLimiter.limit(ctx, "updateTask", {
      key: authUser._id,
    });
    if (!rateLimitStatus.ok) {
      throw new Error(
        `Rate limit exceeded. Please try again in ${Math.ceil(
          rateLimitStatus.retryAfter / 1000
        )} seconds.`
      );
    }

    // 3. Verify ownership
    const task = await Tasks.getTaskById(ctx, args.id);
    if (!task) {
      throw new Error("Task not found");
    }

    if (task.userId !== authUser._id) {
      throw new Error("Not authorized to update this task");
    }

    // 4. Validation
    if (args.title !== undefined && !isValidTaskTitle(args.title)) {
      throw new Error("Invalid task title. Must be 1-200 characters.");
    }

    if (args.description !== undefined && !isValidTaskDescription(args.description)) {
      throw new Error("Invalid task description. Must be less than 2000 characters.");
    }

    // 5. Update task
    const { id, ...updateArgs } = args;
    const updates: any = {};

    if (updateArgs.title !== undefined) updates.title = updateArgs.title.trim();
    if (updateArgs.description !== undefined)
      updates.description = updateArgs.description.trim();
    if (updateArgs.status !== undefined) updates.status = updateArgs.status;
    if (updateArgs.priority !== undefined) updates.priority = updateArgs.priority;
    if (updateArgs.dueDate !== undefined) updates.dueDate = updateArgs.dueDate;

    return await Tasks.updateTask(ctx, id, updates);
  },
});

/**
 * Delete a task and all its tags
 */
export const remove = mutation({
  args: {
    id: v.id("tasks"),
  },
  handler: async (ctx, args) => {
    // 1. Authentication
    const authUser = await authComponent.getAuthUser(ctx);
    if (!authUser) {
      throw new Error("Not authenticated");
    }

    // 2. Rate limiting
    const rateLimitStatus = await rateLimiter.limit(ctx, "deleteTask", {
      key: authUser._id,
    });
    if (!rateLimitStatus.ok) {
      throw new Error(
        `Rate limit exceeded. Please try again in ${Math.ceil(
          rateLimitStatus.retryAfter / 1000
        )} seconds.`
      );
    }

    // 3. Verify ownership
    const task = await Tasks.getTaskById(ctx, args.id);
    if (!task) {
      throw new Error("Task not found");
    }

    if (task.userId !== authUser._id) {
      throw new Error("Not authorized to delete this task");
    }

    // 4. Delete all tags for this task first
    await TaskTags.deleteTaskTagsByTask(ctx, args.id);

    // 5. Delete the task
    return await Tasks.deleteTask(ctx, args.id);
  },
});

/**
 * Get task counts by status
 */
export const getCounts = query({
  handler: async (ctx) => {
    const authUser = await authComponent.getAuthUser(ctx);
    if (!authUser) {
      throw new Error("Not authenticated");
    }

    return await Tasks.getTaskCountsByStatus(ctx, authUser._id);
  },
});
