export function ListingsSkeleton({ cards = 6 }: { cards?: number }) {
  return (
    <div aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading listings</span>
      <div className="mt-6 flex flex-wrap gap-1.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-7 w-16 animate-pulse rounded-full bg-zinc-200" />
        ))}
      </div>
      <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: cards }).map((_, i) => (
          <li key={i} className="overflow-hidden rounded-2xl border border-zinc-200">
            <div className="h-40 w-full animate-pulse bg-zinc-200" />
            <div className="space-y-2 p-3">
              <div className="h-4 w-3/4 animate-pulse rounded bg-zinc-200" />
              <div className="h-3 w-1/3 animate-pulse rounded bg-zinc-200" />
              <div className="h-3 w-1/2 animate-pulse rounded bg-zinc-100" />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function HeroSkeleton() {
  return (
    <div className="overflow-hidden rounded-3xl border border-zinc-200 bg-zinc-50 px-5 py-8 sm:px-8 sm:py-12">
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-3">
        <div className="h-3 w-28 animate-pulse rounded bg-zinc-200" />
        <div className="h-10 w-64 max-w-full animate-pulse rounded-lg bg-zinc-200 sm:h-12 sm:w-80" />
        <div className="h-4 w-full max-w-md animate-pulse rounded bg-zinc-100" />
        <div className="mt-2 flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
          <div className="h-10 w-full animate-pulse rounded-full bg-zinc-200 sm:w-32" />
          <div className="h-10 w-full animate-pulse rounded-full bg-zinc-100 sm:w-32" />
        </div>
      </div>
      <div className="mt-10 grid gap-3 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-28 animate-pulse rounded-2xl bg-white" />
        ))}
      </div>
      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-16 animate-pulse rounded-2xl bg-white" />
        ))}
      </div>
    </div>
  );
}
