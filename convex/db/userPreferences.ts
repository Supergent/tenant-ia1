/**
 * Database Layer: User Preferences
 *
 * This is the ONLY file that directly accesses the userPreferences table using ctx.db.
 * All userPreferences-related database operations are defined here as pure async functions.
 */

import { QueryCtx, MutationCtx } from "../_generated/server";
import { Id } from "../_generated/dataModel";

// CREATE
export async function createUserPreferences(
  ctx: MutationCtx,
  args: {
    userId: string;
    theme?: "light" | "dark" | "system";
    defaultView?: "list" | "board" | "calendar";
    notifications?: boolean;
  }
) {
  const now = Date.now();
  return await ctx.db.insert("userPreferences", {
    userId: args.userId,
    theme: args.theme || "system",
    defaultView: args.defaultView || "list",
    notifications: args.notifications ?? true,
    createdAt: now,
    updatedAt: now,
  });
}

// READ - Get by ID
export async function getUserPreferencesById(
  ctx: QueryCtx,
  id: Id<"userPreferences">
) {
  return await ctx.db.get(id);
}

// READ - Get by user
export async function getUserPreferencesByUser(
  ctx: QueryCtx,
  userId: string
) {
  return await ctx.db
    .query("userPreferences")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .first();
}

// UPDATE
export async function updateUserPreferences(
  ctx: MutationCtx,
  id: Id<"userPreferences">,
  args: {
    theme?: "light" | "dark" | "system";
    defaultView?: "list" | "board" | "calendar";
    notifications?: boolean;
  }
) {
  return await ctx.db.patch(id, {
    ...args,
    updatedAt: Date.now(),
  });
}

// DELETE
export async function deleteUserPreferences(
  ctx: MutationCtx,
  id: Id<"userPreferences">
) {
  return await ctx.db.delete(id);
}

// UPSERT - Get or create preferences for a user
export async function getOrCreateUserPreferences(
  ctx: MutationCtx,
  userId: string
) {
  const existing = await getUserPreferencesByUser(ctx, userId);

  if (existing) {
    return existing;
  }

  const id = await createUserPreferences(ctx, { userId });
  return await ctx.db.get(id);
}
