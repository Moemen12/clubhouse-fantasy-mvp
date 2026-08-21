import type { CookieOptions } from "@supabase/ssr";
import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { createSupabaseServerClient } from "@/shared/backend";

type PendingCookie = {
  name: string;
  value: string;
  options: CookieOptions;
};

function getSafeRedirect(request: NextRequest, next: string | null) {
  const fallback = new URL("/dashboard", request.url);

  if (!next) return fallback;

  try {
    const candidate = new URL(next, request.url);
    if (candidate.origin !== request.nextUrl.origin) return fallback;
    return candidate;
  } catch {
    return fallback;
  }
}

function applySessionCookies(
  response: NextResponse,
  pendingCookies: PendingCookie[],
  cacheHeaders: Record<string, string>,
) {
  pendingCookies.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
  Object.entries(cacheHeaders).forEach(([key, value]) => response.headers.set(key, value));
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const redirectTo = getSafeRedirect(request, searchParams.get("next"));
  let pendingCookies: PendingCookie[] = [];
  let cacheHeaders: Record<string, string> = {};

  const supabase = createSupabaseServerClient({
    getAll: () => request.cookies.getAll(),
    setAll: (cookiesToSet, headers) => {
      cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
      pendingCookies = cookiesToSet;
      cacheHeaders = headers;
    },
  });

  if (supabase && tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash: tokenHash,
    });

    if (!error) {
      const response = NextResponse.redirect(redirectTo);
      applySessionCookies(response, pendingCookies, cacheHeaders);
      return response;
    }
  }

  const response = NextResponse.redirect(new URL("/auth/auth-code-error", request.url));
  applySessionCookies(response, pendingCookies, cacheHeaders);
  return response;
}
