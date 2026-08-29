import { HeroSkeleton, ListingsSkeleton } from "@/components/listings-skeleton";

export default function HomeLoading() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:py-10">
      <HeroSkeleton />
      <div className="mt-10">
        <div className="h-7 w-40 animate-pulse rounded bg-zinc-200" />
        <div className="mt-2 h-4 w-64 max-w-full animate-pulse rounded bg-zinc-100" />
        <ListingsSkeleton />
      </div>
    </div>
  );
}
