/**
 * Endpoint Layer: Task Tags
 *
 * Business logic for task tag management.
 * Composes database operations from the db layer.
 * Handles authentication and authorization.
 */

import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { authComponent } from "../auth";
import { rateLimiter } from "../rateLimiter";
import { TaskTags, Tasks } from "../db";
import { isValidTagName, isValidHexColor } from "../helpers/validation";

/**
 * Create a tag for a task
 */
export const create = mutation({
  args: {
    taskId: v.id("tasks"),
    name: v.string(),
    color: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // 1. Authentication
    const authUser = await authComponent.getAuthUser(ctx);
    if (!authUser) {
      throw new Error("Not authenticated");
    }

    // 2. Rate limiting
    const rateLimitStatus = await rateLimiter.limit(ctx, "createTag", {
      key: authUser._id,
    });
    if (!rateLimitStatus.ok) {
      throw new Error(
        `Rate limit exceeded. Please try again in ${Math.ceil(
          rateLimitStatus.retryAfter / 1000
        )} seconds.`
      );
    }

    // 3. Verify task ownership
    const task = await Tasks.getTaskById(ctx, args.taskId);
    if (!task) {
      throw new Error("Task not found");
    }

    if (task.userId !== authUser._id) {
      throw new Error("Not authorized to add tags to this task");
    }

    // 4. Validation
    if (!isValidTagName(args.name)) {
      throw new Error("Invalid tag name. Must be 1-50 characters.");
    }

    if (args.color && !isValidHexColor(args.color)) {
      throw new Error("Invalid color. Must be a valid hex color (e.g., #FF0000).");
    }

    // 5. Create tag
    return await TaskTags.createTaskTag(ctx, {
      userId: authUser._id,
      taskId: args.taskId,
      name: args.name.trim(),
      color: args.color,
    });
  },
});

/**
 * List all unique tag names for the current user
 */
export const listUniqueNames = query({
  handler: async (ctx) => {
    const authUser = await authComponent.getAuthUser(ctx);
    if (!authUser) {
      throw new Error("Not authenticated");
    }

    return await TaskTags.getUniqueTagNamesByUser(ctx, authUser._id);
  },
});

/**
 * List all tags for a specific task
 */
export const listByTask = query({
  args: {
    taskId: v.id("tasks"),
  },
  handler: async (ctx, args) => {
    const authUser = await authComponent.getAuthUser(ctx);
    if (!authUser) {
      throw new Error("Not authenticated");
    }

    // Verify task ownership
    const task = await Tasks.getTaskById(ctx, args.taskId);
    if (!task) {
      throw new Error("Task not found");
    }

    if (task.userId !== authUser._id) {
      throw new Error("Not authorized to view tags for this task");
    }

    return await TaskTags.getTaskTagsByTask(ctx, args.taskId);
  },
});

/**
 * Update a tag
 */
export const update = mutation({
  args: {
    id: v.id("taskTags"),
    name: v.optional(v.string()),
    color: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // 1. Authentication
    const authUser = await authComponent.getAuthUser(ctx);
    if (!authUser) {
      throw new Error("Not authenticated");
    }

    // 2. Rate limiting
    const rateLimitStatus = await rateLimiter.limit(ctx, "updateTag", {
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
    const tag = await TaskTags.getTaskTagById(ctx, args.id);
    if (!tag) {
      throw new Error("Tag not found");
    }

    if (tag.userId !== authUser._id) {
      throw new Error("Not authorized to update this tag");
    }

    // 4. Validation
    if (args.name !== undefined && !isValidTagName(args.name)) {
      throw new Error("Invalid tag name. Must be 1-50 characters.");
    }

    if (args.color !== undefined && !isValidHexColor(args.color)) {
      throw new Error("Invalid color. Must be a valid hex color (e.g., #FF0000).");
    }

    // 5. Update tag
    const { id, ...updateArgs } = args;
    const updates: any = {};

    if (updateArgs.name !== undefined) updates.name = updateArgs.name.trim();
    if (updateArgs.color !== undefined) updates.color = updateArgs.color;

    return await TaskTags.updateTaskTag(ctx, id, updates);
  },
});

/**
 * Delete a tag
 */
export const remove = mutation({
  args: {
    id: v.id("taskTags"),
  },
  handler: async (ctx, args) => {
    // 1. Authentication
    const authUser = await authComponent.getAuthUser(ctx);
    if (!authUser) {
      throw new Error("Not authenticated");
    }

    // 2. Rate limiting
    const rateLimitStatus = await rateLimiter.limit(ctx, "deleteTag", {
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
    const tag = await TaskTags.getTaskTagById(ctx, args.id);
    if (!tag) {
      throw new Error("Tag not found");
    }

    if (tag.userId !== authUser._id) {
      throw new Error("Not authorized to delete this tag");
    }

    // 4. Delete tag
    return await TaskTags.deleteTaskTag(ctx, args.id);
  },
});
