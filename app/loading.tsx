import { HeroSkeleton, ListingsSkeleton } from "@/components/listings-skeleton";

export default function Loading() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:py-10">
      <HeroSkeleton />
      <div className="mt-10">
        <div className="h-7 w-40 animate-shimmer rounded bg-[length:200%_100%] bg-gradient-to-r from-zinc-200 via-zinc-100 to-zinc-200" />
        <div className="mt-2 h-4 w-64 max-w-full animate-shimmer rounded bg-[length:200%_100%] bg-gradient-to-r from-zinc-200 via-zinc-100 to-zinc-200" />
        <ListingsSkeleton />
      </div>
    </div>
  );
}
