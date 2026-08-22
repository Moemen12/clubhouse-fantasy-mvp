"use server";

import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { createNextAuthClient } from "@/adapters/next";
import { submitAuthForm } from "@/modules/auth/application";
import type { AuthActionState } from "@/modules/auth/contracts";
import { ROUTES } from "@/shared/kernel";

export async function submitAuthFormAction(
  previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const cookieStore = await cookies();
  const authClient = createNextAuthClient({
    getAll: () => cookieStore.getAll(),
    setAll: (cookiesToSet) => {
      cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
    },
  });
  const state = await submitAuthForm(authClient, previousState, formData);

  if (state.status === "success") {
    redirect(ROUTES.DASHBOARD.ROOT);
  }

  return state;
}
