"use client";

import type { ReactNode } from "react";

import { AuthEntry } from "@/modules/auth";

type AuthClientContainerProps = Readonly<{
  children: ReactNode;
}>;

export function AuthClientContainer({ children }: AuthClientContainerProps) {
  return <AuthEntry story={children} />;
}
