/**
 * Rate Limiter Configuration
 *
 * Defines rate limits for all mutation operations to prevent abuse.
 * Uses token bucket algorithm for smooth rate limiting with burst capacity.
 */

import { RateLimiter, MINUTE } from "@convex-dev/rate-limiter";
import { components } from "./_generated/api";

export const rateLimiter = new RateLimiter(components.rateLimiter, {
  // Task operations - token bucket allows bursts
  createTask: {
    kind: "token bucket",
    rate: 30,
    period: MINUTE,
    capacity: 5, // Allow burst of 5 quick creates
  },
  updateTask: {
    kind: "token bucket",
    rate: 60,
    period: MINUTE,
    capacity: 10,
  },
  deleteTask: {
    kind: "token bucket",
    rate: 20,
    period: MINUTE,
    capacity: 3,
  },

  // Tag operations
  createTag: {
    kind: "token bucket",
    rate: 20,
    period: MINUTE,
    capacity: 3,
  },
  updateTag: {
    kind: "token bucket",
    rate: 30,
    period: MINUTE,
    capacity: 5,
  },
  deleteTag: {
    kind: "token bucket",
    rate: 20,
    period: MINUTE,
    capacity: 3,
  },

  // Preferences operations (less strict)
  updatePreferences: {
    kind: "token bucket",
    rate: 10,
    period: MINUTE,
    capacity: 2,
  },
});
