# Clubhouse

**Clubhouse** is a focused fantasy-football MVP built around one simple experience:

> Choose a valid squad, select a captain, submit the gameweek, receive an explainable score, and see the leaderboard update.

This project is an original prototype inspired by the fantasy-football genre. It does not use official league branding, licensed club assets, live sports data, or real-money competitions.

## Current MVP

The current version includes a polished dashboard with:

- A dark editorial sports interface.
- A fictional player pool with positions, prices, form, and demo performances.
- Budget-aware squad selection.
- Position validation for a five-player squad.
- Captain selection with a 2× scoring multiplier.
- A deterministic demo gameweek score.
- Player-by-player score explanations.
- A demo leaderboard that reorders after submission.
- Responsive behavior for smaller screens.

The prototype intentionally uses local demo data so the complete user journey can be demonstrated immediately. A future sports-data provider can be added behind a data-source boundary without changing the core scoring rules.

## Run locally

Use Node.js 22 LTS, 24 LTS, or 26+.

```bash
npm ci
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Validate the project

```bash
npm run validate
```

The validation command runs the runtime check, formatter, ESLint, TypeScript, architecture dependency checks, secret scan, and production build.

## Demo flow

1. Open the dashboard.
2. Review the preselected squad and remaining budget.
3. Use the player pool to add or remove players.
4. Click a player on the pitch to choose the captain.
5. Click **Play gameweek**.
6. Review the total score, player-by-player explanation, and leaderboard position.

## Architecture

The project follows the hybrid boundaries from [Next Architecture Kit](https://github.com/Moemen12/next-architecture-kit):

```text
src/
├── app/                         # Next.js delivery and page composition
├── modules/fantasy/
│   ├── domain/                  # Framework-free rules and scoring
│   └── ui/                      # Fantasy dashboard and demo data
├── adapters/next/               # Next-specific composition adapters
└── shared/                      # Stable shared primitives
```

The scoring rules live in `src/modules/fantasy/domain/`. The dashboard is responsible for presentation and local interaction state. The demo data is kept separate from the rules so a future persisted or external data source can replace it.

## Product thinking

The product brief is in [`PRODUCT_BRIEF.md`](./PRODUCT_BRIEF.md). It records the target user, core MVP journey, assumptions, scope, business rules, and acceptance criteria before implementation.

The current implementation deliberately does **not** include authentication, persistent storage, private leagues, transfers, live data integration, notifications, or a complete football-management simulator. Those are future decisions, not hidden requirements.

## License

MIT
