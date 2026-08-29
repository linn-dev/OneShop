"use client";

import { useMemo, useState } from "react";
import { ItemCard, type ListingCardItem } from "@/components/item-card";
import { ITEM_CATEGORIES } from "@/lib/categories";
import { nearbySort, type Coords } from "@/lib/geo";
import { cn } from "@/lib/utils";

type Item = ListingCardItem & {
  lat: number | null;
  lng: number | null;
};

export function HomeListings({ items }: { items: Item[] }) {
  const [category, setCategory] = useState<string>("all");
  const [sort, setSort] = useState<"newest" | "nearby">("newest");
  const [origin, setOrigin] = useState<Coords | null>(null);
  const [geoStatus, setGeoStatus] = useState<"idle" | "asking" | "ok" | "denied">("idle");

  function enableNearby() {
    if (!navigator.geolocation) {
      setGeoStatus("denied");
      return;
    }
    setGeoStatus("asking");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setOrigin({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setSort("nearby");
        setGeoStatus("ok");
      },
      () => {
        setGeoStatus("denied");
        setSort("newest");
      },
      { enableHighAccuracy: false, timeout: 8000 },
    );
  }

  const visible = useMemo(() => {
    const filtered =
      category === "all" ? items : items.filter((item) => item.category === category);
    if (sort === "nearby" && origin) {
      return nearbySort(filtered, origin);
    }
    return filtered;
  }, [items, category, sort, origin]);

  return (
    <div>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-1.5">
          <FilterChip active={category === "all"} onClick={() => setCategory("all")}>
            All
          </FilterChip>
          {ITEM_CATEGORIES.map((c) => (
            <FilterChip key={c} active={category === c} onClick={() => setCategory(c)}>
              {c}
            </FilterChip>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSort("newest")}
            className={cn(
              "rounded-full px-3 py-1.5 text-xs font-medium",
              sort === "newest" ? "bg-zinc-900 text-white" : "border border-zinc-200 text-zinc-600",
            )}
          >
            Newest
          </button>
          <button
            type="button"
            onClick={() => {
              if (origin) {
                setSort("nearby");
                return;
              }
              enableNearby();
            }}
            className={cn(
              "rounded-full px-3 py-1.5 text-xs font-medium",
              sort === "nearby" ? "bg-zinc-900 text-white" : "border border-zinc-200 text-zinc-600",
            )}
          >
            {geoStatus === "asking" ? "Locating…" : "Nearby"}
          </button>
        </div>
      </div>
      {geoStatus === "denied" && (
        <p className="mt-2 text-xs text-zinc-500">
          Location is blocked. Listings with coordinates stay unsorted; others still show.
        </p>
      )}
      {sort === "nearby" && origin && (
        <p className="mt-2 text-xs text-zinc-500">
          Sorted by distance when a listing has lat/lng. Items without a location appear last.
        </p>
      )}

      {visible.length === 0 ? (
        <p className="mt-12 text-center text-zinc-500">
          {items.length === 0
            ? "No listings yet. Sign in and publish the first one."
            : "No items in this category."}
        </p>
      ) : (
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((item) => (
            <li key={item.id}>
              <ItemCard item={item} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full px-3 py-1.5 text-xs font-medium",
        active ? "bg-zinc-900 text-white" : "border border-zinc-200 text-zinc-600 hover:border-zinc-400",
      )}
    >
      {children}
    </button>
  );
}
