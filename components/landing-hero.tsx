import Link from "next/link";
import { Camera, ListChecks, Repeat } from "lucide-react";

export type TrustStats = {
  listings: number;
  verifiedSellers: number;
  dealsDone: number;
  avgRating: number;
};

const STEPS = [
  {
    title: "Snap",
    body: "Photograph what you’re done with. One clear shot is enough to start.",
    icon: Camera,
  },
  {
    title: "List",
    body: "AI drafts the title, price, and category so you can publish in seconds.",
    icon: ListChecks,
  },
  {
    title: "Swap",
    body: "Chat locally, meet nearby, and trade with phone-verified neighbors.",
    icon: Repeat,
  },
] as const;

function formatCount(n: number): string {
  return n.toLocaleString();
}

export function LandingHero({ stats }: { stats: TrustStats }) {
  return (
    <section className="overflow-hidden rounded-3xl border border-zinc-200 bg-gradient-to-br from-zinc-50 via-white to-emerald-50/60 px-5 py-8 sm:px-8 sm:py-12">
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-emerald-700 sm:text-sm">
          Local marketplace
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-zinc-900 sm:text-5xl md:text-6xl">
          Snap. List. Swap.
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-pretty text-sm text-zinc-600 sm:text-base">
          Photograph unused stuff, let AI write the listing, and trade nearby with
          people you can actually trust.
        </p>
        <div className="mt-6 flex flex-col items-stretch justify-center gap-2 sm:flex-row sm:items-center">
          <Link
            href="/sell"
            className="rounded-full bg-zinc-900 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-zinc-700"
          >
            List an item
          </Link>
          <a
            href="#listings"
            className="rounded-full border border-zinc-200 bg-white px-5 py-2.5 text-center text-sm font-medium text-zinc-700 hover:border-zinc-400"
          >
            Browse nearby
          </a>
        </div>
      </div>

      <ol className="mt-10 grid gap-3 sm:grid-cols-3">
        {STEPS.map((step, i) => (
          <li
            key={step.title}
            className="rounded-2xl border border-zinc-200/80 bg-white/80 p-4 text-left shadow-sm"
          >
            <div className="flex items-center gap-2">
              <span className="flex size-9 items-center justify-center rounded-full bg-zinc-900 text-white">
                <step.icon className="size-4" aria-hidden />
              </span>
              <p className="text-sm font-semibold text-zinc-900">
                <span className="mr-1.5 text-zinc-400">{i + 1}.</span>
                {step.title}
              </p>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-zinc-600">{step.body}</p>
          </li>
        ))}
      </ol>

      <dl className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Live listings" value={formatCount(stats.listings)} />
        <Stat label="Verified sellers" value={formatCount(stats.verifiedSellers)} />
        <Stat label="Deals completed" value={formatCount(stats.dealsDone)} />
        <Stat
          label="Avg. seller rating"
          value={stats.avgRating > 0 ? `${stats.avgRating.toFixed(1)}★` : "—"}
        />
      </dl>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-zinc-200/80 bg-white/90 px-3 py-3 text-center sm:px-4">
      <dt className="text-[11px] font-medium uppercase tracking-wide text-zinc-500 sm:text-xs">
        {label}
      </dt>
      <dd className="mt-1 text-lg font-semibold tabular-nums text-zinc-900 sm:text-xl">
        {value}
      </dd>
    </div>
  );
}
