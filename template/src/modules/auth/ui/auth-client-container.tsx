"use client";

import type { ReactNode } from "react";

import type { AuthFormAction } from "../contracts";
import { AuthEntry } from "./auth-entry";

type AuthClientContainerProps = Readonly<{
  children: ReactNode;
  authAction: AuthFormAction;
}>;

export function AuthClientContainer({ children, authAction }: AuthClientContainerProps) {
  return <AuthEntry story={children} authAction={authAction} />;
}
