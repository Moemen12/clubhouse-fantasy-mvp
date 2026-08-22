# Clubhouse

This directory contains the Clubhouse Next.js application. Clubhouse is a fantasy-football showcase built around a focused journey: authenticate, build a squad, choose a captain, submit a decision, and understand the resulting score.

## Start locally

Use Node 22 LTS, Node 24 LTS, or Node 26+.

```bash
npm ci
cp .env.example .env.local
npm run dev
```

Before starting, set a real Supabase URL and publishable key in `.env.local`. Supabase Email provider confirmation must be disabled for the direct session-bearing sign-up flow.

## Validate

```bash
npm run validate
```

Validation checks runtime support, Biome formatting, ESLint and SonarJS rules, TypeScript, dependency direction, server-only doors, public imports, staged secrets, required environment values, and the production build.

## Structure

```text
src/
├── app/                         # Next.js pages, Proxy, and Server Actions
├── adapters/next/               # Next-specific composition boundaries
├── modules/
│   ├── auth/                    # Authentication capability and UI
│   └── fantasy/                 # Fantasy rules, demo data, and dashboard UI
└── shared/
    ├── kernel/                 # Pure shared values and route constants
    ├── frontend/               # Browser-safe UI primitives
    └── backend/                 # Server-side Supabase and environment helpers
```

Feature code is organized by responsibility. Domain code owns rules, application code orchestrates use cases, ports describe provider capabilities, infrastructure implements those ports, contracts describe serializable boundaries, and UI code owns presentation and client interaction.

Cross-feature consumers use public barrels instead of private implementation files. For example:

```ts
import { FantasyDashboard } from "@/modules/fantasy/ui";
import { AuthEntry, AuthStory } from "@/modules/auth";
```

Deep feature imports and arbitrary app-to-feature-UI imports fail through ESLint and the repository architecture checks. The direct import of the named authentication Server Action into `AuthForm` is the intentional Next.js exception required for `useActionState`.

## Authentication

The authentication form is a Client Component because it uses React Hook Form and `useActionState`. It imports the real Server Action directly. The Server Action validates the shared Zod contract, calls the server-side Supabase adapter, writes cookie-backed sessions, and redirects successful users to `/dashboard`.

Proxy refreshes incoming Supabase sessions and owns route access decisions. The dashboard page performs a server-side claims and user check before rendering. No preview authentication or local-storage authentication fallback exists. A visible theme switch lets users choose light or dark mode, and its presentation preference is persisted separately from the Supabase auth session.

## Environment

Required values are validated centrally before builds and at Node server boot:

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
```

Never commit `.env.local`, service-role keys, real tokens, or other credentials.

See the repository-level [`ARCHITECTURE.md`](../ARCHITECTURE.md) and [`PRODUCT_BRIEF.md`](../PRODUCT_BRIEF.md) for the detailed architecture and product scope.
