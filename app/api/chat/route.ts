import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  const itemId = new URL(request.url).searchParams.get("itemId");
  if (!itemId) {
    return NextResponse.json({ error: "itemId is required." }, { status: 400 });
  }

  const conversation = await prisma.conversation.findFirst({
    where: {
      itemId,
      OR: [{ buyerId: session.user.id }, { sellerId: session.user.id }],
    },
    include: {
      messages: {
        orderBy: { createdAt: "asc" },
        include: {
          sender: { select: { id: true, name: true, email: true } },
        },
      },
    },
  });

  const item = await prisma.item.findUnique({
    where: { id: itemId },
    select: { id: true, status: true, userId: true },
  });

  return NextResponse.json({
    conversation: conversation ?? null,
    messages: conversation?.messages ?? [],
    item: item ?? null,
  });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => null);
    const itemId = String(body?.itemId ?? "");
    const text = String(body?.text ?? "").trim();

    if (!itemId) {
      return NextResponse.json({ error: "itemId is required." }, { status: 400 });
    }

    const item = await prisma.item.findUnique({ where: { id: itemId } });
    if (!item) {
      return NextResponse.json({ error: "Item not found." }, { status: 404 });
    }

    const userId = session.user.id;
    const isSeller = item.userId === userId;
    let conversation;

    if (isSeller) {
      conversation = await prisma.conversation.findFirst({
        where: { itemId, sellerId: userId },
      });
      if (!conversation) {
        return NextResponse.json(
          { error: "No buyer has messaged this listing yet." },
          { status: 400 },
        );
      }
    } else {
      conversation = await prisma.conversation.findFirst({
        where: { buyerId: userId, itemId },
      });
      if (!conversation) {
        conversation = await prisma.conversation.create({
          data: {
            buyerId: userId,
            sellerId: item.userId,
            itemId,
          },
        });
      }
    }

    if (!text) {
      return NextResponse.json({ conversation, message: null }, { status: 201 });
    }

    const receiverId =
      userId === conversation.sellerId ? conversation.buyerId : conversation.sellerId;

    const message = await prisma.message.create({
      data: {
        convId: conversation.id,
        senderId: userId,
        receiverId,
        text,
      },
      include: {
        sender: { select: { id: true, name: true, email: true } },
      },
    });

    return NextResponse.json({ conversation, message }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Could not start a conversation." }, { status: 500 });
  }
}
