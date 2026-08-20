"use client";

import { useMemo, useState } from "react";
import {
  ArrowUpRight,
  BarChart3,
  Check,
  ChevronDown,
  CircleHelp,
  Crown,
  LayoutDashboard,
  Medal,
  Plus,
  Search,
  Shield,
  Sparkles,
  Trophy,
  Users,
  Zap,
} from "lucide-react";
import {
  BUDGET_LIMIT,
  SQUAD_LIMIT,
  calculateTeamScore,
  getPlayer,
  getSquadCost,
  getValidationMessage,
} from "../domain";
import type { Player, PlayerPosition, TeamState } from "../domain";
import { demoLeaderboard, fantasyPlayers, matchdayHighlights } from "./demo-data";

const positionLabels: Record<PlayerPosition, string> = {
  GK: "Goalkeeper",
  DEF: "Defender",
  MID: "Midfielder",
  FWD: "Forward",
};

const positionFilters: Array<{ label: string; value: "ALL" | PlayerPosition }> = [
  { label: "All players", value: "ALL" },
  { label: "Goalkeepers", value: "GK" },
  { label: "Defenders", value: "DEF" },
  { label: "Midfielders", value: "MID" },
  { label: "Forwards", value: "FWD" },
];

const initialTeam: TeamState = {
  selectedPlayerIds: ["p-001", "p-002", "p-003", "p-005", "p-008"],
  captainId: "p-008",
};

function formatPoints(points: number): string {
  return points.toString().padStart(2, "0");
}

function PlayerAvatar({ player, small = false }: { player: Player; small?: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={small ? "player-avatar player-avatar-small" : "player-avatar"}
      style={{ background: player.color }}
    >
      {player.initials}
    </span>
  );
}

function PlayerRow({
  player,
  selected,
  onToggle,
}: {
  player: Player;
  selected: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      className={`player-row ${selected ? "player-row-selected" : ""}`}
      onClick={onToggle}
      type="button"
    >
      <PlayerAvatar player={player} small />
      <span className="player-row-main">
        <span className="player-row-name">{player.name}</span>
        <span className="player-row-meta">
          {player.club} · {positionLabels[player.position]}
        </span>
      </span>
      <span className="player-row-form">
        <span>{player.form.toFixed(1)}</span>
        <span className="form-label">FORM</span>
      </span>
      <span className="player-row-price">{player.price} cr</span>
      <span className={`player-action ${selected ? "player-action-remove" : ""}`}>
        {selected ? <Check size={16} strokeWidth={3} /> : <Plus size={17} strokeWidth={2.5} />}
      </span>
    </button>
  );
}

function PitchSlot({
  player,
  captain,
  onCaptain,
}: {
  player?: Player;
  captain: boolean;
  onCaptain: () => void;
}) {
  if (!player) {
    return (
      <div className="pitch-slot pitch-slot-empty">
        <span className="empty-slot-plus">+</span>
        <span>Open slot</span>
      </div>
    );
  }

  return (
    <button
      className={`pitch-slot pitch-slot-filled ${captain ? "pitch-slot-captain" : ""}`}
      onClick={onCaptain}
      type="button"
    >
      {captain && <span className="captain-mark">C</span>}
      <PlayerAvatar player={player} />
      <span className="pitch-player-name">{player.name}</span>
      <span className="pitch-player-position">{player.position}</span>
    </button>
  );
}

type FantasyDashboardProps = Readonly<{
  managerName?: string;
}>;

function getManagerInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function FantasyDashboard({ managerName = "Marcus Khan" }: FantasyDashboardProps) {
  const [team, setTeam] = useState<TeamState>(initialTeam);
  const [filter, setFilter] = useState<"ALL" | PlayerPosition>("ALL");
  const [search, setSearch] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [activeNav, setActiveNav] = useState("Dashboard");

  const selectedPlayers = useMemo(
    () =>
      team.selectedPlayerIds.flatMap((playerId) => {
        const player = getPlayer(playerId, fantasyPlayers);
        return player ? [player] : [];
      }),
    [team.selectedPlayerIds],
  );

  const score = useMemo(() => calculateTeamScore(team, fantasyPlayers), [team]);
  const cost = getSquadCost(team, fantasyPlayers);
  const remaining = BUDGET_LIMIT - cost;
  const validationMessage = getValidationMessage(team, fantasyPlayers);

  const visiblePlayers = useMemo(() => {
    const query = search.trim().toLowerCase();
    return fantasyPlayers.filter((player) => {
      const matchesFilter = filter === "ALL" || player.position === filter;
      const matchesSearch = !query || `${player.name} ${player.club}`.toLowerCase().includes(query);
      return matchesFilter && matchesSearch;
    });
  }, [filter, search]);

  const leaderboard = useMemo(() => {
    const withUserScore = demoLeaderboard.map((entry) =>
      entry.name === "Your Clubhouse"
        ? { ...entry, points: submitted ? score.totalPoints : 0 }
        : entry,
    );
    return [...withUserScore]
      .sort((a, b) => b.points - a.points)
      .map((entry, index) => ({ ...entry, rank: index + 1 }));
  }, [score.totalPoints, submitted]);

  const userRank = leaderboard.find((entry) => entry.name === "Your Clubhouse")?.rank ?? 3;

  function togglePlayer(playerId: string) {
    setSubmitted(false);
    setTeam((current) => {
      const isSelected = current.selectedPlayerIds.includes(playerId);
      if (isSelected) {
        return {
          selectedPlayerIds: current.selectedPlayerIds.filter((id) => id !== playerId),
          captainId: current.captainId === playerId ? null : current.captainId,
        };
      }

      if (current.selectedPlayerIds.length >= SQUAD_LIMIT) return current;
      return { ...current, selectedPlayerIds: [...current.selectedPlayerIds, playerId] };
    });
  }

  function chooseCaptain(playerId: string) {
    setSubmitted(false);
    setTeam((current) => ({ ...current, captainId: playerId }));
  }

  function goTo(section: string, id?: string) {
    setActiveNav(section);
    if (id) document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand-lockup">
          <span className="brand-mark">
            <span />
          </span>
          <span className="brand-name">clubhouse</span>
        </div>
        <p className="brand-caption">Fantasy football, reimagined.</p>

        <nav className="sidebar-nav" aria-label="Main navigation">
          <span className="nav-label">Workspace</span>
          <button
            className={`nav-item ${activeNav === "Dashboard" ? "nav-item-active" : ""}`}
            onClick={() => goTo("Dashboard", "top")}
            type="button"
          >
            <LayoutDashboard size={18} />
            Dashboard
          </button>
          <button
            className={`nav-item ${activeNav === "My team" ? "nav-item-active" : ""}`}
            onClick={() => goTo("My team", "team-builder")}
            type="button"
          >
            <Shield size={18} />
            My team
            <span className="nav-count">5/5</span>
          </button>
          <button
            className={`nav-item ${activeNav === "Leaderboard" ? "nav-item-active" : ""}`}
            onClick={() => goTo("Leaderboard", "leaderboard")}
            type="button"
          >
            <Trophy size={18} />
            Leaderboard
          </button>
          <button className="nav-item" onClick={() => goTo("Leagues")} type="button">
            <Users size={18} />
            Leagues
            <span className="coming-soon">soon</span>
          </button>
        </nav>

        <div className="sidebar-bottom">
          <div className="season-card">
            <div className="season-icon">
              <Sparkles size={16} />
            </div>
            <div>
              <span className="season-label">Season 01</span>
              <strong>First light</strong>
            </div>
            <ArrowUpRight size={15} />
          </div>
          <button className="profile-mini" type="button">
            <span className="profile-avatar">{getManagerInitials(managerName)}</span>
            <span className="profile-copy">
              <strong>{managerName}</strong>
              <small>Manager</small>
            </span>
            <ChevronDown size={16} />
          </button>
        </div>
      </aside>

      <section className="main-content" id="top">
        <header className="topbar">
          <div className="topbar-breadcrumb">
            <span>Workspace</span>
            <span>/</span>
            <strong>Dashboard</strong>
          </div>
          <div className="topbar-actions">
            <span className="status-pill">
              <span className="status-dot" /> Gameweek 04 is open
            </span>
            <button aria-label="Help" className="icon-button" type="button">
              <CircleHelp size={19} />
            </button>
            <button
              aria-label="Notifications"
              className="icon-button notification-button"
              type="button"
            >
              <span className="notification-dot" /> <Zap size={18} />
            </button>
          </div>
        </header>

        <div className="content-wrap">
          <section className="hero-block">
            <div>
              <p className="section-kicker">
                Tuesday, 20 August 2026 <span className="kicker-line" />
              </p>
              <h1>Make your move.</h1>
              <p className="hero-copy">
                Your squad is taking shape. Set your captain, lock in your gameweek, and see what
                your football instincts are worth.
              </p>
            </div>
            <div className="hero-gameweek">
              <span className="hero-gameweek-label">GAMEWEEK</span>
              <strong>04</strong>
              <span className="hero-gameweek-time">
                Closes in <b>02:14:36</b>
              </span>
            </div>
          </section>

          <section className="insight-grid" aria-label="Matchday overview">
            {matchdayHighlights.map((highlight, index) => (
              <div className={`insight-card insight-card-${index + 1}`} key={highlight.label}>
                <span className="insight-label">{highlight.label}</span>
                <strong>{highlight.value}</strong>
                <span className="insight-detail">{highlight.detail}</span>
              </div>
            ))}
          </section>

          <section className="workspace-grid" id="team-builder">
            <div className="team-builder-card panel-card">
              <div className="panel-heading">
                <div>
                  <p className="section-kicker">
                    Your squad <span className="kicker-line" />
                  </p>
                  <h2>Clubhouse XI</h2>
                </div>
                <div className="budget-block">
                  <span>Remaining budget</span>
                  <strong className={remaining < 0 ? "budget-over" : ""}>
                    {remaining}
                    <small> cr</small>
                  </strong>
                </div>
              </div>

              <div className="formation-pitch">
                <div className="pitch-lines pitch-lines-one" />
                <div className="pitch-lines pitch-lines-two" />
                <div className="pitch-label">5—2—1—1</div>
                <div className="pitch-row pitch-row-forward">
                  <PitchSlot
                    player={selectedPlayers.find((player) => player.position === "FWD")}
                    captain={
                      team.captainId ===
                      selectedPlayers.find((player) => player.position === "FWD")?.id
                    }
                    onCaptain={() => {
                      const player = selectedPlayers.find(
                        (candidate) => candidate.position === "FWD",
                      );
                      if (player) chooseCaptain(player.id);
                    }}
                  />
                </div>
                <div className="pitch-row pitch-row-mid">
                  <PitchSlot
                    player={selectedPlayers.find((player) => player.position === "MID")}
                    captain={
                      team.captainId ===
                      selectedPlayers.find((player) => player.position === "MID")?.id
                    }
                    onCaptain={() => {
                      const player = selectedPlayers.find(
                        (candidate) => candidate.position === "MID",
                      );
                      if (player) chooseCaptain(player.id);
                    }}
                  />
                </div>
                <div className="pitch-row pitch-row-def">
                  {selectedPlayers
                    .filter((player) => player.position === "DEF")
                    .map((player) => (
                      <PitchSlot
                        key={player.id}
                        player={player}
                        captain={team.captainId === player.id}
                        onCaptain={() => chooseCaptain(player.id)}
                      />
                    ))}
                  {selectedPlayers.filter((player) => player.position === "DEF").length < 2 && (
                    <PitchSlot captain={false} onCaptain={() => undefined} />
                  )}
                </div>
                <div className="pitch-row pitch-row-keeper">
                  <PitchSlot
                    player={selectedPlayers.find((player) => player.position === "GK")}
                    captain={
                      team.captainId ===
                      selectedPlayers.find((player) => player.position === "GK")?.id
                    }
                    onCaptain={() => {
                      const player = selectedPlayers.find(
                        (candidate) => candidate.position === "GK",
                      );
                      if (player) chooseCaptain(player.id);
                    }}
                  />
                </div>
              </div>

              <div className="team-builder-footer">
                <div className="captain-hint">
                  <span className="captain-key">C</span>
                  <span>Select a player on the pitch to make them captain.</span>
                </div>
                <button
                  className="primary-button"
                  disabled={Boolean(validationMessage)}
                  onClick={() => setSubmitted(true)}
                  type="button"
                >
                  {submitted ? (
                    <>
                      <Check size={17} /> Gameweek locked
                    </>
                  ) : (
                    <>
                      Play gameweek <ArrowUpRight size={17} />
                    </>
                  )}
                </button>
              </div>
              {validationMessage && <p className="validation-message">{validationMessage}</p>}
            </div>

            <div className="score-card panel-card">
              <div className="score-card-top">
                <div>
                  <p className="section-kicker">
                    Current read <span className="kicker-line" />
                  </p>
                  <h2>{submitted ? "Your gameweek" : "Build your edge"}</h2>
                </div>
                <span className="score-icon">
                  <BarChart3 size={18} />
                </span>
              </div>
              <div className="score-number">
                <strong>{submitted ? formatPoints(score.totalPoints) : "—"}</strong>
                <span>{submitted ? "points" : "not submitted"}</span>
              </div>
              <div className="score-divider" />
              <div className="score-metric">
                <span>Squad value</span>
                <strong>
                  {cost} / {BUDGET_LIMIT} cr
                </strong>
              </div>
              <div className="score-metric">
                <span>Captain</span>
                <strong>
                  {team.captainId
                    ? getPlayer(team.captainId, fantasyPlayers)?.name
                    : "Not selected"}
                </strong>
              </div>
              <div className="score-metric">
                <span>Current rank</span>
                <strong>{submitted ? `#${userRank}` : "—"}</strong>
              </div>
              {submitted && (
                <div className="score-success">
                  <Sparkles size={15} /> Score calculated from your gameweek decisions.
                </div>
              )}
            </div>
          </section>

          {submitted && (
            <section className="results-section panel-card">
              <div className="results-heading">
                <div>
                  <p className="section-kicker">
                    The breakdown <span className="kicker-line" />
                  </p>
                  <h2>Every point has a reason.</h2>
                </div>
                <span className="result-total">
                  {score.totalPoints} <small>total points</small>
                </span>
              </div>
              <div className="score-breakdown-list">
                {score.playerScores.map((playerScore) => {
                  const player = getPlayer(playerScore.playerId, fantasyPlayers);
                  if (!player) return null;
                  return (
                    <div className="score-breakdown-row" key={player.id}>
                      <PlayerAvatar player={player} small />
                      <div className="breakdown-player">
                        <strong>{player.name}</strong>
                        <span>{player.club}</span>
                      </div>
                      <div className="breakdown-reasons">
                        {playerScore.reasons
                          .filter((reason) => !reason.startsWith("0 "))
                          .join(" · ")}
                      </div>
                      {playerScore.captainMultiplier === 2 && (
                        <span className="captain-badge">
                          <Crown size={12} /> 2× captain
                        </span>
                      )}
                      <strong className="breakdown-points">{playerScore.finalPoints}</strong>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          <section className="lower-grid">
            <div className="player-pool panel-card">
              <div className="panel-heading panel-heading-compact">
                <div>
                  <p className="section-kicker">
                    Scout the pool <span className="kicker-line" />
                  </p>
                  <h2>Available players</h2>
                </div>
                <span className="pool-count">{fantasyPlayers.length} players</span>
              </div>
              <div className="pool-controls">
                <label className="search-field">
                  <Search size={16} />
                  <span className="sr-only">Search players</span>
                  <input
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search by player or club"
                    value={search}
                  />
                </label>
                <div className="filter-tabs" role="tablist" aria-label="Player positions">
                  {positionFilters.map((option) => (
                    <button
                      className={
                        filter === option.value ? "filter-tab filter-tab-active" : "filter-tab"
                      }
                      key={option.value}
                      onClick={() => setFilter(option.value)}
                      role="tab"
                      type="button"
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="player-list">
                {visiblePlayers.map((player) => (
                  <PlayerRow
                    key={player.id}
                    onToggle={() => togglePlayer(player.id)}
                    player={player}
                    selected={team.selectedPlayerIds.includes(player.id)}
                  />
                ))}
                {visiblePlayers.length === 0 && (
                  <div className="empty-state">No players match that search.</div>
                )}
              </div>
            </div>

            <div className="leaderboard-card panel-card" id="leaderboard">
              <div className="panel-heading panel-heading-compact">
                <div>
                  <p className="section-kicker">
                    The table <span className="kicker-line" />
                  </p>
                  <h2>Leaderboard</h2>
                </div>
                <button
                  className="text-button"
                  onClick={() => goTo("Leaderboard", "leaderboard")}
                  type="button"
                >
                  Gameweek 04 <ChevronDown size={15} />
                </button>
              </div>
              <div className="leaderboard-list">
                {leaderboard.map((entry) => (
                  <div
                    className={`leaderboard-row ${entry.name === "Your Clubhouse" ? "leaderboard-row-user" : ""}`}
                    key={entry.name}
                  >
                    <span className={`rank-number rank-${entry.rank}`}>
                      {entry.rank === 1 ? <Medal size={15} /> : entry.rank}
                    </span>
                    <span className="leaderboard-team">
                      <strong>{entry.name}</strong>
                      <small>{entry.manager}</small>
                    </span>
                    <span
                      className={`movement ${entry.movement.startsWith("-") ? "movement-down" : ""}`}
                    >
                      {entry.movement}
                    </span>
                    <strong className="leaderboard-points">{entry.points}</strong>
                  </div>
                ))}
              </div>
              <button className="outline-button" onClick={() => goTo("Leagues")} type="button">
                View full table <ArrowUpRight size={16} />
              </button>
            </div>
          </section>

          <footer className="page-footer">
            <span>Clubhouse / Season 01</span>
            <span>Make a move worth remembering.</span>
          </footer>
        </div>
      </section>
    </main>
  );
}
