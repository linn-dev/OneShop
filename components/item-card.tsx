import Link from "next/link";
import { ListingImage } from "@/components/listing-image";

export type ListingCardItem = {
  id: string;
  title: string;
  price: number;
  imageUrl: string;
  category: string;
  description?: string;
  user: {
    name: string | null;
    email: string;
    rating: number;
  };
};

function sellerInitials(user: ListingCardItem["user"]): string {
  const source = (user.name || user.email).trim();
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
  }
  const local = source.includes("@") ? source.slice(0, source.indexOf("@")) : source;
  return local.slice(0, 2).toUpperCase();
}

export function ItemCard({ item }: { item: ListingCardItem }) {
  const sellerLabel = item.user.name || item.user.email;

  return (
    <Link
      href={`/item/${item.id}`}
      className="group block overflow-hidden rounded-3xl border border-emerald-100 bg-card transition hover:-translate-y-0.5 hover:shadow-lg"
    >
      <div className="relative">
        <ListingImage
          src={item.imageUrl}
          alt={item.title}
          className="aspect-[4/3] w-full object-cover"
        />
        <span className="absolute left-3 top-3 z-10 rounded-full bg-background/90 px-2.5 py-1 text-xs font-medium text-foreground backdrop-blur">
          {item.category}
        </span>
        <span className="absolute bottom-3 left-3 z-10 rounded-full bg-primary px-2.5 py-1 text-xs font-semibold text-primary-foreground">
          ${item.price.toFixed(2)}
        </span>
      </div>
      <div className="p-3">
        <p className="truncate font-medium text-foreground">{item.title}</p>
        <div className="mt-2 flex min-w-0 items-center gap-2">
          <span
            aria-hidden
            className="flex size-7 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-[11px] font-semibold text-emerald-800"
          >
            {sellerInitials(item.user)}
          </span>
          <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
            ★ {item.user.rating.toFixed(1)}
          </span>
          <span className="truncate text-xs text-muted-foreground">{sellerLabel}</span>
        </div>
      </div>
    </Link>
  );
}
