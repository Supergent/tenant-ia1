import type { Metadata } from "next";
import "./globals.css";
import { AppProviders } from "@jn7f1qecj9mg71yhrzbfnmmpsn7sh1ep/components";
import { ConvexClientProvider } from "@/providers/convex-provider";

export const metadata: Metadata = {
  title: "Todo App - Simple Task Management",
  description: "A simple, user-focused todo list application with real-time updates and authentication",
};

export default function RootLayout({
  children,
}: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ConvexClientProvider>
          <AppProviders>{children}</AppProviders>
        </ConvexClientProvider>
      </body>
    </html>
  );
}
