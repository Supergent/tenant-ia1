"use client";

import * as React from "react";
import { ToastProvider } from "./toast";

export const ThemeProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  return <>{children}</>;
};

/**
 * AppProviders
 *
 * Base providers for theme and toast notifications.
 * Note: Convex + Auth providers should be added in the app-level layout
 * to avoid bundling auth configuration in the shared component package.
 */
export const AppProviders: React.FC<React.PropsWithChildren> = ({ children }) => {
  return (
    <ThemeProvider>
      <ToastProvider>{children}</ToastProvider>
    </ThemeProvider>
  );
};
