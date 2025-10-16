"use client";

import { useState } from "react";
import { useSession, authClient } from "@/lib/auth-client";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  useToast,
} from "@jn7f1qecj9mg71yhrzbfnmmpsn7sh1ep/components";

export function AuthGate({ children }: { children: React.ReactNode }) {
  const { data: session, isPending } = useSession();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  if (isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    const handleAuth = async () => {
      if (!email || !password) {
        toast({
          title: "Error",
          description: "Please fill in all required fields",
          variant: "destructive",
        });
        return;
      }

      if (isSignUp && !name) {
        toast({
          title: "Error",
          description: "Please enter your name",
          variant: "destructive",
        });
        return;
      }

      setIsLoading(true);

      try {
        if (isSignUp) {
          await authClient.signUp.email({
            email,
            password,
            name,
          });

          toast({
            title: "Success",
            description: "Account created! You are now signed in.",
          });
        } else {
          await authClient.signIn.email({
            email,
            password,
          });

          toast({
            title: "Success",
            description: "Signed in successfully!",
          });
        }
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Authentication failed",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl">
              {isSignUp ? "Create Account" : "Sign In"}
            </CardTitle>
            <p className="text-sm text-neutral-foreground-secondary">
              {isSignUp
                ? "Enter your details to create a new account"
                : "Enter your email and password to access your tasks"}
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {isSignUp && (
              <div>
                <label className="text-sm font-medium">Name</label>
                <Input
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1"
                />
              </div>
            )}
            <div>
              <label className="text-sm font-medium">Email</label>
              <Input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Password</label>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleAuth();
                  }
                }}
              />
            </div>
            <Button
              onClick={handleAuth}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading
                ? "Loading..."
                : isSignUp
                ? "Create Account"
                : "Sign In"}
            </Button>
            <div className="text-center">
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-sm text-primary hover:underline"
              >
                {isSignUp
                  ? "Already have an account? Sign in"
                  : "Don't have an account? Sign up"}
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
