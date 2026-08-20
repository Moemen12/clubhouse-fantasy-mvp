"use client";

import { useState } from "react";
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

import { cn } from "@/shared/frontend/cn";
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

const sectionKicker =
  "flex items-center gap-2 text-[0.62rem] font-extrabold uppercase tracking-[0.14em] text-(--ink-faint)";
const kickerLine = "inline-block h-px w-8 bg-(--lime) opacity-80";
const panel = "rounded-3.5 border border-(--line) bg-(--deep-soft)";

function formatPoints(points: number): string {
  return points.toString().padStart(2, "0");
}

function PlayerAvatar({ player, small = false }: { player: Player; small?: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "grid shrink-0 place-items-center rounded-3.5 border-0.75 border-[rgba(10,14,10,0.45)] font-black tracking-[-0.04em] text-[#1b2310] shadow-[0_5px_13px_rgba(0,0,0,0.18)]",
        small ? "h-8.5 w-8.5 rounded-2.5 border-2 text-[0.56rem]" : "h-11.75 w-11.75 text-[0.7rem]",
      )}
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
      className={cn(
        "flex w-full items-center gap-2.5 border-b border-[rgba(222,232,213,0.07)] bg-transparent px-6.5 py-2.5 text-left text-(--ink) transition-colors hover:bg-[rgba(215,255,79,0.05)] max-175:gap-2 max-175:px-4.5",
        selected && "bg-[rgba(215,255,79,0.05)]",
      )}
      onClick={onToggle}
      type="button"
    >
      <PlayerAvatar player={player} small />
      <span className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="overflow-hidden text-ellipsis whitespace-nowrap text-[0.72rem] font-bold">
          {player.name}
        </span>
        <span className="overflow-hidden text-ellipsis whitespace-nowrap text-[0.6rem] text-(--ink-faint)">
          {player.club} · {positionLabels[player.position]}
        </span>
      </span>
      <span className="flex min-w-8.25 flex-col items-end text-[0.68rem] font-bold text-(--lime) max-175:hidden">
        <span>{player.form.toFixed(1)}</span>
        <span className="mt-0.5 text-[0.45rem] font-extrabold uppercase tracking-[0.14em] text-(--ink-faint)">
          FORM
        </span>
      </span>
      <span className="min-w-9.5 text-[0.65rem] text-(--ink-muted)">{player.price} cr</span>
      <span
        className={cn(
          "grid h-6.75 w-6.75 shrink-0 place-items-center rounded-full border border-[rgba(215,255,79,0.24)] text-(--lime)",
          selected && "bg-(--lime) text-[#202817]",
        )}
      >
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
      <div className="flex min-h-22.25 min-w-18.75 flex-col items-center justify-center gap-1 rounded-2.25 border border-dashed border-[rgba(215,255,79,0.28)] text-[0.55rem] uppercase text-[rgba(215,255,79,0.5)]">
        <span className="text-[1.2rem] font-light">+</span>
        <span>Open slot</span>
      </div>
    );
  }

  return (
    <button
      className="group relative flex min-w-18.75 flex-col items-center bg-transparent text-(--ink) transition-transform duration-150 hover:-translate-y-1"
      onClick={onCaptain}
      type="button"
    >
      {captain && (
        <span className="absolute right-0 -top-2.25 z-2 grid h-4.5 w-4.5 place-items-center rounded-full bg-(--lime) text-[0.6rem] font-black text-[#202817]">
          C
        </span>
      )}
      <span
        className={cn(
          captain &&
            "rounded-4 shadow-[0_0_0_3px_rgba(215,255,79,0.12),0_5px_16px_rgba(0,0,0,0.18)]",
        )}
      >
        <PlayerAvatar player={player} />
      </span>
      <span className="mt-1.5 max-w-22 overflow-hidden text-ellipsis whitespace-nowrap text-[0.64rem] font-bold">
        {player.name}
      </span>
      <span className="mt-0.5 text-[0.55rem] font-extrabold text-[rgba(215,255,79,0.7)]">
        {player.position}
      </span>
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

  const selectedPlayers = team.selectedPlayerIds.flatMap((playerId) => {
    const player = getPlayer(playerId, fantasyPlayers);
    return player ? [player] : [];
  });
  const score = calculateTeamScore(team, fantasyPlayers);
  const cost = getSquadCost(team, fantasyPlayers);
  const remaining = BUDGET_LIMIT - cost;
  const validationMessage = getValidationMessage(team, fantasyPlayers);
  const query = search.trim().toLowerCase();
  const visiblePlayers = fantasyPlayers.filter((player) => {
    const matchesFilter = filter === "ALL" || player.position === filter;
    const matchesSearch = !query || `${player.name} ${player.club}`.toLowerCase().includes(query);
    return matchesFilter && matchesSearch;
  });
  const withUserScore = demoLeaderboard.map((entry) =>
    entry.name === "Your Clubhouse"
      ? { ...entry, points: submitted ? score.totalPoints : 0 }
      : entry,
  );
  const leaderboard = withUserScore
    .toSorted((a, b) => b.points - a.points)
    .map((entry, index) => ({ ...entry, rank: index + 1 }));

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

  const navButton =
    "flex w-full items-center gap-3 rounded-2.25 bg-transparent px-3 py-2.75 text-left text-[0.79rem] font-semibold text-(--ink-muted) transition-colors hover:bg-[rgba(215,255,79,0.07)] hover:text-(--ink) active:scale-[0.98]";

  return (
    <main className="flex min-h-screen bg-[radial-gradient(circle_at_80%_0%,rgba(155,211,40,0.06),transparent_27rem),var(--deep)] text-(--ink)">
      <aside className="fixed inset-y-0 left-0 z-5 flex w-62 flex-col border-r border-(--line) bg-[rgba(15,18,15,0.92)] px-5 py-8.5 max-215:static max-215:h-auto max-215:w-full max-215:flex-row max-215:items-center max-215:justify-between max-215:border-b max-215:border-r-0 max-215:px-[5vw] max-215:py-4.25">
        <div className="flex items-center gap-2.5">
          <span className="relative inline-flex h-6.5 w-6.5 shrink-0 rotate-[-8deg] items-center justify-center rounded-[8px_8px_8px_2px] border border-(--lime) before:absolute before:left-1.25 before:top-1.25 before:h-1.25 before:w-1.25 before:rounded-full before:bg-(--lime) before:content-[''] after:absolute after:bottom-1.25 after:right-1.25 after:h-1.25 after:w-1.25 after:rounded-full after:bg-(--lime) after:content-['']">
            <span className="absolute left-2.5 top-2.5 h-1.25 w-1.25 rounded-full bg-(--lime)" />
          </span>
          <span className="text-[1.28rem] font-extrabold tracking-[-0.06em]">clubhouse</span>
        </div>
        <p className="mt-2 text-[0.7rem] text-(--ink-faint) max-215:hidden">
          Fantasy football, reimagined.
        </p>

        <nav className="mt-19.5 flex flex-col gap-1.75 max-215:hidden" aria-label="Main navigation">
          <span className="mb-2.5 px-2.5 text-[0.62rem] font-extrabold uppercase tracking-[0.14em] text-(--ink-faint)">
            Workspace
          </span>
          <button
            className={cn(
              navButton,
              activeNav === "Dashboard" &&
                "bg-(--lime) text-[#202817] shadow-[0_8px_22px_rgba(215,255,79,0.12)] hover:bg-(--lime) hover:text-[#202817]",
            )}
            onClick={() => goTo("Dashboard", "top")}
            type="button"
          >
            <LayoutDashboard size={18} /> Dashboard
          </button>
          <button
            className={cn(
              navButton,
              activeNav === "My team" &&
                "bg-(--lime) text-[#202817] shadow-[0_8px_22px_rgba(215,255,79,0.12)] hover:bg-(--lime) hover:text-[#202817]",
            )}
            onClick={() => goTo("My team", "team-builder")}
            type="button"
          >
            <Shield size={18} /> My team{" "}
            <span className="ml-auto text-[0.61rem] text-(--ink-faint)">5/5</span>
          </button>
          <button
            className={cn(
              navButton,
              activeNav === "Leaderboard" &&
                "bg-(--lime) text-[#202817] shadow-[0_8px_22px_rgba(215,255,79,0.12)] hover:bg-(--lime) hover:text-[#202817]",
            )}
            onClick={() => goTo("Leaderboard", "leaderboard")}
            type="button"
          >
            <Trophy size={18} /> Leaderboard
          </button>
          <button className={navButton} onClick={() => goTo("Leagues")} type="button">
            <Users size={18} /> Leagues{" "}
            <span className="ml-auto rounded-full border border-(--line) px-1.5 py-0.5 text-[0.61rem] uppercase text-(--ink-faint)">
              soon
            </span>
          </button>
        </nav>

        <div className="mt-auto flex flex-col gap-3.5 max-215:m-0">
          <div className="flex items-center gap-2.5 rounded-2.75 border border-(--line) bg-gradient-to-br from-[rgba(215,255,79,0.08)] to-[rgba(215,255,79,0.015)] p-3 max-215:hidden">
            <span className="grid h-7.25 w-7.25 place-items-center rounded-lg bg-[rgba(215,255,79,0.16)] text-(--lime)">
              <Sparkles size={16} />
            </span>
            <div>
              <span className="block text-[0.61rem] uppercase tracking-[0.08em] text-(--ink-faint)">
                Season 01
              </span>
              <strong className="mt-1 block text-[0.74rem]">First light</strong>
            </div>
            <ArrowUpRight className="ml-auto text-(--ink-faint)" size={15} />
          </div>
          <button
            className="flex items-center gap-2.5 bg-transparent px-1 py-2 text-left text-(--ink)"
            type="button"
          >
            <span className="grid h-7.5 w-7.5 place-items-center rounded-full bg-[#b6c7ff] text-[0.63rem] font-extrabold text-[#263452]">
              {getManagerInitials(managerName)}
            </span>
            <span className="flex flex-col gap-1">
              <strong className="text-[0.74rem]">{managerName}</strong>
              <small className="text-[0.61rem] uppercase tracking-[0.08em] text-(--ink-faint)">
                Manager
              </small>
            </span>
            <ChevronDown className="ml-auto text-(--ink-faint)" size={16} />
          </button>
        </div>
      </aside>

      <section className="ml-62 w-[calc(100%-248px)] max-215:ml-0 max-215:w-full" id="top">
        <header className="flex min-h-20.5 items-center justify-between border-b border-(--line) px-[5.5vw] max-280:px-[3.5vw] max-175:justify-end max-175:px-4">
          <div className="flex items-center gap-3 text-[0.75rem] text-(--ink-faint) max-175:hidden">
            <span>Workspace</span>
            <span>/</span>
            <strong className="font-semibold text-(--ink)">Dashboard</strong>
          </div>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-[rgba(215,255,79,0.18)] bg-[rgba(215,255,79,0.06)] px-2.75 py-2 text-[0.66rem] font-semibold text-[#cbd998] max-175:px-2 max-175:py-1.75 max-175:text-[0.59rem]">
              <span className="h-1.5 w-1.5 rounded-full bg-(--lime) shadow-[0_0_0_4px_rgba(215,255,79,0.08)]" />{" "}
              Gameweek 04 is open
            </span>
            <button
              aria-label="Help"
              className="grid h-8.5 w-8.5 place-items-center rounded-lg bg-transparent text-(--ink-muted) transition-colors hover:bg-(--deep-raised) hover:text-(--ink)"
              type="button"
            >
              <CircleHelp size={19} />
            </button>
            <button
              aria-label="Notifications"
              className="relative grid h-8.5 w-8.5 place-items-center rounded-lg bg-transparent text-(--ink-muted) transition-colors hover:bg-(--deep-raised) hover:text-(--ink)"
              type="button"
            >
              <span className="absolute right-1.5 top-1.5 h-1.25 w-1.25 rounded-full bg-(--orange)" />
              <Zap size={18} />
            </button>
          </div>
        </header>

        <div className="mx-auto w-[min(1280px,calc(100%-11vw))] py-17 pb-7.5 max-280:w-[min(calc(100%-7vw),1000px)] max-175:w-[calc(100%-32px)] max-175:pt-11.25">
          <section className="flex items-end justify-between gap-7.5 pb-13 max-175:block max-175:pb-8.75">
            <div>
              <p className={sectionKicker}>
                Tuesday, 20 August 2026 <span className={kickerLine} />
              </p>
              <h1 className="mt-3.75 max-w-[10ch] text-[clamp(3.8rem,7vw,7rem)] font-bold leading-[0.86] tracking-[-0.09em] max-175:text-[clamp(3.35rem,16vw,5.5rem)]">
                Make your move.
              </h1>
              <p className="mt-6.75 max-w-127.5 text-[0.94rem] leading-[1.7] text-(--ink-muted) max-175:mt-5.25 max-175:text-[0.84rem]">
                Your squad is taking shape. Set your captain, lock in your gameweek, and see what
                your football instincts are worth.
              </p>
            </div>
            <div className="flex min-w-37.5 flex-col items-end pb-1.5 max-175:mt-7.5 max-175:items-start">
              <span className="text-[0.62rem] font-extrabold uppercase tracking-[0.14em] text-(--ink-faint)">
                GAMEWEEK
              </span>
              <strong className="text-[5.5rem] font-normal leading-[0.95] tracking-[-0.12em] text-(--lime) max-175:text-[4.2rem]">
                04
              </strong>
              <span className="mt-3 text-[0.67rem] text-(--ink-faint)">
                Closes in <b className="text-(--ink)">02:14:36</b>
              </span>
            </div>
          </section>

          <section
            className="mb-3.75 grid grid-cols-3 gap-3 max-175:grid-cols-1"
            aria-label="Matchday overview"
          >
            {matchdayHighlights.map((highlight, index) => {
              const tone =
                ["text-(--lime)", "text-(--orange)", "text-(--blue)"][index] ?? "text-(--ink)";
              const ring =
                [
                  "border-[rgba(215,255,79,0.12)]",
                  "border-[rgba(255,185,94,0.15)]",
                  "border-[rgba(145,184,255,0.15)]",
                ][index] ?? "border-(--line)";
              return (
                <div
                  className="relative min-h-30.75 overflow-hidden rounded-3.5 border border-(--line) bg-(--deep-soft) px-5.5 py-5 max-175:min-h-27"
                  key={highlight.label}
                >
                  <span
                    aria-hidden
                    className={cn(
                      "pointer-events-none absolute -bottom-11.25 -right-6.25 h-31.25 w-31.25 rounded-full border",
                      ring,
                    )}
                  />
                  <span className="relative z-1 text-[0.62rem] font-extrabold uppercase tracking-[0.14em] text-(--ink-faint)">
                    {highlight.label}
                  </span>
                  <strong
                    className={cn(
                      "relative z-1 mt-4 block text-[1.05rem] font-semibold tracking-[-0.03em]",
                      tone,
                    )}
                  >
                    {highlight.value}
                  </strong>
                  <span className="relative z-1 mt-2 block text-[0.7rem] text-(--ink-faint)">
                    {highlight.detail}
                  </span>
                </div>
              );
            })}
          </section>

          <section
            className="mb-3.75 grid grid-cols-[minmax(0,1.55fr)_minmax(270px,0.75fr)] gap-3.75 max-175:grid-cols-1"
            id="team-builder"
          >
            <div className={cn(panel, "overflow-hidden")}>
              <div className="flex items-start justify-between gap-5 px-6.5 pb-5.5 pt-6.25 max-175:px-4.5">
                <div>
                  <p className={sectionKicker}>
                    Your squad <span className={kickerLine} />
                  </p>
                  <h2 className="mt-2.5 text-[1.3rem] font-semibold tracking-[-0.05em]">
                    Clubhouse XI
                  </h2>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className="text-[0.62rem] font-extrabold uppercase tracking-[0.14em] text-(--ink-faint)">
                    Remaining budget
                  </span>
                  <strong
                    className={cn(
                      "text-[1.55rem] font-semibold tracking-[-0.06em] text-(--lime)",
                      remaining < 0 && "text-(--red)",
                    )}
                  >
                    {remaining}
                    <small className="text-[0.66rem] text-(--ink-faint)"> cr</small>
                  </strong>
                </div>
              </div>
              <div className="relative mx-3.75 flex min-h-103.75 flex-col justify-between overflow-hidden rounded-2.75 border border-[rgba(215,255,79,0.16)] bg-[linear-gradient(90deg,transparent_49.8%,rgba(215,255,79,0.09)_50%,transparent_50.2%),linear-gradient(0deg,transparent_49.8%,rgba(215,255,79,0.09)_50%,transparent_50.2%),linear-gradient(105deg,rgba(63,87,40,0.45),rgba(39,65,44,0.72))] px-6 pb-7.75 pt-6 max-175:min-h-91.25 max-175:mx-2.5 max-175:px-3.5">
                <div className="pointer-events-none absolute left-[9%] right-[9%] top-0 h-[19%] rounded-b-[50%] border border-b-0 border-[rgba(215,255,79,0.1)]" />
                <div className="pointer-events-none absolute bottom-0 left-[9%] right-[9%] h-[19%] rounded-t-[50%] border border-b-0 border-[rgba(215,255,79,0.1)]" />
                <div className="pointer-events-none absolute left-1/2 top-1/2 h-32.5 w-32.5 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[rgba(215,255,79,0.12)]" />
                <div className="absolute right-4.5 top-3.75 text-[0.58rem] font-extrabold tracking-[0.13em] text-[rgba(215,255,79,0.49)]">
                  5—2—1—1
                </div>
                <div className="relative z-1 flex justify-center gap-[clamp(24px,8vw,80px)]">
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
                <div className="relative z-1 flex justify-center gap-[clamp(24px,8vw,80px)]">
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
                <div className="relative z-1 flex justify-center gap-[clamp(24px,8vw,80px)]">
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
                <div className="relative z-1 flex justify-center gap-[clamp(24px,8vw,80px)]">
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
              <div className="flex items-center justify-between gap-5 px-6.5 pb-6.25 pt-4.75 max-175:block max-175:px-4.5">
                <div className="flex items-center gap-2.5 text-[0.68rem] text-(--ink-faint) max-175:mb-3.75">
                  <span className="grid h-5.25 w-5.25 place-items-center rounded-1.25 border border-[rgba(215,255,79,0.32)] text-[0.62rem] font-extrabold text-(--lime)">
                    C
                  </span>
                  <span>Select a player on the pitch to make them captain.</span>
                </div>
                <button
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-(--lime) px-4 py-3 text-[0.72rem] font-extrabold text-[#202817] transition-transform hover:bg-[#e2ff75] active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-[#424a35] disabled:text-[#8f9a7b] max-175:w-full"
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
              {validationMessage && (
                <p className="px-6.5 pb-5.5 text-[0.68rem] text-(--orange)">{validationMessage}</p>
              )}
            </div>

            <div
              className={cn(
                panel,
                "self-start p-6.25 [background:radial-gradient(circle_at_100%_0%,rgba(215,255,79,0.1),transparent_16rem),var(--deep-soft)]",
              )}
            >
              <div className="flex items-start justify-between gap-3.5">
                <div>
                  <p className={sectionKicker}>
                    Current read <span className={kickerLine} />
                  </p>
                  <h2 className="mt-2.5 text-[1.3rem] font-semibold tracking-[-0.05em]">
                    {submitted ? "Your gameweek" : "Build your edge"}
                  </h2>
                </div>
                <span className="grid h-8.25 w-8.25 place-items-center rounded-2.25 bg-[rgba(215,255,79,0.12)] text-(--lime)">
                  <BarChart3 size={18} />
                </span>
              </div>
              <div className="my-12.75 flex items-baseline gap-3">
                <strong className="text-[5rem] font-normal leading-[0.8] tracking-[-0.12em] text-(--lime)">
                  {submitted ? formatPoints(score.totalPoints) : "—"}
                </strong>
                <span className="text-[0.69rem] uppercase text-(--ink-faint)">
                  {submitted ? "points" : "not submitted"}
                </span>
              </div>
              <div className="mb-2 h-px bg-(--line)" />
              {[
                ["Squad value", `${cost} / ${BUDGET_LIMIT} cr`],
                [
                  "Captain",
                  team.captainId ? getPlayer(team.captainId, fantasyPlayers)?.name : "Not selected",
                ],
                ["Current rank", submitted ? `#${userRank}` : "—"],
              ].map(([label, value]) => (
                <div
                  className="flex items-center justify-between border-b border-[rgba(222,232,213,0.06)] py-2.75 text-[0.7rem] text-(--ink-muted)"
                  key={label}
                >
                  <span>{label}</span>
                  <strong className="max-w-[55%] overflow-hidden text-ellipsis whitespace-nowrap text-right text-[0.71rem] font-semibold text-(--ink)">
                    {value}
                  </strong>
                </div>
              ))}
              {submitted && (
                <div className="mt-4.25 flex items-center gap-2 text-[0.65rem] leading-[1.4] text-(--lime)">
                  <Sparkles size={15} /> Score calculated from your gameweek decisions.
                </div>
              )}
            </div>
          </section>

          {submitted && (
            <section className={cn(panel, "mb-3.75 bg-(--deep-raised) p-6.5 max-175:p-4.75")}>
              <div className="mb-5.5 flex items-end justify-between gap-3.5 max-175:block">
                <div>
                  <p className={sectionKicker}>
                    The breakdown <span className={kickerLine} />
                  </p>
                  <h2 className="mt-2.5 text-[1.58rem] font-semibold tracking-[-0.05em]">
                    Every point has a reason.
                  </h2>
                </div>
                <span className="text-[1.45rem] font-semibold text-(--lime) max-175:mt-3.5 max-175:block">
                  {score.totalPoints}{" "}
                  <small className="text-[0.61rem] font-medium text-(--ink-faint)">
                    total points
                  </small>
                </span>
              </div>
              <div className="border-t border-(--line)">
                {score.playerScores.map((playerScore) => {
                  const player = getPlayer(playerScore.playerId, fantasyPlayers);
                  if (!player) return null;
                  return (
                    <div
                      className="flex min-h-15.5 items-center gap-2.5 border-b border-(--line)"
                      key={player.id}
                    >
                      <PlayerAvatar player={player} small />
                      <div className="flex min-w-28.75 flex-col gap-1 max-175:min-w-23.75">
                        <strong className="text-[0.74rem]">{player.name}</strong>
                        <span className="text-[0.61rem] text-(--ink-faint)">{player.club}</span>
                      </div>
                      <div className="flex-1 text-[0.65rem] text-(--ink-muted) max-280:hidden">
                        {playerScore.reasons
                          .filter((reason) => !reason.startsWith("0 "))
                          .join(" · ")}
                      </div>
                      {playerScore.captainMultiplier === 2 && (
                        <span className="inline-flex items-center gap-1 rounded-1.25 border border-[rgba(215,255,79,0.32)] px-1.5 py-1 text-[0.55rem] font-extrabold text-(--lime) max-175:hidden">
                          <Crown size={12} /> 2× captain
                        </span>
                      )}
                      <strong className="min-w-6.25 text-right text-[0.85rem] text-(--lime)">
                        {playerScore.finalPoints}
                      </strong>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          <section className="mb-3.75 grid grid-cols-[minmax(0,1.55fr)_minmax(270px,0.75fr)] gap-3.75 max-175:grid-cols-1">
            <div className={cn(panel, "overflow-hidden")}>
              <div className="flex items-start justify-between gap-5 px-6.5 pb-4.5 pt-6.25 max-175:px-4.5">
                <div>
                  <p className={sectionKicker}>
                    Scout the pool <span className={kickerLine} />
                  </p>
                  <h2 className="mt-2.5 text-[1.3rem] font-semibold tracking-[-0.05em]">
                    Available players
                  </h2>
                </div>
                <span className="text-[0.61rem] text-(--ink-faint)">
                  {fantasyPlayers.length} players
                </span>
              </div>
              <div className="flex flex-col gap-3.5 px-6.5 pb-4.25 max-175:px-4.5">
                <label className="flex items-center gap-2 rounded-1.75 border border-(--line) px-3 py-2.5 text-(--ink-faint) focus-within:border-[rgba(215,255,79,0.55)]">
                  <Search size={16} />
                  <span className="sr-only">Search players</span>
                  <input
                    className="w-full border-0 bg-transparent text-[0.7rem] text-(--ink) outline-none placeholder:text-[#626a61]"
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search by player or club"
                    value={search}
                  />
                </label>
                <div
                  className="flex gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none]"
                  role="tablist"
                  aria-label="Player positions"
                >
                  {positionFilters.map((option) => (
                    <button
                      className={cn(
                        "shrink-0 rounded-1.25 bg-transparent px-2 py-1.5 text-[0.61rem] text-(--ink-faint) transition-colors hover:bg-[rgba(215,255,79,0.1)] hover:text-(--lime)",
                        filter === option.value && "bg-[rgba(215,255,79,0.1)] text-(--lime)",
                      )}
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
              <div className="border-t border-(--line)">
                {visiblePlayers.map((player) => (
                  <PlayerRow
                    key={player.id}
                    onToggle={() => togglePlayer(player.id)}
                    player={player}
                    selected={team.selectedPlayerIds.includes(player.id)}
                  />
                ))}
                {visiblePlayers.length === 0 && (
                  <div className="p-[35px_26px] text-center text-[0.75rem] text-(--ink-faint)">
                    No players match that search.
                  </div>
                )}
              </div>
            </div>

            <div className={cn(panel, "overflow-hidden")} id="leaderboard">
              <div className="flex items-start justify-between gap-5 px-6.5 pb-4.5 pt-6.25 max-175:px-4.5">
                <div>
                  <p className={sectionKicker}>
                    The table <span className={kickerLine} />
                  </p>
                  <h2 className="mt-2.5 text-[1.3rem] font-semibold tracking-[-0.05em]">
                    Leaderboard
                  </h2>
                </div>
                <button
                  className="inline-flex items-center gap-2 bg-transparent text-[0.62rem] text-(--ink-muted) hover:text-(--lime)"
                  onClick={() => goTo("Leaderboard", "leaderboard")}
                  type="button"
                >
                  Gameweek 04 <ChevronDown size={15} />
                </button>
              </div>
              <div className="px-6.5">
                {leaderboard.map((entry) => (
                  <div
                    className={cn(
                      "flex min-h-14.75 items-center gap-2 border-b border-[rgba(222,232,213,0.07)]",
                      entry.name === "Your Clubhouse" &&
                        "-mx-3 rounded-1.75 bg-[rgba(215,255,79,0.08)] px-3",
                    )}
                    key={entry.name}
                  >
                    <span
                      className={cn(
                        "grid h-5.75 w-5.75 place-items-center text-[0.65rem] font-extrabold text-(--ink-faint)",
                        entry.rank === 1 && "rounded-full bg-[rgba(215,255,79,0.15)] text-(--lime)",
                      )}
                    >
                      {entry.rank === 1 ? <Medal size={15} /> : entry.rank}
                    </span>
                    <span className="flex min-w-0 flex-1 flex-col gap-1">
                      <strong className="overflow-hidden text-ellipsis whitespace-nowrap text-[0.7rem] text-(--ink)">
                        {entry.name}
                      </strong>
                      <small className="text-[0.58rem] text-(--ink-faint)">{entry.manager}</small>
                    </span>
                    <span
                      className={cn(
                        "text-[0.59rem] font-bold text-(--lime)",
                        entry.movement.startsWith("-") && "text-(--red)",
                      )}
                    >
                      {entry.movement}
                    </span>
                    <strong className="min-w-6.75 text-right text-[0.78rem] text-(--ink)">
                      {entry.points}
                    </strong>
                  </div>
                ))}
              </div>
              <button
                className="mx-6.5 mb-6.25 mt-4.5 inline-flex w-[calc(100%-52px)] items-center justify-center gap-2 rounded-1.75 border border-(--line-strong) bg-transparent p-2.75 text-[0.66rem] text-(--ink-muted) hover:border-[rgba(215,255,79,0.5)] hover:text-(--lime) max-175:mx-4.5 max-175:w-[calc(100%-36px)]"
                onClick={() => goTo("Leagues")}
                type="button"
              >
                View full table <ArrowUpRight size={16} />
              </button>
            </div>
          </section>

          <footer className="flex justify-between pt-4.5 text-[0.62rem] tracking-[0.03em] text-(--ink-faint) max-175:block max-175:leading-loose">
            <span>Clubhouse / Season 01</span>
            <span>Make a move worth remembering.</span>
          </footer>
        </div>
      </section>
    </main>
  );
}
