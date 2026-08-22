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
  const { NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: publishableKey, NEXT_PUBLIC_SUPABASE_URL: url } =
    serverEnv;

  return createServerClient(url, publishableKey, {
    auth: { flowType: "pkce" },
    cookies: {
      getAll: cookieStore.getAll,
      setAll: cookieStore.setAll,
    },
  });
}
