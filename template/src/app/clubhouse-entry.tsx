"use client";

import { useEffect, useState } from "react";

import { createAuthClient, AuthEntry } from "@/modules/auth";
import type { AuthUser } from "@/modules/auth";
import { FantasyDashboard } from "@/modules/fantasy/ui";

export function ClubhouseEntry() {
  const [authClient] = useState(() => createAuthClient());
  const [user, setUser] = useState<AuthUser | null | undefined>(undefined);

  useEffect(() => {
    let active = true;
    authClient.getSession().then((session) => {
      if (active) setUser(session);
    });
    return () => {
      active = false;
    };
  }, [authClient]);

  if (user === undefined) {
    return (
      <main
        className="grid min-h-screen place-content-center justify-items-center gap-3.75 bg-(--deep) text-[0.75rem] text-(--ink-muted)"
        aria-live="polite"
      >
        <span
          className="h-6.5 w-6.5 animate-spin rounded-full border-2 border-[rgba(215,255,79,0.17)] border-t-(--lime) motion-reduce:animate-none"
          aria-hidden="true"
        />
        <p>Opening your clubhouse…</p>
      </main>
    );
  }

  if (!user) {
    return <AuthEntry authClient={authClient} onAuthenticated={setUser} />;
  }

  return <FantasyDashboard managerName={user.displayName} />;
}
