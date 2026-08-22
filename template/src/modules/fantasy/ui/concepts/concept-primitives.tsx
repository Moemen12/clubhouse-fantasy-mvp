"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowLeft, ArrowRight, CircleHelp, Sparkles } from "lucide-react";

import { cn, ThemeToggle } from "@/shared/frontend";
import { Button } from "@/shared/frontend/ui";

import type { Player, PlayerPosition } from "../../domain";

export const positionNames: Record<PlayerPosition, string> = {
  GK: "Goalkeeper",
  DEF: "Defender",
  MID: "Midfielder",
  FWD: "Forward",
};

export type ConceptKey = "tactical" | "scouting" | "broadcast";

const conceptLinks: Array<{ href: string; label: string; key: ConceptKey }> = [
  { href: "/concepts/tactical", label: "Command room", key: "tactical" },
  { href: "/concepts/scouting", label: "Scouting studio", key: "scouting" },
  { href: "/concepts/broadcast", label: "Broadcast control", key: "broadcast" },
];

export function ConceptSwitcher({ active }: { active?: ConceptKey }) {
  return (
    <nav
      aria-label="Concept prototypes"
      className="flex max-w-full items-center gap-1 overflow-x-auto rounded-full border border-(--line) bg-(--deep-soft) p-1 [scrollbar-width:none]"
    >
      {conceptLinks.map((concept) => (
        <Link
          className={cn(
            "shrink-0 rounded-full px-3 py-2 text-[0.62rem] font-bold text-(--ink-faint) transition-colors hover:text-(--ink)",
            active === concept.key && "bg-(--ink) text-(--deep) hover:text-(--deep)",
          )}
          href={concept.href}
          key={concept.key}
        >
          {concept.label}
        </Link>
      ))}
    </nav>
  );
}

export function ConceptHeader({
  active,
  eyebrow,
  title,
  detail,
  children,
}: Readonly<{
  active: ConceptKey;
  eyebrow: string;
  title: string;
  detail: string;
  children?: ReactNode;
}>) {
  return (
    <header className="relative z-10 flex flex-wrap items-center justify-between gap-4 border-b border-(--line) px-6 py-4 md:px-10">
      <Link className="group flex items-center gap-3" href="/concepts">
        <span className="grid h-9 w-9 rotate-[-8deg] place-items-center rounded-[12px_12px_12px_3px] border border-(--lime) text-(--lime) transition-transform group-hover:rotate-0">
          <Sparkles size={16} />
        </span>
        <span className="hidden sm:block">
          <span className="block text-[0.58rem] font-extrabold uppercase tracking-[0.18em] text-(--ink-faint)">
            {eyebrow}
          </span>
          <strong className="mt-1 block text-[0.86rem] tracking-[-0.04em]">{title}</strong>
        </span>
      </Link>
      <div className="order-3 flex w-full items-center justify-center md:order-none md:w-auto">
        <ConceptSwitcher active={active} />
      </div>
      <div className="flex items-center gap-2">
        <span className="hidden text-right lg:block">
          <span className="block text-[0.58rem] font-extrabold uppercase tracking-[0.16em] text-(--ink-faint)">
            Studio status
          </span>
          <span className="mt-1 block text-[0.68rem] font-semibold text-(--lime)">{detail}</span>
        </span>
        <ThemeToggle className="h-9 w-9" />
        {children}
      </div>
    </header>
  );
}

export function PrototypeFooter({ nextHref, nextLabel }: { nextHref: string; nextLabel: string }) {
  return (
    <footer className="mx-auto flex w-full max-w-[1400px] items-center justify-between gap-4 px-6 py-8 text-[0.64rem] text-(--ink-faint) md:px-10">
      <Link
        className="inline-flex items-center gap-2 transition-colors hover:text-(--ink)"
        href="/concepts"
      >
        <ArrowLeft size={14} /> All concepts
      </Link>
      <Link
        className="group inline-flex items-center gap-2 text-(--ink-muted) transition-colors hover:text-(--lime)"
        href={nextHref}
      >
        Explore {nextLabel}
        <ArrowRight className="transition-transform group-hover:translate-x-1" size={14} />
      </Link>
    </footer>
  );
}

export function PlayerAvatar({
  player,
  size = "md",
}: {
  player: Player;
  size?: "sm" | "md" | "lg";
}) {
  const sizeClass = {
    sm: "h-9 w-9 text-[0.55rem]",
    md: "h-13 w-13 text-[0.7rem]",
    lg: "h-20 w-20 text-[0.95rem]",
  }[size];

  return (
    <span
      aria-hidden="true"
      className={cn(
        "grid shrink-0 place-items-center rounded-[28%] border border-(--avatar-border) font-black tracking-[-0.06em] text-(--avatar-ink) shadow-[var(--avatar-shadow)]",
        sizeClass,
      )}
      style={{ background: player.color }}
    >
      {player.initials}
    </span>
  );
}

export function PlayerPill({
  player,
  active = false,
  onClick,
}: {
  player: Player;
  active?: boolean;
  onClick?: () => void;
}) {
  const content = (
    <>
      <PlayerAvatar player={player} size="sm" />
      <span className="min-w-0 text-left">
        <strong className="block overflow-hidden text-ellipsis whitespace-nowrap text-[0.7rem]">
          {player.name}
        </strong>
        <span className="mt-1 block text-[0.56rem] uppercase tracking-[0.1em] text-(--ink-faint)">
          {player.position} · {player.form.toFixed(1)} form
        </span>
      </span>
      <span className="ml-auto text-[0.65rem] font-bold text-(--lime)">{player.price} cr</span>
    </>
  );

  if (!onClick) {
    return (
      <div
        className={cn(
          "flex items-center gap-2.5 rounded-2xl border border-(--line) bg-(--deep-soft) p-2",
          active && "border-(--accent-border) bg-(--accent-soft)",
        )}
      >
        {content}
      </div>
    );
  }

  return (
    <button
      className={cn(
        "flex w-full items-center gap-2.5 rounded-2xl border border-(--line) bg-(--deep-soft) p-2 text-left transition-[transform,border-color,background-color] duration-200 hover:-translate-y-0.5 hover:border-(--accent-border) hover:bg-(--accent-soft) active:scale-[0.98]",
        active && "border-(--accent-border) bg-(--accent-soft) shadow-[var(--button-shadow)]",
      )}
      onClick={onClick}
      type="button"
    >
      {content}
    </button>
  );
}

export function StatChip({
  label,
  value,
  tone = "lime",
}: {
  label: string;
  value: string;
  tone?: "lime" | "orange" | "blue";
}) {
  const toneClass = {
    lime: "text-(--lime)",
    orange: "text-(--orange)",
    blue: "text-(--blue)",
  }[tone];

  return (
    <div className="rounded-2xl border border-(--line) bg-(--deep-soft) px-4 py-3">
      <span className="block text-[0.55rem] font-extrabold uppercase tracking-[0.14em] text-(--ink-faint)">
        {label}
      </span>
      <strong className={cn("mt-2 block text-[1.1rem] tracking-[-0.05em]", toneClass)}>
        {value}
      </strong>
    </div>
  );
}

export function HelpButton() {
  return (
    <Button aria-label="Open help" className="h-9 w-9 rounded-full p-0" size="icon" variant="ghost">
      <CircleHelp size={16} />
    </Button>
  );
}

export function EmptyPitchSlot({ label }: { label: string }) {
  return (
    <div className="grid h-20 w-16 place-items-center rounded-[22%] border border-dashed border-(--pitch-border) bg-(--accent-soft) text-center text-[0.54rem] font-bold uppercase tracking-[0.1em] text-(--pitch-label)">
      <span className="text-lg font-light">+</span>
      <span>{label}</span>
    </div>
  );
}

export function PitchPlayer({
  player,
  captain = false,
  onClick,
}: {
  player: Player;
  captain?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      className={cn(
        "group relative flex flex-col items-center gap-1.5 text-(--ink) transition-transform duration-200 hover:-translate-y-1",
        captain && "z-2",
      )}
      onClick={onClick}
      type="button"
    >
      {captain && (
        <span className="absolute -right-2 -top-2 grid h-5 w-5 place-items-center rounded-full bg-(--lime) text-[0.55rem] font-black text-(--lime-ink)">
          C
        </span>
      )}
      <span
        className={cn(
          "rounded-[28%]",
          captain && "shadow-[0_0_0_4px_var(--accent-soft),var(--avatar-shadow)]",
        )}
      >
        <PlayerAvatar player={player} size="md" />
      </span>
      <span className="max-w-23 overflow-hidden text-ellipsis whitespace-nowrap text-[0.62rem] font-bold">
        {player.name}
      </span>
      <span className="text-[0.52rem] font-extrabold uppercase tracking-[0.12em] text-(--lime)">
        {player.position}
      </span>
    </button>
  );
}
