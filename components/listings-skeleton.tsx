import { cn } from "@/lib/utils";

function Shimmer({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-shimmer bg-[length:200%_100%] bg-gradient-to-r from-zinc-200 via-zinc-100 to-zinc-200",
        className,
      )}
    />
  );
}

export function ListingsSkeleton({ cards = 6 }: { cards?: number }) {
  return (
    <div aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading listings</span>
      <div className="mt-6 flex flex-wrap gap-1.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Shimmer key={i} className="h-7 w-16 rounded-full" />
        ))}
      </div>
      <ul className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: cards }).map((_, i) => (
          <li
            key={i}
            className="overflow-hidden rounded-3xl border border-emerald-100 bg-card"
          >
            <Shimmer className="aspect-[4/3] w-full" />
            <div className="space-y-2 p-3">
              <Shimmer className="h-4 w-3/4 rounded" />
              <div className="flex items-center gap-2">
                <Shimmer className="size-7 shrink-0 rounded-full" />
                <Shimmer className="h-3 w-1/2 rounded" />
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function HeroSkeleton() {
  return (
    <div className="overflow-hidden rounded-3xl border border-emerald-100 bg-zinc-50 px-5 py-10 sm:px-8 sm:py-14">
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-3">
        <Shimmer className="h-10 w-64 max-w-full rounded-lg sm:h-12 sm:w-80" />
        <Shimmer className="h-4 w-full max-w-md rounded" />
        <div className="mt-2 flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
          <Shimmer className="h-10 w-full rounded-full sm:w-32" />
          <Shimmer className="h-10 w-full rounded-full sm:w-32" />
        </div>
      </div>
      <div className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Shimmer key={i} className="h-16 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}
