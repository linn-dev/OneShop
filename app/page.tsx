import { prisma } from "@/lib/prisma";
import { HomeListings } from "@/components/home-listings";
import { LandingHero } from "@/components/landing-hero";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [items, listingCount, verifiedSellers, dealAgg] = await Promise.all([
    prisma.item.findMany({
      where: { status: "available" },
      include: {
        user: {
          select: { name: true, email: true, rating: true },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.item.count({ where: { status: "available" } }),
    prisma.user.count({ where: { phoneVerified: true } }),
    prisma.user.aggregate({
      _sum: { dealsDone: true },
      _avg: { rating: true },
    }),
  ]);

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
    <div className="mx-auto max-w-5xl px-4 py-8 sm:py-10">
      <LandingHero
        stats={{
          listings: listingCount,
          verifiedSellers,
          dealsDone: dealAgg._sum.dealsDone ?? 0,
          avgRating: dealAgg._avg.rating ?? 0,
        }}
      />

      <section id="listings" className="scroll-mt-20 pt-10">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Nearby listings</h2>
            <p className="mt-1 text-sm text-zinc-500">
              Browse locally. Sign in to sell or chat with a seller.
            </p>
          </div>
        </div>

        <HomeListings items={listings} />
      </section>
    </div>
  );
}
