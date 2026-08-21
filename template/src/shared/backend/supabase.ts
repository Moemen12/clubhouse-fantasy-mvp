import { createServerClient } from "@supabase/ssr";
import type { CookieOptions } from "@supabase/ssr";

import { serverEnv } from "./env";

export type SupabaseCookie = Readonly<{
  name: string;
  value: string;
}>;

export type SupabaseCookieStore = Readonly<{
  getAll: () => SupabaseCookie[] | null | Promise<SupabaseCookie[] | null>;
  setAll?: (
    cookies: Array<{
      name: string;
      value: string;
      options: CookieOptions;
    }>,
    headers: Record<string, string>,
  ) => void | Promise<void>;
}>;

export function createSupabaseServerClient(cookieStore: SupabaseCookieStore) {
  if (
    !serverEnv.supabaseConfigured ||
    !serverEnv.NEXT_PUBLIC_SUPABASE_URL ||
    !serverEnv.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  ) {
    return null;
  }

  return createServerClient(
    serverEnv.NEXT_PUBLIC_SUPABASE_URL,
    serverEnv.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      auth: { flowType: "pkce" },
      cookies: {
        getAll: cookieStore.getAll,
        setAll: cookieStore.setAll,
      },
    },
  );
}
