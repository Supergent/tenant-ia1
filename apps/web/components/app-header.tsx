"use client";

import { useSession, authClient } from "@/lib/auth-client";
import { Button, useToast } from "@jn7f1qecj9mg71yhrzbfnmmpsn7sh1ep/components";
import { LogOut, CheckSquare } from "lucide-react";

export function AppHeader() {
  const { data: session } = useSession();
  const { toast } = useToast();

  const handleSignOut = async () => {
    try {
      await authClient.signOut();
      toast({
        title: "Signed out",
        description: "You have been signed out successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to sign out",
        variant: "destructive",
      });
    }
  };

  if (!session) {
    return null;
  }

  return (
    <header className="border-b bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between p-4">
        <div className="flex items-center gap-2">
          <CheckSquare className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-bold">Todo App</h1>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-neutral-foreground-secondary">
            {session.user?.name || session.user?.email}
          </span>
          <Button variant="outline" size="sm" onClick={handleSignOut}>
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </div>
    </header>
  );
}
