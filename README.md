# Clubhouse Fantasy Football Showcase

Clubhouse is a public fantasy-football showcase application built for a Neuroplay Studios full-stack job application. It demonstrates a focused product journey rather than a complete live-sports platform: a user creates an account, enters the dashboard, builds a squad, chooses a captain, submits a decision, and receives an explainable result.

The first slice uses a small deterministic fantasy dataset. It is intentionally independent of a live sports-data provider so the product flow, data boundaries, and user experience can be evaluated without waiting for a match to start or depending on licensing.

## Quick start

The application requires Node 22 LTS, Node 24 LTS, or Node 26+. Node 25 is not supported by the dependency-validation toolchain.

Install the root and application dependencies, then activate the repository hook:

```bash
npm run setup
```

Create `template/.env.local` from `template/.env.example` and provide a real Supabase project URL and publishable key. Then start the application:

```bash
npm run dev
```

The application is served by Next.js. Authentication requires Supabase Email provider support with **Confirm email disabled** for the direct session-bearing sign-up flow.

## Commands

| Command | Purpose |
|---|---|
| `npm run setup` | Install root and application dependencies and activate the staged-secret hook |
| `npm run dev` | Start the Clubhouse Next.js application |
| `npm run build` | Build the application for production |
| `npm run validate` | Run runtime, formatting, lint, type, architecture, secret, environment, and build checks |
| `npm run secrets` | Scan staged application contents for secrets |

Run validation with safe non-production values when a real Supabase project is not available:

```bash
NODE_ENV=test \
NEXT_PUBLIC_SUPABASE_URL=https://example.supabase.co \
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_test \
npm run validate
```

## Product scope

The current MVP centers on one clear journey:

> A first-time user can choose a valid fantasy team, select a captain, submit the team, receive an explainable gameweek score, and see their position on a leaderboard.

The current implementation begins with Supabase authentication and a fantasy-football showcase dashboard. Persistent teams, private leagues, transfers, multiple gameweeks, live sports data, notifications, and social features are deliberately deferred until the core journey proves useful.

Read [`PRODUCT_BRIEF.md`](./PRODUCT_BRIEF.md) for the product decisions, business rules, acceptance criteria, and design direction.

## Architecture

The runtime application lives under `template/`:

```text
template/src/
├── app/                         # Next.js pages, Proxy, and Server Actions
├── adapters/next/               # Next-specific composition boundaries
├── modules/
│   ├── auth/                    # Auth domain, application, ports, Supabase adapter, and UI
│   └── fantasy/                 # Fantasy domain rules, demo data, and dashboard UI
└── shared/
    ├── kernel/                 # Pure shared values and route constants
    ├── frontend/               # Browser-safe UI primitives
    └── backend/                 # Server-side Supabase and environment helpers
```

The dependency direction is inward:

```text
Next.js delivery → composition → application → domain
                                      ↓
                                     ports ← infrastructure
```

Feature consumers use public barrels instead of private implementation paths. For example:

```ts
import { FantasyDashboard } from "@/modules/fantasy/ui";
import { AuthEntry, AuthStory } from "@/modules/auth";
```

The repository rejects deep feature imports, arbitrary app-to-feature-UI imports, backend implementation bypasses, and invalid dependency direction through ESLint, dependency-cruiser, server-only checks, and public-import checks. See [`ARCHITECTURE.md`](./ARCHITECTURE.md) for the complete Clubhouse-specific guide.

## Authentication

Clubhouse uses Supabase Auth with the PKCE flow configuration. Credential submission runs through a real Next.js Server Action. The action validates the shared Zod contract, calls the server-side Supabase adapter, writes the session cookies, and redirects successful users to `/dashboard`.

The Next.js Proxy refreshes existing Supabase cookies and owns the request-level route policy. The dashboard server page performs its own claims and user check before rendering. There is no preview authentication mode and no local-storage authentication fallback. A separate in-app theme switch lets users choose light or dark mode; its presentation preference is persisted independently from the Supabase auth session.

## Environment validation

Supabase configuration is required before the application can build or start. A single Zod validator is called before production builds and again at Node server boot. Missing or invalid required values fail fast instead of producing a partially configured application.

Never commit `template/.env.local`, real tokens, service-role keys, or other credentials.
