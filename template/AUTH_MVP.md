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
- React Hook Form with a shared shadcn-style Form primitive and Zod validation schema.
- shadcn/ui primitives for button, badge, card, input, label, separator, and tabs.
- Auth-only root entrypoint and dedicated `/dashboard` route.
- Next.js Proxy session refresh and route redirects.
- Sign-in and sign-up states.
- Loading, error, success, and preview states.
- Session restoration when Supabase is configured.
- Demo continuation when Supabase is not configured.
- Direct Supabase sign-up that returns an authenticated session immediately.
- PKCE session storage and refresh without using the implicit flow.

## Supabase configuration

In the Supabase dashboard, open **Authentication → Providers → Email** and disable **Confirm email**. The application expects `signUp()` to return a session immediately; if Supabase returns no session, the form reports that configuration requirement instead of pretending the user is logged in.

The browser and server clients explicitly use `flowType: "pkce"`. PKCE is used for the session flow, but this MVP does not send users through an email-confirmation route.

## Build later

- Password reset screens.
- OAuth providers.
- Profile editing and account deletion.
- Persistent fantasy squads linked to an authenticated user.
- Audit logs and abuse monitoring.

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
