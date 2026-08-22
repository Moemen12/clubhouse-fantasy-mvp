"use client";

import { useState } from "react";
import {
  ArrowRight,
  BarChart3,
  Eye,
  Flame,
  ScanLine,
  Search,
  SlidersHorizontal,
  Star,
} from "lucide-react";

import { Button } from "@/shared/frontend/ui";

import { fantasyPlayers } from "../demo-data";
import {
  ConceptHeader,
  HelpButton,
  PlayerAvatar,
  PlayerPill,
  PrototypeFooter,
  StatChip,
} from "./concept-primitives";

const scoutingPlayers = fantasyPlayers.filter((player) =>
  ["p-005", "p-006", "p-008", "p-009", "p-010"].includes(player.id),
);
const signalFilters = ["All signals", "In form", "Differentials", "Value picks"];

export function FuturisticScoutingStudio() {
  const [selectedId, setSelectedId] = useState("p-008");
  const [activeFilter, setActiveFilter] = useState("All signals");
  const [watchlist, setWatchlist] = useState(["p-008", "p-005"]);

  const selectedPlayer =
    fantasyPlayers.find((player) => player.id === selectedId) ?? fantasyPlayers[0];

  function toggleWatchlist(playerId: string) {
    setWatchlist((current) =>
      current.includes(playerId) ? current.filter((id) => id !== playerId) : [...current, playerId],
    );
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_73%_13%,rgba(145,184,255,0.14),transparent_25rem),radial-gradient(circle_at_12%_80%,rgba(215,255,79,0.08),transparent_23rem),var(--deep)] text-(--ink)">
      <ConceptHeader
        active="scouting"
        detail="Scout layer calibrated"
        eyebrow="Clubhouse / concept 02"
        title="Futuristic scouting studio"
      >
        <HelpButton />
      </ConceptHeader>

      <div className="mx-auto max-w-[1500px] px-6 pb-4 pt-10 md:px-10 md:pt-16">
        <section className="mb-10 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="flex items-center gap-2 text-[0.62rem] font-extrabold uppercase tracking-[0.18em] text-(--blue)">
              <span className="h-px w-8 bg-(--blue)" /> Scouting layer / live index
            </p>
            <h1 className="mt-5 max-w-[12ch] text-[clamp(3.5rem,8vw,8.4rem)] font-bold leading-[0.82] tracking-[-0.1em]">
              Find the edge.
            </h1>
            <p className="mt-6 max-w-xl text-[0.95rem] leading-[1.7] text-(--ink-muted)">
              The best pick is not hiding in a table. Follow the signal, study the player, and build
              a point of view.
            </p>
          </div>
          <div className="flex max-w-full items-center gap-3 overflow-x-auto rounded-2xl border border-(--line) bg-(--deep-soft) p-2 [scrollbar-width:none]">
            {signalFilters.map((filter) => (
              <button
                className={`shrink-0 rounded-xl px-3 py-2 text-[0.62rem] font-bold transition-colors ${activeFilter === filter ? "bg-(--blue) text-(--deep)" : "text-(--ink-faint) hover:text-(--ink)"}`}
                key={filter}
                onClick={() => setActiveFilter(filter)}
                type="button"
              >
                {filter}
              </button>
            ))}
          </div>
        </section>

        <section className="grid gap-4 xl:grid-cols-[74px_minmax(0,1fr)_320px]">
          <aside className="flex flex-row gap-2 xl:flex-col">
            {[ScanLine, SlidersHorizontal, BarChart3, Eye].map((Icon, index) => (
              <button
                aria-label={["Scan players", "Tune filters", "View data", "View watchlist"][index]}
                className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl border transition-colors ${index === 0 ? "border-(--blue-border) bg-(--blue-border) text-(--blue)" : "border-(--line) bg-(--deep-soft) text-(--ink-faint) hover:text-(--ink)"}`}
                key={index}
                type="button"
              >
                <Icon size={18} />
              </button>
            ))}
            <span className="hidden h-px w-8 self-center bg-(--line) xl:my-2 xl:block" />
            <div className="hidden flex-1 items-end justify-center xl:flex">
              <span className="text-[0.52rem] font-extrabold uppercase tracking-[0.18em] text-(--ink-faint) [writing-mode:vertical-rl]">
                Spatial index / 04
              </span>
            </div>
          </aside>

          <div className="relative overflow-hidden rounded-[30px] border border-(--line) bg-(--deep-soft) shadow-[var(--card-shadow)]">
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,rgba(145,184,255,0.08),transparent_30%,rgba(215,255,79,0.04))]" />
            <div className="relative flex items-center justify-between border-b border-(--line) px-5 py-4 md:px-7">
              <div>
                <span className="block text-[0.57rem] font-extrabold uppercase tracking-[0.17em] text-(--ink-faint)">
                  Featured signal
                </span>
                <strong className="mt-1 block text-[0.82rem]">
                  {activeFilter} / {scoutingPlayers.length} profiles
                </strong>
              </div>
              <span className="inline-flex items-center gap-2 text-[0.6rem] font-bold text-(--blue)">
                <span className="h-1.5 w-1.5 rounded-full bg-(--blue)" /> Analysis ready
              </span>
            </div>

            <div className="relative grid min-h-[540px] gap-8 p-5 md:p-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(280px,1.1fr)] lg:items-center lg:p-12">
              <div className="relative flex min-h-[340px] items-center justify-center overflow-hidden rounded-[26px] border border-(--blue-border) bg-[radial-gradient(circle_at_50%_42%,rgba(145,184,255,0.36),transparent_10rem),linear-gradient(135deg,rgba(37,42,70,0.9),rgba(21,23,34,0.98))]">
                <div className="pointer-events-none absolute inset-0 opacity-70 [background-image:linear-gradient(rgba(145,184,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(145,184,255,0.08)_1px,transparent_1px)] [background-size:36px_36px]" />
                <div className="absolute left-5 top-5 rounded-full border border-(--blue-border) px-3 py-1.5 text-[0.53rem] font-extrabold uppercase tracking-[0.16em] text-(--blue)">
                  Player scan / 01
                </div>
                <div className="absolute right-5 top-5 flex items-center gap-1.5 text-[0.55rem] font-mono text-(--ink-faint)">
                  <span className="text-(--lime)">●</span> TRACKING
                </div>
                <div className="relative flex flex-col items-center">
                  <div className="relative">
                    <span className="absolute -inset-7 rounded-full border border-(--blue-border) opacity-70" />
                    <span className="absolute -inset-14 rounded-full border border-dashed border-(--blue-border) opacity-35" />
                    <PlayerAvatar player={selectedPlayer} size="lg" />
                  </div>
                  <span className="mt-8 text-[0.62rem] font-extrabold uppercase tracking-[0.2em] text-(--blue)">
                    {selectedPlayer.position} / {selectedPlayer.club}
                  </span>
                  <strong className="mt-2 text-center text-[1.8rem] font-semibold tracking-[-0.07em]">
                    {selectedPlayer.name}
                  </strong>
                  <span className="mt-2 text-[0.62rem] text-(--ink-faint)">
                    profile confidence / {Math.round(selectedPlayer.form * 10)}%
                  </span>
                </div>
                <span className="absolute bottom-5 left-5 text-[0.55rem] font-mono text-(--ink-faint)">
                  X 08.21 / Y 44.02
                </span>
                <span className="absolute bottom-5 right-5 text-[0.55rem] font-mono text-(--ink-faint)">
                  FORM // {selectedPlayer.form.toFixed(1)}
                </span>
              </div>

              <div>
                <div className="flex items-center justify-between gap-3">
                  <span className="inline-flex items-center gap-2 rounded-full border border-(--accent-border) bg-(--accent-soft) px-3 py-1.5 text-[0.58rem] font-bold text-(--lime)">
                    <Flame size={13} /> Rising signal
                  </span>
                  <button
                    aria-label="Add selected player to watchlist"
                    className="grid h-10 w-10 place-items-center rounded-full border border-(--line) bg-transparent text-(--ink-faint) transition-colors hover:border-(--lime) hover:text-(--lime)"
                    onClick={() => toggleWatchlist(selectedPlayer.id)}
                    type="button"
                  >
                    <Star
                      fill={watchlist.includes(selectedPlayer.id) ? "currentColor" : "none"}
                      size={17}
                    />
                  </button>
                </div>
                <h2 className="mt-6 max-w-[10ch] text-[clamp(2.4rem,5vw,5rem)] font-semibold leading-[0.88] tracking-[-0.09em]">
                  The numbers have a pulse.
                </h2>
                <p className="mt-5 max-w-md text-[0.75rem] leading-[1.65] text-(--ink-muted)">
                  {selectedPlayer.name} is carrying the strongest current form in the index. The
                  profile combines availability, attacking output, and a repeatable bonus signal.
                </p>
                <div className="mt-7 grid grid-cols-2 gap-2 sm:grid-cols-3">
                  <StatChip label="Form" tone="blue" value={selectedPlayer.form.toFixed(1)} />
                  <StatChip label="Price" tone="lime" value={`${selectedPlayer.price} cr`} />
                  <StatChip
                    label="Minutes"
                    tone="orange"
                    value={`${selectedPlayer.performance.minutes}`}
                  />
                </div>
                <Button
                  className="mt-7 w-full sm:w-auto"
                  onClick={() => toggleWatchlist(selectedPlayer.id)}
                >
                  {watchlist.includes(selectedPlayer.id) ? "In your watchlist" : "Add to watchlist"}
                  <ArrowRight size={16} />
                </Button>
              </div>
            </div>
          </div>

          <aside className="rounded-[30px] border border-(--line) bg-(--deep-soft) p-5 shadow-[var(--card-shadow)] md:p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[0.57rem] font-extrabold uppercase tracking-[0.17em] text-(--ink-faint)">
                  Signal queue
                </p>
                <h2 className="mt-3 text-[1.45rem] font-semibold tracking-[-0.06em]">
                  Worth a closer look.
                </h2>
              </div>
              <Search className="text-(--ink-faint)" size={18} />
            </div>
            <div className="mt-7 flex flex-col gap-2">
              {scoutingPlayers.map((player) => (
                <div className="flex items-center gap-2" key={player.id}>
                  <div className="min-w-0 flex-1">
                    <PlayerPill
                      active={player.id === selectedId}
                      onClick={() => setSelectedId(player.id)}
                      player={player}
                    />
                  </div>
                  <button
                    aria-label={`Watch ${player.name}`}
                    className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl border transition-colors ${watchlist.includes(player.id) ? "border-(--accent-border) text-(--lime)" : "border-(--line) text-(--ink-faint) hover:text-(--ink)"}`}
                    onClick={() => toggleWatchlist(player.id)}
                    type="button"
                  >
                    <Star
                      fill={watchlist.includes(player.id) ? "currentColor" : "none"}
                      size={14}
                    />
                  </button>
                </div>
              ))}
            </div>
            <div className="mt-8 border-t border-(--line) pt-5">
              <div className="flex items-center justify-between text-[0.59rem] font-extrabold uppercase tracking-[0.14em] text-(--ink-faint)">
                <span>Watchlist</span>
                <span className="text-(--blue)">{watchlist.length} profiles</span>
              </div>
              <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-(--deep-raised)">
                <span className="block h-full w-[68%] rounded-full bg-(--blue)" />
              </div>
              <p className="mt-3 text-[0.64rem] leading-[1.55] text-(--ink-faint)">
                Your shortlist is getting sharper. One more high-signal pick completes the squad
                read.
              </p>
            </div>
          </aside>
        </section>
      </div>

      <PrototypeFooter nextHref="/concepts/broadcast" nextLabel="Football broadcast control room" />
    </main>
  );
}
