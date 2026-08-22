import { Sparkles } from "lucide-react";
import { Badge } from "@/shared/frontend/ui/badge";

const brandMark =
  "relative inline-flex h-6.5 w-6.5 shrink-0 rotate-[-8deg] items-center justify-center rounded-[8px_8px_8px_2px] border border-(--lime) before:absolute before:left-1.25 before:top-1.25 before:h-1.25 before:w-1.25 before:rounded-full before:bg-(--lime) before:content-[''] after:absolute after:bottom-1.25 after:right-1.25 after:h-1.25 after:w-1.25 after:rounded-full after:bg-(--lime) after:content-['']";

export function AuthStory() {
  return (
    <section
      className="relative flex min-h-screen flex-col justify-between overflow-hidden border-r border-(--line) p-[clamp(28px,5vw,72px)] max-225:hidden before:absolute before:bottom-[-19vw] before:right-[-16vw] before:h-[54vw] before:w-[54vw] before:rounded-full before:border before:border-[rgba(215,255,79,0.13)] before:shadow-[0_0_0_80px_rgba(215,255,79,0.025),0_0_0_160px_rgba(215,255,79,0.02)] before:content-[''] after:absolute after:bottom-[17%] after:right-[20%] after:h-30 after:w-0.5 after:rotate-[35deg] after:bg-gradient-to-b after:from-(--lime) after:to-transparent after:opacity-35 after:content-[''] max-225:min-h-0 max-225:border-b max-225:border-r-0 max-225:px-6 max-225:py-7.5 max-225:pb-11.5 max-130:px-4.5 max-130:pb-8.5"
      aria-labelledby="auth-story-title"
    >
      <div className="relative z-1 flex items-center gap-2.5">
        <span className={brandMark} aria-hidden="true">
          <span className="absolute left-2.5 top-2.5 h-1.25 w-1.25 rounded-full bg-(--lime)" />
        </span>
        <span>
          <span className="block text-[1.28rem] font-extrabold tracking-[-0.06em]">clubhouse</span>
          <span className="mt-1.5 block text-[0.7rem] text-(--ink-faint)">
            Fantasy football, reimagined.
          </span>
        </span>
      </div>

      <div className="relative z-1 max-w-155 py-[8vh] max-225:py-[70px_0_50px] max-130:py-[54px_0_40px]">
        <Badge variant="success" className="w-fit">
          <Sparkles className="mr-1.5 h-3 w-3" />
          Season 01 · First light
        </Badge>
        <p className="mt-8 flex items-center gap-2 text-[0.62rem] font-extrabold uppercase tracking-[0.14em] text-(--ink-faint)">
          <span className="inline-block h-px w-8 bg-(--lime) opacity-80" /> Your match-day workspace
        </p>
        <h1
          className="mt-4.5 max-w-[8ch] text-[clamp(4.3rem,8vw,8.8rem)] font-bold leading-[0.84] tracking-[-0.1em] max-225:text-[clamp(4rem,15vw,7rem)] max-130:text-[clamp(3.7rem,18vw,5.8rem)]"
          id="auth-story-title"
        >
          Make your move count.
        </h1>
        <p className="mt-7.5 max-w-115 text-base leading-[1.75] text-(--ink-muted)">
          Build a squad with a point of view, make one decision that matters, and see exactly why
          your instincts put you ahead.
        </p>
      </div>

      <div className="relative z-1 grid max-w-130 grid-cols-3 gap-5 max-130:gap-3">
        {[
          ["01", "focused gameweek"],
          ["2×", "captain's edge"],
          ["∞", "ways to play"],
        ].map(([value, label]) => (
          <div className="flex flex-col gap-1.5 border-t border-(--line-strong) pt-3" key={label}>
            <strong className="text-[1.25rem] font-medium tracking-[-0.05em] text-(--lime)">
              {value}
            </strong>
            <span className="text-[0.64rem] font-bold uppercase tracking-[0.1em] text-(--ink-faint) max-130:text-[0.55rem] max-130:tracking-[0.06em]">
              {label}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
