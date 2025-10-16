/**
 * Better Auth Client Configuration
 *
 * Client-side authentication setup for React components.
 * Provides hooks like useSession(), signIn(), signOut(), etc.
 */

import { createAuthClient } from "better-auth/react";
import { convexClient } from "@convex-dev/better-auth/client/plugins";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  plugins: [
    convexClient(),
    // Add organizationClient() here if you need multi-tenant features in the future
  ],
});

/**
 * Re-export commonly used hooks for convenience
 */
export const {
  useSession,
  signIn,
  signUp,
  signOut,
  useActiveOrganization,
} = authClient;
