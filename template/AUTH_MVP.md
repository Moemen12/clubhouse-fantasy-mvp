# Authentication MVP

## Goal

A visitor should be able to enter Clubhouse through a clear authentication screen, choose sign in or sign up, and continue to the fantasy dashboard after a successful result.

## Core journey

```text
Open Clubhouse
→ Choose Sign in or Create account
→ Submit email and password
→ See success or a useful error
→ Enter the fantasy dashboard
```

## Current implementation boundary

The auth feature supports two modes:

| Mode          | Behavior                                                                                                                                                                  |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Supabase mode | When `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` exist, the form calls Supabase Auth for sign-in, sign-up, and session restoration using the PKCE flow. |
| Preview mode  | When Supabase is not configured, the visitor can continue as a local demo manager. This keeps the product demo usable without pretending that a real account was created. |

The UI and domain rules do not depend on Supabase. The provider is replaceable behind the auth feature boundary.

## Business rules

- Email must be present and valid.
- Password must contain at least 8 characters.
- Sign-up requires a display name.
- Sign-in does not require a display name.
- A successful sign-in or sign-up enters the dashboard.
- Preview mode is explicitly labeled as preview mode.
- Authenticated product work is not blocked by a missing provider configuration during local UI development.
- The dashboard lives at `/dashboard`; `/` is the authentication entry route.
- Supabase sessions are verified with `getClaims()` in Proxy and on the dashboard server boundary.

## Build now

- Auth feature directory with domain validation, contracts, provider port, Supabase adapter, and UI.
- shadcn/ui primitives for button, badge, card, input, label, separator, and tabs.
- Auth-only root entrypoint and dedicated `/dashboard` route.
- Next.js Proxy session refresh and route redirects.
- PKCE token-hash confirmation endpoint at `/auth/confirm`.
- Sign-in and sign-up states.
- Loading, error, success, and preview states.
- Session restoration when Supabase is configured.
- Demo continuation when Supabase is not configured.
- Supabase PKCE confirmation flow with server-side cookie exchange.

## Supabase configuration

For hosted Supabase projects with email confirmation enabled, update the sign-up email template to use the PKCE token hash and the implemented confirmation route:

```html
<a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email&next={{ .RedirectTo }}">Confirm email address</a>
```

Add the local and deployed `/auth/confirm` URLs to Supabase Auth Redirect URLs. The browser client explicitly uses `flowType: "pkce"`; it does not use the implicit flow.

## Build later

- Password reset screens.
- OAuth providers.
- Profile editing and account deletion.
- Persistent fantasy squads linked to an authenticated user.
- Production rate limiting, audit logs, and abuse monitoring.

## Acceptance criteria

- The example feature and example-only API wiring are removed.
- The auth screen appears at `/` before the dashboard for a new browser session.
- Unauthenticated requests to `/dashboard` return to `/`.
- Authenticated requests to `/` continue to `/dashboard`.
- A visitor can switch between sign-in and sign-up without leaving the page.
- Invalid fields display clear validation messages.
- Supabase mode uses the configured provider.
- Missing Supabase configuration produces an explicit preview mode, not a fake production account.
- Successful auth or preview entry shows the existing Clubhouse fantasy dashboard at `/dashboard`.
- The feature follows the architecture kit’s dependency direction.
