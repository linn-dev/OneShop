import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  try {
    const userId = session.user.id;

    const conversations = await prisma.conversation.findMany({
      where: {
        OR: [{ buyerId: userId }, { sellerId: userId }],
      },
      include: {
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: { id: true, text: true, createdAt: true, senderId: true },
        },
        _count: { select: { messages: true } },
      },
    });

    const itemIds = Array.from(new Set(conversations.map((c) => c.itemId)));
    const otherIds = Array.from(
      new Set(
        conversations.map((c) => (c.buyerId === userId ? c.sellerId : c.buyerId)),
      ),
    );

    const [items, others] = await Promise.all([
      itemIds.length === 0
        ? Promise.resolve([])
        : prisma.item.findMany({
            where: { id: { in: itemIds } },
            select: {
              id: true,
              title: true,
              imageUrl: true,
              price: true,
              status: true,
            },
          }),
      otherIds.length === 0
        ? Promise.resolve([])
        : prisma.user.findMany({
            where: { id: { in: otherIds } },
            select: { id: true, name: true, email: true },
          }),
    ]);

    const itemById = new Map(items.map((item) => [item.id, item]));
    const otherById = new Map(others.map((u) => [u.id, u]));

    const payload = conversations
      .map((c) => {
        const otherId = c.buyerId === userId ? c.sellerId : c.buyerId;
        const item = itemById.get(c.itemId);
        if (!item) return null;
        return {
          id: c.id,
          buyerId: c.buyerId,
          sellerId: c.sellerId,
          itemId: c.itemId,
          role: c.sellerId === userId ? ("seller" as const) : ("buyer" as const),
          item,
          otherParty: otherById.get(otherId) ?? {
            id: otherId,
            name: null,
            email: "Unknown",
          },
          lastMessage: c.messages[0] ?? null,
          messageCount: c._count.messages,
        };
      })
      .filter((c): c is NonNullable<typeof c> => c !== null)
      .sort((a, b) => {
        const at = a.lastMessage ? new Date(a.lastMessage.createdAt).getTime() : 0;
        const bt = b.lastMessage ? new Date(b.lastMessage.createdAt).getTime() : 0;
        return bt - at;
      });

    return NextResponse.json({ conversations: payload });
  } catch (err) {
    console.error(err);
    const message = err instanceof Error ? err.message : "Could not load conversations.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
