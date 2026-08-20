# Fantasy Football MVP Product Brief

## Product statement

We are building **Clubhouse**, a focused fantasy-football prototype for casual football fans who want to build a team, make one strategic decision, and immediately understand the result. The first release proves this through team selection, captain choice, scoring feedback, and a leaderboard. It does not attempt to reproduce a complete live sports platform or full football-management simulator.

## Target user

The first user is a casual football fan who wants a quick, understandable fantasy experience without learning a large set of rules.

## Core MVP journey

> A first-time user can choose a valid fantasy team, select a captain, submit the team, receive an explainable gameweek score, and see their position on a leaderboard.

## Confirmed, assumed, and unknown decisions

| Decision | State | Current working choice |
|---|---|---|
| The first experience is football-related. | Assumed from the available product signal. | Use a fantasy-football direction for this prototype. |
| Users choose players and compete by score. | Assumed. | Use a small fictional player pool and a local leaderboard. |
| The first release needs live football data. | Unknown. | Do not depend on live data for the first UI slice. |
| The product is a full football-management simulator. | Unknown. | Keep the prototype focused on one fantasy journey. |
| Authentication and multi-user persistence are required now. | Unknown. | Use a local demo state first; add a real persistence boundary later. |
| The score should be understandable. | Product requirement for this prototype. | Show a visible points breakdown for each selected player. |

## Version-one scope

### Build now

- A responsive fantasy-football dashboard.
- A small fictional player pool grouped by position.
- A budget-aware team builder.
- A captain-selection interaction.
- A submit-team action.
- A deterministic demo gameweek result.
- An explainable points breakdown.
- A leaderboard view.
- Clear empty, validation, and success states.

### Build later

- Account creation and persistent teams.
- Private leagues and invite links.
- Transfers and multiple gameweeks.
- Real sports-data integration.
- Notifications and social features.
- Admin data import and scoring controls.

### Do not build yet

- Real-money competitions.
- Live match streaming or a 3D match engine.
- Full AI opponents.
- Official league branding or licensed club assets.
- A complete football-manager simulation.

## Business rules for the first slice

| Rule | Definition |
|---|---|
| Squad | The user selects 5 players: 1 goalkeeper, 2 defenders, 1 midfielder, and 1 striker. |
| Budget | The squad cannot exceed 50 credits. |
| Captain | Exactly one selected player is the captain. |
| Submission | The team must be complete before it can be submitted. |
| Scoring | Player points come from the local demo performance data. |
| Captain multiplier | The captain’s points are doubled. |
| Leaderboard | Teams are ordered by total score. |

## Acceptance criteria

- A user can see the current squad, remaining budget, and required positions.
- A user cannot add a player if the squad would exceed the budget or position rules.
- A user can replace a selected player without losing valid state.
- A user can choose exactly one captain.
- The submit action is disabled until the team is valid.
- Submitting displays a score and a player-by-player explanation.
- The leaderboard displays the user’s result alongside demo competitors.
- The main experience works on desktop and mobile widths.

## Design direction

Use a dark, editorial sports-dashboard aesthetic: deep navy background, warm off-white surfaces, electric lime as the primary action color, and amber as a secondary highlight. The interface should feel like a premium match-day control room rather than a generic admin panel. Use clear hierarchy, compact data cards, strong section labels, and restrained motion.
