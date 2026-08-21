import Link from "next/link";

export default function AuthCodeErrorPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-(--deep) px-6 py-12 text-(--ink)">
      <section className="w-full max-w-117.5 rounded-2xl border border-(--line) bg-(--panel) p-8 text-center shadow-[0_24px_80px_rgba(0,0,0,0.22)]">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-(--lime)">Clubhouse</p>
        <h1 className="mt-4 text-2xl font-semibold tracking-[-0.04em]">
          That confirmation link expired
        </h1>
        <p className="mt-3 text-sm leading-6 text-(--ink-muted)">
          Request a new confirmation email and use the newest link. Auth links can only be used
          once.
        </p>
        <Link
          className="mt-6 inline-flex items-center justify-center rounded-xl bg-(--lime) px-5 py-3 text-sm font-semibold text-(--deep) transition-opacity hover:opacity-90"
          href="/"
        >
          Return to sign in
        </Link>
      </section>
    </main>
  );
}
