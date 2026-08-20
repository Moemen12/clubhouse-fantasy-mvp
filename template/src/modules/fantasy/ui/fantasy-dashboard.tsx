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
  "flex items-center gap-2 text-[0.62rem] font-extrabold uppercase tracking-[0.14em] text-[var(--ink-faint)]";
const kickerLine = "inline-block h-px w-8 bg-[var(--lime)] opacity-80";
const panel = "rounded-[14px] border border-[var(--line)] bg-[var(--deep-soft)]";

function formatPoints(points: number): string {
  return points.toString().padStart(2, "0");
}

function PlayerAvatar({ player, small = false }: { player: Player; small?: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "grid shrink-0 place-items-center rounded-[14px] border-[3px] border-[rgba(10,14,10,0.45)] font-black tracking-[-0.04em] text-[#1b2310] shadow-[0_5px_13px_rgba(0,0,0,0.18)]",
        small
          ? "h-[34px] w-[34px] rounded-[10px] border-2 text-[0.56rem]"
          : "h-[47px] w-[47px] text-[0.7rem]",
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
        "flex w-full items-center gap-2.5 border-b border-[rgba(222,232,213,0.07)] bg-transparent px-[26px] py-2.5 text-left text-[var(--ink)] transition-colors hover:bg-[rgba(215,255,79,0.05)] max-[700px]:gap-2 max-[700px]:px-[18px]",
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
        <span className="overflow-hidden text-ellipsis whitespace-nowrap text-[0.6rem] text-[var(--ink-faint)]">
          {player.club} · {positionLabels[player.position]}
        </span>
      </span>
      <span className="flex min-w-[33px] flex-col items-end text-[0.68rem] font-bold text-[var(--lime)] max-[700px]:hidden">
        <span>{player.form.toFixed(1)}</span>
        <span className="mt-0.5 text-[0.45rem] font-extrabold uppercase tracking-[0.14em] text-[var(--ink-faint)]">
          FORM
        </span>
      </span>
      <span className="min-w-[38px] text-[0.65rem] text-[var(--ink-muted)]">{player.price} cr</span>
      <span
        className={cn(
          "grid h-[27px] w-[27px] shrink-0 place-items-center rounded-full border border-[rgba(215,255,79,0.24)] text-[var(--lime)]",
          selected && "bg-[var(--lime)] text-[#202817]",
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
      <div className="flex min-h-[89px] min-w-[75px] flex-col items-center justify-center gap-1 rounded-[9px] border border-dashed border-[rgba(215,255,79,0.28)] text-[0.55rem] uppercase text-[rgba(215,255,79,0.5)]">
        <span className="text-[1.2rem] font-light">+</span>
        <span>Open slot</span>
      </div>
    );
  }

  return (
    <button
      className="group relative flex min-w-[75px] flex-col items-center bg-transparent text-[var(--ink)] transition-transform duration-150 hover:-translate-y-1"
      onClick={onCaptain}
      type="button"
    >
      {captain && (
        <span className="absolute right-0 top-[-9px] z-[2] grid h-[18px] w-[18px] place-items-center rounded-full bg-[var(--lime)] text-[0.6rem] font-black text-[#202817]">
          C
        </span>
      )}
      <span
        className={cn(
          captain &&
            "rounded-[16px] shadow-[0_0_0_3px_rgba(215,255,79,0.12),0_5px_16px_rgba(0,0,0,0.18)]",
        )}
      >
        <PlayerAvatar player={player} />
      </span>
      <span className="mt-1.5 max-w-[88px] overflow-hidden text-ellipsis whitespace-nowrap text-[0.64rem] font-bold">
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

  const navButton =
    "flex w-full items-center gap-3 rounded-[9px] bg-transparent px-3 py-[11px] text-left text-[0.79rem] font-semibold text-[var(--ink-muted)] transition-colors hover:bg-[rgba(215,255,79,0.07)] hover:text-[var(--ink)] active:scale-[0.98]";

  return (
    <main className="flex min-h-screen bg-[radial-gradient(circle_at_80%_0%,rgba(155,211,40,0.06),transparent_27rem),var(--deep)] text-[var(--ink)]">
      <aside className="fixed inset-y-0 left-0 z-[5] flex w-[248px] flex-col border-r border-[var(--line)] bg-[rgba(15,18,15,0.92)] px-5 py-[34px] max-[860px]:static max-[860px]:h-auto max-[860px]:w-full max-[860px]:flex-row max-[860px]:items-center max-[860px]:justify-between max-[860px]:border-b max-[860px]:border-r-0 max-[860px]:px-[5vw] max-[860px]:py-[17px]">
        <div className="flex items-center gap-2.5">
          <span className="relative inline-flex h-[26px] w-[26px] shrink-0 rotate-[-8deg] items-center justify-center rounded-[8px_8px_8px_2px] border border-[var(--lime)] before:absolute before:left-[5px] before:top-[5px] before:h-[5px] before:w-[5px] before:rounded-full before:bg-[var(--lime)] before:content-[''] after:absolute after:bottom-[5px] after:right-[5px] after:h-[5px] after:w-[5px] after:rounded-full after:bg-[var(--lime)] after:content-['']">
            <span className="absolute left-[10px] top-[10px] h-[5px] w-[5px] rounded-full bg-[var(--lime)]" />
          </span>
          <span className="text-[1.28rem] font-extrabold tracking-[-0.06em]">clubhouse</span>
        </div>
        <p className="mt-2 text-[0.7rem] text-[var(--ink-faint)] max-[860px]:hidden">
          Fantasy football, reimagined.
        </p>

        <nav
          className="mt-[78px] flex flex-col gap-[7px] max-[860px]:hidden"
          aria-label="Main navigation"
        >
          <span className="mb-2.5 px-2.5 text-[0.62rem] font-extrabold uppercase tracking-[0.14em] text-[var(--ink-faint)]">
            Workspace
          </span>
          <button
            className={cn(
              navButton,
              activeNav === "Dashboard" &&
                "bg-[var(--lime)] text-[#202817] shadow-[0_8px_22px_rgba(215,255,79,0.12)] hover:bg-[var(--lime)] hover:text-[#202817]",
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
                "bg-[var(--lime)] text-[#202817] shadow-[0_8px_22px_rgba(215,255,79,0.12)] hover:bg-[var(--lime)] hover:text-[#202817]",
            )}
            onClick={() => goTo("My team", "team-builder")}
            type="button"
          >
            <Shield size={18} /> My team{" "}
            <span className="ml-auto text-[0.61rem] text-[var(--ink-faint)]">5/5</span>
          </button>
          <button
            className={cn(
              navButton,
              activeNav === "Leaderboard" &&
                "bg-[var(--lime)] text-[#202817] shadow-[0_8px_22px_rgba(215,255,79,0.12)] hover:bg-[var(--lime)] hover:text-[#202817]",
            )}
            onClick={() => goTo("Leaderboard", "leaderboard")}
            type="button"
          >
            <Trophy size={18} /> Leaderboard
          </button>
          <button className={navButton} onClick={() => goTo("Leagues")} type="button">
            <Users size={18} /> Leagues{" "}
            <span className="ml-auto rounded-full border border-[var(--line)] px-1.5 py-0.5 text-[0.61rem] uppercase text-[var(--ink-faint)]">
              soon
            </span>
          </button>
        </nav>

        <div className="mt-auto flex flex-col gap-3.5 max-[860px]:m-0">
          <div className="flex items-center gap-2.5 rounded-[11px] border border-[var(--line)] bg-gradient-to-br from-[rgba(215,255,79,0.08)] to-[rgba(215,255,79,0.015)] p-3 max-[860px]:hidden">
            <span className="grid h-[29px] w-[29px] place-items-center rounded-lg bg-[rgba(215,255,79,0.16)] text-[var(--lime)]">
              <Sparkles size={16} />
            </span>
            <div>
              <span className="block text-[0.61rem] uppercase tracking-[0.08em] text-[var(--ink-faint)]">
                Season 01
              </span>
              <strong className="mt-1 block text-[0.74rem]">First light</strong>
            </div>
            <ArrowUpRight className="ml-auto text-[var(--ink-faint)]" size={15} />
          </div>
          <button
            className="flex items-center gap-2.5 bg-transparent px-1 py-2 text-left text-[var(--ink)]"
            type="button"
          >
            <span className="grid h-[30px] w-[30px] place-items-center rounded-full bg-[#b6c7ff] text-[0.63rem] font-extrabold text-[#263452]">
              {getManagerInitials(managerName)}
            </span>
            <span className="flex flex-col gap-1">
              <strong className="text-[0.74rem]">{managerName}</strong>
              <small className="text-[0.61rem] uppercase tracking-[0.08em] text-[var(--ink-faint)]">
                Manager
              </small>
            </span>
            <ChevronDown className="ml-auto text-[var(--ink-faint)]" size={16} />
          </button>
        </div>
      </aside>

      <section
        className="ml-[248px] w-[calc(100%-248px)] max-[860px]:ml-0 max-[860px]:w-full"
        id="top"
      >
        <header className="flex min-h-[82px] items-center justify-between border-b border-[var(--line)] px-[5.5vw] max-[1120px]:px-[3.5vw] max-[700px]:justify-end max-[700px]:px-4">
          <div className="flex items-center gap-3 text-[0.75rem] text-[var(--ink-faint)] max-[700px]:hidden">
            <span>Workspace</span>
            <span>/</span>
            <strong className="font-semibold text-[var(--ink)]">Dashboard</strong>
          </div>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-[rgba(215,255,79,0.18)] bg-[rgba(215,255,79,0.06)] px-[11px] py-2 text-[0.66rem] font-semibold text-[#cbd998] max-[700px]:px-2 max-[700px]:py-[7px] max-[700px]:text-[0.59rem]">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--lime)] shadow-[0_0_0_4px_rgba(215,255,79,0.08)]" />{" "}
              Gameweek 04 is open
            </span>
            <button
              aria-label="Help"
              className="grid h-[34px] w-[34px] place-items-center rounded-lg bg-transparent text-[var(--ink-muted)] transition-colors hover:bg-[var(--deep-raised)] hover:text-[var(--ink)]"
              type="button"
            >
              <CircleHelp size={19} />
            </button>
            <button
              aria-label="Notifications"
              className="relative grid h-[34px] w-[34px] place-items-center rounded-lg bg-transparent text-[var(--ink-muted)] transition-colors hover:bg-[var(--deep-raised)] hover:text-[var(--ink)]"
              type="button"
            >
              <span className="absolute right-1.5 top-1.5 h-[5px] w-[5px] rounded-full bg-[var(--orange)]" />
              <Zap size={18} />
            </button>
          </div>
        </header>

        <div className="mx-auto w-[min(1280px,calc(100%-11vw))] py-[68px] pb-[30px] max-[1120px]:w-[min(calc(100%-7vw),1000px)] max-[700px]:w-[calc(100%-32px)] max-[700px]:pt-[45px]">
          <section className="flex items-end justify-between gap-[30px] pb-[52px] max-[700px]:block max-[700px]:pb-[35px]">
            <div>
              <p className={sectionKicker}>
                Tuesday, 20 August 2026 <span className={kickerLine} />
              </p>
              <h1 className="mt-[15px] max-w-[10ch] text-[clamp(3.8rem,7vw,7rem)] font-bold leading-[0.86] tracking-[-0.09em] max-[700px]:text-[clamp(3.35rem,16vw,5.5rem)]">
                Make your move.
              </h1>
              <p className="mt-[27px] max-w-[510px] text-[0.94rem] leading-[1.7] text-[var(--ink-muted)] max-[700px]:mt-[21px] max-[700px]:text-[0.84rem]">
                Your squad is taking shape. Set your captain, lock in your gameweek, and see what
                your football instincts are worth.
              </p>
            </div>
            <div className="flex min-w-[150px] flex-col items-end pb-1.5 max-[700px]:mt-[30px] max-[700px]:items-start">
              <span className="text-[0.62rem] font-extrabold uppercase tracking-[0.14em] text-[var(--ink-faint)]">
                GAMEWEEK
              </span>
              <strong className="text-[5.5rem] font-normal leading-[0.95] tracking-[-0.12em] text-[var(--lime)] max-[700px]:text-[4.2rem]">
                04
              </strong>
              <span className="mt-3 text-[0.67rem] text-[var(--ink-faint)]">
                Closes in <b className="text-[var(--ink)]">02:14:36</b>
              </span>
            </div>
          </section>

          <section
            className="mb-[15px] grid grid-cols-3 gap-3 max-[700px]:grid-cols-1"
            aria-label="Matchday overview"
          >
            {matchdayHighlights.map((highlight, index) => {
              const tone =
                ["text-[var(--lime)]", "text-[var(--orange)]", "text-[var(--blue)]"][index] ??
                "text-[var(--ink)]";
              const ring =
                [
                  "border-[rgba(215,255,79,0.12)]",
                  "border-[rgba(255,185,94,0.15)]",
                  "border-[rgba(145,184,255,0.15)]",
                ][index] ?? "border-[var(--line)]";
              return (
                <div
                  className="relative min-h-[123px] overflow-hidden rounded-[14px] border border-[var(--line)] bg-[var(--deep-soft)] px-[22px] py-5 max-[700px]:min-h-[108px]"
                  key={highlight.label}
                >
                  <span
                    aria-hidden
                    className={cn(
                      "pointer-events-none absolute bottom-[-45px] right-[-25px] h-[125px] w-[125px] rounded-full border",
                      ring,
                    )}
                  />
                  <span className="relative z-[1] text-[0.62rem] font-extrabold uppercase tracking-[0.14em] text-[var(--ink-faint)]">
                    {highlight.label}
                  </span>
                  <strong
                    className={cn(
                      "relative z-[1] mt-4 block text-[1.05rem] font-semibold tracking-[-0.03em]",
                      tone,
                    )}
                  >
                    {highlight.value}
                  </strong>
                  <span className="relative z-[1] mt-2 block text-[0.7rem] text-[var(--ink-faint)]">
                    {highlight.detail}
                  </span>
                </div>
              );
            })}
          </section>

          <section
            className="mb-[15px] grid grid-cols-[minmax(0,1.55fr)_minmax(270px,0.75fr)] gap-[15px] max-[700px]:grid-cols-1"
            id="team-builder"
          >
            <div className={cn(panel, "overflow-hidden")}>
              <div className="flex items-start justify-between gap-5 px-[26px] pb-[22px] pt-[25px] max-[700px]:px-[18px]">
                <div>
                  <p className={sectionKicker}>
                    Your squad <span className={kickerLine} />
                  </p>
                  <h2 className="mt-2.5 text-[1.3rem] font-semibold tracking-[-0.05em]">
                    Clubhouse XI
                  </h2>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className="text-[0.62rem] font-extrabold uppercase tracking-[0.14em] text-[var(--ink-faint)]">
                    Remaining budget
                  </span>
                  <strong
                    className={cn(
                      "text-[1.55rem] font-semibold tracking-[-0.06em] text-[var(--lime)]",
                      remaining < 0 && "text-[var(--red)]",
                    )}
                  >
                    {remaining}
                    <small className="text-[0.66rem] text-[var(--ink-faint)]"> cr</small>
                  </strong>
                </div>
              </div>
              <div className="relative mx-[15px] flex min-h-[415px] flex-col justify-between overflow-hidden rounded-[11px] border border-[rgba(215,255,79,0.16)] bg-[linear-gradient(90deg,transparent_49.8%,rgba(215,255,79,0.09)_50%,transparent_50.2%),linear-gradient(0deg,transparent_49.8%,rgba(215,255,79,0.09)_50%,transparent_50.2%),linear-gradient(105deg,rgba(63,87,40,0.45),rgba(39,65,44,0.72))] px-6 pb-[31px] pt-6 max-[700px]:min-h-[365px] max-[700px]:mx-2.5 max-[700px]:px-3.5">
                <div className="pointer-events-none absolute left-[9%] right-[9%] top-0 h-[19%] rounded-b-[50%] border border-b-0 border-[rgba(215,255,79,0.1)]" />
                <div className="pointer-events-none absolute bottom-0 left-[9%] right-[9%] h-[19%] rounded-t-[50%] border border-b-0 border-[rgba(215,255,79,0.1)]" />
                <div className="pointer-events-none absolute left-1/2 top-1/2 h-[130px] w-[130px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[rgba(215,255,79,0.12)]" />
                <div className="absolute right-[18px] top-[15px] text-[0.58rem] font-extrabold tracking-[0.13em] text-[rgba(215,255,79,0.49)]">
                  5—2—1—1
                </div>
                <div className="relative z-[1] flex justify-center gap-[clamp(24px,8vw,80px)]">
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
                <div className="relative z-[1] flex justify-center gap-[clamp(24px,8vw,80px)]">
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
                <div className="relative z-[1] flex justify-center gap-[clamp(24px,8vw,80px)]">
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
                <div className="relative z-[1] flex justify-center gap-[clamp(24px,8vw,80px)]">
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
              <div className="flex items-center justify-between gap-5 px-[26px] pb-[25px] pt-[19px] max-[700px]:block max-[700px]:px-[18px]">
                <div className="flex items-center gap-2.5 text-[0.68rem] text-[var(--ink-faint)] max-[700px]:mb-[15px]">
                  <span className="grid h-[21px] w-[21px] place-items-center rounded-[5px] border border-[rgba(215,255,79,0.32)] text-[0.62rem] font-extrabold text-[var(--lime)]">
                    C
                  </span>
                  <span>Select a player on the pitch to make them captain.</span>
                </div>
                <button
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--lime)] px-4 py-3 text-[0.72rem] font-extrabold text-[#202817] transition-transform hover:bg-[#e2ff75] active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-[#424a35] disabled:text-[#8f9a7b] max-[700px]:w-full"
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
                <p className="px-[26px] pb-[22px] text-[0.68rem] text-[var(--orange)]">
                  {validationMessage}
                </p>
              )}
            </div>

            <div
              className={cn(
                panel,
                "self-start p-[25px] [background:radial-gradient(circle_at_100%_0%,rgba(215,255,79,0.1),transparent_16rem),var(--deep-soft)]",
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
                <span className="grid h-[33px] w-[33px] place-items-center rounded-[9px] bg-[rgba(215,255,79,0.12)] text-[var(--lime)]">
                  <BarChart3 size={18} />
                </span>
              </div>
              <div className="my-[51px] flex items-baseline gap-3">
                <strong className="text-[5rem] font-normal leading-[0.8] tracking-[-0.12em] text-[var(--lime)]">
                  {submitted ? formatPoints(score.totalPoints) : "—"}
                </strong>
                <span className="text-[0.69rem] uppercase text-[var(--ink-faint)]">
                  {submitted ? "points" : "not submitted"}
                </span>
              </div>
              <div className="mb-2 h-px bg-[var(--line)]" />
              {[
                ["Squad value", `${cost} / ${BUDGET_LIMIT} cr`],
                [
                  "Captain",
                  team.captainId ? getPlayer(team.captainId, fantasyPlayers)?.name : "Not selected",
                ],
                ["Current rank", submitted ? `#${userRank}` : "—"],
              ].map(([label, value]) => (
                <div
                  className="flex items-center justify-between border-b border-[rgba(222,232,213,0.06)] py-[11px] text-[0.7rem] text-[var(--ink-muted)]"
                  key={label}
                >
                  <span>{label}</span>
                  <strong className="max-w-[55%] overflow-hidden text-ellipsis whitespace-nowrap text-right text-[0.71rem] font-semibold text-[var(--ink)]">
                    {value}
                  </strong>
                </div>
              ))}
              {submitted && (
                <div className="mt-[17px] flex items-center gap-2 text-[0.65rem] leading-[1.4] text-[var(--lime)]">
                  <Sparkles size={15} /> Score calculated from your gameweek decisions.
                </div>
              )}
            </div>
          </section>

          {submitted && (
            <section
              className={cn(
                panel,
                "mb-[15px] bg-[var(--deep-raised)] p-[26px] max-[700px]:p-[19px]",
              )}
            >
              <div className="mb-[22px] flex items-end justify-between gap-3.5 max-[700px]:block">
                <div>
                  <p className={sectionKicker}>
                    The breakdown <span className={kickerLine} />
                  </p>
                  <h2 className="mt-2.5 text-[1.58rem] font-semibold tracking-[-0.05em]">
                    Every point has a reason.
                  </h2>
                </div>
                <span className="text-[1.45rem] font-semibold text-[var(--lime)] max-[700px]:mt-3.5 max-[700px]:block">
                  {score.totalPoints}{" "}
                  <small className="text-[0.61rem] font-medium text-[var(--ink-faint)]">
                    total points
                  </small>
                </span>
              </div>
              <div className="border-t border-[var(--line)]">
                {score.playerScores.map((playerScore) => {
                  const player = getPlayer(playerScore.playerId, fantasyPlayers);
                  if (!player) return null;
                  return (
                    <div
                      className="flex min-h-[62px] items-center gap-2.5 border-b border-[var(--line)]"
                      key={player.id}
                    >
                      <PlayerAvatar player={player} small />
                      <div className="flex min-w-[115px] flex-col gap-1 max-[700px]:min-w-[95px]">
                        <strong className="text-[0.74rem]">{player.name}</strong>
                        <span className="text-[0.61rem] text-[var(--ink-faint)]">
                          {player.club}
                        </span>
                      </div>
                      <div className="flex-1 text-[0.65rem] text-[var(--ink-muted)] max-[1120px]:hidden">
                        {playerScore.reasons
                          .filter((reason) => !reason.startsWith("0 "))
                          .join(" · ")}
                      </div>
                      {playerScore.captainMultiplier === 2 && (
                        <span className="inline-flex items-center gap-1 rounded-[5px] border border-[rgba(215,255,79,0.32)] px-1.5 py-1 text-[0.55rem] font-extrabold text-[var(--lime)] max-[700px]:hidden">
                          <Crown size={12} /> 2× captain
                        </span>
                      )}
                      <strong className="min-w-[25px] text-right text-[0.85rem] text-[var(--lime)]">
                        {playerScore.finalPoints}
                      </strong>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          <section className="mb-[15px] grid grid-cols-[minmax(0,1.55fr)_minmax(270px,0.75fr)] gap-[15px] max-[700px]:grid-cols-1">
            <div className={cn(panel, "overflow-hidden")}>
              <div className="flex items-start justify-between gap-5 px-[26px] pb-[18px] pt-[25px] max-[700px]:px-[18px]">
                <div>
                  <p className={sectionKicker}>
                    Scout the pool <span className={kickerLine} />
                  </p>
                  <h2 className="mt-2.5 text-[1.3rem] font-semibold tracking-[-0.05em]">
                    Available players
                  </h2>
                </div>
                <span className="text-[0.61rem] text-[var(--ink-faint)]">
                  {fantasyPlayers.length} players
                </span>
              </div>
              <div className="flex flex-col gap-3.5 px-[26px] pb-[17px] max-[700px]:px-[18px]">
                <label className="flex items-center gap-2 rounded-[7px] border border-[var(--line)] px-3 py-2.5 text-[var(--ink-faint)] focus-within:border-[rgba(215,255,79,0.55)]">
                  <Search size={16} />
                  <span className="sr-only">Search players</span>
                  <input
                    className="w-full border-0 bg-transparent text-[0.7rem] text-[var(--ink)] outline-none placeholder:text-[#626a61]"
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
                        "shrink-0 rounded-[5px] bg-transparent px-2 py-1.5 text-[0.61rem] text-[var(--ink-faint)] transition-colors hover:bg-[rgba(215,255,79,0.1)] hover:text-[var(--lime)]",
                        filter === option.value && "bg-[rgba(215,255,79,0.1)] text-[var(--lime)]",
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
              <div className="border-t border-[var(--line)]">
                {visiblePlayers.map((player) => (
                  <PlayerRow
                    key={player.id}
                    onToggle={() => togglePlayer(player.id)}
                    player={player}
                    selected={team.selectedPlayerIds.includes(player.id)}
                  />
                ))}
                {visiblePlayers.length === 0 && (
                  <div className="p-[35px_26px] text-center text-[0.75rem] text-[var(--ink-faint)]">
                    No players match that search.
                  </div>
                )}
              </div>
            </div>

            <div className={cn(panel, "overflow-hidden")} id="leaderboard">
              <div className="flex items-start justify-between gap-5 px-[26px] pb-[18px] pt-[25px] max-[700px]:px-[18px]">
                <div>
                  <p className={sectionKicker}>
                    The table <span className={kickerLine} />
                  </p>
                  <h2 className="mt-2.5 text-[1.3rem] font-semibold tracking-[-0.05em]">
                    Leaderboard
                  </h2>
                </div>
                <button
                  className="inline-flex items-center gap-2 bg-transparent text-[0.62rem] text-[var(--ink-muted)] hover:text-[var(--lime)]"
                  onClick={() => goTo("Leaderboard", "leaderboard")}
                  type="button"
                >
                  Gameweek 04 <ChevronDown size={15} />
                </button>
              </div>
              <div className="px-[26px]">
                {leaderboard.map((entry) => (
                  <div
                    className={cn(
                      "flex min-h-[59px] items-center gap-2 border-b border-[rgba(222,232,213,0.07)]",
                      entry.name === "Your Clubhouse" &&
                        "mx-[-12px] rounded-[7px] bg-[rgba(215,255,79,0.08)] px-3",
                    )}
                    key={entry.name}
                  >
                    <span
                      className={cn(
                        "grid h-[23px] w-[23px] place-items-center text-[0.65rem] font-extrabold text-[var(--ink-faint)]",
                        entry.rank === 1 &&
                          "rounded-full bg-[rgba(215,255,79,0.15)] text-[var(--lime)]",
                      )}
                    >
                      {entry.rank === 1 ? <Medal size={15} /> : entry.rank}
                    </span>
                    <span className="flex min-w-0 flex-1 flex-col gap-1">
                      <strong className="overflow-hidden text-ellipsis whitespace-nowrap text-[0.7rem] text-[var(--ink)]">
                        {entry.name}
                      </strong>
                      <small className="text-[0.58rem] text-[var(--ink-faint)]">
                        {entry.manager}
                      </small>
                    </span>
                    <span
                      className={cn(
                        "text-[0.59rem] font-bold text-[var(--lime)]",
                        entry.movement.startsWith("-") && "text-[var(--red)]",
                      )}
                    >
                      {entry.movement}
                    </span>
                    <strong className="min-w-[27px] text-right text-[0.78rem] text-[var(--ink)]">
                      {entry.points}
                    </strong>
                  </div>
                ))}
              </div>
              <button
                className="mx-[26px] mb-[25px] mt-[18px] inline-flex w-[calc(100%-52px)] items-center justify-center gap-2 rounded-[7px] border border-[var(--line-strong)] bg-transparent p-[11px] text-[0.66rem] text-[var(--ink-muted)] hover:border-[rgba(215,255,79,0.5)] hover:text-[var(--lime)] max-[700px]:mx-[18px] max-[700px]:w-[calc(100%-36px)]"
                onClick={() => goTo("Leagues")}
                type="button"
              >
                View full table <ArrowUpRight size={16} />
              </button>
            </div>
          </section>

          <footer className="flex justify-between pt-[18px] text-[0.62rem] tracking-[0.03em] text-[var(--ink-faint)] max-[700px]:block max-[700px]:leading-loose">
            <span>Clubhouse / Season 01</span>
            <span>Make a move worth remembering.</span>
          </footer>
        </div>
      </section>
    </main>
  );
}
