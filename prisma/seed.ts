import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await hash("password123", 10);

  const seller = await prisma.user.upsert({
    where: { email: "seller@swappr.local" },
    update: { phoneVerified: true, dealsDone: 4, rating: 4.8 },
    create: {
      email: "seller@swappr.local",
      name: "Local Seller",
      passwordHash,
      phoneVerified: true,
      dealsDone: 4,
      rating: 4.8,
    },
  });

  const listings = [
    {
      title: "Vintage desk lamp",
      description: "Solid brass desk lamp, works great. Pickup near downtown library.",
      price: 25000,
      category: "Home",
      imageUrl: "https://picsum.photos/seed/desk-lamp/800/600",
      lat: 16.8409,
      lng: 96.1735,
    },
    {
      title: "Mountain bike",
      description: "Used but well maintained. 21-speed, new tires last year.",
      price: 140000,
      category: "Sports",
      imageUrl: "https://picsum.photos/seed/mtb/800/600",
      lat: 16.8512,
      lng: 96.155,
    },
    {
      title: "Paperback stack",
      description: "Ten mixed novels in good condition. Meet at the cafe.",
      price: 12000,
      category: "Books",
      imageUrl: "https://picsum.photos/seed/books/800/600",
      lat: 16.7794,
      lng: 96.149,
    },
    {
      title: "Bluetooth speaker",
      description: "Portable speaker, slight scuff on the corner. Charges fine.",
      price: 35000,
      category: "Electronics",
      imageUrl: "https://picsum.photos/seed/speaker/800/600",
      lat: null as number | null,
      lng: null as number | null,
    },
    {
      title: "Oak dining chair",
      description: "Solid oak side chair, minor wear on the seat. Pickup in Bahan.",
      price: 45000,
      category: "Furniture",
      imageUrl: "https://picsum.photos/seed/oak-chair/800/600",
      lat: 16.812,
      lng: 96.158,
    },
  ];

  let created = 0;
  for (const listing of listings) {
    const existing = await prisma.item.findFirst({
      where: { userId: seller.id, title: listing.title },
    });
    if (!existing) {
      await prisma.item.create({
        data: {
          ...listing,
          userId: seller.id,
        },
      });
      created += 1;
    } else if (existing.price !== listing.price) {
      await prisma.item.update({
        where: { id: existing.id },
        data: { price: listing.price },
      });
    }
  }

  console.log(
    `Seeded ${listings.length} demo items for ${seller.email} (${created} new, ${listings.length - created} already present).`,
  );
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
