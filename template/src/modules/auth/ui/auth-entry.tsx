"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { LockKeyhole } from "lucide-react";
import type { AuthIntent } from "../domain/auth";
import type { AuthClient, AuthUser } from "../ports";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/frontend/ui/card";
import { Badge } from "@/shared/frontend/ui/badge";
import { Separator } from "@/shared/frontend/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/frontend/ui/tabs";
import { AuthForm } from "./auth-form";

type AuthEntryProps = Readonly<{
  authClient: AuthClient;
  onAuthenticated: (user: AuthUser) => void;
  story?: ReactNode;
}>;

export function AuthEntry({ authClient, onAuthenticated, story }: AuthEntryProps) {
  const [intent, setIntent] = useState<AuthIntent>("sign-in");

  function handleIntentChange(value: string) {
    setIntent(value as AuthIntent);
  }

  return (
    <main className="grid min-h-screen grid-cols-[minmax(0,1.05fr)_minmax(420px,0.95fr)] bg-[radial-gradient(circle_at_13%_18%,rgba(215,255,79,0.08),transparent_26rem),radial-gradient(circle_at_85%_84%,rgba(145,184,255,0.08),transparent_22rem),var(--deep)] max-225:block">
      {/* Renders the static Server Component passed via props */}
      {story}

      <section
        className="flex min-h-screen flex-col items-center justify-center p-8.5 max-225:min-h-0 max-225:px-6 max-225:py-11 max-130:px-4.5 max-130:py-8.5"
        aria-label="Account access"
      >
        <Card className="w-full max-w-117.5">
          <CardHeader className="gap-3 pb-5">
            <div className="flex items-center justify-between gap-4">
              <div className="grid h-9.5 w-9.5 place-items-center rounded-xl border border-[rgba(215,255,79,0.22)] bg-[rgba(215,255,79,0.1)] text-(--lime)">
                <LockKeyhole className="h-4 w-4" />
              </div>
              <Badge variant={authClient.mode === "supabase" ? "success" : "secondary"}>
                {authClient.mode === "supabase" ? "Live accounts" : "Preview mode"}
              </Badge>
            </div>
            <div>
              <CardTitle>Welcome to Clubhouse</CardTitle>
              <CardDescription className="mt-2">
                {authClient.mode === "supabase"
                  ? "Sign in to keep your squad, decisions, and results with you."
                  : "Explore the product now. Connect Supabase later for real accounts."}
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs value={intent} onValueChange={handleIntentChange}>
              <TabsList aria-label="Authentication mode">
                <TabsTrigger value="sign-in">Sign in</TabsTrigger>
                <TabsTrigger value="sign-up">Create account</TabsTrigger>
              </TabsList>
              <TabsContent value="sign-in">
                <AuthForm
                  key="sign-in"
                  authClient={authClient}
                  intent="sign-in"
                  onAuthenticated={onAuthenticated}
                />
              </TabsContent>
              <TabsContent value="sign-up">
                <AuthForm
                  key="sign-up"
                  authClient={authClient}
                  intent="sign-up"
                  onAuthenticated={onAuthenticated}
                />
              </TabsContent>
            </Tabs>
            <div className="mt-6 flex items-center gap-3 text-xs text-(--ink-faint)">
              <Separator className="flex-1" />
              <span>Your data stays yours</span>
              <Separator className="flex-1" />
            </div>
          </CardContent>
        </Card>
        <p className="mt-4.5 w-full max-w-117.5 text-center text-[0.68rem] leading-[1.6] text-(--ink-faint)">
          No pressure. Preview mode is available while the product is taking shape.
        </p>
      </section>
    </main>
  );
}