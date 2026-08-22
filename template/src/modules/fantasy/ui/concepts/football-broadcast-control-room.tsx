"use client";

import { useState } from "react";
import {
  Activity,
  ArrowRight,
  Camera,
  ChevronRight,
  CirclePlay,
  Gauge,
  Headphones,
  Radio,
  Signal,
  Square,
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

const broadcastPlayers = fantasyPlayers.filter((player) =>
  ["p-001", "p-002", "p-005", "p-008", "p-009"].includes(player.id),
);
const feeds = [
  { id: "main", label: "Main feed", detail: "Northstar v Harbor" },
  { id: "tactics", label: "Tactical cam", detail: "Shape / 5—2—1—1" },
  { id: "player", label: "Player cam", detail: "Form signals" },
];

export function FootballBroadcastControlRoom() {
  const [activeFeed, setActiveFeed] = useState("main");
  const [selectedId, setSelectedId] = useState("p-008");
  const [onAir, setOnAir] = useState(false);

  const selectedPlayer =
    fantasyPlayers.find((player) => player.id === selectedId) ?? fantasyPlayers[0];

  return (
    <main className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_80%_0%,rgba(255,131,109,0.12),transparent_24rem),radial-gradient(circle_at_17%_42%,rgba(47,100,172,0.16),transparent_30rem),var(--deep)] text-(--ink)">
      <ConceptHeader
        active="broadcast"
        detail={onAir ? "Live on air" : "Control room ready"}
        eyebrow="Clubhouse / concept 03"
        title="Football broadcast control room"
      >
        <HelpButton />
      </ConceptHeader>

      <div className="mx-auto max-w-[1500px] px-6 pb-4 pt-10 md:px-10 md:pt-16">
        <section className="mb-10 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex items-center gap-2 text-[0.62rem] font-extrabold uppercase tracking-[0.18em] text-(--orange)">
              <span className="h-px w-8 bg-(--orange)" /> Matchday production / desk 04
            </div>
            <h1 className="mt-5 max-w-[11ch] text-[clamp(3.2rem,7vw,7.8rem)] font-bold leading-[0.82] tracking-[-0.1em]">
              Put it on air.
            </h1>
            <p className="mt-6 max-w-xl text-[0.95rem] leading-[1.7] text-(--ink-muted)">
              A football decision is a broadcast moment. Choose the angle, call the player, and send
              your read live.
            </p>
          </div>
          <div className="flex items-center gap-3 rounded-2xl border border-(--line) bg-(--deep-soft) px-4 py-3 text-[0.63rem]">
            <span
              className={`grid h-8 w-8 place-items-center rounded-xl ${onAir ? "bg-(--orange) text-(--deep)" : "bg-(--danger-bg) text-(--orange)"}`}
            >
              <Radio size={16} />
            </span>
            <span>
              <strong className="block text-(--ink)">{onAir ? "ON AIR" : "STANDBY"}</strong>
              <span className="mt-1 block text-(--ink-faint)">Gameweek 04 / 20:45 kick-off</span>
            </span>
          </div>
        </section>

        <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_330px]">
          <div className="rounded-[28px] border border-(--line) bg-(--deep-soft) p-4 shadow-[var(--card-shadow)] md:p-6">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-(--line) pb-4">
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-2 rounded-full bg-(--danger-bg) px-3 py-1.5 text-[0.58rem] font-extrabold uppercase tracking-[0.13em] text-(--orange)">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-(--orange) motion-reduce:animate-none" />{" "}
                  {onAir ? "Live" : "Preview"}
                </span>
                <span className="text-[0.62rem] font-semibold text-(--ink-faint)">
                  Production monitor / 16:9
                </span>
              </div>
              <div className="flex items-center gap-3 text-[0.58rem] font-mono text-(--ink-faint)">
                <span>CAM 01</span>
                <span>1080P</span>
                <span className="text-(--lime)">● 50 FPS</span>
              </div>
            </div>

            <div className="relative aspect-[16/8.8] overflow-hidden rounded-2xl border border-(--line-strong) bg-[linear-gradient(145deg,rgba(20,39,49,0.95),rgba(29,61,54,0.95))]">
              <div className="pointer-events-none absolute inset-0 opacity-60 [background-image:linear-gradient(rgba(145,184,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(145,184,255,0.08)_1px,transparent_1px)] [background-size:56px_56px]" />
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,transparent_10rem,rgba(0,0,0,0.42))]" />
              <div className="absolute left-5 top-5 flex items-center gap-2 text-[0.55rem] font-extrabold uppercase tracking-[0.16em] text-white/70">
                <Camera size={14} /> Live match texture
              </div>
              <div className="absolute right-5 top-5 rounded bg-black/35 px-2.5 py-1.5 text-[0.55rem] font-mono text-white/70">
                {activeFeed.toUpperCase()} / 00:18:42
              </div>
              <div className="absolute inset-x-[12%] top-[20%] bottom-[17%] rounded-[12%] border border-white/20 [background:linear-gradient(90deg,transparent_49.7%,rgba(255,255,255,0.13)_50%,transparent_50.3%),linear-gradient(0deg,transparent_49.7%,rgba(255,255,255,0.13)_50%,transparent_50.3%)]">
                <span className="absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/15" />
                <span className="absolute left-[12%] right-[12%] top-0 h-[22%] rounded-b-[50%] border border-b-0 border-white/15" />
                <span className="absolute bottom-0 left-[12%] right-[12%] h-[22%] rounded-t-[50%] border border-white/15" />
                <span className="absolute left-[28%] top-[30%] h-3 w-3 rounded-full bg-(--lime) shadow-[0_0_0_5px_rgba(215,255,79,0.18),0_0_24px_rgba(215,255,79,0.9)]" />
                <span className="absolute left-[43%] top-[56%] h-3 w-3 rounded-full bg-(--orange) shadow-[0_0_0_5px_rgba(255,131,109,0.18),0_0_24px_rgba(255,131,109,0.9)]" />
                <span className="absolute left-[68%] top-[41%] h-3 w-3 rounded-full bg-(--blue) shadow-[0_0_0_5px_rgba(145,184,255,0.18),0_0_24px_rgba(145,184,255,0.9)]" />
              </div>
              <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between gap-4">
                <div className="rounded-xl border border-white/15 bg-black/35 px-4 py-3 backdrop-blur-sm">
                  <span className="block text-[0.5rem] font-extrabold uppercase tracking-[0.16em] text-white/55">
                    Featured fixture
                  </span>
                  <strong className="mt-1 block text-[0.92rem] text-white">
                    Northstar FC <span className="mx-1 text-white/40">v</span> Harbor City
                  </strong>
                </div>
                <div className="hidden items-center gap-2 rounded-xl border border-white/15 bg-black/35 px-3 py-2.5 text-[0.58rem] text-white/70 backdrop-blur-sm sm:flex">
                  <Signal size={13} /> Signal clear
                </div>
              </div>
            </div>

            <div className="mt-4 grid gap-2 md:grid-cols-3">
              {feeds.map((feed) => (
                <button
                  className={`flex items-center gap-3 rounded-xl border p-3 text-left transition-colors ${activeFeed === feed.id ? "border-(--orange-border) bg-(--danger-bg)" : "border-(--line) bg-transparent hover:bg-(--accent-soft)"}`}
                  key={feed.id}
                  onClick={() => setActiveFeed(feed.id)}
                  type="button"
                >
                  <span className="grid h-9 w-9 place-items-center rounded-lg bg-(--deep-raised) text-(--ink-faint)">
                    <CirclePlay size={15} />
                  </span>
                  <span className="min-w-0">
                    <strong className="block text-[0.68rem]">{feed.label}</strong>
                    <span className="mt-1 block overflow-hidden text-ellipsis whitespace-nowrap text-[0.56rem] text-(--ink-faint)">
                      {feed.detail}
                    </span>
                  </span>
                  <ChevronRight className="ml-auto shrink-0 text-(--ink-faint)" size={15} />
                </button>
              ))}
            </div>

            <div className="mt-4 grid gap-2 sm:grid-cols-3">
              <StatChip label="Possession read" tone="blue" value="54% / 46%" />
              <StatChip label="Momentum" tone="orange" value="Northstar ↑" />
              <StatChip label="Decision timer" tone="lime" value="02:14:36" />
            </div>
          </div>

          <aside className="flex flex-col gap-4">
            <div className="rounded-[28px] border border-(--line) bg-(--deep-soft) p-5 shadow-[var(--card-shadow)] md:p-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[0.57rem] font-extrabold uppercase tracking-[0.17em] text-(--ink-faint)">
                    Talent desk
                  </p>
                  <h2 className="mt-3 text-[1.45rem] font-semibold tracking-[-0.06em]">
                    Call the moment.
                  </h2>
                </div>
                <Headphones className="text-(--orange)" size={18} />
              </div>
              <p className="mt-4 text-[0.68rem] leading-[1.55] text-(--ink-faint)">
                Select the player you want to put in the spotlight. Your call becomes the gameweek
                signal.
              </p>
              <div className="mt-6 flex flex-col gap-2">
                {broadcastPlayers.map((player) => (
                  <PlayerPill
                    active={player.id === selectedId}
                    key={player.id}
                    onClick={() => setSelectedId(player.id)}
                    player={player}
                  />
                ))}
              </div>
            </div>

            <div className="flex flex-1 flex-col justify-between rounded-[28px] border border-(--orange-border) bg-[radial-gradient(circle_at_100%_0%,rgba(255,131,109,0.13),transparent_13rem),var(--deep-soft)] p-5 md:p-6">
              <div>
                <div className="flex items-center gap-3">
                  <PlayerAvatar player={selectedPlayer} size="md" />
                  <div>
                    <span className="block text-[0.55rem] font-extrabold uppercase tracking-[0.14em] text-(--ink-faint)">
                      On the desk
                    </span>
                    <strong className="mt-1 block text-[1rem]">{selectedPlayer.name}</strong>
                    <span className="mt-1 block text-[0.57rem] text-(--orange)">
                      {selectedPlayer.club} / {selectedPlayer.position}
                    </span>
                  </div>
                </div>
                <div className="mt-7 flex items-end gap-3">
                  <span className="text-[4.4rem] font-semibold leading-[0.8] tracking-[-0.12em] text-(--orange)">
                    {selectedPlayer.form.toFixed(1)}
                  </span>
                  <span className="pb-1 text-[0.6rem] font-extrabold uppercase tracking-[0.15em] text-(--ink-faint)">
                    form index
                  </span>
                </div>
                <div className="mt-6 grid grid-cols-2 gap-2">
                  <div className="rounded-xl bg-(--deep-raised) p-3">
                    <span className="block text-[0.53rem] uppercase tracking-[0.12em] text-(--ink-faint)">
                      Goals
                    </span>
                    <strong className="mt-1 block text-[0.9rem]">
                      {selectedPlayer.performance.goals}
                    </strong>
                  </div>
                  <div className="rounded-xl bg-(--deep-raised) p-3">
                    <span className="block text-[0.53rem] uppercase tracking-[0.12em] text-(--ink-faint)">
                      Bonus
                    </span>
                    <strong className="mt-1 block text-[0.9rem]">
                      +{selectedPlayer.performance.bonus}
                    </strong>
                  </div>
                </div>
              </div>
              <Button className="mt-8 w-full" onClick={() => setOnAir((current) => !current)}>
                {onAir ? "Take off air" : "Put this call on air"}
                {onAir ? <Square size={15} /> : <ArrowRight size={16} />}
              </Button>
            </div>
          </aside>
        </section>

        <section className="mt-4 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-(--line) bg-(--deep-soft) px-5 py-4 text-[0.63rem] text-(--ink-muted)">
          <span className="inline-flex items-center gap-2">
            <Gauge className="text-(--orange)" size={15} /> Production telemetry nominal.
          </span>
          <span className="inline-flex items-center gap-2">
            <Activity size={14} />{" "}
            {onAir ? "Your decision is live with the desk." : "The desk is waiting for your call."}
          </span>
        </section>
      </div>

      <PrototypeFooter nextHref="/concepts/tactical" nextLabel="Tactical command room" />
    </main>
  );
}
