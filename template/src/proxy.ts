import type { CookieOptions } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { createSupabaseServerClient } from "@/shared/backend";

type PendingCookie = {
  name: string;
  value: string;
  options: CookieOptions;
};

export async function proxy(request: NextRequest) {
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
  const isDashboardRoute = pathname === "/dashboard" || pathname.startsWith("/dashboard/");
  const isAuthEntryRoute = pathname === "/";

  const destination =
    isDashboardRoute && !isAuthenticated
      ? new URL("/", request.url)
      : isAuthEntryRoute && isAuthenticated
        ? new URL("/dashboard", request.url)
        : null;

  const response = destination
    ? NextResponse.redirect(destination)
    : NextResponse.next({ request });

  pendingCookies.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
  Object.entries(cacheHeaders).forEach(([key, value]) => response.headers.set(key, value));

  return response;
}

export const config = {
  matcher: ["/", "/dashboard/:path*", "/auth/confirm"],
};
