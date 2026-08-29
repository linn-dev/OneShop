import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { MessageSeller } from "@/components/message-seller";
import { SellerTrustBadge } from "@/components/seller-trust-badge";

export default async function ItemPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getServerSession(authOptions);
  const item = await prisma.item.findUnique({
    where: { id: params.id },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phoneVerified: true,
          rating: true,
          dealsDone: true,
        },
      },
    },
  });

  if (!item) notFound();

  const isOwner = session?.user?.id === item.userId;

  return (
    <div className="mx-auto grid max-w-5xl gap-8 px-4 py-10 md:grid-cols-2">
      <div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={item.imageUrl}
          alt={item.title}
          className="h-72 w-full rounded-2xl object-cover"
        />
        <p className="mt-4 text-xs font-medium uppercase tracking-wide text-zinc-400">
          {item.category}
          {item.status !== "available" ? ` · ${item.status}` : ""}
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">{item.title}</h1>
        <p className="mt-1 text-xl font-medium">${item.price.toFixed(2)}</p>
        <p className="mt-3 whitespace-pre-wrap text-sm text-zinc-600">
          {item.description}
        </p>
        <div className="mt-4">
          <SellerTrustBadge seller={item.user} />
        </div>
      </div>
      <MessageSeller itemId={item.id} isOwner={isOwner} itemStatus={item.status} />
    </div>
  );
}
