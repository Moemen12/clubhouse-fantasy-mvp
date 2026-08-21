import type { NextRequest } from "next/server";

import { applyAuthGuard } from "@/app/auth-guard";

export async function proxy(request: NextRequest) {
  // Composition entrypoint: add more guards here as the product grows.
  return applyAuthGuard(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
