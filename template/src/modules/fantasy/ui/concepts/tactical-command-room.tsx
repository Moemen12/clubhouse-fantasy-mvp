"use client";

import { useState } from "react";
import { Activity, ArrowRight, Crosshair, Radar, RotateCw, Target } from "lucide-react";

import { Button } from "@/shared/frontend/ui";

import { BUDGET_LIMIT, calculateTeamScore, getSquadCost } from "../../domain";
import type { PlayerPosition, TeamState } from "../../domain";
import { fantasyPlayers } from "../demo-data";
import {
  ConceptHeader,
  EmptyPitchSlot,
  HelpButton,
  PitchPlayer,
  PlayerPill,
  PrototypeFooter,
  StatChip,
} from "./concept-primitives";

const initialSelectedIds = ["p-001", "p-002", "p-003", "p-005", "p-008"];
const formationRows: PlayerPosition[][] = [["FWD"], ["MID"], ["DEF", "DEF"], ["GK"]];
const commandPlayers = fantasyPlayers.filter((player) =>
  ["p-001", "p-002", "p-003", "p-005", "p-008", "p-009"].includes(player.id),
);

export function TacticalCommandRoom() {
  const [selectedIds, setSelectedIds] = useState(initialSelectedIds);
  const [captainId, setCaptainId] = useState("p-008");
  const [locked, setLocked] = useState(false);

  const selectedPlayers = selectedIds.flatMap((id) => {
    const player = fantasyPlayers.find((candidate) => candidate.id === id);
    return player ? [player] : [];
  });
  const team: TeamState = { selectedPlayerIds: selectedIds, captainId };
  const score = calculateTeamScore(team, fantasyPlayers);
  const cost = getSquadCost(team, fantasyPlayers);
  const remaining = BUDGET_LIMIT - cost;

  function togglePlayer(playerId: string) {
    setLocked(false);
    setSelectedIds((current) => {
      if (current.includes(playerId)) {
        const next = current.filter((id) => id !== playerId);
        if (playerId === captainId) setCaptainId(next[0] ?? "");
        return next;
      }
      if (current.length >= 5) return current;
      return [...current, playerId];
    });
  }

  function selectCaptain(playerId: string) {
    if (selectedIds.includes(playerId)) {
      setCaptainId(playerId);
      setLocked(false);
    }
  }

  function findPositionPlayer(position: PlayerPosition, index: number) {
    return selectedPlayers.filter((player) => player.position === position)[index];
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_18%_12%,rgba(215,255,79,0.1),transparent_23rem),radial-gradient(circle_at_82%_45%,rgba(85,140,255,0.1),transparent_28rem),var(--deep)] text-(--ink)">
      <ConceptHeader
        active="tactical"
        detail="Decision window open"
        eyebrow="Clubhouse / concept 01"
        title="Tactical command room"
      >
        <HelpButton />
      </ConceptHeader>

      <div className="mx-auto max-w-[1500px] px-6 pb-4 pt-10 md:px-10 md:pt-16">
        <section className="mb-10 flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
          <div className="max-w-2xl">
            <p className="flex items-center gap-2 text-[0.62rem] font-extrabold uppercase tracking-[0.18em] text-(--lime)">
              <span className="h-px w-8 bg-(--lime)" /> Gameweek 04 / strategic window
            </p>
            <h1 className="mt-5 max-w-[10ch] text-[clamp(3.5rem,8vw,8.5rem)] font-bold leading-[0.82] tracking-[-0.1em]">
              Read the room.
            </h1>
            <p className="mt-6 max-w-xl text-[0.95rem] leading-[1.7] text-(--ink-muted)">
              Five choices. One captain. The board is live and the next move belongs to you.
            </p>
          </div>
          <div className="flex items-center gap-2 text-[0.65rem] text-(--ink-faint)">
            <span className="h-2 w-2 animate-pulse rounded-full bg-(--lime) motion-reduce:animate-none" />
            Syncing match intelligence
            <span className="ml-2 font-mono text-(--ink)">00:42:18</span>
          </div>
        </section>

        <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_330px]">
          <div className="relative overflow-hidden rounded-[28px] border border-(--line) bg-(--deep-soft) shadow-[var(--card-shadow)]">
            <div className="pointer-events-none absolute inset-0 opacity-40 [background-image:linear-gradient(var(--line-subtle)_1px,transparent_1px),linear-gradient(90deg,var(--line-subtle)_1px,transparent_1px)] [background-size:48px_48px]" />
            <div className="relative flex items-center justify-between border-b border-(--line) px-5 py-4 md:px-7">
              <div className="flex items-center gap-3">
                <div className="grid h-9 w-9 place-items-center rounded-xl bg-(--accent-soft) text-(--lime)">
                  <Radar size={18} />
                </div>
                <div>
                  <span className="block text-[0.57rem] font-extrabold uppercase tracking-[0.16em] text-(--ink-faint)">
                    Live board
                  </span>
                  <strong className="mt-1 block text-[0.78rem]">Clubhouse XI / 5—2—1—1</strong>
                </div>
              </div>
              <span className="rounded-full border border-(--accent-border) px-3 py-1.5 text-[0.58rem] font-bold uppercase tracking-[0.12em] text-(--lime)">
                Signal strong
              </span>
            </div>

            <div className="relative flex min-h-[610px] items-center justify-center overflow-hidden px-5 py-10 md:px-14">
              <div className="absolute left-6 top-8 flex flex-col gap-5 text-[0.56rem] font-extrabold uppercase tracking-[0.16em] text-(--ink-faint) [writing-mode:vertical-rl]">
                <span>Attack vector</span>
                <span className="text-(--lime)">Northstar read</span>
              </div>
              <div className="absolute right-6 top-8 flex flex-col items-end gap-3 text-[0.58rem] font-mono text-(--ink-faint)">
                <span>LAT 03.1412</span>
                <span>FORM 08.7</span>
                <span className="text-(--lime)">LOCK {locked ? "ON" : "OFF"}</span>
              </div>

              <div className="relative w-full max-w-[680px] aspect-[1.08] overflow-hidden rounded-[24px] border border-(--pitch-border) bg-[linear-gradient(105deg,rgba(60,92,51,0.7),rgba(31,62,49,0.9))] shadow-[0_20px_80px_rgba(0,0,0,0.24)]">
                <div className="pointer-events-none absolute inset-0 opacity-80 [background-image:linear-gradient(90deg,transparent_49.7%,var(--pitch-line)_50%,transparent_50.3%),linear-gradient(0deg,transparent_49.7%,var(--pitch-line)_50%,transparent_50.3%)]" />
                <div className="pointer-events-none absolute inset-[8%] rounded-[18px] border border-(--pitch-line)" />
                <div className="pointer-events-none absolute left-1/2 top-1/2 h-28 w-28 -translate-x-1/2 -translate-y-1/2 rounded-full border border-(--pitch-line)" />
                <div className="pointer-events-none absolute left-[12%] right-[12%] top-0 h-[17%] rounded-b-[50%] border border-b-0 border-(--pitch-line)" />
                <div className="pointer-events-none absolute bottom-0 left-[12%] right-[12%] h-[17%] rounded-t-[50%] border border-b-0 border-(--pitch-line)" />
                <span className="absolute left-5 top-5 text-[0.55rem] font-extrabold uppercase tracking-[0.16em] text-(--pitch-label)">
                  Decision surface
                </span>
                <div className="relative z-1 flex h-full flex-col justify-around px-[7%] py-[8%]">
                  {formationRows.map((row) => (
                    <div
                      className="flex justify-center gap-[clamp(22px,9vw,100px)]"
                      key={row.join("-")}
                    >
                      {row.map((position, slotIndex) => {
                        const player = findPositionPlayer(position, slotIndex);
                        return player ? (
                          <PitchPlayer
                            captain={player.id === captainId}
                            key={player.id}
                            onClick={() => selectCaptain(player.id)}
                            player={player}
                          />
                        ) : (
                          <EmptyPitchSlot key={`${position}-${slotIndex}`} label={position} />
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="relative grid gap-3 border-t border-(--line) p-5 md:grid-cols-3 md:px-7">
              <StatChip
                label="Available budget"
                tone={remaining < 0 ? "orange" : "lime"}
                value={`${remaining} cr`}
              />
              <StatChip label="Captain multiplier" tone="blue" value="2× active" />
              <StatChip label="Projected score" tone="lime" value={`${score.totalPoints} pts`} />
            </div>
          </div>

          <aside className="flex flex-col gap-4">
            <div className="rounded-[28px] border border-(--line) bg-(--deep-soft) p-5 shadow-[var(--card-shadow)] md:p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[0.58rem] font-extrabold uppercase tracking-[0.17em] text-(--ink-faint)">
                    01 / select signal
                  </p>
                  <h2 className="mt-3 text-[1.4rem] font-semibold tracking-[-0.06em]">
                    Who moves the line?
                  </h2>
                </div>
                <Crosshair className="text-(--lime)" size={20} />
              </div>
              <div className="mt-6 flex flex-col gap-2">
                {commandPlayers.map((player) => (
                  <PlayerPill
                    active={selectedIds.includes(player.id)}
                    key={player.id}
                    onClick={() => togglePlayer(player.id)}
                    player={player}
                  />
                ))}
              </div>
              <p className="mt-5 text-[0.65rem] leading-[1.5] text-(--ink-faint)">
                Select up to five. Tap a player on the board to give them the armband.
              </p>
            </div>

            <div className="flex flex-1 flex-col justify-between rounded-[28px] border border-(--accent-border) bg-[radial-gradient(circle_at_80%_0%,var(--glow-lime),transparent_14rem),var(--deep-soft)] p-5 md:p-6">
              <div>
                <div className="flex items-center gap-2 text-[0.58rem] font-extrabold uppercase tracking-[0.17em] text-(--lime)">
                  <Activity size={14} /> Captain read
                </div>
                <h2 className="mt-4 max-w-[11ch] text-[2.2rem] font-semibold leading-[0.9] tracking-[-0.08em]">
                  {captainId
                    ? fantasyPlayers.find((player) => player.id === captainId)?.name
                    : "Choose your signal"}
                </h2>
                <p className="mt-4 text-[0.7rem] leading-[1.6] text-(--ink-muted)">
                  The armband doubles the score of your strongest conviction.
                </p>
              </div>
              <Button className="mt-10 w-full" onClick={() => setLocked((current) => !current)}>
                {locked ? "Re-open the board" : "Lock this read"}
                <ArrowRight size={16} />
              </Button>
            </div>
          </aside>
        </section>

        <section className="mt-4 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-(--line) bg-(--deep-soft) px-5 py-4 text-[0.66rem] text-(--ink-muted)">
          <span className="inline-flex items-center gap-2">
            <Target className="text-(--lime)" size={15} /> Every move leaves a trace on the board.
          </span>
          <span className="inline-flex items-center gap-2">
            <RotateCw size={14} /> Last intelligence refresh: 18 seconds ago
          </span>
        </section>
      </div>

      <PrototypeFooter nextHref="/concepts/scouting" nextLabel="Futuristic scouting studio" />
    </main>
  );
}
