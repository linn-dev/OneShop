import Link from "next/link";

export type ListingCardItem = {
  id: string;
  title: string;
  price: number;
  imageUrl: string;
  category: string;
  user: {
    name: string | null;
    email: string;
    rating: number;
  };
};

export function ItemCard({ item }: { item: ListingCardItem }) {
  return (
    <Link
      href={`/item/${item.id}`}
      className="block overflow-hidden rounded-2xl border border-zinc-200 bg-white hover:border-zinc-400"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={item.imageUrl} alt="" className="h-40 w-full object-cover" />
      <div className="p-3">
        <p className="font-medium">{item.title}</p>
        <p className="text-sm text-zinc-500">${item.price.toFixed(2)}</p>
        <p className="mt-1 truncate text-xs text-zinc-400">
          ★ {item.user.rating.toFixed(1)} · {item.user.name || item.user.email}
        </p>
      </div>
    </Link>
  );
}
