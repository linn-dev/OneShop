import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { HomeListings } from "@/components/home-listings";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const items = await prisma.item.findMany({
    where: { status: "available" },
    include: {
      user: {
        select: { name: true, email: true, rating: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const listings = items.map((item) => ({
    id: item.id,
    title: item.title,
    price: item.price,
    imageUrl: item.imageUrl,
    category: item.category,
    lat: item.lat,
    lng: item.lng,
    user: item.user,
  }));

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Nearby listings</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Browse locally. Sign in to sell or chat with a seller.
          </p>
        </div>
        <Link
          href="/sell"
          className="hidden rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white sm:inline-block"
        >
          List an item
        </Link>
      </div>

      <HomeListings items={listings} />
    </div>
  );
}
