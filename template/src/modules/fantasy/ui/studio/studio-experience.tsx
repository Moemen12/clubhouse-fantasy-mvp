"use client";

import { useEffect, useState } from "react";
import {
  Activity,
  AlertCircle,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Check,
  Crown,
  Expand,
  Focus,
  Search,
  Sparkles,
  Timer,
  X,
  Zap,
} from "lucide-react";

import { Button, Input } from "@/shared/frontend/ui";

import {
  ACTIVE_FORMATION,
  BUDGET_LIMIT,
  calculateTeamScore,
  getFormationMessage,
  getFormationSlotCount,
  getFormationStatus,
  getPlayer,
  getSquadCost,
  POSITION_ORDER,
} from "../../domain";
import type {
  FormationConfig,
  FormationStatus,
  Player,
  PlayerPosition,
  TeamState,
} from "../../domain";
import { fantasyPlayers } from "../demo-data";
import {
  BackAction,
  CaptainCard,
  Metric,
  PlayerAvatar,
  PlayerCard,
  StageIntro,
  StudioAction,
  StudioHeader,
  StudioHint,
  StudioStage,
  positionLabels,
} from "./studio-primitives";
import { useStudioSound } from "./studio-sound";

function getInitialSelectedIds(players: Player[], formation: FormationConfig) {
  const selectedIds = new Set<string>();
  return formation.rows.flatMap((row) =>
    row.flatMap((position) => {
      const player = players.find(
        (candidate) => candidate.position === position && !selectedIds.has(candidate.id),
      );
      if (!player) return [];
      selectedIds.add(player.id);
      return [player.id];
    }),
  );
}

const initialSelectedIds = getInitialSelectedIds(fantasyPlayers, ACTIVE_FORMATION);
const scoutingPool = fantasyPlayers;
const squadLimit = getFormationSlotCount(ACTIVE_FORMATION);

function getManagerInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function StageDots({ stage }: { stage: StudioStage }) {
  const activeIndex =
    stage === "entry" ? -1 : ["scout", "squad", "captain", "reveal"].indexOf(stage);
  return (
    <div className="flex items-center gap-2" aria-label="Studio progress">
      {[0, 1, 2, 3].map((index) => (
        <span
          className={`h-1.5 rounded-full transition-all duration-300 ${index <= activeIndex ? "w-8 bg-(--lime)" : "w-2 bg-(--line-strong)"}`}
          key={index}
        />
      ))}
    </div>
  );
}

function getPitchRows(selectedPlayers: Player[], formation: FormationConfig) {
  const playersByPosition: Record<PlayerPosition, Player[]> = {
    GK: [],
    DEF: [],
    MID: [],
    FWD: [],
  };
  selectedPlayers.forEach((player) => {
    playersByPosition[player.position].push(player);
  });

  const positionIndexes: Record<PlayerPosition, number> = { GK: 0, DEF: 0, MID: 0, FWD: 0 };
  return formation.rows.map((row, rowIndex) => ({
    key: `row-${rowIndex}`,
    slots: row.map((position, slotIndex) => {
      const player = playersByPosition[position][positionIndexes[position]];
      positionIndexes[position] += 1;
      return { key: `${rowIndex}-${slotIndex}-${position}`, player, position };
    }),
  }));
}

function StudioPitch({
  selectedPlayers,
  captainId,
  formation,
  onCaptain,
}: {
  selectedPlayers: Player[];
  captainId: string;
  formation: FormationConfig;
  onCaptain: (playerId: string) => void;
}) {
  const pitchRows = getPitchRows(selectedPlayers, formation);

  return (
    <div className="relative h-full min-h-[260px] overflow-hidden rounded-[30px] border border-white/35 bg-(--pitch-surface) shadow-[0_30px_90px_rgba(0,0,0,0.24)] md:min-h-[330px]">
      <div className="pointer-events-none absolute inset-[6%] rounded-[18px] border border-white/60" />
      <div className="pointer-events-none absolute bottom-[6%] left-1/2 top-[6%] border-l border-white/35" />
      <div className="pointer-events-none absolute left-[6%] right-[6%] top-1/2 border-t border-white/50" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/55 md:h-28 md:w-28" />
      <div className="pointer-events-none absolute left-[25%] right-[25%] top-[6%] h-[23%] rounded-b-xl border border-t-0 border-white/55" />
      <div className="pointer-events-none absolute left-[35%] right-[35%] top-[6%] h-[10%] rounded-b-md border border-t-0 border-white/45" />
      <div className="pointer-events-none absolute bottom-[6%] left-[25%] right-[25%] h-[23%] rounded-t-xl border border-b-0 border-white/55" />
      <div className="pointer-events-none absolute bottom-[6%] left-[35%] right-[35%] h-[10%] rounded-t-md border border-b-0 border-white/45" />
      <span className="absolute left-5 top-5 text-[0.62rem] font-extrabold uppercase tracking-[0.17em] text-white/75">
        Stadium / live read
      </span>
      <span className="absolute right-5 top-5 font-mono text-[0.62rem] font-bold text-white/75">
        {formation.label.toUpperCase()} / LIVE
      </span>
      <div className="relative z-1 flex h-full flex-col justify-around px-[7%] py-[8%]">
        {pitchRows.map((row) => (
          <div
            className="flex max-w-full flex-wrap justify-center gap-x-[clamp(10px,3vw,48px)] gap-y-3"
            key={row.key}
          >
            {row.slots.map((slot) => {
              const player = slot.player;
              return player ? (
                <button
                  className="group relative flex flex-col items-center gap-1.5 text-(--ink) transition-transform duration-200 hover:-translate-y-1"
                  aria-pressed={player.id === captainId}
                  key={player.id}
                  onClick={() => onCaptain(player.id)}
                  type="button"
                >
                  {player.id === captainId && (
                    <span className="absolute -right-2 -top-2 grid h-5 w-5 place-items-center rounded-full bg-(--lime) text-[0.55rem] font-black text-(--lime-ink)">
                      C
                    </span>
                  )}
                  <span
                    className={
                      player.id === captainId
                        ? "rounded-[28%] shadow-[0_0_0_4px_var(--accent-soft),var(--avatar-shadow)]"
                        : "rounded-[28%]"
                    }
                  >
                    <PlayerAvatar player={player} size="md" />
                  </span>
                  <span className="max-w-24 overflow-hidden text-ellipsis whitespace-nowrap text-[0.6rem] font-bold">
                    {player.name}
                  </span>
                  <span className="text-[0.5rem] font-extrabold uppercase tracking-[0.12em] text-(--lime)">
                    {player.position}
                  </span>
                </button>
              ) : (
                <span
                  className="grid h-20 w-16 place-items-center rounded-[22%] border border-dashed border-(--pitch-border) text-[0.5rem] font-bold uppercase tracking-[0.1em] text-(--pitch-label)"
                  key={slot.key}
                >
                  <span className="text-lg font-light">+</span>
                  {slot.position}
                </span>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

function EntryStage({ managerName, onEnter }: { managerName: string; onEnter: () => void }) {
  return (
    <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden px-6 py-6 md:px-12 md:py-8">
      <div className="pointer-events-none absolute inset-0 [background-image:linear-gradient(var(--line-subtle)_1px,transparent_1px),linear-gradient(90deg,var(--line-subtle)_1px,transparent_1px)] [background-size:72px_72px]" />
      <section className="relative z-10 flex min-h-0 w-full max-w-3xl flex-col items-center text-center">
        <div className="inline-flex items-center gap-3 rounded-xl border border-(--accent-border) bg-(--accent-soft) px-4 py-2.5 text-[0.68rem] font-extrabold uppercase tracking-[0.17em] text-(--lime)">
          <span className="h-2.5 w-2.5 rounded-[3px] bg-(--lime) motion-safe:animate-pulse motion-reduce:animate-none" />
          Gameweek 04 is open
        </div>
        <h1 className="mt-8 max-w-[10ch] text-[clamp(3.8rem,8vw,7.2rem)] font-bold leading-[0.9] tracking-[-0.05em] md:mt-10">
          Enter the room<span className="text-(--lime)">.</span>
        </h1>
        <p className="mt-5 max-w-lg text-[1rem] leading-[1.55] text-(--ink-muted) md:text-[1.1rem]">
          Your Gameweek 04 read is ready. Make the call.
        </p>
        <Button className="mt-8 min-w-56 rounded-xl" onClick={onEnter} size="lg">
          Open the studio <Expand size={18} />
        </Button>
        <div className="mt-7 flex flex-wrap items-center justify-center gap-5 text-[0.95rem] text-(--ink-muted)">
          <span className="inline-flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-(--manager-avatar-bg) text-[0.72rem] font-black text-(--manager-avatar-ink)">
              {getManagerInitials(managerName)}
            </span>
            <span>
              <span className="block text-[0.76rem] font-semibold text-(--ink-muted)">
                Welcome back,
              </span>
              <strong className="mt-0.5 block text-[1.15rem] font-black leading-none tracking-[-0.03em] text-(--ink)">
                {managerName}
              </strong>
            </span>
          </span>
          <StudioHint>
            <kbd className="rounded border border-(--line-strong) px-2 py-1 font-mono text-[0.68rem] font-bold">
              Esc
            </kbd>{" "}
            exits any live session
          </StudioHint>
        </div>
      </section>
    </div>
  );
}

const formationOrder = POSITION_ORDER;

function FormationCheck({ status }: { status: FormationStatus }) {
  return (
    <div className="flex shrink-0 flex-wrap items-center gap-x-4 gap-y-3 rounded-2xl border border-(--line) bg-(--surface-card) px-4 py-3 md:px-5">
      <div className="flex min-w-max items-center gap-3">
        <span
          className={
            status.isValid
              ? "grid h-8 w-8 place-items-center rounded-full bg-(--lime) text-(--lime-ink)"
              : "grid h-8 w-8 place-items-center rounded-full bg-(--danger-bg) text-(--orange)"
          }
        >
          {status.isValid ? <Check size={16} strokeWidth={3} /> : <AlertCircle size={16} />}
        </span>
        <div>
          <p className="text-[0.62rem] font-extrabold uppercase tracking-[0.16em] text-(--ink-faint)">
            Formation
          </p>
          <strong className="mt-0.5 block text-[0.92rem] tracking-[-0.02em]">
            {status.isValid ? "Shape is ready" : "Balance your squad"}
          </strong>
        </div>
      </div>
      <div className="flex min-w-0 flex-1 flex-wrap gap-2">
        {formationOrder.map((position) => {
          const count = status.counts[position];
          const required = status.required[position];
          const complete = count === required;
          return (
            <span
              className={`inline-flex min-h-9 items-center gap-2 rounded-full border px-3 text-[0.72rem] font-bold ${complete ? "border-(--accent-border) bg-(--accent-soft) text-(--ink)" : "border-(--orange-border) bg-(--danger-bg) text-(--orange)"}`}
              key={position}
            >
              <span className="text-[0.62rem] font-extrabold uppercase tracking-[0.1em] text-(--ink-faint)">
                {position}
              </span>
              <strong className="text-[0.86rem]">
                {count}/{required}
              </strong>
            </span>
          );
        })}
      </div>
      <p
        className={
          status.isValid
            ? "text-[0.7rem] font-extrabold uppercase tracking-[0.11em] text-(--lime)"
            : "max-w-full text-[0.72rem] font-semibold text-(--orange)"
        }
      >
        {status.isValid ? "Ready" : getFormationMessage(status)}
      </p>
    </div>
  );
}

function getScoutActionLabel(selectedCount: number, formationIsValid: boolean) {
  if (selectedCount < squadLimit) return `Choose ${squadLimit - selectedCount} more`;
  if (formationIsValid) return "Review your squad";
  return "Fix formation";
}

function ScoutStage({
  selectedIds,
  searchQuery,
  formationStatus,
  onSearchChange,
  onTogglePlayer,
  onReview,
}: {
  selectedIds: string[];
  searchQuery: string;
  formationStatus: FormationStatus;
  onSearchChange: (value: string) => void;
  onTogglePlayer: (playerId: string) => void;
  onReview: () => void;
}) {
  const normalizedQuery = searchQuery.trim().toLowerCase();
  const visiblePlayers = scoutingPool.filter((player) => {
    if (!normalizedQuery) return true;
    return [player.name, player.club, player.position, positionLabels[player.position]].some(
      (value) => value.toLowerCase().includes(normalizedQuery),
    );
  });

  return (
    <div className="flex min-h-0 flex-1 flex-col px-5 py-4 md:px-10 md:py-6">
      <div className="flex shrink-0 flex-col justify-between gap-5 md:flex-row md:items-end">
        <StageIntro
          detail="Tap a profile. It moves into your read."
          eyebrow="01 / scout the signal"
          title={`Find your ${squadLimit} picks.`}
        />
        <div className="flex items-center gap-4">
          <Metric label="Squad" value={`${selectedIds.length} / ${squadLimit}`} />
          <Metric
            label="Budget"
            tone="blue"
            value={`${BUDGET_LIMIT - getSquadCost({ selectedPlayerIds: selectedIds, captainId: null }, fantasyPlayers)} cr`}
          />
        </div>
      </div>
      <div className="mt-4 flex min-h-0 flex-1 flex-col overflow-hidden">
        <FormationCheck status={formationStatus} />
        <div className="relative mt-3 shrink-0 max-w-xl">
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-(--ink-faint)"
            size={17}
          />
          <Input
            aria-label="Search players"
            className="h-12 rounded-2xl pl-11 pr-11 text-[0.95rem]"
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search by player, club, or position"
            type="search"
            value={searchQuery}
          />
          {searchQuery && (
            <button
              aria-label="Clear player search"
              className="absolute right-3 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full text-(--ink-faint) transition-colors hover:bg-(--accent-soft) hover:text-(--ink)"
              onClick={() => onSearchChange("")}
              type="button"
            >
              <X size={15} />
            </button>
          )}
        </div>
        <div className="mt-3 min-h-0 flex-1 overflow-x-auto pb-2 [scrollbar-width:none]">
          <div className="flex h-full min-w-max items-center gap-3 pr-8 md:gap-4">
            {visiblePlayers.length > 0 ? (
              visiblePlayers.map((player) => (
                <PlayerCard
                  key={player.id}
                  onSelect={() => onTogglePlayer(player.id)}
                  player={player}
                  selected={selectedIds.includes(player.id)}
                />
              ))
            ) : (
              <div className="flex min-h-24 min-w-full items-center justify-center rounded-3xl border border-dashed border-(--line-strong) px-6 text-center text-[0.9rem] font-semibold text-(--ink-muted)">
                No players match “{searchQuery}”. Try a name, club, or position.
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-4 border-t border-(--line) pt-5">
        <StudioHint>
          <ArrowDown size={13} /> Your picks travel with you.
        </StudioHint>
        <StudioAction
          disabled={selectedIds.length !== squadLimit || !formationStatus.isValid}
          onClick={onReview}
        >
          {getScoutActionLabel(selectedIds.length, formationStatus.isValid)}
        </StudioAction>
      </div>
    </div>
  );
}

function SquadStage({
  selectedPlayers,
  captainId,
  onCaptain,
  onBack,
  onContinue,
}: {
  selectedPlayers: Player[];
  captainId: string;
  onCaptain: (playerId: string) => void;
  onBack: () => void;
  onContinue: () => void;
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col px-5 py-4 md:px-10 md:py-6">
      <div className="flex shrink-0 items-center justify-between gap-4">
        <BackAction label="Back to scouting" onClick={onBack} />
        <StudioHint>
          <Focus size={13} /> Tap any player to set captain later
        </StudioHint>
      </div>
      <div className="mt-3 flex min-h-0 flex-1 flex-col gap-3 md:grid md:grid-cols-[minmax(0,1fr)_280px]">
        <div className="min-h-0">
          <StudioPitch
            captainId={captainId}
            formation={ACTIVE_FORMATION}
            onCaptain={onCaptain}
            selectedPlayers={selectedPlayers}
          />
        </div>
        <aside className="flex min-h-0 max-h-44 flex-col rounded-[28px] border border-(--line) bg-(--deep-soft) p-4 md:max-h-none md:p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[0.57rem] font-extrabold uppercase tracking-[0.17em] text-(--ink-faint)">
                02 / squad assembly
              </p>
              <h2 className="mt-3 text-[1.45rem] font-semibold tracking-[-0.06em]">
                The shape is yours.
              </h2>
            </div>
            <Zap className="text-(--lime)" size={18} />
          </div>
          <div className="mt-3 min-h-0 flex-1 space-y-2 overflow-auto pr-1">
            {selectedPlayers.map((player) => (
              <button
                className={`flex w-full items-center gap-3 rounded-2xl border p-2.5 text-left transition-[border-color,background-color,box-shadow] ${player.id === captainId ? "border-(--lime) bg-(--accent-soft) shadow-[0_0_0_2px_var(--accent-soft)]" : "border-(--line) bg-transparent hover:border-(--accent-border) hover:bg-(--accent-soft)"}`}
                aria-pressed={player.id === captainId}
                key={player.id}
                onClick={() => onCaptain(player.id)}
                type="button"
              >
                <PlayerAvatar player={player} size="sm" />
                <span className="min-w-0 flex-1">
                  <strong className="block overflow-hidden text-ellipsis whitespace-nowrap text-[0.68rem]">
                    {player.name}
                  </strong>
                  <span className="mt-1 block text-[0.7rem] font-semibold text-(--blue)">
                    {positionLabels[player.position]} · {player.price} cr
                  </span>
                </span>
                <span
                  className={
                    player.id === captainId
                      ? "inline-flex items-center gap-1.5 rounded-full bg-(--lime) px-2 py-1 text-[0.62rem] font-black uppercase tracking-[0.08em] text-(--lime-ink)"
                      : "text-[0.62rem] font-semibold uppercase tracking-[0.08em] text-(--ink-faint)"
                  }
                >
                  {player.id === captainId && <Crown size={12} />}
                  {player.id === captainId ? "Captain" : "Ready"}
                </span>
              </button>
            ))}
          </div>
          <div className="mt-3 border-t border-(--line) pt-4">
            <div className="flex items-end justify-between gap-3 text-[0.9rem] text-(--ink-muted)">
              <span className="font-bold">Total value</span>
              <strong className="text-[1.35rem] font-black leading-none tracking-[-0.04em] text-(--blue)">
                {getSquadCost(
                  { selectedPlayerIds: selectedPlayers.map((player) => player.id), captainId },
                  fantasyPlayers,
                )}{" "}
                / {BUDGET_LIMIT} cr
              </strong>
            </div>
            <StudioAction onClick={onContinue}>Choose captain</StudioAction>
          </div>
        </aside>
      </div>
    </div>
  );
}

function CaptainStage({
  selectedPlayers,
  captainId,
  onCaptain,
  onBack,
  onLock,
}: {
  selectedPlayers: Player[];
  captainId: string;
  onCaptain: (playerId: string) => void;
  onBack: () => void;
  onLock: () => void;
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col items-center px-5 py-4 md:px-10 md:py-6">
      <div className="flex w-full shrink-0 flex-wrap items-center justify-between gap-3">
        <BackAction label="Back to squad" onClick={onBack} />
        <StudioHint>
          <Crown size={13} /> One conviction gets 2×
        </StudioHint>
      </div>
      <div className="flex min-h-0 w-full max-w-5xl flex-1 flex-col items-center justify-center">
        <StageIntro
          detail="The armband changes the outcome. Make it count."
          eyebrow="03 / choose the multiplier"
          title="Who gets the moment?"
        />
        <div className="mt-5 grid w-full max-w-4xl grid-cols-2 gap-3 overflow-visible p-2 sm:grid-cols-3 md:grid-cols-[repeat(auto-fit,minmax(9rem,1fr))]">
          {selectedPlayers.map((player) => (
            <CaptainCard
              active={player.id === captainId}
              key={player.id}
              onSelect={() => onCaptain(player.id)}
              player={player}
            />
          ))}
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
          <StudioHint>
            {captainId
              ? `${getPlayer(captainId, fantasyPlayers)?.name} is wearing the armband.`
              : "Choose one player."}
          </StudioHint>
          <StudioAction disabled={!captainId} onClick={onLock}>
            Lock my decision
          </StudioAction>
        </div>
      </div>
    </div>
  );
}

function RevealStage({
  team,
  onExit,
  onAgain,
}: {
  team: TeamState;
  onExit: () => void;
  onAgain: () => void;
}) {
  const score = calculateTeamScore(team, fantasyPlayers);
  return (
    <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden px-5 py-4 md:px-10 md:py-6">
      <div className="pointer-events-none absolute inset-x-5 top-1/2 border-t border-(--line-subtle)" />
      <section className="relative z-10 flex min-h-0 w-full max-w-4xl flex-col items-center border-y border-(--line) bg-(--deep-soft) px-4 py-5 md:px-8 md:py-7">
        <div className="flex items-center gap-2 text-[0.62rem] font-extrabold uppercase tracking-[0.18em] text-(--lime)">
          <Sparkles size={14} /> Read received
        </div>
        <div className="mt-4 flex items-end gap-4">
          <span className="text-[clamp(5.5rem,13vw,10rem)] font-semibold leading-[0.72] tracking-[-0.14em] text-(--lime)">
            {score.totalPoints}
          </span>
          <span className="mb-2 max-w-20 text-[0.62rem] font-extrabold uppercase leading-[1.35] tracking-[0.14em] text-(--ink-faint)">
            projected points
          </span>
        </div>
        <div className="mt-5 grid w-full min-w-0 grid-cols-3 gap-2 md:gap-3">
          <Metric
            label="Captain"
            tone="orange"
            value={getPlayer(team.captainId ?? "", fantasyPlayers)?.name ?? "—"}
          />
          <Metric
            label="Squad value"
            tone="blue"
            value={`${getSquadCost(team, fantasyPlayers)} cr`}
          />
          <Metric label="Multiplier" value="2× applied" />
        </div>
        <div className="mt-4 grid w-full min-w-0 grid-cols-[repeat(auto-fit,minmax(8.5rem,1fr))] gap-2 md:mt-5">
          {score.playerScores.map((playerScore) => {
            const player = getPlayer(playerScore.playerId, fantasyPlayers);
            return player ? (
              <div
                className="flex min-w-0 items-center gap-2 overflow-hidden rounded-xl border border-(--line) bg-(--deep) px-2.5 py-2.5 md:px-3"
                key={player.id}
              >
                <PlayerAvatar player={player} size="sm" />
                <span className="min-w-0 flex-1 truncate text-[0.62rem] font-bold">
                  {player.name}
                </span>
                <span className="text-[0.66rem] font-black text-(--lime)">
                  {playerScore.finalPoints}
                </span>
              </div>
            ) : null;
          })}
        </div>
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          <Button className="rounded-xl" onClick={onAgain} variant="outline">
            <ArrowLeft size={15} /> Another read
          </Button>
          <Button className="rounded-xl" onClick={onExit}>
            Exit studio <ArrowRight size={16} />
          </Button>
        </div>
      </section>
    </div>
  );
}

type StudioExperienceProps = Readonly<{ managerName?: string }>;

export function StudioExperience({ managerName = "Marcus Khan" }: StudioExperienceProps) {
  const studioSound = useStudioSound();
  const [stage, setStage] = useState<StudioStage>("entry");
  const [selectedIds, setSelectedIds] = useState(initialSelectedIds);
  const [captainId, setCaptainId] = useState("p-008");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && stage !== "entry") setStage("entry");
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [stage]);

  const selectedPlayers = selectedIds.flatMap((playerId) => {
    const player = fantasyPlayers.find((candidate) => candidate.id === playerId);
    return player ? [player] : [];
  });
  const formationStatus = getFormationStatus(
    { selectedPlayerIds: selectedIds, captainId: null },
    fantasyPlayers,
  );
  const team: TeamState = { selectedPlayerIds: selectedIds, captainId };

  function togglePlayer(playerId: string) {
    const isSelected = selectedIds.includes(playerId);
    if (!isSelected && selectedIds.length >= squadLimit) return;

    const nextCount = isSelected ? selectedIds.length - 1 : selectedIds.length + 1;
    if (isSelected) {
      studioSound.play("deselect");
    } else if (nextCount === squadLimit) {
      studioSound.play("complete");
    } else {
      studioSound.play("select");
    }
    setSelectedIds((current) => {
      if (current.includes(playerId)) {
        const next = current.filter((id) => id !== playerId);
        if (playerId === captainId) setCaptainId(next[0] ?? "");
        return next;
      }
      if (current.length >= squadLimit) return current;
      return [...current, playerId];
    });
  }

  function enterStudio() {
    studioSound.play("enter");
    setStage("scout");
  }

  function exitStudio() {
    studioSound.play("back");
    setStage("entry");
  }

  function goBackToScout() {
    studioSound.play("back");
    setStage("scout");
  }

  function goBackToSquad() {
    studioSound.play("back");
    setStage("squad");
  }

  function chooseCaptain(playerId: string) {
    studioSound.play("select");
    setCaptainId(playerId);
  }

  function reviewSquad() {
    studioSound.play("advance");
    setStage("squad");
  }

  function prepareCaptain() {
    studioSound.play("advance");
    setStage("captain");
  }

  function lockDecision() {
    studioSound.play("lock");
    setStage("reveal");
  }

  function restartRead() {
    studioSound.play("back");
    setSelectedIds([]);
    setCaptainId("");
    setStage("scout");
  }

  return (
    <main className="flex h-dvh min-h-0 flex-col overflow-hidden bg-[radial-gradient(circle_at_78%_0%,var(--glow-lime),transparent_24rem),radial-gradient(circle_at_12%_80%,var(--glow-blue),transparent_25rem),var(--deep)] text-(--ink)">
      <StudioHeader
        onExit={exitStudio}
        onToggleSound={studioSound.toggle}
        soundEnabled={studioSound.enabled}
        stage={stage}
      />
      {stage !== "entry" && (
        <div className="flex shrink-0 justify-center border-b border-(--line) px-5 py-2 md:hidden">
          <StageDots stage={stage} />
        </div>
      )}
      {stage === "entry" && <EntryStage managerName={managerName} onEnter={enterStudio} />}
      {stage === "scout" && (
        <div className="flex min-h-0 flex-1 flex-col motion-safe:animate-[studio-in_320ms_cubic-bezier(0.23,1,0.32,1)]">
          <div className="hidden justify-center pt-5 md:flex">
            <StageDots stage={stage} />
          </div>
          <ScoutStage
            formationStatus={formationStatus}
            onReview={reviewSquad}
            onSearchChange={setSearchQuery}
            onTogglePlayer={togglePlayer}
            searchQuery={searchQuery}
            selectedIds={selectedIds}
          />
        </div>
      )}
      {stage === "squad" && (
        <div className="flex min-h-0 flex-1 flex-col motion-safe:animate-[studio-in_320ms_cubic-bezier(0.23,1,0.32,1)]">
          <div className="hidden justify-center pt-5 md:flex">
            <StageDots stage={stage} />
          </div>
          <SquadStage
            captainId={captainId}
            onBack={goBackToScout}
            onCaptain={chooseCaptain}
            onContinue={prepareCaptain}
            selectedPlayers={selectedPlayers}
          />
        </div>
      )}
      {stage === "captain" && (
        <div className="flex min-h-0 flex-1 flex-col motion-safe:animate-[studio-in_320ms_cubic-bezier(0.23,1,0.32,1)]">
          <div className="hidden justify-center pt-5 md:flex">
            <StageDots stage={stage} />
          </div>
          <CaptainStage
            captainId={captainId}
            onBack={goBackToSquad}
            onCaptain={chooseCaptain}
            onLock={lockDecision}
            selectedPlayers={selectedPlayers}
          />
        </div>
      )}
      {stage === "reveal" && (
        <div className="flex min-h-0 flex-1 flex-col motion-safe:animate-[studio-in_420ms_cubic-bezier(0.23,1,0.32,1)]">
          <div className="hidden justify-center pt-5 md:flex">
            <StageDots stage={stage} />
          </div>
          <RevealStage onAgain={restartRead} onExit={exitStudio} team={team} />
        </div>
      )}
      <div className="pointer-events-none fixed bottom-4 left-5 hidden items-center gap-2 text-[0.56rem] font-mono text-(--ink-faint) md:flex">
        <Timer size={12} /> WINDOW 02:14:36 <span className="mx-1 text-(--line-strong)">/</span>{" "}
        <Activity size={12} /> SIGNAL LIVE
      </div>
    </main>
  );
}
