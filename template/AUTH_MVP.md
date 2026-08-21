# Authentication MVP

## Goal

A visitor should be able to enter Clubhouse through a clear authentication screen, choose sign in or sign up, and continue to the fantasy dashboard after a successful Supabase Auth result.

## Core journey

```text
Open Clubhouse
→ Choose Sign in or Create account
→ Submit email and password
→ See success or a useful error
→ Enter the fantasy dashboard
```

## Current implementation boundary

Clubhouse uses Supabase Auth as its only authentication provider. The browser adapter owns credential submission through the Supabase PKCE client. The Next.js Proxy owns request-level route decisions and refreshes Supabase cookies. The `/dashboard` server page performs a defense-in-depth claims and user check before rendering the fantasy dashboard.

The UI and domain rules do not depend on Supabase types. The provider remains behind the auth feature port, while the application intentionally requires Supabase configuration for authentication to work.

## Business rules

- Email must be present and valid.
- Password must contain at least 8 characters.
- Sign-up requires a display name.
- Sign-in does not require a display name.
- A successful sign-in or sign-up enters `/dashboard`.
- Unauthenticated requests to `/dashboard` return to `/`.
- Authenticated requests to `/` continue to `/dashboard` through Proxy.
- The root auth composition does not perform a client-side session lookup.
- The dashboard is rendered only by the authenticated server route.
- Supabase sessions are verified with `getClaims()` in Proxy and on the dashboard server boundary.

## Build now

- Auth feature directory with domain validation, contracts, Supabase adapter, and UI.
- React Hook Form with a shared shadcn-style Form primitive and Zod validation schema.
- shadcn/ui primitives for button, badge, card, input, label, separator, and tabs.
- Auth-only root entrypoint and dedicated `/dashboard` route.
- Next.js Proxy session refresh and route redirects.
- Supabase-only browser and server session handling.
- Direct Supabase sign-up that returns an authenticated session immediately.
- PKCE session storage and refresh without using the implicit flow.

## Supabase configuration

Set the following variables in `template/.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_publishable_key
```

In the Supabase dashboard, open **Authentication → Providers → Email** and disable **Confirm email**. The application expects `signUp()` to return a session immediately; if Supabase returns no session, the form reports that configuration requirement instead of pretending the user is logged in.

The browser and server clients explicitly use `flowType: "pkce"`. This MVP does not use the implicit flow and does not send users through an email-confirmation route.

## Build later

- Password reset screens.
- OAuth providers.
- Profile editing and account deletion.
- Persistent fantasy squads linked to an authenticated user.
- Audit logs and abuse monitoring.

## Acceptance criteria

- The example feature and example-only API wiring are removed.
- Supabase configuration is required for the auth client and server guard.
- The auth screen appears at `/` for unauthenticated requests.
- Unauthenticated requests to `/dashboard` return to `/` through Proxy.
- Authenticated requests to `/` continue to `/dashboard` through Proxy.
- A visitor can switch between sign-in and sign-up without leaving the page.
- Invalid fields display clear validation messages.
- Client and server validation use the shared Zod schema.
- Successful Supabase authentication shows the Clubhouse fantasy dashboard at `/dashboard`.
- The feature follows the architecture kit’s dependency direction.
