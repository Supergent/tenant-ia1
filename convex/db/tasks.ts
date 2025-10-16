/**
 * Database Layer: Tasks
 *
 * This is the ONLY file that directly accesses the tasks table using ctx.db.
 * All tasks-related database operations are defined here as pure async functions.
 */

import { QueryCtx, MutationCtx } from "../_generated/server";
import { Id } from "../_generated/dataModel";

// CREATE
export async function createTask(
  ctx: MutationCtx,
  args: {
    userId: string;
    title: string;
    description?: string;
    status: "todo" | "in_progress" | "completed";
    priority: "low" | "medium" | "high";
    dueDate?: number;
  }
) {
  const now = Date.now();
  return await ctx.db.insert("tasks", {
    ...args,
    createdAt: now,
    updatedAt: now,
  });
}

// READ - Get by ID
export async function getTaskById(ctx: QueryCtx, id: Id<"tasks">) {
  return await ctx.db.get(id);
}

// READ - Get all tasks by user
export async function getTasksByUser(ctx: QueryCtx, userId: string) {
  return await ctx.db
    .query("tasks")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .order("desc")
    .collect();
}

// READ - Get tasks by user and status
export async function getTasksByUserAndStatus(
  ctx: QueryCtx,
  userId: string,
  status: "todo" | "in_progress" | "completed"
) {
  return await ctx.db
    .query("tasks")
    .withIndex("by_user_and_status", (q) =>
      q.eq("userId", userId).eq("status", status)
    )
    .order("desc")
    .collect();
}

// READ - Get tasks by user and priority
export async function getTasksByUserAndPriority(
  ctx: QueryCtx,
  userId: string,
  priority: "low" | "medium" | "high"
) {
  return await ctx.db
    .query("tasks")
    .withIndex("by_user_and_priority", (q) =>
      q.eq("userId", userId).eq("priority", priority)
    )
    .order("desc")
    .collect();
}

// READ - Get tasks by user with due date
export async function getTasksByUserWithDueDate(
  ctx: QueryCtx,
  userId: string
) {
  return await ctx.db
    .query("tasks")
    .withIndex("by_user_and_due_date", (q) => q.eq("userId", userId))
    .filter((q) => q.neq(q.field("dueDate"), undefined))
    .order("desc")
    .collect();
}

// READ - Get overdue tasks
export async function getOverdueTasksByUser(ctx: QueryCtx, userId: string) {
  const now = Date.now();
  const tasks = await ctx.db
    .query("tasks")
    .withIndex("by_user_and_status", (q) =>
      q.eq("userId", userId).eq("status", "todo")
    )
    .collect();

  return tasks.filter((task) => task.dueDate && task.dueDate < now);
}

// UPDATE
export async function updateTask(
  ctx: MutationCtx,
  id: Id<"tasks">,
  args: {
    title?: string;
    description?: string;
    status?: "todo" | "in_progress" | "completed";
    priority?: "low" | "medium" | "high";
    dueDate?: number;
  }
) {
  const updates: any = {
    ...args,
    updatedAt: Date.now(),
  };

  // If status is being set to completed, set completedAt
  if (args.status === "completed") {
    updates.completedAt = Date.now();
  }

  // If status is being changed from completed to something else, clear completedAt
  if (args.status && args.status !== "completed") {
    const task = await ctx.db.get(id);
    if (task?.status === "completed") {
      updates.completedAt = undefined;
    }
  }

  return await ctx.db.patch(id, updates);
}

// DELETE
export async function deleteTask(ctx: MutationCtx, id: Id<"tasks">) {
  return await ctx.db.delete(id);
}

// COUNT - Get task counts by status
export async function getTaskCountsByStatus(ctx: QueryCtx, userId: string) {
  const allTasks = await getTasksByUser(ctx, userId);

  return {
    total: allTasks.length,
    todo: allTasks.filter((t) => t.status === "todo").length,
    in_progress: allTasks.filter((t) => t.status === "in_progress").length,
    completed: allTasks.filter((t) => t.status === "completed").length,
  };
}
