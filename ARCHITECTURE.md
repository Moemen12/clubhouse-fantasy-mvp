# Clubhouse Architecture

## Purpose

Clubhouse is a focused fantasy-football showcase application. The first slice lets a user create an account or sign in, enter a fantasy dashboard, build a small squad, make a captain decision, submit the squad, and understand the resulting score. The repository is an application, not a reusable architecture kit or a framework template.

The architecture keeps the product simple while making responsibilities visible. Next.js owns delivery and request boundaries. Feature modules own product capabilities. Supabase is an infrastructure detail behind the authentication port. Shared code is kept small and is added only when it has a real cross-feature consumer.

## Current MVP scope

The current implementation begins with authentication and a responsive fantasy-football showcase. The fantasy data is intentionally local and deterministic at this stage; it does not depend on a live sports-data provider.

| Area | Current responsibility | Current state |
|---|---|---|
| Authentication | Sign in, direct sign-up, cookie-backed Supabase session, and sign-out foundation | Implemented with Supabase Auth and PKCE configuration |
| Route access | Protect `/dashboard` and redirect authenticated users away from `/` | Implemented in Next.js Proxy and the dashboard server page |
| Fantasy experience | Demonstrate the squad-building and scoring journey | Implemented with local demo data and feature UI |
| Persistence | Store fantasy teams and results for authenticated users | Planned; not part of the current authentication slice |
| Live football data | Import real fixtures, player events, and gameweek statistics | Planned; not required for the first showcase slice |

## Runtime request flow

The application uses the App Router. A request moves through the outer delivery boundary before it reaches a feature capability.

```text
Browser request
      │
      ▼
Next.js Proxy
  ├── refresh Supabase cookies when needed
  ├── verify claims for route decisions
  └── redirect / and /dashboard when the route policy requires it
      │
      ▼
Next.js page, Server Action, or Server Component
  ├── compose the required feature capability
  └── use a request-scoped server client when cookies are involved
      │
      ▼
Feature application/domain/ports
      │
      ▼
Infrastructure adapter
  └── Supabase or another external provider
```

The Proxy and a Server Action can both run for a matching request, but they have different responsibilities. Proxy handles an existing incoming session and request-level access. The authentication Server Action handles the submitted credentials and writes the new session cookies to the Server Action response. The two clients are therefore request-bound instances for different response boundaries, not duplicate login systems.

## Source tree

The runtime application lives under `template/`. The root package contains pass-through commands that run the application from that directory.

```text
template/
└── src/
    ├── app/                         # Next.js delivery boundary
    │   ├── auth/actions.ts          # Authentication Server Action
    │   ├── auth-guard.ts            # Request-level route policy implementation
    │   ├── dashboard/page.tsx       # Protected server-rendered dashboard route
    │   ├── page.tsx                 # Public root composition
    │   ├── instrumentation.ts      # Node/Edge-aware instrumentation entry
    │   └── instrumentation-node.ts # Fail-fast Node boot validation
    │
    ├── adapters/next/               # Next-specific composition doors
    │   ├── composition/auth.ts      # Creates the server auth adapter
    │   └── index.ts                 # Server-only public barrel
    │
    ├── modules/
    │   ├── auth/
    │   │   ├── contracts/           # Serializable action state and boundaries
    │   │   ├── domain/               # Auth input schema and parser
    │   │   ├── application/          # Auth form use case
    │   │   ├── ports/                # Auth provider contract
    │   │   ├── infrastructure/       # Supabase auth implementation
    │   │   └── ui/                   # AuthEntry, AuthForm, and AuthStory
    │   │
    │   └── fantasy/
    │       ├── domain/               # Fantasy rules and domain types
    │       └── ui/                   # Dashboard presentation and demo data
    │
    └── shared/
        ├── kernel/                   # Pure shared primitives and route constants
        ├── frontend/                 # Browser-safe UI primitives and helpers
        └── backend/                  # Server-only Supabase and environment helpers
```

## Responsibility boundaries

| Location | Owns | Must not own |
|---|---|---|
| `src/app` | Pages, Server Actions, Proxy composition, redirects, and delivery concerns | Feature implementation details, raw provider wiring, or duplicated business rules |
| `src/adapters/next` | Next.js-specific composition of application and infrastructure capabilities | UI presentation or domain policy |
| `src/modules/auth/ui` | Form controls, React Hook Form state, accessibility, pending state, and action errors | Supabase client construction, cookie plumbing, or route policy |
| `src/modules/auth/domain` | Auth input rules and shared parsing policy | Next.js, React, cookies, or Supabase |
| `src/modules/auth/application` | Translating form input into a typed auth use case and serializable result | Next.js request APIs or concrete Supabase calls |
| `src/modules/auth/ports` | The contract required by the auth application use case | Provider-specific implementation details |
| `src/modules/auth/infrastructure` | The Supabase implementation of the auth port | React UI or route composition |
| `src/modules/auth/contracts` | Serializable state and boundary types shared between the Server Action and UI | Cookies, provider SDKs, or Next.js request objects |
| `src/modules/fantasy/domain` | Fantasy rules, player types, and scoring policy | UI state, request APIs, or provider clients |
| `src/modules/fantasy/ui` | The fantasy dashboard presentation and local demo data | Authentication infrastructure or server-only modules |
| `src/shared/frontend` | Reusable browser-safe UI primitives | Backend code and feature-specific policy |
| `src/shared/backend` | Reusable server-side environment and Supabase helpers | UI presentation |
| `src/shared/kernel` | Small pure values and utilities used by multiple layers | Framework, provider, or feature-specific code |

The rule is based on imports, not folder names. A file named `domain.ts` is not a domain module if it imports a database driver or a Next.js request API.

## Authentication architecture

Clubhouse uses Supabase Auth as its only authentication provider. The form is implemented as a Client Component because it needs React Hook Form and `useActionState`. It directly imports the named Server Action from `src/app/auth/actions.ts`, which is the documented Next.js pattern for invoking a Server Action from a Client Component. The action is not passed through unrelated page or layout components.

```text
AuthForm Client Component
      │ directly invokes
      ▼
submitAuthFormAction Server Action
      │ parses shared auth contract
      ▼
auth-form application use case
      │ calls
      ▼
AuthClient port
      │ implemented by
      ▼
Supabase auth infrastructure adapter
      │ writes
      ▼
Supabase session cookies
```

`AuthEntry` is a Server Component because it only composes the page structure, an uncontrolled Tabs primitive, the Client Component forms, and the server-rendered `AuthStory` child. The parent does not own authentication state. Form errors and pending state remain local to `AuthForm`, while successful authentication redirects from the Server Action.

The browser does not use a preview user or a local-storage authentication fallback. The session is managed through Supabase SSR cookies. The PKCE setting protects redirect-based authorization-code exchanges; the cookie adapter determines how the session is persisted and shared with the server.

## Route protection

Route constants and the public/protected route policy live in `src/shared/kernel/routes.ts`. `src/proxy.ts` is intentionally a thin Next.js Proxy entrypoint. It delegates to `src/app/auth-guard.ts`, which creates the request-scoped Supabase client, refreshes cookies, verifies claims, and applies the route policy.

The dashboard route performs its own server-side claims/user check before rendering the fantasy dashboard. Proxy provides request-level routing behavior, while the server page provides defense in depth for the page’s protected data and rendering.

## Environment validation

Supabase configuration is mandatory. The single Zod schema lives in `src/shared/kernel/env-validation.ts` and validates:

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
```

The validator runs in two places using the same implementation:

1. The `prebuild` command validates the environment before `next build` begins.
2. Node server boot loads `instrumentation-node.ts`, which exits with status `1` when configuration is invalid.

The `NEXT_RUNTIME === "nodejs"` branch in `instrumentation.ts` keeps the Node-only boot validator out of the Edge runtime. Browser and server environment readers only read values that have already passed the centralized validation; they do not repeat scattered runtime guards.

## Public imports

Feature consumers use public barrels rather than private implementation paths.

```ts
import { FantasyDashboard } from "@/modules/fantasy/ui";
import { AuthEntry, AuthStory } from "@/modules/auth";
```

This is invalid outside the owning feature or its tightly scoped internal composition:

```ts
import { FantasyDashboard } from "@/modules/fantasy/ui/fantasy-dashboard";
```

The repository enforces this through explicit ESLint restrictions and dependency checks. TypeScript additionally fails when a requested symbol is not exported by the selected public barrel. The intended exception is the direct import of the named authentication Server Action from the Next.js app boundary:

```ts
import { submitAuthFormAction } from "@/app/auth/actions";
```

Feature UI may import that one action because Next.js Server Actions are designed to be imported into Client Components. It may not import arbitrary pages, layouts, Route Handlers, app utilities, Next composition adapters, or shared backend implementations.

Server-only areas are exposed through protected barrels where applicable. Consumers should not bypass `src/adapters/next/index.ts`, `src/shared/backend/index.ts`, or a feature infrastructure barrel to reach private implementation files.

## Development checks

Run the application from the repository root:

```bash
npm run dev
```

Run the full gate with safe or real Supabase environment values:

```bash
NODE_ENV=test \
NEXT_PUBLIC_SUPABASE_URL=https://example.supabase.co \
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_test \
npm run validate
```

The validation gate checks the supported runtime, formatting, ESLint and SonarJS rules, TypeScript, dependency direction, server-only doors, public imports, staged secrets, environment configuration, and the production build.

## Architectural principles

The project follows a few practical rules:

- Keep the current user journey small and understandable.
- Add a layer only when that layer owns a real responsibility.
- Keep provider and framework details at the outer edge.
- Validate untrusted form input at the Server Action boundary with the shared schema.
- Keep UI state in the UI and route access in Proxy/server delivery code.
- Prefer a direct, explicit composition over wrappers that only forward props.
- Use public barrels for cross-boundary imports and let TypeScript verify the exported API.
- Do not add persistence, live sports data, queues, or other infrastructure until the product slice needs them.
