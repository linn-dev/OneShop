import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const messageInclude = {
  messages: {
    orderBy: { createdAt: "asc" as const },
    include: {
      sender: { select: { id: true, name: true, email: true } },
    },
  },
};

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  const params = new URL(request.url).searchParams;
  const itemId = params.get("itemId");
  const conversationId = params.get("conversationId");

  if (!itemId && !conversationId) {
    return NextResponse.json(
      { error: "itemId or conversationId is required." },
      { status: 400 },
    );
  }

  const conversation = conversationId
    ? await prisma.conversation.findFirst({
        where: {
          id: conversationId,
          OR: [{ buyerId: session.user.id }, { sellerId: session.user.id }],
        },
        include: messageInclude,
      })
    : await prisma.conversation.findFirst({
        where: {
          itemId: itemId!,
          OR: [{ buyerId: session.user.id }, { sellerId: session.user.id }],
        },
        include: messageInclude,
      });

  const resolvedItemId = conversation?.itemId ?? itemId;
  const item = resolvedItemId
    ? await prisma.item.findUnique({
        where: { id: resolvedItemId },
        select: { id: true, status: true, userId: true },
      })
    : null;

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
    const conversationId = String(body?.conversationId ?? "").trim();
    const text = String(body?.text ?? "").trim();

    if (!itemId && !conversationId) {
      return NextResponse.json(
        { error: "itemId or conversationId is required." },
        { status: 400 },
      );
    }

    const userId = session.user.id;
    let conversation;

    if (conversationId) {
      conversation = await prisma.conversation.findFirst({
        where: {
          id: conversationId,
          OR: [{ buyerId: userId }, { sellerId: userId }],
        },
      });
      if (!conversation) {
        return NextResponse.json({ error: "Conversation not found." }, { status: 404 });
      }
    } else {
      const item = await prisma.item.findUnique({ where: { id: itemId } });
      if (!item) {
        return NextResponse.json({ error: "Item not found." }, { status: 404 });
      }

      const isSeller = item.userId === userId;

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
