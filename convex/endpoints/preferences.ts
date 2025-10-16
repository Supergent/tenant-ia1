/**
 * Endpoint Layer: User Preferences
 *
 * Business logic for user preference management.
 * Composes database operations from the db layer.
 * Handles authentication and authorization.
 */

import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { authComponent } from "../auth";
import { rateLimiter } from "../rateLimiter";
import { UserPreferences } from "../db";

/**
 * Get current user's preferences (creates default if none exist)
 */
export const get = query({
  handler: async (ctx) => {
    const authUser = await authComponent.getAuthUser(ctx);
    if (!authUser) {
      throw new Error("Not authenticated");
    }

    // This will return existing preferences or null
    return await UserPreferences.getUserPreferencesByUser(ctx, authUser._id);
  },
});

/**
 * Initialize preferences for a new user
 */
export const initialize = mutation({
  handler: async (ctx) => {
    const authUser = await authComponent.getAuthUser(ctx);
    if (!authUser) {
      throw new Error("Not authenticated");
    }

    // Check if preferences already exist
    const existing = await UserPreferences.getUserPreferencesByUser(
      ctx,
      authUser._id
    );

    if (existing) {
      return existing;
    }

    // Create default preferences
    return await UserPreferences.getOrCreateUserPreferences(ctx, authUser._id);
  },
});

/**
 * Update user preferences
 */
export const update = mutation({
  args: {
    theme: v.optional(
      v.union(v.literal("light"), v.literal("dark"), v.literal("system"))
    ),
    defaultView: v.optional(
      v.union(v.literal("list"), v.literal("board"), v.literal("calendar"))
    ),
    notifications: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    // 1. Authentication
    const authUser = await authComponent.getAuthUser(ctx);
    if (!authUser) {
      throw new Error("Not authenticated");
    }

    // 2. Rate limiting
    const rateLimitStatus = await rateLimiter.limit(ctx, "updatePreferences", {
      key: authUser._id,
    });
    if (!rateLimitStatus.ok) {
      throw new Error(
        `Rate limit exceeded. Please try again in ${Math.ceil(
          rateLimitStatus.retryAfter / 1000
        )} seconds.`
      );
    }

    // 3. Get or create preferences
    const preferences = await UserPreferences.getOrCreateUserPreferences(
      ctx,
      authUser._id
    );

    if (!preferences) {
      throw new Error("Failed to get or create preferences");
    }

    // 4. Update preferences
    return await UserPreferences.updateUserPreferences(ctx, preferences._id, args);
  },
});
