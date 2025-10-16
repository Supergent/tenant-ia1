import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { createAuth } from "./auth";

/**
 * HTTP Router
 *
 * Handles HTTP requests to the Convex backend.
 * Currently configured for Better Auth authentication endpoints.
 *
 * Better Auth Routes:
 * - POST /auth/signup - Create new account
 * - POST /auth/login - Sign in
 * - POST /auth/logout - Sign out
 * - GET /auth/session - Get current session
 * - And other Better Auth endpoints
 */
const http = httpRouter();

// Better Auth POST routes (signup, login, logout, etc.)
http.route({
  path: "/auth/*",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const auth = createAuth(ctx);
    return await auth.handler(request);
  }),
});

// Better Auth GET routes (session, verify, etc.)
http.route({
  path: "/auth/*",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const auth = createAuth(ctx);
    return await auth.handler(request);
  }),
});

export default http;
