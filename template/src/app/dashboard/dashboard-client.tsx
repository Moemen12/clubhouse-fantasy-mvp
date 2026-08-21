"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { createAuthClient } from "@/modules/auth";
import type { AuthUser } from "@/modules/auth";
import { FantasyDashboard } from "@/modules/fantasy/ui";
import { ROUTES } from "@/shared/kernel";

export function DashboardClient() {
  const router = useRouter();
  const [authClient] = useState(() => createAuthClient());
  const [user, setUser] = useState<AuthUser | undefined>(undefined);

  useEffect(() => {
    let active = true;

    authClient.getSession().then((session) => {
      if (!active) return;
      if (!session) {
        router.replace(ROUTES.AUTH.ROOT);
        return;
      }
      setUser(session);
    });

    return () => {
      active = false;
    };
  }, [authClient, router]);

  if (user === undefined) {
    return <DashboardLoading />;
  }

  return <FantasyDashboard managerName={user.displayName} />;
}

function DashboardLoading() {
  return (
    <main className="grid min-h-screen place-content-center justify-items-center gap-3.75 bg-(--deep) text-[0.75rem] text-(--ink-muted)">
      <span
        className="h-6.5 w-6.5 animate-spin rounded-full border-2 border-[rgba(215,255,79,0.17)] border-t-(--lime) motion-reduce:animate-none"
        aria-hidden="true"
      />
      <p>Loading dashboard…</p>
    </main>
  );
}
