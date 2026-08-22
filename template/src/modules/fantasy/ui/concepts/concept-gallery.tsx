import Link from "next/link";
import { ArrowUpRight, Crosshair, Radio, ScanLine, Sparkles } from "lucide-react";

import { ThemeToggle } from "@/shared/frontend";
import { Button } from "@/shared/frontend/ui";

const concepts = [
  {
    href: "/concepts/tactical",
    number: "01",
    title: "Tactical command room",
    description:
      "A focused decision board where players move into a live tactical surface and every choice changes the read.",
    accent: "lime",
    Icon: Crosshair,
  },
  {
    href: "/concepts/scouting",
    number: "02",
    title: "Futuristic scouting studio",
    description:
      "A spatial player-discovery layer built around signals, form, watchlists, and one closer look at a time.",
    accent: "blue",
    Icon: ScanLine,
  },
  {
    href: "/concepts/broadcast",
    number: "03",
    title: "Football broadcast control room",
    description:
      "A live-production desk where your player pick becomes a call, a spotlight, and an on-air moment.",
    accent: "orange",
    Icon: Radio,
  },
] as const;

function ConceptPreview({ accent }: { accent: (typeof concepts)[number]["accent"] }) {
  const accentClass = {
    lime: "bg-(--lime) text-(--lime-ink)",
    blue: "bg-(--blue) text-(--deep)",
    orange: "bg-(--orange) text-(--deep)",
  }[accent];

  return (
    <div className="relative h-64 overflow-hidden rounded-[22px] border border-(--line) bg-(--deep-soft)">
      <div className="pointer-events-none absolute inset-0 opacity-60 [background-image:linear-gradient(var(--line-subtle)_1px,transparent_1px),linear-gradient(90deg,var(--line-subtle)_1px,transparent_1px)] [background-size:28px_28px]" />
      <div className="absolute left-5 right-5 top-5 flex items-center justify-between">
        <span className={`h-2 w-14 rounded-full ${accentClass}`} />
        <span className="h-2 w-8 rounded-full bg-(--line-strong)" />
      </div>
      <div className="absolute inset-x-[15%] top-[28%] h-[52%] rounded-[18%] border border-(--pitch-border) bg-[linear-gradient(105deg,rgba(61,91,54,0.68),rgba(34,58,49,0.88))]">
        <span className="absolute left-1/2 top-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full border border-(--pitch-line)" />
        <span
          className={`absolute left-[24%] top-[34%] h-3 w-3 rounded-full ${accentClass} shadow-[0_0_20px_currentColor]`}
        />
        <span className="absolute left-[57%] top-[54%] h-3 w-3 rounded-full bg-(--blue) shadow-[0_0_20px_currentColor]" />
        <span className="absolute left-[69%] top-[25%] h-3 w-3 rounded-full bg-(--orange) shadow-[0_0_20px_currentColor]" />
      </div>
      <div className="absolute bottom-5 left-5 right-5 flex gap-2">
        <span className="h-7 flex-1 rounded-lg bg-(--deep-raised)" />
        <span className="h-7 w-14 rounded-lg bg-(--deep-raised)" />
        <span className="h-7 w-10 rounded-lg bg-(--deep-raised)" />
      </div>
    </div>
  );
}

export function ConceptGallery() {
  return (
    <main className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_78%_10%,rgba(215,255,79,0.1),transparent_25rem),radial-gradient(circle_at_10%_80%,rgba(145,184,255,0.08),transparent_25rem),var(--deep)] text-(--ink)">
      <header className="mx-auto flex max-w-[1500px] items-center justify-between gap-4 px-6 py-5 md:px-10">
        <Link className="group flex items-center gap-3" href="/">
          <span className="grid h-10 w-10 rotate-[-8deg] place-items-center rounded-[13px_13px_13px_3px] border border-(--lime) text-(--lime) transition-transform group-hover:rotate-0">
            <Sparkles size={17} />
          </span>
          <span>
            <span className="block text-[0.58rem] font-extrabold uppercase tracking-[0.18em] text-(--ink-faint)">
              Clubhouse / visual lab
            </span>
            <strong className="mt-1 block text-[0.9rem] tracking-[-0.05em]">
              Three ways to make a move.
            </strong>
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <ThemeToggle className="h-9 w-9" />
          <Button asChild className="hidden sm:inline-flex" size="sm" variant="outline">
            <Link href="/">Back to sign in</Link>
          </Button>
        </div>
      </header>

      <div className="mx-auto max-w-[1500px] px-6 pb-10 pt-14 md:px-10 md:pb-20 md:pt-24">
        <section className="max-w-4xl">
          <p className="flex items-center gap-2 text-[0.62rem] font-extrabold uppercase tracking-[0.18em] text-(--lime)">
            <span className="h-px w-8 bg-(--lime)" /> Experience directions / choose a feeling
          </p>
          <h1 className="mt-5 max-w-[9ch] text-[clamp(4rem,10vw,10rem)] font-bold leading-[0.8] tracking-[-0.11em]">
            Not a dashboard.
          </h1>
          <p className="mt-7 max-w-2xl text-[1rem] leading-[1.7] text-(--ink-muted)">
            These are three possible ways to turn Clubhouse into an energetic football decision
            studio. Open each direction, touch the interactions, and tell me which one makes you
            want to keep playing.
          </p>
        </section>

        <section className="mt-16 grid gap-4 lg:grid-cols-3">
          {concepts.map(({ href, number, title, description, accent, Icon }) => (
            <article
              className="group rounded-[28px] border border-(--line) bg-(--deep-soft) p-4 shadow-[var(--card-shadow)] transition-transform duration-300 hover:-translate-y-1"
              key={href}
            >
              <Link href={href}>
                <ConceptPreview accent={accent} />
                <div className="px-2 pb-2 pt-6">
                  <div className="flex items-center justify-between">
                    <span className="text-[0.6rem] font-extrabold uppercase tracking-[0.17em] text-(--ink-faint)">
                      Concept {number}
                    </span>
                    <Icon className={`text-(--${accent})`} size={18} />
                  </div>
                  <h2 className="mt-4 text-[1.65rem] font-semibold leading-[0.95] tracking-[-0.07em]">
                    {title}
                  </h2>
                  <p className="mt-4 min-h-20 text-[0.72rem] leading-[1.6] text-(--ink-muted)">
                    {description}
                  </p>
                  <span className="mt-5 inline-flex items-center gap-2 text-[0.65rem] font-extrabold uppercase tracking-[0.13em] text-(--ink)">
                    Open concept{" "}
                    <ArrowUpRight
                      className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1"
                      size={15}
                    />
                  </span>
                </div>
              </Link>
            </article>
          ))}
        </section>

        <section className="mt-5 flex flex-col justify-between gap-5 rounded-[26px] border border-(--accent-border) bg-[radial-gradient(circle_at_80%_0%,var(--glow-lime),transparent_18rem),var(--deep-soft)] p-6 md:flex-row md:items-center md:p-8">
          <div>
            <p className="text-[0.59rem] font-extrabold uppercase tracking-[0.17em] text-(--lime)">
              The shared journey
            </p>
            <h2 className="mt-3 text-[1.65rem] font-semibold tracking-[-0.06em]">
              Scout → select → captain → reveal.
            </h2>
            <p className="mt-3 max-w-xl text-[0.72rem] leading-[1.6] text-(--ink-muted)">
              All three concepts explore the same MVP behavior. Only the emotional wrapper changes.
            </p>
          </div>
          <span className="flex items-center gap-2 text-[0.62rem] font-bold text-(--ink-faint)">
            <span className="h-2 w-2 rounded-full bg-(--lime)" /> Gameweek 04 is ready
          </span>
        </section>
      </div>
    </main>
  );
}
