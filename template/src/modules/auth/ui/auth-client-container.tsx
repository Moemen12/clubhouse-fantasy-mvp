"use client";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

import { createAuthClient, AuthEntry } from "@/modules/auth";
import type { AuthUser } from "@/modules/auth";

const FantasyDashboard = dynamic(
    () => import("@/modules/fantasy/ui").then((mod) => mod.FantasyDashboard),
    {
        loading: () => (
            <div className="grid min-h-screen place-content-center justify-items-center gap-3.75 bg-(--deep) text-[0.75rem] text-(--ink-muted)">
                <span
                    className="h-6.5 w-6.5 animate-spin rounded-full border-2 border-[rgba(215,255,79,0.17)] border-t-(--lime) motion-reduce:animate-none"
                    aria-hidden="true"
                />
                <p>Loading dashboard...</p>
            </div>
        ),
    }
);

type AuthClientContainerProps = {
    children: ReactNode;
};

export function AuthClientContainer({ children }: Readonly<AuthClientContainerProps>) {
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

    if (!user) {
        return <AuthEntry authClient={authClient} onAuthenticated={setUser} story={children} />;
    }

    return <FantasyDashboard managerName={user.displayName} />;
}

