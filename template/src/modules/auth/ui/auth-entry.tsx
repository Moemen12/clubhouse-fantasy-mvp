import type { ReactNode } from "react";
import { LockKeyhole } from "lucide-react";

import { ThemeToggle } from "@/shared/frontend";
import {
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Separator,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/shared/frontend/ui";
import { AuthForm } from "./auth-form";

type AuthEntryProps = Readonly<{
  children: ReactNode;
}>;

export function AuthEntry({ children }: AuthEntryProps) {
  return (
    <main className="relative grid min-h-screen grid-cols-[minmax(0,1.05fr)_minmax(420px,0.95fr)] bg-[radial-gradient(circle_at_13%_18%,var(--glow-lime),transparent_26rem),radial-gradient(circle_at_85%_84%,var(--glow-blue),transparent_22rem),var(--deep)] max-[900px]:block">
      {children}
      <ThemeToggle className="absolute right-6 top-6 z-10 max-[900px]:right-4 max-[900px]:top-4" />

      <section
        className="flex min-h-screen flex-col items-center justify-center p-8.5 max-[900px]:px-6 max-[900px]:py-11 max-[520px]:px-4.5 max-[520px]:py-8.5"
        aria-label="Account access"
      >
        <Card className="w-full max-w-117.5">
          <CardHeader className="gap-3 pb-5">
            <div className="flex items-center justify-between gap-4">
              <div className="grid h-9.5 w-9.5 place-items-center rounded-xl border border-(--success-border) bg-(--success-bg) text-(--lime)">
                <LockKeyhole className="h-4 w-4" />
              </div>
              <Badge variant="success">Live accounts</Badge>
            </div>
            <div>
              <CardTitle>Welcome to Clubhouse</CardTitle>
              <CardDescription className="mt-2">
                Sign in to keep your squad, decisions, and results with you.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="sign-in">
              <TabsList aria-label="Authentication mode">
                <TabsTrigger value="sign-in">Sign in</TabsTrigger>
                <TabsTrigger value="sign-up">Create account</TabsTrigger>
              </TabsList>
              <TabsContent value="sign-in">
                <AuthForm key="sign-in" intent="sign-in" />
              </TabsContent>
              <TabsContent value="sign-up">
                <AuthForm key="sign-up" intent="sign-up" />
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
          Sign up and continue straight into your Clubhouse dashboard.
        </p>
      </section>
    </main>
  );
}
