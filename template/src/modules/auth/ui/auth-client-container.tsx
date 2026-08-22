"use client";

import type { ReactNode } from "react";
import { useRouter } from "next/navigation";

import { createAuthClient, AuthEntry } from "@/modules/auth";
import { ROUTES } from "@/shared/kernel";

const authClient = createAuthClient();

type AuthClientContainerProps = Readonly<{
  children: ReactNode;
}>;

export function AuthClientContainer({ children }: AuthClientContainerProps) {
  const router = useRouter();
  console.log(authClient);

  function handleAuthenticated() {
    router.replace(ROUTES.DASHBOARD.ROOT);
  }

  return <AuthEntry authClient={authClient} onAuthenticated={handleAuthenticated} story={children} />;
}
