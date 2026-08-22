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
  Sparkles,
  Timer,
  Zap,
} from "lucide-react";

import { Button } from "@/shared/frontend/ui";

import {
  BUDGET_LIMIT,
  calculateTeamScore,
  getFormationMessage,
  getFormationStatus,
  getPlayer,
  getSquadCost,
  REQUIRED_FORMATION,
  SQUAD_LIMIT,
} from "../../domain";
import type { FormationStatus, Player, PlayerPosition, TeamState } from "../../domain";
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

const initialSelectedIds = ["p-001", "p-002", "p-003", "p-005", "p-008"];
const scoutingPool = fantasyPlayers.filter((player) =>
  [
    "p-001",
    "p-002",
    "p-003",
    "p-004",
    "p-005",
    "p-006",
    "p-007",
    "p-008",
    "p-009",
    "p-010",
  ].includes(player.id),
);
const formationRows: PlayerPosition[][] = [["FWD"], ["MID"], ["DEF", "DEF"], ["GK"]];

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

function StudioPitch({
  selectedPlayers,
  captainId,
  onCaptain,
}: {
  selectedPlayers: Player[];
  captainId: string;
  onCaptain: (playerId: string) => void;
}) {
  function findPositionPlayer(position: PlayerPosition, index: number) {
    return selectedPlayers.filter((player) => player.position === position)[index];
  }

  return (
    <div className="relative h-full min-h-[260px] md:min-h-[330px] overflow-hidden rounded-[30px] border border-(--pitch-border) bg-[linear-gradient(115deg,rgba(58,92,53,0.76),rgba(31,64,49,0.94))] shadow-[0_30px_90px_rgba(0,0,0,0.24)]">
      <div className="pointer-events-none absolute inset-0 opacity-80 [background-image:linear-gradient(90deg,transparent_49.7%,var(--pitch-line)_50%,transparent_50.3%),linear-gradient(0deg,transparent_49.7%,var(--pitch-line)_50%,transparent_50.3%)]" />
      <div className="pointer-events-none absolute inset-[8%] rounded-[20px] border border-(--pitch-line)" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-28 w-28 -translate-x-1/2 -translate-y-1/2 rounded-full border border-(--pitch-line)" />
      <div className="pointer-events-none absolute left-[11%] right-[11%] top-0 h-[18%] rounded-b-[50%] border border-b-0 border-(--pitch-line)" />
      <div className="pointer-events-none absolute bottom-0 left-[11%] right-[11%] h-[18%] rounded-t-[50%] border border-b-0 border-(--pitch-line)" />
      <span className="absolute left-5 top-5 text-[0.55rem] font-extrabold uppercase tracking-[0.17em] text-(--pitch-label)">
        Your decision surface
      </span>
      <span className="absolute right-5 top-5 font-mono text-[0.55rem] text-(--pitch-label)">
        5—2—1—1 / LIVE
      </span>
      <div className="relative z-1 flex h-full flex-col justify-around px-[7%] py-[8%]">
        {formationRows.map((row) => (
          <div className="flex justify-center gap-[clamp(22px,9vw,104px)]" key={row.join("-")}>
            {row.map((position, index) => {
              const player = findPositionPlayer(position, index);
              return player ? (
                <button
                  className="group relative flex flex-col items-center gap-1.5 text-(--ink) transition-transform duration-200 hover:-translate-y-1"
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
                  key={`${position}-${index}`}
                >
                  <span className="text-lg font-light">+</span>
                  {position}
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
    <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden px-6 py-8 md:px-12">
      <div className="pointer-events-none absolute inset-0 [background-image:linear-gradient(var(--line-subtle)_1px,transparent_1px),linear-gradient(90deg,var(--line-subtle)_1px,transparent_1px)] [background-size:64px_64px]" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[min(72vw,680px)] w-[min(72vw,680px)] -translate-x-1/2 -translate-y-1/2 rounded-full border border-(--accent-border) opacity-50 shadow-[0_0_160px_var(--glow-lime)]" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[min(48vw,460px)] w-[min(48vw,460px)] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-(--line-strong) opacity-70" />
      <div className="relative z-1 flex max-w-3xl flex-col items-center text-center">
        <div className="mb-7 flex items-center gap-3 rounded-full border border-(--accent-border) bg-(--accent-soft) px-4 py-2 text-[0.58rem] font-extrabold uppercase tracking-[0.17em] text-(--lime)">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-(--lime) motion-reduce:animate-none" />{" "}
          Gameweek 04 is open
        </div>
        <span className="text-[clamp(5rem,14vw,11rem)] font-semibold leading-[0.72] tracking-[-0.13em] text-(--ink)">
          01
        </span>
        <h1 className="mt-8 max-w-[9ch] text-[clamp(3.2rem,8vw,7.7rem)] font-semibold leading-[0.82] tracking-[-0.11em]">
          Enter the room.
        </h1>
        <div className="mt-7 flex items-center gap-3 text-[0.68rem] text-(--ink-muted)">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-(--manager-avatar-bg) text-[0.58rem] font-black text-(--manager-avatar-ink)">
            {getManagerInitials(managerName)}
          </span>
          Welcome back, {managerName}. Your read is waiting.
        </div>
        <Button className="mt-9 min-w-52 rounded-full" onClick={onEnter} size="lg">
          Open the studio <Expand size={17} />
        </Button>
        <StudioHint>
          <kbd className="rounded border border-(--line-strong) px-1.5 py-0.5 font-mono text-[0.52rem]">
            Esc
          </kbd>{" "}
          exits any live session
        </StudioHint>
      </div>
    </div>
  );
}

const formationOrder: PlayerPosition[] = ["GK", "DEF", "MID", "FWD"];

function FormationCheck({ status }: { status: FormationStatus }) {
  return (
    <div className="shrink-0 rounded-3xl border border-(--line) bg-(--deep-soft) px-4 py-3 md:px-5">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span
            className={
              status.isValid
                ? "grid h-8 w-8 place-items-center rounded-full bg-(--lime) text-(--lime-ink)"
                : "grid h-8 w-8 place-items-center rounded-full bg-(--orange-border) text-(--orange)"
            }
          >
            {status.isValid ? <Check size={16} /> : <AlertCircle size={16} />}
          </span>
          <div>
            <p className="text-[0.62rem] font-extrabold uppercase tracking-[0.16em] text-(--ink-faint)">
              Formation check
            </p>
            <strong className="mt-1 block text-[0.9rem] tracking-[-0.03em]">
              {status.isValid ? "Shape is ready." : "Build a legal shape."}
            </strong>
          </div>
        </div>
        <span
          className={
            status.isValid
              ? "text-[0.72rem] font-black uppercase tracking-[0.12em] text-(--lime)"
              : "text-[0.72rem] font-black uppercase tracking-[0.12em] text-(--orange)"
          }
        >
          {status.isValid ? "Ready" : "Adjust"}
        </span>
      </div>
      <div className="mt-3 grid grid-cols-4 gap-2">
        {formationOrder.map((position) => {
          const count = status.counts[position];
          const required = REQUIRED_FORMATION[position];
          const complete = count === required;
          return (
            <div
              className={`rounded-2xl border px-2 py-2 text-center ${complete ? "border-(--accent-border) bg-(--accent-soft)" : "border-(--orange-border) bg-(--danger-bg)"}`}
              key={position}
            >
              <span className="block text-[0.58rem] font-extrabold uppercase tracking-[0.1em] text-(--ink-faint)">
                {position}
              </span>
              <strong
                className={`mt-1 block text-[0.94rem] ${complete ? "text-(--lime)" : "text-(--orange)"}`}
              >
                {count}/{required}
              </strong>
            </div>
          );
        })}
      </div>
      <p
        className={
          status.isValid
            ? "mt-3 text-[0.72rem] text-(--lime)"
            : "mt-3 text-[0.72rem] text-(--orange)"
        }
      >
        {getFormationMessage(status)}
      </p>
    </div>
  );
}

function getScoutActionLabel(selectedCount: number, formationIsValid: boolean) {
  if (selectedCount < SQUAD_LIMIT) return `Choose ${SQUAD_LIMIT - selectedCount} more`;
  if (formationIsValid) return "Review your squad";
  return "Fix formation";
}

function ScoutStage({
  selectedIds,
  formationStatus,
  onTogglePlayer,
  onReview,
}: {
  selectedIds: string[];
  formationStatus: FormationStatus;
  onTogglePlayer: (playerId: string) => void;
  onReview: () => void;
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col px-5 py-4 md:px-10 md:py-6">
      <div className="flex shrink-0 flex-col justify-between gap-5 md:flex-row md:items-end">
        <StageIntro
          detail="Tap a profile. It moves into your read."
          eyebrow="01 / scout the signal"
          title="Find your five."
        />
        <div className="flex items-center gap-4">
          <Metric label="Squad" value={`${selectedIds.length} / ${SQUAD_LIMIT}`} />
          <Metric
            label="Budget"
            tone="blue"
            value={`${BUDGET_LIMIT - getSquadCost({ selectedPlayerIds: selectedIds, captainId: null }, fantasyPlayers)} cr`}
          />
        </div>
      </div>
      <div className="mt-4 flex min-h-0 flex-1 flex-col overflow-hidden">
        <FormationCheck status={formationStatus} />
        <div className="mt-3 min-h-0 flex-1 overflow-x-auto pb-2 [scrollbar-width:none]">
          <div className="flex h-full min-w-max items-center gap-3 pr-8 md:gap-4">
            {scoutingPool.map((player) => (
              <PlayerCard
                key={player.id}
                onSelect={() => onTogglePlayer(player.id)}
                player={player}
                selected={selectedIds.includes(player.id)}
              />
            ))}
          </div>
        </div>
      </div>
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-4 border-t border-(--line) pt-5">
        <StudioHint>
          <ArrowDown size={13} /> Your picks travel with you.
        </StudioHint>
        <StudioAction
          disabled={selectedIds.length !== SQUAD_LIMIT || !formationStatus.isValid}
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
                className="flex w-full items-center gap-2.5 rounded-2xl border border-(--line) bg-transparent p-2 text-left transition-colors hover:border-(--accent-border) hover:bg-(--accent-soft)"
                key={player.id}
                onClick={() => onCaptain(player.id)}
                type="button"
              >
                <PlayerAvatar player={player} size="sm" />
                <span className="min-w-0 flex-1">
                  <strong className="block overflow-hidden text-ellipsis whitespace-nowrap text-[0.68rem]">
                    {player.name}
                  </strong>
                  <span className="mt-1 block text-[0.55rem] uppercase tracking-[0.1em] text-(--ink-faint)">
                    {positionLabels[player.position]} · {player.price} cr
                  </span>
                </span>
                <span
                  className={
                    player.id === captainId
                      ? "text-[0.55rem] font-black text-(--lime)"
                      : "text-[0.55rem] text-(--ink-faint)"
                  }
                >
                  {player.id === captainId ? "CAPTAIN" : "READY"}
                </span>
              </button>
            ))}
          </div>
          <div className="mt-3 border-t border-(--line) pt-3">
            <div className="flex items-center justify-between text-[0.6rem] text-(--ink-faint)">
              <span>Total value</span>
              <strong className="text-(--ink)">
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
        <div className="mt-5 grid w-full max-w-4xl grid-cols-2 gap-2 overflow-y-auto p-1 sm:grid-cols-3 md:grid-cols-5">
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
    <div className="relative flex min-h-0 flex-1 flex-col items-center overflow-hidden px-5 py-4 md:px-10 md:py-6">
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[min(70vw,700px)] w-[min(70vw,700px)] -translate-x-1/2 -translate-y-1/2 rounded-full border border-(--accent-border) shadow-[0_0_180px_var(--glow-lime)]" />
      <div className="relative z-1 flex min-h-0 w-full max-w-5xl flex-1 flex-col items-center justify-center">
        <div className="flex items-center gap-2 text-[0.6rem] font-extrabold uppercase tracking-[0.18em] text-(--lime)">
          <Sparkles size={14} /> Decision locked / read received
        </div>
        <span className="mt-6 text-[clamp(5rem,15vw,12rem)] font-semibold leading-[0.7] tracking-[-0.14em] text-(--lime)">
          {score.totalPoints}
        </span>
        <span className="mt-5 text-[0.62rem] font-extrabold uppercase tracking-[0.2em] text-(--ink-faint)">
          projected points
        </span>
        <div className="mt-6 grid w-full max-w-3xl grid-cols-3 gap-2">
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
        <div className="mt-5 flex max-h-28 w-full max-w-3xl flex-wrap justify-center gap-2 overflow-hidden">
          {score.playerScores.map((playerScore) => {
            const player = getPlayer(playerScore.playerId, fantasyPlayers);
            return player ? (
              <div
                className="flex items-center gap-2 rounded-full border border-(--line) bg-(--deep-soft) px-3 py-2"
                key={player.id}
              >
                <PlayerAvatar player={player} size="sm" />
                <span className="text-[0.6rem] font-bold">{player.name}</span>
                <span className="text-[0.6rem] font-black text-(--lime)">
                  {playerScore.finalPoints}
                </span>
              </div>
            ) : null;
          })}
        </div>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button className="rounded-full" onClick={onAgain} variant="outline">
            <ArrowLeft size={15} /> Make another read
          </Button>
          <Button className="rounded-full" onClick={onExit}>
            Exit studio <ArrowRight size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
}

type StudioExperienceProps = Readonly<{ managerName?: string }>;

export function StudioExperience({ managerName = "Marcus Khan" }: StudioExperienceProps) {
  const studioSound = useStudioSound();
  const [stage, setStage] = useState<StudioStage>("entry");
  const [selectedIds, setSelectedIds] = useState(initialSelectedIds);
  const [captainId, setCaptainId] = useState("p-008");

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
    const nextCount = isSelected ? selectedIds.length - 1 : selectedIds.length + 1;
    if (isSelected) {
      studioSound.play("deselect");
    } else if (nextCount === SQUAD_LIMIT) {
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
      if (current.length >= SQUAD_LIMIT) return current;
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
    studioSound.play("captain");
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
            onTogglePlayer={togglePlayer}
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
