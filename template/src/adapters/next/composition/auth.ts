import type { SupabaseCookieStore } from "@/shared/backend";
import { createServerAuthClient } from "@/modules/auth/infrastructure";

export function createNextAuthClient(cookieStore: SupabaseCookieStore) {
  return createServerAuthClient(cookieStore);
}
