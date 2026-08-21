import "server-only";

import type { CookieOptions } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { createSupabaseServerClient } from "@/shared/backend";
import { PROTECTED_ROUTES, PUBLIC_ROUTES, ROUTES } from "@/shared/kernel";

type PendingCookie = {
  name: string;
  value: string;
  options: CookieOptions;
};

function isProtectedPath(pathname: string) {
  return PROTECTED_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}

function isPublicPath(pathname: string) {
  return PUBLIC_ROUTES.some((route) => pathname === route);
}

function applySessionState(
  response: NextResponse,
  pendingCookies: PendingCookie[],
  cacheHeaders: Record<string, string>,
) {
  pendingCookies.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
  Object.entries(cacheHeaders).forEach(([key, value]) => response.headers.set(key, value));
}

export async function applyAuthGuard(request: NextRequest): Promise<NextResponse> {
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

  if (!supabase) {
    return NextResponse.next();
  }

  const { data } = await supabase.auth.getClaims();
  const isAuthenticated = Boolean(data?.claims?.sub);
  const pathname = request.nextUrl.pathname;
  const isProtected = isProtectedPath(pathname);
  const isPublic = isPublicPath(pathname);
  const shouldRedirectToAuth = !isAuthenticated && isProtected;
  const shouldRedirectToDashboard = isAuthenticated && isPublic;
  const destination = shouldRedirectToAuth
    ? new URL(ROUTES.AUTH.ROOT, request.url)
    : shouldRedirectToDashboard
      ? new URL(ROUTES.DASHBOARD.ROOT, request.url)
      : null;
  const response = destination
    ? NextResponse.redirect(destination)
    : NextResponse.next({ request });

  applySessionState(response, pendingCookies, cacheHeaders);
  return response;
}
