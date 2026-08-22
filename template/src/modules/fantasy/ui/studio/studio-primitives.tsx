"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Crown,
  DoorOpen,
  LogOut,
  Volume2,
  VolumeX,
} from "lucide-react";

import { cn, ThemeToggle } from "@/shared/frontend";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  Button,
} from "@/shared/frontend/ui";

import type { Player, PlayerPosition } from "../../domain";

export type StudioStage = "entry" | "scout" | "squad" | "captain" | "reveal";

export const positionLabels: Record<PlayerPosition, string> = {
  GK: "Keeper",
  DEF: "Defender",
  MID: "Midfield",
  FWD: "Forward",
};

export const stageSteps: Array<{ id: Exclude<StudioStage, "entry">; label: string }> = [
  { id: "scout", label: "Scout" },
  { id: "squad", label: "Build" },
  { id: "captain", label: "Captain" },
  { id: "reveal", label: "Reveal" },
];

export function StudioHeader({
  stage,
  onExit,
  soundEnabled,
  onToggleSound,
  logoutAction,
}: {
  stage: StudioStage;
  onExit: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  logoutAction: () => Promise<never>;
}) {
  const activeIndex = stage === "entry" ? -1 : stageSteps.findIndex((step) => step.id === stage);

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-(--line) px-5 md:h-[5.25rem] md:px-8">
      <Link className="group flex items-center gap-3" href="/dashboard">
        <span className="grid h-8 w-8 rotate-[-8deg] place-items-center rounded-[10px_10px_10px_2px] border border-(--lime) text-(--lime) transition-transform group-hover:rotate-0">
          <span className="h-1.5 w-1.5 rounded-full bg-(--lime)" />
        </span>
        <span className="hidden sm:block">
          <span className="block text-[0.74rem] font-extrabold uppercase tracking-[0.2em] text-(--ink-faint)">
            Clubhouse studio
          </span>
          <strong className="mt-1 block text-[0.92rem] tracking-[-0.03em]">Gameweek 04</strong>
        </span>
      </Link>

      <div className="hidden items-center gap-2 md:flex">
        {stageSteps.map((step, index) => (
          <div className="flex items-center gap-2" key={step.id}>
            <span
              className={cn(
                "grid h-7 w-7 place-items-center rounded-full border text-[0.74rem] font-bold transition-colors",
                index <= activeIndex
                  ? "border-(--lime) bg-(--lime) text-(--lime-ink)"
                  : "border-(--line-strong) text-(--ink-faint)",
              )}
            >
              {index < activeIndex ? "✓" : index + 1}
            </span>
            <span
              className={cn(
                "text-[0.76rem] font-bold",
                index === activeIndex ? "text-(--ink)" : "text-(--ink-faint)",
              )}
            >
              {step.label}
            </span>
            {index < stageSteps.length - 1 && <span className="mx-1 h-px w-5 bg-(--line)" />}
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <Button
          aria-label={soundEnabled ? "Mute Studio sounds" : "Enable Studio sounds"}
          className="h-10 w-10 rounded-full p-0"
          onClick={onToggleSound}
          size="icon"
          variant="ghost"
        >
          {soundEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
        </Button>
        <ThemeToggle className="h-10 w-10" />
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              aria-label="Log out of Clubhouse"
              className="gap-2 rounded-full px-3 text-[0.82rem] text-(--red) hover:bg-(--danger-bg) hover:text-(--red)"
              size="sm"
              type="button"
              variant="ghost"
            >
              <LogOut size={14} />
              <span className="hidden sm:inline">Log out</span>
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Log out of Clubhouse?</AlertDialogTitle>
              <AlertDialogDescription>
                Your current Studio read will close, and you will return to the sign-in screen.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Stay signed in</AlertDialogCancel>
              <form action={logoutAction}>
                <AlertDialogAction type="submit">
                  <LogOut size={15} />
                  Log out
                </AlertDialogAction>
              </form>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        {stage !== "entry" && (
          <Button
            className="gap-2 rounded-full px-3 text-[0.82rem]"
            onClick={onExit}
            size="sm"
            variant="ghost"
          >
            <DoorOpen size={14} />
            <span className="hidden sm:inline">Exit studio</span>
            <kbd className="hidden rounded border border-(--line-strong) px-1.5 py-0.5 text-[0.58rem] text-(--ink-faint) sm:inline">
              Esc
            </kbd>
          </Button>
        )}
      </div>
    </header>
  );
}

export function StageIntro({
  eyebrow,
  title,
  detail,
}: {
  eyebrow: string;
  title: string;
  detail: string;
}) {
  return (
    <div>
      <p className="flex items-center gap-2 text-[0.78rem] font-extrabold uppercase tracking-[0.18em] text-(--lime)">
        <span className="h-px w-6 bg-(--lime)" />
        {eyebrow}
      </p>
      <h1 className="mt-4 max-w-[11ch] text-[clamp(3.2rem,6.8vw,7rem)] font-bold leading-[0.9] tracking-[-0.045em]">
        {title}
      </h1>
      <p className="mt-4 max-w-md text-[0.95rem] leading-[1.55] text-(--ink-muted)">{detail}</p>
    </div>
  );
}

export function StudioAction({
  children,
  onClick,
  disabled = false,
  variant = "default",
}: Readonly<{
  children: ReactNode;
  onClick: () => void;
  disabled?: boolean;
  variant?: "default" | "outline";
}>) {
  return (
    <Button
      className="h-12 min-w-52 rounded-full px-6 text-[1rem]"
      disabled={disabled}
      onClick={onClick}
      variant={variant}
    >
      {children}
      <ArrowRight size={16} />
    </Button>
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
    sm: "h-8 w-8 text-[0.5rem]",
    md: "h-16 w-16 text-[0.8rem]",
    lg: "h-24 w-24 text-[1rem]",
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

export function PlayerCard({
  player,
  selected,
  onSelect,
}: {
  player: Player;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      className={cn(
        "group relative flex min-h-24 min-w-52 items-center gap-3 rounded-3xl border border-(--line) bg-(--deep-soft) p-4 text-left transition-[transform,border-color,background-color,box-shadow] duration-200 hover:-translate-y-1 hover:border-(--accent-border) hover:bg-(--accent-soft) active:scale-[0.98]",
        selected && "border-(--accent-border) bg-(--accent-soft) shadow-[var(--button-shadow)]",
      )}
      aria-pressed={selected}
      onClick={onSelect}
      type="button"
    >
      <PlayerAvatar player={player} size="md" />
      <span className="min-w-0">
        <span className="block overflow-hidden text-ellipsis whitespace-nowrap text-[1rem] font-bold">
          {player.name}
        </span>
        <span className="mt-1 block text-[0.75rem] uppercase tracking-[0.12em] text-(--ink-faint)">
          {positionLabels[player.position]}
        </span>
        <span className="mt-2 flex items-center gap-2 text-[0.82rem] font-bold text-(--lime)">
          <span>{player.form.toFixed(1)} form</span>
          <span className="text-(--ink-faint)">·</span>
          <span>{player.price} cr</span>
        </span>
      </span>
      {selected && (
        <span className="absolute right-3 top-3 grid h-6 w-6 place-items-center rounded-full bg-(--lime) text-(--lime-ink) shadow-[0_3px_10px_rgba(0,0,0,0.18)]">
          <Check size={13} strokeWidth={3.5} />
        </span>
      )}
    </button>
  );
}

export function CaptainCard({
  player,
  active,
  onSelect,
}: {
  player: Player;
  active: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      className={cn(
        "relative z-0 flex min-w-0 flex-col items-center gap-2 overflow-visible rounded-3xl border border-(--line) bg-(--deep-soft) px-6 py-6 transition-[transform,border-color,background-color,box-shadow] duration-200 hover:-translate-y-1 hover:border-(--accent-border)",
        active &&
          "z-20 border-(--lime) bg-(--accent-soft) shadow-[0_0_0_4px_var(--accent-soft),var(--button-shadow)]",
      )}
      aria-pressed={active}
      onClick={onSelect}
      type="button"
    >
      {active && (
        <span className="absolute right-3 top-3 z-30 grid h-7 w-7 place-items-center rounded-full bg-(--lime) text-(--lime-ink) shadow-[var(--button-shadow)]">
          <Crown size={13} />
        </span>
      )}
      <PlayerAvatar player={player} size="lg" />
      <strong className="max-w-28 overflow-hidden text-ellipsis whitespace-nowrap text-[0.95rem]">
        {player.name}
      </strong>
      <span className="text-[0.7rem] font-extrabold uppercase tracking-[0.15em] text-(--ink-faint)">
        {player.position} · {player.form.toFixed(1)} form
      </span>
    </button>
  );
}

export function Metric({
  label,
  value,
  tone = "lime",
}: {
  label: string;
  value: string;
  tone?: "lime" | "blue" | "orange";
}) {
  const toneClass = { lime: "text-(--lime)", blue: "text-(--blue)", orange: "text-(--orange)" }[
    tone
  ];
  return (
    <div className="min-w-0 overflow-hidden rounded-2xl border border-(--line) bg-(--deep-soft) px-3 py-2.5 md:px-4 md:py-3">
      <span className="block text-[0.76rem] font-extrabold uppercase tracking-[0.14em] text-(--ink-muted)">
        {label}
      </span>
      <strong
        className={cn(
          "mt-2 block truncate text-[clamp(1.05rem,2.5vw,1.6rem)] font-black leading-none tracking-[-0.04em]",
          toneClass,
        )}
        title={value}
      >
        {value}
      </strong>
    </div>
  );
}

export function StudioHint({ children }: { children: ReactNode }) {
  return (
    <div className="inline-flex min-h-10 items-center gap-2 text-[0.82rem] text-(--ink-faint)">
      <span className="h-1.5 w-1.5 rounded-full bg-(--lime)" />
      {children}
    </div>
  );
}

export function BackAction({ onClick, label = "Back" }: { onClick: () => void; label?: string }) {
  return (
    <button
      className="inline-flex min-h-10 items-center gap-2 text-[0.82rem] font-bold text-(--ink-faint) transition-colors hover:text-(--ink)"
      onClick={onClick}
      type="button"
    >
      <ArrowLeft size={14} />
      {label}
    </button>
  );
}
