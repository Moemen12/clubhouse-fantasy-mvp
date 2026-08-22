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
  // Proxy may run before this POST, but it cannot persist the session created by this action.
  // This request-bound client writes Supabase's new session cookies to the action response.
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
