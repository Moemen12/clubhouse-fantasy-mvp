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

function isProtectedPath(pathname: string): boolean {
  return (PROTECTED_ROUTES as readonly string[]).some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
}

function isPublicPath(pathname: string): boolean {
  return (PUBLIC_ROUTES as readonly string[]).includes(pathname);
}

function getRedirectDestination(request: NextRequest, pathname: string, isAuthenticated: boolean): URL | null {
  if (!isAuthenticated && isProtectedPath(pathname)) {
    return new URL(ROUTES.AUTH.ROOT, request.url);
  }

  if (isAuthenticated && isPublicPath(pathname)) {
    return new URL(ROUTES.DASHBOARD.ROOT, request.url);
  }

  return null;
}

function applySessionState(
  response: NextResponse,
  pendingCookies: PendingCookie[],
  cacheHeaders: Record<string, string>
) {
  pendingCookies.forEach(({ name, value, options }) => {
    response.cookies.set(name, value, options);
  });

  Object.entries(cacheHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
}

export async function applyAuthGuard(request: NextRequest): Promise<NextResponse> {
  const pendingCookies: PendingCookie[] = [];
  let cacheHeaders: Record<string, string> = {};

  const supabase = createSupabaseServerClient({
    getAll: () => request.cookies.getAll(),
    setAll: (cookiesToSet, headers) => {
      cookiesToSet.forEach(({ name, value, options }) => {
        request.cookies.set(name, value);
        pendingCookies.push({ name, value, options });
      });
      cacheHeaders = { ...cacheHeaders, ...headers };
    },
  });

  if (!supabase) {
    return NextResponse.next({ request });
  }

  const { data } = await supabase.auth.getClaims();
  const isAuthenticated = Boolean(data?.claims?.sub);
  const pathname = request.nextUrl.pathname;

  const destination = getRedirectDestination(request, pathname, isAuthenticated);
  const response = destination
    ? NextResponse.redirect(destination)
    : NextResponse.next({ request });

  applySessionState(response, pendingCookies, cacheHeaders);

  return response;
}