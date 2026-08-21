"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { createAuthClient, AuthEntry } from "@/modules/auth";

type AuthClientContainerProps = Readonly<{
  children: ReactNode;
}>;

export function AuthClientContainer({ children }: AuthClientContainerProps) {
  const router = useRouter();
  const [authClient] = useState(() => createAuthClient());
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  useEffect(() => {
    let active = true;

    authClient.getSession().then((session) => {
      if (!active) return;
      if (session) {
        router.replace("/dashboard");
        return;
      }
      setIsCheckingSession(false);
    });

    return () => {
      active = false;
    };
  }, [authClient, router]);

  function handleAuthenticated() {
    router.replace("/dashboard");
  }

  if (isCheckingSession) {
    return (
      <main className="grid min-h-screen grid-cols-[minmax(0,1.05fr)_minmax(420px,0.95fr)] bg-[radial-gradient(circle_at_13%_18%,rgba(215,255,79,0.08),transparent_26rem),radial-gradient(circle_at_85%_84%,rgba(145,184,255,0.08),transparent_22rem),var(--deep)] max-225:block">
        {children}
        <section className="flex min-h-screen flex-col items-center justify-center p-8.5 text-[0.75rem] text-(--ink-muted)">
          <span
            className="h-6.5 w-6.5 animate-spin rounded-full border-2 border-[rgba(215,255,79,0.17)] border-t-(--lime) motion-reduce:animate-none"
            aria-hidden="true"
          />
          <p className="mt-3">Opening your clubhouse…</p>
        </section>
      </main>
    );
  }

  return (
    <AuthEntry authClient={authClient} onAuthenticated={handleAuthenticated} story={children} />
  );
}
