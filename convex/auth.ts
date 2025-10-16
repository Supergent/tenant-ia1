import { createClient, type GenericCtx } from "@convex-dev/better-auth";
import { convex } from "@convex-dev/better-auth/plugins";
import { betterAuth } from "better-auth";
import { components } from "./_generated/api";
import { type DataModel } from "./_generated/dataModel";

/**
 * Better Auth Client
 *
 * This client provides methods for interacting with the Better Auth component:
 * - getAuthUser(ctx) - Get the current authenticated user
 * - getSession(ctx, sessionToken) - Get a session by token
 * - etc.
 */
export const authComponent = createClient<DataModel>(components.betterAuth);

/**
 * Better Auth Configuration
 *
 * Features:
 * - Email/Password authentication
 * - JWT sessions with 30-day expiration
 * - Convex adapter for database integration
 * - No email verification (can be enabled if needed)
 *
 * To add OAuth providers (Google, GitHub, etc.):
 * 1. Import providers: import { google, github } from "better-auth/providers"
 * 2. Add socialProviders config with client IDs and secrets
 * 3. Add environment variables for OAuth credentials
 */
export const createAuth = (
  ctx: GenericCtx<DataModel>,
  { optionsOnly } = { optionsOnly: false }
) => {
  return betterAuth({
    baseURL: process.env.SITE_URL!,
    database: authComponent.adapter(ctx),
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: false,
    },
    plugins: [
      convex({
        jwtExpirationSeconds: 30 * 24 * 60 * 60, // 30 days
      }),
    ],
  });
};
