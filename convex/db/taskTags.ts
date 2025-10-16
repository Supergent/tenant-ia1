/**
 * Database Layer: Task Tags
 *
 * This is the ONLY file that directly accesses the taskTags table using ctx.db.
 * All taskTags-related database operations are defined here as pure async functions.
 */

import { QueryCtx, MutationCtx } from "../_generated/server";
import { Id } from "../_generated/dataModel";

// CREATE
export async function createTaskTag(
  ctx: MutationCtx,
  args: {
    userId: string;
    taskId: Id<"tasks">;
    name: string;
    color?: string;
  }
) {
  const now = Date.now();
  return await ctx.db.insert("taskTags", {
    ...args,
    createdAt: now,
  });
}

// READ - Get by ID
export async function getTaskTagById(ctx: QueryCtx, id: Id<"taskTags">) {
  return await ctx.db.get(id);
}

// READ - Get all tags by user
export async function getTaskTagsByUser(ctx: QueryCtx, userId: string) {
  return await ctx.db
    .query("taskTags")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .order("desc")
    .collect();
}

// READ - Get tags for a specific task
export async function getTaskTagsByTask(ctx: QueryCtx, taskId: Id<"tasks">) {
  return await ctx.db
    .query("taskTags")
    .withIndex("by_task", (q) => q.eq("taskId", taskId))
    .collect();
}

// READ - Get tag by user and name (to prevent duplicates)
export async function getTaskTagByUserAndName(
  ctx: QueryCtx,
  userId: string,
  name: string
) {
  return await ctx.db
    .query("taskTags")
    .withIndex("by_user_and_name", (q) =>
      q.eq("userId", userId).eq("name", name)
    )
    .first();
}

// READ - Get unique tag names by user
export async function getUniqueTagNamesByUser(ctx: QueryCtx, userId: string) {
  const tags = await getTaskTagsByUser(ctx, userId);
  const uniqueNames = new Set(tags.map((tag) => tag.name));
  return Array.from(uniqueNames);
}

// UPDATE
export async function updateTaskTag(
  ctx: MutationCtx,
  id: Id<"taskTags">,
  args: {
    name?: string;
    color?: string;
  }
) {
  return await ctx.db.patch(id, args);
}

// DELETE
export async function deleteTaskTag(ctx: MutationCtx, id: Id<"taskTags">) {
  return await ctx.db.delete(id);
}

// DELETE - Remove all tags for a task
export async function deleteTaskTagsByTask(
  ctx: MutationCtx,
  taskId: Id<"tasks">
) {
  const tags = await ctx.db
    .query("taskTags")
    .withIndex("by_task", (q) => q.eq("taskId", taskId))
    .collect();

  for (const tag of tags) {
    await ctx.db.delete(tag._id);
  }
}
