import Link from "next/link";

export type TrustStats = {
  listings: number;
  verifiedSellers: number;
  dealsDone: number;
};

function formatCount(n: number): string {
  return n.toLocaleString();
}

export function LandingHero({ stats }: { stats: TrustStats }) {
  return (
    <section className="overflow-hidden rounded-3xl border border-emerald-100 bg-gradient-to-br from-background via-card to-emerald-50/50 px-5 py-10 sm:px-8 sm:py-14">
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl md:text-6xl">
          Snap. List. Swap.
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-pretty text-sm text-muted-foreground sm:text-base">
          AI writes your listing. Trade locally with verified, rated neighbors.
        </p>
        <div className="mt-6 flex flex-col items-stretch justify-center gap-2 sm:flex-row sm:items-center">
          <Link
            href="/sell"
            className="rounded-full bg-primary px-5 py-2.5 text-center text-sm font-medium text-primary-foreground hover:bg-emerald-700"
          >
            List an item
          </Link>
          <a
            href="#listings"
            className="rounded-full border border-emerald-100 bg-transparent px-5 py-2.5 text-center text-sm font-medium text-foreground hover:bg-muted"
          >
            Browse
          </a>
        </div>
      </div>

      <dl className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Stat label="Items listed" value={formatCount(stats.listings)} />
        <Stat label="Deals completed" value={formatCount(stats.dealsDone)} />
        <Stat label="Verified sellers" value={formatCount(stats.verifiedSellers)} />
      </dl>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-emerald-100/80 bg-card/90 px-2 py-3 text-center shadow-sm sm:px-4">
      <dt className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground sm:text-xs">
        {label}
      </dt>
      <dd className="mt-1 text-lg font-semibold tabular-nums text-foreground sm:text-xl">
        {value}
      </dd>
    </div>
  );
}
