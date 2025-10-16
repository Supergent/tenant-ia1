/**
 * Convex Client Configuration
 *
 * Initializes the Convex React client for real-time data sync.
 */

import { ConvexReactClient } from "convex/react";

if (!process.env.NEXT_PUBLIC_CONVEX_URL) {
  throw new Error(
    "Missing NEXT_PUBLIC_CONVEX_URL environment variable. " +
    "Run 'npx convex dev' to get your Convex URL and add it to .env.local"
  );
}

export const convex = new ConvexReactClient(
  process.env.NEXT_PUBLIC_CONVEX_URL
);
