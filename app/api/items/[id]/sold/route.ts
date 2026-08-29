import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { placeholderRating } from "@/lib/trust";

export async function POST(
  _request: Request,
  { params }: { params: { id: string } },
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  const item = await prisma.item.findUnique({
    where: { id: params.id },
    include: { user: { select: { id: true, dealsDone: true, rating: true } } },
  });

  if (!item) {
    return NextResponse.json({ error: "Item not found." }, { status: 404 });
  }
  if (item.userId !== session.user.id) {
    return NextResponse.json({ error: "Only the seller can mark this sold." }, { status: 403 });
  }
  if (item.status === "sold") {
    return NextResponse.json({
      item,
      seller: { dealsDone: item.user.dealsDone, rating: item.user.rating },
    });
  }

  const dealsDone = item.user.dealsDone + 1;
  const rating = placeholderRating(dealsDone);

  const [updatedItem, seller] = await prisma.$transaction([
    prisma.item.update({
      where: { id: item.id },
      data: { status: "sold" },
    }),
    prisma.user.update({
      where: { id: item.userId },
      data: { dealsDone, rating },
      select: { id: true, dealsDone: true, rating: true },
    }),
  ]);

  return NextResponse.json({ item: updatedItem, seller });
}