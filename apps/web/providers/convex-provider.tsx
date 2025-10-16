/**
 * Convex Provider with Authentication
 *
 * Wraps the app with Convex real-time client and Better Auth integration.
 */

"use client";

import { ConvexProviderWithAuth } from "@convex-dev/better-auth/react";
import { convex } from "@/lib/convex";
import { authClient } from "@/lib/auth-client";
import { ReactNode } from "react";

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  return (
    <ConvexProviderWithAuth client={convex} authClient={authClient}>
      {children}
    </ConvexProviderWithAuth>
  );
}
