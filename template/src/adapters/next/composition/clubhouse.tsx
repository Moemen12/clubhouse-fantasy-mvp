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
      <main className="auth-loading" aria-live="polite">
        <span className="loading-orbit" aria-hidden="true" />
        <p>Opening your clubhouse…</p>
      </main>
    );
  }

  if (!user) {
    return <AuthEntry authClient={authClient} onAuthenticated={setUser} />;
  }

  return <FantasyDashboard managerName={user.displayName} />;
}
