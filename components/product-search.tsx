"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useEffect, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

type Suggestion = {
  id: string;
  title: string;
  price: number;
  imageUrl: string;
  category: string;
};

export function ProductSearch({ className }: { className?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlQuery = searchParams.get("q") ?? "";
  const [query, setQuery] = useState(urlQuery);
  const [open, setOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setQuery(urlQuery);
  }, [urlQuery]);

  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setSuggestions([]);
      return;
    }
    const handle = window.setTimeout(async () => {
      const res = await fetch(`/api/items?q=${encodeURIComponent(q)}`);
      if (!res.ok) return;
      const data = (await res.json()) as { items?: Suggestion[] };
      setSuggestions(data.items ?? []);
      setOpen(true);
    }, 200);
    return () => window.clearTimeout(handle);
  }, [query]);

  useEffect(() => {
    function onPointerDown(e: PointerEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, []);

  function submit(e: FormEvent) {
    e.preventDefault();
    const q = query.trim();
    setOpen(false);
    router.push(q ? `/?q=${encodeURIComponent(q)}#listings` : "/#listings");
  }

  return (
    <div ref={wrapRef} className={cn("relative w-full", className)}>
      <form onSubmit={submit} role="search">
        <label className="sr-only" htmlFor="product-search">
          Search products
        </label>
        <Search
          className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-zinc-400"
          aria-hidden
        />
        <input
          id="product-search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => {
            if (suggestions.length > 0) setOpen(true);
          }}
          placeholder="Search products"
          autoComplete="off"
          className="h-10 w-full rounded-full border border-emerald-100/80 bg-white/80 pl-10 pr-10 text-sm outline-none transition placeholder:text-zinc-400 focus:border-emerald-300 focus:bg-white focus:ring-4 focus:ring-emerald-100"
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setSuggestions([]);
              setOpen(false);
              if (urlQuery) router.push("/#listings");
            }}
            className="absolute right-2 top-1/2 flex size-7 -translate-y-1/2 items-center justify-center rounded-full text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700"
            aria-label="Clear search"
          >
            <X className="size-3.5" />
          </button>
        )}
      </form>

      {open && query.trim().length >= 2 && (
        <ul className="absolute z-50 mt-2 w-full overflow-hidden rounded-2xl border border-emerald-100 bg-white py-1 shadow-xl shadow-emerald-950/5">
          {suggestions.length === 0 ? (
            <li className="px-3 py-3 text-sm text-zinc-500">No matching products.</li>
          ) : (
            suggestions.map((item) => (
              <li key={item.id}>
                <Link
                  href={`/item/${item.id}`}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 hover:bg-emerald-50"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.imageUrl}
                    alt=""
                    className="size-10 rounded-lg object-cover"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-zinc-900">
                      {item.title}
                    </span>
                    <span className="text-xs text-zinc-500">{item.category}</span>
                  </span>
                  <span className="text-sm font-medium tabular-nums text-emerald-800">
                    ${item.price.toFixed(2)}
                  </span>
                </Link>
              </li>
            ))
          )}
          <li>
            <button
              type="button"
              onClick={() => {
                const q = query.trim();
                setOpen(false);
                router.push(q ? `/?q=${encodeURIComponent(q)}#listings` : "/#listings");
              }}
              className="w-full px-3 py-2 text-left text-xs font-medium text-emerald-800 hover:bg-emerald-50"
            >
              See all results for “{query.trim()}”
            </button>
          </li>
        </ul>
      )}
    </div>
  );
}
