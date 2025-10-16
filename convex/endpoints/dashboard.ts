/**
 * Endpoint Layer: Dashboard
 *
 * Provides aggregated data for the dashboard view.
 * Composes database operations to generate summary statistics and recent activity.
 */

import { v } from "convex/values";
import { query } from "../_generated/server";
import { authComponent } from "../auth";
import * as Dashboard from "../db/dashboard";

/**
 * Get dashboard summary statistics
 */
export const summary = query({
  args: {},
  handler: async (ctx) => {
    const authUser = await authComponent.getAuthUser(ctx);
    if (!authUser) {
      return {
        totalRecords: 0,
        perTable: {},
        primaryTableCount: 0,
      };
    }

    // Use authUser._id (the Convex document ID)
    return Dashboard.loadSummary(ctx, authUser._id);
  },
});

/**
 * Get recent tasks (for homepage table view)
 */
export const recent = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const authUser = await authComponent.getAuthUser(ctx);
    if (!authUser) {
      return [];
    }

    // Use authUser._id (the Convex document ID)
    return Dashboard.loadRecent(ctx, authUser._id, args.limit ?? 10);
  },
});
